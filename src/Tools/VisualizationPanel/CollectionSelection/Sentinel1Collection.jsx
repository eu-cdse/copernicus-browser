import React from 'react';
import { t } from 'ttag';
import { connect } from 'react-redux';

import store, { visualizationSlice } from '../../../store';

import { S1_OBSERVATION_SCENARIOS } from '../../SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler';
import {
  S1,
  ASCENDING,
  DESCENDING,
  S1_CDAS_IW_VVVH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_SM_VVVH,
} from '../../SearchPanel/dataSourceHandlers/dataSourceConstants';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { MultipleSelection } from './MultipleSelection';

import CheckmarkSvg from './checkmark.svg?react';

import CollectionTooltip from './CollectionTooltip/CollectionTooltip';
import { AttributeTooltips } from '../../../api/OData/assets/tooltips';
import { AttributeNames } from '../../../api/OData/assets/attributes';

const S1DatasetIdOrder = {
  0: 'dataset',
  1: 'host',
  2: 'acquisitionMode',
  3: 'polarizationMode',
};

const getSelectedFiltersFromDataset = (dataset) => {
  let obj = {};
  dataset.split('_').forEach((key, index) => {
    obj[S1DatasetIdOrder[index]] = key;
  });
  return obj;
};

const S1_MODE_POLARIZATION_DEFAULTS = Object.fromEntries(
  [S1_CDAS_IW_VVVH, S1_CDAS_EW_HHHV, S1_CDAS_SM_VVVH].map((id) => {
    const { acquisitionMode, polarizationMode } = getSelectedFiltersFromDataset(id);
    return [acquisitionMode, polarizationMode];
  }),
);

