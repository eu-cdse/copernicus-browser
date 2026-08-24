import { XMLParser } from 'fast-xml-parser';
import moment from 'moment';
import { t } from 'ttag';

import { METERS_PER_DEGREE } from '../utils/coords';

export interface ExternalLayer {
  id: string; // unique within a server: stable identity for list keys/selection (names can repeat)
  name: string;
  title: string;
  abstract?: string;
  legendUrl?: string;
  tileUrl?: string; // WMTS only: pre-computed Leaflet {z}/{x}/{y} tile URL template
  tileSize?: number; // WMTS only: tile pixel size declared by the TileMatrixSet (defaults to Leaflet's 256 when absent)
  bbox?: { south: number; west: number; north: number; east: number }; // advertised geographic extent (EPSG:4326), used to aim the preview thumbnail at the data
  timeDimension?: string; // human-readable time range, e.g. "1980–2026 · monthly"
  queryable?: boolean; // WMS layer advertises GetFeatureInfo support
  timeDefault?: string; // default value of the time dimension
  timeStart?: string; // earliest available time (ISO8601)
  timeEnd?: string; // latest available time (ISO8601)
  timeRanges?: TimeRange[]; // parsed time extent ranges, used to compute selectable dates
  metadataUrls?: string[]; // MetadataURL / ows:Metadata link(s)
  attribution?: string; // WMS Attribution title (spec-inheritable from ancestor Layer nodes)
}

export interface TimeRange {
  start: string;
  end: string;
  period?: string; // ISO8601 duration, e.g. "P1M", "P8D", "P1Y" (absent for discrete values)
}

export interface CapabilitiesResult {
  serviceTitle: string;
  layers: ExternalLayer[];
  version: string; // negotiated service version (e.g. WMS "1.3.0" / "1.1.1", WMTS "1.0.0")
  format: string; // a GetMap image format the server supports (WMS); tile format for WMTS
  infoFormat?: string; // GetFeatureInfo format to request, if the service supports GetFeatureInfo
  serviceAbstract?: string;
  accessConstraints?: string;
  fees?: string;
}

function cleanTitle(title: string): string {
  return title.replace(/_/g, ' ');
}

// Servers very commonly advertise the literal "none" for AccessConstraints/Fees, which reads
// oddly rendered verbatim ("Access constraints: none"); treat such values as absent.
export const isMeaningful = (value?: string): boolean => !!value && value.trim().toLowerCase() !== 'none';

function formatTimeDimension(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const yearOf = (s: string): string => {
    const y = new Date(s).getUTCFullYear();
    return Number.isNaN(y) ? s.slice(0, 4) : String(y);
  };

  const stepLabels: Record<string, string> = {
    P1D: t`daily`,
    P7D: t`weekly`,
    P1M: t`monthly`,
    P3M: t`quarterly`,
    P1Y: t`yearly`,
    PT1H: t`hourly`,
    PT3H: t`3-hourly`,
  };

  const segments = trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  // The extent is either one/more "start/end/period" ranges or a discrete list of timestamps.
  const hasRange = segments.some((seg) => seg.includes('/'));
  if (hasRange) {
    const starts: string[] = [];
    const ends: string[] = [];
    let step: string | undefined;
    for (const seg of segments) {
      const parts = seg.split('/');
      starts.push(parts[0]);
      ends.push(parts[1] ?? parts[0]);
      if (!step && parts[2]) {
        step = parts[2];
      }
    }
    const startYear = yearOf([...starts].sort()[0]);
    const endYear = yearOf([...ends].sort()[ends.length - 1]);
    const range = startYear === endYear ? startYear : `${startYear}–${endYear}`;
    return step ? `${range} · ${stepLabels[step] ?? step}` : range;
  }

  // Discrete list of timestamps: show the span plus how many dates are available.
  const sorted = [...segments].sort();
  const startYear = yearOf(sorted[0]);
  const endYear = yearOf(sorted[sorted.length - 1]);
  const range = startYear === endYear ? startYear : `${startYear}–${endYear}`;
  return segments.length > 1 ? `${range} · ${t`${segments.length} dates`}` : range;
}

// Parse a WMS time Dimension extent into a default + start/end. The extent is either a discrete
// list (t1,t2,…) or one/more start/end/period ranges (e.g. "1980-01-01/2026-03-01/P1M,…").
// ISO8601 strings sort chronologically, so we take the earliest start and latest end.
function parseTimeExtent(
  defaultAttr: string,
  extent: string,
): { timeDefault?: string; timeStart?: string; timeEnd?: string; timeRanges?: TimeRange[] } {
  const trimmed = (extent || '').trim();
  if (!trimmed) {
    return {};
  }
  const starts: string[] = [];
  const ends: string[] = [];
  const ranges: TimeRange[] = [];
  for (const segment of trimmed.split(',')) {
    const parts = segment.trim().split('/');
    if (!parts[0]) {
      continue;
    }
    const start = parts[0];
    const end = parts[1] ?? parts[0];
    starts.push(start);
    ends.push(end);
    ranges.push(parts[2] ? { start, end, period: parts[2] } : { start, end });
  }
  if (starts.length === 0) {
    return {};
  }
  const timeStart = [...starts].sort()[0];
  const timeEnd = [...ends].sort()[ends.length - 1];
  return { timeDefault: defaultAttr || timeEnd, timeStart, timeEnd, timeRanges: ranges };
}

// Shared by extractWmsLegendUrl/extractWmsMetadataUrls: both read a href off a fast-xml-parser
// `OnlineResource` node (or a parent lacking one entirely).
function readOnlineResourceHref(node: Record<string, unknown> | undefined): string | undefined {
  const onlineResource = node?.['OnlineResource'] as Record<string, unknown> | undefined;
  const href = onlineResource?.['@_xlink:href'];
  return href ? String(href) : undefined;
}

