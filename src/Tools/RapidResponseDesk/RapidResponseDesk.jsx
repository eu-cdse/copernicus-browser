import React, { useState } from 'react';
import './RapidResponseDesk.scss';
import { connect } from 'react-redux';
import AreaAndTimeSection from './sections/AreaTime/AreaAndTimeSection';
import ProviderSection from './sections/ImageQualityAndProviderSection/ImageQualityAndProviderSection';
import AdvancedSection from './sections/Advanced/AdvancedSection';
import { t } from 'ttag';
import Button, { ButtonType } from '../../components/Button/Button';
import MessagePanel from '../VisualizationPanel/MessagePanel/MessagePanel';

const RapidResponseDesk = () => {
  const [cartSize] = useState(0);

  return (
    <div className="rapid-response-desk">
      <div className="rapid-response-desk-body">
        <MessagePanel />
        <AreaAndTimeSection />
        <ProviderSection />
        <AdvancedSection />
        {/* TODO: Add Result section here */}
      </div>
      <div className="rapid-response-desk-footer">
        <div className="wrapped-buttons">
          <Button
            label={t`View cart` + ` (${cartSize})`}
            styleClassName="uppercase-text"
            style={{ marginRight: '8px' }}
          ></Button>
          <Button label={t`Dashboard`} styleClassName="uppercase-text"></Button>
        </div>
        <div className="search-button">
          <Button
            type={ButtonType.success}
            label={t`Search`}
            styleClassName="uppercase-text"
            style={{ width: '126px' }}
          ></Button>
        </div>
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(RapidResponseDesk);
