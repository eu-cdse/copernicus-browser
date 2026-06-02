import React from 'react';
import { useODataSearch } from '../../../../hooks/useODataSearch';

export const withODataSearchHOC = (WrappedComponent) => {
  return (props) => {
    const [
      { searchInProgress, searchError, oDataSearchResult },
      productSearch,
      setODataSearchAuthToken,
      hydrate,
    ] = useODataSearch();

    return (
      <WrappedComponent
        searchInProgress={searchInProgress}
        searchError={searchError}
        oDataSearchResult={oDataSearchResult}
        productSearch={productSearch}
        setODataSearchAuthToken={setODataSearchAuthToken}
        hydrateODataSearch={hydrate}
        {...props}
      />
    );
  };
};
