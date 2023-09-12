import React from 'react';
import { t } from 'ttag';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

import UserAuth from './UserAuth';

import './EnsureAuth.scss';

const UserLoginRequired = ({ user }) => (
  <Rodal
    animation="slideUp"
    customStyles={{
      height: '105px',
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
    <div className="ensure-user-logged-in-modal-text">{t`Please login to gain access to full functionalities of the browser.`}</div>
    <UserAuth user={user} />
  </Rodal>
);

const EnsureAuth = ({ user, anonToken, tokenRefreshInProgress, anonAuthCompleted, userAuthCompleted }) => {
  if (!(userAuthCompleted && anonAuthCompleted)) {
    return <div className="login-overlay" />;
  }

  if (!(anonToken || user || tokenRefreshInProgress)) {
    return <UserLoginRequired user={user} />;
  }

  return null;
};

export default EnsureAuth;
