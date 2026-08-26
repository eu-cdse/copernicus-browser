import React from 'react';
import * as GeoJSON from 'geojson';
import L from 'leaflet';
import {
  canvasToBlob,
  WmsLayer,
  ApiType,
  BBox,
  CRS_EPSG3857,
  CRS_EPSG4326,
  MimeTypes,
} from '@sentinel-hub/sentinelhub-js';

import { getServiceEndpoint } from '../../ExternalLayers/externalLayers.utils';

// NOTE: the canvas compositing and AOI geometry-tracing helpers below overlap with
// `ImageDownload.utils.js` (they differ mainly in CRS handling). Additionally,
// `compositeWmtsImage`'s web-mercator tile-stitching overlaps with
// `src/junk/EOBCommon/utils/getMapOverlayXYZ.js` (same log2 zoom selection, antimeridian
// wrapping, and latitude-limit skip). Kept as a separate copy for now to avoid changing the
// stable SH image-download path. Follow-up: if a third download path needs the same
// compositing, extract shared helpers covering both sources instead.

// Compare-layer source predicates. A compared layer is "external" when it carries an
// `externalWms` payload; otherwise it is a Sentinel Hub layer. The index signature keeps the
// other (Sentinel Hub) layer fields off these helpers' radar.
type ComparedLayerLike = { externalWms?: unknown; [key: string]: unknown };
export const isAllExternalCompare = (comparedLayers?: ComparedLayerLike[]): boolean =>
  !!comparedLayers?.length && comparedLayers.every((l) => l.externalWms);
export const isMixedSourceCompare = (comparedLayers?: ComparedLayerLike[]): boolean =>
  !!comparedLayers?.some((l) => l.externalWms) && comparedLayers.some((l) => !l.externalWms);

// Build a WMS GetMap URL for an external server via sentinelhub-js (WMS 1.1.1 — sh-js is 1.1.1-only,
// which is what we support; SRS + lon/lat axis, no version branching). Used for the download fetch and
// for layer/pin thumbnails (getMapUrl is synchronous). `transparent: true` keeps nodata transparent so
// the image composites correctly over the OSM base and in compare mode.
// WMS natively supports PNG and JPEG. WebP (and anything else) is not a standard WMS output format,
// so we fall back to PNG and let the caller convert locally via canvas.

