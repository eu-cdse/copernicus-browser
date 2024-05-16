import { t } from 'ttag';
import ExternalLink from '../../ExternalLink/ExternalLink';

import Facebook from '../../icons/facebook.svg?react';
import Twitter from '../../icons/twitter.svg?react';
import LinkedIn from '../../icons/linkedIn.svg?react';

export const FacebookShare = ({ url }) => (
  <div
    id="facebook-holder"
    title={t`Share on Facebook`}
    className={`holders ${url?.length ? '' : 'disabled'}`}
  >
    <ExternalLink
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
      className="facebook-share-button"
    >
      <Facebook />
    </ExternalLink>
  </div>
);

export const TwitterShare = ({ url, tweetMessage, hashtags }) => (
  <div
    id="twitter-holder"
    title={t`Share on X (Twitter)`}
    className={`holders ${url?.length ? '' : 'disabled'}`}
  >
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
      <Twitter />
    </ExternalLink>
  </div>
);

export const LinkedInShare = ({ url }) => (
  <div
    id="linked-in-holder"
    title={t`Share on LinkedIn`}
    className={`holders ${url?.length ? '' : 'disabled'}`}
  >
    <ExternalLink
      className="linkedin-share-button"
      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
    >
      <LinkedIn />
    </ExternalLink>
  </div>
);
