import React from 'react';

import ExternalLink from '../../ExternalLink/ExternalLink';
import banner from './banner_climate_change.png';
import moment from 'moment';

export default class Banner extends React.Component {
  startDate = moment('2022-06-30');
  endDate = moment.utc('2022-09-11T21:59');

  render() {
    const shouldBeShown = moment().isBetween(this.startDate, this.endDate, 'minutes', '[]');
    if (!shouldBeShown) {
      return null;
    }

    return (
      <div className="footer-banner">
        <ExternalLink
          className="banner-link"
          href="https://www.sentinel-hub.com/develop/community/contest/#join-the-climate-change-custom-script-contest"
        >
          <img src={banner} alt="EO Browser Climate Change Custom Script Contest" className="banner-img" />
        </ExternalLink>
      </div>
    );
  }
}
