import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { t } from 'ttag';
import Modal from '../components/Modal/Modal';

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
import { isInGroup, openLogin, logoutUser } from '../Auth/authHelpers';

import './ThemesProvider.scss';
import { RRD_GROUP } from '../api/RRD/assets/rrd.utils';
import { RRD_THEMES } from '../assets/cache/rrdThemes';
import { doesUserHaveAccessToCCMVisualization } from '../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';
import {
  CCM_VHR_COLLECTIONS,
  CCM_VHR_THEME_NAMES,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { rrdApi } from '../api/RRD/RRDApi';

const TRIGGER_LOGIN_AFTER_LOGOUT_KEY = 'triggerLoginAfterLogout';

const DEFAULT_SELECTED_MODE = import.meta.env.VITE_DEFAULT_MODE_ID
  ? MODES.find((mode) => mode.id === import.meta.env.VITE_DEFAULT_MODE_ID)
  : DEFAULT_MODE;

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
  state = {
    confirmDialog: null,
  };

  _confirmResolve = null;

  _isHandlingLogout = false;

  showConfirm = (text, { title, okLabel, cancelLabel }) => {
    return new Promise((resolve) => {
      this._confirmResolve = resolve;
      this.setState({ confirmDialog: { text, title, okLabel, cancelLabel } });
    });
  };

  handleConfirm = (result) => {
    store.dispatch(modalSlice.actions.removeModal());
    this._confirmResolve(result);
    this.setState({ confirmDialog: null });
  };

  async componentDidMount() {
    // Check if we need to trigger login after logout
    const shouldTriggerLogin = sessionStorage.getItem(TRIGGER_LOGIN_AFTER_LOGOUT_KEY);
    if (shouldTriggerLogin === 'true') {
      sessionStorage.removeItem(TRIGGER_LOGIN_AFTER_LOGOUT_KEY);
      await openLogin();
      return;
    }

    if (!this.props.anonToken && !this.props.user?.access_token) {
      return;
    }

    await this.handleInitialLoad();
  }

  async handleInitialLoad() {
    const { themesUrl } = this.props;

    const isCCMDataset = CCM_VHR_COLLECTIONS.includes(this.props.datasetId);

    // A share link that points at a gated CCM collection is opened by someone without access —
    // both anonymous visitors (no access_token) and logged-in users lacking a CCM role hit this.
    // We intentionally prompt both: showAuthModal renders the appropriate copy (log in vs. switch
    // account) based on login state. Letting an anonymous user fall through instead would leave the
    // unloadable CCM datasetId in the store and reproduce the cryptic "Invalid URL" error (#718).
    if (isCCMDataset && !doesUserHaveAccessToCCMVisualization(this.props.user?.access_token)) {
      await this.showCCMAccessDeniedModal();
      return;
    }

    if (themesUrl) {
      const themesFromThemesUrl = await this.fetchThemesFromUrl(themesUrl);
      if (themesFromThemesUrl) {
        store.dispatch(themesSlice.actions.setUrlThemesList(themesFromThemesUrl));
      }
    }
    await this.setThemes();
  }

  async showAuthModal({ title, loggedInText, anonymousText, onCancel }) {
    let modalActive = true;
    try {
      store.dispatch(modalSlice.actions.addModal({ modal: ModalId.PRIVATE_THEMEID_LOGIN }));
      const isUserLoggedIn = !!this.props.user?.access_token;

      const shouldLogin = await this.showConfirm(isUserLoggedIn ? loggedInText : anonymousText, {
        title,
        okLabel: isUserLoggedIn ? t`Log in as a different user` : t`Log in`,
        cancelLabel: isUserLoggedIn ? t`Cancel` : t`Continue without logging in`,
      });

      // handleConfirm (or setThemesOnLogout) has already removed the modal at this point.
      modalActive = false;

      // null signals the dialog was force-closed by a logout — skip onCancel.
      if (shouldLogin === null) {
        return;
      }

      if (shouldLogin) {
        if (isUserLoggedIn) {
          sessionStorage.setItem(TRIGGER_LOGIN_AFTER_LOGOUT_KEY, 'true');
          await logoutUser();
          return;
        }
        await openLogin();
        return;
      }

      await onCancel();
    } catch (err) {
      console.error('Error in showAuthModal:', err);
      // Last-resort recovery: if the auth flow throws unexpectedly, tear down the modal and reset
      // visualization + themes so the user lands on a clean default state rather than a half-built map.
      if (modalActive) {
        store.dispatch(modalSlice.actions.removeModal());
      }
      store.dispatch(visualizationSlice.actions.reset());
      store.dispatch(themesSlice.actions.reset());
    }
  }

  async privateConfigurationAlert() {
    await this.showAuthModal({
      title: t`Authentication Required`,
      loggedInText: t`The configuration you are trying to access is private. Do you want to switch to another account to access this content?`,
      anonymousText: t`The configuration you are trying to access is private. Please log in to continue.`,
      onCancel: async () => {
        // setThemes() is not called here — the call site wraps privateConfigurationAlert in a
        // try/finally that runs setSelectedThemeIdFromMode regardless, which handles theme reinit.
        store.dispatch(visualizationSlice.actions.reset());
      },
    });
  }

  showCCMAccessDeniedModal = async () => {
    await this.showAuthModal({
      title: t`Access Denied`,
      loggedInText: t`You do not have permission to view this collection. Please switch to another account to access this content.`,
      anonymousText: t`You do not have permission to view this collection. Please log in to continue.`,
      onCancel: async () => {
        store.dispatch(visualizationSlice.actions.reset());
        await this.setThemes();
      },
    });
  };

  async componentDidUpdate(prevProps) {
    // Run logout handler regardless of modal state — a forced external logout should always reset the map.
    if (this.props.user !== prevProps.user && !this.props.user?.access_token) {
      await this.setThemesOnLogout();
      // After the await, this._isHandlingLogout is false and this.props reflects the latest state,
      // so any anon token that arrived while we were awaiting will be picked up below.
    }

    // A concurrent componentDidUpdate fired while setThemesOnLogout was awaiting.
    // The call that triggered the logout will handle the anon-token / login check when it resumes.
    if (this._isHandlingLogout) {
      return;
    }

    if (this.props.modalId === ModalId.PRIVATE_THEMEID_LOGIN) {
      return;
    }

    if (!this.props.anonToken && !this.props.user?.access_token) {
      return;
    }

    if (
      (!prevProps.anonToken && this.props.anonToken) ||
      (this.props.user !== prevProps.user && this.props.user?.access_token)
    ) {
      await this.handleInitialLoad();
    }

    if (
      prevProps.selectedThemeId !== this.props.selectedThemeId ||
      prevProps.selectedThemesListId !== this.props.selectedThemesListId
    ) {
      await this.updateDataSourceHandlers(this.props.selectedThemeId);
    }
  }

  setThemesOnLogout = async () => {
    this._isHandlingLogout = true;
    try {
      if (this.state.confirmDialog) {
        // Force-close whichever auth dialog is open (private-theme alert or CCM access-denied) by
        // resolving showConfirm with null. showAuthModal treats null as "closed by logout" and skips
        // its onCancel — safe here because setThemesOnLogout below performs its own full reset
        // (visualization + themes via updateDataSourceHandlers), making the per-modal onCancel redundant.
        store.dispatch(modalSlice.actions.removeModal());
        this.setState({ confirmDialog: null });
        if (this._confirmResolve) {
          this._confirmResolve(null);
          this._confirmResolve = null;
        }
      }

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
    } finally {
      this._isHandlingLogout = false;
    }
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
        try {
          await this.privateConfigurationAlert();
        } finally {
          this.setSelectedThemeIdFromMode(selectedMode, null, userInstances, rrdInstances);
        }
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

  fetchThemesFromUrl = async (themesUrl) => {
    try {
      const response = await axios.get(themesUrl, { responseType: 'json', timeout: 30000 });
      return response.data;
    } catch (err) {
      console.error(err);
      store.dispatch(
        notificationSlice.actions.displayError(
          'Error loading specified theme, see console for more info (common causes: ad blockers, network errors). Using default themes instead.',
        ),
      );
      return [];
    }
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
        content: selectedTheme.content.filter((t) => !CCM_VHR_THEME_NAMES.includes(t.name)),
      };
    }
    const failedThemeParts = await prepareDataSourceHandlers(selectedTheme);
    store.dispatch(themesSlice.actions.setFailedThemeParts(failedThemeParts));
  };

  render() {
    const { confirmDialog } = this.state;
    return (
      <>
        {this.props.modalId === ModalId.PRIVATE_THEMEID_LOGIN && <div className="login-overlay" />}
        {confirmDialog && (
          <Modal
            animation="slideUp"
            visible={true}
            customStyles={{
              position: 'fixed',
              width: '90%',
              maxWidth: '600px',
              height: 'auto',
              bottom: 'auto',
              top: '30%',
              transform: 'translateY(-50%)',
            }}
            onClose={() => {}}
            showCloseButton={false}
            closeOnEsc={false}
          >
            <div
              className="confirm-dialog"
              role="alertdialog"
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-text"
            >
              <div id="confirm-dialog-title" className="confirm-dialog__title">
                {confirmDialog.title}
              </div>
              <div id="confirm-dialog-text" className="confirm-dialog__text">
                {confirmDialog.text}
              </div>
              <div className="confirm-dialog__buttons">
                <button
                  className="confirm-dialog__btn confirm-dialog__btn--ok"
                  onClick={() => this.handleConfirm(true)}
                >
                  {confirmDialog.okLabel}
                </button>
                <button
                  className="confirm-dialog__btn confirm-dialog__btn--cancel"
                  onClick={() => this.handleConfirm(false)}
                >
                  {confirmDialog.cancelLabel}
                </button>
              </div>
            </div>
          </Modal>
        )}
        {this.props.children}
      </>
    );
  }
}

const mapStoreToProps = (store) => ({
  anonToken: store.auth.anonToken,
  termsPrivacyAccepted: store.auth.termsPrivacyAccepted,
  selectedThemeId: store.themes.selectedThemeId,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  themesUrl: store.themes.themesUrl,
  user: store.auth.user,
  datasetId: store.visualization.datasetId,
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
