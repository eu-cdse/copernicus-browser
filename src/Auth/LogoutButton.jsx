import React, { useRef, useState, useCallback } from 'react';
import { t } from 'ttag';

import ChevronUp from '../icons/chevron-up.svg?react';
import ChevronDown from '../icons/chevron-down.svg?react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

export default function LogoutButton(props) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const ref = useRef();
  const handleClickOutside = useCallback(() => {
    setIsUserDropdownOpen(false);
    if (props.isLogoutSelectClicked) {
      props.handleLogoutDropdownState();
    }
  }, [props]);
  useOnClickOutside(ref, handleClickOutside);

  const { user, onLogOut } = props;
  let userName = user.name && user.name.trim() ? user.name : user.email;

  return (
    <div
      ref={ref}
      className={`user-menu-button ${isUserDropdownOpen ? 'expanded' : ''}`}
      onClick={() => {
        setIsUserDropdownOpen((prev) => !prev);
        props.handleLogoutDropdownState();
      }}
    >
      <div className="user-menu-username-button">{userName}</div>
      {isUserDropdownOpen && (
        <div className="user-menu-button-dropdown">
          <div
            className="user-menu-button-dropdown-item"
            onClick={onLogOut}
            title={t`Logout`}
          >{t`Logout`}</div>
        </div>
      )}
      {!isUserDropdownOpen ? <ChevronDown className="chevron-down" /> : <ChevronUp className="chevron-up" />}
    </div>
  );
}
