import React, { useEffect, useState } from 'react';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { connect } from 'react-redux';
import { msgid, ngettext, t } from 'ttag';
import Rodal from 'rodal';
import './ResultsSection.scss';
import {
  getResultsSectionFilterProperties,
  ResultsSectionSortProperties,
} from '../../rapidResponseProperties';
import EffectDropdown from '../../../../junk/EOBEffectsPanel/EffectDropdown';
import store, { collapsiblePanelSlice, searchResultsSlice, resultsSectionSlice } from '../../../../store';
import ResultsCard from './ResultsCard/ResultsCard';
import { useRRDProcessResults } from '../../../../hooks/useRRDProcessResults';
import Button, { ButtonType } from '../../../../components/Button/Button';
import { ITEMS_PER_PAGE } from './constants';
import { NotificationPanel } from '../../../../junk/NotificationPanel/NotificationPanel';
import ReactMarkdown from 'react-markdown';

export const ResultsSectionAttributes = Object.freeze({
  id: 'results-time',
  title: () => t`Results`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setResultsExpanded(v)),
});

const ResultsSection = ({
  isSearchProcessing,
  resultsExpanded,
  sortState,
  filterState,
  results,
  selectedTiles,
  auth,
  isTaskingEnabled,
  currentPage,
  quicklookImages,
}) => {
  const [emptyResult, setEmptyResult] = useState(false);
  const [displayModal, setDisplayModal] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);

  const { processedResults, totalFilteredResults } = useRRDProcessResults(
    results,
    filterState,
    sortState,
    currentPage,
  );

  const handleShowMore = () => {
    store.dispatch(resultsSectionSlice.actions.setCurrentPage(currentPage + 1));
  };

  useEffect(() => {
    store.dispatch(resultsSectionSlice.actions.setCurrentPage(1));
  }, [filterState, sortState]);

  useEffect(() => {
    setEmptyResult(results?.length === 0);
  }, [results]);

  useEffect(() => {
    if (selectedTiles?.length > 0) {
      setDisplayModal(true);
    }
  }, [selectedTiles]);

  const getNResultsString = (resultsLength, hasMore, totalCount) => {
    let showingNResultsString = ngettext(
      msgid`Showing ${resultsLength} result`,
      `Showing ${resultsLength} results`,
      resultsLength,
    );
    if (hasMore && totalCount) {
      showingNResultsString = `${showingNResultsString} of ${totalCount}`;
    }
    return showingNResultsString;
  };

  const getTitle = () => (
    <div className="results-with-sort-filter-header">
      <div className="uppercase-text">{ResultsSectionAttributes.title()}:</div>
      <div className="sort-filter-container">
        <div className="dropdown-container">
          <label className="dropdown-label">{t`Sort`}:</label>
          <EffectDropdown
            displayLayerDefault={false}
            value={sortState}
            onChange={(value) => store.dispatch(resultsSectionSlice.actions.setSortState(value))}
            options={ResultsSectionSortProperties}
          />
        </div>
        <div className="dropdown-container">
          <label className="dropdown-label">{t`Filter`}:</label>
          <EffectDropdown
            displayLayerDefault={false}
            value={filterState}
            onChange={(value) => store.dispatch(resultsSectionSlice.actions.setFilterState(value))}
            options={getResultsSectionFilterProperties(isTaskingEnabled)}
          />
        </div>
      </div>
    </div>
  );

  const handleImageLoad = (id, image) => {
    store.dispatch(resultsSectionSlice.actions.setQuicklookImage({ id, url: image }));
  };

  return (
    <div id="search-results">
      <CollapsiblePanel
        key={ResultsSectionAttributes.id}
        className={`section ${resultsExpanded ? 'active' : 'inactive'}`}
        title={getTitle()}
        headerComponent={getTitle()}
        expanded={resultsExpanded}
        toggleExpanded={ResultsSectionAttributes.toggleExpanded}
      >
        {() => {
          return resultsExpanded ? (
            emptyResult ? (
              <NotificationPanel
                msg={
                  <ReactMarkdown
                    children={t`No results found for selected filter parameters.\n  
                      To get more results, try modifying form fields (like the dates range, data providers, and advanced fields) and/or selecting a larger area on the map.`}
                  ></ReactMarkdown>
                }
                type="error"
              />
            ) : (
              <div className="results-section-body">
                {processedResults.map((item) => (
                  <ResultsCard
                    key={item.id}
                    item={item}
                    currentPage={currentPage}
                    onImageLoad={handleImageLoad}
                    loadedImages={quicklookImages}
                  ></ResultsCard>
                ))}
                {processedResults && processedResults.length < totalFilteredResults && (
                  <div className="result-section-footer">
                    <div className="result-section-footer-text">
                      Showing {currentPage * ITEMS_PER_PAGE} of {totalFilteredResults} results
                    </div>
                    <Button
                      onClick={handleShowMore}
                      type={ButtonType.success}
                      label={t`Load More`}
                      styleClassName="uppercase-text"
                    ></Button>
                  </div>
                )}
              </div>
            )
          ) : null;
        }}
      </CollapsiblePanel>

      {displayModal ? (
        <Rodal
          animation="slideUp"
          visible={true}
          width={600}
          height={400}
          onAnimationEnd={() => setShowModalContent(true)}
          onClose={() => {
            setDisplayModal(false);
            store.dispatch(searchResultsSlice.actions.setSelectedTiles(undefined));
            setShowModalContent(false);
          }}
          closeOnEsc={true}
        >
          {showModalContent && (
            <>
              <div className="results-header">
                <span className="title">{t`Results`}</span>
                <span className="paragraph">{getNResultsString(selectedTiles?.length)}</span>
              </div>
              <div className="results-panel">
                {processedResults
                  .filter((result) => selectedTiles.some((tile) => tile.id === result.id))
                  .map((item) => (
                    <ResultsCard key={item.id} item={item} loadedImages={quicklookImages}></ResultsCard>
                  ))}
              </div>
            </>
          )}
        </Rodal>
      ) : null}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  resultsExpanded: store.collapsiblePanel.resultsExpanded,
  sortState: store.resultsSection.sortState,
  filterState: store.resultsSection.filterState,
  currentPage: store.resultsSection.currentPage,
  results: store.resultsSection.results,
  selectedTiles: store.searchResults.selectedTiles,
  auth: store.auth,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
  quicklookImages: store.resultsSection.quicklookImages,
});

export default connect(mapStoreToProps, null)(ResultsSection);
