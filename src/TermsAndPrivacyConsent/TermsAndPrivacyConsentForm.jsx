import React, { useState } from 'react';
import Rodal from 'rodal';
import { t } from 'ttag';

import ExternalLink from '../ExternalLink/ExternalLink';
import store, { authSlice, modalSlice } from '../store';
import { LOCAL_STORAGE_PRIVACY_CONSENT_KEY } from '../const';

import './TermsAndPrivacyConsentForm.scss';
import useLoginLogout from '../Auth/loginLogout/useLoginLogout';
import { saveToLocalStorage } from '../utils/localStorage.utils';

export default function TermsAndPrivacyConsentForm() {
  const [hasRejected, setHasRejected] = useState(false);
  const { doLogin } = useLoginLogout();

  function onSelect(selection) {
    if (selection) {
      saveToLocalStorage(LOCAL_STORAGE_PRIVACY_CONSENT_KEY, true);
      store.dispatch(authSlice.actions.setTermsPrivacyAccepted(true));
      store.dispatch(modalSlice.actions.removeModal());
    } else {
      store.dispatch(authSlice.actions.setTermsPrivacyAccepted(false));
      setHasRejected(true);
    }
  }

  async function onLogInClick() {
    await doLogin();

    onSelect(true);
  }

  return (
    <Rodal
      animation="slideUp"
      visible={true}
      customStyles={{
        width: '30vw',
        minWidth: 200,
        height: 'auto',
        bottom: 'auto',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: 30,
      }}
      showCloseButton={false}
      onClose={() => {}}
    >
      <div className="terms-and-privacy">
        {hasRejected ? (
          <>
            <div className="message reject-message">
              {t`We use third-party cookies to provide secure authentication with Sentinel Hub services, which is required to provide the basic functionality of the application.`}
              <div className="learn-more">
                {t`Learn more about`}{' '}
                <ExternalLink
                  href="https://dataspace.copernicus.eu/"
                  className="link-external"
                >{t`Copernicus Browser`}</ExternalLink>
                .
              </div>
            </div>

            <div onClick={() => setHasRejected(false)} className="eob-btn back-btn">
              {/*we add eslint-disable here as otherwise npm run translate produces different .po files on windows and linux due to t`back` being added to tranlsations at two spots in the app */}
              {
                // eslint-disable-next-line
                <a>
                  <i className="fa fa-arrow-left" />
                  {t`Back`}
                </a>
              }
            </div>
          </>
        ) : (
          <>
            <div className="message">
              {t`In order to use the application, you need to accept`}{' '}
              <ExternalLink
                href="https://www.sentinel-hub.com/tos/"
                className="link-external"
              >{t`Terms of Service and Privacy Policy`}</ExternalLink>
              .
            </div>
            <div className="button-holder">
              <div className="eob-btn accept-btn" onClick={() => onSelect(true)}>
                {t`ACCEPT`}
              </div>
              <div className="eob-btn reject-btn" onClick={() => onSelect(false)}>
                {t`REJECT`}
              </div>
            </div>
            <div className="log-in-option">
              {t`If you have an account, you have already agreed to Terms of Service and Privacy Policy`}
              {'. '}
              <span onClick={onLogInClick} className="log-in-button">{t`Log in`}</span>
            </div>
          </>
        )}
      </div>
    </Rodal>
  );
}
