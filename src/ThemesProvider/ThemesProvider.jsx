import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { t } from 'ttag';
import AlertProvider, { confirm } from 'react-alert-async';

import store, { notificationSlice, themesSlice, visualizationSlice, modalSlice } from '../store';
import {
  prepareDataSourceHandlers,
  initializeDataSourceHandlers,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  DEFAULT_THEME_ID,
  MODE_THEMES_LIST,
  URL_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  DEFAULT_MODE,
  MODES,
  EXPIRED_ACCOUNT,
  ModalId,
  RRD_INSTANCES_THEMES_LIST,
} from '../const';
import { isInGroup, logoutUser, openLogin } from '../Auth/authHelpers';

import 'react-alert-async/dist/index.css';
import './ThemesProvider.scss';
import { RRD_GROUP } from '../api/RRD/assets/rrd.utils';
import { RRD_THEMES } from '../assets/cache/rrdThemes';
import { doesUserHaveAccessToCCMVisualization } from '../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';
import { rrdApi } from '../api/RRD/RRDApi';

const DEFAULT_SELECTED_MODE = import.meta.env.VITE_DEFAULT_MODE_ID
  ? MODES.find((mode) => mode.id === import.meta.env.VITE_DEFAULT_MODE_ID)
  : DEFAULT_MODE;

const EXCLUDED_CONFIG_NAMES_FOR_USERS_WITHOUT_ACCESS = [
  'CCM VHR Europe 2018',
  'CCM VHR Europe 2021',
  'CCM VHR Europe 2024',
];

function getAllowedIdentifiersForProject(identifier) {
  const allowed = ['GENERAL'];
  if (identifier === 'FRTX') {
    allowed.push('FRTX');
  } else if (identifier === 'CSESA') {
    allowed.push('CSESA');
  }
  return allowed;
}

function filterRrdThemesByIdentifier(themes, identifier) {
  const allowed = getAllowedIdentifiersForProject(identifier);
  return themes
    .map((theme) => ({
      ...theme,
      content: theme.content.filter((item) => allowed.some((key) => item.name.includes(key))),
    }))
    .filter((theme) => theme.content.length > 0);
}

class ThemesProvider extends React.Component {
  async componentDidMount() {
    const { themesUrl } = this.props;

    if (themesUrl) {
      const themesFromThemesUrl = await this.fetchThemesFromUrl(themesUrl);
      if (themesFromThemesUrl) {
        store.dispatch(themesSlice.actions.setUrlThemesList(themesFromThemesUrl));
      }
    }
    await this.setThemes();
  }

  async privateConfigurationAlert(selectedMode, loginAsDifferentUser = false, currentThemeId) {
    try {
      store.dispatch(modalSlice.actions.addModal({ modal: ModalId.PRIVATE_THEMEID_LOGIN }));
      const shouldExecuteLogin = await confirm(t`Please login to gain access to it`, {
        title: t`The configuration you are trying to access is private`,
        okLabel: loginAsDifferentUser ? t`Login as a different user` : t`Login`,
        cancelLabel: t`Continue without logging in`,
      });
      if (shouldExecuteLogin) {
        if (loginAsDifferentUser) {
          await logoutUser();
        }
        store.dispatch(modalSlice.actions.removeModal());
        await openLogin();
      }
    } catch (err) {
      store.dispatch(visualizationSlice.actions.reset());
      store.dispatch(themesSlice.actions.reset());
    } finally {
      store.dispatch(modalSlice.actions.removeModal());
    }
  }

  async componentDidUpdate(prevProps) {
    if (!this.props.anonToken && !this.props.user?.access_token) {
      return;
    }

    if (
      (!prevProps.anonToken && this.props.anonToken) ||
      (this.props.user !== prevProps.user && this.props.user.access_token)
    ) {
      await this.setThemes();
    }

    if (this.props.user !== prevProps.user && !this.props.user.access_token) {
      await this.setThemesOnLogout();
    }

    if (
      prevProps.selectedThemeId !== this.props.selectedThemeId ||
      prevProps.selectedThemesListId !== this.props.selectedThemesListId
    ) {
      await this.updateDataSourceHandlers(this.props.selectedThemeId);
    }
  }

  setThemesOnLogout = async () => {
    const { selectedThemesListId, modeThemesList, selectedThemeId } = this.props;
    let themeId = selectedThemeId;
    if (selectedThemesListId === USER_INSTANCES_THEMES_LIST) {
      themeId = modeThemesList[0].id;
      store.dispatch(
        themesSlice.actions.setSelectedThemeId({
          selectedThemeId: themeId,
          selectedThemesListId: MODE_THEMES_LIST,
        }),
      );
      store.dispatch(visualizationSlice.actions.reset());
    }
    store.dispatch(themesSlice.actions.setUserInstancesThemesList([]));
    store.dispatch(notificationSlice.actions.displayPanelError(null));
    await this.updateDataSourceHandlers(themeId);
  };

