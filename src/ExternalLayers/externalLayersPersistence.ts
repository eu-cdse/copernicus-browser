import {
  externalLayersSlice,
  ExternalLayersState,
  ExternalServer,
} from '../store/slices/externalLayersSlice';

// External WMS/WMTS servers the user adds live only in Redux, which is wiped on the full-page
// Keycloak redirect during login/logout. For anonymous users we persist them to sessionStorage (no
// per-user suffix) so they survive the redirect and reloads within the tab; logged-in users' servers
// live in the backend (see hydrateExternalServers / externalServicesBackend), not browser storage.
// sessionStorage is per-tab and cleared on close, so there is no cross-user leakage and no need to
// namespace the key per user. Only the durable parts are stored; the live "active layer" render
// fields are intentionally left out so we don't hijack a URL-driven visualization on load (the user
// re-renders a layer by clicking it, the same way pins work).
const STORAGE_KEY = 'browser_external_services';

// The last WMS date the user picked, kept under its own key so it isn't tied to the server bucket.
const DATE_STORAGE_KEY = 'browser_external_wms_date';

// Same for the last SLD style the user picked from the layer's style dropdown: its own key, so the
// chosen rendering survives a reload/login redirect instead of silently reverting to the server's
// default style (see #1162).
const STYLE_STORAGE_KEY = 'browser_external_wms_style';

// The subset of the slice we persist per user. Only durable data is kept: the added servers and
// which one was last active (so reopening the panel can restore "where you left off"). The live
// active-render fields and the transient panelOpen flag are intentionally excluded. The selected
// date and style are handled separately (see DATE_STORAGE_KEY / STYLE_STORAGE_KEY) so they are not
// tied to the user.
type PersistedExternalLayers = Pick<
  ExternalLayersState,
  'servers' | 'lastActiveServerId' | 'lastActiveLayerName' | 'lastActiveLayerId'
>;

// Writes are gated on hydration so the store subscriber can't overwrite a saved bucket with empty
// initial state during the window between store creation and the one-time rehydrate on app mount.
let hydrated = false;
export function markExternalLayersHydrated(): void {
  hydrated = true;
}

// Lets other consumers (e.g. the backend-save branch of externalLayersPersistenceMiddleware) gate
// on the same hydration state so they can't PUT a pre-hydration/incomplete servers snapshot either.
export function isExternalLayersHydrated(): boolean {
  return hydrated;
}

// Test-only: resets the module-level hydration gate so tests don't depend on execution order.
export function resetExternalLayersHydratedForTests(): void {
  hydrated = false;
}

// Returns a complete ExternalLayersState to rehydrate the slice from, or undefined when there is
// nothing stored (so the slice keeps its initialState).
export function loadPersistedExternalLayers(): ExternalLayersState | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const saved = JSON.parse(raw) as Partial<PersistedExternalLayers>;
    if (!saved || !Array.isArray(saved.servers)) {
      return undefined;
    }
    return {
      ...externalLayersSlice.getInitialState(),
      servers: saved.servers,
      lastActiveServerId: saved.lastActiveServerId ?? null,
      lastActiveLayerName: saved.lastActiveLayerName ?? null,
      lastActiveLayerId: saved.lastActiveLayerId ?? null,
      // The date lives in its own key so it isn't tied to the server bucket.
      lastActiveLayerTime: sessionStorage.getItem(DATE_STORAGE_KEY),
      // Same for the selected style.
      lastActiveLayerStyle: sessionStorage.getItem(STYLE_STORAGE_KEY),
    };
  } catch {
    // Corrupt JSON or storage unavailable (e.g. iOS Safari private mode): start clean rather
    // than throwing.
    return undefined;
  }
}

// Returns just the persisted servers (or [] if nothing is stored), without the rest of the state.
// Used to read the anonymous bucket during login migration, where only the server list is needed.
export function loadPersistedServers(): ExternalServer[] {
  return loadPersistedExternalLayers()?.servers ?? [];
}

// Removes the persisted (anonymous) bucket entirely. Used to clear it after its servers have been
// successfully migrated into the account on login, so they aren't migrated again on a later login.
export function clearPersistedExternalLayers(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Could not clear persisted external WMS servers:', e);
  }
}

export function persistExternalLayers(state: ExternalLayersState): void {
  if (!hydrated) {
    return;
  }
  try {
    // Remove the key entirely when there are no servers left, so an emptied bucket doesn't linger
    // as a stray `{servers:[]}` entry (matches clearPersistedExternalLayers).
    if (!state.servers || state.servers.length === 0) {
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      const payload: PersistedExternalLayers = {
        servers: state.servers,
        lastActiveServerId: state.lastActiveServerId,
        lastActiveLayerName: state.lastActiveLayerName,
        lastActiveLayerId: state.lastActiveLayerId,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    // Persist the chosen date under its own key.
    if (state.lastActiveLayerTime) {
      sessionStorage.setItem(DATE_STORAGE_KEY, state.lastActiveLayerTime);
    } else {
      sessionStorage.removeItem(DATE_STORAGE_KEY);
    }
    // Persist the chosen style under its own key.
    if (state.lastActiveLayerStyle) {
      sessionStorage.setItem(STYLE_STORAGE_KEY, state.lastActiveLayerStyle);
    } else {
      sessionStorage.removeItem(STYLE_STORAGE_KEY);
    }
  } catch (e) {
    // Storage full (QuotaExceededError) or unavailable: degrade gracefully — the servers just
    // won't survive the next reload, rather than breaking the app.
    console.warn('Could not persist external WMS servers:', e);
  }
}
