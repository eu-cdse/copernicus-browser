import React, { Component } from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import './SharePinsLink.scss';
import { t } from 'ttag';

import store, { modalSlice } from '../../store';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { createShareLink } from './Pin.utils';

class SharePinsLink extends Component {
  state = {
    loading: true,
    error: null,
    shareLink: null,
    isCopiedToClipboard: false,
  };

  createSharePinsLink = async (pins) => {
    try {
      const shareLink = await createShareLink(pins);
      this.setState({
        shareLink: shareLink,
        loading: false,
      });
    } catch (ex) {
      console.error('Error while creating share link', ex);
      this.setState({ error: 'Error while creating share link', loading: false });
    }
  };

  componentDidMount = async () => {
    await this.createSharePinsLink(this.props.selectedPins);
  };

  onClose = () => {
    if (this.props.onClose()) {
      this.props.onClose();
    }
    store.dispatch(modalSlice.actions.removeModal());
  };

  copyToClipboard = () => {
    const { shareLink } = this.state;
    let textField = document.createElement('textarea');
    textField.innerText = shareLink;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    setTimeout(() => this.setState({ isCopiedToClipboard: true }), 400);
  };

  render() {
    const { error, loading, shareLink, isCopiedToClipboard } = this.state;
    return (
      <Rodal
        animation="slideUp"
        visible={true}
        width={500}
        height={170}
        onClose={this.onClose}
        closeOnEsc={true}
      >
        <div className="share-pins-link">
          <h3>{t`Share pins link`}</h3>
          {loading && (
            <div className="fetching">
              <i className="fa fa-cog fa-spin fa-3x fa-fw" />
              <span>{t`Creating link...`}</span>
            </div>
          )}
          {!loading && (
            <div className="content">
              {shareLink && <div>{shareLink}</div>}
              {error && <div>{error}</div>}
              <div className="actions">
                <EOBButton text={t`OK`} onClick={this.onClose}></EOBButton>
                <EOBButton
                  icon={isCopiedToClipboard ? 'check-circle' : ''}
                  text={t`Copy to clipboard`}
                  onClick={this.copyToClipboard}
                  disabled={isCopiedToClipboard}
                ></EOBButton>
              </div>
            </div>
          )}
        </div>
      </Rodal>
    );
  }
}

const mapStoreToProps = (store) => ({
  selectedPins: store.modal.params ? store.modal.params.selectedPins : null,
  onClose: store.modal.params ? store.modal.params.onClose : null,
});

export default connect(mapStoreToProps, null)(SharePinsLink);
