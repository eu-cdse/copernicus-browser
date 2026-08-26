import { createSlice, createListenerMiddleware, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { ExternalLayer, TimeRange, WmsStyle } from '../../ExternalLayers/externalLayers.utils';
import {
  isExternalLayersHydrated,
  persistExternalLayers,
} from '../../ExternalLayers/externalLayersPersistence';
import { saveExternalServersToServer } from '../../ExternalLayers/externalServicesBackend';

export type ExternalServerType = 'WMS' | 'WMTS';

export interface ExternalServer {
  id: string;
  name: string;
  url: string;
  type: ExternalServerType;
  version?: string; // negotiated service version
  format?: string; // GetMap image / tile format
  infoFormat?: string; // GetFeatureInfo format, if supported
  serviceAbstract?: string;
  accessConstraints?: string;
  fees?: string;
  layers: ExternalLayer[];
}

export interface ExternalLayersState {
  servers: ExternalServer[];
  activeServerId: string | null; // which server is the selected "collection"
  activeLayerName: string | null; // which layer within that server is rendered on the map (request id)
  activeLayerId: string | null; // unique id of the active layer row (disambiguates repeated names)
  activeLayerTime: string | null; // user-selected time for the active layer's time dimension
  activeLayerStyle: string | null; // user-selected WMS style (SLD) for the active layer
  panelOpen: boolean; // whether the WMS/WMTS panel is open in the sidebar
  // Last layer the user had active. Survives clearing the active layer (e.g. when switching to a
  // Sentinel Hub collection) so the panel can restore "where you left off" on navigation back.
  lastActiveServerId: string | null;
  lastActiveLayerName: string | null;
  lastActiveLayerId: string | null;
  // The time the user had selected on the last active layer. Survives clearing the active layer so
  // the chosen date is restored (not reset to the layer default) when navigating back to the WMS
  // panel from a Sentinel Hub layer / compare / pins.
  lastActiveLayerTime: string | null;
  // Same, for the chosen style: restored instead of falling back to the layer's default style.
  lastActiveLayerStyle: string | null;
}

// `addExternalServer` accepts a server without an id (the reducer generates one),
// but callers may supply their own id to override it.
type AddExternalServerPayload = Omit<ExternalServer, 'id'> & { id?: string };

const initialState: ExternalLayersState = {
  servers: [],
  activeServerId: null,
  activeLayerName: null,
  activeLayerId: null,
  activeLayerTime: null,
  activeLayerStyle: null,
  panelOpen: false,
  lastActiveServerId: null,
  lastActiveLayerName: null,
  lastActiveLayerId: null,
  lastActiveLayerTime: null,
  lastActiveLayerStyle: null,
};

// Resolve the unique row id for a layer name within a server. When a caller (e.g. pin restore)
// only knows the request name, pick the first matching layer's id so the panel still highlights it.
const resolveLayerId = (
  server: ExternalServer | undefined,
  layerName: string | null,
  layerId?: string | null,
): string | null => {
  if (layerId) {
    return layerId;
  }
  if (!server || !layerName) {
    return null;
  }
  return server.layers?.find((l) => l.name === layerName)?.id ?? null;
};

export const externalLayersSlice = createSlice({
  name: 'externalLayers',
  initialState,
  reducers: {
    addExternalServer: (state, action: PayloadAction<AddExternalServerPayload>) => {
      const server: ExternalServer = { ...action.payload, id: action.payload.id ?? uuid() };
      state.servers = [...state.servers, server];
      state.activeServerId = server.id;
      state.activeLayerName = server.layers?.[0]?.name ?? null;
      state.activeLayerId = server.layers?.[0]?.id ?? null;
      state.activeLayerTime = null;
      state.activeLayerStyle = null;
      state.lastActiveServerId = server.id;
      state.lastActiveLayerName = state.activeLayerName;
      state.lastActiveLayerId = state.activeLayerId;
      state.lastActiveLayerTime = null;
      state.lastActiveLayerStyle = null;
    },
    removeExternalServer: (state, action: PayloadAction<string>) => {
      state.servers = state.servers.filter((s) => s.id !== action.payload);
      if (state.activeServerId === action.payload) {
        state.activeServerId = null;
        state.activeLayerName = null;
        state.activeLayerId = null;
        state.activeLayerTime = null;
        state.activeLayerStyle = null;
      }
      // Forget the remembered layer if its server was removed, so we don't try to restore it.
      if (state.lastActiveServerId === action.payload) {
        state.lastActiveServerId = null;
        state.lastActiveLayerName = null;
        state.lastActiveLayerId = null;
        state.lastActiveLayerTime = null;
        state.lastActiveLayerStyle = null;
      }
    },
    setActiveExternalLayer: (
      state,
      action: PayloadAction<{ serverId: string; layerName: string | null; layerId?: string | null }>,
    ) => {
      const server = state.servers.find((s) => s.id === action.payload.serverId);
      const layerId = resolveLayerId(server, action.payload.layerName, action.payload.layerId);
      // Re-selecting the already-active layer (an action-button click bubbling up, the collection
      // restore effect, etc.) must not discard the user's chosen time/style; only reset them when
      // the active layer actually changes.
      const isSameLayer =
        state.activeServerId === action.payload.serverId &&
        state.activeLayerId === layerId &&
        state.activeLayerName === action.payload.layerName;
      state.activeServerId = action.payload.serverId;
      state.activeLayerName = action.payload.layerName;
      state.activeLayerId = layerId;
      if (!isSameLayer) {
        state.activeLayerTime = null;
        state.lastActiveLayerTime = null;
        state.activeLayerStyle = null;
        state.lastActiveLayerStyle = null;
      }
      state.lastActiveServerId = action.payload.serverId;
      state.lastActiveLayerName = action.payload.layerName;
      state.lastActiveLayerId = layerId;
    },
    setActiveExternalServer: (state, action: PayloadAction<string>) => {
      state.activeServerId = action.payload;
      const server = state.servers.find((s) => s.id === action.payload);
      state.activeLayerName = server?.layers?.[0]?.name ?? null;
      state.activeLayerId = server?.layers?.[0]?.id ?? null;
      state.activeLayerTime = null;
      state.activeLayerStyle = null;
      state.lastActiveServerId = action.payload;
      state.lastActiveLayerName = state.activeLayerName;
      state.lastActiveLayerId = state.activeLayerId;
      state.lastActiveLayerTime = null;
      state.lastActiveLayerStyle = null;
    },
    clearActiveExternalLayer: (state) => {
      // Only clears the *active* (rendered) layer; lastActive* (incl. the chosen time and style) is
      // intentionally preserved so navigating back to the panel restores where you left off.
      state.activeServerId = null;
      state.activeLayerName = null;
      state.activeLayerId = null;
      state.activeLayerTime = null;
      state.activeLayerStyle = null;
    },
    updateServerLayers: (
      state,
      action: PayloadAction<{
        serverId: string;
        layers: ExternalLayer[];
        serviceAbstract?: string;
        accessConstraints?: string;
        fees?: string;
      }>,
    ) => {
      const { serverId, layers, serviceAbstract, accessConstraints, fees } = action.payload;
      const server = state.servers.find((s) => s.id === serverId);
      if (server) {
        server.layers = layers;
        // Only present when this update comes from a background capabilities refresh (see
        // PinPanel's pin-restore flow) — a plain layer-list merge doesn't carry service metadata
        // and must not blank out what the server already has.
        if (serviceAbstract !== undefined) {
          server.serviceAbstract = serviceAbstract;
        }
        if (accessConstraints !== undefined) {
          server.accessConstraints = accessConstraints;
        }
        if (fees !== undefined) {
          server.fees = fees;
        }
      }
    },
    setWmsPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.panelOpen = action.payload;
    },
    setActiveExternalLayerTime: (state, action: PayloadAction<string | null>) => {
      state.activeLayerTime = action.payload;
      // Remember the chosen time so it survives clearing the active layer (panel switch) and is
      // restored when the user navigates back to the WMS panel.
      state.lastActiveLayerTime = action.payload;
    },
    setActiveExternalLayerStyle: (state, action: PayloadAction<string | null>) => {
      state.activeLayerStyle = action.payload;
      // Remember the chosen style for the same reason as the time above.
      state.lastActiveLayerStyle = action.payload;
    },
    // Restore the durable parts of the slice from persisted (per-user) storage on app load. The live
    // active-render fields and the transient panelOpen flag are intentionally not restored, so we
    // don't hijack a URL-driven visualization or reopen the panel into a collapsed parent; the user
    // re-opens the panel and re-renders a layer by clicking it.
    hydrateExternalLayers: (state, action: PayloadAction<ExternalLayersState>) => {
      const persisted = action.payload;
      state.servers = persisted.servers ?? [];
      state.lastActiveServerId = persisted.lastActiveServerId ?? null;
      state.lastActiveLayerName = persisted.lastActiveLayerName ?? null;
      state.lastActiveLayerId = persisted.lastActiveLayerId ?? null;
      state.lastActiveLayerTime = persisted.lastActiveLayerTime ?? null;
      state.lastActiveLayerStyle = persisted.lastActiveLayerStyle ?? null;
    },
  },
});

