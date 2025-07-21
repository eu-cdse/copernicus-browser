import React from 'react';
import { connect } from 'react-redux';

import store, { imageQualityAndProviderSectionSlice } from '../../../../../store';
import ProvidersWithMission from '../shared/ProvidersAndMission';
import { getActiveAtmosProviders } from './Atmos.utils';

const Atmos = ({ selectedAtmosProvidersAndMissions }) => {
  const opticalProvidersCollection = getActiveAtmosProviders();

  const renderBody = () => {
    return (
      <>
        <ProvidersWithMission
          providersAndMissions={selectedAtmosProvidersAndMissions}
          storeProvidersAndMissions={(value) =>
            store.dispatch(
              imageQualityAndProviderSectionSlice.actions.setSelectedAtmosProvidersAndMissions(value),
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
  selectedAtmosProvidersAndMissions: store.imageQualityAndProviderSection.selectedAtmosProvidersAndMissions,
});

export default connect(mapStoreToProps, null)(Atmos);
