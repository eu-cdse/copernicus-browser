import React, { useState } from 'react';
import './RapidResponseDesk.scss';
import { connect } from 'react-redux';
import AreaAndTimeSection from './sections/AreaTime/AreaAndTimeSection';
import ProviderSection from './sections/Provider/ProviderSection';
import AdvancedSection from './sections/Advanced/AdvancedSection';
import { t } from 'ttag';
import Button from '../../components/Button/Button';

const RapidResponseDesk = () => {
  const [cartSize] = useState(0);

  // const updateCartSize = (size) => {
  //   setCartSize(size);
  // };

  return (
    <div className="rapid-response-desk">
      <div className="rapid-response-desk-body">
        <AreaAndTimeSection />
        <ProviderSection />
        <AdvancedSection />
        {/* TODO: Add Result section here */}
      </div>
      <div className="rapid-response-desk-footer">
        <div className="wrapped-buttons">
          <Button label={t`VIEW CART` + ` (${cartSize})`} style={{ marginRight: '8px' }}></Button>
          <Button label={t`DASHBOARD`}></Button>
        </div>
        <div className="search-button">
          <Button label={t`SEARCH`} className="secondary" style={{ width: '126px' }}></Button>
        </div>
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({});

export default connect(mapStoreToProps, null)(RapidResponseDesk);
