import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { t } from 'ttag';

import store, {
  notificationSlice,
  visualizationSlice,
  themesSlice,
  collapsiblePanelSlice,
} from '../../../store';
import { isAnotherVisualizePanelOpen } from '../../../store/slices/panelSlice';
import { getThemeName } from '../../../utils';
import { isDefaultConfigurationReachable } from '../../../utils/themes.utils';
import { usePrevious } from '../../../hooks/usePrevious';
import { customSelectStyle } from '../../../components/CustomSelectInput/CustomSelectStyle';

import {
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  EXPIRED_ACCOUNT,
  NOT_LOGGED_IN,
  RRD_INSTANCES_THEMES_LIST,
} from '../../../const';

import { CustomDropdownIndicator } from '../../../components/CustomSelectInput/CustomDropdownIndicator';
import CollectionTooltip from '../CollectionSelection/CollectionTooltip/CollectionTooltip';
import { getConfigurationMarkdown } from './ThemeSelectTooltip';

import './ThemeSelect.scss';

import useLoginLogout from '../../../Auth/loginLogout/useLoginLogout';

const createSelectOptions = (options = []) =>
  options.map((option) => ({ value: option, label: getThemeName(option) }));

const getSelectedOption = (selectedThemeId, groupedOptions) => {
  if (!selectedThemeId || !groupedOptions) {
    return null;
  }

  return groupedOptions.map((groupedOption) =>
    groupedOption.options.find((t) => t?.value?.id === selectedThemeId),
  );
};

