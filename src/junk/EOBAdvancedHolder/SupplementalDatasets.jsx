import React, { useState } from 'react';
import moment from 'moment';
import { t } from 'ttag';

import DataFusionSupplementalDataset from './DataFusionSupplementalDataset';

import './SupplementalDatasets.scss';

function SupplementalDatasets(props) {
  const { availableSupplementalDatasets, supplementalDatasets = [], initialTimespan } = props;
  const [selectedDataset, setSelectedDataset] = useState(Object.keys(availableSupplementalDatasets)[0]);

  return (
    <div className="supplemental-datasets">
      <div className="supplemental-dataset-label">{t`Additional datasets:`}</div>

      {supplementalDatasets.map((dataset, i) => {
        const { additionalMosaickingOrders, additionalParametersComponent = null } =
          availableSupplementalDatasets[dataset.id];
        const maxDate =
          availableSupplementalDatasets[dataset.id].dataset.maxDate === null
            ? moment.utc()
            : moment.utc(availableSupplementalDatasets[dataset.id].dataset.maxDate);

        const label = availableSupplementalDatasets[dataset.id].label;
        const minDate = availableSupplementalDatasets[dataset.id].dataset.minDate
          ? moment.utc(availableSupplementalDatasets[dataset.id].dataset.minDate)
          : moment.utc('1970-01-01');
        const {
          additionalParameters: initialAdditionalParameters,
          additionalParametersSettings,
          mosaickingOrderDisabled,
        } = availableSupplementalDatasets[dataset.id];
        const { additionalParameters } = dataset;

        return (
          <DataFusionSupplementalDataset
            key={i}
            alias={dataset.alias}
            label={label}
            checkAliasValidity={props.checkAliasValidity}
            timespan={dataset.timespan}
            initialTimespan={initialTimespan}
            additionalMosaickingOrders={additionalMosaickingOrders}
            additionalParameters={additionalParameters || initialAdditionalParameters}
            additionalParametersSettings={additionalParametersSettings}
            additionalParametersComponent={additionalParametersComponent}
            mosaickingOrderDisabled={mosaickingOrderDisabled}
            mosaickingOrder={dataset.mosaickingOrder}
            minDate={minDate}
            maxDate={maxDate}
            updateAlias={props.updateAlias}
            updateTimespan={props.updateTimespan}
            updateMosaickingOrder={props.updateMosaickingOrder}
            updateAdditionalParameters={props.updateAdditionalParameters}
            onRemoveSupplementalDataset={props.onRemoveSupplementalDataset}
          />
        );
      })}

      <div className="add-dataset">
        <select
          className="dropdown-normal-ui"
          value={selectedDataset}
          onChange={(ev) => setSelectedDataset(ev.target.value)}
        >
          {Object.entries(availableSupplementalDatasets).map(([datasetId, datasetInfo]) => (
            <option key={datasetId} value={datasetId}>
              {datasetInfo.label}
            </option>
          ))}
        </select>
        <i className="fas fa-plus-circle" onClick={() => props.onAddSupplementalDataset(selectedDataset)} />
      </div>
    </div>
  );
}

export default SupplementalDatasets;
