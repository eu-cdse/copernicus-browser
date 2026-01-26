import React from 'react';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../rehypeConfig';

import CommercialDataPanel from './CommercialDataPanel';

import './CommercialData.scss';

const links = {
  planetScope: 'https://docs.sentinel-hub.com/api/latest/data/planet-scope/',
  planetSkySat: 'https://docs.sentinel-hub.com/api/latest/data/planet/skysat/',
  airbusPleiades: 'https://docs.sentinel-hub.com/api/latest/data/airbus/pleiades/',
  airbusSpot: 'https://docs.sentinel-hub.com/api/latest/data/airbus/spot/',
  maxarWorldView: 'https://docs.sentinel-hub.com/api/latest/data/maxar/world-view/',
  signUp: 'https://dataspace.copernicus.eu/',
  dashboard: 'https://shapps.dataspace.copernicus.eu/dashboard/#/account/billing',
};

const highResImgUrl = `${import.meta.env.VITE_ROOT_URL}commercial-data-previews/high-res-image-example.png`;

const getCommercialDataDescription = () => t`
	
Browse, visualise and analyse Very High Resolution (VHR) data directly in Browser, tapping into global archives of Planet [PlanetScope](${links.planetScope}) and [SkySat](${links.planetSkySat}), Airbus [Pleiades](${links.airbusPleiades}) and [SPOT](${links.airbusSpot}) as well as [Maxar WorldView](${links.maxarWorldView}).  

Observe the planet at resolutions starting at 3 meters and all the way up to 0.5 meters for a cost down to 0.9 EUR per km².

![High resolution imagery example.](${highResImgUrl})

&copy CNES (2020), Distribution AIRBUS DS, contains Pleiades data processed by Sentinel Hub

What you need: 
- An active Sentinel Hub subscription to search the metadata. If you don't have an account yet: [Sign up](${links.signUp}).
- Pre-purchased quota for any of the constellations. Go to [Dashboard](${links.dashboard}) to establish a subscription and purchase commercial data plans. 
`;

const CommercialData = ({ user, userAccountInfo, displayVideo, closeCommercialData }) => {
  const commercialVideoUrl = 'https://www.youtube.com/embed/vnSLr707jE0';

  const { payingAccount, quotasEnabled } = userAccountInfo;
  // to enable commercial data tab
  // - user should be logged in
  // - user should have "paying" account
  // Account in considered "paying" if it
  // - is not a trial
  // - has purchased same  quotas
  if (!user || !user.access_token || !(payingAccount || quotasEnabled)) {
    return (
      <div className="commercial-data-description">
        {displayVideo && (
          <iframe
            className="commercial-video-player"
            src={commercialVideoUrl}
            title="Commercial video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
        <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>
          {getCommercialDataDescription()}
        </ReactMarkdown>
      </div>
    );
  }
  return <CommercialDataPanel quotasEnabled={!!quotasEnabled} closeCommercialData={closeCommercialData} />;
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(CommercialData);
