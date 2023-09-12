import SphericalMercator from '@mapbox/sphericalmercator';
import axios from 'axios';

export async function getMapOverlayXYZ(
  overlayUrl,
  lat,
  lng,
  zoom,
  width,
  height,
  tileSize,
  makeReadable,
  zoomOffset,
) {
  // Some providers like Maptiler and Mapbox requires a zoom offset when tilesize is 512
  if (zoomOffset) {
    zoom = zoom + zoomOffset;
  }
  if (tileSize === undefined) {
    tileSize = 256;
  }
  const center = { x: lng, y: lat, w: width, h: height };
  const mercatorCenter = coordsFromCenter(center, zoom, tileSize);
  const coords = tileList(zoom, mercatorCenter, tileSize);
  const overlayCanvas = await stitchTiles(coords.tiles, overlayUrl, width, height, makeReadable);
  return overlayCanvas;
}

// Takes specified layer pane to get the canvas elemenet for each overlay, and returns the canvas element
export async function getGlOverlay(layerPane) {
  try {
    const canvasElement = document
      .getElementsByClassName(`leaflet-pane leaflet-${layerPane}-pane`)[0]
      .querySelector('canvas');

    return canvasElement;
  } catch (e) {
    throw new Error('No layer found with specified layerPane: ' + layerPane);
  }
}

function coordsFromCenter(center, zoom, tileSize) {
  var sm = new SphericalMercator({ size: tileSize });
  var origin = sm.px([center.x, center.y], zoom);
  center.x = origin[0];
  center.y = origin[1];
  center.w = Math.round(center.w);
  center.h = Math.round(center.h);
  return center;
}

function tileList(zoom, center, tileSize) {
  const x = center.x;
  const y = center.y;
  const w = center.w;
  const h = center.h;
  const dimensions = { x: w, y: h };
  const ts = Math.floor(tileSize);

  const centerCoordinate = {
    column: x / tileSize,
    row: y / tileSize,
    zoom: zoom,
  };

  function pointCoordinate(point) {
    const coord = {
      column: centerCoordinate.column,
      row: centerCoordinate.row,
      zoom: centerCoordinate.zoom,
    };
    coord.column += (point.x - w / 2) / ts;
    coord.row += (point.y - h / 2) / ts;
    return coord;
  }

  function coordinatePoint(coord) {
    // Return an x, y point on the map image for a given coordinate.
    if (coord.zoom !== zoom) {
      coord = coord.zoomTo(zoom);
    }
    return {
      x: w / 2 + ts * (coord.column - centerCoordinate.column),
      y: h / 2 + ts * (coord.row - centerCoordinate.row),
    };
  }

  function floorObj(obj) {
    return {
      row: Math.floor(obj.row),
      column: Math.floor(obj.column),
      zoom: obj.zoom,
    };
  }

  var maxTilesInRow = Math.pow(2, zoom);
  var tl = floorObj(pointCoordinate({ x: 0, y: 0 }));
  var br = floorObj(pointCoordinate(dimensions));
  var coords = {};
  coords.tiles = [];
  for (let column = tl.column; column <= br.column; column++) {
    for (let row = tl.row; row <= br.row; row++) {
      var c = {
        column: column,
        row: row,
        zoom: zoom,
      };
      var p = coordinatePoint(c);

      // Wrap tiles with negative coordinates.
      c.column = c.column % maxTilesInRow;
      if (c.column < 0) c.column = maxTilesInRow + c.column;

      if (c.row < 0 || c.row >= maxTilesInRow) continue;
      coords.tiles.push({
        z: c.zoom,
        x: c.column,
        y: c.row,
        px: Math.round(p.x),
        py: Math.round(p.y),
      });
    }
  }
  coords.dimensions = { x: w, y: h };
  coords.center = floorObj(centerCoordinate);
  coords.scale = 1;

  return coords;
}

async function stitchTiles(tiles, overlayUrl, width, height, makeReadable, subdomain = 'a') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const tileDrawnPromises = tiles.map((tile) => {
    return new Promise(async (resolve, reject) => {
      let overlayUrlReplaced = overlayUrl.replace('{z}', tile.z);
      overlayUrlReplaced = overlayUrlReplaced.replace('{x}', tile.x);
      overlayUrlReplaced = overlayUrlReplaced.replace('{y}', tile.y);
      overlayUrlReplaced = overlayUrlReplaced.replace('{s}', subdomain);
      const { data } = await axios.get(overlayUrlReplaced, { responseType: 'blob' });
      const img = new Image();
      img.crossOrigin = '';
      img.onload = () => {
        ctx.drawImage(img, tile.px, tile.py);
        resolve();
      };
      img.src = URL.createObjectURL(data);
    });
  });
  await Promise.all(tileDrawnPromises);

  if (makeReadable) {
    makeImageReadable(canvas, ctx);
  }

  return canvas;
}

function makeImageReadable(canvas, ctx) {
  const tgtData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = tgtData.data;
  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const grayColor = 1.7 * red;
    tgtData.data[i] = grayColor;
    tgtData.data[i + 1] = grayColor;
    tgtData.data[i + 2] = grayColor;
  }
  ctx.putImageData(tgtData, 0, 0);

  return canvas;
}