const Sentinel1Collection = ({
  datasource,
  onSelect,
  selectedCollection,
  orbitDirection,
  availableDatasets,
}) => {
  const { dataset, host, acquisitionMode, polarizationMode } = getSelectedFiltersFromDataset(
    selectedCollection.dataset,
  );

  const { ACQUISITION_MODES, POLARIZATIONS, ORBIT_DIRECTIONS } = S1_OBSERVATION_SCENARIOS;

  let supportedModes = null;
  let supportedPolarizations = null;
  if (availableDatasets) {
    const combos = availableDatasets.map((datasetId) => getSelectedFiltersFromDataset(datasetId));
    supportedModes = new Set(combos.map((c) => c.acquisitionMode));
    supportedPolarizations = combos.reduce((acc, c) => {
      if (!acc[c.acquisitionMode]) {
        acc[c.acquisitionMode] = new Set();
      }
      acc[c.acquisitionMode].add(c.polarizationMode);
      return acc;
    }, {});
  }

  const handlePreSelectedPolarization = (acq) => {
    const hardcodedDefault = S1_MODE_POLARIZATION_DEFAULTS[acq];
    if (hardcodedDefault && (!supportedPolarizations?.[acq] || supportedPolarizations[acq].has(hardcodedDefault))) {
      return hardcodedDefault;
    }
    return Object.keys(POLARIZATIONS[acq]).find(
      (pol) => !supportedPolarizations?.[acq] || supportedPolarizations[acq].has(pol),
    );
  };

  const setAcquisitionMode = (acq) => {
    onSelect(
      {
        datasource: datasource,
        dataset: `${dataset}_${host}_${acq}_${handlePreSelectedPolarization(acq)}`,
      },
      orbitDirection,
    );
  };

  const setPolarizationMode = (pol) => {
    onSelect(
      {
        datasource: datasource,
        dataset: `${dataset}_${host}_${acquisitionMode}_${pol}`,
      },
      orbitDirection,
    );
  };

  return (
    <div className="observation-scenarios-wrapper">
      <div className="observation-scenarios-label">
        {t`Acquisition mode:`}
        <CollectionTooltip source={AttributeTooltips[S1][AttributeNames.swathIdentifier]()} />
      </div>

      <div className="observation-scenarios-container">
        {/* Acquisition mode */}
        <div className="acquisition-mode-container">
          {Object.keys(ACQUISITION_MODES)
            .filter((m) => !supportedModes || supportedModes.has(m))
            .map((acquisition_mode) => {
              const isAcquisitionModeSelected = acquisitionMode === acquisition_mode;

              return (
                <div key={acquisition_mode}>
                  <div className="s1-single-collection-wrapper">
                    <EOBButton
                      text={
                        <>
                          {ACQUISITION_MODES[acquisition_mode]}
                          {isAcquisitionModeSelected && <CheckmarkSvg />}
                        </>
                      }
                      title={ACQUISITION_MODES[acquisition_mode]}
                      className={`s1-collection-button secondary ${
                        isAcquisitionModeSelected ? 'selected' : ''
                      }`}
                      onClick={() => setAcquisitionMode(acquisition_mode)}
                    />
                    <CollectionTooltip className="hidden-tooltip" />
                  </div>
                </div>
              );
            })}

          {/* Polarization */}
          <div className="polarization-container">
            <div className="observation-scenarios-label">
              {t`Polarization:`}
              <CollectionTooltip source={AttributeTooltips[S1][AttributeNames.polarisationChannels]()} />
            </div>
            {acquisitionMode &&
              Object.keys(POLARIZATIONS[acquisitionMode])
                .filter(
                  (pol) =>
                    !supportedPolarizations ||
                    !supportedPolarizations[acquisitionMode] ||
                    supportedPolarizations[acquisitionMode].has(pol),
                )
                .map((polarization_mode) => {
                  const isPolarizationSelected = polarizationMode === polarization_mode;

                  return (
                    <div className="s1-single-collection-wrapper" key={polarization_mode}>
                      <EOBButton
                        text={
                          <>
                            {POLARIZATIONS[acquisitionMode][polarization_mode]}
                            {isPolarizationSelected && <CheckmarkSvg />}
                          </>
                        }
                        title={POLARIZATIONS[acquisitionMode][polarization_mode]}
                        className={`s1-collection-button secondary ${isPolarizationSelected ? 'selected' : ''}`}
                        onClick={() => setPolarizationMode(polarization_mode)}
                      />

                      <CollectionTooltip className="hidden-tooltip" />
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Orbit direction */}
        <div className="orbit-direction-container">
          <MultipleSelection
            title={
              <>
                {t`Orbit Direction:`}
                <CollectionTooltip source={AttributeTooltips[S1][AttributeNames.orbitDirection]()} />
              </>
            }
            handleSelect={(newSelectedOption) =>
              handleOrbitSelection({ selectedCollection, newSelectedOption })
            }
            options={[
              { value: ASCENDING, title: ORBIT_DIRECTIONS.ASCENDING },
              { value: DESCENDING, title: ORBIT_DIRECTIONS.DESCENDING },
            ]}
            defaultOptions={{
              [ASCENDING]: orbitDirection ? (orbitDirection.includes(ASCENDING) ? true : false) : true,
              [DESCENDING]: orbitDirection ? (orbitDirection.includes(DESCENDING) ? true : false) : true,
            }}
            tooltips={{
              [ASCENDING]: null,
              [DESCENDING]: null,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  orbitDirection: store.visualization.orbitDirection,
});

export default connect(mapStoreToProps, null)(Sentinel1Collection);

const handleOrbitSelection = ({ selectedCollection, newSelectedOption }) => {
  const orbitDirections = Object.keys(newSelectedOption)
    .map((key) => (newSelectedOption[key] ? key : null))
    .filter((f) => !!f);
  //reset selected dates after orbitDirection is changed
  if (orbitDirections.length) {
    store.dispatch(
      visualizationSlice.actions.setNewDatasetId({
        datasetId: selectedCollection.dataset,
        resetDates: true,
        orbitDirection: orbitDirections,
      }),
    );
  }
};