export interface ActiveExternalLayer {
  server: ExternalServer;
  layerName: string;
  layerId: string;
  layerTitle: string;
  layerAbstract: string | null;
  legendUrl: string | null;
  styles: WmsStyle[] | null;
  style: string | null;
  tileUrl: string | null;
  tileSize: number | null;
  queryable: boolean;
  time: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  timeDefault: string | null;
  timeRanges: TimeRange[] | null;
}

export const selectExternalLayers = (state: { externalLayers: ExternalLayersState }): ExternalLayersState =>
  state.externalLayers;

// Memoized so it returns a stable reference when the external-layers state hasn't changed. Without
// memoization it built a new object on every store read, making the connected Map re-render on every
// unrelated dispatch (e.g. scroll position), which reloaded the external WMS tiles each time.
export const selectActiveExternalLayer = createSelector(
  [
    (state: { externalLayers: ExternalLayersState }) => state.externalLayers.servers,
    (state: { externalLayers: ExternalLayersState }) => state.externalLayers.activeServerId,
    (state: { externalLayers: ExternalLayersState }) => state.externalLayers.activeLayerName,
    (state: { externalLayers: ExternalLayersState }) => state.externalLayers.activeLayerId,
    (state: { externalLayers: ExternalLayersState }) => state.externalLayers.activeLayerTime,
    (state: { externalLayers: ExternalLayersState }) => state.externalLayers.activeLayerStyle,
  ],
  (
    servers,
    activeServerId,
    activeLayerName,
    activeLayerId,
    activeLayerTime,
    activeLayerStyle,
  ): ActiveExternalLayer | null => {
    if (!activeServerId) {
      return null;
    }
    const server = servers.find((s) => s.id === activeServerId);
    if (!server) {
      return null;
    }
    // Prefer the unique row id (disambiguates repeated names); fall back to the name and then the
    // first layer so a restored pin (which only stored the name) still resolves.
    const layer =
      (activeLayerId ? server.layers?.find((l) => l.id === activeLayerId) : null) ??
      (activeLayerName ? server.layers?.find((l) => l.name === activeLayerName) : null) ??
      server.layers?.[0] ??
      null;
    if (!layer) {
      return null;
    }
    const layerName = layer.name;
    const styles = layer.styles?.length ? layer.styles : null;
    // Per the WMS spec the first declared style is the layer's default, so fall back to it when the
    // user hasn't picked one — that keeps the picker's selection and the STYLES request param in sync.
    const style = activeLayerStyle ?? styles?.[0]?.name ?? null;
    return {
      server,
      layerName,
      layerId: layer.id,
      layerTitle: layer.title ?? layerName,
      layerAbstract: layer.abstract ?? null,
      // Each style has its own legend graphic; fall back to the layer-level default when the
      // selected style declares none (or when the layer advertises no styles at all).
      legendUrl: styles?.find((s) => s.name === style)?.legendUrl ?? layer.legendUrl ?? null,
      styles,
      style,
      tileUrl: layer.tileUrl ?? null,
      tileSize: layer.tileSize ?? null,
      queryable: layer.queryable ?? false,
      time: activeLayerTime ?? layer.timeDefault ?? null,
      timeStart: layer.timeStart ?? null,
      timeEnd: layer.timeEnd ?? null,
      timeDefault: layer.timeDefault ?? null,
      timeRanges: layer.timeRanges ?? null,
    };
  },
);

