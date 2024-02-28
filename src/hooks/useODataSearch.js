import { useState, useEffect } from 'react';
import cloneDeep from 'lodash.clonedeep';

import { oDataApi } from '../api/OData/ODataApi';
import oDataHelpers, { PAGE_SIZE } from '../api/OData/ODataHelpers';
import { ODataEntity } from '../api/OData/ODataTypes';

export const ODATA_SEARCH_ERROR_MESSAGE = {
  NO_PRODUCTS_FOUND: 'No products found',
};

/* 
nextPage link doesn't work correctly (
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
          throw new Error(ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND);
        }
        const formatedResults = oDataHelpers.formatSearchResults(data.value);
        const allResults = [...results, ...formatedResults];

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
