import React, { Component } from 'react';
import Rodal from 'rodal';
import { t, ngettext, msgid } from 'ttag';

import ResultItem from './ResultItem';
import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';

import './Results.scss';

class Results extends Component {
  state = {
    loadingMore: false,
    displayModal: false,
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

  render() {
    const { results, hasMore, selectedTiles, totalCount } = this.props;
    return (
      results && (
        <div className="results">
          <div className="results-heading">
            <div className="results-heading-left">
              <EOBButton
                text={t`Go to search`}
                onClick={this.props.backToSearch}
                className="small back-to-search"
              />
            </div>
            <div className="showing-n-results">
              {this.getNResultsString(results.length, hasMore, totalCount)}
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
