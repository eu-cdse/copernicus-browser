import React, { useEffect, useMemo, useState } from 'react';
import './Radar.scss';
import { connect } from 'react-redux';
import store, { imageQualityAndProviderSectionSlice } from '../../../../../store';
import ProvidersWithMission from '../shared/ProvidersAndMission';
import {
  getActiveRadarProviders,
  getPolarizationFilterOptions,
  getTaskingFilteredRadarProviders,
} from './Radar.utils';
import { MultiSelectInput } from '../../../../VisualizationPanel/CollectionSelection/AdvancedSearch/filters/MultiSelectInput';
import { t } from 'ttag';
import { AttributeOrbitDirectionValues } from '../../../../../api/OData/assets/attributes';
import Toggle from 'react-toggle';

const Radar = ({
  selectedRadarProvidersAndMissions,
  radarPolarizationFilterArray,
  radarInstrumentFilterArray,
  radarOrbitDirectionArray,
  isTaskingEnabled,
}) => {
  const [isPolarizationToggleEnabled, setPolarizationToggleEnabled] = useState(false);

  const [isInstrumentToggleEnabled, setInstrumentToggleEnabled] = useState(false);

  const initOrbitDirection = () => Object.values(AttributeOrbitDirectionValues);

  const polarizationFilterOptions = getPolarizationFilterOptions(isTaskingEnabled);

  const orbitDirectionOptions = initOrbitDirection();

  const setPolarizationFilter = (value) => {
    store.dispatch(imageQualityAndProviderSectionSlice.actions.setRadarPolarizationFilterArray(value));
  };

  const setInstrumentFilter = (value) => {
    store.dispatch(imageQualityAndProviderSectionSlice.actions.setRadarInstrumentFilterArray(value));
  };

  const setOrbitDirection = (value) => {
    store.dispatch(imageQualityAndProviderSectionSlice.actions.setOrbitDirectionArray(value));
  };

  const handlePolarizationToggle = () => {
    if (isPolarizationToggleEnabled) {
      setPolarizationFilter([]);
    } else {
      setPolarizationFilter(polarizationFilterOptions);
    }
    setPolarizationToggleEnabled(!isPolarizationToggleEnabled);
  };

  useEffect(() => {
    if (
      radarPolarizationFilterArray.length === polarizationFilterOptions.length &&
      !isPolarizationToggleEnabled
    ) {
      setPolarizationToggleEnabled(true);
    } else if (
      radarPolarizationFilterArray.length !== polarizationFilterOptions.length &&
      isPolarizationToggleEnabled
    ) {
      setPolarizationToggleEnabled(false);
    }
  }, [radarPolarizationFilterArray, polarizationFilterOptions.length, isPolarizationToggleEnabled]);

  const radarProvidersCollection = isTaskingEnabled
    ? getTaskingFilteredRadarProviders()
    : getActiveRadarProviders();

  const instrumentFilterOptionsCalculated = useMemo(() => {
    function getUniqueInstruments(collections) {
      const instruments = collections.flatMap((collection) =>
        collection.missions.flatMap((mission) => mission.instruments),
      );

      return [...new Set(instruments.map(JSON.stringify))].map((instrument) => {
        const parsedInstrument = JSON.parse(instrument);
        return {
          ...parsedInstrument,
          value: `${parsedInstrument.value}+${parsedInstrument.label}`,
        };
      });
    }
    return getUniqueInstruments(radarProvidersCollection);
  }, [radarProvidersCollection]);

  useEffect(() => {
    if (
      radarInstrumentFilterArray.length === instrumentFilterOptionsCalculated.length &&
      !isInstrumentToggleEnabled
    ) {
      setInstrumentToggleEnabled(true);
    } else if (
      radarInstrumentFilterArray.length !== instrumentFilterOptionsCalculated.length &&
      isInstrumentToggleEnabled
    ) {
      setInstrumentToggleEnabled(false);
    }
  }, [radarInstrumentFilterArray, instrumentFilterOptionsCalculated.length, isInstrumentToggleEnabled]);

  const handleInstrumentToggle = () => {
    if (isInstrumentToggleEnabled) {
      setInstrumentFilter([]);
    } else {
      setInstrumentFilter(instrumentFilterOptionsCalculated);
    }
    setInstrumentToggleEnabled(!isInstrumentToggleEnabled);
  };

  const renderPolarizationChannelsElement = () => {
    return (
      <div className="polarization-filters-container">
        <div className="polarization-filters-title-wrapper">
          <div className="polarization-filters-label-text-wrapper">
            <div className="polarization-filters-label-text">{t`Polarization channels`}:</div>
            <div className="polarization-filters-label-text-subtitle">({t`Required`})*</div>
          </div>

          {!isTaskingEnabled && (
            <div className="polarization-filters-select-all-wrapper">
              <div className="polarization-filters-label-text-subtitle">{t`Select all`}</div>
              <Toggle
                icons={false}
                checked={isPolarizationToggleEnabled}
                onChange={handlePolarizationToggle}
              />
            </div>
          )}
        </div>
        <MultiSelectInput
          input={{
            id: 'polarization-options',
            getOptions: () => polarizationFilterOptions,
            selectionLimit: isTaskingEnabled ? 1 : undefined,
          }}
          titleEnabled={false}
          value={radarPolarizationFilterArray}
          inputStyle={{ minWidth: '40px' }}
          onChange={(value) => setPolarizationFilter(value)}
        />
      </div>
    );
  };

  const renderInstrumentFilterElement = () => {
    return (
      <div className="instrument-filters-container">
        <div className="instrument-filters-title-wrapper">
          <div className="instrument-filters-label-text-wrapper">
            <div className="instrument-filters-label-text">{`${t`Instrument mode`}`}:</div>
            <div className="instrument-filters-label-text-subtitle">({t`Required`})*</div>
          </div>
          {!isTaskingEnabled && (
            <div className="instrument-filters-select-all-wrapper">
              <div className="instrument-filters-label-text-subtitle">{t`Select all`}</div>
              <Toggle icons={false} checked={isInstrumentToggleEnabled} onChange={handleInstrumentToggle} />
            </div>
          )}
        </div>
        <MultiSelectInput
          input={{
            id: 'instrument-filters-options',
            getOptions: () => instrumentFilterOptionsCalculated,
            selectionLimit: isTaskingEnabled ? 1 : undefined,
          }}
          titleEnabled={false}
          value={radarInstrumentFilterArray}
          inputStyle={{ minWidth: '40px' }}
          onChange={(value) => setInstrumentFilter(value)}
        />
      </div>
    );
  };

  const renderOrbitDirectionsElement = () => {
    return (
      <div className="orbit-direction-container">
        <label className="orbit-direction-label-text">{`${t`Orbit direction`}:`}</label>
        <MultiSelectInput
          input={{ id: 'orbit-direction-options', getOptions: () => orbitDirectionOptions }}
          titleEnabled={false}
          value={radarOrbitDirectionArray}
          inputStyle={{ minWidth: '40px' }}
          onChange={(value) => setOrbitDirection(value)}
        />
      </div>
    );
  };

  const renderBody = () => {
    return (
      <>
        <ProvidersWithMission
          providersAndMissions={selectedRadarProvidersAndMissions}
          storeProvidersAndMissions={(value) =>
            store.dispatch(
              imageQualityAndProviderSectionSlice.actions.setSelectedRadarProvidersAndMissions(value),
            )
          }
          providersCollection={radarProvidersCollection}
        />
        {renderInstrumentFilterElement()}
        {renderPolarizationChannelsElement()}
        {renderOrbitDirectionsElement()}
      </>
    );
  };

  return <div className="radio-type-container">{renderBody()}</div>;
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  selectedRadarProvidersAndMissions: store.imageQualityAndProviderSection.selectedRadarProvidersAndMissions,
  radarPolarizationFilterArray: store.imageQualityAndProviderSection.radarPolarizationFilterArray,
  radarInstrumentFilterArray: store.imageQualityAndProviderSection.radarInstrumentFilterArray,
  radarOrbitDirectionArray: store.imageQualityAndProviderSection.radarOrbitDirectionArray,
  radarSensorMode: store.imageQualityAndProviderSection.radarSensorMode,
  radarProcessorMode: store.imageQualityAndProviderSection.radarProcessorMode,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
});

export default connect(mapStoreToProps, null)(Radar);