function ThemeSelect({
  user,
  modeThemesList,
  userInstancesThemesList,
  rrdInstancesThemesList,
  urlThemesList,
  selectedThemeId,
  visualizationDate,
  setShowLayerPanel,
  setShowHighlightPanel,
  highlightsAvailable,
  compareShare,
  showPinPanel,
  showComparePanel,
  wmsPanelOpen,
  panelFromUrlParams,
}) {
  const previousVisualizationDate = usePrevious(visualizationDate);
  const { doLogin } = useLoginLogout();
  useEffect(() => {
    if (selectedThemeId === EXPIRED_ACCOUNT.instanceId) {
      store.dispatch(
        notificationSlice.actions.displayPanelError({
          message: EXPIRED_ACCOUNT.errorMessage,
          link: EXPIRED_ACCOUNT.errorLink,
        }),
      );
    }
  }, [selectedThemeId]);

  useEffect(() => {
    if (!previousVisualizationDate && visualizationDate) {
      store.dispatch(collapsiblePanelSlice.actions.setThemePanelExpanded(false));
    }
    // eslint-disable-next-line
  }, [visualizationDate]);

  // Skips its very first run when the URL explicitly named a panel (layers/highlights/pins/wms —
  // see PANEL in const.ts), so it never fights what URLParamsParser's setStore already restored at
  // mount by dispatching panelSlice.actions.openPanel from that `panel` URL param (e.g. Layers restored
  // via `panel=layers`,
  // but this theme's `pins` metadata resolves moments later once ThemesProvider finishes loading,
  // flipping highlightsAvailable to true and forcing Highlights open instead). With no explicit
  // panel in the URL (a bare/first-time visit), the first run proceeds as before so a non-default
  // theme with highlights still opens straight into Highlights. Once mounted, this effect exists to
  // catch highlightsAvailable resolving/changing for a genuine theme change — either a fresh value
  // after handleSelectTheme's own direct call below used a stale one, or a theme switch triggered
  // elsewhere (ThemesProvider, PinPanel, AdvancedSearch, RRD results).
  const skipFirstHighlightsAvailableRunRef = useRef(panelFromUrlParams !== undefined);
  // Once this effect has auto-opened Highlights for a resolved theme, it stops doing so again on
  // its own: without this lock, a later re-render that recomputes the same highlightsAvailable
  // transition (e.g. ThemesProvider's fetchUserInstances/getRRDInstances finishing late while the
  // user has since navigated to another tab and manually switched back to Layers) forces Highlights
  // open again, silently discarding the user's manual choice the moment they return to Visualize
  // (see issue #1184 follow-up). Forcing Layers when highlights become unavailable stays unlocked,
  // since staying on a Highlights panel that no longer applies would be actively broken.
  const hasAutoOpenedHighlightsRef = useRef(false);
  useEffect(() => {
    if (skipFirstHighlightsAvailableRunRef.current) {
      skipFirstHighlightsAvailableRunRef.current = false;
      return;
    }
    if (highlightsAvailable && hasAutoOpenedHighlightsRef.current) {
      return;
    }
    // Skip if the Pins, Compare, or WMS panel is already showing (e.g. a shared-pins link import
    // just switched to the Pins panel) — otherwise this would immediately switch back to
    // Layers/Highlights.
    if (
      !compareShare &&
      !isAnotherVisualizePanelOpen({ pins: showPinPanel, compare: showComparePanel, wms: wmsPanelOpen })
    ) {
      if (highlightsAvailable) {
        setShowHighlightPanel(true);
        hasAutoOpenedHighlightsRef.current = true;
      } else {
        setShowLayerPanel(true);
      }
    }
    // eslint-disable-next-line
  }, [highlightsAvailable]);

  urlThemesList = urlThemesList.map((t) => ({ ...t, list: URL_THEMES_LIST }));
  modeThemesList = modeThemesList.map((t) => ({ ...t, list: MODE_THEMES_LIST }));
  userInstancesThemesList = userInstancesThemesList.map((t) => ({
    ...t,
    list: USER_INSTANCES_THEMES_LIST,
  }));

  rrdInstancesThemesList = rrdInstancesThemesList.map((t) => ({
    ...t,
    list: RRD_INSTANCES_THEMES_LIST,
  }));

  if (!user) {
    userInstancesThemesList.push({
      name: NOT_LOGGED_IN.errorMessage,
      id: NOT_LOGGED_IN.instanceId,
      content: [],
      list: USER_INSTANCES_THEMES_LIST,
    });
  }

  const groupedOptions = [
    {
      label: t`Configurations`,
      // A themesUrl replaces the mode themes list here rather than adding to it, which is what
      // makes the Default configuration unreachable. CollectionSelection reads the same rule to
      // decide whether it may advise switching back to Default (issue #1221).
      options: createSelectOptions(
        isDefaultConfigurationReachable(urlThemesList) ? modeThemesList : urlThemesList,
      ),
    },
    { label: t`User configurations`, divider: true, options: createSelectOptions(userInstancesThemesList) },
    { label: t`RRD configurations`, divider: true, options: createSelectOptions(rrdInstancesThemesList) },
  ];

  async function handleSelectTheme(selected) {
    const theme = selected.value;
    const { id: themeId, list: selectedThemesListId } = theme;
    if (themeId === selectedThemeId) {
      return;
    }
    if (themeId === NOT_LOGGED_IN.instanceId) {
      await doLogin();
      return;
    }
    if (themeId === EXPIRED_ACCOUNT.instanceId) {
      store.dispatch(
        notificationSlice.actions.displayPanelError({
          message: EXPIRED_ACCOUNT.errorMessage,
          link: EXPIRED_ACCOUNT.errorLink,
        }),
      );
    } else {
      store.dispatch(notificationSlice.actions.displayPanelError(null));
    }
    store.dispatch(
      themesSlice.actions.setSelectedThemeId({
        selectedThemeId: themeId,
        selectedThemesListId: selectedThemesListId,
      }),
    );
    store.dispatch(visualizationSlice.actions.reset());
    store.dispatch(collapsiblePanelSlice.actions.setDatePanelExpanded(false));

    highlightsAvailable ? setShowHighlightPanel(true) : setShowLayerPanel(true);
  }

  const themesGroupLabel = ({ label }) => <span>{label}</span>;

  const themeSelectionDropdown = () => (
    <div className="theme-search">
      <div className="theme-search-header">
        <div className="theme-selection">
          <Select
            value={getSelectedOption(selectedThemeId, groupedOptions)}
            options={groupedOptions}
            formatGroupLabel={themesGroupLabel}
            placeholder={t`No configuration selected`}
            onChange={handleSelectTheme}
            styles={customSelectStyle}
            menuPosition="fixed"
            menuShouldBlockScroll={true}
            className="theme-select-dropdown"
            classNamePrefix="theme-select"
            components={{ DropdownIndicator: CustomDropdownIndicator }}
            isSearchable={true}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="theme-select-panel-wrapper">
      <div className="theme-title">{t`Configuration`}:</div>

      <div id="theme-select" className={`top ${selectedThemeId ? '' : 'blue-border'}`}>
        <div className="theme-select-highlights-wrapper">
          <div className="theme-label-select-wrapper">{themeSelectionDropdown()}</div>
          <CollectionTooltip source={getConfigurationMarkdown()} className="theme-config-tooltip" />
        </div>
      </div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  user: store.auth.user.userdata,
  selectedThemeId: store.themes.selectedThemeId,
  modeThemesList: store.themes.themesLists[MODE_THEMES_LIST],
  userInstancesThemesList: store.themes.themesLists[USER_INSTANCES_THEMES_LIST],
  rrdInstancesThemesList: store.themes.themesLists['RRD'],
  urlThemesList: store.themes.themesLists[URL_THEMES_LIST],
  themesLists: store.themes.themesLists,
  selectedLanguage: store.language.selectedLanguage,
  visualizationDate: store.visualization.toTime,
  themePanelExpanded: store.collapsiblePanel.themePanelExpanded,
  wmsPanelOpen: store.panel.wms,
});

export default connect(mapStoreToProps, null)(ThemeSelect);