function extractWmsLegendUrl(node: Record<string, unknown>): string | undefined {
  const style = node['Style'];
  if (!style) {
    return undefined;
  }
  const styles = Array.isArray(style) ? style : [style];
  for (const s of styles as Record<string, unknown>[]) {
    const legendUrl = s['LegendURL'] as Record<string, unknown> | undefined;
    const href = readOnlineResourceHref(legendUrl);
    if (href) {
      return href;
    }
  }
  return undefined;
}

// Shared by extractWmsMetadataUrls/the WMTS ows:Metadata block: both take a possibly-repeated
// metadata field, normalize it to an array, and pull an href off each entry via `getHref` (which
// differs by shape: WMS nests it under OnlineResource, WMTS reads @_xlink:href directly). An
// optional `getFormat` reads the server-declared MIME (WMS <Format>); each entry is then filtered
// through isWebPageMetadata so a layer's metadataUrls only ever contains human-viewable web links.
function extractMetadataUrls<T>(
  field: unknown,
  getHref: (node: T) => unknown,
  getFormat?: (node: T) => unknown,
): string[] | undefined {
  if (!field) {
    return undefined;
  }
  const nodes = Array.isArray(field) ? field : [field];
  const hrefs = (nodes as T[])
    .map((node) => ({ href: getHref(node), format: getFormat?.(node) }))
    .filter((e): e is { href: unknown; format: unknown } => Boolean(e.href))
    .filter((e) => isWebPageMetadata(String(e.href), e.format ? String(e.format) : undefined))
    .map((e) => String(e.href));
  return hrefs.length > 0 ? hrefs : undefined;
}

// Parse a WMS layer's MetadataURL(s) (0/1/many). Mirrors extractWmsLegendUrl's
// Style→LegendURL→OnlineResource→@_xlink:href shape, but array-normalized since MetadataURL can
// repeat. The <Format> MIME (when present) is the authoritative web-vs-machine signal.
function extractWmsMetadataUrls(node: Record<string, unknown>): string[] | undefined {
  return extractMetadataUrls(node['MetadataURL'], readOnlineResourceHref, (m) =>
    readText((m as Record<string, unknown>)['Format']),
  );
}

// Parse a WMS layer's Attribution (Title text and/or link). Attribution is spec-inheritable from
// ancestor <Layer> nodes, so a leaf without its own Attribution falls back to an inherited one
// (see extractWmsLayers). When there's no Title, the returned string is the bare OnlineResource
// URL; the caller renders it as a link when it looks like one (see validateWmsUrl).
function extractWmsAttribution(node: Record<string, unknown>): string | undefined {
  const attribution = node['Attribution'] as Record<string, unknown> | undefined;
  if (!attribution) {
    return undefined;
  }
  const title = readText(attribution['Title']);
  if (title) {
    return title;
  }
  return readOnlineResourceHref(attribution);
}

// Parse a WMS layer's advertised geographic extent (EPSG:4326). 1.3.0 uses
// EX_GeographicBoundingBox (child elements); 1.1.1 uses LatLonBoundingBox (attributes).
function extractWmsBbox(node: Record<string, unknown>): ExternalLayer['bbox'] | undefined {
  const ex = node['EX_GeographicBoundingBox'] as Record<string, unknown> | undefined;
  if (ex) {
    const west = Number(readText(ex['westBoundLongitude']));
    const east = Number(readText(ex['eastBoundLongitude']));
    const south = Number(readText(ex['southBoundLatitude']));
    const north = Number(readText(ex['northBoundLatitude']));
    if ([west, east, south, north].every(Number.isFinite)) {
      return { south, west, north, east };
    }
  }
  const ll = node['LatLonBoundingBox'] as Record<string, unknown> | undefined;
  if (ll) {
    const west = Number(ll['@_minx']);
    const south = Number(ll['@_miny']);
    const east = Number(ll['@_maxx']);
    const north = Number(ll['@_maxy']);
    if ([west, east, south, north].every(Number.isFinite)) {
      return { south, west, north, east };
    }
  }
  return undefined;
}

// Give each layer a stable, unique-within-the-server `id` for list keys and selection.
// WMS layer `Name`s can repeat (the same renderable layer nested under several parent groups,
// or distinct layers sharing a Name), which would otherwise collide as React keys and make
// several rows look "selected" at once. `name` stays the request identifier; `id` is UI-only.
// The first occurrence of a name keeps `id === name` so older pins (which stored only the name)
// still line up; later duplicates get `name#2`, `name#3`, …
function assignLayerIds(layers: ExternalLayer[]): ExternalLayer[] {
  const counts: Record<string, number> = {};
  return layers.map((l) => {
    const n = (counts[l.name] = (counts[l.name] ?? 0) + 1);
    return { ...l, id: n === 1 ? l.name : `${l.name}#${n}` };
  });
}

