import React, { useEffect } from 'react';
import { t } from 'ttag';
import { ODATA_SEARCH_ERROR_MESSAGE, useODataSearch } from '../../hooks/useODataSearch';
import oDataHelpers from '../../api/OData/ODataHelpers';
import { connect } from 'react-redux';
import { boundsToPolygon } from '../../utils/geojson.utils';
import moment from 'moment';
import store, { notificationSlice, searchResultsSlice, tabsSlice } from '../../store';
import { TABS } from '../../const';
import { createCollectionFormFromDatasetId } from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/CollectionForm';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const ErrorMessage = {
  noProductsFound: t`No products were found for the selected time range and area. To search for products select a time range within an area where data is displayed on the map first.`,
};

const FindProductsButton = ({
  enabled,
  setLoading,
  timespanExpanded,
  datasetId,
  fromTime,
  toTime,
  orbitDirection,
  mapBounds,
  aoiBounds,
}) => {
  const [{ searchInProgress, searchError, oDataSearchResult }, productSearch] = useODataSearch();

  useEffect(() => {
    if (oDataSearchResult && oDataSearchResult.allResults.length) {
      store.dispatch(searchResultsSlice.actions.setSearchResult(oDataSearchResult));
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));

      store.dispatch(
        searchResultsSlice.actions.setSearchFormData({
          fromMoment: moment.utc(fromTime),
          toMoment: moment.utc(toTime),
          collectionForm: createCollectionFormFromDatasetId(datasetId, { orbitDirection }),
        }),
      );
    }
    // linter is disabled here on purpose as this hook is supposed be executed only when oDataSearchResult is changed
    // eslint-disable-next-line
  }, [oDataSearchResult]);

  useEffect(() => {
    if (searchError?.message === ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND) {
      store.dispatch(notificationSlice.actions.displayPanelError({ message: ErrorMessage.noProductsFound }));
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
    const params = {};

    if (fromTime) {
      params['fromTime'] = moment.utc(fromTime).toDate().toISOString();
    }
    if (toTime) {
      params['toTime'] = moment.utc(toTime).toDate().toISOString();
    }
    if (orbitDirection) {
      params['orbitDirection'] = orbitDirection;
    }
    if (mapBounds || aoiBounds) {
      params['geometry'] = boundsToPolygon(aoiBounds ? aoiBounds : mapBounds);
    }
    params['datasetId'] = datasetId;

    return params;
  };
  const isEnabled = enabled && datasetId && fromTime;

  const dsh = getDataSourceHandler(datasetId);

  if (!dsh?.supportsFindProductsForCurrentView(datasetId)) {
    return null;
  }

  return (
    <div className={`secondary ${isEnabled ? '' : 'disabled'}`}>
      <div
        className={`action-button-text secondary ${isEnabled ? '' : 'disabled'}`}
        onClick={() => productSearch(oDataHelpers.createBasicSearchQuery(getQueryParams()))}
      >
        {timespanExpanded ? t`Find products within selected time range` : t`Find products for current view`}
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
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(FindProductsButton);
