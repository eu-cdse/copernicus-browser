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
import store, {
  searchResultsSlice,
  visualizationSlice,
  mainMapSlice,
  tabsSlice,
  workspaceSlice,
} from '../../../../store';
import { getSavedWorkspaceProducts } from '../../../../api/OData/workspace';
import {
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  TABS,
  DEFAULT_MODE,
  DATE_MODES,
  DEFAULT_THEME_ID,
  ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY,
} from '../../../../const';
import { getBoundsAndLatLng } from '../../../../utils/coords';
import { persistSearchConfig } from '../../../../utils/searchConfigPersistence';
import Results from '../../../Results/Results';
import './AdvancedSearch.scss';
import { buildSearchGeometry } from '../../../../utils/geojson.utils';
import oDataHelpers, {
  calculateMaxGeometryChars,
  findCollectionConfigById,
  findGroupConfigById,
  MIN_SEARCH_DATE,
} from '../../../../api/OData/ODataHelpers';

import { withODataSearchHOC } from './withODataSearchHOC';
import { withSTACSearchHOC } from './withSTACSearchHOC';

import { applyFilterMonthsToDateRange } from './search';
import ReactMarkdown from 'react-markdown';
import cloneDeep from 'lodash.clonedeep';
import { themesSlice } from '../../../../store';
import { ODATA_SEARCH_ERROR_MESSAGE } from '../../../../hooks/useODataSearch';
import { STAC_SEARCH_ERROR_MESSAGE } from '../../../../hooks/useSTACSearch';
import { ErrorCode, ErrorMessage } from './const';
import {
  CollectionFormInitialState,
  getCollectionFormConfig,
  getCollectionFormInitialState,
} from './collectionFormConfig.utils';
import { recursiveCollections } from './collectionFormConfig';
import RecursiveCollectionForm from './RecursiveCollectionForm';
import { AttributeNames } from '../../../../api/OData/assets/attributes';
import { ODataCollections } from '../../../../api/OData/ODataTypes';
import { createSTACSearchPayload } from '../../../../api/STAC/STACSearchPayloadBuilder';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../../../rehypeConfig';
import MessagePanel from '../../MessagePanel/MessagePanel';
import { findConfigNodeIdsByTypeInScope, isSTACCollectionNode } from '../../../../utils/collectionConfigTree';

const WarningMessage = {
  geometrySimplified: () => t`Your search geometry was simplified to fit the search query limits.`,
};

const findConfigByPath = (rootConfig, path = []) => {
  if (!rootConfig) {
    return null;
  }
  return path.reduce(
    (currentNode, pathId) => currentNode?.items?.find((item) => item.id === pathId),
    rootConfig,
  );
};

const addProductTypesToInstrument = (instrumentObj, productTypeIds) => {
  if (!instrumentObj || !Array.isArray(productTypeIds) || !productTypeIds.length) {
    return;
  }
  if (!instrumentObj.productTypes) {
    instrumentObj.productTypes = [];
  }
  const selectedProductTypeIds = new Set(instrumentObj.productTypes.map((pt) => pt.id));
  productTypeIds.forEach((productTypeId) => {
    if (!selectedProductTypeIds.has(productTypeId)) {
      instrumentObj.productTypes.push({ id: productTypeId });
      selectedProductTypeIds.add(productTypeId);
    }
  });
};

class AdvancedSearch extends Component {
  state = {
    fromMoment: moment.utc().subtract(1, 'month').startOf('day'),
    toMoment: moment.utc().endOf('day'),
    datepickerIsExpanded: false,
    filterMonths: null,
    displayCalendarFrom: false,
    displayCalendarTo: false,
    collectionForm: CollectionFormInitialState,
    searchCriteria: '',
    formValidationError: '',
    additionFiltersPositionTop: 0,
    // Parallel search tracking
    parallelSearch: {
      isParallelSearch: false,
      stacPending: false,
      odataPending: false,
      stacResult: null,
      odataResult: null,
    },
    // Non-blocking notice shown alongside results when one leg of a parallel STAC+OData
    // search comes up empty/errors while the other leg succeeds - see MR review F2.
    partialResultsWarning: null,
    geometrySimplified: false,
  };

  calendarHolder = React.createRef();
  errorPanelRef = React.createRef();

  // True only while restoring cached results on page refresh, so componentDidUpdate
  // preserves the persisted tab instead of forcing the Search tab open (see below).
  hydratingFromCache = false;

  // Captured from sessionStorage at mount so the cache-restore branch in
  // componentDidUpdate can reference it directly instead of re-reading storage.
  persistedShouldShowAdvancedSearchTab = false;

