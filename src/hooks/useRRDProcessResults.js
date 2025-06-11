import { useEffect, useState } from 'react';
import { ITEMS_PER_PAGE } from '../Tools/RapidResponseDesk/sections/Results/constants';

export function processRRDResults(results, filterState, sortState, currentPage) {
  const isResultInFilterSelection = (item) => {
    return item.properties.metadata_source === filterState || filterState === 'all';
  };

  if (results) {
    let filteredResults = results;

    if (filterState) {
      filteredResults = results.filter((item) => isResultInFilterSelection(item));
    }
    if (sortState) {
      filteredResults = sortState(filteredResults);
    }

    const paginatedResults = filteredResults.slice(0, currentPage * ITEMS_PER_PAGE);
    return {
      paginatedResults,
      totalFilteredResults: filteredResults.length,
    };
  }
  return {
    paginatedResults: [],
    totalFilteredResults: 0,
  };
}

export const useRRDProcessResults = (results, filterState, sortState, currentPage) => {
  const [processedResults, setProcessedResults] = useState([]);
  const [totalFilteredResults, setTotalFilteredResults] = useState(0);

  useEffect(() => {
    const { paginatedResults, totalFilteredResults } = processRRDResults(
      results,
      filterState,
      sortState,
      currentPage,
    );
    setTotalFilteredResults(totalFilteredResults);
    setProcessedResults(paginatedResults);
  }, [results, filterState, sortState, currentPage]);
  return { processedResults, totalFilteredResults };
};
