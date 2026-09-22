import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  MODES,
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  DEFAULT_THEME_ID,
  RRD_INSTANCES_THEMES_LIST,
} from '../../const';
import { isDefaultConfigurationReachable } from '../../utils/themes.utils';

// TODO: replace with a typed Theme interface once one is defined
// The raw theme shape is currently untyped across the codebase; a dedicated interface is out of scope for this MR.
export type ThemeListItem = Record<string, unknown> & { id: string };

export interface ThemesState {
  themesUrl: string | null;
  themesLists: Record<string, ThemeListItem[]>;
  selectedThemesListId?: string | null;
  dataSourcesInitialized: boolean;
  dataSourcesReadyVersion: number;
  dataSourcesLoading: boolean;
  selectedThemeId?: string | null;
  selectedModeId?: string;
  failedThemeParts: string[];
  useEvoland: boolean;
  currentProjectName?: string | null;
}

interface SetSelectedThemeIdPayload {
  selectedThemeId?: string | null;
  selectedThemesListId?: string;
}

interface SetSelectedThemeIdAndModeIdPayload {
  selectedThemeId?: string | null;
  selectedModeId?: string;
  selectedThemesListId?: string;
}

const initialState: ThemesState = {
  themesUrl: null,
  themesLists: {
    [MODE_THEMES_LIST]: [],
    [USER_INSTANCES_THEMES_LIST]: [],
    [URL_THEMES_LIST]: [],
    [RRD_INSTANCES_THEMES_LIST]: [],
  },
  selectedThemesListId: null,
  dataSourcesInitialized: false,
  dataSourcesReadyVersion: 0,
  dataSourcesLoading: false,
  selectedThemeId: undefined,
  selectedModeId: undefined,
  failedThemeParts: [],
  useEvoland: false,
  currentProjectName: undefined,
};

