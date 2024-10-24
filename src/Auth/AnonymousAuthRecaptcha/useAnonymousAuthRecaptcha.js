import { useCallback, useRef } from 'react';
import store, { authSlice } from '../../store';
import {
  getTokenExpiration,
  saveAnonTokenToLocalStorage,
  scheduleAction,
  UPDATE_BEFORE_EXPIRY_ANON_TOKEN,
  MAX_NUM_ANON_TOKEN_REQUESTS,
  fetchAnonTokenUsingService,
  removeItemFromLocalStorage,
  LOCAL_STORAGE_RECAPTCHA_CONSENT_KEY,
} from '../authHelpers';

let anonTokenRefreshTimeout = null;
let anonTokenRequestsCounter = 0;

const useAnonymousAuthRecaptcha = () => {
  const captchaRef = useRef(null);

  const saveAndDispatchToken = ({ token }) => {
    saveAnonTokenToLocalStorage(token);
    store.dispatch(authSlice.actions.setAnonToken(token?.access_token));
    if (token) {
      let action;
      // We don't want to request new anonymous tokens indefinitely as many users don't close tabs/browsers
      // which results in app not doing anything but requesting new anonymous tokens.
      // To prevent this, the number of token refreshes is limited to MAX_NUM_ANON_TOKEN_REQUESTS.
      // After that, user will be prompted to log in or continue anonymously.
      if (anonTokenRequestsCounter < MAX_NUM_ANON_TOKEN_REQUESTS) {
        //schedule refresh if refresh limit is not reached
        action = captchaRef.current.executeCaptcha;
      } else {
        //schedule dialog popup when refresh limit is reached
        action = clearAnonTokenAndRecaptchaConsent;
      }

      anonTokenRefreshTimeout = scheduleAction(
        getTokenExpiration(token),
        UPDATE_BEFORE_EXPIRY_ANON_TOKEN,
        anonTokenRefreshTimeout,
        action,
      );
    }
  };

  function clearAnonTokenAndRecaptchaConsent() {
    saveAnonTokenToLocalStorage(null);
    removeItemFromLocalStorage(LOCAL_STORAGE_RECAPTCHA_CONSENT_KEY);
    store.dispatch(authSlice.actions.setAnonToken(null));
  }

  const clearAnonTokenRefresh = useCallback(() => {
    anonTokenRequestsCounter = 0;
    if (anonTokenRefreshTimeout) {
      clearTimeout(anonTokenRefreshTimeout);
    }
  }, []);

  const getAnonymousToken = async (siteResponse) => {
    try {
      //fetch new anonymous token
      const anonToken = await fetchAnonTokenUsingService(import.meta.env.VITE_ANON_AUTH_SERVICE_URL, {
        siteResponse,
      });

      //increment anonynous token request counter
      anonTokenRequestsCounter = anonTokenRequestsCounter + 1;

      // save token and schedule refresh
      saveAndDispatchToken({ token: anonToken });
      return anonToken;
    } catch (err) {
      console.error(err.message);
      saveAndDispatchToken({ token: null });
    }
  };

  return { saveAndDispatchToken, clearAnonTokenRefresh, getAnonymousToken, captchaRef };
};

export default useAnonymousAuthRecaptcha;
