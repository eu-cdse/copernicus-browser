import React, { Component } from 'react';
import Rodal from 'rodal';
import { t, ngettext, msgid } from 'ttag';

import ResultItem, { ErrorMessage } from './ResultItem';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import WorkspacePlus from '../../icons/workspace-plus.svg?react';

import './Results.scss';
import CustomCheckbox from '../../components/CustomCheckbox/CustomCheckbox';
import { addProductsToWorkspace } from '../../api/OData/workspace';
import { ResultItemLabels } from './ResultItemFooter';
import store, { notificationSlice } from '../../store';
import { getProductErrorMessage } from './ProductInfo/ProductInfo.utils';
import isEqual from 'lodash/isEqual';
import Loader from '../../Loader/Loader';

class Results extends Component {
  state = {
    loadingMore: false,
    displayModal: false,
    checkedResults: [],
    savedWorkspaceProductsMap: new Map(),
  };

  loadWorkspaceProductsMap = () => {
    const allSavedWorkspaceProductsMap = new Map(
      this.props.savedWorkspaceProducts?.map((workspace) => [workspace.name, true]),
    );

    return new Map(
      this.props.results.filter((r) => allSavedWorkspaceProductsMap.has(r.name)).map((r) => [r.name, true]),
    );
  };

  componentDidMount() {
    // Initialize savedWorkspacesMap on mount
    this.setState({
      savedWorkspaceProductsMap: this.loadWorkspaceProductsMap(),
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedTiles && prevProps.selectedTiles !== this.props.selectedTiles) {
      this.setState((prevState) => ({
        displayModal: true,
      }));
    }

    if (
      !isEqual(prevProps.savedWorkspaceProducts, this.props.savedWorkspaceProducts) ||
      prevProps.results !== this.props.results
    ) {
      const savedWorkspaceProductsMap = this.loadWorkspaceProductsMap();
      this.setState({ savedWorkspaceProductsMap });
    }
  }

  loadMore = async () => {
    this.setState({
      loadingMore: true,
    });
    await this.props.getNextNResults();
    this.setState((prevState) => ({
      loadingMore: false,
    }));
  };

  onResultCheck = (tile) => {
    this.setState((prevState) => {
      const checkedResults = prevState.checkedResults.find((t) => t.id === tile.id)
        ? prevState.checkedResults.filter((t) => t.id !== tile.id)
        : [...prevState.checkedResults, tile];
      return { checkedResults };
    });
  };

  onResultHover = (tile) => {
    this.props.setHighlightedTile(tile);
  };

  onResultStopHover = () => {
    this.props.setHighlightedTile(null);
  };

  onResultSelected = (result) => {
    this.setState({ displayModal: false });
    this.props.onResultSelected(result);
  };

  getNResultsString(resultsLength, hasMore, totalCount) {
    let showingNResultsString = ngettext(
      msgid`Showing ${resultsLength} result`,
      `Showing ${resultsLength} results`,
      resultsLength,
    );
    if (hasMore && totalCount) {
      showingNResultsString = `${showingNResultsString} of ${totalCount}`;
    }
    return showingNResultsString;
  }

  addSelectedProductsToWorkspace = async () => {
    const accessValidation = {
      userToken: this.props.userToken,
      product: null,
    };
    const { checkedResults } = this.state;

    if (checkedResults.length === 0) {
      const workspaceProductErrorMessage = getProductErrorMessage(
        ResultItemLabels.addProductsToWorkspace(),
        accessValidation,
      );
      store.dispatch(notificationSlice.actions.displayError(workspaceProductErrorMessage));
      return null;
    }

    for (let tile of checkedResults) {
      // Check if the product is valid
      accessValidation.product = tile;

      const workspaceProductErrorMessage = getProductErrorMessage(
        ResultItemLabels.addProductsToWorkspace(),
        accessValidation,
      );

      if (workspaceProductErrorMessage) {
        store.dispatch(notificationSlice.actions.displayError(workspaceProductErrorMessage));
        return null;
      }
    }

    await addProductsToWorkspace(checkedResults);
    this.setState({ checkedResults: [] });
  };

  render() {
    const { results: products, hasMore, selectedTiles, totalCount, isAuthenticated } = this.props;
    const { savedWorkspaceProductsMap, checkedResults, loadingMore, displayModal } = this.state;
    return (
      products && (
        <div className="results">
          <div className="results-heading">
            <div className="results-heading-top">
              <div className="results-heading-top-left">
                <EOBButton
                  text={t`Search`}
                  onClick={this.props.backToSearch}
                  className="text tiny back-to-search"
                  icon="chevron-left"
                />
              </div>
              <div className="showing-n-results">
                {this.getNResultsString(products.length, hasMore, totalCount)}
              </div>
            </div>

            <div className="results-heading-bottom">
              <CustomCheckbox
                inputClassName="white"
                label={t`Select all`}
                checked={checkedResults.length === products.length - savedWorkspaceProductsMap.size}
                onChange={() => {
                  if (checkedResults.length === products.length - savedWorkspaceProductsMap.size) {
                    this.setState({ checkedResults: [] });
                  } else {
                    const nonSavedWorkspaceProducts = products.filter(
                      (r) => !savedWorkspaceProductsMap.get(r.name),
                    );
                    this.setState({ checkedResults: nonSavedWorkspaceProducts });
                  }
                }}
              />
              <EOBButton
                className={`tiny text ${!isAuthenticated || !checkedResults.length ? 'inactive' : ''}`}
                svgIcon={WorkspacePlus}
                text={t`Add to workspace`}
                onClick={this.addSelectedProductsToWorkspace}
                title={
                  isAuthenticated
                    ? checkedResults.length <= 0
                      ? ErrorMessage.atleastOneProductSelected()
                      : ResultItemLabels.addProductsToWorkspace()
                    : ResultItemLabels.loginToAddToWorkspace()
                }
              />
            </div>
          </div>
          <div className="results-panel">
            <div className="results-list">
              {products &&
                products.map((p, i) => (
                  <ResultItem
                    key={i}
                    onHover={this.onResultHover}
                    onStopHover={this.onResultStopHover}
                    tile={p}
                    onResultSelected={this.props.onResultSelected}
                    onResultCheck={this.onResultCheck}
                    isResultChecked={checkedResults.find((t) => t.id === p.id)}
                    isAuthenticated={isAuthenticated}
                    isProductAlreadySavedToWorkspace={savedWorkspaceProductsMap.get(p.name)}
                  />
                ))}
            </div>
            {hasMore ? (
              <div className="load-more-btn-wrapper">
                {loadingMore ? (
                  <div className="eob-btn">
                    <Loader />
                  </div>
                ) : (
                  <div className="eob-btn" onClick={this.loadMore}>
                    {t`Load more`}
                  </div>
                )}
              </div>
            ) : null}

            {displayModal ? (
              <Rodal
                animation="slideUp"
                visible={true}
                width={600}
                height={400}
                onClose={() => this.setState({ displayModal: false })}
                closeOnEsc={true}
                className={`${selectedTiles.length > 1 ? 'multiple-tiles' : ''}`}
              >
                <div className="results-header">
                  <span className="title">{t`Results`}</span>
                  <span className="paragraph">{this.getNResultsString(selectedTiles.length)}</span>
                </div>
                <div className="results-panel">
                  {selectedTiles.map((tile, i) => (
                    <ResultItem
                      key={`selected-layer-${i}`}
                      tile={tile}
                      onHover={this.onResultHover}
                      onStopHover={this.onResultStopHover}
                      onResultSelected={this.onResultSelected}
                    />
                  ))}
                </div>
              </Rodal>
            ) : null}
          </div>
        </div>
      )
    );
  }
}

export default Results;
