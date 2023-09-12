import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';
import { t } from 'ttag';

import ExternalLink from '../../ExternalLink/ExternalLink';
import { sendFirebaseRequest, getAppropriateHashtags } from './SocialShare.utils';

import './social.scss';

const MAX_RETRIES = 5;

class SocialShare extends Component {
  state = {
    shortUrl: '',
    lastShortenedUrl: '',
    currentRetries: 0,
    copyToClipboardConfirmation: false,
  };

  handleClickOutside = () => {
    if (this.props.displaySocialShareOptions) {
      this.props.toggleSocialSharePanel();
    }
  };

  shortenUrl = async (extraParams) => {
    let currentUrl = window.location.href;

    if (extraParams) {
      currentUrl +=
        '&' +
        Object.keys(extraParams)
          .map((k) => `${k}=${encodeURIComponent(extraParams[k])}`)
          .join('&');
    }

    if (
      this.state.lastShortenedUrl === currentUrl &&
      (this.state.shortUrl.length || this.state.currentRetries >= MAX_RETRIES)
    ) {
      return;
    }

    const shortUrl = await sendFirebaseRequest(currentUrl);

    if (!shortUrl.length) {
      this.setState((prevState) => ({
        shortUrl: '',
        lastShortenedUrl: currentUrl,
        currentRetries: prevState.currentRetries + 1,
      }));
      return;
    }
    this.setState({
      shortUrl: shortUrl,
      lastShortenedUrl: currentUrl,
      currentRetries: 0,
    });
  };

  copyToClipboard = () => {
    const copyText = document.getElementById('copy-url-social-share');
    copyText.select();
    document.execCommand('copy');
    this.setState({ copyToClipboardConfirmation: true });
    setTimeout(() => this.setState({ copyToClipboardConfirmation: false }), 400);
  };

  render() {
    const { displaySocialShareOptions, datasetId, extraParams } = this.props;
    const { shortUrl, copyToClipboardConfirmation } = this.state;
    if (!displaySocialShareOptions) {
      return null;
    }
    this.shortenUrl(extraParams);
    const hashtags = getAppropriateHashtags(datasetId);
    return (
      <div className="social-networks">
        <div className="copy-url">
          <input
            readOnly
            type="text"
            value={shortUrl}
            id="copy-url-social-share"
            className="holders"
            disabled={!shortUrl.length}
          />
          <div
            className={`copy-to-clipboard ${shortUrl.length ? '' : 'disabled'}`}
            onClick={this.copyToClipboard}
            title={t`Copy to clipboard`}
          >
            <i className={`fa ${copyToClipboardConfirmation ? 'fa-check-circle' : 'fa-copy'}`} />
          </div>
        </div>

        <div className="social-buttons">
          <FacebookShare url={shortUrl} />
          <TwitterShare url={shortUrl} hashtags={hashtags} />
          <LinkedInShare url={shortUrl} />
        </div>
      </div>
    );
  }
}
export default onClickOutside(SocialShare);

const FacebookShare = ({ url }) => (
  <div
    id="facebook-holder"
    title={t`Share on Facebook`}
    className={`holders ${url.length ? '' : 'disabled'}`}
  >
    <ExternalLink
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
      className="facebook-share-button"
    >
      <i className="fab fa-facebook-square" />
    </ExternalLink>
  </div>
);

const TwitterShare = ({ url, tweetMessage, hashtags }) => (
  <div id="twitter-holder" title={t`Share on Twitter`} className={`holders ${url.length ? '' : 'disabled'}`}>
    <ExternalLink
      className="twitter-share-button"
      href={
        'https://twitter.com/intent/tweet?text=' +
        (tweetMessage || t`Check this out `) +
        '&url=' +
        url +
        '&hashtags=' +
        hashtags
      }
    >
      <i className="fab fa-twitter-square" />
    </ExternalLink>
  </div>
);

const LinkedInShare = ({ url }) => (
  <div
    id="linked-in-holder"
    title={t`Share on LinkedIn`}
    className={`holders ${url.length ? '' : 'disabled'}`}
  >
    <ExternalLink
      className="linkedin-share-button"
      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
    >
      <i className="fab fa-linkedin" />
    </ExternalLink>
  </div>
);