export const themesSlice = createSlice({
  name: 'themes',
  initialState,
  reducers: {
    setSelectedModeId: (state, action: PayloadAction<string>) => {
      state.selectedModeId = action.payload;
    },
    setSelectedModeIdAndDefaultTheme: (state, action: PayloadAction<string>) => {
      state.selectedModeId = action.payload;
      const mode = MODES.find((mode) => mode.id === state.selectedModeId);
      if (!mode) {
        throw new Error(`Unknown mode id: ${state.selectedModeId}`);
      }
      const modeThemes = mode.themes;
      state.themesLists[MODE_THEMES_LIST] = modeThemes;

      // Same themesUrl-replaces-the-mode-list rule as setSelectedThemeId below.
      if (!isDefaultConfigurationReachable(state.themesLists[URL_THEMES_LIST])) {
        const firstThemeIdInList = state.themesLists[URL_THEMES_LIST][0].id;
        state.selectedThemeId = firstThemeIdInList;
        state.selectedThemesListId = URL_THEMES_LIST;
      } else {
        const firstThemeIdInList = modeThemes[0].id;
        state.selectedThemeId = firstThemeIdInList;
        state.selectedThemesListId = MODE_THEMES_LIST;
      }
    },
    setDataSourcesInitialized: (state, action: PayloadAction<boolean>) => {
      state.dataSourcesInitialized = action.payload;
    },
    bumpDataSourcesReadyVersion: (state) => {
      state.dataSourcesReadyVersion += 1;
    },
    setDataSourcesLoading: (state, action: PayloadAction<boolean>) => {
      state.dataSourcesLoading = action.payload;
    },
    setThemesUrl: (state, action: PayloadAction<string | null>) => {
      state.themesUrl = action.payload;
    },
    setModeThemesList: (state, action: PayloadAction<ThemeListItem[]>) => {
      state.themesLists[MODE_THEMES_LIST] = action.payload;
    },
    setUserInstancesThemesList: (state, action: PayloadAction<ThemeListItem[]>) => {
      state.themesLists[USER_INSTANCES_THEMES_LIST] = action.payload;
    },
    setUrlThemesList: (state, action: PayloadAction<ThemeListItem[]>) => {
      state.themesLists[URL_THEMES_LIST] = action.payload;
    },
    setRRDThemesList: (state, action: PayloadAction<ThemeListItem[]>) => {
      state.themesLists[RRD_INSTANCES_THEMES_LIST] = action.payload;
    },
    setSelectedThemeId: (state, action: PayloadAction<SetSelectedThemeIdPayload>) => {
      // - if selectedThemesList is supplied, check the combination and set both selectedThemesList and selectedThemeId
      // - else, find the theme with themeId and set selectedTheme according to this
      const { selectedThemeId, selectedThemesListId } = action.payload;
      const previousThemeId = state.selectedThemeId;
      const previousThemesListId = state.selectedThemesListId;

      if (selectedThemesListId) {
        state.selectedThemeId = selectedThemeId;
        state.selectedThemesListId = selectedThemesListId;
      } else {
        if (state.themesLists[USER_INSTANCES_THEMES_LIST].find((t) => t.id === selectedThemeId)) {
          state.selectedThemesListId = USER_INSTANCES_THEMES_LIST;
          state.selectedThemeId = selectedThemeId;
        } else {
          const isThemeInUrlThemesList = !!state.themesLists[URL_THEMES_LIST].find(
            (t) => t.id === selectedThemeId,
          );
          const isThemeInModeThemesList = !!state.themesLists[MODE_THEMES_LIST].find(
            (t) => t.id === selectedThemeId,
          );

          // A themesUrl replaces the mode themes list rather than adding to it, so while one is in
          // play the id can only resolve against it — shared with ThemeSelect, ThemesProvider and
          // CollectionSelection.
          if (!isDefaultConfigurationReachable(state.themesLists[URL_THEMES_LIST])) {
            if (isThemeInUrlThemesList) {
              state.selectedThemesListId = URL_THEMES_LIST;
              state.selectedThemeId = selectedThemeId;
            } else {
              state.selectedThemesListId = URL_THEMES_LIST;
              state.selectedThemeId = null;
            }
          } else if (isThemeInModeThemesList) {
            state.selectedThemesListId = MODE_THEMES_LIST;
            state.selectedThemeId = selectedThemeId;
          } else {
            state.selectedThemesListId = MODE_THEMES_LIST;
            state.selectedThemeId = null;
          }
        }
      }
      state.failedThemeParts = [];
      if (state.selectedThemeId !== previousThemeId || state.selectedThemesListId !== previousThemesListId) {
        state.dataSourcesReadyVersion = 0;
        state.dataSourcesLoading = false;
      }
    },
    setFailedThemeParts: (state, action: PayloadAction<string[]>) => {
      state.failedThemeParts = action.payload;
    },
    setSelectedThemeIdAndModeId: (state, action: PayloadAction<SetSelectedThemeIdAndModeIdPayload>) => {
      const { selectedThemeId, selectedModeId, selectedThemesListId } = action.payload;
      state.dataSourcesInitialized =
        selectedModeId === state.selectedModeId && selectedThemeId === state.selectedThemeId;
      if (!state.dataSourcesInitialized) {
        state.dataSourcesReadyVersion = 0;
        state.dataSourcesLoading = false;
      }
      state.selectedThemeId = selectedThemeId;
      const mode = MODES.find((mode) => mode.id === selectedModeId);
      if (!mode) {
        throw new Error(`Unknown mode id: ${selectedModeId}`);
      }
      const modeThemes = mode.themes;
      state.themesLists[MODE_THEMES_LIST] = modeThemes;
      state.selectedModeId = selectedModeId;
      state.selectedThemesListId = selectedThemesListId;
    },
    setCurrentProjectName(state, action: PayloadAction<string | undefined>) {
      state.currentProjectName = action.payload;
    },
    setUseEvoland: (state, action: PayloadAction<boolean>) => {
      state.useEvoland = action.payload;
    },
    reset: (state) => {
      state.themesUrl = null;
      state.selectedThemesListId = 'mode';
      state.dataSourcesInitialized = true;
      state.dataSourcesReadyVersion = 0;
      state.dataSourcesLoading = false;
      state.selectedThemeId = DEFAULT_THEME_ID;
      state.selectedModeId = 'default';
      state.failedThemeParts = [];
      state.currentProjectName = null;
      state.useEvoland = false;
    },
  },
});
