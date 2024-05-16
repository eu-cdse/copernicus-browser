import React, { Component } from 'react';
import { t } from 'ttag';

import './copyToClipboard.scss';

class CopyToClipboard extends Component {
  state = {
    copied: false,
  };
  elem = null;

  componentDidMount() {
    this.elem.addEventListener('copy', this.putTextInClipboard);
  }

  componentWillUnmount() {
    this.elem.removeEventListener('copy', this.putTextInClipboard);
  }

  putTextInClipboard = (e) => {
    e.clipboardData.setData('text/plain', this.props.value);
    e.preventDefault();
    this.setState({ copied: true });
  };

  doCopy = () => {
    document.execCommand('copy');
  };

  setCopiedToFalse = () => {
    setTimeout(() => {
      this.setState({ copied: false });
    }, 200);
  };

  selectAllText = (e) => {
    e.target.select();
  };

  render() {
    return (
      <div
        className="copy-wrapper"
        ref={(elem) => {
          this.elem = elem;
        }}
      >
        <input
          className="copy-input"
          defaultValue={this.props.value}
          readOnly={true}
          onFocus={this.selectAllText}
        />
        <div
          className={this.state.copied ? 'copy-btn tooltipped tooltipped-n' : 'copy-btn'}
          onClick={this.doCopy}
          onMouseLeave={this.setCopiedToFalse}
          aria-label={this.state.copied ? t`Copied` : t`Copy to clipboard`}
          title={t`Copy to clipboard`}
        >
          <i className="fa fa-copy" />
        </div>
      </div>
    );
  }
}

export default CopyToClipboard;
