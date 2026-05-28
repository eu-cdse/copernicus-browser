import { CRS_EPSG3857, CRS_EPSG4326, StatisticsProviderType } from '@sentinel-hub/sentinelhub-js';
import moment from 'moment';
import { t } from 'ttag';
import {
  reqConfigMemoryCache,
  BROWSERSTATS_OUTPUT,
  DATAMASK_OUTPUT,
  EOBROWSERSTATS_OUTPUT,
} from '../../const';
import {
  getRecommendedResolutionForDatasetId,
  getRequestGeometry,
  getStatisticsLayer,
} from '../FIS/FIS.utils';

const PIXEL_EXPLORER_ENABLED = true;
const PIXEL_VALUE_MANDATORY_OUTPUTS = [[BROWSERSTATS_OUTPUT, EOBROWSERSTATS_OUTPUT], DATAMASK_OUTPUT];

// initialize the statistics layer that will be used to obtain pixel-related valuess
const initializeStatisticsLayer = async ({
  geometry,
  customSelected,
  evalscript,
  layerId,
  visualizationUrl,
  datasetId,
  fromTime,
  toTime,
  user,
}) => {
  if (!user?.userdata) {
    return { enabled: false, statisticsLayer: null };
  }

  if (!(PIXEL_EXPLORER_ENABLED && geometry && visualizationUrl)) {
    return { enabled: false, statisticsLayer: null };
  }

  // visualizationUrl is set, but layer is not selected (happens when user closes custom layer)
  if (!layerId && !customSelected) {
    return { enabled: false, statisticsLayer: null };
  }

  //disable for timespan
  if (fromTime && toTime && toTime.diff(fromTime, 'days') > 0) {
    return { enabled: false, statisticsLayer: null };
  }

  const { supportStatisticalApi, statisticsLayer, statsOutputName } = await getStatisticsLayer(
    {
      customSelected,
      datasetId,
      evalscript,
      layerId,
      visualizationUrl,
    },
    PIXEL_VALUE_MANDATORY_OUTPUTS,
  );

  if (!(statisticsLayer && supportStatisticalApi)) {
    return { enabled: false, statisticsLayer: null };
  }

  if (customSelected) {
    statisticsLayer.title = t`Custom`;
  }

  return {
    enabled: true,
    statisticsLayer: statisticsLayer,
    statsOutputName,
    indexValueFetchingFunction: supportStatisticalApi ? getStatisticalIndexValue : getFISIndexValue, // getFISIndexValue is used for layers that don't support statistical API, but can still be used to obtain pixel values through FIS layer
  };
};

const formatIndexValue = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return t`N/A`;
  }
  return Math.round(value * 10000) / 10000;
};

const getIndexValue = async (
  statisticsLayer,
  supportStatisticalApi,
  statsOutputName,
  { fromTime, toTime, cancelToken, requestGeometry, crs, recommendedResolution },
) => {
  const outputName = statsOutputName ?? EOBROWSERSTATS_OUTPUT;

  const statsParams = {
    geometry: requestGeometry,
    crs: crs,
    fromTime: fromTime,
    toTime: toTime.diff(fromTime, 'days') > 0 ? toTime : moment.utc(toTime).add(1, 'days').startOf('day'),
    resolution: recommendedResolution,
    bins: 1,
    output: outputName,
  };
  let indexValue = null;
  const response = await statisticsLayer.getStats(
    statsParams,
    { ...reqConfigMemoryCache, cancelToken: cancelToken },
    supportStatisticalApi ? StatisticsProviderType.STAPI : StatisticsProviderType.FIS,
  );

  if (supportStatisticalApi) {
    indexValue = response.data?.[0]?.outputs?.[outputName]?.bands?.B0?.stats?.mean;
  } else {
    indexValue = response.C0?.[0]?.basicStats?.mean;
  }
  return indexValue;
};

const getStatisticalIndexValue = async (
  statisticsLayer,
  statsOutputName,
  { datasetId, geometry, fromTime, toTime, cancelToken },
) => {
  const crs = CRS_EPSG3857;
  const recommendedResolution = getRecommendedResolutionForDatasetId(datasetId, geometry);
  const requestGeometry = getRequestGeometry(datasetId, geometry, crs);
  return getIndexValue(statisticsLayer, true, statsOutputName, {
    fromTime,
    toTime,
    cancelToken,
    requestGeometry,
    crs,
    recommendedResolution,
  });
};

const getFISIndexValue = async (
  statisticsLayer,
  statsOutputName,
  { datasetId, geometry, fromTime, toTime, cancelToken },
) => {
  const crs = CRS_EPSG4326;
  const recommendedResolution = getRecommendedResolutionForDatasetId(datasetId, geometry);
  const requestGeometry = getRequestGeometry(datasetId, geometry, crs);
  return getIndexValue(statisticsLayer, false, statsOutputName, {
    fromTime,
    toTime,
    cancelToken,
    requestGeometry,
    crs,
    recommendedResolution,
  });
};

export { formatIndexValue, initializeStatisticsLayer };
