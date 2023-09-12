import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';

import CommercialDataPanel from './CommercialDataPanel';
import { checkUserAccount } from './commercialData.utils';

import './CommercialData.scss';

const getCommercialDataDescription = () => t`
	
Browse, visualise and analyze Very High Resolution (VHR) data directly in EO Browser, tapping into global archives of Planet [PlanetScope](https://docs.sentinel-hub.com/api/latest/data/planet-scope/) and [SkySat](https://docs.sentinel-hub.com/api/latest/data/planet/skysat/), Airbus [Pleiades](https://docs.sentinel-hub.com/api/latest/data/airbus/pleiades/) and [SPOT](https://docs.sentinel-hub.com/api/latest/data/airbus/spot/) as well as [Maxar WorldView](https://docs.sentinel-hub.com/api/latest/data/maxar/world-view/).  

Observe the planet at resolutions starting at 3 meters and all the way up to 0.5 meters for a cost down to 0.9 EUR per km².

![High resolution imagery example.](${process.env.REACT_APP_ROOT_URL}commercial-data-previews/high-res-image-example.png)

&copy CNES (2020), Distribution AIRBUS DS, contains Pleiades data processed by Sentinel Hub

What you need: 
- An active Sentinel Hub subscription to search the metadata. If you don't have an account yet: [Sign up](https://services.sentinel-hub.com/oauth/subscription?param_domain_id=1&param_redirect_uri=https://apps.sentinel-hub.com/dashboard/oauthCallback.html&param_state=%2F&param_scope=&param_client_id=30cf1d-YOUR-INSTANCEID-HERE&domainId=1).
- Pre-purchased quota for any of the constellations. Go to [Dashboard](https://apps.sentinel-hub.com/dashboard/#/account/billing) to establish a subscription and purchase commercial data plans. 
`;

const CommercialData = ({ user, displayVideo, closeCommercialData }) => {
  const [userAccountInfo, setUserAccountInfo] = useState({});
  useEffect(() => {
    const fetchUserAccountInfo = async () => {
      let accountInfo = {
        payingAccount: false,
        quotasEnabled: false,
      };
      try {
        accountInfo = await checkUserAccount(user);
      } catch (err) {
        console.error(err);
      } finally {
        setUserAccountInfo(accountInfo);
      }
    };
    fetchUserAccountInfo();
  }, [user, user.access_token, setUserAccountInfo]);

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
        <ReactMarkdown source={getCommercialDataDescription()} linkTarget="_blank" />
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
