import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { t } from 'ttag';
import AlertProvider, { confirm } from 'react-alert-async';
import { ModalId } from '../const';

import store, { notificationSlice, themesSlice, visualizationSlice, authSlice, modalSlice } from '../store';
import {
  prepareDataSourceHandlers,
  initializeDataSourceHandlers,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  MODE_THEMES_LIST,
  URL_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  DEFAULT_MODE,
  MODES,
  EXPIRED_ACCOUNT,
} from '../const';
import {
  createSetUserPayload,
  getUserTokenFromLocalStorage,
  logoutUser,
  openLoginWindow,
} from '../Auth/authHelpers';

import 'react-alert-async/dist/index.css';
import './ThemesProvider.scss';

const DEFAULT_SELECTED_MODE = import.meta.env.VITE_DEFAULT_MODE_ID
  ? MODES.find((mode) => mode.id === import.meta.env.VITE_DEFAULT_MODE_ID)
  : DEFAULT_MODE;

class ThemesProvider extends React.Component {
  async componentDidMount() {
    const { themesUrl } = this.props;

    if (themesUrl) {
      const themesFromThemesUrl = await this.fetchThemesFromUrl(themesUrl);
      if (themesFromThemesUrl) {
        store.dispatch(themesSlice.actions.setUrlThemesList(themesFromThemesUrl));
      }
    }
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
          const token = await getUserTokenFromLocalStorage();
          await logoutUser(token);
        }
        store.dispatch(modalSlice.actions.removeModal());
        const token = await openLoginWindow();
        store.dispatch(authSlice.actions.setUser(createSetUserPayload(token)));
        await this.fetchUserInstances();
        this.setMode(selectedMode);
        this.setSelectedThemeIdFromMode(selectedMode, currentThemeId);
      }
    } catch (err) {
      store.dispatch(visualizationSlice.actions.reset());
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
      let userInstances = [];

      if (this.props.user.access_token) {
        userInstances = await this.fetchUserInstances();
      }

      const currentThemeId = this.props.selectedThemeId || this.props.themeIdFromUrlParams;
      const selectedMode = this.guessMode(currentThemeId);
      this.setMode(selectedMode);
      this.setSelectedThemeIdFromMode(selectedMode, currentThemeId);

      const allThemes = [...userInstances, ...selectedMode.themes];

      const isThemeIdInModeThemesList = !!allThemes.find((t) => t.id === currentThemeId);

      if (selectedMode.themes.length > 0 && !isThemeIdInModeThemesList && currentThemeId) {
        await this.privateConfigurationAlert(selectedMode, !!this.props.user.access_token, currentThemeId);
      }
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

  async fetchUserInstances() {
    const { access_token } = this.props.user;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SH_SERVICES_URL}/configuration/v1/wms/instances`,
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
            url: `${import.meta.env.VITE_SH_SERVICES_URL}/ogc/wms/${inst.id}`,
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

  guessMode = (themeId) => {
    if (!themeId) {
      return DEFAULT_SELECTED_MODE;
    }
    const isThemeUserInstance = !!this.props.userInstancesThemesList.find((t) => t.id === themeId);
    if (isThemeUserInstance) {
      return DEFAULT_SELECTED_MODE;
    }
    const isThemeFromUrl = !!this.props.urlThemesList.find((t) => t.id === themeId);
    if (isThemeFromUrl) {
      // themesUrl aren't supported in Education mode
      return DEFAULT_MODE;
    }
    for (let mode of MODES) {
      if (mode.themes.find((t) => t.id === themeId)) {
        return mode;
      }
    }
    return DEFAULT_SELECTED_MODE;
  };

  setMode = (selectedMode) => {
    store.dispatch(themesSlice.actions.setSelectedModeId(selectedMode.id));
    store.dispatch(themesSlice.actions.setModeThemesList(selectedMode.themes));
  };

  setSelectedThemeIdFromMode = (selectedMode, themeId) => {
    const { urlThemesList } = this.props;
    if (themeId) {
      store.dispatch(themesSlice.actions.setSelectedThemeId({ selectedThemeId: themeId }));
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
    const { modeThemesList, userInstancesThemesList, urlThemesList, themesLists, selectedThemesListId } =
      this.props;
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
  selectedModeId: store.themes.selectedModeId,
  selectedThemesListId: store.themes.selectedThemesListId,
  themesLists: store.themes.themesLists,
  modalId: store.modal.id,
});
export default connect(mapStoreToProps)(ThemesProvider);
