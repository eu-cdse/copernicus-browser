import React, { useState, useRef, useEffect } from 'react';
import { t } from 'ttag';

import { getShortUrl, getAppropriateHashtags, getSharedLinks } from './SocialShare.utils';
import CopyToClipboardButton from '../CopyToClipboardButton/CopyToClipboardButton';
import useOutsideClick from '../../hooks/useOutsideClick';
import { FacebookShare, TwitterShare, LinkedInShare } from './SocialPlatforms';

import './social.scss';

const SocialShare = ({ displaySocialShareOptions, toggleSocialSharePanel, datasetId, extraParams }) => {
  const ref = useRef();
  const sharedLinks = getSharedLinks();
  const [shortUrl, setShortUrl] = useState('');

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
          <button className={`create-short-url ${shortUrl ? 'disabled' : ''}`} onClick={() => shortenUrl()}>
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

export default SocialShare;
