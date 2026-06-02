// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback, useRef } from 'react';
import cloneDeep from 'lodash.clonedeep';

import { oDataApi } from '../api/OData/ODataApi';
import oDataHelpers, { PAGE_SIZE } from '../api/OData/ODataHelpers';
import { ODataEntity } from '../api/OData/ODataTypes';
import { getAvailabilityInfo } from './stacAvailability';

export const ODATA_SEARCH_ERROR_MESSAGE = {
  NO_PRODUCTS_FOUND: 'No products found',
};

/*
nextPage link doesn't work correctly (https://git.sinergise.com/team-6/eobrowser3/-/issues/732#note_425470)
and @odata.count is unreliable.
To check if there are more results, we are comparing number of results with PAGE_SIZE.
If those number are equal, there are most likely some more results. This assumption is obviously
not always correct.
*/
const hasMore = (results) => {
  if (!(results && results.value)) {
    return false;
  }
  return results.value.length === PAGE_SIZE;
};

/*
useODataSearch hook handles all the usual stuff related to data fetching - loading, error handling, formatting results and returning them.

It returns an array with 4 elements
- the first  element is an object with
   - searchInProgress - boolean indicating if a search is in progress
   - searchError - error object
   - oDataSearchResult: an object with results
- the second element is a function which accepts ODataQuery and initiates a search
- the third element is a function which accepts an auth token
- the fourth element is a hydrate function which reconstructs oDataSearchResult locally from cached
  state without making a network call

usage example:

```
const [{ searchInProgress, searchError, oDataSearchResult }, productSearch, setODataSearchAuthToken, hydrate] = useODataSearch();
...

 <EOBButton loading={searchInProgress} onClick={()=>productSearch(oDataQuery)} text={t`Search`} />...

```
*/
export const useODataSearch = () => {
  const [query, setQuery] = useState(null);
  const [oDataSearchResult, setODataSearchResult] = useState(null);
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [searchError, setSearchError] = useState(null);
  // Use a ref so auth token reads are always synchronous (no state update lag).
  // setAuthToken updates the ref immediately; callers that also want to trigger
  // a re-search must call setQuery separately.
  const authTokenRef = useRef(null);

  const setAuthToken = useCallback((token) => {
    authTokenRef.current = token;
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- authTokenRef is a stable ref; authTokenRef.current is read synchronously at call time
  const search = useCallback(async (query, results = [], page = 0) => {
    if (!query) {
      setSearchInProgress(false);
      setSearchError(null);
      return;
    }

    try {
      setSearchInProgress(true);
      setSearchError(null);
      const nextPageQuery = cloneDeep(query);
      nextPageQuery.skip(PAGE_SIZE * page);
      const data = await oDataApi.search(ODataEntity.Products, nextPageQuery, authTokenRef.current);
      if (!(data && data.value && data.value.length)) {
        // If we have results from previous pages, just finish
        if (results && results.length) {
          const result = {
            allResults: results,
            page: page,
            hasMore: false,
            totalCount: results.length,
            next: () => {},
          };
          setODataSearchResult(result);
          setSearchInProgress(false);
          return;
        }

        // No results at all - get availability info
        const errorMessage = ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND;
        let availabilityMessage = '';

        const filterOption = query?.options?.find((option) => option.key === 'filter');
        if (filterOption?.value) {
          const availabilityInfo = await getAvailabilityInfo(filterOption.value, authTokenRef.current);
          if (availabilityInfo) {
            availabilityMessage = availabilityInfo;
          }
        }

        const error = new Error(errorMessage);
        if (availabilityMessage) {
          error.availabilityMessage = availabilityMessage;
        }
        throw error;
      }
      const formattedResults = oDataHelpers.formatSearchResults(data.value);
      const allResults = [...results, ...formattedResults];

      /*ODataSearch result has
      - allResults: array of products
      - page: zero-based page index of the last fetched page
      - hasMore: boolean indicating if there are more results
      - totalCount: number of all products
      - next: function for fetching next page
      */
      const result = {
        allResults: allResults,
        page: page,
        hasMore: hasMore(data),
        totalCount: data['@odata.count'],
        next: () => search(nextPageQuery, allResults, page + 1),
      };
      setODataSearchResult(result);
    } catch (e) {
      setSearchError(e);
    } finally {
      setSearchInProgress(false);
    }
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  /*
  hydrate reconstructs oDataSearchResult from cached state without making a network call.
  Use this to restore the next() pagination function on page refresh instead of re-fetching page 0.
  */
  const hydrate = useCallback(
    ({ query, results, page, totalCount, hasMore: hasMoreResults }) => {
      setODataSearchResult({
        allResults: results,
        page,
        totalCount,
        hasMore: hasMoreResults,
        next: () => search(query, results, page + 1),
      });
    },
    [search],
  );

  return [{ searchInProgress, searchError, oDataSearchResult }, setQuery, setAuthToken, hydrate];
};
