import { ExternalLayersState, externalLayersSlice } from '../store/slices/externalLayersSlice';
import {
  loadPersistedExternalLayers,
  loadPersistedServers,
  clearPersistedExternalLayers,
} from './externalLayersPersistence';
import {
  getExternalServersFromServer,
  saveExternalServersToServer,
  dedupeExternalServers,
  orderExternalServers,
} from './externalServicesBackend';

// Resolves the ExternalLayersState to rehydrate the store with on app mount, including the
// anonymous-to-account migration for a freshly logged-in user (merging with, and persisting to,
// the backend before hydrating; the anonymous sessionStorage bucket is cleared only after that
// persist succeeds, so a failed migration never loses data). Kept free of `store` so the merge/
// dedupe/persist/clear/fallback sequence can be unit tested directly; App.jsx dispatches the result
// and calls markExternalLayersHydrated().
//
// Anonymous servers live in a single sessionStorage bucket (see externalLayersPersistence); logged-in
// servers live in the backend, never browser storage. Same "migrate anonymous items into the account,
// clear only after a confirmed backend persist" pattern as PinPanel.jsx's migrateAnonymousPins — keep
// the two in sync if the failure-handling semantics of one changes.
export async function resolveHydratedExternalLayers(
  isLoggedIn: boolean,
  accessToken: string | undefined,
): Promise<ExternalLayersState | undefined> {
  if (!isLoggedIn) {
    return loadPersistedExternalLayers();
  }
  try {
    const backendServers = await getExternalServersFromServer(accessToken as string);
    const anonServers = loadPersistedServers();
    let servers = backendServers;
    if (anonServers.length) {
      servers = orderExternalServers(dedupeExternalServers([...backendServers, ...anonServers]));
      await saveExternalServersToServer(servers, accessToken as string);
      clearPersistedExternalLayers();
    }
    return {
      ...externalLayersSlice.getInitialState(),
      servers,
    };
  } catch (e) {
    console.warn('Could not load external WMS servers from backend, falling back to session bucket:', e);
    return loadPersistedExternalLayers();
  }
}