export function buildExternalWmsGetMapUrl(
  serverUrl: string,
  layerName: string,
  bounds: L.LatLngBounds,
  width: number,
  height: number,
  time?: string, // ISO8601 value for the WMS TIME dimension; omitted when the layer has no time
  style?: string, // named SLD style for the STYLES parameter; omitted to request the server default
  useWebMercator = false, // request EPSG:3857 so the image aligns with the OSM base + map overlays
  mimeType: string = MimeTypes.PNG, // requested output format; falls back to PNG if not WMS-native
): string {
  const layer = new WmsLayer({ baseUrl: getServiceEndpoint(serverUrl), layerId: layerName });
  let bbox: BBox;
  if (useWebMercator) {
    // EPSG:3857 uses easting/northing (x,y) order, bbox in projected metres — aligns with the
    // web-mercator OSM base and label overlays drawn over it.
    const sw = L.CRS.EPSG3857.project(bounds.getSouthWest());
    const ne = L.CRS.EPSG3857.project(bounds.getNorthEast());
    bbox = new BBox(CRS_EPSG3857, sw.x, sw.y, ne.x, ne.y);
  } else {
    bbox = new BBox(CRS_EPSG4326, bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
  }
  // fromTime:null + toTime:<date> makes sh-js emit a single TIME value (date-only) instead of a range.
  const url = layer.getMapUrl(
    {
      bbox,
      fromTime: null,
      toTime: time ? new Date(time) : null,
      format: mimeType === MimeTypes.JPEG ? MimeTypes.JPEG : MimeTypes.PNG,
      width,
      height,
      transparent: true,
      // `unknown` is sh-js's passthrough for GetMap query params it doesn't model itself; STYLES is
      // how a WMS layer's SLD style is requested.
      ...(style ? { unknown: { STYLES: style } } : {}),
    },
    ApiType.WMS,
  );
  // WMS GetMap requires the STYLES parameter (spec-mandated; may be empty to request default styles).
  // sentinelhub-js omits it, and strict servers (e.g. terrestris) reject the request with a
  // "missing parameters ['styles']" ServiceException. Append an empty STYLES if sh-js didn't add one.
  return /[?&]styles=/i.test(url) ? url : `${url}&styles=`;
}

// Fallback when the layer's TileMatrixSet didn't declare a tile size (see ExternalWmsLayerInfo.tileSize).
const DEFAULT_WMTS_TILE_SIZE = 256;
// Cap the stitched tile grid so a huge view can't explode into thousands of requests.
const WMTS_MAX_TILES = 256;
// Web-mercator latitude limit (where the projection is clipped to a square).
const WMTS_MAX_LAT = 85.05112878;

function lngToWorldTileX(lng: number, n: number): number {
  return ((lng + 180) / 360) * n;
}

function latToWorldTileY(lat: number, n: number): number {
  const clamped = Math.max(Math.min(lat, WMTS_MAX_LAT), -WMTS_MAX_LAT);
  const sin = Math.sin((clamped * Math.PI) / 180);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * n;
}

function loadCrossOriginImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    // crossOrigin so the stitched canvas isn't tainted and toBlob() can export it.
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// WMTS has no GetMap, so we build the requested view the way Leaflet does to display it: fetch the
// web-mercator tiles that overlap the bounds, stitch them onto a canvas, then crop to the exact
// view. Returns a PNG blob of the requested width/height. The layer is guaranteed web-mercator
// (the capabilities parser filters to that), so the standard slippy-map tile math applies.
export async function compositeWmtsImage(
  tileUrl: string,
  bounds: L.LatLngBounds,
  width: number,
  height: number,
  tileSize: number = DEFAULT_WMTS_TILE_SIZE,
): Promise<Blob> {
  const west = bounds.getWest();
  let east = bounds.getEast();
  // A view crossing the antimeridian reports east < west; unwrap east past +180° so the
  // span stays positive. The tile X loop below wraps the out-of-range indices back into the
  // real tile grid via modulo (wrappedX).
  if (east < west) {
    east += 360;
  }
  const lngSpan = Math.max(east - west, 1e-6);

  // Pick the TILEMATRIX (zoom) purely from the desired output resolution, using the same
  // 256px-equivalent scale convention every TileMatrixSet shares regardless of its actual tile
  // pixel size (mirrors buildWmtsPreviewTileUrl's z selection, which is also tileSize-independent).
  // Then drop a zoom level at a time until the tile count is under the cap.
  let z = Math.min(
    Math.max(Math.round(Math.log2((width * 360) / (DEFAULT_WMTS_TILE_SIZE * lngSpan))), 0),
    22,
  );
  let xMin = 0;
  let xMax = 0;
  let yMin = 0;
  let yMax = 0;
  let tileMinX = 0;
  let tileMaxX = 0;
  let tileMinY = 0;
  let tileMaxY = 0;
  let n = 1;
  for (let guard = 0; guard <= 22; guard++) {
    // Tiles per axis at this zoom: a TileMatrixSet with larger tiles (e.g. Planet's 512px
    // PopularWebMercator512) covers the same 256px-equivalent world resolution with
    // proportionally fewer, larger tiles — so n shrinks as tileSize grows past 256.
    n = Math.max(Math.round((2 ** z * DEFAULT_WMTS_TILE_SIZE) / tileSize), 1);
    xMin = lngToWorldTileX(west, n);
    xMax = lngToWorldTileX(east, n);
    yMin = latToWorldTileY(bounds.getNorth(), n);
    yMax = latToWorldTileY(bounds.getSouth(), n);
    tileMinX = Math.floor(xMin);
    tileMaxX = Math.floor(xMax - 1e-9);
    tileMinY = Math.floor(yMin);
    tileMaxY = Math.floor(yMax - 1e-9);
    const count = (tileMaxX - tileMinX + 1) * (tileMaxY - tileMinY + 1);
    if (count <= WMTS_MAX_TILES || z === 0) {
      break;
    }
    z -= 1;
  }

  const nTiles = n;
  const stitch = document.createElement('canvas');
  stitch.width = (tileMaxX - tileMinX + 1) * tileSize;
  stitch.height = (tileMaxY - tileMinY + 1) * tileSize;
  const sctx = stitch.getContext('2d');
  if (!sctx) {
    throw new Error('No canvas context');
  }

  const tasks: Promise<void>[] = [];
  for (let tx = tileMinX; tx <= tileMaxX; tx++) {
    const wrappedX = ((tx % nTiles) + nTiles) % nTiles; // wrap across the antimeridian
    for (let ty = tileMinY; ty <= tileMaxY; ty++) {
      if (ty < 0 || ty >= nTiles) {
        continue; // no tiles beyond the mercator latitude limits
      }
      const url = tileUrl
        .replaceAll('{z}', String(z))
        .replaceAll('{x}', String(wrappedX))
        .replaceAll('{y}', String(ty));
      const dx = (tx - tileMinX) * tileSize;
      const dy = (ty - tileMinY) * tileSize;
      tasks.push(
        loadCrossOriginImage(url).then((img) => {
          if (img) {
            sctx.drawImage(img, dx, dy);
          }
        }),
      );
    }
  }
  await Promise.all(tasks);

  // Crop the exact view rectangle out of the stitched tiles, scaled into the requested size.
  // xMin/xMax/yMin/yMax are in fractional-tile units, so subtracting the integer tile origin and
  // multiplying by tileSize converts them to pixel offsets within the stitched canvas.
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const octx = out.getContext('2d');
  if (!octx) {
    throw new Error('No canvas context');
  }
  octx.drawImage(
    stitch,
    (xMin - tileMinX) * tileSize,
    (yMin - tileMinY) * tileSize,
    (xMax - xMin) * tileSize,
    (yMax - yMin) * tileSize,
    0,
    0,
    width,
    height,
  );

  return canvasToBlob(out, 'image/png');
}

// Web-mercator projected Y for a latitude (unscaled; constant factors cancel when normalized).
// Used to place AOI geometry onto a web-mercator (EPSG:3857) image, where latitude is non-linear.
function mercatorLatY(lat: number): number {
  const clamped = Math.max(Math.min(lat, WMTS_MAX_LAT), -WMTS_MAX_LAT);
  return Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 360));
}

