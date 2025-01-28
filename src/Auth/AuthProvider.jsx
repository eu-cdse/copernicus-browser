import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  getAnonTokenFromLocalStorage,
  initKeycloak,
  saveAnonTokenToLocalStorage,
  saveRecaptchaConsentToLocalStorage,
} from './authHelpers';
import UserTokenRefresh from './UserTokenRefresh';
import EnsureAuth from './EnsureAuth';
import { Captcha } from './AnonymousAuthRecaptcha/Captcha';
import useAnonymousAuthRecaptcha from './AnonymousAuthRecaptcha/useAnonymousAuthRecaptcha';
import { usePrevious } from '../hooks/usePrevious';

import './Auth.scss';
import store, { authSlice } from '../store';

const AuthProvider = ({ user, anonToken, tokenRefreshInProgress, children }) => {
  const [userAuthCompleted, setUserAuthCompleted] = useState(false);
  const [, setAnonAuthCompleted] = useState(false);

  const { saveAndDispatchToken, getAnonymousToken, captchaRef, clearAnonTokenRefresh } =
    useAnonymousAuthRecaptcha();

  const prevUser = usePrevious(user);

  const initialAnonAuth = async () => {
    clearAnonTokenRefresh();
    let anonToken = await getAnonTokenFromLocalStorage();
    if (anonToken) {
      saveAndDispatchToken({ token: anonToken });
      setAnonAuthCompleted(true);
    } else {
      captchaRef.current.executeCaptcha();
    }
  };

  useEffect(() => {
    const initialUserAuth = async () => {
      const authenticatedUser = await initKeycloak();

      if (authenticatedUser) {
        store.dispatch(authSlice.actions.setAnonToken(null));
        saveAnonTokenToLocalStorage(null);
        clearAnonTokenRefresh();
        setAnonAuthCompleted(true);
      }
      setUserAuthCompleted(true);
    };

    initialUserAuth();
  }, [clearAnonTokenRefresh]);

  useEffect(() => {
    if (!user && prevUser) {
      setUserAuthCompleted(false);
      setAnonAuthCompleted(false);
      captchaRef.current.executeCaptcha();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, prevUser]);

  return (
    <>
      <Captcha
        ref={captchaRef}
        onExecute={async (siteResponse) => {
          setAnonAuthCompleted(false);
          await getAnonymousToken(siteResponse);
          setAnonAuthCompleted(true);
        }}
        onLoad={async () => {
          await initialAnonAuth();
        }}
        onError={(e) => {
          console.log('onError', e);
        }}
        sitekey={import.meta.env.VITE_CAPTCHA_SITE_KEY}
        action="LOGIN"
      ></Captcha>
      <EnsureAuth
        user={user}
        anonToken={anonToken}
        userAuthCompleted={userAuthCompleted}
        tokenRefreshInProgress={tokenRefreshInProgress}
        executeAnonAuth={() => {
          saveRecaptchaConsentToLocalStorage();
          captchaRef.current.loadCaptchaScript();
          captchaRef.current.executeCaptcha();
        }}
      ></EnsureAuth>
      {userAuthCompleted ? (
        <UserTokenRefresh>{children}</UserTokenRefresh>
      ) : (
        <div className="initial-loader">
          <i className="fa fa-cog fa-spin fa-3x fa-fw" />
        </div>
      )}
    </>
  );
};

const mapStoreToProps = (store) => ({
  anonToken: store.auth.anonToken,
  user: store.auth.user.userdata,
  tokenRefreshInProgress: store.auth.tokenRefreshInProgress,
});
export default connect(mapStoreToProps)(AuthProvider);
