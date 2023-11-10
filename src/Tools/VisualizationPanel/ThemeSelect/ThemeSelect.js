import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Select, { components } from 'react-select';
import { t } from 'ttag';

import store, {
  notificationSlice,
  visualizationSlice,
  themesSlice,
  authSlice,
  collapsiblePanelSlice,
} from '../../../store';
import { getThemeName, usePrevious } from '../../../utils';
import { customSelectStyle } from '../../../components/CustomSelectInput/CustomSelectStyle';

import {
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  EXPIRED_ACCOUNT,
  EDUCATION_MODE,
  NOT_LOGGED_IN,
} from '../../../const';
import CollapsiblePanel from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { openLoginWindow, decodeToken, getTokenExpiration } from '../../../Auth/authHelpers';

import { CustomDropdownIndicator } from '../../../components/CustomSelectInput/CustomDropdownIndicator';

import './ThemeSelect.scss';

import { ReactComponent as MagnifierSvg } from '../../../icons/magnifier.svg';
import { ReactComponent as ChevronDown } from '../../../icons/chevron-down.svg';

const DropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <CustomDropdownIndicator {...props} magnifier={MagnifierSvg} chevronDown={ChevronDown} />
      </components.DropdownIndicator>
    )
  );
};

const createSelectOptions = (groups = []) => {
  if (!groups) {
    return null;
  }

  const options = groups
    .reduce((acc, curr) => acc.concat(curr.themesList), [])
    .map((theme) => ({ value: theme, label: getThemeName(theme) }));

  return options;
};

const getSelectedOption = (selectedThemeId, options) => {
  if (!selectedThemeId || !options) {
    return null;
  }

  return options.find((t) => t && t.value && t.value.id === selectedThemeId);
};

function ThemeSelect({
  user,
  modeThemesList,
  userInstancesThemesList,
  urlThemesList,
  selectedThemeId,
  selectedThemesListId,
  selectedModeId,
  onHighlightsButtonClick,
  highlightsAvailable,
  isAdvancedTabActive,
  visualizationDate,
  showHighlights,
  setShowHighlights,
  themePanelExpanded,
}) {
  const previousVisualizationDate = usePrevious(visualizationDate);

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

  urlThemesList = urlThemesList.map((t) => ({ ...t, list: URL_THEMES_LIST }));
  userInstancesThemesList = userInstancesThemesList.map((t) => ({
    ...t,
    list: USER_INSTANCES_THEMES_LIST,
  }));
  if (!user) {
    userInstancesThemesList.push({
      name: NOT_LOGGED_IN.errorMessage,
      id: NOT_LOGGED_IN.instanceId,
      content: [],
      list: USER_INSTANCES_THEMES_LIST,
    });
  }
  modeThemesList = modeThemesList.map((t) => ({ ...t, list: MODE_THEMES_LIST }));

  const isEducationModeSelected = selectedModeId === EDUCATION_MODE.id;

  let options;

  if (isEducationModeSelected) {
    options = createSelectOptions([
      { label: 'Public themes', themesList: modeThemesList },
      { label: 'User themes', themesList: userInstancesThemesList },
    ]);
  } else if (urlThemesList.length) {
    options = createSelectOptions([
      { label: 'Public themes', themesList: urlThemesList },
      { label: 'User themes', themesList: userInstancesThemesList },
    ]);
  } else {
    options = createSelectOptions([
      { label: 'Public themes', themesList: modeThemesList },
      { label: 'User themes', themesList: userInstancesThemesList },
    ]);
  }

  async function handleSelectTheme(selected) {
    const theme = selected.value;
    const { id: themeId, list: selectedThemesListId } = theme;
    if (themeId === selectedThemeId) {
      return;
    }
    if (themeId === NOT_LOGGED_IN.instanceId) {
      const token = await openLoginWindow();
      const decodedToken = decodeToken(token);
      store.dispatch(
        authSlice.actions.setUser({
          userdata: decodedToken,
          access_token: token.access_token,
          token_expiration: getTokenExpiration(token),
        }),
      );
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
    setShowHighlights(false);
  }

  const themePanelContent = () => (isExpanded) => {
    if (!isExpanded) {
      return null;
    }

    return (
      <div id="theme-select" className={`top ${selectedThemeId ? '' : 'blue-border'}`}>
        {!selectedThemeId && <div className="no-theme-message">{t`Please select a configuration`}:</div>}
        <div className="theme-select-highlights-wrapper">
          <div className="theme-label-select-wrapper">{themeSelectionDropdown()}</div>
        </div>
      </div>
    );
  };

  const themeSelectionDropdown = () => (
    <div className="theme-search">
      <div className="theme-search-header">
        <div className="theme-selection">
          <Select
            value={getSelectedOption(selectedThemeId, options)}
            options={options}
            placeholder={t`No configuration selected`}
            onChange={handleSelectTheme}
            styles={customSelectStyle}
            menuPosition="fixed"
            menuShouldBlockScroll={true}
            className="theme-select-dropdown"
            classNamePrefix="theme-select"
            components={{ DropdownIndicator }}
          />
        </div>
      </div>
      {!themePanelExpanded ? themeHighlightsToggle() : null}
    </div>
  );

  const themeHeaderCollapsed = () => (
    <>
      <div className="title-text">{t`Configurations:`}</div>
      {themeHighlightsToggle()}
    </>
  );
  const themeHighlightsToggle = () =>
    highlightsAvailable && (
      <div
        className={`highlights-toggle ${showHighlights ? 'active' : ''}`}
        onClick={() => {
          setShowHighlights(!showHighlights);
        }}
      >
        Highlights
      </div>
    );

  return (
    <CollapsiblePanel
      title={themeSelectionDropdown()}
      headerComponent={themeHeaderCollapsed()}
      expanded={themePanelExpanded}
      toggleExpanded={(v) => store.dispatch(collapsiblePanelSlice.actions.setThemePanelExpanded(v))}
      className="theme-select-container"
    >
      {themePanelContent()}
    </CollapsiblePanel>
  );
}

const mapStoreToProps = (store) => ({
  user: store.auth.user.userdata,
  selectedModeId: store.themes.selectedModeId,
  selectedThemeId: store.themes.selectedThemeId,
  modeThemesList: store.themes.themesLists[MODE_THEMES_LIST],
  userInstancesThemesList: store.themes.themesLists[USER_INSTANCES_THEMES_LIST],
  urlThemesList: store.themes.themesLists[URL_THEMES_LIST],
  themesLists: store.themes.themesLists,
  selectedThemesListId: store.themes.selectedThemesListId,
  selectedLanguage: store.language.selectedLanguage,
  visualizationDate: store.visualization.toTime,
  themePanelExpanded: store.collapsiblePanel.themePanelExpanded,
});

export default connect(mapStoreToProps, null)(ThemeSelect);
