import React from 'react';
import { t } from 'ttag';
import { connect } from 'react-redux';

import store, { visualizationSlice } from '../../../store';

import { S1_OBSERVATION_SCENARIOS } from '../../SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler';
import {
  S1_AWS_IW_VVVH,
  S1_AWS_EW_HHHV,
  S1,
  ASCENDING,
  DESCENDING,
  S1_EW,
  S1_EW_SH,
  S1_CDAS_SM_VVVH,
} from '../../SearchPanel/dataSourceHandlers/dataSourceConstants';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { MultipleSelection } from './MultipleSelection';

import { ReactComponent as CheckmarkSvg } from './checkmark.svg';

import CollectionTooltip from './CollectionTooltip/CollectionTooltip';
import { AttributeTooltips } from '../../../api/OData/assets/tooltips';
import { AttributeNames } from '../../../api/OData/assets/attributes';

const Sentinel1Collection = ({ datasource, onSelect, selectedCollection, orbitDirection }) => {
  // Get filter S1 filter options from dataset for example(S1_AWS_IW_VVVH)
  /* 
    Filter options = {
      dataset: "S1"
      host: "AWS"
      acquisitionMode: "IW"
      polarizationMode: "VVVH"
    }
  */
  const S1DatasetIdOrder = {
    0: 'dataset',
    1: 'host',
    2: 'acquisitionMode',
    3: 'polarizationMode',
  };

  const getSelectedFiltersFromDataset = (dataset) => {
    let obj = {};

    switch (dataset) {
      case S1:
      case S1_EW:
      case S1_EW_SH:
        obj = {
          dataset: 'S1',
          host: 'EOC',
          acquisitionMode: dataset === S1 ? 'IW' : 'EW',
          polarizationMode: dataset === S1 ? 'VVVH' : dataset === S1_EW ? 'HHHV' : 'HH',
        };
        break;
      default:
        dataset.split('_').forEach((key, index) => {
          obj[S1DatasetIdOrder[index]] = key;
        });
        break;
    }

    return obj;
  };

  const { dataset, host, acquisitionMode, polarizationMode } = getSelectedFiltersFromDataset(
    selectedCollection.dataset,
  );

  const { ACQUISITION_MODES, POLARIZATIONS, ORBIT_DIRECTIONS } = S1_OBSERVATION_SCENARIOS;

  const handlePreSelectedPolarization = (acq) => {
    switch (acq) {
      case getSelectedFiltersFromDataset(S1_AWS_IW_VVVH).acquisitionMode:
        return getSelectedFiltersFromDataset(S1_AWS_IW_VVVH).polarizationMode;
      case getSelectedFiltersFromDataset(S1_AWS_EW_HHHV).acquisitionMode:
        return getSelectedFiltersFromDataset(S1_AWS_EW_HHHV).polarizationMode;
      case getSelectedFiltersFromDataset(S1_CDAS_SM_VVVH).acquisitionMode:
        return getSelectedFiltersFromDataset(S1_CDAS_SM_VVVH).polarizationMode;
      default:
        return;
    }
  };

  const setAcquisitionMode = (acq) => {
    let newDataset;

    switch (selectedCollection.dataset) {
      case S1:
      case S1_EW:
      case S1_EW_SH:
        switch (acq) {
          case 'IW':
            newDataset = S1;
            break;
          default:
            newDataset = S1_EW;
            break;
        }
        break;
      default:
        newDataset = `${dataset}_${host}_${acq}_${handlePreSelectedPolarization(acq)}`;
        break;
    }

    onSelect(
      {
        datasource: datasource,
        dataset: newDataset,
      },
      orbitDirection,
    );
  };

  const setPolarizationMode = (pol) => {
    let newDataset;

    switch (selectedCollection.dataset) {
      case S1:
        newDataset = S1;
        break;
      case S1_EW:
      case S1_EW_SH:
        switch (pol) {
          case 'HH':
            newDataset = S1_EW_SH;
            break;
          default:
            newDataset = S1_EW;
            break;
        }
        break;
      default:
        newDataset = `${dataset}_${host}_${acquisitionMode}_${pol}`;
        break;
    }

    onSelect(
      {
        datasource: datasource,
        dataset: newDataset,
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
          {Object.keys(ACQUISITION_MODES).map((acquisition_mode, index) => {
            const isAcquisitionModeSelected = acquisitionMode === acquisition_mode;

            return (
              <div key={index}>
                <div className="s1-single-collection-wrapper">
                  <EOBButton
                    text={
                      <>
                        {ACQUISITION_MODES[acquisition_mode]}
                        {isAcquisitionModeSelected && <CheckmarkSvg />}
                      </>
                    }
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
              Object.keys(POLARIZATIONS[acquisitionMode]).map((polarization_mode, index) => {
                const isPolarizationSelected = polarizationMode === polarization_mode;

                return (
                  <div className="s1-single-collection-wrapper" key={index}>
                    <EOBButton
                      text={
                        <>
                          {POLARIZATIONS[acquisitionMode][polarization_mode]}
                          {isPolarizationSelected && <CheckmarkSvg />}
                        </>
                      }
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
