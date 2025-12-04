import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { t } from 'ttag';

import store, {
  notificationSlice,
  visualizationSlice,
  themesSlice,
  collapsiblePanelSlice,
} from '../../../store';
import { getThemeName } from '../../../utils';
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

  useEffect(() => {
    if (!compareShare) {
      highlightsAvailable ? setShowHighlightPanel(true) : setShowLayerPanel(true);
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
      options: createSelectOptions(!urlThemesList.length ? modeThemesList : urlThemesList),
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
    store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(false));

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
});

export default connect(mapStoreToProps, null)(ThemeSelect);