// Persists anonymous users' external servers to sessionStorage whenever this slice changes, so added
// services survive the full-page Keycloak redirect on login/logout and reloads within the tab. Lives
// with the slice (not in store.js) so the slice owns its own persistence side-effect; store.js only
// registers the middleware. Logged-in users' servers live in the backend (saved below), never browser
// storage, so we only write sessionStorage when anonymous — that also means a previous user's servers
// can't leak into a later anonymous session in the same tab. Writes are gated on the one-time
// rehydrate done on app mount (see markExternalLayersHydrated / App.jsx).
// Actions that mutate the durable `servers` array. Only these trigger a backend save — most
// externalLayers/* actions (selecting a layer, changing the time, opening the panel) are transient
// UI state that would otherwise hammer the backend on every interaction.
const SERVERS_MUTATING_ACTION_TYPES = new Set<string>([
  externalLayersSlice.actions.addExternalServer.type,
  externalLayersSlice.actions.removeExternalServer.type,
  externalLayersSlice.actions.updateServerLayers.type,
]);

export const externalLayersPersistenceMiddleware = createListenerMiddleware();
externalLayersPersistenceMiddleware.startListening({
  predicate: (action) => action.type.startsWith('externalLayers/'),
  effect: (action, api) => {
    const state = api.getState() as {
      auth?: { user?: { userdata?: { sub?: string } | null; access_token?: string } | null };
      externalLayers: ExternalLayersState;
    };
    const isLoggedIn = !!state.auth?.user?.userdata;
    // Only anonymous servers are cached in sessionStorage; logged-in servers live in the backend.
    if (!isLoggedIn) {
      persistExternalLayers(state.externalLayers);
    }

    // User-initiated add/remove in ExtraCollectionsPanel persist to the backend synchronously
    // (pessimistic: the UI change is only dispatched after the backend PUT succeeds) and tag their
    // action with meta.skipBackendSave so this fire-and-forget save doesn't issue a redundant PUT.
    const skipBackendSave = (action as { meta?: { skipBackendSave?: boolean } }).meta?.skipBackendSave;

    const accessToken = state.auth?.user?.access_token;
    if (
      !skipBackendSave &&
      isExternalLayersHydrated() &&
      isLoggedIn &&
      accessToken &&
      SERVERS_MUTATING_ACTION_TYPES.has(action.type)
    ) {
      // Fire-and-forget: a failed backend save must never break the app.
      saveExternalServersToServer(state.externalLayers.servers, accessToken).catch((e) => {
        console.warn('Could not save external WMS servers to backend:', e);
      });
    }
  },
});
