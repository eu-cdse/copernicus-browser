import React, { Component } from 'react';
import { connect } from 'react-redux';

import UserAuth from '../../Auth/UserAuth';
import LanguageSelector from '../../LanguageSelector/LanguageSelector';
import ChevronCollapse from './chevron-collapse.svg?react';
import './Header.scss';
import MainLogo from './main-logo.svg?react';
import RRDLogo from './rrd-logo.svg?react';
import { isInGroup } from '../../Auth/authHelpers';
import { RRD_GROUP } from '../../api/RRD/assets/rrd.utils';

class HeaderWithLogin extends Component {
  state = {
    isLogoutSelectClicked: false,
  };

  handleLogoutDropdownState = () => {
    this.setState((prevState) => ({ isLogoutSelectClicked: !prevState.isLogoutSelectClicked }));
  };

  render() {
    const { user, setDefaultStateLandingPage } = this.props;
    const { isLogoutSelectClicked } = this.state;

    return (
      <header id="header">
        <div className="left">
          {isInGroup(RRD_GROUP) ? (
            <RRDLogo className="rrd-logo" onClick={setDefaultStateLandingPage} />
          ) : (
            <MainLogo className="main-logo" onClick={setDefaultStateLandingPage} />
          )}
        </div>

        <div className="right">
          <div className="row">
            <LanguageSelector />
            <UserAuth
              handleLogoutDropdownState={this.handleLogoutDropdownState}
              isLogoutSelectClicked={isLogoutSelectClicked}
              user={user}
            />
            <div className="toggle-settings" onClick={this.props.toggleTools}>
              <ChevronCollapse className="chevron-collapse" />
            </div>
          </div>
        </div>
      </header>
    );
  }
}

const mapStoreToProps = (store) => ({
  user: store.auth.user.userdata,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(HeaderWithLogin);
