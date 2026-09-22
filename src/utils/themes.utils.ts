import { DEFAULT_THEME_ID, MODE_THEMES_LIST } from '../const';
import type { ThemeListItem } from '../store/slices/themesSlice';

/**
 * Whether the built-in Default configuration is the one currently selected.
 *
 * Both halves of the check matter: theme ids are not unique across themes lists, so a user or RRD
 * instance may carry the same id as the Default theme. Only that id *within the mode themes list*
 * is the Default configuration.
 */
export const isDefaultConfigurationSelected = (
  selectedThemesListId?: string | null,
  selectedThemeId?: string | null,
): boolean => selectedThemesListId === MODE_THEMES_LIST && selectedThemeId === DEFAULT_THEME_ID;

/**
 * Whether the Default configuration is offered in the Configuration dropdown at all.
 *
 * A `themesUrl` parameter *replaces* the mode themes list rather than adding to it (see the
 * `Configurations` group in ThemeSelect), so while a URL themes list is in play there is no Default
 * entry to switch to. The user and RRD instance lists are additive and so do not affect this.
 */
export const isDefaultConfigurationReachable = (urlThemesList?: ThemeListItem[] | null): boolean =>
  !urlThemesList?.length;
