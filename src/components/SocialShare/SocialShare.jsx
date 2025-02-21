import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import store, { notificationSlice } from '../../store';
import { getShortUrl, getAppropriateHashtags, getSharedLinks } from './SocialShare.utils';
import CopyToClipboardButton from '../CopyToClipboardButton/CopyToClipboardButton';
import useOutsideClick from '../../hooks/useOutsideClick';
import { FacebookShare, TwitterShare, LinkedInShare } from './SocialPlatforms';
import { getLoggedInErrorMsg } from '../../junk/ConstMessages';

import './social.scss';

const SocialShare = ({ displaySocialShareOptions, toggleSocialSharePanel, datasetId, extraParams, user }) => {
  const ref = useRef();
  const sharedLinks = getSharedLinks();
  const [shortUrl, setShortUrl] = useState('');
  const isLoggedIn = !!user.userdata;

  let currentUrl = window.location.href;
  if (extraParams) {
    currentUrl +=
      '&' +
      Object.keys(extraParams)
        .map((k) => `${k}=${encodeURIComponent(extraParams[k])}`)
        .join('&');
  }

  useEffect(() => {
    sharedLinks[currentUrl] ? setShortUrl(sharedLinks[currentUrl]) : setShortUrl('');
  }, [sharedLinks, currentUrl]);

  const shortenUrl = async () => {
    if (!isLoggedIn) {
      store.dispatch(
        notificationSlice.actions.displayError(t`Generate short URL` + `\n(${getLoggedInErrorMsg()})`),
      );
      return;
    }
    setShortUrl(await getShortUrl(currentUrl));
  };

  useOutsideClick(ref, () => toggleSocialSharePanel());

  if (!displaySocialShareOptions) {
    return null;
  }

  const hashtags = getAppropriateHashtags(datasetId);

  return (
    <div className="social-networks" ref={ref}>
      <div className="short-url-section">
        <div className="copy-url">
          <div className="short-url-container">
            <span className={`short-url ${shortUrl ? '' : 'disabled'}`} ref={ref}>
              {shortUrl || t`Short URL ...`}
            </span>

            <CopyToClipboardButton
              className={`copy-to-clipboard ${shortUrl ? '' : 'disabled'}`}
              title={t`Copy to clipboard`}
              value={shortUrl}
            />
          </div>
        </div>

        <div className="create-short-url-wrapper">
          <button
            className={`create-short-url ${shortUrl ? 'disabled' : ''} ${
              isLoggedIn ? '' : 'visualy-disabled'
            }`}
            onClick={() => shortenUrl()}
          >
            {t`Generate`}
          </button>
        </div>
      </div>
      <div className="social-buttons">
        <FacebookShare url={shortUrl} />
        <TwitterShare url={shortUrl} hashtags={hashtags} />
        <LinkedInShare url={shortUrl} />
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(SocialShare);