function extractWmsLayers(
  layerNode: unknown,
  inheritedBbox?: ExternalLayer['bbox'],
  inheritedAttribution?: string,
): ExternalLayer[] {
  if (!layerNode || typeof layerNode !== 'object') {
    return [];
  }
  const node = layerNode as Record<string, unknown>;
  const results: ExternalLayer[] = [];

  // A layer inherits its parent's bounding box if it doesn't declare its own.
  const bbox = extractWmsBbox(node) ?? inheritedBbox;
  // Attribution is spec-inheritable: a layer without its own falls back to an ancestor's.
  const attribution = extractWmsAttribution(node) ?? inheritedAttribution;

  // ArcGIS WMS uses numeric layer names (0, 1, 2…) which fast-xml-parser parses as
  // numbers, so coerce to string before the truthiness check (0 would be falsy otherwise).
  const name = node['Name'] != null ? String(node['Name']) : '';
  const title = node['Title'] != null ? String(node['Title']) : '';
  if (name && title) {
    const layer: ExternalLayer = {
      id: name, // replaced with a unique id by assignLayerIds once the full list is built
      name: name,
      title: cleanTitle(title),
    };
    if (bbox) {
      layer.bbox = bbox;
    }
    if (String(node['@_queryable'] ?? '') === '1') {
      layer.queryable = true;
    }
    const abstract = readText(node['Abstract']);
    if (abstract) {
      layer.abstract = abstract;
    }
    const legendUrl = extractWmsLegendUrl(node);
    if (legendUrl) {
      layer.legendUrl = legendUrl;
    }
    const metadataUrls = extractWmsMetadataUrls(node);
    if (metadataUrls) {
      layer.metadataUrls = metadataUrls;
    }
    if (attribution) {
      layer.attribution = attribution;
    }
    // Time dimension. WMS 1.3.0 puts the extent value inside <Dimension name="time">…</Dimension>;
    // WMS 1.1.1 (which we request) leaves <Dimension> as a bare declaration and puts the value in a
    // sibling <Extent name="time">…</Extent>. So read whichever carries the value.
    const findTimeNode = (coll: unknown): Record<string, unknown> | null => {
      if (!coll) {
        return null;
      }
      const arr = (Array.isArray(coll) ? coll : [coll]) as Record<string, unknown>[];
      return arr.find((d) => String(d['@_name'] ?? '').toLowerCase() === 'time') ?? null;
    };
    const timeDimNode = findTimeNode(node['Dimension']);
    const timeExtentNode = findTimeNode(node['Extent']);
    if (timeDimNode || timeExtentNode) {
      // Prefer the <Extent> value (1.1.1); fall back to the <Dimension> body (1.3.0).
      const extentValue = readText(timeExtentNode) || readText(timeDimNode);
      const defaultAttr = String(timeExtentNode?.['@_default'] ?? timeDimNode?.['@_default'] ?? '');
      const formatted = formatTimeDimension(extentValue);
      if (formatted) {
        layer.timeDimension = formatted;
      }
      const { timeDefault, timeStart, timeEnd, timeRanges } = parseTimeExtent(defaultAttr, extentValue);
      if (timeDefault) {
        layer.timeDefault = timeDefault;
      }
      if (timeStart) {
        layer.timeStart = timeStart;
      }
      if (timeEnd) {
        layer.timeEnd = timeEnd;
      }
      if (timeRanges && timeRanges.length > 0) {
        layer.timeRanges = timeRanges;
      }
    }
    results.push(layer);
  }

  if (node['Layer']) {
    const children = Array.isArray(node['Layer']) ? node['Layer'] : [node['Layer']];
    for (const child of children) {
      results.push(...extractWmsLayers(child, bbox, attribution));
    }
  }

  return results;
}

function readText(value: unknown, fallback = ''): string {
  if (!value) {
    return fallback;
  }
  if (typeof value === 'object') {
    return String((value as Record<string, unknown>)['#text'] ?? fallback);
  }
  return String(value);
}

const CAPABILITIES_TIMEOUT_MS = 20000;

// fast-xml-parser's default `processEntities` (billion-laughs protection) caps total entity
// expansions at 1000. Only counted entity types (`&lt;`/`&gt;`/`&apos;`/`&quot;`, DOCTYPE-declared,
// and HTML entities) increment that counter; `&amp;` is replaced separately and never counted.
// Large public WMS/WMTS capabilities documents (e.g. 1000+ layers whose titles/abstracts use these
// counted entities) legitimately exceed the count and would otherwise fail with "Entity expansion
// limit exceeded". Keep entity processing enabled (so `&amp;` in URLs still decodes to `&`) but
// raise the count limit, while keeping `maxExpandedLength` finite so a maliciously nested entity
// bomb (which expands to gigabytes) is still rejected.
const CAPABILITIES_PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: { maxTotalExpansions: Number.MAX_SAFE_INTEGER, maxExpandedLength: 10_000_000 },
};

// GetFeatureInfo query box: a few pixels centred on the click, floored to a resolution the
// server can render (a sub-metre box at very high zoom makes some servers time out — 504).
const GFI_QUERY_BOX_PX = 9;
const GFI_MIN_METERS_PER_PIXEL = 10;
// Fallback box (~100 m) used when the map view isn't available.
const GFI_FALLBACK_BOX_PX = 101;
const GFI_FALLBACK_HALF_METERS = 50;
const GFI_FEATURE_COUNT = '10';

// Shared GetCapabilities fetch: normalises the endpoint, requests with a timeout, and returns the
// XML text. Network/CORS failures reject with a TypeError, a timeout rejects with a TimeoutError,
// and a non-OK HTTP response throws an `HttpError` (carrying `.status`) so the caller can show a
// specific message; parsing is left to each caller (so malformed/empty XML is a "couldn't load", null).
async function fetchCapabilitiesXml(url: string, queryParams: string): Promise<string> {
  const endpoint = getServiceEndpoint(url);
  const separator = endpoint.includes('?') ? '&' : '?';
  // AbortSignal.timeout so a slow/hanging server doesn't leave the UI spinning forever (matches the
  // GetMap/GetFeatureInfo fetches). A timeout rejects with a TimeoutError, handled by the caller.
  const response = await fetch(`${endpoint}${separator}${queryParams}`, {
    signal: AbortSignal.timeout(CAPABILITIES_TIMEOUT_MS),
  });
  if (!response.ok) {
    const err = new Error(`HTTP ${response.status}`) as Error & { status?: number };
    err.name = 'HttpError';
    err.status = response.status;
    throw err;
  }
  return response.text();
}

