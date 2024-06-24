import React from 'react';
import { t } from 'ttag';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

import UserAuth from './UserAuth';

import './EnsureAuth.scss';
import ReactMarkdown from 'react-markdown';

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
      height: '250px',
      bottom: 'auto',
      width: '550px',
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
    <div className="recaptcha-cookie-notice">
      <ReactMarkdown linkTarget="_blank">
        {t`By continuing anonymously, you consent to the use of cookies by recaptcha.net and related collection, sharing and use of personal data by recaptcha.net. Alternatively, you can sign-in. See also [Terms and conditions](https://dataspace.copernicus.eu/terms-and-conditions)`}
      </ReactMarkdown>
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
  if (!userAuthCompleted && !anonAuthCompleted) {
    return <div className="login-overlay" />;
  }

  if (!(anonToken || user || tokenRefreshInProgress)) {
    return <LoginRequired user={user} executeAnonAuth={executeAnonAuth} />;
  }

  return null;
};

export default EnsureAuth;
