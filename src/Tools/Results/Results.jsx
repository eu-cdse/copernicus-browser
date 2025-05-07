import React, { Component } from 'react';
import Rodal from 'rodal';
import { t, ngettext, msgid } from 'ttag';

import ResultItem, { ErrorMessage } from './ResultItem';
import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import WorkspacePlus from '../../icons/workspace-plus.svg?react';

import './Results.scss';
import CustomCheckbox from '../../components/CustomCheckbox/CustomCheckbox';
import { addProductsToWorkspace } from '../../api/OData/workspace';
import { ResultItemLabels } from './ResultItemFooter';
import store, { notificationSlice } from '../../store';
import { getProductErrorMessage } from './ProductInfo/ProductInfo.utils';

class Results extends Component {
  state = {
    loadingMore: false,
    displayModal: false,
    checkedResults: [],
  };

  componentDidUpdate(prevProps) {
    if (this.props.selectedTiles && prevProps.selectedTiles !== this.props.selectedTiles) {
      this.setState((prevState) => ({
        displayModal: true,
      }));
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

  addResultsToWorkspace = () => {
    const accessValidation = {
      userToken: this.props.userToken,
      product: null,
    };
    const { checkedResults } = this.state;

    if (checkedResults.length === 0) {
      const workspaceProductErrorMessage = getProductErrorMessage(
        ResultItemLabels.addToWorkspace(),
        accessValidation,
      );
      store.dispatch(notificationSlice.actions.displayError(workspaceProductErrorMessage));
      return null;
    }

    for (let tile of checkedResults) {
      // Check if the product is valid
      accessValidation.product = tile;

      const workspaceProductErrorMessage = getProductErrorMessage(
        ResultItemLabels.addToWorkspace(),
        accessValidation,
      );

      if (workspaceProductErrorMessage) {
        store.dispatch(notificationSlice.actions.displayError(workspaceProductErrorMessage));
        return null;
      }
    }

    addProductsToWorkspace(checkedResults);
  };

  render() {
    const { results, hasMore, selectedTiles, totalCount, isAuthenticated } = this.props;
    return (
      results && (
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
                {this.getNResultsString(results.length, hasMore, totalCount)}
              </div>
            </div>

            <div className="results-heading-bottom">
              <CustomCheckbox
                inputClassName="white"
                label={t`Select all`}
                checked={this.state.checkedResults.length === results.length}
                onChange={() => {
                  if (this.state.checkedResults.length === results.length) {
                    this.setState({ checkedResults: [] });
                  } else {
                    this.setState({ checkedResults: results });
                  }
                }}
              />
              <EOBButton
                className={`tiny text ${
                  !isAuthenticated || !this.state.checkedResults.length ? 'inactive' : ''
                }`}
                svgIcon={WorkspacePlus}
                text={t`Add to workspace`}
                onClick={this.addResultsToWorkspace}
                title={
                  isAuthenticated
                    ? this.state.checkedResults.length <= 0
                      ? ErrorMessage.atleastOneProduct()
                      : ResultItemLabels.addToWorkspace()
                    : ResultItemLabels.loginToAddToWorkspace()
                }
              />
            </div>
          </div>
          <div className="results-panel">
            <div className="results-list">
              {results &&
                results.map((r, i) => (
                  <ResultItem
                    key={i}
                    onHover={this.onResultHover}
                    onStopHover={this.onResultStopHover}
                    tile={r}
                    onResultSelected={this.props.onResultSelected}
                    onResultCheck={this.onResultCheck}
                    isResultChecked={this.state.checkedResults.find((t) => t.id === r.id)}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
            </div>
            {hasMore && !this.state.loadingMore ? (
              <div className="eob-btn" onClick={this.loadMore}>
                {t`Load more`}
              </div>
            ) : null}
            {this.state.loadingMore && <NotificationPanel msg={t`Loading more results ...`} type="loading" />}

            {this.state.displayModal ? (
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
