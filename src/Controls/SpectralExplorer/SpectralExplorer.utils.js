import { t } from 'ttag';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { ALL_BANDS_OUTPUT, DATAMASK_OUTPUT, reqConfigMemoryCache } from '../../const';
import { getRecommendedResolutionForDatasetId, getRequestGeometry } from '../FIS/FIS.utils';
import {
  CRS_EPSG3857,
  LayersFactory,
  StatisticsProviderType,
  StatisticsUtils,
  getStatisticsProvider,
} from '@sentinel-hub/sentinelhub-js';
import moment from 'moment';
import {
  getDateNotSetMsg,
  getErrorFetchingDataMsg,
  getGeometryNotSetMsg,
  getLayerNotSelectedMsg,
  getLoggedInErrorMsg,
} from '../../junk/ConstMessages';
import { getDatasourceNotSupportedMsg } from '../../junk/ConstMessages';

const SPECTRAL_EXPLORER_ENABLED = true;

const spectralExplorerLabels = {
  title: () => t`Spectral explorer`,
  errorDatasetNotSet: getLayerNotSelectedMsg,
  errorNotSupported: getDatasourceNotSupportedMsg,
  errorGeometryNotSet: getGeometryNotSetMsg,
  errorDateNotSet: getDateNotSetMsg,
  errorLogIn: getLoggedInErrorMsg,
  errorParameterNotSet: (parameter) => t`Parameter ${parameter} is not set`,
  reflectance: () => t`Reflectance`,
  wavelength: () => t`Wavelength (nm)`,
};

const isSpectralExplorerSupported = (datasetId) => {
  const dsh = getDataSourceHandler(datasetId);

  if (!dsh) {
    return false;
  }

  return dsh.isSpectralExplorerSupported(datasetId);
};

//create evalscript for dataset

const createEvalscriptForDataset = (datasetId) => {
  const dsh = getDataSourceHandler(datasetId);

  if (!dsh) {
    return null;
  }

  const bands = dsh.getBands(datasetId).map((b) => b.name);

  const evalscript = `

  //VERSION=3
  function setup() {
    return {
      input: [
        {
          bands: [${bands.map((b) => `'${b}'`).join(',')}, 'dataMask'],
        },
      ],
      output: [
        {
          id: '${ALL_BANDS_OUTPUT}',
          bands: ${bands.length},
        },
        {
          id: '${DATAMASK_OUTPUT}',
          bands: 1,
        },
      ],
    };
  }
  
  function evaluatePixel(samples) {
    return {
      ${ALL_BANDS_OUTPUT}: [${bands.map((band) => `samples.${band}`).join(',')}],
      ${DATAMASK_OUTPUT}: [samples.dataMask],
    };
  }
  `;

  return evalscript;
};

const validatateInputParameters = ({ datasetId, geometry, fromTime, toTime }) => {
  if (!datasetId) {
    throw new Error(
      `${getErrorFetchingDataMsg()}: ${spectralExplorerLabels.errorParameterNotSet('Dataset')}`,
    );
  }

  if (!isSpectralExplorerSupported(datasetId)) {
    throw new Error(`${getErrorFetchingDataMsg()}: ${spectralExplorerLabels.errorNotSupported()}`);
  }

  if (!geometry) {
    throw new Error(
      `${getErrorFetchingDataMsg()}: ${spectralExplorerLabels.errorParameterNotSet('Geometry')}`,
    );
  }

  if (!fromTime || !toTime) {
    throw new Error(`${getErrorFetchingDataMsg()}: ${spectralExplorerLabels.errorParameterNotSet('Date')}`);
  }
};

const getBandsValues = async ({ datasetId, geometry, visualizationUrl, cancelToken, fromTime, toTime }) => {
  validatateInputParameters({
    datasetId,
    geometry,
    fromTime,
    toTime,
  });
  const crs = CRS_EPSG3857;

  const reqConfig = { ...reqConfigMemoryCache, cancelToken: cancelToken };

  const recommendedResolution = getRecommendedResolutionForDatasetId(datasetId, geometry);
  const requestGeometry = getRequestGeometry(datasetId, geometry, crs);
  const evalscript = createEvalscriptForDataset(datasetId);

  const dsh = getDataSourceHandler(datasetId);
  const bands = dsh?.getBands(datasetId);
  const shJsDataset = dsh ? dsh.getSentinelHubDataset(datasetId) : null;
  let layers = await LayersFactory.makeLayers(
    visualizationUrl,
    (_, dataset) => (!shJsDataset ? true : dataset.id === shJsDataset.id),
    null,
    reqConfig,
  );
  let statisticsLayer;
  if (layers.length > 0) {
    statisticsLayer = layers[0];
    statisticsLayer.evalscript = evalscript;
  }

  const statsParams = {
    geometry: requestGeometry,
    crs: crs,
    fromTime: fromTime,
    toTime: toTime.diff(fromTime, 'days') > 0 ? toTime : moment.utc(toTime).add(1, 'days').startOf('day'),
  };

  const input = await StatisticsUtils.createInputPayload(statisticsLayer, statsParams, reqConfig);

  const aggregation = StatisticsUtils.createAggregationPayload(statisticsLayer, {
    fromTime: statsParams.fromTime,
    toTime: statsParams.toTime,
    resolution: recommendedResolution,
    aggregationInterval: `P${statsParams.toTime.diff(statsParams.fromTime, 'days')}D`,
  });

  const payload = {
    input: input,
    aggregation: aggregation,
    calculations: {
      [ALL_BANDS_OUTPUT]: {},
    },
  };

  const statProvider = getStatisticsProvider(StatisticsProviderType.STAPI);
  const response = await statProvider.getStatistics(
    `${statisticsLayer.getShServiceHostname()}api/v1/statistics`,
    payload,
    reqConfig,
  );

  const result = response.data?.[0]?.outputs?.[ALL_BANDS_OUTPUT]?.bands || [];

  let bandsValues = null;
  if (Object.keys(result).length === bands.length) {
    bandsValues = Object.keys(result)
      .map((key, index) => ({
        name: bands[index].name,
        stats: result[key].stats,
      }))
      .filter((b) => !!getCentralWaveLength(b.name, bands));
  }
  return bandsValues;
};

const getTitleForGeometryType = (geometryType) => {
  switch (geometryType) {
    case 'aoi':
      return t`Area of interest`;
    case 'poi':
      return t`Point of interest`;
    default:
      return geometryType;
  }
};

const createSeriesId = ({ geometryType, datasetId }) => `${geometryType}-${datasetId}`;

const getCentralWaveLength = (name, bands) => {
  const band = bands.find((b) => b.name === name);

  return band?.centralWL;
};

export {
  SPECTRAL_EXPLORER_ENABLED,
  isSpectralExplorerSupported,
  spectralExplorerLabels,
  createEvalscriptForDataset,
  getBandsValues,
  getTitleForGeometryType,
  createSeriesId,
  getCentralWaveLength,
};
