import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import {
  MAX_CHARACTER_LIMIT_ERROR,
  MAX_CHARACTER_LIMIT_PROCESS_GRAPH_ERROR,
  MAX_URL_LENGTH_FOR_SHORTENING,
  PROCESSING_OPTIONS,
} from '../../const';
import store, { notificationSlice } from '../../store';
import { getShortUrl, getAppropriateHashtags, getSharedLinks } from './SocialShare.utils';
import CopyToClipboardButton from '../CopyToClipboardButton/CopyToClipboardButton';
import useOutsideClick from '../../hooks/useOutsideClick';
import { FacebookShare, TwitterShare, LinkedInShare } from './SocialPlatforms';
import { getLoggedInErrorMsg } from '../../junk/ConstMessages';
import Loader from '../../Loader/Loader';

import './social.scss';

const SocialShare = ({
  displaySocialShareOptions,
  onHandleOutsideClick,
  datasetId,
  user,
  selectedProcessing,
}) => {
  const [generating, setGenerating] = useState(false);
  const ref = useRef();
  const sharedLinks = getSharedLinks();
  const [shortUrl, setShortUrl] = useState('');
  const isLoggedIn = !!user.userdata;

  let currentUrl = window.location.href;

  useEffect(() => {
    sharedLinks[currentUrl] ? setShortUrl(sharedLinks[currentUrl]) : setShortUrl('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl]);

  const shortenUrl = async () => {
    if (!isLoggedIn) {
      store.dispatch(
        notificationSlice.actions.displayError(t`Generate short URL` + `\n(${getLoggedInErrorMsg()})`),
      );
      return;
    }

    if (currentUrl.length > MAX_URL_LENGTH_FOR_SHORTENING) {
      const message =
        selectedProcessing === PROCESSING_OPTIONS.OPENEO
          ? MAX_CHARACTER_LIMIT_PROCESS_GRAPH_ERROR.MESSAGE
          : MAX_CHARACTER_LIMIT_ERROR.MESSAGE;

      store.dispatch(notificationSlice.actions.displayError(message));
      return;
    }

    setGenerating(true);
    setShortUrl(await getShortUrl(currentUrl));
    setGenerating(false);
  };

  useOutsideClick(ref, () => onHandleOutsideClick());

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
            {generating ? <Loader /> : t`Generate`}
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
  selectedProcessing: store.visualization.selectedProcessing,
});

export default connect(mapStoreToProps, null)(SocialShare);