// Pick an image format the WMS server supports for GetMap (prefer PNG, then JPEG).
function pickGetMapFormat(capability: unknown): string {
  try {
    const request = (capability as Record<string, unknown>)['Request'] as Record<string, unknown>;
    const getMap = request?.['GetMap'] as Record<string, unknown>;
    const formatField = getMap?.['Format'];
    const formats = formatField ? (Array.isArray(formatField) ? formatField : [formatField]).map(String) : [];
    return (
      formats.find((f) => f === 'image/png') ??
      formats.find((f) => f === 'image/jpeg') ??
      formats[0] ??
      'image/png'
    );
  } catch {
    return 'image/png';
  }
}

// Preferred GetFeatureInfo formats, easiest-to-render first.
const FEATURE_INFO_FORMAT_PREFERENCE = [
  'application/geo+json',
  'application/json',
  'text/html',
  'text/plain',
  'application/vnd.ogc.gml',
  'text/xml',
];

// Choose a GetFeatureInfo format the WMS server supports, or undefined if it has no GetFeatureInfo.
function pickFeatureInfoFormat(capability: unknown): string | undefined {
  try {
    const request = (capability as Record<string, unknown>)['Request'] as Record<string, unknown>;
    const getFeatureInfo = request?.['GetFeatureInfo'] as Record<string, unknown> | undefined;
    if (!getFeatureInfo) {
      return undefined;
    }
    const formatField = getFeatureInfo['Format'];
    const formats = formatField ? (Array.isArray(formatField) ? formatField : [formatField]).map(String) : [];
    for (const preferred of FEATURE_INFO_FORMAT_PREFERENCE) {
      if (formats.includes(preferred)) {
        return preferred;
      }
    }
    // GetFeatureInfo is advertised but with formats we don't recognise — text/html is near-universal.
    return formats.length > 0 ? 'text/html' : undefined;
  } catch {
    return undefined;
  }
}

// Leaflet renders in EPSG:3857, so a WMTS layer only aligns if its TileMatrixSet is web mercator.
function isWebMercator(crsOrId: string): boolean {
  const s = (crsOrId || '').toLowerCase();
  return s.includes('3857') || s.includes('900913') || s.includes('googlemapscompatible');
}

// Default value of a WMTS layer's Time dimension, used to fill a {Time} tile template.
function getWmtsTimeDefault(layer: Record<string, unknown>): string {
  const dimField = layer['Dimension'];
  if (!dimField) {
    return '';
  }
  const dims = Array.isArray(dimField) ? dimField : [dimField];
  for (const dim of dims as Record<string, unknown>[]) {
    const id = String(dim['ows:Identifier'] ?? dim['Identifier'] ?? '').toLowerCase();
    if (id === 'time') {
      return readText(dim['Default'] ?? dim['ows:Default'] ?? '');
    }
  }
  return '';
}

// Default style identifier advertised by a WMTS layer, used to fill a {Style} tile template /
// STYLE= param. Prefers the <Style> flagged isDefault="true"/"1", else the first <Style>, else
// 'default' for servers that advertise no style at all.
function getWmtsDefaultStyle(layer: Record<string, unknown>): string {
  const styleField = layer['Style'];
  if (!styleField) {
    return 'default';
  }
  const styles = (Array.isArray(styleField) ? styleField : [styleField]) as Record<string, unknown>[];
  const isDefault = (s: Record<string, unknown>) => {
    const flag = String(s['@_isDefault'] ?? '').toLowerCase();
    return flag === 'true' || flag === '1';
  };
  const style = styles.find(isDefault) ?? styles[0];
  return readText(style?.['ows:Identifier'] ?? style?.['Identifier']) || 'default';
}

// Hostname of a URL, falling back to the raw string for a malformed URL (used as a service-title
// default, and as the display text for a bare-URL Attribution fallback). new URL() throws on bad
// input, so guard it.
export function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function fetchWmsCapabilities(url: string): Promise<CapabilitiesResult | null> {
  // Request 1.1.1 (the only WMS version we support — sentinelhub-js is 1.1.1-only). Version
  // negotiation returns 1.1.1 from any 1.1.1-capable server; a 1.3.0-only server returns 1.3.0,
  // which the caller detects and rejects.
  const xml = await fetchCapabilitiesXml(url, 'SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.1.1');
  if (xml === null) {
    return null;
  }
  try {
    const parser = new XMLParser(CAPABILITIES_PARSER_OPTIONS);
    const parsed = parser.parse(xml);

    const root = parsed['WMS_Capabilities'] || parsed['WMT_MS_Capabilities'] || Object.values(parsed)[0];
    if (!root || typeof root !== 'object') {
      return null;
    }

    const version = String((root as Record<string, unknown>)['@_version'] ?? '1.1.1');

    const serviceNode = (root as Record<string, unknown>)['Service'];
    const serviceTitle = serviceNode
      ? readText((serviceNode as Record<string, unknown>)['Title'], safeHostname(url))
      : safeHostname(url);
    const serviceAbstract = serviceNode
      ? readText((serviceNode as Record<string, unknown>)['Abstract']) || undefined
      : undefined;
    const accessConstraints = serviceNode
      ? readText((serviceNode as Record<string, unknown>)['AccessConstraints']) || undefined
      : undefined;
    const fees = serviceNode
      ? readText((serviceNode as Record<string, unknown>)['Fees']) || undefined
      : undefined;

    const capability = (root as Record<string, unknown>)['Capability'];
    if (!capability) {
      return null;
    }

    const format = pickGetMapFormat(capability);
    const infoFormat = pickFeatureInfoFormat(capability);

    const topLayer = (capability as Record<string, unknown>)['Layer'];
    if (!topLayer) {
      return null;
    }

    // Some servers nest the renderable layers under the top layer; others expose a single
    // named top-level layer with no children. extractWmsLayers handles both (it recurses
    // and also captures a named top layer), so fall back to it when there are no children.
    // A document-root Attribution/BoundingBox declared directly on the top layer is
    // spec-inheritable too, so seed it as the initial inherited value for each child branch.
    const topLayerNode = topLayer as Record<string, unknown>;
    const inheritedBbox = extractWmsBbox(topLayerNode);
    const inheritedAttribution = extractWmsAttribution(topLayerNode);
    const children = topLayerNode['Layer'];
    const layers = assignLayerIds(
      (children
        ? (Array.isArray(children) ? children : [children]).flatMap((child) =>
            extractWmsLayers(child, inheritedBbox, inheritedAttribution),
          )
        : extractWmsLayers(topLayer, undefined)
      ).filter((l) => l.name),
    );

    return layers.length > 0
      ? { serviceTitle, layers, version, format, infoFormat, serviceAbstract, accessConstraints, fees }
      : null;
  } catch (e) {
    console.warn(`[ExternalLayers] WMS GetCapabilities parse error for ${url}:`, e);
    return null;
  }
}

