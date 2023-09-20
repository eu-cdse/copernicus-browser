import React, { Component } from 'react';
import Loader from '../../../../Loader/Loader';

import EOBFilterSearchByMonths from '../../../../junk/EOBCommon/EOBFilterSearchByMonths/EOBFilterSearchByMonths';
import { TimespanPicker } from '../../../../components/TimespanPicker/TimespanPicker';
import { EOBButton } from '../../../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../../../junk/NotificationPanel/NotificationPanel';
import moment from 'moment';
import { connect } from 'react-redux';
import { t } from 'ttag';
import { getDataSourceHandler } from '../../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import store, { searchResultsSlice, visualizationSlice, mainMapSlice, tabsSlice } from '../../../../store';
import {
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  TABS,
  DEFAULT_MODE,
  DEFAULT_THEME_ID,
} from '../../../../const';
import { getBoundsAndLatLng } from '../../../CommercialDataPanel/commercialData.utils';
import { isDatasetIdGIBS } from '../../SmartPanel/LatestDataAction.utils';
import Results from '../../../Results/Results';
import './AdvancedSearch.scss';
import CollectionForm, { getCollectionFormInitialState } from './CollectionForm';
import { boundsToPolygon } from '../../../../utils/geojson.utils';
import oDataHelpers from '../../../../api/OData/ODataHelpers';

import { withODataSearchHOC } from './withODataSearchHOC';

import { applyFilterMonthsToDateRange } from './search';
import ReactMarkdown from 'react-markdown';
import { cloneDeep } from 'lodash';
import { themesSlice } from '../../../../store';
import { ODATA_SEARCH_ERROR_MESSAGE } from '../../../../hooks/useODataSearch';

const ErrorMessage = {
  noProductsFound: t`No products were found for the selected search parameters.\n
  To get more results, try selecting more data sources, extending the time range and/or selecting a larger area on the map.`,
};

class AdvancedSearch extends Component {
  state = {
    fromMoment: moment.utc().subtract(1, 'month').startOf('day'),
    toMoment: moment.utc().endOf('day'),
    datepickerIsExpanded: false,
    filterMonths: null,
    displayCalendarFrom: false,
    displayCalendarTo: false,
    collectionForm: getCollectionFormInitialState(),
    searchCriteria: '',
    formValidationError: '',
    additionFiltersPositionTop: 0,
  };

  calendarHolder = React.createRef();

  componentWillUnmount() {
    store.dispatch(searchResultsSlice.actions.reset());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isExpanded && !this.props.isExpanded) {
      this.shouldDisplayTileGeometries(false);
    }
    if (!prevProps.isExpanded && this.props.isExpanded) {
      this.shouldDisplayTileGeometries(true);
    }

