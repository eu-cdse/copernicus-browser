import React from 'react';
import './Optical.scss';
import { connect } from 'react-redux';
import { t } from 'ttag';
import Slider from 'rc-slider';
import store, { imageQualityAndProviderSectionSlice } from '../../../../../store';
import ProvidersWithMission from '../shared/ProvidersAndMission';
import { getActiveOpticalProviders } from './Optical.utils';

const Optical = ({ cloudCoverage, selectedOpticalProvidersAndMissions }) => {
  const updateSliderValue = (value) => {
    store.dispatch(imageQualityAndProviderSectionSlice.actions.setCloudCoverage(value));
  };

  const opticalProvidersCollection = getActiveOpticalProviders();

  const renderCloudCoverageElement = () => {
    return (
      <div className="cloud-coverage-slider-container">
        <label className="cloud-label-text">{`${t`Cloud coverage`}:`}</label>
        <Slider
          className="cloud-slider"
          min={0}
          max={1}
          step={0.01}
          value={cloudCoverage}
          onChange={updateSliderValue}
        />
        <span className="coverage-current-value-text">{`${Math.round(cloudCoverage * 100)}%`}</span>
      </div>
    );
  };

  const renderBody = () => {
    return (
      <>
        {renderCloudCoverageElement()}
        <ProvidersWithMission
          providersAndMissions={selectedOpticalProvidersAndMissions}
          storeProvidersAndMissions={(value) =>
            store.dispatch(
              imageQualityAndProviderSectionSlice.actions.setSelectedOpticalProvidersAndMissions(value),
            )
          }
          providersCollection={opticalProvidersCollection}
        />
      </>
    );
  };

  return <div className="optical-type-container">{renderBody()}</div>;
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  cloudCoverage: store.imageQualityAndProviderSection.cloudCoverage,
  selectedOpticalProvidersAndMissions:
    store.imageQualityAndProviderSection.selectedOpticalProvidersAndMissions,
});

export default connect(mapStoreToProps, null)(Optical);
