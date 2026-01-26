import SphericalMercator from '@mapbox/sphericalmercator';
import axios from 'axios';

const TILE_CACHE_NAME = 'XYZ-tile-cache-v1';
const TILE_CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/*
 * Cleans up stale cache entries based on expiration
 */
async function cleanUpTileCache(cache) {
  const keys = await cache.keys();
  keys.forEach(async (request) => {
    const cachedResponse = await cache.match(request);
    if (isTileCacheExpired(cachedResponse)) {
      await cache.delete(request);
    }
  });
}

/*
 * Checks if the cache entry is expired
 */
function isTileCacheExpired(cachedResponse) {
  if (!cachedResponse) {
    return true;
  }

  const dateHeader = cachedResponse.headers.get('cached_time');
  if (dateHeader) {
    return Number(dateHeader) + TILE_CACHE_EXPIRATION_MS < Date.now();
  }
  return false;
}

/*
 * Returns cache response if url matches
 * Checks if the cache entry is expired, returns null if expired or no match
 */
async function getCachedTileResponse(url) {
  const cache = await caches.open(TILE_CACHE_NAME);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    if (isTileCacheExpired(cachedResponse)) {
      await cache.delete(url);
      return null;
    }
    return cachedResponse;
  }

  return null;
}

/*
 * Fetches tile with caching using browser Cache API
 */
async function fetchTileWithCache(url, axiosConfig) {
  try {
    const cachedResponse = await getCachedTileResponse(url);
    if (cachedResponse !== null) {
      // Return cached blob
      return await cachedResponse.blob();
    }

    // Fetch new tile
    const response = await axios.get(url, axiosConfig);
    const blob = response.data;

    // Store the blob in cache
    const cache = await caches.open(TILE_CACHE_NAME);
    const newHeaders = new Headers();
    newHeaders.set('cached_time', Date.now().toString());
    newHeaders.set('Content-Type', response.headers['content-type'] || 'image/png');

    cache.put(
      url,
      new Response(blob, {
        headers: newHeaders,
      }),
    );

    // Clean up old cache entries (don't await to avoid blocking)
    cleanUpTileCache(cache).catch((err) => console.warn('Cache cleanup error:', err));

    return blob;
  } catch (error) {
    throw new Error(`Failed to fetch tile from ${url}: ${error.message}`);
  }
}

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

export async function getMapOverlayXYZ(
  overlayUrl,
  bounds,
  zoom = null,
  width,
  height,
  tileSize = 256,
  makeReadable = false,
  zoomOffset = 0,
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const merc = new SphericalMercator({ size: tileSize });

  // bounds
  const sw = [bounds._southWest.lng, bounds._southWest.lat];
  const ne = [bounds._northEast.lng, bounds._northEast.lat];

  let effectiveZoom = zoom;
  if (effectiveZoom === null) {
    const latSpan = ne[1] - sw[1];
    const lngSpan = Math.abs(ne[0] - sw[0]);
    const latZoom = Math.log2((360 * height) / (latSpan * tileSize));
    const lngZoom = Math.log2((360 * width) / (lngSpan * tileSize));
    const initialZoom = Math.min(latZoom, lngZoom);

    const maxZoom = 19; // Maximum zoom for most tile providers
    effectiveZoom = Math.min(maxZoom, Math.max(0, Math.floor(initialZoom)));
  }

  // Apply zoom offset if provided (for providers like Maptiler)
  if (zoomOffset) {
    effectiveZoom += zoomOffset;
  }

  // Convert bounds to pixel coordinates
  const swPx = merc.px(sw, effectiveZoom);
  const nePx = merc.px(ne, effectiveZoom);

  // Calculate pixel spans
  const pxWidth = Math.abs(nePx[0] - swPx[0]);
  const pxHeight = Math.abs(swPx[1] - nePx[1]);

  // Calculate scaling factors to fit the canvas
  const scaleX = width / pxWidth;
  const scaleY = height / pxHeight;

  // Then calculate which tiles are needed to cover these pixel coordinates
  // Using Math.floor/ceil ensures we include all tiles that intersect our bounds
  const swTile = [
    Math.floor(Math.min(swPx[0], nePx[0]) / tileSize),
    Math.floor(Math.min(swPx[1], nePx[1]) / tileSize),
  ];
  const neTile = [
    Math.ceil(Math.max(swPx[0], nePx[0]) / tileSize),
    Math.ceil(Math.max(swPx[1], nePx[1]) / tileSize),
  ];

  // Limit the max number of tiles to prevent excessive loading
  const maxTiles = 100;
  const tileCountX = neTile[0] - swTile[0];
  const tileCountY = neTile[1] - swTile[1];

  const tilesX = Math.min(tileCountX, Math.ceil(maxTiles / Math.max(1, tileCountY)));
  const tilesY = Math.min(tileCountY, Math.ceil(maxTiles / Math.max(1, tilesX)));

  const tileCoords = [];
  for (let x = swTile[0]; x < swTile[0] + tilesX; x++) {
    for (let y = swTile[1]; y < swTile[1] + tilesY; y++) {
      tileCoords.push([x, y]);
    }
  }

  const processTile = generateProcessTileFunction(
    ctx,
    overlayUrl,
    effectiveZoom,
    tileSize,
    scaleX,
    scaleY,
    swPx,
    nePx,
    width,
    height,
  );

  const tilePromises = tileCoords.map(processTile).filter(Boolean);
  await Promise.all(tilePromises);

  if (makeReadable) {
    makeImageReadable(canvas, ctx);
  }

  return canvas;
}

