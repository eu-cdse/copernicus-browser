import { jwtDecode } from 'jwt-decode';
import store, { authSlice, notificationSlice } from '../store';
import axios from 'axios';
import Keycloak from 'keycloak-js';
import { t } from 'ttag';
import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '../utils/localStorage.utils';
import {
  LOCAL_STORAGE_ANON_AUTH_KEY,
  LOCAL_STORAGE_RECAPTCHA_CONSENT_KEY,
  UPDATE_BEFORE_EXPIRY_USER_TOKEN,
} from '../const';

const keycloakInstance = new Keycloak({
  url: window.API_ENDPOINT_CONFIG.AUTH_BASEURL + '/auth',
  realm: import.meta.env.VITE_REALM,
  clientId: import.meta.env.VITE_CLIENTID,
});

// evalscript, processGraph, and visualizationUrl make the Keycloak redirect_uri too long to pass validation.
// Both initKeycloak (page load) and openLogin (user clicks Login) strip those params before
// handing the redirect_uri to Keycloak, and save the originals under this sessionStorage key
// so they can be restored afterwards. The single restoration point is initKeycloak's finally
// block, which runs after Keycloak resolves — whether that is on the same load (iframe-based
// check-sso) or on the next load after a full-page redirect.
// openLogin only writes to sessionStorage and never restores; its catch block removes the entry
// if login() throws before the redirect, so a stale entry never reaches a future initKeycloak.
const REDIRECT_PARAMS_KEY = 'cdse_keycloak_redirect_params';

// Params whose encoded content is too large for Keycloak's redirect_uri validation.
const LONG_URL_PARAMS = ['evalscript', 'processGraph', 'visualizationUrl'];

// Snapshots the current search+hash into sessionStorage and removes LONG_URL_PARAMS from the
// search string. Returns { hasLongParams, cleanSearch } so each caller can apply the stripped
// URL in its own way (replaceState vs. redirectUri option).
const snapshotAndStripLongParams = (search, hash) => {
  const searchParams = new URLSearchParams(search);
  const hasLongParams = LONG_URL_PARAMS.some((p) => searchParams.has(p));
  if (!hasLongParams) {
    return { hasLongParams: false, cleanSearch: search };
  }
  sessionStorage.setItem(REDIRECT_PARAMS_KEY, JSON.stringify({ search, hash }));
  LONG_URL_PARAMS.forEach((p) => searchParams.delete(p));
  return { hasLongParams: true, cleanSearch: searchParams.toString() };
};

export const initKeycloak = async () => {
  const originalSearch = window.location.search;
  const originalHash = window.location.hash;

  const { hasLongParams, cleanSearch } = snapshotAndStripLongParams(originalSearch, originalHash);
  if (hasLongParams) {
    // Use a relative URL — history.replaceState does not require an absolute origin.
    window.history.replaceState(
      null,
      '',
      window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + originalHash,
    );
  }

  try {
    const authenticated = await keycloakInstance.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
    });

    if (authenticated) {
      setAuthenticatedUser();
    }
    return authenticated;
  } catch (error) {
    console.error('Failed to initialize keycloak:', error);
    return false;
  } finally {
    // Restore evalscript/processGraph/visualizationUrl so URLParamsParser sees the full original URL.
    // Works for both the iframe case (finally runs immediately) and the full-page redirect
    // case (finally runs on the second load after Keycloak redirects back).
    // sessionStorage is per-tab, so there is no risk of restoring a URL from a different tab
    // or page — no pathname guard is needed.
    const saved = sessionStorage.getItem(REDIRECT_PARAMS_KEY);
    if (saved) {
      sessionStorage.removeItem(REDIRECT_PARAMS_KEY);
      try {
        const { search: savedSearch, hash: savedHash } = JSON.parse(saved);
        window.history.replaceState(null, '', window.location.pathname + savedSearch + savedHash);
      } catch {
        console.error(
          'Failed to restore URL params after Keycloak redirect — sessionStorage entry was malformed.',
        );
      }
    }
  }
};

const setAuthenticatedUser = () => {
  const userPayload = {
    userdata: keycloakInstance.idTokenParsed,
    access_token: keycloakInstance.token,
    token_expiration: keycloakInstance.tokenParsed.exp * 1000,
  };

  store.dispatch(authSlice.actions.setUser(userPayload));
};

export const isUserAuthenticated = () => {
  return keycloakInstance.authenticated;
};

export const getAccessToken = () => {
  return keycloakInstance.token;
};

