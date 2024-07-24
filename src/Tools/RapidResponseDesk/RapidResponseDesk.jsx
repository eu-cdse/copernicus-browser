import React from 'react';
import './RapidResponseDesk.scss';
import { connect } from 'react-redux';
import AreaAndTimeSection from './sections/AreaTime/AreaAndTimeSection';
import ProviderSection from './sections/Provider/ProviderSection';
import AdvancedSection from './sections/Advanced/AdvancedSection';
import { t } from 'ttag';

const RapidResponseDesk = () => {
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
          <div>{t`VIEW CART`}</div>
          <div>{t`DASHBOARD`}</div>
        </div>
        <div>{t`SEARCH`}</div>
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({});

export default connect(mapStoreToProps, null)(RapidResponseDesk);
