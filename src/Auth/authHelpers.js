import jwt_dec from 'jwt-decode';
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

export const initKeycloak = async () => {
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
  try {
    const authenticated = await keycloakInstance.login();

    // This will not be reached anymore

    if (authenticated) {
      setAuthenticatedUser();
    }
    return authenticated;
  } catch (error) {
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
    const decodedToken = jwt_dec(token.access_token);
    return decodedToken?.exp * 1000 ?? 0;
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