export const openLogin = async () => {
  const search = window.location.search;
  const hash = window.location.hash;
  const { hasLongParams, cleanSearch } = snapshotAndStripLongParams(search, hash);

  const loginOptions = {};
  if (hasLongParams) {
    // keycloakInstance.login() requires an absolute redirectUri (unlike history.replaceState
    // which accepts a relative path), so we must include the origin here.
    loginOptions.redirectUri =
      window.location.origin + window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + hash;
  }

  try {
    const authenticated = await keycloakInstance.login(loginOptions);

    if (authenticated) {
      setAuthenticatedUser();
    }
    return authenticated;
  } catch (error) {
    // Clean up saved params — login did not redirect, so initKeycloak won't restore them.
    sessionStorage.removeItem(REDIRECT_PARAMS_KEY);
    store.dispatch(notificationSlice.actions.displayError(t`An error has occurred during login process`));
    return false;
  }
};

export const refreshUserToken = async () => {
  try {
    if (keycloakInstance.authenticated) {
      const refreshed = await keycloakInstance.updateToken(UPDATE_BEFORE_EXPIRY_USER_TOKEN);

      if (refreshed) {
        setAuthenticatedUser();
      }
      return refreshed;
    }
  } catch (error) {
    console.error('Error during token refresh', error);
    return false;
  }
};

export const scheduleTokenRefresh = (expires_at, updateBeforeExpiry, refreshTimeout, refresh = () => {}) => {
  const now = Date.now();
  const expires_in = expires_at - now;
  const timeout = Math.max(expires_in - updateBeforeExpiry, 0);
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  //schedule refresh
  refreshTimeout = setTimeout(() => {
    refresh();
  }, timeout);

  return refreshTimeout;
};

const getTokenFromLocalStorage = (key) => {
  const token = getFromLocalStorage(key);
  let parsedToken;
  try {
    parsedToken = JSON.parse(token);
  } catch (err) {
    console.error(err);
  }

  if (parsedToken && !isTokenExpired(parsedToken)) {
    return parsedToken;
  }
};

export const getAnonTokenFromLocalStorage = () => getTokenFromLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY);

const saveTokenToLocalStorage = (key, token) => {
  saveToLocalStorage(key, JSON.stringify(token));
};

export const getRecaptchaConsentFromLocalStorage = () =>
  !!getFromLocalStorage(LOCAL_STORAGE_RECAPTCHA_CONSENT_KEY);

export const saveRecaptchaConsentToLocalStorage = () =>
  saveToLocalStorage(LOCAL_STORAGE_RECAPTCHA_CONSENT_KEY, true);

export const removeItemFromLocalStorage = (key) => {
  removeFromLocalStorage(key);
};

export const saveAnonTokenToLocalStorage = (token) =>
  saveTokenToLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY, token);

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  const now = new Date().valueOf();
  const expirationDate = getTokenExpiration(token);
  return expirationDate < now;
};

export const getTokenExpiration = (token) => {
  try {
    if (!token?.access_token) {
      return 0;
    }
    const decodedToken = jwtDecode(token.access_token);
    return (decodedToken?.exp ?? 0) * 1000;
  } catch (e) {
    console.error('Error decoding token', e.message);
  }
  return 0;
};

export const logoutUser = async () => {
  try {
    await keycloakInstance.logout();
  } catch (e) {
    console.error(e);
  }
};

export const scheduleAction = (expires_at, updateBeforeExpiry, timeoutId, action = () => {}) => {
  const now = Date.now();
  const expires_in = expires_at - now;

  const timeout = Math.max(expires_in - updateBeforeExpiry, 0);
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  const newTimeoutId = setTimeout(() => {
    action();
  }, timeout);
  return newTimeoutId;
};

export const fetchAnonTokenUsingService = async (anonTokenServiceUrl, body) => {
  try {
    const { data } = await axios.post(anonTokenServiceUrl, body, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return data;
  } catch (err) {
    console.error('Error while fetching anonymous token', err.message);
  }
  return null;
};

export const hasRole = (userToken, role) => {
  if (!(userToken && role)) {
    return false;
  }

  const roles = keycloakInstance.tokenParsed?.realm_access?.roles ?? [];
  const pattern = new RegExp(role);
  return !!roles.find((r) => pattern.test(r));
};

export const isInGroup = (group) => {
  if (!(keycloakInstance.token && group)) {
    return false;
  }

  const groups = keycloakInstance.tokenParsed.context_groups ?? [];
  return !!groups.find((r) => {
    return r.includes(group);
  });
};