const generateProcessTileFunction =
  (ctx, overlayUrl, effectiveZoom, tileSize, scaleX, scaleY, swPx, nePx, width, height) =>
  ([x, y]) => {
    // Handle tile coordinate wrapping for longitude
    const wrappedX =
      ((x % Math.pow(2, effectiveZoom)) + Math.pow(2, effectiveZoom)) % Math.pow(2, effectiveZoom);

    // Skip tiles outside valid range for latitude
    if (y < 0 || y >= Math.pow(2, effectiveZoom)) {
      return null;
    }

    // Calculate position of this tile in pixel space
    const tilePxX = x * tileSize;
    const tilePxY = y * tileSize;

    // Calculate position on canvas
    const canvasX = (tilePxX - Math.min(swPx[0], nePx[0])) * scaleX;
    const canvasY = (tilePxY - Math.min(swPx[1], nePx[1])) * scaleY;
    const canvasWidth = tileSize * scaleX;
    const canvasHeight = tileSize * scaleY;

    // Only process tiles that would be visible
    if (canvasX + canvasWidth <= 0 || canvasX >= width || canvasY + canvasHeight <= 0 || canvasY >= height) {
      return null;
    }

    return (async () => {
      try {
        let formattedUrl = overlayUrl
          .replace('{z}', effectiveZoom)
          .replace('{x}', wrappedX)
          .replace('{y}', y);

        // Handle subdomain rotation
        if (formattedUrl.includes('{s}')) {
          const subdomains = ['a', 'b', 'c'];
          formattedUrl = formattedUrl.replace('{s}', subdomains[(x + y) % subdomains.length]);
        }

        const response = await fetchTileWithCache(formattedUrl, {
          responseType: 'blob',
          timeout: 5000,
        });

        const blobUrl = URL.createObjectURL(response);

        // Return a Promise only for the callback-based image loading
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = () => {
            ctx.drawImage(img, canvasX, canvasY, canvasWidth, canvasHeight);
            URL.revokeObjectURL(blobUrl);
            resolve();
          };

          img.onerror = () => {
            console.warn(`Failed to load tile at zoom ${effectiveZoom}, x=${wrappedX}, y=${y}`);
            URL.revokeObjectURL(blobUrl);
            resolve();
          };

          img.src = blobUrl;
        });
      } catch (error) {
        console.warn(`Error fetching tile: ${error.message}`);
      }
    })();
  };

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
