import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import axios from 'axios';
import { useState } from 'react';
import store, { authSlice } from '../../store';
import {
  getAnonTokenFromLocalStorage,
  getTokenExpiration,
  saveAnonTokenToLocalStorage,
  scheduleTokenRefresh,
  UPDATE_BEFORE_EXPIRY_ANON_TOKEN,
} from '../authHelpers';
import { delay } from '../../utils';

let anonTokenRefreshTimeout = null;

const fetchTokenFingerprint = async ({ requestId, visitorId }) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const body = { requestId: requestId, visitorId: visitorId };
  const { data } = await axios.post(process.env.REACT_APP_ANON_AUTH_FINGERPRINT_URL, body, {
    headers,
  });

  return data;
};

const useAnonymousAuthFingerprint = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { getData } = useVisitorData({ extendedResult: true }, { immediate: false });

  const scheduleRefresh = (expires_at) => {
    scheduleTokenRefresh(expires_at, UPDATE_BEFORE_EXPIRY_ANON_TOKEN, anonTokenRefreshTimeout, refreshToken);
  };

  const saveAndDispatchToken = ({ token }) => {
    saveAnonTokenToLocalStorage(token);
    store.dispatch(authSlice.actions.setAnonToken(token?.access_token));
    if (token) {
      scheduleRefresh(getTokenExpiration(token));
    }
  };

  const fetchWithRetry = async ({ retriesLeft, delayBetweenRetries }) => {
    try {
      const visitorData = await getData();
      const anonToken = await fetchTokenFingerprint(visitorData);
      return anonToken;
    } catch (e) {
      if (axios.isCancel(e)) {
        return;
      }
      console.error(e.message);
      if (retriesLeft) {
        await delay(delayBetweenRetries);
        return fetchWithRetry({
          retriesLeft: retriesLeft - 1,
          delayBetweenRetries: delayBetweenRetries * 2,
        });
      }
      throw e;
    }
  };

  const fetchToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const anonToken = await fetchWithRetry({ retriesLeft: 1, delayBetweenRetries: 1000 });
      return anonToken;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const refreshToken = async () => {
    const anonToken = await fetchToken();
    if (anonToken) {
      saveAndDispatchToken({ token: anonToken });
    } else {
      saveAndDispatchToken({ token: null });
    }
  };

  const getAnonymousToken = async () => {
    let anonToken = await getAnonTokenFromLocalStorage();
    if (!anonToken) {
      anonToken = await fetchToken();
    }

    if (anonToken) {
      saveAndDispatchToken({ token: anonToken });
    } else {
      saveAndDispatchToken({ token: null });
    }
    return anonToken;
  };

  return { loading, error, getAnonymousToken };
};

export default useAnonymousAuthFingerprint;
