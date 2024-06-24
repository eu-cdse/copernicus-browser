import moment from 'moment';
import { connect } from 'react-redux';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import { VisualizationTimeSelect } from '../../components/VisualizationTimeSelect/VisualizationTimeSelect';
import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { findLatestDateWithData, generateAppropriateSearchBBox } from './SmartPanel/LatestDataAction.utils';
import store, { visualizationSlice } from '../../store';
import { reqConfigMemoryCache } from '../../const';
import { handleError } from '../../utils';
import { getOrbitDirectionFromList } from './VisualizationPanel.utils';
import React, { useState } from 'react';

function DateSelection({
  zoom,
  mapBounds,
  pixelBounds,
  visualizationUrl,
  fromTime,
  toTime,
  datasetId,
  orbitDirection,
  datePanelExpanded,
  maxCloudCover,
  showLayerPanel,
  setShowLayerPanel,
  dateMode,
}) {
  const [maxCloudCoverTemp, setMaxCloudCoverTemp] = useState(maxCloudCover);
  let minDateRange = moment.utc('1972-07-01');
  let maxDateRange = moment.utc().endOf('day');
  let supportsTimerange = false;
  let hasCloudCoverage = false;
  let isZoomLevelOk = false;
  let isTimeless = false;
  let limitMonthsSearch = 3;
  const dsh = getDataSourceHandler(datasetId);

  if (dsh) {
    const { minDate, maxDate } = dsh.getMinMaxDates(datasetId);
    if (minDate) {
      minDateRange = minDate;
    }

    if (maxDate) {
      maxDateRange = maxDate;
    }

    const zoomConfiguration = dsh.getLeafletZoomConfig(datasetId);
    isZoomLevelOk =
      zoomConfiguration &&
      zoomConfiguration.min !== undefined &&
      zoomConfiguration.min !== null &&
      zoom >= zoomConfiguration.min;
    supportsTimerange = dsh.supportsTimeRange();
    hasCloudCoverage = dsh.tilesHaveCloudCoverage(datasetId);
    limitMonthsSearch = dsh.getLimitMonthsSearch();
    isTimeless = dsh.isTimeless();
  }

  function updateSelectedTime(fromTime, toTime) {
    const dsh = getDataSourceHandler(datasetId);
    if (dsh && !dsh.supportsTimeRange()) {
      fromTime = null;
    }
    store.dispatch(
      visualizationSlice.actions.setVisualizationTime({
        fromTime: fromTime,
        toTime: toTime,
      }),
    );
  }

  async function getLayerAndBBoxSetup() {
    const bbox = generateAppropriateSearchBBox(mapBounds, pixelBounds);
    const shJsDataset = dsh.getSentinelHubDataset(datasetId);
    const layers = await LayersFactory.makeLayers(
      visualizationUrl,
      (layer, dataset) => {
        if (shJsDataset) {
          if (dataset) {
            return dataset.id === shJsDataset.id;
          }
          return false;
        }
        return shJsDataset === dataset;
      },
      null,
      reqConfigMemoryCache,
    );
    const layer = layers[0];

    // add additional filtering parameters to search layer
    if (dsh?.getSearchLayerParams) {
      const searchLayerParams = dsh.getSearchLayerParams(datasetId);
      if (searchLayerParams) {
        Object.keys(searchLayerParams).forEach((key) => {
          layer[key] = searchLayerParams[key];
        });
      }
    }

    return {
      bbox,
      layer,
    };
  }

  async function onFetchAvailableDates(fromMoment, toMoment) {
    const bbox = generateAppropriateSearchBBox(mapBounds, pixelBounds);
    const dates = await dsh.findDates({
      datasetId: datasetId,
      bbox: bbox,
      fromTime: fromMoment.toDate(),
      toTime: toMoment.toDate(),
      orbitDirection: orbitDirection,
    });
    return dates;
  }

  async function onQueryDatesForActiveMonth(day) {
    day = day ? moment.utc(day) : moment.utc();
    const monthStart = day.clone().startOf('month');
    const monthEnd = day.clone().endOf('month');
    let dates = [];
    try {
      dates = await onFetchAvailableDates(monthStart, monthEnd);
    } catch (err) {
      handleError(err, 'Unable to fetch available dates!\n', (msg) => console.error(msg));
    }
    return dates;
  }

  async function fetchAvailableFlyovers(day) {
    day = day ? moment.utc(day) : moment.utc();
    const monthStart = day.clone().startOf('month');
    const monthEnd = day.clone().endOf('month');
    const { bbox, layer } = await getLayerAndBBoxSetup();
    let flyovers = [];
    try {
      flyovers = await layer.findFlyovers(bbox, monthStart, monthEnd);
    } catch (err) {
      handleError(err, 'Unable to fetch available flyovers!\n', (msg) => console.error(msg));
    }
    return flyovers;
  }

  async function getLatestAvailableDate() {
    const date = await findLatestDateWithData({
      datasetId: datasetId,
      bounds: mapBounds,
      pixelBounds: pixelBounds,
      maxCloudCoverPercent: maxCloudCover,
      orbitDirection: orbitDirection,
    });
    if (date) {
      return moment.utc(date);
    }
  }

  function setMaxCloudCover(value) {
    store.dispatch(visualizationSlice.actions.setCloudCoverage(value));
  }

  return (
    <VisualizationTimeSelect
      isTimeless={isTimeless}
      minDate={minDateRange}
      maxDate={maxDateRange}
      fromTime={fromTime}
      toTime={toTime}
      timespanSupported={supportsTimerange}
      hasCloudCoverage={hasCloudCoverage}
      isZoomLevelOk={isZoomLevelOk}
      showNextPrev={true}
      updateSelectedTime={updateSelectedTime}
      onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
      onQueryFlyoversForActiveMonth={fetchAvailableFlyovers}
      getLatestAvailableDate={getLatestAvailableDate}
      limitMonthsSearch={limitMonthsSearch}
      maxCloudCover={maxCloudCoverTemp}
      setMaxCloudCover={setMaxCloudCoverTemp}
      setMaxCloudCoverAfterChange={setMaxCloudCover}
      datePanelExpanded={datePanelExpanded}
      showLayerPanel={showLayerPanel}
      setShowLayerPanel={setShowLayerPanel}
      dateMode={dateMode}
    />
  );
}

const mapStoreToProps = (store) => ({
  zoom: store.mainMap.zoom,
  mapBounds: store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  visualizationUrl: store.visualization.visualizationUrl,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  datasetId: store.visualization.datasetId,
  dateMode: store.visualization.dateMode,
  selectedLanguage: store.language.selectedLanguage,
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
  datePanelExpanded: store.collapsiblePanel.datePanelExpanded,
  maxCloudCover: store.visualization.cloudCoverage,
});

export default connect(mapStoreToProps, null)(DateSelection);