  componentDidMount() {
    const searchConfigFromSession = JSON.parse(
      sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY),
    );
    if (searchConfigFromSession) {
      this.persistedShouldShowAdvancedSearchTab =
        searchConfigFromSession.shouldShowAdvancedSearchTab ?? false;
      if (searchConfigFromSession.searchFormData) {
        this.setState({
          fromMoment: searchConfigFromSession.searchFormData.fromMoment,
          toMoment: searchConfigFromSession.searchFormData.toMoment,
          collectionForm: searchConfigFromSession.searchFormData.collectionForm,
          searchCriteria: searchConfigFromSession.searchFormData.searchCriteria,
        });
        store.dispatch(searchResultsSlice.actions.setSearchFormData(searchConfigFromSession.searchFormData));
      }

      // Restore cached results to Redux immediately for instant UI display, then
      // reconstruct next() locally via hydrate (no network call needed). The hydrate
      // step is deferred so this.setState above has flushed — getQuery()/collection
      // partitioning read state.
      if (searchConfigFromSession.cachedResults && searchConfigFromSession.resultsAvailable) {
        const cachedPage = searchConfigFromSession.cachedPage ?? 0;
        const cachedTotalCount = searchConfigFromSession.cachedTotalCount ?? 0;
        const cachedHasMore = searchConfigFromSession.cachedHasMore ?? false;

        store.dispatch(
          searchResultsSlice.actions.setSearchResult({
            allResults: searchConfigFromSession.cachedResults,
            page: cachedPage,
            totalCount: cachedTotalCount,
            hasMore: cachedHasMore,
            // next is transiently null until hydrate runs below; loadMoreProducts
            // guards on this.props.searchResult?.next so the brief gap is safe.
            next: null,
          }),
        );

        setTimeout(() => {
          // Mark this oDataSearchResult/stacSearchResult change as a cache restore
          // (not a fresh user search) so componentDidUpdate doesn't force the search
          // tab back open and override the tab restored from the URL on refresh.
          this.hydratingFromCache = true;
          this.hydrateCachedResults(searchConfigFromSession);
        }, 0);
      }
    }
  }

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

    // If user token just became available and we have cached results, trigger a fresh
    // background search so results reflect the user's actual access. Routed through
    // doSearch() (rather than unconditionally calling the OData productSearch) so STAC-only
    // and mixed collections (e.g. Landsat Mosaic) are partitioned and searched via the
    // correct API - see MR review F2.
    if (!prevProps.userToken && this.props.userToken) {
      const searchConfigFromSession = JSON.parse(
        sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY),
      );
      if (searchConfigFromSession?.cachedResults && searchConfigFromSession?.resultsAvailable) {
        this.doSearch();
      }
    }

    const { parallelSearch } = this.state;

    // Handle OData search results
    if (this.props.oDataSearchResult !== prevProps?.oDataSearchResult && this.props.oDataSearchResult) {
      if (parallelSearch.isParallelSearch) {
        // In parallel mode, store the result and wait for both to complete
        this.setState(
          (prevState) => ({
            parallelSearch: {
              ...prevState.parallelSearch,
              odataPending: false,
              odataResult: this.props.oDataSearchResult,
            },
          }),
          this.checkAndMergeParallelResults,
        );
      } else {
        // Single search mode - dispatch result immediately
        this.dispatchSearchResult(this.props.oDataSearchResult);
      }
    }

    // Handle STAC search results
    if (this.props.stacSearchResult !== prevProps?.stacSearchResult && this.props.stacSearchResult) {
      if (parallelSearch.isParallelSearch) {
        // In parallel mode, store the result and wait for both to complete
        this.setState(
          (prevState) => ({
            parallelSearch: {
              ...prevState.parallelSearch,
              stacPending: false,
              stacResult: this.props.stacSearchResult,
            },
          }),
          this.checkAndMergeParallelResults,
        );
      } else {
        // Single search mode - dispatch result immediately
        this.dispatchSearchResult(this.props.stacSearchResult);
      }
    }

    // Handle OData search errors: in parallel mode, a failed OData leg must still count as
    // "done" (with no result), otherwise odataPending never clears and the STAC leg's
    // already-successful results are never dispatched - see MR review F2.
    if (this.props.searchError !== prevProps?.searchError && this.props.searchError) {
      if (parallelSearch.isParallelSearch) {
        this.setState(
          (prevState) => ({
            parallelSearch: {
              ...prevState.parallelSearch,
              odataPending: false,
            },
          }),
          this.checkAndMergeParallelResults,
        );
      }
    }

    // Handle STAC search errors: same reasoning as above, but for a failed STAC leg
    // stranding the OData leg's already-successful results - see MR review F2.
    if (this.props.stacSearchError !== prevProps?.stacSearchError && this.props.stacSearchError) {
      if (parallelSearch.isParallelSearch) {
        this.setState(
          (prevState) => ({
            parallelSearch: {
              ...prevState.parallelSearch,
              stacPending: false,
            },
          }),
          this.checkAndMergeParallelResults,
        );
      }
    }

    //populate search form with params used for last search when go to search is selected
    if (this.props.searchFormData && !this.props.resultsPanelSelected) {
      const formConfig = getCollectionFormConfig(recursiveCollections, { userToken: this.props.userToken });
      this.setState((state) => ({
        ...state,
        fromMoment: this.props.searchFormData.fromMoment,
        toMoment: this.props.searchFormData.toMoment,
        collectionForm: getCollectionFormInitialState(formConfig, this.props.searchFormData.collectionForm),
        searchCriteria: this.props.searchFormData.searchCriteria || '',
      }));
      //reset last search params
      store.dispatch(searchResultsSlice.actions.setSearchFormData(null));
    }

    if (!prevProps.searchError && this.props.searchError) {
      this.errorPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Dispatches search results to the store and session storage
   */
  dispatchSearchResult = (searchResult) => {
    const newSearchFormData = {
      fromMoment: this.state.fromMoment,
      toMoment: this.state.toMoment,
      collectionForm: this.state.collectionForm,
      searchCriteria: this.state.searchCriteria,
    };

    store.dispatch(searchResultsSlice.actions.setSearchResult(searchResult));
    store.dispatch(searchResultsSlice.actions.setSearchFormData(newSearchFormData));

    // Cache only serializable data (without non-serializable functions like result.next() or query.skip())
    const cachedResults = searchResult?.allResults || [];
    const cachedTotalCount = searchResult?.totalCount || 0;
    const cachedHasMore = searchResult?.hasMore || false;
    // Only meaningful for a single-backend STAC result (parallel/merged results don't
    // expose a resumable token here — see componentDidMount's cache-restore handling).
    const cachedStacNextToken = searchResult?.nextToken ?? null;
    // Merged (parallel) results can't be safely split back into per-backend result
    // arrays on cache-restore, so we record whether this was a parallel search and
    // skip reconstructing a "load more" continuation for that case on restore.
    const cachedIsParallelSearch = !!searchResult?._mergedFrom;

    // A genuine new search should bring the user to the search tab. A cache restore
    // (hydrate on page refresh) must not — it would override the tab the URL params
    // already restored (e.g. Visualise). In that case preserve the persisted flag.
    const shouldShowAdvancedSearchTab = this.hydratingFromCache
      ? this.persistedShouldShowAdvancedSearchTab
      : true;
    this.hydratingFromCache = false;

    persistSearchConfig({
      searchFormData: newSearchFormData,
      resultsAvailable: true,
      resultsPanelSelected: true,
      shouldShowAdvancedSearchTab,
      cachedResults: cachedResults,
      cachedTotalCount: cachedTotalCount,
      cachedHasMore: cachedHasMore,
      cachedPage: searchResult?.page ?? 0,
      cachedStacNextToken,
      cachedIsParallelSearch,
    });
  };

  /**
   * Checks if both parallel searches have completed and merges the results
   */
  checkAndMergeParallelResults = () => {
    const { parallelSearch } = this.state;

    // Check if both searches are done (not pending and have results OR were never initiated)
    const stacDone = !parallelSearch.stacPending;
    const odataDone = !parallelSearch.odataPending;

    if (stacDone && odataDone) {
      const stacResult = parallelSearch.stacResult;
      const odataResult = parallelSearch.odataResult;
      let partialResultsWarning = null;

      // Merge results if both have data
      if (stacResult && odataResult) {
        const mergedResult = this.mergeSearchResults(stacResult, odataResult);
        this.dispatchSearchResult(mergedResult);
      } else if (stacResult) {
        this.dispatchSearchResult(stacResult);
        // The OData leg of this parallel search came back empty/errored while STAC
        // succeeded - surface a non-blocking notice alongside the results instead of
        // silently dropping the fact that one of the selected data sources had no matches.
        if (parallelSearch.isParallelSearch) {
          partialResultsWarning = this.buildPartialResultsWarning(this.props.searchError);
        }
      } else if (odataResult) {
        this.dispatchSearchResult(odataResult);
        if (parallelSearch.isParallelSearch) {
          partialResultsWarning = this.buildPartialResultsWarning(this.props.stacSearchError);
        }
      }

      // Reset the pending flags, but keep the last known per-backend results (and
      // isParallelSearch flag) around so getNextNResults can tell this was a parallel
      // search and re-merge correctly when the user clicks "load more".
      this.setState({
        parallelSearch: {
          ...parallelSearch,
          stacPending: false,
          odataPending: false,
        },
        partialResultsWarning,
      });
    }
  };

  /**
   * Builds the non-blocking "one data source had no matches" warning message from the
   * failed leg's error, appending its availability info when present. Returns null when
   * the error isn't a genuine "no products found" case (e.g. a network/API failure),
   * since that isn't something the user can resolve by adjusting their search.
   */
  buildPartialResultsWarning = (failedLegError) => {
    const isNoProductsError =
      failedLegError?.message?.startsWith(ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND) ||
      failedLegError?.message?.startsWith(STAC_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND);
    if (!isNoProductsError) {
      return null;
    }
    return failedLegError.availabilityMessage
      ? `${ErrorMessage[ErrorCode.partialNoMatchingProducts]()}\n${failedLegError.availabilityMessage}`
      : ErrorMessage[ErrorCode.partialNoMatchingProducts]();
  };

  /**
   * Merges search results from STAC and OData APIs
   * Results are merged and sorted by sensing time (descending)
   */
  mergeSearchResults = (stacResult, odataResult) => {
    const allResults = [...(stacResult.allResults || []), ...(odataResult.allResults || [])];

    // Sort by sensing time descending, pushing results with a missing/invalid
    // sensingTime to the end instead of letting NaN comparisons silently scramble
    // their position relative to validly-dated results - see MR review F2.
    allResults.sort((a, b) => {
      const timeA = new Date(a.sensingTime).getTime();
      const timeB = new Date(b.sensingTime).getTime();
      if (isNaN(timeA) && isNaN(timeB)) {
        return 0;
      }
      if (isNaN(timeA)) {
        return 1;
      }
      if (isNaN(timeB)) {
        return -1;
      }
      return timeB - timeA;
    });

    return {
      allResults,
      hasMore: stacResult.hasMore || odataResult.hasMore,
      totalCount: (stacResult.totalCount || 0) + (odataResult.totalCount || 0),
      // "load more" is handled by getNextNResults, which knows how to continue
      // pagination on whichever backend(s) still have more and re-merge with the
      // other backend's already-fetched results (see getNextNResults below).
      next: stacResult.hasMore || odataResult.hasMore ? () => {} : null,
      // Track source APIs for potential future use
      _mergedFrom: { stac: !!stacResult, odata: !!odataResult },
    };
  };

  shouldDisplayTileGeometries = (shouldDisplay) => {
    store.dispatch(searchResultsSlice.actions.setDisplayingSearchResults(shouldDisplay));
  };

  setAdditionalFiltersPositionTop = (value) => this.setState({ additionFiltersPositionTop: value });

  resetSearch = () => {
    store.dispatch(searchResultsSlice.actions.reset());
  };

  onResultSelected = (tile) => {
    const nominalDate = tile?.attributes.find((attr) => attr.Name === AttributeNames.nominalDate)?.Value;
    const fromTime = moment(nominalDate ?? tile.sensingTime)
      .utc()
      .startOf('day');
    const toTime = moment(nominalDate ?? tile.sensingTime)
      .utc()
      .endOf('day');

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
        fromTime: fromTime,
        toTime: toTime,
      }),
    );
    store.dispatch(searchResultsSlice.actions.setDisplayingSearchResults(false));
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));

    if (!this.props.showLayerPanel && this.props.setShowLayerPanel) {
      this.props.setShowLayerPanel(true);
    }

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

      // zoom only in case if it can't display anything on the current resolution due to the min message
      if (this.props.zoom < minZoom) {
        store.dispatch(
          mainMapSlice.actions.setPosition({
            lat: lat,
            lng: lng,
            zoom: newZoom,
          }),
        );
      }
    }
    this.props.setCollectionSelectionExpanded && this.props.setCollectionSelectionExpanded(false);

    // Set mode to single if mosaic result is selected
    if (this.props.dateMode === DATE_MODES.MOSAIC.value) {
      store.dispatch(visualizationSlice.actions.setDateMode(DATE_MODES.SINGLE.value));
    }
  };

  setHighlightedTile = (tile) => {
    store.dispatch(searchResultsSlice.actions.setHighlightedTile(tile));
  };

  handleDatepickerExpanded = (expanded) => {
    this.setState({
      datepickerIsExpanded: expanded,
    });
  };

  setSelectedCollections = (newSelectedCollections) => {
    this.setState((state) => {
      const { selectedCollections, maxCc, selectedFilters } = state.collectionForm;
      const newSelectedFilters = cloneDeep(selectedFilters) ?? {};

      //remove filters for unselected collections
      const filtersForUnselectedCollections = Object.keys(selectedFilters).filter(
        (collectionFilterKey) =>
          !Object.keys(newSelectedCollections).find((key) => key === collectionFilterKey),
      );

      filtersForUnselectedCollections.forEach((c) => delete newSelectedFilters?.[c]);

      // newly selected L1B
      if (
        selectedCollections[ODataCollections.S2.id]?.['MSI']?.['MSI_L1B_DS'] === undefined &&
        newSelectedCollections[ODataCollections.S2.id]?.['MSI']?.['MSI_L1B_DS']
      ) {
        if (newSelectedFilters[ODataCollections.S2.id] === undefined) {
          newSelectedFilters[ODataCollections.S2.id] = {};
        }

        if (newSelectedFilters[ODataCollections.S2.id][AttributeNames.productType] === undefined) {
          newSelectedFilters[ODataCollections.S2.id][AttributeNames.productType] = [
            { value: 'MSI_L1B_DS', label: 'MSI_L1B_DS' },
          ];
        } else if (
          newSelectedFilters[ODataCollections.S2.id][AttributeNames.productType].findIndex(
            (pt) => pt.value === 'MSI_L1B_DS',
          ) === -1
        ) {
          newSelectedFilters[ODataCollections.S2.id][AttributeNames.productType].push({
            value: 'MSI_L1B_DS',
            label: 'MSI_L1B_DS',
          });
        }
        // deselected L1B
      } else if (
        selectedCollections[ODataCollections.S2.id]?.['MSI']?.['MSI_L1B_DS'] &&
        newSelectedCollections[ODataCollections.S2.id]?.['MSI']?.['MSI_L1B_DS'] === undefined
      ) {
        if (newSelectedFilters[ODataCollections.S2.id]?.[AttributeNames.productType] !== undefined) {
          const idx = newSelectedFilters[ODataCollections.S2.id][AttributeNames.productType].findIndex(
            (pt) => pt.value === 'MSI_L1B_DS',
          );
          if (idx !== -1) {
            newSelectedFilters[ODataCollections.S2.id][AttributeNames.productType].splice(idx, 1);
          }
        }
      }

      const newCollectionFormState = {
        selectedCollections: newSelectedCollections,
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
      if (!isNaN(value) || value.length > 0) {
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
      throw Error(ErrorCode.invalidDateRange);
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
      throw Error(ErrorCode.invalidDateRange);
    }
    this.setState({ toMoment: newToMoment });
  };

  /**
   * Partitions selected collections into STAC-capable and OData-only collections.
   * This enables parallel search when multiple collections with different API support are selected.
   *
   * @param {Array} formConfig - The collection form configuration array
   * @param {Object} selectedCollections - The currently selected collections object
   * @returns {Object} Object with stacCollections and odataCollections properties
   */
  partitionCollectionsByApiSupport(formConfig, selectedCollections) {
    const stacCollections = {};
    const odataCollections = {};

    for (const collectionId of Object.keys(selectedCollections)) {
      const collectionObj = formConfig.find((c) => c.id === collectionId);
      if (!collectionObj || !collectionObj.items) {
        // If no items, default to OData
        odataCollections[collectionId] = selectedCollections[collectionId];
        continue;
      }

      const stacSubCollections = {};
      const odataSubCollections = {};
      let hasStacItems = false;
      let hasOdataItems = false;

      for (const subCollectionId of Object.keys(selectedCollections[collectionId])) {
        // Skip metadata properties like 'type' and 'platform' (mirrors the same check in
        // getCollectionFormInitialState in collectionFormConfig.utils.js)
        if (subCollectionId === 'type' || subCollectionId === 'platform') {
          continue;
        }

        const subCollectionObj = collectionObj.items.find((item) => item.id === subCollectionId);
        if (isSTACCollectionNode(subCollectionObj)) {
          stacSubCollections[subCollectionId] = selectedCollections[collectionId][subCollectionId];
          hasStacItems = true;
        } else if (subCollectionObj) {
          // Only add if it's a valid sub-collection (found in formConfig)
          odataSubCollections[subCollectionId] = selectedCollections[collectionId][subCollectionId];
          hasOdataItems = true;
        }
      }

      // If no valid sub-collections were matched from selectedCollections,
      // the parent group was selected — include all children from config
      if (!hasStacItems && !hasOdataItems) {
        for (const item of collectionObj.items) {
          if (isSTACCollectionNode(item)) {
            stacSubCollections[item.id] = {};
            hasStacItems = true;
          } else {
            odataSubCollections[item.id] = {};
            hasOdataItems = true;
          }
        }
      }

      // Add to appropriate collection groups, preserving any metadata like 'type'
      if (hasStacItems) {
        stacCollections[collectionId] = { ...stacSubCollections };
        // Copy over type if it exists
        if (selectedCollections[collectionId].type) {
          stacCollections[collectionId].type = selectedCollections[collectionId].type;
        }
        // Copy over platform if it exists, so extractPlatforms() in STACSearchPayloadBuilder.js
        // can build the platform CQL2 filter for this collection.
        if (selectedCollections[collectionId].platform) {
          stacCollections[collectionId].platform = selectedCollections[collectionId].platform;
        }
      }
      if (hasOdataItems) {
        odataCollections[collectionId] = { ...odataSubCollections };
        // Copy over type if it exists
        if (selectedCollections[collectionId].type) {
          odataCollections[collectionId].type = selectedCollections[collectionId].type;
        }
      }
    }

    return { stacCollections, odataCollections };
  }

  /**
   * Reconstructs the `next()` continuation for cached results restored on page refresh,
   * without re-fetching the already-cached first page(s). Mirrors doSearch()'s partitioning
   * so STAC-only collections (e.g. Landsat Mosaic) are hydrated via hydrateSTACSearch and
   * never routed through the OData hydrate path (see MR review F1).
   *
   * Parallel (merged STAC+OData) searches can't be safely split back into per-backend
   * continuations from the merged cache alone, so for that case we just re-run doSearch()
   * to get a fresh, correctly-partitioned pair of searches instead of hydrating.
   */
  hydrateCachedResults = (searchConfigFromSession) => {
    if (searchConfigFromSession.cachedIsParallelSearch) {
      this.hydratingFromCache = false;
      this.doSearch();
      return;
    }

    const { collectionForm } = this.state;
    const formConfig = getCollectionFormConfig(recursiveCollections, { userToken: this.props.userToken });
    const { stacCollections, odataCollections } = this.partitionCollectionsByApiSupport(
      formConfig,
      collectionForm.selectedCollections,
    );

    const cachedResults = searchConfigFromSession.cachedResults ?? [];
    const cachedTotalCount = searchConfigFromSession.cachedTotalCount ?? 0;
    const cachedHasMore = searchConfigFromSession.cachedHasMore ?? false;
    const cachedPage = searchConfigFromSession.cachedPage ?? 0;
    const cachedStacNextToken = searchConfigFromSession.cachedStacNextToken ?? null;

    try {
      if (Object.keys(stacCollections).length > 0) {
        const { fromMoment, toMoment, searchCriteria, filterMonths } = this.state;
        const { mapBounds, aoiBounds, poiBounds } = this.props;
        const stacSelectedFilters = {};
        if (collectionForm.selectedFilters) {
          Object.keys(collectionForm.selectedFilters).forEach((collectionId) => {
            if (stacCollections[collectionId]) {
              stacSelectedFilters[collectionId] = collectionForm.selectedFilters[collectionId];
            }
          });
        }
        const stacCollectionForm = {
          ...collectionForm,
          selectedCollections: stacCollections,
          selectedFilters: stacSelectedFilters,
        };
        const stacPayload = createSTACSearchPayload({
          collectionForm: stacCollectionForm,
          collectionFormConfig: formConfig,
          fromMoment,
          toMoment,
          searchCriteria,
          filterMonths,
          mapBounds,
          aoiBounds,
          poiBounds,
          applyFilterMonthsToDateRange,
        });
        this.props.hydrateSTACSearch({
          payload: stacPayload,
          results: cachedResults,
          totalCount: cachedTotalCount,
          hasMore: cachedHasMore,
          nextToken: cachedStacNextToken,
        });
        return;
      }

      if (Object.keys(odataCollections).length > 0) {
        const odataSelectedFilters = {};
        if (collectionForm.selectedFilters) {
          Object.keys(collectionForm.selectedFilters).forEach((collectionId) => {
            if (odataCollections[collectionId]) {
              odataSelectedFilters[collectionId] = collectionForm.selectedFilters[collectionId];
            }
          });
        }
        const odataCollectionForm = {
          ...collectionForm,
          selectedCollections: odataCollections,
          selectedFilters: odataSelectedFilters,
        };
        const odataQuery = this.getQuery(odataCollectionForm);
        this.props.hydrateODataSearch({
          query: odataQuery,
          results: cachedResults,
          page: cachedPage,
          totalCount: cachedTotalCount,
          hasMore: cachedHasMore,
        });
        return;
      }

      // No selected collections matched either partition (e.g. name-only search) -
      // fall back to the plain OData query used by doSearch()'s name-only branch.
      const odataQuery = this.getQuery();
      this.props.hydrateODataSearch({
        query: odataQuery,
        results: cachedResults,
        page: cachedPage,
        totalCount: cachedTotalCount,
        hasMore: cachedHasMore,
      });
    } catch (e) {
      // Regeneration failed (e.g. stale/invalid cached form data) - give up on hydrating
      // silently; the user can trigger a manual search. Reset the flag so a subsequent
      // real search isn't mistaken for a cache restore.
      this.hydratingFromCache = false;
    }
  };

  doSearch = async () => {
    this.setState({
      formValidationError: '',
      partialResultsWarning: null,
    });
    try {
      const { collectionForm, fromMoment, toMoment, searchCriteria, filterMonths } = this.state;
      const { mapBounds, aoiBounds, poiBounds } = this.props;
      const formConfig = getCollectionFormConfig(recursiveCollections, { userToken: this.props.userToken });

      if (!!this.props.user) {
        const productSaved = await getSavedWorkspaceProducts();
        store.dispatch(workspaceSlice.actions.setSavedWorkspaceProducts(productSaved));
      }

      // Partition collections by API support
      const { stacCollections, odataCollections } = this.partitionCollectionsByApiSupport(
        formConfig,
        collectionForm.selectedCollections,
      );

      const hasStacCollections = Object.keys(stacCollections).length > 0;
      const hasOdataCollections = Object.keys(odataCollections).length > 0;

      // Check if this is a parallel search (both APIs needed)
      const isParallelSearch = hasStacCollections && hasOdataCollections;

      // Set parallel search state before initiating searches
      if (isParallelSearch) {
        this.setState({
          parallelSearch: {
            isParallelSearch: true,
            stacPending: true,
            odataPending: true,
            stacResult: null,
            odataResult: null,
          },
        });
      } else {
        // Reset parallel search state for single-API searches
        this.setState({
          parallelSearch: {
            isParallelSearch: false,
            stacPending: hasStacCollections,
            odataPending: hasOdataCollections,
            stacResult: null,
            odataResult: null,
          },
        });
      }

      // Execute STAC search if there are STAC-capable collections
      if (hasStacCollections) {
        // Filter selectedFilters to only include filters for STAC collections
        const stacSelectedFilters = {};
        if (collectionForm.selectedFilters) {
          Object.keys(collectionForm.selectedFilters).forEach((collectionId) => {
            if (stacCollections[collectionId]) {
              stacSelectedFilters[collectionId] = collectionForm.selectedFilters[collectionId];
            }
          });
        }

        const stacCollectionForm = {
          ...collectionForm,
          selectedCollections: stacCollections,
          selectedFilters: stacSelectedFilters,
        };

        const stacPayload = createSTACSearchPayload({
          collectionForm: stacCollectionForm,
          collectionFormConfig: formConfig,
          fromMoment,
          toMoment,
          searchCriteria,
          filterMonths,
          mapBounds,
          aoiBounds,
          poiBounds,
          applyFilterMonthsToDateRange,
        });

        this.props.setSTACAuthToken(this.props.userToken);
        this.props.stacSearch(stacPayload);
      } else {
        // No STAC-capable collections selected this time - clear any stale STAC search
        // state (e.g. searchError/availabilityMessage) left over from a previous search
        // where a STAC data source was selected but has since been deselected.
        this.props.stacSearch(null);
      }

      // Execute OData search if there are OData-only collections
      if (hasOdataCollections) {
        // Filter selectedFilters to only include filters for OData collections
        const odataSelectedFilters = {};
        if (collectionForm.selectedFilters) {
          Object.keys(collectionForm.selectedFilters).forEach((collectionId) => {
            if (odataCollections[collectionId]) {
              odataSelectedFilters[collectionId] = collectionForm.selectedFilters[collectionId];
            }
          });
        }

        const odataCollectionForm = {
          ...collectionForm,
          selectedCollections: odataCollections,
          selectedFilters: odataSelectedFilters,
        };

        const ODataQuery = this.getQuery(odataCollectionForm);
        this.props.setODataSearchAuthToken(this.props.userToken);
        this.props.productSearch(ODataQuery);
      } else {
        // No OData-only collections selected this time - clear any stale OData search
        // state (e.g. searchError/availabilityMessage) left over from a previous search
        // where an OData data source was selected but has since been deselected. If the
        // name-only fallback below fires, it will immediately overwrite this with a real
        // query.
        this.props.productSearch(null);
      }

      // If no collections selected, fall back to name-only OData search or show error
      if (!hasStacCollections && !hasOdataCollections) {
        if (searchCriteria) {
          const ODataQuery = this.getQuery();
          this.props.setODataSearchAuthToken(this.props.userToken);
          this.props.productSearch(ODataQuery);
        } else {
          this.setState({
            formValidationError: ErrorCode.selectSearchCriteria,
          });
        }
      }
    } catch (e) {
      this.setState({
        formValidationError: e,
      });
    }
  };

  backToSearch = () => {
    this.resetSearch();
    const searchConfigFromSession = JSON.parse(
      sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY),
    );

    if (searchConfigFromSession) {
      persistSearchConfig({
        ...searchConfigFromSession,
        resultsAvailable: false,
        resultsPanelSelected: false,
      });
    }
  };

  getNextNResults = async () => {
    if (this.props.userToken) {
      this.props.setODataSearchAuthToken(this.props.userToken);
      this.props.setSTACAuthToken(this.props.userToken);
    }

    const { parallelSearch } = this.state;

    // Parallel search: the merged result's own `next` is a no-op placeholder (see
    // mergeSearchResults). Continue pagination on whichever backend(s) still have
    // more; componentDidUpdate's parallel-search branch will store the fresh page
    // and checkAndMergeParallelResults will re-merge it with the other backend's
    // already-fetched results once it resolves.
    if (parallelSearch.isParallelSearch) {
      const stacHasMore = !!parallelSearch.stacResult?.next;
      const odataHasMore = !!parallelSearch.odataResult?.next;

      if (!stacHasMore && !odataHasMore) {
        return;
      }

      this.setState((prevState) => ({
        parallelSearch: {
          ...prevState.parallelSearch,
          stacPending: stacHasMore,
          odataPending: odataHasMore,
        },
      }));

      const nextCalls = [];
      if (stacHasMore) {
        nextCalls.push(parallelSearch.stacResult.next());
      }
      if (odataHasMore) {
        nextCalls.push(parallelSearch.odataResult.next());
      }
      await Promise.all(nextCalls);
      return;
    }

    if (!this.props.searchResult?.next) {
      // If next() isn't available yet (still restoring from cache), do nothing
      return;
    }
    await this.props.searchResult.next();
  };

  getQuery = (collectionFormOverride = null) => {
    const collectionForm = collectionFormOverride || this.state.collectionForm;
    const { fromMoment, toMoment, searchCriteria, filterMonths } = this.state;
    const { mapBounds, aoiBounds, poiBounds, aoiGeometry } = this.props;
    const params = {};

    if (!searchCriteria && !Object.keys(collectionForm.selectedCollections).length) {
      throw new Error(ErrorCode.selectSearchCriteria);
    }

    if (searchCriteria !== '') {
      params['name'] = searchCriteria;
    }

    if (Object.keys(collectionForm.selectedCollections).length) {
      const collections = Object.keys(collectionForm.selectedCollections).flatMap((collectionId) => {
        if (collectionId === ODataCollections.COMPLEMENTARY_DATA.id) {
          const selectedComplementary = collectionForm.selectedCollections[collectionId];
          if (Object.keys(selectedComplementary).length === 0) {
            const complementaryDataConfig = findGroupConfigById(collectionId);
            return complementaryDataConfig.items.map((item) => ({ id: item.id }));
          }

          return Object.keys(selectedComplementary).map((complementaryCollectionId) => ({
            id: complementaryCollectionId,
          }));
        }

        return {
          id: collectionId,
        };
      });

      //add instruments
      collections.forEach((collection) => {
        const instruments = [];
        const selectedCollectionData =
          collectionForm.selectedCollections[ODataCollections.COMPLEMENTARY_DATA.id]?.[collection.id] ??
          collectionForm.selectedCollections[collection.id];
        const collectionConfig = findCollectionConfigById(collection.id);

        const getInstrumentCloudCover = (instrumentId) => {
          if (!collectionForm.maxCc || !collectionForm.maxCc[collection.id]) {
            return undefined;
          }

          // First try direct path (for instruments directly under collection)
          if (typeof collectionForm.maxCc[collection.id][instrumentId] === 'number') {
            return collectionForm.maxCc[collection.id][instrumentId];
          }

          // Search for the instrument in nested structures
          const findCloudCoverInObj = (obj, currentPath = []) => {
            if (!obj || typeof obj !== 'object') {
              return undefined;
            }

            // Check direct property
            if (typeof obj[instrumentId] === 'number') {
              return obj[instrumentId];
            }

            // Search in all nested objects
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                const result = findCloudCoverInObj(obj[key], [...currentPath, key]);
                if (result !== undefined) {
                  return result;
                }
              }
            }

            return undefined;
          };

          return findCloudCoverInObj(collectionForm.maxCc[collection.id]);
        };

        // Recursively find and extract instruments and product types
        const processNode = (obj, parentPath = [], instrumentParent = null) => {
          if (!obj || typeof obj !== 'object') {
            return;
          }

          const isEmptySelectedNode = Object.keys(obj).length === 1;

          if (isEmptySelectedNode && (obj.type === 'group' || obj.type === 'instrument')) {
            const selectedConfigNode = findConfigByPath(collectionConfig, parentPath);

            // When an empty group contains instruments (e.g. Snow group → Snow Cover Extent, Snow Water Equivalent),
            // add those instruments without specific product types so all their children are searched.
            // ...InScope, not the subtree-wide variant: both lookups here answer for the one
            // level of the selection tree the user actually ticked, so they must not reach past a
            // nested collection or instrument into what that node answers for itself.
            // See src/utils/collectionConfigTree.ts.
            const instrumentIds = findConfigNodeIdsByTypeInScope(selectedConfigNode?.items, 'instrument');
            if (instrumentIds.length > 0 && !instrumentParent) {
              instrumentIds.forEach((instrumentId) => {
                const instrumentObj = { id: instrumentId };
                const cloudCoverValue = getInstrumentCloudCover(instrumentId);
                if (cloudCoverValue !== undefined) {
                  instrumentObj.cloudCover = cloudCoverValue;
                }
                instruments.push(instrumentObj);
              });
            } else {
              const productTypeIds = findConfigNodeIdsByTypeInScope(selectedConfigNode?.items, 'productType');
              addProductTypesToInstrument(instrumentParent, productTypeIds);
            }
            return;
          }

          // Process all properties of this object
          Object.entries(obj).forEach(([key, value]) => {
            // Skip the type property
            if (key === 'type') {
              return;
            }

            if (value && typeof value === 'object') {
              const currentPath = [...parentPath, key];

              if (value.type === 'instrument') {
                const instrumentId = key;
                const instrumentObj = {
                  id: instrumentId,
                };

                const cloudCoverValue = getInstrumentCloudCover(instrumentId);
                if (cloudCoverValue !== undefined) {
                  instrumentObj.cloudCover = cloudCoverValue;
                }

                instruments.push(instrumentObj);
                processNode(value, currentPath, instrumentObj);
              } else if (value.type === 'productType') {
                if (instrumentParent) {
                  if (!instrumentParent.productTypes) {
                    instrumentParent.productTypes = [];
                  }
                  instrumentParent.productTypes.push({ id: key });
                }
              } else {
                // If is a group or another container process recursively
                processNode(value, currentPath, instrumentParent);
              }
            }
          });
        };

        processNode(selectedCollectionData, []);

        collection.instruments = instruments;
        collection.additionalFilters = collectionForm.selectedFilters?.[collection.id];
      });

      params['collections'] = collections;
    }

    if (!searchCriteria) {
      if (filterMonths) {
        const intervals = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths).map(
          (interval) => ({
            fromTime: moment.utc(interval.fromMoment).toDate().toISOString(),
            toTime: moment.utc(interval.toMoment).toDate().toISOString(),
          }),
        );

        if (!intervals.length) {
          throw new Error(ErrorCode.invalidDateRange);
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
    }

    // if any of the collection is selected with the checkbox, automatically append any geometry to the query (map, aoi, poi)
    // if none of the collections are selected (querying via search criteria), append the geometry to the query only if aoi or poi is selected.
    if (params['collections'] || aoiBounds || poiBounds || aoiGeometry) {
      // Calculate optimal geometry character limit based on how many times geometry will be repeated in the query
      const maxGeometryChars = params['collections']
        ? calculateMaxGeometryChars(params['collections'])
        : undefined;
      const { geometry, wasSimplified } = buildSearchGeometry({
        mapBounds,
        aoiBounds,
        poiBounds,
        aoiGeometry,
        maxGeometryChars,
      });
      params['geometry'] = geometry;
      this.setState({ geometrySimplified: wasSimplified });
    } else {
      this.setState({ geometrySimplified: false });
    }
    return oDataHelpers.createAdvancedSearchQuery(params);
  };

  getFormValidationError = () => {
    const { formValidationError } = this.state;

    if (!formValidationError) {
      return;
    }

    if (formValidationError.message && ErrorMessage[formValidationError.message]) {
      return {
        message: ErrorMessage[formValidationError.message](),
      };
    }
    return formValidationError;
  };

  handleStateUpdate = (searchCriteria) => {
    this.setState({ searchCriteria: searchCriteria });
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
      stacSearchError,
      stacSearchInProgress,
      resultsPanelSelected,
      resultsAvailable,
      userToken,
    } = this.props;
    const minDateRange = moment.utc(minDate ? minDate : MIN_SEARCH_DATE).startOf('day');
    const maxDateRange = moment.utc(maxDate).endOf('day');
    const { fromMoment, toMoment, displayCalendarFrom, displayCalendarTo, additionFiltersPositionTop } =
      this.state;

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

    const oDataSearchError = searchError?.message?.startsWith(ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND)
      ? {
          message: searchError?.availabilityMessage
            ? `${ErrorMessage[ErrorCode.noMatchingProducts]()}\n${searchError.availabilityMessage}`
            : ErrorMessage[ErrorCode.noMatchingProducts](),
        }
      : null;

    const geometrySimplifiedWarning = this.state.geometrySimplified
      ? {
          message: WarningMessage.geometrySimplified(),
        }
      : null;

    const stacSearchErrorFormatted = stacSearchError?.message?.startsWith(
      STAC_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND,
    )
      ? {
          message: stacSearchError?.availabilityMessage
            ? `${ErrorMessage[ErrorCode.noMatchingProducts]()}\n${stacSearchError.availabilityMessage}`
            : ErrorMessage[ErrorCode.noMatchingProducts](),
        }
      : stacSearchError;

    // When both legs of a parallel STAC+OData search return "no products found", combine
    // their availability messages instead of always preferring the OData one - otherwise
    // the STAC leg's error (and its availabilityMessage) is silently dropped - see MR review F1.
    const noProductsError =
      oDataSearchError && stacSearchErrorFormatted
        ? {
            message: [oDataSearchError.message, stacSearchErrorFormatted.message]
              .filter(Boolean)
              .join('\n\n'),
          }
        : oDataSearchError || stacSearchErrorFormatted;

    const displayingResults = resultsAvailable && resultsPanelSelected;
    // When a partial-results notice is already being shown alongside results, don't also
    // surface the same "no products found" info as a blocking error - it's redundant now
    // that the softer, dismissible notice communicates it instead.
    const error = this.state.partialResultsWarning
      ? this.getFormValidationError()
      : this.getFormValidationError() || noProductsError;
    const isSearchInProgress = searchInProgress || stacSearchInProgress;
    const partialResultsWarningNode = this.state.partialResultsWarning ? (
      <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>
        {this.state.partialResultsWarning}
      </ReactMarkdown>
    ) : null;
    const { selectedCollections, maxCc, selectedFilters } = this.state.collectionForm;
    return (
      <>
        {displayingResults && (
          <Results
            userToken={userToken}
            results={searchResult?.allResults}
            hasMore={searchResult?.hasMore}
            canLoadMore={!!searchResult?.next}
            totalCount={searchResult?.totalCount}
            getNextNResults={this.getNextNResults}
            onResultSelected={this.onResultSelected}
            setHighlightedTile={this.setHighlightedTile}
            selectedTiles={selectedTiles}
            backToSearch={this.backToSearch}
            isAuthenticated={!!this.props.user}
            savedWorkspaceProducts={this.props.savedWorkspaceProducts}
            geometrySimplifiedWarning={geometrySimplifiedWarning?.message}
            partialResultsWarning={partialResultsWarningNode}
          />
        )}

        <div
          className={`search-panel ${isSearchInProgress ? 'disabled' : ''} ${
            displayingResults ? 'hidden' : ''
          }`}
        >
          <div className="search-criteria-wrapper">
            <div className="top-label">
              <div className="data-source-advanced-title">{t`Search criteria`}:</div>
              <div>
                <input
                  type="text"
                  placeholder={t`Product name`}
                  value={this.state.searchCriteria}
                  onChange={(e) => this.setState({ searchCriteria: e.target.value })}
                />
              </div>
              <div className="search-criteria-geometry-notice">{t`To apply a location filter, please define an AOI/a POI`}</div>
            </div>
          </div>
          <div className="top-label">
            <div className="data-source-advanced-title">{t`Data sources`}:</div>

            <div className="checkbox-group">
              <div className="column" key={selectedThemeId || ''}>
                <RecursiveCollectionForm
                  selectedCollections={selectedCollections}
                  maxCc={maxCc}
                  setSelectedCollections={this.setSelectedCollections}
                  setMaxCc={this.setMaxCc}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={this.setSelectedFilters}
                  resetSelectedFilters={this.resetSelectedFilters}
                  setAdditionalFiltersPositionTop={this.setAdditionalFiltersPositionTop}
                  additionFiltersPositionTop={additionFiltersPositionTop}
                  setCollectionForm={(collectionFormState) => {
                    this.setState({
                      collectionForm: collectionFormState,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="clear" />
          <div className="select-time-range">
            <div className="time-range-advanced-title">{t`Time Range`}:</div>
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
              isDisabled={!!this.state.searchCriteria}
            />

            <div className="calendar-holder" ref={this.calendarHolder} />
            <EOBFilterSearchByMonths
              onChange={this.setFilterMonths}
              isDisabled={!!this.state.searchCriteria}
            />
            <EOBButton loading={isSearchInProgress} onClick={this.doSearch} fluid text={t`Search`} />
          </div>
          {error ? (
            <div className="error-panel" ref={this.errorPanelRef}>
              <MessagePanel variant="boxed-no-header">
                <NotificationPanel
                  type="info"
                  msg={
                    <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>
                      {error.message}
                    </ReactMarkdown>
                  }
                />
              </MessagePanel>
            </div>
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
  poiBounds: store.poi.bounds,
  aoiGeometry: store.aoi.geometry,
  is3D: store.mainMap.is3D,
  datasetId: store.visualization.datasetId,
  dateMode: store.visualization.dateMode,
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
  terrainViewerId: store.terrainViewer.id,
  userToken: store.auth.user.access_token,
  savedWorkspaceProducts: store.workspace.savedWorkspaceProducts,
});

export default connect(mapStoreToProps, null)(withSTACSearchHOC(withODataSearchHOC(AdvancedSearch)));
