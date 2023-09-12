import jwt_dec from 'jwt-decode';
import store, { authSlice } from '../store';
import axios from 'axios';

export const LOCAL_STORAGE_USER_AUTH_KEY = 'cdsebrowser_oauth';
export const LOCAL_STORAGE_ANON_AUTH_KEY = 'cdsebrowser_anon_auth';

export const UPDATE_BEFORE_EXPIRY_USER_TOKEN = 3 * 60 * 1000; //minutes*seconds*miliseconds
export const UPDATE_BEFORE_EXPIRY_ANON_TOKEN = 10 * 1000; //seconds*miliseconds

export const getAuthUri = ({ redirect_uri }) => {
  const params = {
    client_id: process.env.REACT_APP_CLIENTID,
    redirect_uri: redirect_uri,
    response_type: 'token id_token',
    nonce: Math.round(Math.random() * Math.pow(10, 16)),
  };
  return process.env.REACT_APP_AUTH_BASEURL + 'auth?' + new URLSearchParams(params);
};

export const openLoginWindow = async () => {
  return new Promise((resolve, reject) => {
    window.authorizationCallback = { resolve, reject };
    const auth_uri = getAuthUri({ redirect_uri: `${process.env.REACT_APP_ROOT_URL}oauthCallback.html` });
    const popupWidth = 690;
    const popupHeight = 780;

    window.open(
      auth_uri,
      'popupWindow',
      `width=${popupWidth},height=${popupHeight},left=${window.screen.width / 2 - popupWidth / 2},top=${
        window.screen.height / 2 - popupHeight / 2
      }`,
    );
  }).then((token) => {
    saveUserTokenToLocalStorage(token);
    return token;
  });
};

const getTokenFromLocalStorage = async (key) => {
  const token = await localStorage.getItem(key);
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

export const getUserTokenFromLocalStorage = () => getTokenFromLocalStorage(LOCAL_STORAGE_USER_AUTH_KEY);
export const getAnonTokenFromLocalStorage = () => getTokenFromLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY);

const saveTokenToLocalStorage = (key, token) => {
  localStorage.setItem(key, JSON.stringify(token));
};

export const saveUserTokenToLocalStorage = (token) =>
  saveTokenToLocalStorage(LOCAL_STORAGE_USER_AUTH_KEY, token);
export const saveAnonTokenToLocalStorage = (token) =>
  saveTokenToLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY, token);

const removeTokenFromLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export const removeUserTokenFromLocalStorage = () => removeTokenFromLocalStorage(LOCAL_STORAGE_USER_AUTH_KEY);
export const removeAnonTokenFromLocalStorage = () => removeTokenFromLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY);

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  const now = new Date().valueOf();
  const expirationDate = getTokenExpiration(token);
  return expirationDate < now;
};

export const decodeToken = (token) => jwt_dec(token['id_token']);

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

export const onLogIn = (token, decodedToken) => {
  store.dispatch(
    authSlice.actions.setUser({
      userdata: decodedToken,
      access_token: token.access_token,
      token_expiration: getTokenExpiration(token),
    }),
  );
};

const onLogOut = () => {
  removeUserTokenFromLocalStorage();
  store.dispatch(authSlice.actions.resetUser());
};

export const logoutUser = async (userToken) => {
  axios
    .get(process.env.REACT_APP_AUTH_BASEURL + 'logout', {
      withCredentials: true,
      params: {
        id_token_hint: userToken && userToken.id_token,
      },
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      onLogOut();
    });
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
};
