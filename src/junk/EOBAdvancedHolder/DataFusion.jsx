import React from 'react';
import {
  DATASET_AWSEU_S1GRD,
  DATASET_AWS_DEM,
  DATASET_BYOC,
  DEMInstanceType,
  LocationIdSHv3,
  DATASET_CDAS_S2L2A,
  DATASET_CDAS_S1GRD,
  DATASET_CDAS_S2L1C,
  DATASET_CDAS_S3SLSTR,
  DATASET_CDAS_S3OLCI,
  DATASET_CDAS_S5PL2,
  DATASET_CDAS_DEM,
  DATASET_S3SLSTR,
  DATASET_S3OLCI,
  DATASET_S5PL2,
  DATASET_AWS_LMSSL1,
  DATASET_AWS_LTML1,
  DATASET_AWS_LTML2,
  DATASET_AWS_LETML1,
  DATASET_AWS_LETML2,
  DATASET_AWS_LOTL1,
  DATASET_AWS_LOTL2,
  BYOCSubTypes,
  SHV3_LOCATIONS_ROOT_URL,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';
import { connect } from 'react-redux';

import SupplementalDatasets from './SupplementalDatasets';
import DataFusionPrimaryDataset from './DataFusionPrimaryDataset';
import {
  getAllAvailableCollections,
  getDataSourceHandler,
  getSHServiceRootUrl,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import DataFusionAdditionalParametersS1 from './DataFusionAdditionalParametersS1';
import DataFusionAdditionalParameters from './DataFusionAdditionalParameters';

import './DataFusion.scss';
import CustomCheckbox from '../../components/CustomCheckbox/CustomCheckbox';

const DATAFUSION_DATASETS = {
  [DATASET_AWSEU_S1GRD.id]: {
    label: 'S-1 GRD',
    dataset: DATASET_AWSEU_S1GRD,
    additionalMosaickingOrders: [],
    additionalParameters: {},
    additionalParametersComponent: DataFusionAdditionalParametersS1,
  },
  [DATASET_S3SLSTR.id]: {
    label: 'S-3 SLSTR',
    dataset: DATASET_S3SLSTR,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_S3OLCI.id]: {
    label: 'S-3 OLCI',
    dataset: DATASET_S3OLCI,
    additionalMosaickingOrders: [],
  },
  [DATASET_S5PL2.id]: {
    label: 'S-5P L2',
    dataset: DATASET_S5PL2,
    additionalMosaickingOrders: [],
  },
  [DATASET_AWS_LMSSL1.id]: {
    label: 'Landsat 1-5 MSS L1',
    dataset: DATASET_AWS_LMSSL1,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_AWS_LTML1.id]: {
    label: 'Landsat 4-5 TM L1',
    dataset: DATASET_AWS_LTML1,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_AWS_LTML2.id]: {
    label: 'Landsat 4-5 TM L2',
    dataset: DATASET_AWS_LTML2,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_AWS_LETML1.id]: {
    label: 'Landsat 7 ETM+ L1',
    dataset: DATASET_AWS_LETML1,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_AWS_LETML2.id]: {
    label: 'Landsat 7 ETM+ L2',
    dataset: DATASET_AWS_LETML2,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_AWS_LOTL1.id]: {
    label: 'Landsat 8-9 L1',
    dataset: DATASET_AWS_LOTL1,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_AWS_LOTL2.id]: {
    label: 'Landsat 8-9 L2',
    dataset: DATASET_AWS_LOTL2,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_AWS_DEM.id]: {
    label: 'DEM',
    dataset: DATASET_AWS_DEM,
    mosaickingOrderDisabled: true,
    additionalMosaickingOrders: [],
    additionalParametersComponent: DataFusionAdditionalParameters,
    additionalParameters: { demInstance: DEMInstanceType.MAPZEN },
    additionalParametersSettings: {
      demInstance: {
        parameterType: 'select',
        getName: () => t`DEM instance`,
        options: [
          { name: 'Mapzen', value: DEMInstanceType.MAPZEN },
          { name: 'Copernicus 30', value: DEMInstanceType.COPERNICUS_30 },
          { name: 'Copernicus 90', value: DEMInstanceType.COPERNICUS_90 },
        ],
      },
    },
  },
  [DATASET_BYOC.id]: {
    label: 'BYOC',
    dataset: DATASET_BYOC,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
    additionalParametersComponent: DataFusionAdditionalParameters,
    additionalParameters: {
      collectionId: '',
      subType: BYOCSubTypes.BYOC,
      locationId: LocationIdSHv3.cdse,
    },
    additionalParametersSettings: {
      collectionId: {
        parameterType: 'text',
        getName: () => t`Collection ID`,
      },
      subType: {
        parameterType: 'select',
        getName: () => t`Type`,
        options: [
          { name: 'BYOC', value: BYOCSubTypes.BYOC },
          { name: 'BATCH', value: BYOCSubTypes.BATCH },
        ],
      },
      locationId: {
        parameterType: 'select',
        getName: () => t`Location`,
        options: [{ name: 'CDSE', value: LocationIdSHv3.cdse }],
      },
    },
  },

  [DATASET_CDAS_S1GRD.id]: {
    label: 'S-1 GRD',
    dataset: DATASET_CDAS_S1GRD,
    additionalMosaickingOrders: [],
    additionalParameters: {},
    additionalParametersComponent: DataFusionAdditionalParametersS1,
  },
  [DATASET_CDAS_S2L1C.id]: {
    label: 'S-2 L1C',
    dataset: DATASET_CDAS_S2L1C,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_CDAS_S2L2A.id]: {
    label: 'S-2 L2A',
    dataset: DATASET_CDAS_S2L2A,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_CDAS_S3SLSTR.id]: {
    label: 'S-3 SLSTR',
    dataset: DATASET_CDAS_S3SLSTR,
    additionalMosaickingOrders: [{ label: t`Least cloud coverage`, id: 'leastCC' }],
  },
  [DATASET_CDAS_S3OLCI.id]: {
    label: 'S-3 OLCI',
    dataset: DATASET_CDAS_S3OLCI,
    additionalMosaickingOrders: [],
  },
  [DATASET_CDAS_S5PL2.id]: {
    label: 'S-5P L2',
    dataset: DATASET_CDAS_S5PL2,
    additionalMosaickingOrders: [],
  },
  [DATASET_CDAS_DEM.id]: {
    label: 'DEM',
    dataset: DATASET_CDAS_DEM,
    mosaickingOrderDisabled: true,
    additionalMosaickingOrders: [],
    additionalParametersComponent: DataFusionAdditionalParameters,
    additionalParameters: { demInstance: DEMInstanceType.COPERNICUS_30 },
    additionalParametersSettings: {
      demInstance: {
        parameterType: 'select',
        getName: () => t`DEM instance`,
        options: [
          { name: 'Copernicus 30', value: DEMInstanceType.COPERNICUS_30 },
          { name: 'Copernicus 90', value: DEMInstanceType.COPERNICUS_90 },
        ],
      },
    },
  },
};

class DataFusion extends React.Component {
  toggleDataFusionEnabled = () => {
    const { settings } = this.props;
    const enabled = settings && settings.length > 0;

    if (enabled) {
      this.props.onChange([]);
    } else {
      const primaryDataset = this.getPrimaryDataset();
      this.props.onChange([primaryDataset]);
    }
  };

  getPrimaryDataset = () => {
    const { datasetId } = this.props;
    const dsh = getDataSourceHandler(datasetId);
    const dataset = dsh.getSentinelHubDataset(datasetId);
    const alias = this.constructAlias(dataset, []);

    const primaryDataset = {
      id: dataset.id,
      alias: alias,
    };
    if (DATAFUSION_DATASETS[dataset.id]?.additionalParameters) {
      const datasetParams = dsh.getDatasetParams(datasetId);
      primaryDataset['additionalParameters'] = datasetParams;
    }
    return primaryDataset;
  };

  getAvailableDatasets() {
    const availableDatasets = getAllAvailableCollections()
      .map((datasetId) => {
        const dsh = getDataSourceHandler(datasetId);
        const shDataset = dsh?.getSentinelHubDataset(datasetId);

        if (shDataset && DATAFUSION_DATASETS[shDataset.id]) {
          return DATAFUSION_DATASETS[shDataset.id];
        }
        return null;
      })
      .filter((item) => !!item)
      .reduce((acc, curr) => {
        return { ...acc, [curr.dataset.id]: curr };
      }, {});

    if (!availableDatasets[DATASET_BYOC.id]) {
      availableDatasets[DATASET_BYOC.id] = DATAFUSION_DATASETS[DATASET_BYOC.id];
    }

    return availableDatasets;
  }

  constructAlias = (dataset, settings) => {
    const existingAliases = settings.filter((d) => d.id === dataset.id).map((d) => d.alias);
    const newAliasBase = `${dataset.shProcessingApiDatasourceAbbreviation.toUpperCase()}`;
    let serialNumber = existingAliases.length;
    let newAlias = serialNumber ? `${newAliasBase}-${serialNumber}` : newAliasBase;
    while (existingAliases.includes(newAlias)) {
      serialNumber += 1;
      newAlias = `${newAliasBase}-${serialNumber}`;
    }
    return newAlias;
  };

  onAddSupplementalDataset = (newDatasetId) => {
    const {
      settings: [...settings],
    } = this.props;

    const dataset = this.getAvailableDatasets()[newDatasetId].dataset;
    const newAlias = this.constructAlias(dataset, settings);
    const newDataset = {
      id: newDatasetId,
      alias: newAlias,
    };
    settings.push(newDataset);

    this.props.onChange(settings);
  };

  onRemoveSupplementalDataset = (alias) => {
    const {
      settings: [...settings],
    } = this.props;
    const newSettings = settings.filter((d) => d.alias !== alias);
    this.props.onChange(newSettings);
  };

  updateAlias = (oldAlias, newAlias) => {
    this.setNewSettings(oldAlias, 'alias', newAlias);
  };

  updateMosaickingOrder = (alias, mosaickingOrder) => {
    this.setNewSettings(alias, 'mosaickingOrder', mosaickingOrder);
  };

  updateAdditionalParameters = (alias, additionalParameters) => {
    this.setNewSettings(alias, 'additionalParameters', additionalParameters);
  };

  updateTimespan = (alias, fromTime, toTime) => {
    this.setNewSettings(alias, 'timespan', [fromTime, toTime]);
  };

  setNewSettings = (alias, key, newValue) => {
    let {
      settings: [...newSettings],
    } = this.props;
    const datasetIndex = newSettings.findIndex((d) => d.alias === alias);
    const datasetSettings = { ...newSettings[datasetIndex] };
    datasetSettings[key] = newValue;
    newSettings[datasetIndex] = datasetSettings;
    this.props.onChange(newSettings);
  };

  checkAliasValidity = (alias) => {
    const { settings } = this.props;
    return !!alias && !settings.some((d) => d.alias === alias);
  };

  isDataFusionDeploymentSupported = (datasetId) => {
    const dsh = getDataSourceHandler(datasetId);
    const { locationId } = dsh.getDatasetParams(datasetId);
    return getSHServiceRootUrl() === SHV3_LOCATIONS_ROOT_URL[locationId];
  };

  render() {
    const { initialTimespan, datasetId } = this.props;
    let settings = [...this.props.settings];

    const availableDatasets = this.getAvailableDatasets();

    const dataset = getDataSourceHandler(datasetId).getSentinelHubDataset(datasetId);

    if (
      !dataset ||
      !availableDatasets[dataset.id] ||
      (dataset === DATASET_BYOC && !this.isDataFusionDeploymentSupported(datasetId))
    ) {
      return null;
    }

    const primaryDatasetIndex = settings.findIndex((d) => d.id === dataset.id);
    const primaryDataset = settings[primaryDatasetIndex];
    const supplementalDatasets = [
      ...settings.slice(0, primaryDatasetIndex),
      ...settings.slice(primaryDatasetIndex + 1),
    ];

    const enabled = settings && settings.length > 0;

    return (
      <div className="data-fusion">
        <div className="checkbox-holder use-url data-fusion-enabled">
          <CustomCheckbox
            checked={enabled}
            onChange={this.toggleDataFusionEnabled}
            label={t`Use additional datasets (advanced)`}
          />
        </div>

        {enabled && (
          <div className="data-fusion-details">
            <DataFusionPrimaryDataset
              alias={primaryDataset.alias}
              label={availableDatasets[dataset.id].label}
              updateAlias={this.updateAlias}
              supplementalDatasets={supplementalDatasets}
              checkAliasValidity={this.checkAliasValidity}
              updateMosaickingOrder={this.updateMosaickingOrder}
              mosaickingOrder={primaryDataset.mosaickingOrder}
              additionalMosaickingOrders={availableDatasets[dataset.id].additionalMosaickingOrders}
            />

            <SupplementalDatasets
              initialTimespan={initialTimespan}
              availableSupplementalDatasets={availableDatasets}
              supplementalDatasets={supplementalDatasets}
              onAddSupplementalDataset={this.onAddSupplementalDataset}
              onRemoveSupplementalDataset={this.onRemoveSupplementalDataset}
              updateAlias={this.updateAlias}
              updateTimespan={this.updateTimespan}
              updateMosaickingOrder={this.updateMosaickingOrder}
              updateAdditionalParameters={this.updateAdditionalParameters}
              checkAliasValidity={this.checkAliasValidity}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
});

export default connect(mapStoreToProps, null)(DataFusion);