export async function fetchWmtsCapabilities(url: string): Promise<CapabilitiesResult | null> {
  const xml = await fetchCapabilitiesXml(url, 'SERVICE=WMTS&REQUEST=GetCapabilities');
  if (xml === null) {
    return null;
  }
  try {
    const parser = new XMLParser(CAPABILITIES_PARSER_OPTIONS);
    const parsed = parser.parse(xml);

    const capabilities = parsed['Capabilities'] || Object.values(parsed)[0];
    if (!capabilities || typeof capabilities !== 'object') {
      return null;
    }

    const serviceIdNode = (capabilities as Record<string, unknown>)['ows:ServiceIdentification'];
    const serviceTitle = serviceIdNode
      ? readText((serviceIdNode as Record<string, unknown>)['ows:Title'], safeHostname(url))
      : safeHostname(url);
    const serviceAbstract = serviceIdNode
      ? readText(
          (serviceIdNode as Record<string, unknown>)['ows:Abstract'] ??
            (serviceIdNode as Record<string, unknown>)['Abstract'],
        ) || undefined
      : undefined;
    const accessConstraints = serviceIdNode
      ? readText(
          (serviceIdNode as Record<string, unknown>)['ows:AccessConstraints'] ??
            (serviceIdNode as Record<string, unknown>)['AccessConstraints'],
        ) || undefined
      : undefined;
    const fees = serviceIdNode
      ? readText(
          (serviceIdNode as Record<string, unknown>)['ows:Fees'] ??
            (serviceIdNode as Record<string, unknown>)['Fees'],
        ) || undefined
      : undefined;

    const contents = (capabilities as Record<string, unknown>)['Contents'];
    if (!contents || typeof contents !== 'object') {
      return null;
    }

    // Map each TileMatrixSet id to its CRS so we can keep only web-mercator layers
    // (Leaflet renders in EPSG:3857; other grids would be misplaced on the map).
    const tmsCrsById: Record<string, string> = {};
    // Map each TileMatrixSet id to its tile pixel size. Non-standard sets (e.g. Planet's
    // PopularWebMercator512) use 512px tiles instead of the WMTS/Web-Mercator convention of 256px;
    // without this, Leaflet's default 256px assumption produces TILECOL/TILEROW values twice too
    // large, which the server rejects with a 400 "Invalid TILECOL parameter" error.
    const tmsTileSizeById: Record<string, number> = {};
    const tmsField = (contents as Record<string, unknown>)['TileMatrixSet'];
    if (tmsField) {
      const tmsDefs = Array.isArray(tmsField) ? tmsField : [tmsField];
      for (const tms of tmsDefs as Record<string, unknown>[]) {
        const id = String(tms['ows:Identifier'] ?? tms['Identifier'] ?? '');
        const crs = String(tms['ows:SupportedCRS'] ?? tms['SupportedCRS'] ?? '');
        if (id) {
          tmsCrsById[id] = crs;
        }
        const tileMatrixField = tms['TileMatrix'];
        if (id && tileMatrixField) {
          const tileMatrices = Array.isArray(tileMatrixField) ? tileMatrixField : [tileMatrixField];
          const firstTileMatrix = tileMatrices[0] as Record<string, unknown> | undefined;
          const tileWidth = Number(readText(firstTileMatrix?.['TileWidth']));
          if (Number.isFinite(tileWidth) && tileWidth > 0) {
            tmsTileSizeById[id] = tileWidth;
          }
        }
      }
    }

    let layerNodes = (contents as Record<string, unknown>)['Layer'];
    if (!layerNodes) {
      return null;
    }
    if (!Array.isArray(layerNodes)) {
      layerNodes = [layerNodes];
    }

    let resultFormat = 'image/png';
    const layers: ExternalLayer[] = [];
    // Base for the KVP GetTile fallback below.
    const endpoint = getServiceEndpoint(url);
    const separator = endpoint.includes('?') ? '&' : '?';

    for (const layer of layerNodes as Record<string, unknown>[]) {
      const name = String(layer['ows:Identifier'] ?? layer['Identifier'] ?? '');
      if (!name) {
        continue;
      }
      const title = cleanTitle(readText(layer['ows:Title'] ?? layer['Title'], name));

      const formatField = layer['Format'];
      const formats = formatField ? (Array.isArray(formatField) ? formatField : [formatField]) : [];
      const format: string =
        (formats as string[]).find((f) => f === 'image/png') ??
        (formats as string[]).find((f) => f === 'image/jpeg') ??
        (formats as string[])[0] ??
        'image/png';

      // Choose a web-mercator TileMatrixSet for this layer; skip the layer if none is available.
      const tmsLinkField = layer['TileMatrixSetLink'];
      const tmsLinks = tmsLinkField ? (Array.isArray(tmsLinkField) ? tmsLinkField : [tmsLinkField]) : [];
      const tmsIds = (tmsLinks as Record<string, unknown>[]).map((l) => String(l['TileMatrixSet'] ?? ''));
      const tileMatrixSet =
        tmsIds.find((id) => isWebMercator(tmsCrsById[id] ?? id)) ??
        (tmsIds.length === 1 && Object.keys(tmsCrsById).length === 0 ? tmsIds[0] : '');
      if (!tileMatrixSet) {
        continue;
      }

      const timeDefault = getWmtsTimeDefault(layer);
      const styleId = getWmtsDefaultStyle(layer);
      let tileUrl = '';

      const resourceUrlField = layer['ResourceURL'];
      if (resourceUrlField) {
        const resourceUrls = Array.isArray(resourceUrlField) ? resourceUrlField : [resourceUrlField];
        const tileResources = (resourceUrls as Record<string, unknown>[]).filter(
          (r) => r['@_resourceType'] === 'tile',
        );
        // Prefer a template without {Time}; otherwise substitute the dimension default.
        const tileResource =
          tileResources.find((r) => !String(r['@_template'] ?? '').includes('{Time}')) ?? tileResources[0];

        if (tileResource) {
          let template = String(tileResource['@_template'] ?? '');
          template = template
            .replace('{TileMatrix}', '{z}')
            .replace('{TileRow}', '{y}')
            .replace('{TileCol}', '{x}')
            .replace('{Style}', styleId)
            .replace('{TileMatrixSet}', tileMatrixSet);
          if (template.includes('{Time}')) {
            template = template.replace('{Time}', timeDefault || 'default');
          }
          tileUrl = template;
        }
      }

      if (!tileUrl) {
        tileUrl = `${endpoint}${separator}SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${name}&STYLE=${encodeURIComponent(
          styleId,
        )}&FORMAT=${encodeURIComponent(
          format,
        )}&TILEMATRIXSET=${tileMatrixSet}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;
        if (timeDefault) {
          tileUrl += `&TIME=${encodeURIComponent(timeDefault)}`;
        }
      }

      if (tileUrl) {
        resultFormat = format;
        const layerEntry: ExternalLayer = { id: name, name, title, tileUrl };
        const tileSize = tmsTileSizeById[tileMatrixSet];
        if (tileSize) {
          layerEntry.tileSize = tileSize;
        }
        const wgs = (layer['ows:WGS84BoundingBox'] ?? layer['WGS84BoundingBox']) as
          | Record<string, unknown>
          | undefined;
        if (wgs) {
          const lower = readText(wgs['ows:LowerCorner'] ?? wgs['LowerCorner'])
            .split(/\s+/)
            .map(Number);
          const upper = readText(wgs['ows:UpperCorner'] ?? wgs['UpperCorner'])
            .split(/\s+/)
            .map(Number);
          if (lower.length === 2 && upper.length === 2 && [...lower, ...upper].every(Number.isFinite)) {
            layerEntry.bbox = { west: lower[0], south: lower[1], east: upper[0], north: upper[1] };
          }
        }
        const abstract = readText(layer['ows:Abstract'] ?? layer['Abstract']);
        if (abstract) {
          layerEntry.abstract = abstract;
        }
        const metadataUrls = extractMetadataUrls(
          layer['ows:Metadata'] ?? layer['Metadata'],
          (m: Record<string, unknown>) => m['@_xlink:href'],
        );
        if (metadataUrls) {
          layerEntry.metadataUrls = metadataUrls;
        }
        const styleField = layer['Style'];
        if (styleField) {
          const styles = Array.isArray(styleField) ? styleField : [styleField];
          for (const s of styles as Record<string, unknown>[]) {
            const legendUrl = s['LegendURL'] as Record<string, unknown> | undefined;
            if (legendUrl) {
              const href = (legendUrl as Record<string, unknown>)['@_xlink:href'];
              if (href) {
                layerEntry.legendUrl = String(href);
                break;
              }
            }
          }
        }
        layers.push(layerEntry);
      }
    }

    if (layers.length === 0) {
      console.warn(`[ExternalLayers] WMTS GetCapabilities returned no usable web-mercator layers for ${url}`);
      return null;
    }
    return {
      serviceTitle,
      layers: assignLayerIds(layers),
      version: '1.0.0',
      format: resultFormat,
      serviceAbstract,
      accessConstraints,
      fees,
    };
  } catch (e) {
    console.warn(`[ExternalLayers] WMTS GetCapabilities parse error for ${url}:`, e);
    return null;
  }
}

export function validateWmsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

// A layer's MetadataURL / ows:Metadata often points at a raw machine-readable document (ISO19115
// XML, GML, JSON, ...) rather than a human-viewable web page. Clicking those just dumps markup in
// the browser, so we only surface metadata links that look like a web page. Two signals mark a URL
// as non-web:
//   1. The path ends in a known data-file extension (the WMS <Format> is ignored, and WMTS
//      ows:Metadata carries none). Fragments are disregarded, so .../catalog.search#/metadata/<uuid>
//      is (correctly) treated as a web page.
//   2. The query string is an OGC web-service operation (e.g. a CSW GetRecordById, a WFS/WCS/WMS
//      GetCapabilities), which always returns a machine-readable document even when the path has no
//      file extension, e.g. .../geonetwork/srv/csw?service=CSW&request=GetRecordById&outputschema=...
const NON_WEB_METADATA_EXTENSIONS = /\.(xml|gml|json|geojson|kml|rdf|csv|txt)$/i;
const OGC_SERVICE_TYPES = new Set(['csw', 'wfs', 'wcs', 'wms', 'wmts', 'sos', 'wps']);
const OGC_MACHINE_REQUESTS = new Set([
  'getrecordbyid',
  'getrecords',
  'describerecord',
  'getcapabilities',
  'getmap',
  'getfeature',
  'getcoverage',
  'describefeaturetype',
  'describecoverage',
  'getfeatureinfo',
]);
export function isWebPageMetadataUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (NON_WEB_METADATA_EXTENSIONS.test(u.pathname)) {
      return false;
    }
    // Case-insensitive lookup: OGC query params can be either case (service/SERVICE, request/REQUEST).
    const params = new Map<string, string>();
    for (const [key, value] of u.searchParams) {
      params.set(key.toLowerCase(), value.toLowerCase());
    }
    // outputSchema is CSW-specific and always yields XML.
    if (params.has('outputschema')) {
      return false;
    }
    const service = params.get('service');
    if (service && OGC_SERVICE_TYPES.has(service)) {
      return false;
    }
    const request = params.get('request');
    if (request && OGC_MACHINE_REQUESTS.has(request)) {
      return false;
    }
    return true;
  } catch {
    // Not a parseable absolute URL: leave it to validateWmsUrl's link/plain-text handling.
    return true;
  }
}

// MIME types that indicate a browsable web page.
const WEB_PAGE_MIME = /^(text\/html|application\/xhtml\+xml)\b/;
// MIME types that indicate a machine-readable document (XML/GML/JSON payloads).
const MACHINE_MIME = /(xml|gml|json)/;
// Decide whether a metadata link should be surfaced as a clickable link. The WMS
// <MetadataURL><Format> MIME is authoritative, so it wins when present and recognised; otherwise
// (unrecognised MIME, or WMTS ows:Metadata which carries none) we fall back to the URL heuristic.
export function isWebPageMetadata(href: string, format?: string): boolean {
  const mime = format?.trim().toLowerCase();
  if (mime) {
    if (WEB_PAGE_MIME.test(mime)) {
      return true;
    }
    // Any XML/GML/JSON payload, or any other non-web application/* document, is machine-readable.
    if (MACHINE_MIME.test(mime) || mime.startsWith('application/')) {
      return false;
    }
    // Unrecognised MIME (e.g. text/plain): fall through to the URL heuristic.
  }
  return isWebPageMetadataUrl(href);
}

// Params that belong to a specific WMS/WMTS request, not to the service endpoint.
// Stripped so a pasted GetCapabilities/GetMap URL becomes a clean base we can
// append our own request params to (avoids duplicate/conflicting params).
const REQUEST_PARAM_KEYS = new Set([
  'service',
  'request',
  'version',
  'layers',
  'layer',
  'styles',
  'style',
  'crs',
  'srs',
  'bbox',
  'width',
  'height',
  'format',
  'transparent',
  'time',
  'tilematrix',
  'tilematrixset',
  'tilerow',
  'tilecol',
]);

export function getServiceEndpoint(url: string): string {
  try {
    const u = new URL(url);
    for (const key of [...u.searchParams.keys()]) {
      if (REQUEST_PARAM_KEYS.has(key.toLowerCase())) {
        u.searchParams.delete(key);
      }
    }
    const qs = u.searchParams.toString();
    return `${u.origin}${u.pathname}${qs ? `?${qs}` : ''}`;
  } catch {
    return url;
  }
}

// Build a WMS GetFeatureInfo request for a click at (lat, lng). Uses the actual map view
// (bbox + viewport size) so the query runs at the resolution the user is already seeing —
// a tiny synthetic bbox would force an absurd resolution and time the server out (504).
// WMS 1.1.1 only: SRS + lon/lat bbox order + X/Y pixel params (external WMS is 1.1.1-only).
export function buildExternalGetFeatureInfoUrl({
  serverUrl,
  layerName,
  infoFormat,
  lat,
  lng,
  mapBounds,
  width,
  height,
}: {
  serverUrl: string;
  layerName: string;
  infoFormat: string;
  lat: number;
  lng: number;
  mapBounds?: { south: number; west: number; north: number; east: number };
  width?: number;
  height?: number;
}): string {
  const endpoint = getServiceEndpoint(serverUrl);

  let south: number;
  let west: number;
  let north: number;
  let east: number;
  let w: number;
  let h: number;
  let i: number;
  let j: number;

  if (mapBounds && width && height) {
    // Small query box centred on the click. We use the map resolution, but floored to a minimum
    // metres-per-pixel: at very high zoom a sub-metre box makes the server render at an impossible
    // resolution and time out (504), so we never request finer than this even when zoomed further.
    const metersPerDegLng = METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180);
    const degPerPxX = Math.max(
      (mapBounds.east - mapBounds.west) / width,
      GFI_MIN_METERS_PER_PIXEL / metersPerDegLng,
    );
    const degPerPxY = Math.max(
      (mapBounds.north - mapBounds.south) / height,
      GFI_MIN_METERS_PER_PIXEL / METERS_PER_DEGREE,
    );
    const center = (GFI_QUERY_BOX_PX - 1) / 2;
    west = lng - degPerPxX * center;
    east = lng + degPerPxX * center;
    south = lat - degPerPxY * center;
    north = lat + degPerPxY * center;
    w = GFI_QUERY_BOX_PX;
    h = GFI_QUERY_BOX_PX;
    i = center;
    j = center;
  } else {
    // Fallback when the map view isn't available: a ~100 m box at a normal resolution.
    const halfWidthDeg = GFI_FALLBACK_HALF_METERS / (METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180));
    const halfHeightDeg = GFI_FALLBACK_HALF_METERS / METERS_PER_DEGREE;
    west = lng - halfWidthDeg;
    east = lng + halfWidthDeg;
    south = lat - halfHeightDeg;
    north = lat + halfHeightDeg;
    w = GFI_FALLBACK_BOX_PX;
    h = GFI_FALLBACK_BOX_PX;
    i = (GFI_FALLBACK_BOX_PX - 1) / 2;
    j = (GFI_FALLBACK_BOX_PX - 1) / 2;
  }

  i = Math.min(Math.max(0, i), w - 1);
  j = Math.min(Math.max(0, j), h - 1);

  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    REQUEST: 'GetFeatureInfo',
    LAYERS: layerName,
    QUERY_LAYERS: layerName,
    // STYLES is a required GetMap parameter that GetFeatureInfo inherits; strict servers (e.g.
    // terrestris) reject the request without it. Empty means default styles.
    STYLES: '',
    SRS: 'EPSG:4326',
    BBOX: `${west},${south},${east},${north}`,
    WIDTH: String(w),
    HEIGHT: String(h),
    X: String(i),
    Y: String(j),
    INFO_FORMAT: infoFormat,
    FEATURE_COUNT: GFI_FEATURE_COUNT,
  });
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}${params.toString()}`;
}

// Compute the selectable dates within a calendar month for a WMS time dimension, based on the
// layer's parsed time ranges (granularity-aware): daily/sub-daily → every day; P1M → the period
// day-of-month; P8D/P16D → the step days; P1Y → the anchor day; discrete values → those days.
// Returns Date objects (UTC midnight) so the calendar can highlight available days.
export function getWmsAvailableDatesInMonth(
  timeRanges: TimeRange[] | undefined,
  monthStartInput: moment.MomentInput,
  monthEndInput: moment.MomentInput,
): Date[] {
  if (!timeRanges || timeRanges.length === 0) {
    return [];
  }
  const monthStart = moment.utc(monthStartInput).startOf('day');
  const monthEnd = moment.utc(monthEndInput).endOf('day');
  const seen = new Set<string>();
  const out: Date[] = [];

  const pushDay = (m: moment.Moment) => {
    const day = m.clone().startOf('day');
    const key = day.format('YYYY-MM-DD');
    if (!seen.has(key)) {
      seen.add(key);
      out.push(day.toDate());
    }
  };

  for (const range of timeRanges) {
    const rangeStart = moment.utc(range.start);
    const rangeEnd = moment.utc(range.end);
    const winEnd = moment.min(rangeEnd, monthEnd);

    if (!range.period) {
      // discrete value
      if (rangeStart.isBetween(monthStart, monthEnd, undefined, '[]')) {
        pushDay(rangeStart);
      }
      continue;
    }

    const duration = moment.duration(range.period);
    const isFixedDays = duration.years() === 0 && duration.months() === 0;
    const stepDays = isFixedDays ? Math.max(1, Math.round(duration.asDays())) : 0;

    if (isFixedDays && duration.asDays() < 1) {
      // sub-daily (PTxx) → every day in the window
      for (
        let d = moment.max(rangeStart, monthStart).clone().startOf('day');
        d.isSameOrBefore(winEnd);
        d.add(1, 'day')
      ) {
        pushDay(d);
      }
      continue;
    }

    if (isFixedDays) {
      // step every N days from the range start; fast-forward to near the month start
      const cursor = rangeStart.clone().startOf('day');
      const diffDays = monthStart.diff(cursor, 'days');
      if (diffDays > 0) {
        cursor.add(Math.floor(diffDays / stepDays) * stepDays, 'days');
      }
      while (cursor.isBefore(monthStart, 'day')) {
        cursor.add(stepDays, 'days');
      }
      for (; cursor.isSameOrBefore(winEnd); cursor.add(stepDays, 'days')) {
        pushDay(cursor);
      }
      continue;
    }

    // month/year periods: step by the duration from the range start
    const cursor = rangeStart.clone();
    while (cursor.isBefore(monthStart, 'day')) {
      cursor.add(duration);
    }
    for (; cursor.isSameOrBefore(winEnd); cursor.add(duration)) {
      pushDay(cursor);
    }
  }

  return out;
}

export type PreviewBbox = { south: number; west: number; north: number; east: number };

// Pick a single WMTS tile (z/x/y) over the centre of the layer's advertised extent, at a zoom
// where the extent roughly fits one tile, so the thumbnail lands on data instead of a fixed
// ocean tile. Falls back to the whole-world tile (z0) when no bbox is advertised.
export function buildWmtsPreviewTileUrl(tileUrl: string, bbox?: PreviewBbox, tileSize?: number): string {
  let z = 0;
  let x = 0;
  let y = 0;
  if (bbox) {
    const centerLon = (bbox.west + bbox.east) / 2;
    const centerLat = (bbox.south + bbox.north) / 2;
    const spanLon = Math.abs(bbox.east - bbox.west) || 360;
    // Capped at 12 (not a lower value like 6): some high-resolution commercial imagery
    // providers (e.g. Planet) reject GetTile requests below a server-side minimum resolution
    // (e.g. "exceeds the limit 360.00 meters per pixel"), which a shallower cap would violate.
    z = Math.min(Math.max(Math.floor(Math.log2(360 / spanLon)), 0), 12);
    // A TileMatrixSet using tiles larger than the standard 256px (e.g. Planet's 512px
    // PopularWebMercator512) covers the same world extent with proportionally fewer
    // columns/rows at the same TILEMATRIX (zoom) label.
    const n = Math.max((2 ** z * 256) / (tileSize || 256), 1);
    const latRad = (centerLat * Math.PI) / 180;
    x = Math.min(Math.max(Math.floor(((centerLon + 180) / 360) * n), 0), n - 1);
    y = Math.min(
      Math.max(Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n), 0),
      n - 1,
    );
  }
  return tileUrl.replaceAll('{z}', String(z)).replaceAll('{x}', String(x)).replaceAll('{y}', String(y));
}
