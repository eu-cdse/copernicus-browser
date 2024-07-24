import React from 'react';
import './RapidResponseDesk.scss';
import { connect } from 'react-redux';
import AreaAndTimeSection from './AreaTime/AreaAndTimeSection';
import ProviderSection from './Provider/ProviderSection';
import AdvancedSection from './Advanced/AdvancedSection';

const RapidResponseDesk = () => {
  return (
    <div className="rapid-response-desk">
      <AreaAndTimeSection />
      <ProviderSection />
      <AdvancedSection />
      {/* TODO: Add Result section here */}
    </div>
  );
};

const mapStoreToProps = (store) => ({});

export default connect(mapStoreToProps, null)(RapidResponseDesk);