    if (this.props.oDataSearchResult !== prevProps?.oDataSearchResult) {
      store.dispatch(searchResultsSlice.actions.setSearchResult(this.props.oDataSearchResult));
      store.dispatch(
        searchResultsSlice.actions.setSearchFormData({
          fromMoment: this.state.fromMoment,
          toMoment: this.state.toMoment,
          collectionForm: this.state.collectionForm,
          searchCriteria: this.state.searchCriteria,
        }),
      );
    }
    //populate search form with params used for last search when go to search is selected
    if (this.props.searchFormData && !this.props.resultsPanelSelected) {
      this.setState((state) => ({
        ...state,
        fromMoment: this.props.searchFormData.fromMoment,
        toMoment: this.props.searchFormData.toMoment,
        collectionForm: this.props.searchFormData.collectionForm,
        searchCriteria: this.props.searchFormData.searchCriteria || '',
      }));
      //reset last search params
      store.dispatch(searchResultsSlice.actions.setSearchFormData(null));
    }
  }

  shouldDisplayTileGeometries = (shouldDisplay) => {
    store.dispatch(searchResultsSlice.actions.setDisplayingSearchResults(shouldDisplay));
  };

  setAdditionalFiltersPositionTop = (value) => this.setState({ additionFiltersPositionTop: value });

  resetSearch = () => {
    store.dispatch(searchResultsSlice.actions.reset());
  };

  onResultSelected = (tile) => {
    const fromTime = moment(tile.sensingTime).utc().startOf('day');
    const toTime = moment(tile.sensingTime).utc().endOf('day');

    if (
      !(
        this.props.selectedThemesListId === MODE_THEMES_LIST &&
        this.props.selectedThemeId === DEFAULT_THEME_ID
      )
    ) {
      store.dispatch(
        themesSlice.actions.setSelectedThemeId({
          selectedThemeId: DEFAULT_MODE.themes[0].id,
          selectedThemesListId: MODE_THEMES_LIST,
        }),
      );
    }

    if (tile.datasetId !== this.props.datasetId) {
      store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: tile.datasetId }));
    }
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        fromTime: isDatasetIdGIBS(tile.datasetId) ? null : fromTime,
        toTime: toTime,
      }),
    );
    store.dispatch(searchResultsSlice.actions.setDisplayingSearchResults(false));
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));
    if (tile.geometry) {
      const { lat, lng, zoom } = getBoundsAndLatLng(tile.geometry);
      const dsh = getDataSourceHandler(tile.datasetId);
      const { min: minZoom, max: maxZoom } = (dsh && dsh.getLeafletZoomConfig(tile.datasetId)) || {};

      /*use best(highest) possible zoom calculated from 
      - current map zoom (this.props.zoom), 
      - min zoom for selected layer(minZoom) 
      - zoom calculated from bounds(zoom)      
      */
      let newZoom = Math.max(minZoom, zoom, this.props.zoom);

      if (newZoom > maxZoom) {
        newZoom = maxZoom;
      }

      store.dispatch(
        mainMapSlice.actions.setPosition({
          lat: lat,
          lng: lng,
          zoom: newZoom,
        }),
      );
    }
    this.props.setCollectionSelectionExpanded && this.props.setCollectionSelectionExpanded(false);
  };

  setHighlightedTile = (tile) => {
    store.dispatch(searchResultsSlice.actions.setHighlightedTile(tile));
  };

  handleDatepickerExpanded = (expanded) => {
    this.setState({
      datepickerIsExpanded: expanded,
    });
  };

  setSelectedCollections = (selectedCollections) => {
    this.setState((state) => {
      const { maxCc, selectedFilters } = state.collectionForm;
      const newSelectedFilters = cloneDeep(selectedFilters) ?? {};

      //remove filters for unselected collections
      const filtersForUnselectedCollections = Object.keys(selectedFilters).filter(
        (collectionFilterKey) => !Object.keys(selectedCollections).find((key) => key === collectionFilterKey),
      );

      filtersForUnselectedCollections.forEach((c) => delete newSelectedFilters?.[c]);

      const newCollectionFormState = {
        selectedCollections: selectedCollections,
        maxCc: maxCc,
        selectedFilters: newSelectedFilters,
      };
      return {
        collectionForm: newCollectionFormState,
      };
    });
  };

  setMaxCc = (maxCc) => {
    this.setState((state) => {
      const { selectedCollections, selectedFilters } = state.collectionForm;
      const newCollectionFormState = {
        selectedCollections: selectedCollections,
        maxCc: maxCc,
        selectedFilters: selectedFilters,
      };
      return {
        collectionForm: newCollectionFormState,
      };
    });
  };

  setSelectedFilters = (collectionId, filterId, value) => {
    this.setState((state) => {
      const { selectedCollections, maxCc, selectedFilters } = state.collectionForm;
      const newSelectedFilters = cloneDeep(selectedFilters);

      if (value) {
        newSelectedFilters[collectionId] = {
          ...newSelectedFilters?.[collectionId],
          [filterId]: value,
        };
      } else {
        delete newSelectedFilters?.[collectionId]?.[filterId];
      }

      const newCollectionFormState = {
        selectedCollections: selectedCollections,
        maxCc: maxCc,
        selectedFilters: newSelectedFilters,
      };

      return {
        collectionForm: newCollectionFormState,
      };
    });
  };

  resetSelectedFilters = (collectionId) => {
    this.setState((state) => {
      const { selectedCollections, maxCc, selectedFilters } = state.collectionForm;
      const newSelectedFilters = cloneDeep(selectedFilters);
      delete newSelectedFilters?.[collectionId];

      const newCollectionFormState = {
        selectedCollections: selectedCollections,
        maxCc: maxCc,
        selectedFilters: newSelectedFilters,
      };
      return {
        collectionForm: newCollectionFormState,
      };
    });
  };

  setFilterMonths = (filterMonths) => {
    this.setState({
      filterMonths: filterMonths,
    });
  };

  getAndSetNextPrevDateFrom = async (direction, selectedDay, toMoment, minDate) => {
    let newFromMoment;
    if (direction === 'prev') {
      newFromMoment = moment.utc(selectedDay).add(-1, 'days');
    } else {
      newFromMoment = moment.utc(selectedDay).add(1, 'days');
    }
    if (newFromMoment < minDate || newFromMoment > toMoment) {
      throw Error('Invalid date range');
    }
    this.setState({ fromMoment: newFromMoment });
  };

  getAndSetNextPrevDateTo = async (direction, selectedDay, fromMoment, maxDate) => {
    let newToMoment;
    if (direction === 'prev') {
      newToMoment = moment.utc(selectedDay).add(-1, 'days');
    } else {
      newToMoment = moment.utc(selectedDay).add(1, 'days');
    }
    if (newToMoment > maxDate || newToMoment < fromMoment) {
      throw Error('Invalid date range');
    }
    this.setState({ toMoment: newToMoment });
  };

  doSearch = () => {
    this.setState({
      formValidationError: '',
    });
    try {
      const ODataQuery = this.getQuery();
      this.props.productSearch(ODataQuery);
    } catch (e) {
      this.setState({
        formValidationError: e,
      });
    }
  };

  backToSearch = () => {
    this.resetSearch();
  };

  getNextNResults = async () => {
    await this.props.searchResult.next();
  };

  getQuery = () => {
    const { collectionForm, fromMoment, toMoment, searchCriteria, filterMonths } = this.state;
    const { mapBounds, aoiBounds } = this.props;
    const params = {};

    if (!searchCriteria && !Object.keys(collectionForm.selectedCollections).length) {
      throw new Error('Please select at least one search criteria!');
    }

    if (searchCriteria !== '') {
      params['name'] = searchCriteria;
    }

    if (Object.keys(collectionForm.selectedCollections).length) {
      const collections = Object.keys(collectionForm.selectedCollections).map((collectionId) => ({
        id: collectionId,
      }));

      //add instruments
      collections.forEach((collection) => {
        const instruments = Object.keys(collectionForm.selectedCollections[collection.id]).map(
          (instrumentId) => {
            //check if instrument supports CC
            const hasMaxCc =
              collectionForm &&
              collectionForm.maxCc &&
              collectionForm.maxCc[collection.id] &&
              collectionForm.maxCc[collection.id][instrumentId] !== undefined;

            //add product types
            let productTypes = [];
            if (collectionForm.selectedCollections[collection.id][instrumentId]) {
              productTypes = Object.keys(collectionForm.selectedCollections[collection.id][instrumentId]).map(
                (productType) => ({ id: productType }),
              );
            }
            return {
              id: instrumentId,
              ...(hasMaxCc ? { cloudCover: collectionForm.maxCc[collection.id][instrumentId] } : {}),
              ...(productTypes.length ? { productTypes: productTypes } : {}),
            };
          },
        );
        collection.instruments = instruments;
        collection.additionalFilters = collectionForm.selectedFilters?.[collection.id];
      });

      params['collections'] = collections;
    }

    if (filterMonths) {
      const intervals = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths).map((interval) => ({
        fromTime: moment.utc(interval.fromMoment).toDate().toISOString(),
        toTime: moment.utc(interval.toMoment).toDate().toISOString(),
      }));

      if (!intervals.length) {
        throw new Error(t`Invalid time range!`);
      }

      params['timeIntervals'] = intervals;
    } else {
      if (fromMoment) {
        params['fromTime'] = moment.utc(fromMoment).toDate().toISOString();
      }
      if (toMoment) {
        params['toTime'] = moment.utc(toMoment).toDate().toISOString();
      }
    }

    if (mapBounds || aoiBounds) {
      params['geometry'] = boundsToPolygon(aoiBounds ? aoiBounds : mapBounds);
    }
    return oDataHelpers.createAdvancedSearchQuery(params);
  };

  render() {
    const {
      minDate,
      maxDate,
      dataSourcesInitialized,
      selectedThemeId,
      selectedTiles,
      isExpanded,
      searchError,
      searchInProgress,
      searchResult,
      resultsPanelSelected,
      resultsAvailable,
    } = this.props;
    const minDateRange = moment.utc(minDate ? minDate : '2014-04-03').startOf('day');
    const maxDateRange = moment.utc(maxDate).endOf('day');
    const {
      fromMoment,
      toMoment,
      displayCalendarFrom,
      displayCalendarTo,
      formValidationError,
      additionFiltersPositionTop,
    } = this.state;

    if (!isExpanded) {
      return null;
    }

    if (selectedThemeId !== null && !dataSourcesInitialized) {
      return (
        <div className="search-loader">
          <Loader />
        </div>
      );
    }

    const oDataSearchError =
      searchError?.message === ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND
        ? { message: ErrorMessage.noProductsFound }
        : null;

    const displayingResults = resultsAvailable && resultsPanelSelected;
    const error = formValidationError || oDataSearchError;
    const { selectedCollections, maxCc, selectedFilters } = this.state.collectionForm;
    return (
      <>
        {displayingResults && (
          <Results
            results={searchResult?.allResults}
            hasMore={searchResult?.hasMore}
            totalCount={searchResult?.totalCount}
            getNextNResults={this.getNextNResults}
            onResultSelected={this.onResultSelected}
            setHighlightedTile={this.setHighlightedTile}
            selectedTiles={selectedTiles}
            backToSearch={this.backToSearch}
          />
        )}

        <div className={`search-panel ${displayingResults ? 'hidden' : ''}`}>
          <div className="search-criteria-wrapper">
            <div className="top-label">
              <div className="data-source-advanced-title">{t`Search criteria`}:</div>
              <div>
                <input
                  type="text"
                  placeholder={t`Product name`}
                  value={this.state.searchCriteria}
                  onChange={(e) => this.setState({ searchCriteria: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </div>
          <div className="top-label">
            <div className="data-source-advanced-title">{t`Data sources`}:</div>

            <div className="checkbox-group">
              <div className="column" key={selectedThemeId || ''}>
                <CollectionForm
                  selectedCollections={selectedCollections}
                  maxCc={maxCc}
                  setSelectedCollections={this.setSelectedCollections}
                  setMaxCc={this.setMaxCc}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={this.setSelectedFilters}
                  resetSelectedFilters={this.resetSelectedFilters}
                  setAdditionalFiltersPositionTop={this.setAdditionalFiltersPositionTop}
                  additionFiltersPositionTop={additionFiltersPositionTop}
                />
              </div>
            </div>
          </div>
          <div className="clear" />
          <div className="select-time-range">
            <div className="time-range-advanced-title">{t`Time range`}:</div>
            <TimespanPicker
              id="visualization-time-select"
              minDate={minDateRange}
              maxDate={maxDateRange}
              timespan={{ fromTime: fromMoment, toTime: toMoment }}
              applyTimespan={(fromTime, toTime) => this.setState({ fromMoment: fromTime, toMoment: toTime })}
              timespanExpanded={true}
              calendarHolder={this.calendarHolder}
              displayCalendarFrom={displayCalendarFrom}
              openCalendarFrom={() => this.setState({ displayCalendarFrom: true })}
              closeCalendarFrom={() => this.setState({ displayCalendarFrom: false })}
              displayCalendarUntil={displayCalendarTo}
              openCalendarUntil={() => this.setState({ displayCalendarTo: true })}
              closeCalendarUntil={() => this.setState({ displayCalendarTo: false })}
              showNextPrevDateArrows={true}
              getAndSetNextPrevDateFrom={async (direction, selectedDay) =>
                await this.getAndSetNextPrevDateFrom(direction, selectedDay, toMoment, minDateRange)
              }
              getAndSetNextPrevDateTo={async (direction, selectedDay) =>
                await this.getAndSetNextPrevDateTo(direction, selectedDay, fromMoment, maxDateRange)
              }
            />

            <div className="calendar-holder" ref={this.calendarHolder} />
            <EOBFilterSearchByMonths onChange={this.setFilterMonths} />
          </div>
          <div className="search-btn-wrapper">
            <EOBButton loading={searchInProgress} onClick={this.doSearch} fluid text={t`Search`} />
          </div>
          {error ? (
            <NotificationPanel msg={<ReactMarkdown source={error.message}></ReactMarkdown>} type="error" />
          ) : null}
        </div>
      </>
    );
  }
}

const mapStoreToProps = (store) => ({
  zoom: store.mainMap.zoom,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  mapBounds: store.mainMap.bounds,
  aoiBounds: store.aoi.bounds,
  is3D: store.mainMap.is3D,
  datasetId: store.visualization.datasetId,
  selectedTiles: store.searchResults.selectedTiles,
  searchResult: store.searchResults.searchResult,
  searchFormData: store.searchResults.searchFormData,
  resultsAvailable: store.searchResults.resultsAvailable,
  resultsPanelSelected: store.searchResults.resultsPanelSelected,
  user: store.auth.user.userdata,
  selectedModeId: store.themes.selectedModeId,
  selectedThemeId: store.themes.selectedThemeId,
  modeThemesList: store.themes.themesLists[MODE_THEMES_LIST],
  userInstancesThemesList: store.themes.themesLists[USER_INSTANCES_THEMES_LIST],
  urlThemesList: store.themes.themesLists[URL_THEMES_LIST],
  themesLists: store.themes.themesLists,
  selectedThemesListId: store.themes.selectedThemesListId,
  selectedLanguage: store.language.selectedLanguage,
  selectedTab: store.tabs.selectedTabSearchPanelIndex,
  terrainViewerId: store.terrainViewer.id,
});

export default connect(mapStoreToProps, null)(withODataSearchHOC(AdvancedSearch));
