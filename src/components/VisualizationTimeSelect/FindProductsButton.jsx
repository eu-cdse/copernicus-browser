import React, { useEffect } from 'react';
import { t } from 'ttag';
import { ODATA_SEARCH_ERROR_MESSAGE, useODataSearch } from '../../hooks/useODataSearch';
import { useSTACSearch, STAC_SEARCH_ERROR_MESSAGE } from '../../hooks/useSTACSearch';
import oDataHelpers from '../../api/OData/ODataHelpers';
import { connect } from 'react-redux';
import { boundsToPolygon } from '../../utils/geojson.utils';
import moment from 'moment';
import store, { notificationSlice, searchResultsSlice, tabsSlice } from '../../store';
import { DEFAULT_CLOUD_COVER_PERCENT, TABS } from '../../const';
import { createCollectionFormFromDatasetId } from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/RecursiveCollectionForm';
import {
  ErrorCode,
  ErrorMessage,
} from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/const';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { recursiveCollections } from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/collectionFormConfig';
import {
  buildSelectedCollectionEntry,
  CollectionFormInitialState,
  getSTACConfigForDatasetId,
} from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/collectionFormConfig.utils';
import {
  createDatetimeInterval,
  createGeometryFilters,
  createProductTypeFilters,
  combineFilters,
} from '../../api/STAC/STACSearchPayloadBuilder';

