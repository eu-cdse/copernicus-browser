import React from 'react';
import { t } from 'ttag';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

import UserAuth from './UserAuth';

import './EnsureAuth.scss';
import useAnonymousAuthFingerprint from './AnonymousAuthFingerprint/useAnonymousAuthFingerprint';

const AnonAuthButton = () => {
  const { getAnonymousToken } = useAnonymousAuthFingerprint();
  return (
    <div className="login-button" onClick={getAnonymousToken}>
      {t`Anonymously`}
    </div>
  );
};

const LoginRequired = ({ user }) => (
  <Rodal
    animation="slideUp"
    customStyles={{
      height: '150px',
      bottom: 'auto',
      width: '500px',
      maxWidth: '90vw',
      top: '40vh',
      overflow: 'auto',
    }}
    visible={true}
    showCloseButton={false}
    closeOnEsc={false}
    className="ensure-auth"
    onClose={() => {}}
  >
    <div className="ensure-user-logged-in-modal-text">{t`To continue browsing, please log in or continue anonymously.`}</div>
    <div className="actions">
      <UserAuth user={user} />
      <AnonAuthButton />
    </div>
  </Rodal>
);

const EnsureAuth = ({ user, anonToken, tokenRefreshInProgress, anonAuthCompleted, userAuthCompleted }) => {
  if (!(userAuthCompleted && anonAuthCompleted)) {
    return <div className="login-overlay" />;
  }

  if (!(anonToken || user || tokenRefreshInProgress)) {
    return <LoginRequired user={user} />;
  }

  return null;
};

export default EnsureAuth;
