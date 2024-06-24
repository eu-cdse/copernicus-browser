import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import store, { authSlice } from '../store';
import {
  createSetUserPayload,
  getAnonTokenFromLocalStorage,
  getUserTokenFromLocalStorage,
  saveRecaptchaConsentToLocalStorage,
} from './authHelpers';
import UserTokenRefresh from './UserTokenRefresh';
import EnsureAuth from './EnsureAuth';
import { Captcha } from './AnonymousAuthRecaptcha/Captcha';
import useAnonymousAuthRecaptcha from './AnonymousAuthRecaptcha/useAnonymousAuthRecaptcha';
import { usePrevious } from '../hooks/usePrevious';

import './Auth.scss';

const AuthProvider = ({ user, anonToken, tokenRefreshInProgress, children }) => {
  const [userAuthCompleted, setUserAuthCompleted] = useState(false);
  const [anonAuthCompleted, setAnonAuthCompleted] = useState(false);

  const { saveAndDispatchToken, getAnonymousToken, captchaRef, clearAnonTokenRefresh } =
    useAnonymousAuthRecaptcha();

  const prevUser = usePrevious(user);

  const initialUserAuth = async () => {
    let token;
    try {
      token = await getUserTokenFromLocalStorage();
      if (token) {
        store.dispatch(authSlice.actions.setUser(createSetUserPayload(token)));
      }
    } catch (err) {
      console.error(err);
    }
    setUserAuthCompleted(true);
    return token;
  };

  const initialAnonAuth = async () => {
    const userToken = await initialUserAuth();
    if (userToken) {
      //skip anon auth if we have user token
      setAnonAuthCompleted(true);
    } else {
      setInitialAnonToken();
    }
  };

  const setInitialAnonToken = async () => {
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
    initialUserAuth();
  }, []);

  useEffect(() => {
    if (!user && prevUser) {
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
        userAuthCompleted={userAuthCompleted}
        user={user}
        anonToken={anonToken}
        tokenRefreshInProgress={tokenRefreshInProgress}
        anonAuthCompleted={anonAuthCompleted}
        executeAnonAuth={() => {
          saveRecaptchaConsentToLocalStorage();
          captchaRef.current.loadCaptchaScript();
          captchaRef.current.executeCaptcha();
        }}
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