const FindProductsButton = ({
  enabled,
  setLoading,
  datasetId,
  fromTime,
  toTime,
  orbitDirection,
  mapBounds,
  aoiBounds,
  userToken,
  maxCC,
  hasProductsWithinSelectedRange,
  layerId,
  forceDisabled,
}) => {
  const [{ searchInProgress, searchError, oDataSearchResult }, productSearch, setODataSearchAuthToken] =
    useODataSearch();

  const [
    { searchInProgress: stacInProgress, searchError: stacSearchError, stacSearchResult },
    stacSearch,
    setSTACAuthToken,
  ] = useSTACSearch();

  function getFromTimeToTime(datasetId) {
    if (fromTime && toTime) {
      const dsh = getDataSourceHandler(datasetId);
      if (dsh != null) {
        // CLMS products have hourly daily 10 daily and yearly temporal resolutions, where the oData query uses a contentStart is gte minDate and lt maxDate
        // We cant rely on just searching by sensing date, as contentStart and contentEnd will span the temporal resolution, where sensing date can be contentEnd or contentStart
        const temporalResolution = dsh.getTemporalResolution(datasetId);
        if (temporalResolution != null) {
          const possibleFromTime = fromTime
            .clone()
            .subtract(temporalResolution.amount, temporalResolution.unit);

          const minDate = moment.min([possibleFromTime, toTime]);
          const maxDate = moment.max([possibleFromTime, toTime]);
          return { fromTime: moment.utc(minDate).startOf('day'), toTime: moment.utc(maxDate).endOf('day') };
        }
      }

      return { fromTime: moment.utc(fromTime), toTime: moment.utc(toTime) };
    }

    const dsh = getDataSourceHandler(datasetId);
    const { minDate } = dsh.getMinMaxDates(datasetId);
    let newFromTime = moment.utc().subtract(1, 'months');
    if (minDate && newFromTime.isBefore(minDate)) {
      newFromTime = minDate.clone();
    }

    return { fromTime: newFromTime.startOf('day'), toTime: moment.utc().endOf('day') };
  }

  function dispatchSearchResult(result, collectionForm) {
    store.dispatch(searchResultsSlice.actions.setSearchResult(result));
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));

    const { fromTime: fromMoment, toTime: toMoment } = getFromTimeToTime(datasetId);

    store.dispatch(
      searchResultsSlice.actions.setSearchFormData({
        fromMoment,
        toMoment,
        collectionForm,
      }),
    );
  }

  useEffect(() => {
    if (oDataSearchResult && oDataSearchResult.allResults.length) {
      dispatchSearchResult(
        oDataSearchResult,
        createCollectionFormFromDatasetId(datasetId, { orbitDirection, maxCC, layerId }),
      );
    }
    // eslint-disable-next-line
  }, [oDataSearchResult]);

  useEffect(() => {
    if (stacSearchResult && stacSearchResult.allResults.length) {
      const stacConfig = getSTACConfigForDatasetId(datasetId, recursiveCollections);
      dispatchSearchResult(
        stacSearchResult,
        // Rebuild the Advanced Search form so the panel shows the same selection the results came
        // from, using the shared builder the OData path (createCollectionFormFromDatasetId) also
        // uses - both must encode the selection the same way.
        stacConfig
          ? {
              ...CollectionFormInitialState,
              selectedCollections: {
                [stacConfig.collectionId]: buildSelectedCollectionEntry({
                  instrumentId: stacConfig.instrumentId,
                  productTypeId: stacConfig.productTypeId,
                }),
              },
            }
          : null,
      );
    }
    // eslint-disable-next-line
  }, [stacSearchResult]);

  useEffect(() => {
    if (searchError?.message?.startsWith(ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND)) {
      const message = searchError?.availabilityMessage
        ? `${ErrorMessage[ErrorCode.noResults]()}\n${searchError.availabilityMessage}`
        : ErrorMessage[ErrorCode.noResults]();
      store.dispatch(notificationSlice.actions.displayPanelError({ message }));
      setLoading(false);
    }
  }, [searchError, setLoading]);

  useEffect(() => {
    if (stacSearchError?.message?.startsWith(STAC_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND)) {
      store.dispatch(
        notificationSlice.actions.displayPanelError({ message: ErrorMessage[ErrorCode.noResults]() }),
      );
      setLoading(false);
    }
  }, [stacSearchError, setLoading]);

  useEffect(() => {
    setLoading(searchInProgress);
    if (searchInProgress) {
      store.dispatch(notificationSlice.actions.displayPanelError(null));
    }
  }, [searchInProgress, setLoading]);

  useEffect(() => {
    setLoading(stacInProgress);
    if (stacInProgress) {
      store.dispatch(notificationSlice.actions.displayPanelError(null));
    }
  }, [stacInProgress, setLoading]);

  const getODataQueryParams = () => {
    const { fromTime, toTime } = getFromTimeToTime(datasetId);
    const dsh = getDataSourceHandler(datasetId);

    const params = {};

    if (!dsh?.isTimeless() && fromTime) {
      params['fromTime'] = fromTime.toISOString();
    }

    if (!dsh?.isTimeless() && toTime) {
      params['toTime'] = toTime.toISOString();
    }

    if (orbitDirection) {
      params['orbitDirection'] = orbitDirection;
    }

    if (mapBounds || aoiBounds) {
      params['geometry'] = boundsToPolygon(aoiBounds ? aoiBounds : mapBounds);
    }

    if (layerId) {
      params['layerId'] = layerId;
    }

    params['datasetId'] = datasetId;
    params['maxCC'] = maxCC || DEFAULT_CLOUD_COVER_PERCENT;

    return params;
  };

  const buildSTACPayload = (stacConfig) => {
    const payload = { collections: [stacConfig.collectionName], limit: 50 };

    const dsh = getDataSourceHandler(datasetId);
    const { fromTime: fromMoment, toTime: toMoment } = getFromTimeToTime(datasetId);

    if (!dsh?.isTimeless() && fromMoment && toMoment) {
      const datetimeInterval = createDatetimeInterval({
        fromTime: fromMoment.toISOString(),
        toTime: toMoment.toISOString(),
      });
      if (datetimeInterval) {
        payload.datetime = datetimeInterval;
      }
    }

    const geometry = boundsToPolygon(aoiBounds ?? mapBounds);
    const geometryFilters = createGeometryFilters(geometry);
    // A single STAC collection can hold several product types (e.g. sentinel-1-global-mosaics
    // holds both the IW and the DH mosaics), so scope the search to the one this dataset maps to.
    const productTypeFilters = stacConfig.productTypeId
      ? createProductTypeFilters([stacConfig.productTypeId])
      : [];
    const filter = combineFilters([...geometryFilters, ...productTypeFilters]);
    if (filter) {
      payload.filter = filter;
    }

    return payload;
  };

  const handleClick = () => {
    const stacConfig = getSTACConfigForDatasetId(datasetId, recursiveCollections);
    if (stacConfig) {
      setSTACAuthToken(userToken);
      stacSearch(buildSTACPayload(stacConfig));
    } else {
      setODataSearchAuthToken(userToken);
      productSearch(oDataHelpers.createBasicSearchQuery(getODataQueryParams()));
    }
  };

  // External WMS: show the button disabled (not clickable via the `disabled` class' pointer-events).
  const isEnabled = enabled && datasetId && !forceDisabled;

  const dsh = getDataSourceHandler(datasetId);

  // External WMS has no SH datasource handler; still render the (disabled) button for layout parity.
  if (!forceDisabled && !dsh?.supportsFindProductsForCurrentView(datasetId)) {
    return null;
  }

  return (
    <div className={`secondary ${isEnabled ? '' : 'disabled'}`}>
      <div className={`action-button-text secondary ${isEnabled ? '' : 'disabled'}`} onClick={handleClick}>
        {hasProductsWithinSelectedRange
          ? t`Find products within selected time range`
          : t`Find products for current view`}
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  layerId: store.visualization.layerId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  orbitDirection: store.visualization.orbitDirection,
  mapBounds: store.mainMap.bounds,
  aoiBounds: store.aoi.bounds,
  userToken: store.auth.user.access_token,
  maxCC: store.visualization.cloudCoverage,
});

export default connect(mapStoreToProps, null)(FindProductsButton);
