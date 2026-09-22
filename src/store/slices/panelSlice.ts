import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PANEL } from '../../const';

// Single source of truth for "which Visualize sub-panel is open" — Layers, Highlights, Pins,
// Compare and WMS used to be split across App.jsx's own React state (the first three) and Redux
// (WMS, via externalLayersSlice.panelOpen), which meant every call site opening WMS also had to
// remember to manually close the others (see MR !1226 review). COMPARE can't be restored from a
// flat URL string like PANEL's other values (see const.ts), but it's still one of the five
// mutually-exclusive panels tracked here.
export type PanelKey = (typeof PANEL)[keyof typeof PANEL];

type PanelState = Record<PanelKey, boolean>;

const ALL_PANEL_KEYS: PanelKey[] = [PANEL.LAYERS, PANEL.HIGHLIGHTS, PANEL.PINS, PANEL.WMS, PANEL.COMPARE];

const initialState: PanelState = {
  [PANEL.LAYERS]: true,
  [PANEL.HIGHLIGHTS]: false,
  [PANEL.PINS]: false,
  [PANEL.WMS]: false,
  [PANEL.COMPARE]: false,
};

export const panelSlice = createSlice({
  name: 'panel',
  initialState,
  reducers: {
    // Opens exactly one panel, closing all the others — the single place enforcing the "only one
    // panel open at a time" invariant, so callers never need to pair this with manually closing
    // the rest.
    openPanel: (state, action: PayloadAction<PanelKey>) => {
      ALL_PANEL_KEYS.forEach((key) => {
        state[key] = key === action.payload;
      });
    },
    closePanel: (state, action: PayloadAction<PanelKey>) => {
      state[action.payload] = false;
    },
  },
});

// Shared "another Visualize sub-panel is already showing" predicate — Tools.jsx's RRD-tab
// auto-switch guard, ThemeSelect.jsx's highlights-availability auto-open effect, and
// VisualizationTimeSelect.jsx's openLayerPanel each independently checked their own subset of
// Pins/Compare/WMS before deciding whether to override the visible panel, which duplicated the
// same invariant panelSlice exists to centralize (issue #1184 review round 1). Takes plain
// booleans rather than full Redux state because callers only have some of these three available
// as props (e.g. Tools.jsx has no wms prop) — pass whichever apply.
export const isAnotherVisualizePanelOpen = ({
  pins,
  compare,
  wms,
}: {
  pins?: boolean;
  compare?: boolean;
  wms?: boolean;
}) => Boolean(pins || compare || wms);
