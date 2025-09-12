import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import store, { authSlice } from '../store';
import { LOCAL_STORAGE_PRIVACY_CONSENT_KEY } from '../const';
import TermsAndPrivacyConsentForm from './TermsAndPrivacyConsentForm';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/localStorage.utils';

function EnsureTermsPrivacy({ userToken, termsPrivacyAccepted }) {
  useEffect(() => {
    const consent = getFromLocalStorage(LOCAL_STORAGE_PRIVACY_CONSENT_KEY) === 'true';
    if (userToken || consent) {
      store.dispatch(authSlice.actions.setTermsPrivacyAccepted(true));
    } else if (termsPrivacyAccepted) {
      saveToLocalStorage(LOCAL_STORAGE_PRIVACY_CONSENT_KEY, true);
    }
    // eslint-disable-next-line
  }, []);

  if (userToken || getFromLocalStorage(LOCAL_STORAGE_PRIVACY_CONSENT_KEY) === 'true') {
    return null;
  }

  if (!termsPrivacyAccepted) {
    return <TermsAndPrivacyConsentForm />;
  }

  return (
    <div className="initial-loader">
      <i className="fa fa-cog fa-spin fa-3x fa-fw" />
    </div>
  );
}

const mapStoreToProps = (store) => ({
  userToken: store.auth.user.access_token,
  termsPrivacyAccepted: store.auth.terms_privacy_accepted,
});

export default connect(mapStoreToProps, null)(EnsureTermsPrivacy);
