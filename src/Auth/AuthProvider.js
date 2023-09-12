import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import store, { authSlice } from '../store';
import { decodeToken, getTokenExpiration, getUserTokenFromLocalStorage } from './authHelpers';
import UserTokenRefresh from './UserTokenRefresh';
import EnsureAuth from './EnsureAuth';
import useAnonymousAuthFingerprint from './AnonymousAuthFingerprint/useAnonymousAuthFingerprint';

const AuthProvider = ({ user, anonToken, tokenRefreshInProgress, children }) => {
  const [userAuthCompleted, setUserAuthCompleted] = useState(false);
  const [anonAuthCompleted, setAnonAuthCompleted] = useState(false);

  const { getAnonymousToken } = useAnonymousAuthFingerprint();

  const initialUserAuth = async () => {
    try {
      const token = await getUserTokenFromLocalStorage();
      if (token) {
        store.dispatch(
          authSlice.actions.setUser({
            userdata: decodeToken(token),
            token_expiration: getTokenExpiration(token),
            access_token: token.access_token,
          }),
        );
      }
    } catch (err) {
      console.error(err);
    }
    setUserAuthCompleted(true);
  };

  const initialAnonymousAuth = async () => {
    await getAnonymousToken();
    setAnonAuthCompleted(true);
  };

  useEffect(() => {
    initialUserAuth();
    initialAnonymousAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <EnsureAuth
        userAuthCompleted={userAuthCompleted}
        user={user}
        anonToken={anonToken}
        tokenRefreshInProgress={tokenRefreshInProgress}
        anonAuthCompleted={anonAuthCompleted}
      ></EnsureAuth>
      <UserTokenRefresh>{children}</UserTokenRefresh>
    </>
  );
};

const mapStoreToProps = (store) => ({
  anonToken: store.auth.anonToken,
  user: store.auth.user.userdata,
  tokenRefreshInProgress: store.auth.tokenRefreshInProgress,
});
export default connect(mapStoreToProps)(AuthProvider);