// Normalized (0..1) position of lng/lat within bounds. x is linear in lng for both EPSG:4326 and
// web mercator; y is linear in lat for 4326, but uses the mercator projection when webMercator is
// true so the geometry lines up with a 3857 image.
function normalizedXY(lng: number, lat: number, bounds: L.LatLngBounds, webMercator: boolean) {
  const west = bounds.getWest();
  const east = bounds.getEast();
  const north = bounds.getNorth();
  const south = bounds.getSouth();
  const nx = (lng - west) / (east - west);
  let ny;
  if (webMercator) {
    const yN = mercatorLatY(north);
    const yS = mercatorLatY(south);
    ny = (yN - mercatorLatY(lat)) / (yN - yS);
  } else {
    ny = (north - lat) / (north - south);
  }
  return { nx, ny };
}

function traceRing(
  ctx: CanvasRenderingContext2D,
  coords: GeoJSON.Position[],
  bounds: L.LatLngBounds,
  w: number,
  h: number,
  webMercator = false,
) {
  coords.forEach(([lng, lat], i) => {
    const { nx, ny } = normalizedXY(lng, lat, bounds, webMercator);
    const x = nx * w;
    const y = ny * h;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
}

function traceGeometry(
  ctx: CanvasRenderingContext2D,
  geometry: GeoJSON.Geometry,
  bounds: L.LatLngBounds,
  w: number,
  h: number,
  webMercator = false,
) {
  ctx.beginPath();
  if (geometry.type === 'Polygon') {
    traceRing(ctx, geometry.coordinates[0], bounds, w, h, webMercator);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((poly) => traceRing(ctx, poly[0], bounds, w, h, webMercator));
  }
}

export async function compositeOnWhite(
  blob: Blob,
  width: number,
  height: number,
  mimeType: string,
): Promise<Blob> {
  if (mimeType === 'image/png') {
    return blob;
  }
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No canvas context'));
        return;
      }
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvasToBlob(canvas, mimeType).then(resolve).catch(reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };
    img.src = objectUrl;
  });
}

export async function applyGeometryDraw(
  blob: Blob,
  geometry: GeoJSON.Geometry,
  bounds: L.LatLngBounds,
  width: number,
  height: number,
  mimeType: string,
  webMercator = false,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No canvas context'));
        return;
      }
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      ctx.strokeStyle = '#fabc20';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      traceGeometry(ctx, geometry, bounds, width, height, webMercator);
      ctx.stroke();
      canvasToBlob(canvas, mimeType).then(resolve).catch(reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };
    img.src = objectUrl;
  });
}

