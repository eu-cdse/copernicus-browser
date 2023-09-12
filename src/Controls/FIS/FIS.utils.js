import { CRS_EPSG4326, LayersFactory } from '@sentinel-hub/sentinelhub-js';
import { reqConfigMemoryCache, STATISTICS_MANDATORY_OUTPUTS } from '../../const';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getRecommendedResolution, switchGeometryCoordinates } from '../../utils/coords';
import { checkAllMandatoryOutputsExist } from '../../utils/parseEvalscript';
import { reprojectGeometry } from '../../utils/reproject';

export function constructCSVFromData(data, dropColumns) {
  const keys = Object.keys(data);
  let csv = [];

  for (let i = 0; i < data[keys[0]].length; i++) {
    const bandsLine = [];
    const bandNames = [];

    for (let key of keys) {
      const bandLine = { ...data[key][i] };
      bandLine.date = bandLine.date.toISOString();
      bandsLine.push(bandLine);
      bandNames.push(key);
    }

    if (i === 0) {
      const { line, names } = constructCSVLine(bandsLine, bandNames, dropColumns, []);
      csv = [names.join(','), line.join(',')].join('\n');
    } else {
      const { line } = constructCSVLine(bandsLine, bandNames, dropColumns);
      csv = csv + '\n' + line.join(',');
    }
  }
  return csv;
}

function constructCSVLine(objects, objectNames, dropColumns = [], header) {
  // This function only works for flat objects, as only that is needed currently
  // Extended code which constructs a line from nested objects can be found here:
  // 
  let line = [];
  const constructHeader = !!header;

  for (let i = 0; i < objects.length; i++) {
    for (let key in objects[i]) {
      if (dropColumns.includes(key)) {
        continue;
      }
      line.push(objects[i][key]);
      if (constructHeader) {
        header.push(objectNames[i] + '/' + key);
      }
    }
  }
  return { line: line, names: header };
}

export function getRecommendedResolutionForDatasetId(datasetId, geometry) {
  const datasourceHandler = getDataSourceHandler(datasetId);
  const { resolution, fisResolutionCeiling } = datasourceHandler.getResolutionLimits(datasetId);

  return getRecommendedResolution(geometry, resolution, fisResolutionCeiling);
}

export function getRequestGeometry(datasetId, geometry, targetCrs = CRS_EPSG4326) {
  // convert geojson from WGS:84 to 4326
  let requestGeometry = switchGeometryCoordinates(geometry);

  //reproject geometry to targetCrs
  if (targetCrs !== CRS_EPSG4326) {
    requestGeometry = reprojectGeometry(geometry, { toCrs: targetCrs.authId });
  }

  return requestGeometry;
}

async function layerSupportsStatisticalApi(
  { customSelected, evalscript, layerId, visualizationUrl },
  outputs,
) {
  let layerEvalscript = evalscript;
  if (!customSelected) {
    //check evalscript if outputs for statistical api are defined
    const layer = await LayersFactory.makeLayer(visualizationUrl, layerId, null, reqConfigMemoryCache);
    await layer.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
    layerEvalscript = layer.evalscript;
  }

  return checkAllMandatoryOutputsExist(layerEvalscript, outputs);
}

async function createStatisticsLayer({
  customSelected,
  datasetId,
  evalscript,
  layerId,
  supportStatisticalApi,
  visualizationUrl,
}) {
  const datasourceHandler = getDataSourceHandler(datasetId);

  //check if FIS layer is defined for selected layer
  const FISLayer = datasourceHandler.getFISLayer(visualizationUrl, datasetId, layerId, customSelected);

  // use statistical api if output for statistical api is defined in evalscript
  const targetLayer = supportStatisticalApi ? layerId : FISLayer;

  const shJsDatasetId = datasourceHandler.getSentinelHubDataset(datasetId)
    ? datasourceHandler.getSentinelHubDataset(datasetId).id
    : null;

  const layers = await LayersFactory.makeLayers(visualizationUrl, (layer, dataset) =>
    !shJsDatasetId && !customSelected
      ? dataset === null && layer === targetLayer
      : customSelected
      ? dataset.id === shJsDatasetId
      : dataset.id === shJsDatasetId && layer === targetLayer,
  );

  const layer = layers?.[0];

  if (customSelected) {
    // for custom scripts just set evalscript to custom script
    layer.evalscript = evalscript;
  }
  return layer;
}

export async function getStatisticsLayer(
  { customSelected, datasetId, evalscript, layerId, visualizationUrl },
  outputs = STATISTICS_MANDATORY_OUTPUTS,
) {
  const supportStatisticalApi = await layerSupportsStatisticalApi(
    {
      customSelected,
      evalscript,
      layerId,
      visualizationUrl,
    },
    outputs,
  );

  const statisticsLayer = await createStatisticsLayer({
    customSelected,
    datasetId,
    evalscript,
    layerId,
    supportStatisticalApi,
    visualizationUrl,
  });

  return { statisticsLayer, supportStatisticalApi };
}
