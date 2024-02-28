import React, { Component } from 'react';
import { t } from 'ttag';
import onClickOutside from 'react-onclickoutside';

import ExternalLink from '../ExternalLink/ExternalLink';

import { ReactComponent as ChevronUp } from '../icons/chevron-up.svg';
import { ReactComponent as ChevronDown } from '../icons/chevron-down.svg';

class LogoutButton extends Component {
  state = {
    isUserDropdownOpen: false,
  };

  handleClickOutside = () => {
    this.setState({
      isUserDropdownOpen: false,
    });

    if (this.props.isLogoutSelectClicked) {
      this.props.handleLogoutDropdownState();
    }
  };

  render() {
    const { user, onLogOut } = this.props;
    const { isUserDropdownOpen } = this.state;
    let userName = user.name && user.name.trim() ? user.name : user.email;

    return (
      <div
        className={`user-menu-button ${isUserDropdownOpen ? 'expanded' : ''}`}
        onClick={() => {
          this.setState((prevState) => ({ isUserDropdownOpen: !prevState.isUserDropdownOpen }));
          this.props.handleLogoutDropdownState();
        }}
      >
        <div className="user-menu-username-button">{userName}</div>
        {isUserDropdownOpen && (
          <div className="user-menu-button-dropdown">
            <ExternalLink
              className={'user-menu-button-dropdown-item'}
              title={t`Sentinel Hub Dashboard`}
              href={'https://shapps.dataspace.copernicus.eu/dashboard/'}
            >
              {t`SH Dashboard`}
            </ExternalLink>
            <ExternalLink
              className={'user-menu-button-dropdown-item'}
              title={t`Data Workspace`}
              href={'https://dataspace.copernicus.eu/workspace/'}
            >
              {t`Workspace`}
            </ExternalLink>
            <div
              className="user-menu-button-dropdown-item"
              onClick={onLogOut}
              title={t`Logout`}
            >{t`Logout`}</div>
          </div>
        )}
        {!isUserDropdownOpen ? (
          <ChevronDown className="chevron-down" />
        ) : (
          <ChevronUp className="chevron-up" />
        )}
      </div>
    );
  }
}

export default onClickOutside(LogoutButton);
