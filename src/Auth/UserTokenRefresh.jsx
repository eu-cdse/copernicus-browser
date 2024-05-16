import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import store, { authSlice } from '../store';
import { usePrevious } from '../hooks/usePrevious';
import {
  createSetUserPayload,
  getAuthUri,
  saveUserTokenToLocalStorage,
  scheduleAction,
  UPDATE_BEFORE_EXPIRY_USER_TOKEN,
} from './authHelpers';

let refreshTimeout = null;

const executeRefresh = (iframe) => {
  store.dispatch(authSlice.actions.setTokenRefreshInProgress(true));

  // When token refresh fails (eg. user is not logged in yet/anymore) we are not redirected to our
  // redirect_uri endpoint and cannot communicate with the iframe due to being on different origins.
  // We set an arbitrary timeout for that case to mark refresh operation has ended.
  setTimeout(() => {
    store.dispatch(authSlice.actions.setTokenRefreshInProgress(false));
  }, 1000);

  iframe.src = getAuthUri({
    redirect_uri: `${import.meta.env.VITE_ROOT_URL}oauthSilentCheckSSO.html`,
  });
};

const scheduleRefresh = (iframe, expires_at) => {
  refreshTimeout = scheduleAction(expires_at, UPDATE_BEFORE_EXPIRY_USER_TOKEN, refreshTimeout, () =>
    executeRefresh(iframe),
  );
};

const handleUserTokenRefresh = (event) => {
  if (event && event.data && event.data.type && event.data.type === 'CDSE_AUTH_REFRESH_TOKEN') {
    const { token } = event.data;
    if (token && token.access_token) {
      //save token to both stores
      saveUserTokenToLocalStorage(token);
      store.dispatch(authSlice.actions.setUser(createSetUserPayload(token)));
      store.dispatch(authSlice.actions.setTokenRefreshInProgress(false));
    }
  }
};

const UserTokenRefresh = ({ access_token, expires_at, children }) => {
  const iframeRef = useRef();
  const previousAccessToken = usePrevious(access_token);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!access_token) {
      // Initial token refresh for users that have already authenticated on Copernicus website
      executeRefresh(iframe);
    }

    window.addEventListener('message', handleUserTokenRefresh);

    return () => {
      window.removeEventListener('message', handleUserTokenRefresh);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;

    // schedule token refresh after access token is changed
    if (access_token && access_token !== previousAccessToken) {
      scheduleRefresh(iframe, expires_at);
    }

    // clear scheduled refresh if token is removed (logout)
    if (!access_token && previousAccessToken && refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
  }, [access_token, expires_at, previousAccessToken]);

  return (
    <>
      <iframe style={{ display: 'none' }} ref={iframeRef} title="refresh-user-token"></iframe>
      {children}
    </>
  );
};

const mapStoreToProps = (store) => ({
  access_token: store.auth.user.access_token,
  expires_at: store.auth.user.token_expiration,
  tokenRefreshInProgress: store.auth.tokenRefreshInProgress,
});

export default connect(mapStoreToProps)(UserTokenRefresh);
