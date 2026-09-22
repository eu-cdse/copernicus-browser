import { ExternalServer } from '../../store/slices/externalLayersSlice';

// Shared by ExternalLayers/store tests that need a minimal ExternalServer object (see #1236).
// `layers` is omitted by default, matching the post-#1236 shape of a freshly added/hydrated server
// whose layers haven't been fetched yet (see useExternalServerLayers) — pass `layers` via overrides
// for tests that need it populated.
export function makeExternalServer(id: string, overrides: Partial<ExternalServer> = {}): ExternalServer {
  return {
    id,
    name: `Server ${id}`,
    url: `https://wms.example/${id}`,
    type: 'WMS',
    ...overrides,
  };
}
