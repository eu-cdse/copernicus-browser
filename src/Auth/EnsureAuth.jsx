import React from 'react';
import { t } from 'ttag';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

import UserAuth from './UserAuth';

import './EnsureAuth.scss';

const AnonAuthButton = ({ executeAnonAuth }) => {
  return (
    <div className="login-button" onClick={executeAnonAuth}>
      {t`Anonymously`}
    </div>
  );
};

const LoginRequired = ({ user, executeAnonAuth }) => (
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
      <AnonAuthButton executeAnonAuth={executeAnonAuth} />
    </div>
  </Rodal>
);

const EnsureAuth = ({
  user,
  anonToken,
  tokenRefreshInProgress,
  anonAuthCompleted,
  userAuthCompleted,
  executeAnonAuth,
}) => {
  if (!(userAuthCompleted && anonAuthCompleted)) {
    return <div className="login-overlay" />;
  }

  if (!(anonToken || user || tokenRefreshInProgress)) {
    return <LoginRequired user={user} executeAnonAuth={executeAnonAuth} />;
  }

  return null;
};

export default EnsureAuth;