  setThemes = async () => {
    const { themeIdFromUrlParams, anonToken, user } = this.props;
    if (anonToken || (user && user.access_token)) {
      let userInstances = [];
      let rrdInstances = [];

      if (user.access_token) {
        userInstances = await this.fetchUserInstances();
        rrdInstances = await this.getRRDInstances(user.access_token);
      }

      const currentThemeId = this.props.selectedThemeId || themeIdFromUrlParams;
      const selectedMode = this.guessMode(currentThemeId, userInstances, rrdInstances);
      this.setMode(selectedMode);
      this.setSelectedThemeIdFromMode(selectedMode, currentThemeId, userInstances, rrdInstances);

      const allThemes = [...userInstances, ...selectedMode.themes, ...rrdInstances];

      const isThemeIdInModeThemesList = !!allThemes.find((t) => t.id === currentThemeId);

      if (selectedMode.themes.length > 0 && !isThemeIdInModeThemesList && currentThemeId) {
        await this.privateConfigurationAlert(selectedMode, !!this.props.user.access_token, currentThemeId);
      }
    }
  };

  async fetchUserInstances() {
    const { access_token } = this.props.user;
    try {
      const response = await axios.get(
        `${global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL}/api/v2/configuration/instances`,
        {
          responseType: 'json',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const modifiedUserInstances = response.data.map((inst) => ({
        name: () => inst.name,
        id: `${inst.id}`,
        content: [
          {
            service: 'WMS',
            url: `${global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL}/ogc/wms/${inst.id}`,
          },
        ],
      }));

      store.dispatch(themesSlice.actions.setUserInstancesThemesList(modifiedUserInstances));
      store.dispatch(notificationSlice.actions.displayPanelError(null));
      return modifiedUserInstances;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        const account_expired_instance = [
          {
            name: () => t`User Instances`,
            id: EXPIRED_ACCOUNT.instanceId,
            content: [],
          },
        ];
        store.dispatch(themesSlice.actions.setUserInstancesThemesList(account_expired_instance));
        return account_expired_instance;
      }
      let errorMessage =
        t`There was a problem downloading your instances` +
        `${error.response && error.message ? `: ${error.message}` : ''}`;
      store.dispatch(notificationSlice.actions.displayPanelError({ message: errorMessage, link: null }));
    }
    return [];
  }

  getRRDInstances = async (access_token) => {
    if (!isInGroup(RRD_GROUP) || !access_token) {
      store.dispatch(themesSlice.actions.setRRDThemesList([]));
      return [];
    }

    try {
      const userProfile = await rrdApi.getProfile(access_token);
      const identifier = userProfile?.profile?.current_project?.identifier;
      const projectName = userProfile?.profile?.current_project?.name;
      const filteredThemes = filterRrdThemesByIdentifier(RRD_THEMES, identifier);
      store.dispatch(themesSlice.actions.setRRDThemesList(filteredThemes));
      store.dispatch(themesSlice.actions.setCurrentProjectName(projectName));
      return filteredThemes;
    } catch (error) {
      const errorMessage = t`There was a problem retrieving user profile`;
      store.dispatch(notificationSlice.actions.displayPanelError({ message: errorMessage, link: null }));
      store.dispatch(themesSlice.actions.setRRDThemesList([]));
      return [];
    }
  };

  fetchThemesFromUrl = (themesUrl) => {
    return axios
      .get(themesUrl, { responseType: 'json', timeout: 30000 })
      .then((r) => r.data)
      .catch((err) => {
        console.error(err);
        store.dispatch(
          notificationSlice.actions.displayError(
            'Error loading specified theme, see console for more info (common causes: ad blockers, network errors). Using default themes instead.',
          ),
        );
        return [];
      });
  };

  guessMode = (themeId, userInstances = null, rrdInstances = null) => {
    if (!themeId) {
      return DEFAULT_SELECTED_MODE;
    }
    const userInstancesList = userInstances !== null ? userInstances : this.props.userInstancesThemesList;
    const rrdInstancesList = rrdInstances !== null ? rrdInstances : this.props.rrdThemesList;

    const isThemeUserInstance = !!userInstancesList.find((t) => t.id === themeId);
    if (isThemeUserInstance) {
      return DEFAULT_SELECTED_MODE;
    }
    const isThemeFromUrl = !!this.props.urlThemesList.find((t) => t.id === themeId);
    const isThemeFromRRD = !!rrdInstancesList.find((t) => t.id === themeId);
    if (isThemeFromUrl || isThemeFromRRD) {
      // themesUrl aren't supported in Education mode
      return DEFAULT_MODE;
    }
    for (let mode of MODES) {
      // Filter themes based on useEvoland setting
      const modeThemes = this.props.useEvoland
        ? mode.themes
        : mode.themes.filter((theme) => theme.id !== 'EVOLAND-THEME');

      if (modeThemes.find((t) => t.id === themeId)) {
        return mode;
      }
    }
    return DEFAULT_SELECTED_MODE;
  };

  getThemesListId = (themeId, userInstances = null, rrdInstances = null) => {
    if (!themeId) {
      return MODE_THEMES_LIST;
    }
    const userInstancesList = userInstances !== null ? userInstances : this.props.userInstancesThemesList;
    const rrdInstancesList = rrdInstances !== null ? rrdInstances : this.props.rrdThemesList;
    const isThemeUserInstance = !!userInstancesList.find((t) => t.id === themeId);
    if (isThemeUserInstance) {
      return USER_INSTANCES_THEMES_LIST;
    }
    const isThemeFromRRD = !!rrdInstancesList.find((t) => t.id === themeId);
    if (isThemeFromRRD) {
      return RRD_INSTANCES_THEMES_LIST;
    }
    const isThemeFromUrl = !!this.props.urlThemesList.find((t) => t.id === themeId);
    if (isThemeFromUrl) {
      return URL_THEMES_LIST;
    }
    return MODE_THEMES_LIST;
  };

  setMode = (selectedMode) => {
    const { useEvoland } = this.props;

    // Filter out EVOLAND themes unless useEvoland is true
    let modeThemes = selectedMode.themes;
    if (!useEvoland) {
      modeThemes = selectedMode.themes.filter((theme) => theme.id !== 'EVOLAND-THEME');
    }

    store.dispatch(themesSlice.actions.setSelectedModeId(selectedMode.id));
    store.dispatch(themesSlice.actions.setModeThemesList(modeThemes));
  };

  setSelectedThemeIdFromMode = (selectedMode, themeId, userInstances = null, rrdInstances = null) => {
    const { urlThemesList } = this.props;
    if (themeId) {
      store.dispatch(
        themesSlice.actions.setSelectedThemeId({
          selectedThemeId: themeId,
          selectedThemesListId: this.getThemesListId(themeId, userInstances, rrdInstances),
        }),
      );
    } else {
      if (urlThemesList.length > 0) {
        store.dispatch(
          themesSlice.actions.setSelectedThemeId({
            selectedThemeId: urlThemesList[0].id,
            selectedThemesListId: URL_THEMES_LIST,
          }),
        );
      } else {
        store.dispatch(
          themesSlice.actions.setSelectedThemeId({
            selectedThemeId: selectedMode.themes[0].id,
            selectedThemesListId: MODE_THEMES_LIST,
          }),
        );
      }
    }
  };

  updateDataSourceHandlers = async (themeId) => {
    if (!themeId) {
      initializeDataSourceHandlers();
      return;
    }
    const {
      modeThemesList,
      userInstancesThemesList,
      urlThemesList,
      themesLists,
      selectedThemesListId,
      user,
    } = this.props;
    // ah yes not sure how to do elegantly this to handle duplicate ids...
    let selectedTheme;
    if (selectedThemesListId) {
      selectedTheme = themesLists[selectedThemesListId].find((t) => t.id === themeId);
    } else {
      selectedTheme = [...modeThemesList, ...userInstancesThemesList, ...urlThemesList].find(
        (t) => t.id === themeId,
      );
    }
    if (!selectedTheme) {
      store.dispatch(notificationSlice.actions.displayError('Selected themeId does not exist!'));
      store.dispatch(themesSlice.actions.setSelectedThemeId({ selectedThemeId: null }));
      initializeDataSourceHandlers();
      return;
    }
    // We still set selected theme for layerInclude/layersExclude etc in Visualization Panel
    store.dispatch(themesSlice.actions.setDataSourcesInitialized(false));

    // Ignore CCM collections for non copernicus services users
    const hasAccessToCCMVisualization = doesUserHaveAccessToCCMVisualization(user.access_token);
    if (!hasAccessToCCMVisualization && selectedTheme.id === DEFAULT_THEME_ID) {
      selectedTheme = {
        ...selectedTheme,
        content: selectedTheme.content.filter(
          (t) => !EXCLUDED_CONFIG_NAMES_FOR_USERS_WITHOUT_ACCESS.includes(t.name),
        ),
      };
    }
    const failedThemeParts = await prepareDataSourceHandlers(selectedTheme);
    store.dispatch(themesSlice.actions.setFailedThemeParts(failedThemeParts));
  };

  render() {
    return (
      <>
        <AlertProvider />
        {this.props.modalId === ModalId.PRIVATE_THEMEID_LOGIN && <div className="login-overlay" />}
        {this.props.children}
      </>
    );
  }
}

const mapStoreToProps = (store) => ({
  anonToken: store.auth.anonToken,
  termsPrivacyAccepted: store.auth.terms_privacy_accepted,
  selectedThemeId: store.themes.selectedThemeId,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  themesUrl: store.themes.themesUrl,
  user: store.auth.user,
  modeThemesList: store.themes.themesLists[MODE_THEMES_LIST],
  userInstancesThemesList: store.themes.themesLists[USER_INSTANCES_THEMES_LIST],
  urlThemesList: store.themes.themesLists[URL_THEMES_LIST],
  rrdThemesList: store.themes.themesLists[RRD_INSTANCES_THEMES_LIST],
  selectedModeId: store.themes.selectedModeId,
  selectedThemesListId: store.themes.selectedThemesListId,
  themesLists: store.themes.themesLists,
  modalId: store.modal.id,
  useEvoland: store.themes.useEvoland,
});
export default connect(mapStoreToProps)(ThemesProvider);
