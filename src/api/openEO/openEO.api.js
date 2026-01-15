const CACHE_NAME = 'openeo-cache-v1';
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

function stringToHash(message) {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    let chr = message.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/*
 * Cleans up stale cache entries based on expiration
 */
async function cleanUpCache(cache) {
  const keys = await cache.keys();
  keys.forEach(async (request) => {
    const cachedResponse = await cache.match(request);
    if (isCacheExpired(cachedResponse)) {
      await cache.delete(request);
    }
  });
}

/*
 * Extracts data from the response based on content type
 * Returns JSON, Blob, or Text based on the content type
 */
async function getData(response) {
  const clonedResponse = response.clone();
  const contentType = clonedResponse.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return await clonedResponse.json();
  } else if (contentType && contentType.includes('application/octet-stream')) {
    return await clonedResponse.blob();
  } else if (contentType && contentType.includes('text/plain')) {
    return await clonedResponse.text();
  } else if (contentType && contentType.includes('image/png')) {
    return await clonedResponse.blob();
  } else if (contentType && contentType.includes('image/jpeg')) {
    return await clonedResponse.blob();
  } else if (contentType && contentType.includes('image/tiff')) {
    return await clonedResponse.blob();
  } else {
    throw new Error(`Unsupported content type: ${contentType}`);
  }
}

/*
 * Checks if the cache entry is expired
 */
function isCacheExpired(cachedResponse) {
  const dateHeader = cachedResponse.headers.get('cached_time');
  if (dateHeader) {
    return Number(dateHeader) + CACHE_EXPIRATION_MS < Date.now();
  }
  return false;
}

/*
 * Returns cache response if url matches
 * Checks if the cache entry is expired, returns null if expired or no match
 */
async function getCachedResponse(url) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    if (isCacheExpired(cachedResponse)) {
      await cache.delete(url);
      return null;
    }

    return cachedResponse;
  }

  return null;
}

async function fetchWithCache(url, init) {
  try {
    const hash = stringToHash(init.body);
    const cachedResponse = await getCachedResponse(url + hash);
    if (cachedResponse !== null) {
      return cachedResponse;
    }

    const response = await fetch(url, init);
    // //Store the data in cache
    const cache = await caches.open(CACHE_NAME);
    const data = await getData(response);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('cached_time', Date.now());
    cache.put(
      url + hash,
      new Response(data, {
        headers: newHeaders,
      }),
    );

    // Clean up old cache entries
    cleanUpCache(cache);
    return response;
  } catch (error) {
    throw error;
  }
}

async function getResult(processGraph, token, signal) {
  try {
    const body = JSON.stringify({
      process: { process_graph: processGraph },
    });

    const response = await fetchWithCache(global.window.API_ENDPOINT_CONFIG.OPENEO_BASEURL + '/result', {
      method: 'POST',
      body: body,
      signal: signal,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return await response.blob();
  } catch (error) {
    throw error;
  }
}

const openEOApi = {
  getResult,
};

export default openEOApi;
