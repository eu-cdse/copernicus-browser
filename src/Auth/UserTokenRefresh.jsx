import { useEffect } from 'react';
import { connect } from 'react-redux';
import { usePrevious } from '../hooks/usePrevious';
import { refreshUserToken, scheduleTokenRefresh, UPDATE_BEFORE_EXPIRY_USER_TOKEN } from './authHelpers';

let refreshTimeout = null;

const executeRefresh = async () => {
  await refreshUserToken();
};

const scheduleRefresh = (expires_at) => {
  refreshTimeout = scheduleTokenRefresh(
    expires_at,
    UPDATE_BEFORE_EXPIRY_USER_TOKEN,
    refreshTimeout,
    async () => await executeRefresh(),
  );
};

const UserTokenRefresh = ({ access_token, expires_at, children }) => {
  const previousAccessToken = usePrevious(access_token);

  useEffect(() => {
    if (!access_token) {
      // Initial token refresh for users that have already authenticated on Copernicus website
      executeRefresh();
    }

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // schedule token refresh after access token is changed
    if (access_token && access_token !== previousAccessToken) {
      scheduleRefresh(expires_at);
    }

    // clear scheduled refresh if token is removed (logout)
    if (!access_token && previousAccessToken && refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
  }, [access_token, expires_at, previousAccessToken]);

  return children;
};

const mapStoreToProps = (store) => ({
  access_token: store.auth.user.access_token,
  expires_at: store.auth.user.token_expiration,
});

export default connect(mapStoreToProps)(UserTokenRefresh);
