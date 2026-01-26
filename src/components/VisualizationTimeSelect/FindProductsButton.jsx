import React, { useEffect } from 'react';
import { t } from 'ttag';
import { ODATA_SEARCH_ERROR_MESSAGE, useODataSearch } from '../../hooks/useODataSearch';
import oDataHelpers from '../../api/OData/ODataHelpers';
import { connect } from 'react-redux';
import { boundsToPolygon } from '../../utils/geojson.utils';
import moment from 'moment';
import store, { notificationSlice, searchResultsSlice, tabsSlice } from '../../store';
import { DEFAULT_CLOUD_COVER_PERCENT, TABS } from '../../const';
import { createCollectionFormFromDatasetId } from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/RecursiveCollectionForm';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const ErrorMessage = {
  noProductsFound: () =>
    t`No products were found for the selected time range and area. To search for products select a time range within an area where data is displayed on the map first.`,
};

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
}) => {
  const [{ searchInProgress, searchError, oDataSearchResult }, productSearch, setODataSearchAuthToken] =
    useODataSearch();

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
            .subtract(temporalResolution.amount, temporalResolution.unit)
            .toISOString();

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

  useEffect(() => {
    if (oDataSearchResult && oDataSearchResult.allResults.length) {
      store.dispatch(searchResultsSlice.actions.setSearchResult(oDataSearchResult));
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));

      const { fromTime: fromMoment, toTime: toMoment } = getFromTimeToTime(datasetId);

      store.dispatch(
        searchResultsSlice.actions.setSearchFormData({
          fromMoment,
          toMoment,
          collectionForm: createCollectionFormFromDatasetId(datasetId, { orbitDirection, maxCC }),
        }),
      );
    }
    // linter is disabled here on purpose as this hook is supposed be executed only when oDataSearchResult is changed
    // eslint-disable-next-line
  }, [oDataSearchResult]);

  useEffect(() => {
    if (searchError?.message === ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND) {
      store.dispatch(
        notificationSlice.actions.displayPanelError({ message: ErrorMessage.noProductsFound() }),
      );
      setLoading(false);
    }
  }, [searchError, setLoading]);

  useEffect(() => {
    setLoading(searchInProgress);
    if (searchInProgress) {
      //remove displayed error messages (if any) when starting new search
      store.dispatch(notificationSlice.actions.displayPanelError(null));
    }
  }, [searchInProgress, setLoading]);

  const getQueryParams = () => {
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

    params['datasetId'] = datasetId;
    params['maxCC'] = maxCC || DEFAULT_CLOUD_COVER_PERCENT;

    return params;
  };

  const isEnabled = enabled && datasetId;

  const dsh = getDataSourceHandler(datasetId);

  if (!dsh?.supportsFindProductsForCurrentView(datasetId)) {
    return null;
  }

  return (
    <div className={`secondary ${isEnabled ? '' : 'disabled'}`}>
      <div
        className={`action-button-text secondary ${isEnabled ? '' : 'disabled'}`}
        onClick={() => {
          setODataSearchAuthToken(userToken);
          productSearch(oDataHelpers.createBasicSearchQuery(getQueryParams()));
        }}
      >
        {hasProductsWithinSelectedRange
          ? t`Find products within selected time range`
          : t`Find products for current view`}
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  orbitDirection: store.visualization.orbitDirection,
  mapBounds: store.mainMap.bounds,
  aoiBounds: store.aoi.bounds,
  userToken: store.auth.user.access_token,
  maxCC: store.visualization.cloudCoverage,
});

export default connect(mapStoreToProps, null)(FindProductsButton);