export async function applyGeometryClip(
  blob: Blob,
  geometry: GeoJSON.Geometry,
  bounds: L.LatLngBounds,
  width: number,
  height: number,
  mimeType: string,
  webMercator = false,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No canvas context'));
        return;
      }
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      traceGeometry(ctx, geometry, bounds, width, height, webMercator);
      ctx.clip();
      ctx.drawImage(img, 0, 0, width, height);
      canvasToBlob(canvas, mimeType).then(resolve).catch(reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };
    img.src = objectUrl;
  });
}

function ringToClipPathPoints(
  coords: GeoJSON.Position[],
  bounds: L.LatLngBounds,
  webMercator = false,
): string {
  return coords
    .map(([lng, lat]) => {
      const { nx, ny } = normalizedXY(lng, lat, bounds, webMercator);
      return `${nx.toFixed(4)},${ny.toFixed(4)}`;
    })
    .join(' ');
}

export interface ExternalWmsLayerInfo {
  url: string;
  layerName: string;
  layerTitle?: string; // human-readable title, used for the download filename / image caption
  type: 'WMS' | 'WMTS';
  tileUrl?: string;
  tileSize?: number; // WMTS only: tile pixel size declared by the TileMatrixSet (defaults to 256 when absent)
  version?: string;
  time?: string;
  style?: string; // WMS only: selected SLD style name
}

// When cropping a download/preview to an AOI, scale the requested pixel dimensions to the AOI's
// share of the map (in web mercator) so the per-pixel scale matches the on-screen map. WMS GetMap
// scale is bbox/pixels, so requesting the small AOI bbox at the full-map pixel size would render it
// at a finer scale and the server would draw scale-dependent labels for a different zoom level.
export function getExternalWmsCropDimensions(
  fullWidth: number,
  fullHeight: number,
  mapBounds: L.LatLngBounds,
  aoiBounds: L.LatLngBounds,
): { width: number; height: number } {
  const mSW = L.CRS.EPSG3857.project(mapBounds.getSouthWest());
  const mNE = L.CRS.EPSG3857.project(mapBounds.getNorthEast());
  const aSW = L.CRS.EPSG3857.project(aoiBounds.getSouthWest());
  const aNE = L.CRS.EPSG3857.project(aoiBounds.getNorthEast());
  const mapW = Math.abs(mNE.x - mSW.x) || 1;
  const mapH = Math.abs(mNE.y - mSW.y) || 1;
  const aoiW = Math.abs(aNE.x - aSW.x);
  const aoiH = Math.abs(aNE.y - aSW.y);
  return {
    width: Math.max(1, Math.round(fullWidth * (aoiW / mapW))),
    height: Math.max(1, Math.round(fullHeight * (aoiH / mapH))),
  };
}

// Fetch a full-view image (width x height) for a single external layer, by its type:
// WMTS → stitch the tiles covering the view; WMS → a GetMap request. Shared by the all-external
// compare compositor and the Sentinel-Hub compositor's hybrid (external + SH) branch.
export async function fetchExternalLayerBlob(
  ext: ExternalWmsLayerInfo,
  bounds: L.LatLngBounds,
  width: number,
  height: number,
  useWebMercator = false,
  mimeType: string = MimeTypes.PNG,
): Promise<Blob> {
  if (ext.type === 'WMTS' && ext.tileUrl) {
    return compositeWmtsImage(ext.tileUrl, bounds, width, height, ext.tileSize ?? DEFAULT_WMTS_TILE_SIZE);
  }
  const url = buildExternalWmsGetMapUrl(
    ext.url,
    ext.layerName,
    bounds,
    width,
    height,
    ext.time,
    ext.style,
    useWebMercator,
    mimeType,
  );
  // 60s abort (downloads are larger/slower than capabilities) so a hanging server doesn't spin the
  // image-download UI indefinitely, matching the timeouts on GetCapabilities/GetFeatureInfo.
  const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}`);
  }
  return r.blob();
}

export function SvgAoiClip({
  geometry,
  bounds,
  clipId,
  webMercator = false,
}: {
  geometry: GeoJSON.Geometry;
  bounds: L.LatLngBounds;
  clipId: string;
  webMercator?: boolean;
}) {
  const rings: GeoJSON.Position[][] = [];

  if (geometry.type === 'Polygon') {
    rings.push(geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((poly) => rings.push(poly[0]));
  }

  if (rings.length === 0) {
    return null;
  }

  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
          {rings.map((ring, i) => (
            <polygon key={i} points={ringToClipPathPoints(ring, bounds, webMercator)} />
          ))}
        </clipPath>
      </defs>
    </svg>
  );
}
