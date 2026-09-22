import axios from 'axios';
import { ExternalServer } from '../store/slices/externalLayersSlice';

const externalServicesUrl = (): string => `${import.meta.env.VITE_CDSE_BACKEND}userexternalservers`;

const authHeaders = (accessToken: string) => ({
  responseType: 'json' as const,
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// accessToken is passed in by the caller rather than read from the store here, so this module has
// no runtime dependency on `store`. It is imported by externalLayersSlice.ts, which store.js loads
// eagerly to build the root reducer — importing `store` here would create a circular dependency
// back through store.js.
export async function getExternalServersFromServer(accessToken: string): Promise<ExternalServer[]> {
  const res = await axios.get(externalServicesUrl(), authHeaders(accessToken));
  if (res.data && !Array.isArray(res.data) && !Array.isArray(res.data.items)) {
    console.warn('Unexpected external servers response shape from backend:', res.data);
  }
  return orderExternalServers(res.data?.items ?? res.data ?? []);
}

// Layers are a runtime-only cache fetched from GetCapabilities on demand (see
// useExternalServerLayers); persisting them bloated the payload and let the stored list drift from
// what the service actually offers. See #1236.
export const stripServerLayers = (servers: ExternalServer[]): ExternalServer[] =>
  servers.map(({ layers: _layers, ...service }) => service);

// `id` is a UUID, so it's stable but not chronological — sort by `addedAt` instead to render
// services in the order they were added. Array.prototype.sort is stable, so legacy servers without
// `addedAt` (added before this field existed) keep their existing relative position.
export function orderExternalServers(servers: ExternalServer[]): ExternalServer[] {
  return [...servers].sort((a, b) => (a.addedAt ?? '').localeCompare(b.addedAt ?? ''));
}

// Full-array PUT replace, same semantics as the pins backend (see Pin.utils.js's
// savePinsToBackend/removePinsFromBackend) — the entire server list is always replaced, never
// patched. Layers are stripped here so every call site can pass its server list as-is instead of
// remembering to call stripServerLayers itself.
export async function saveExternalServersToServer(
  servers: ExternalServer[],
  accessToken: string,
): Promise<void> {
  await axios.put(externalServicesUrl(), { items: stripServerLayers(servers) }, authHeaders(accessToken));
}

// Dedupes servers by normalized url+type (case-insensitive) so merging the anonymous bucket with
// backend servers on login migration never creates duplicates, including on repeated logins.
// Keeps the first occurrence, so callers should order the array with the preferred copy first.
export function dedupeExternalServers(servers: ExternalServer[]): ExternalServer[] {
  const seen = new Set<string>();
  return servers.filter((server) => {
    const key = `${server.url.trim().toLowerCase()}|${server.type.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
