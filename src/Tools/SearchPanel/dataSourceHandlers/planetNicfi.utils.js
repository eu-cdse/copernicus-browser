import { LayersFactory } from '@sentinel-hub/sentinelhub-js';
import moment from 'moment';

import { DEFAULT_THEMES } from '../../../assets/default_themes';
import { DATASOURCES, DEFAULT_THEME_ID, reqConfigMemoryCache } from '../../../const';
import { YYYY_MM_REGEX } from './PlanetBasemapDataSourceHandler';

// Layers and dates work differently for Planet NICFI than other datasets
// We do not change the date on a layer, as a layer only has one date(sensing timeTange) for the mosaic, date can be found in layerId
// The following functions help with fetching all layers, getting all layers whose mosaic date ranges intersects with a date, and the same layer with a different date

// takes a list of layers from a specefic date, and finds the matching layer
// ie ndvi_2021_10 -> ndvi_2020_11
export function getNewLayerFromSimiliarLayerId(layersWithSelectedDate, selectedLayerId) {
  const selectedLayerDateArr = selectedLayerId.match(YYYY_MM_REGEX);

  return layersWithSelectedDate.find((l) => {
    const currentLayerDateArr = l.layerId.match(YYYY_MM_REGEX);
    return (
      l.layerId.replace(currentLayerDateArr.join('_'), '_DATE_') ===
      selectedLayerId.replace(selectedLayerDateArr.join('_'), '_DATE_')
    );
  });
}

// find all layers that match a date
export function getLayersWithDate(allLayers, selectedDate) {
  return allLayers.filter((l) => {
    const timeRangeArray = l.layerId.match(YYYY_MM_REGEX);
    if (timeRangeArray) {
      const fromToTimeObj = {
        fromTime: moment(timeRangeArray[0]).startOf('month'),
        toTime: timeRangeArray[1]
          ? moment(timeRangeArray[1]).endOf('month')
          : moment(timeRangeArray[0]).endOf('month'),
        layerIds: [l.layerId],
      };
      return selectedDate.isBetween(fromToTimeObj.fromTime, fromToTimeObj.toTime);
    }
    return false;
  });
}

// If NDVI layer is currently selected and date changes, we will get a new list of layers where the date macthes
// Find the NDVI layer from the new list and select this layer as the selected layer
export async function getSameLayerWithDifferentDate(oldLayerID, selectedDate) {
  const defaultTheme = DEFAULT_THEMES.find((theme) => theme.id === DEFAULT_THEME_ID);
  const planetNicfiTheme = defaultTheme.content.find((theme) => theme.name === DATASOURCES.PLANET_NICFI);
  const allLayers = await LayersFactory.makeLayers(planetNicfiTheme.url, null, null, reqConfigMemoryCache);
  const layersWithDate = getLayersWithDate(allLayers, selectedDate);
  return getNewLayerFromSimiliarLayerId(layersWithDate, oldLayerID);
}
const planetUtils = {
  getSameLayerWithDifferentDate: getSameLayerWithDifferentDate,
  getLayersWithDate: getLayersWithDate,
  getNewLayerFromDateChange: getNewLayerFromSimiliarLayerId,
};

export default planetUtils;
