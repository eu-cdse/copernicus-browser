import React from 'react';
import { t } from 'ttag';
import LogoutButton from './LogoutButton';
import useLoginLogout from './loginLogout/useLoginLogout';

const UserAuth = (props) => {
  const { doLogin, doLogout } = useLoginLogout();

  const { user } = props;

  return (
    <span className="user-panel">
      {user ? (
        <LogoutButton
          user={user}
          onLogOut={doLogout}
          handleLogoutDropdownState={props.handleLogoutDropdownState}
          isLogoutSelectClicked={props.isLogoutSelectClicked}
        />
      ) : (
        <div
          className="login-button"
          onClick={doLogin}
          title={t`Login to unlock advanced features such as timelapse, analytical download, own configurations and more.`}
        >
          {t`Login`}
        </div>
      )}
    </span>
  );
};

export default UserAuth;
