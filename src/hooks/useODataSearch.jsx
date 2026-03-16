// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
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

It returns an array with 2 elements
- the first  element is an object with
   - searchInProgress - boolean indicating if a search is in progress
   - searchError - error object
   - oDataSearchResult: an object with results
- the second element is a function which accepts ODataQuery and initiates a search

usage example:

```
const [{ searchInProgress, searchError, oDataSearchResult }, productSearch] = useODataSearch();
...

 <EOBButton loading={searchInProgress} onClick={()=>productSearch(oDataQuery)} text={t`Search`} />...

```
*/
export const useODataSearch = () => {
  const [query, setQuery] = useState(null);
  const [oDataSearchResult, setODataSearchResult] = useState(null);
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const search = async (query, results = [], page = 0) => {
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
        const data = await oDataApi.search(ODataEntity.Products, nextPageQuery, authToken);
        if (!(data && data.value && data.value.length)) {
          // If we have results from previous pages, just finish
          if (results && results.length) {
            const result = {
              allResults: results,
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
            const availabilityInfo = await getAvailabilityInfo(filterOption.value, authToken);
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
        - hasMore: boolean indicating if there are more results
        - totalCount: number of all products 
        - next: function for fetching next page
        */
        const result = {
          allResults: allResults,
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
    };
    search(query);
  }, [query, authToken]);

  return [{ searchInProgress, searchError, oDataSearchResult }, setQuery, setAuthToken];
};
