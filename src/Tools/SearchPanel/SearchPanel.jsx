import React, { Component } from 'react';
import ExternalLink from '../../ExternalLink/ExternalLink';
import Loader from '../../Loader/Loader';

import EOBFilterSearchByMonths from '../../junk/EOBCommon/EOBFilterSearchByMonths/EOBFilterSearchByMonths';
import DatePicker from '../../components/DatePicker/DatePicker';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';
import moment from 'moment';
import { connect } from 'react-redux';
import { t } from 'ttag';
import { renderDataSourcesInputs } from './dataSourceHandlers/dataSourceHandlers';
import { Query } from './search';
import store, {
  commercialDataSlice,
  themesSlice,
  visualizationSlice,
  notificationSlice,
  tabsSlice,
} from '../../store';
import { EDUCATION_MODE, SEARCH_PANEL_TABS_HASH } from '../../const';
import {
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  EXPIRED_ACCOUNT_DUMMY_INSTANCE_ID,
  SEARCH_PANEL_TABS,
} from '../../const';
import Results from '../Results/Results';
import Highlights from './Highlights/Highlights';
import { getThemeName } from '../../utils';
import CommercialData from '../CommercialDataPanel/CommercialData';
import withRouter from '../../hoc/withRouter';

const NO_THEME = 'no-theme-selected';

class SearchPanel extends Component {
  state = {
    searchError: null,
    fromMoment: moment.utc().subtract(1, 'month').startOf('day'),
    toMoment: moment.utc(),
    datepickerIsExpanded: false,
    filterMonths: null,
    searchInProgress: false,
    resultsPanelSelected: false,
    shouldShowThemesError: true,
  };

  async componentDidUpdate(prevProps) {
    if (prevProps.selectedModeId && prevProps.selectedModeId !== this.props.selectedModeId) {
      this.setSelectedTab(SEARCH_PANEL_TABS.SEARCH_TAB);
    }
    if (
      !prevProps.is3D &&
      this.props.is3D &&
      this.props.selectedTab === SEARCH_PANEL_TABS.COMMERCIAL_DATA_TAB
    ) {
      this.setSelectedTab(SEARCH_PANEL_TABS.SEARCH_TAB);
    }

    if (this.props.router.location.hash) {
      const selectedTabIndex = Object.keys(SEARCH_PANEL_TABS_HASH).find(
        (key) => SEARCH_PANEL_TABS_HASH[key] === this.props.router.location.hash,
      );
      if (selectedTabIndex) {
        this.setSelectedTab(parseInt(selectedTabIndex));
      }
    }
  }

  hideThemesErrorOnClick = () => {
    this.setState({ shouldShowThemesError: false });
  };

  handleDatepickerExpanded = (expanded) => {
    this.setState({
      datepickerIsExpanded: expanded,
    });
  };

  setTimeFrom = (selectedFromMoment) => {
    this.setState(() => {
      let newState = {
        fromMoment: selectedFromMoment.clone().startOf('day'),
      };
      return newState;
    });
  };

  setTimeTo = (selectedToMoment) => {
    this.setState(() => {
      let newState = {
        toMoment: selectedToMoment.clone().endOf('day'),
      };
      return newState;
    });
  };

  setFilterMonths = (filterMonths) => {
    this.setState({
      filterMonths: filterMonths,
    });
  };

  doSearch = async () => {
    store.dispatch(notificationSlice.actions.displayPanelError(null));
    store.dispatch(visualizationSlice.actions.reset());
    this.setState({
      searchInProgress: true,
      searchError: null,
    });
    let currentQuery = new Query();
    const searchPreparation = currentQuery.prepareNewSearch(
      this.state.fromMoment.clone(),
      this.state.toMoment.clone(),
      this.props.mapBounds,
      this.state.filterMonths,
    );
    if (!searchPreparation.success) {
      this.setState({
        searchError: { msg: searchPreparation.message },
        searchInProgress: false,
      });
      return;
    }
    const { results } = await currentQuery.getNextNResults(50).catch((err) => {
      this.setState({
        searchError: { msg: err.message },
      });
      return { results: [] };
    });

    this.setState(
      {
        resultsPanelSelected: true,
        searchInProgress: false,
      },
      this.props.shouldDisplayTileGeometries(true),
    );

    if (!results.length && this.state.searchError) {
      return;
    } else if (!results.length) {
      this.setState({
        searchError: { msg: t`No products found` },
      });
      return;
    }
    this.props.onSearchFinished(currentQuery);
  };

  backToSearch = () => {
    this.props.resetSearch();
    this.setState(
      () => ({
        resultsPanelSelected: false,
      }),
      this.props.shouldDisplayTileGeometries(false),
    );
  };

  setSelectedTab = (tab) => {
    store.dispatch(tabsSlice.actions.setSelectedTabSearchPanelIndex(tab));

    if (tab !== SEARCH_PANEL_TABS.COMMERCIAL_DATA_TAB) {
      store.dispatch(commercialDataSlice.actions.setDisplaySearchResults(false));
    }

    window.location.hash = SEARCH_PANEL_TABS_HASH[tab];
  };

  handleSelectTheme = async (e, themes) => {
    const { id: selectedThemeId, list: selectedThemesListId, highlights } = themes[e.target.value];
    if (selectedThemeId === EXPIRED_ACCOUNT_DUMMY_INSTANCE_ID) {
      const errorMessage = t`Your user instances could not be loaded as your Sentinel Hub account was not set up/expired. You can still use Copernicus Browser but you will not be able to use personal user instances. To be able to set up personal user instances you can apply for a 30-days free trial or consider subscribing to one of the plans: `;
      const errorLink = 'https://shapps.dataspace.copernicus.eu/dashboard/#/';
      store.dispatch(notificationSlice.actions.displayPanelError({ message: errorMessage, link: errorLink }));
    } else {
      store.dispatch(notificationSlice.actions.displayPanelError(null));
    }
    this.setState({
      searchError: null,
    });
    store.dispatch(
      themesSlice.actions.setSelectedThemeId({
        selectedThemeId: selectedThemeId,
        selectedThemesListId: selectedThemesListId,
      }),
    );
    store.dispatch(visualizationSlice.actions.reset());
    if (highlights) {
      this.setSelectedTab(SEARCH_PANEL_TABS.HIGHLIGHTS_TAB);
    }
    this.props.resetSearch();
  };

  renderThemeSelect = (isEducationModeSelected = false) => {
    let {
      anonToken,
      user,
      modeThemesList,
      userInstancesThemesList,
      urlThemesList,
      selectedThemeId,
      selectedThemesListId,
    } = this.props;
    let themes;
    urlThemesList = urlThemesList.map((t) => ({ ...t, list: URL_THEMES_LIST }));
    userInstancesThemesList = userInstancesThemesList.map((t) => ({
      ...t,
      list: USER_INSTANCES_THEMES_LIST,
    }));
    modeThemesList = modeThemesList.map((t) => ({ ...t, list: MODE_THEMES_LIST }));

    if (!anonToken) {
      themes = userInstancesThemesList;
    } else if (isEducationModeSelected) {
      themes = [...modeThemesList, ...userInstancesThemesList];
    } else if (urlThemesList.length) {
      themes = [...urlThemesList, ...userInstancesThemesList];
    } else {
      themes = [...modeThemesList, ...userInstancesThemesList];
    }

    const selectedThemeIndex = themes.findIndex(
      (t) => t.id === selectedThemeId && t.list === selectedThemesListId,
    );
    return (
      <div className="theme-select top">
        <div className="top-label">
          {t`Theme`}
          {!isEducationModeSelected && (
            <ExternalLink
              className="configurations-settings"
              href="https://apps.sentinel-hub.com/dashboard/#/configurations"
            >
              <i className="fa fa-cog" title={t`Manage configuration instances`} />
            </ExternalLink>
          )}
        </div>
        {!user && !isEducationModeSelected && <p>{t`Login to use custom configuration instances.`}</p>}
        <div>
          <select
            className="dropdown"
            value={selectedThemeId === null ? NO_THEME : selectedThemeIndex}
            onChange={(e) => this.handleSelectTheme(e, themes)}
          >
            {selectedThemeId === null && <option value={NO_THEME}>...</option>}
            {themes.map((theme, i) => (
              <option key={i} value={i}>
                {getThemeName(theme)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  render() {
    const {
      minDate,
      maxDate,
      dataSourcesInitialized,
      selectedModeId,
      selectedThemeId,
      resultsAvailable,
      themesLists,
      selectedThemesListId,
      error,
      selectedTab,
      is3D,
      terrainViewerId,
      termsPrivacyAccepted,
    } = this.props;
    const minDateRange = minDate ? minDate : moment.utc('1972-07-01');
    const maxDateRange = maxDate ? maxDate : moment.utc();
    const { fromMoment, toMoment, searchInProgress, resultsPanelSelected } = this.state;
    const isEducationModeSelected = selectedModeId === EDUCATION_MODE.id;
    if (selectedThemeId !== null && !dataSourcesInitialized) {
      return (
        <div className="search-loader">
          <Loader />
        </div>
      );
    }

    const displayingResults = resultsAvailable && resultsPanelSelected;

    const selectedTheme = themesLists[selectedThemesListId].find((t) => t.id === selectedThemeId);
    const highlightsAvailable = selectedTheme && selectedTheme.pins && selectedTheme.pins.length > 0;
    const commercialDataTabAvailable = true;
    const isSearchSelected = selectedTab === SEARCH_PANEL_TABS.SEARCH_TAB;
    const areHighlightsSelected = selectedTab === SEARCH_PANEL_TABS.HIGHLIGHTS_TAB;
    const isCommercialDataSelected = selectedTab === SEARCH_PANEL_TABS.COMMERCIAL_DATA_TAB;
    return (
      <>
        {displayingResults && (
          <Results
            query={this.props.query}
            onResultSelected={this.props.onResultSelected}
            setHighlightedTile={this.props.setHighlightedTile}
            selectedTiles={this.props.selectedTiles}
            backToSearch={this.backToSearch}
          />
        )}
        <div className={`search-panel ${displayingResults ? 'hidden' : ''}`}>
          {this.renderThemeSelect(isEducationModeSelected)}
          <ul className="discover-tabs">
            <li
              onClick={() => this.setSelectedTab(SEARCH_PANEL_TABS.SEARCH_TAB)}
              className={`discover-tab-button ${isSearchSelected ? 'active' : ''}`}
            >
              {t`Search`}
            </li>
            {!isEducationModeSelected && !is3D && (
              <li
                onClick={() => this.setSelectedTab(SEARCH_PANEL_TABS.COMMERCIAL_DATA_TAB)}
                className={`discover-tab-button ${commercialDataTabAvailable ? '' : ''} ${
                  isCommercialDataSelected ? 'active' : ''
                }`}
              >
                {t`Commercial data`}
              </li>
            )}
            <li
              onClick={() => this.setSelectedTab(SEARCH_PANEL_TABS.HIGHLIGHTS_TAB)}
              className={`discover-tab-button ${highlightsAvailable ? '' : ''} ${
                areHighlightsSelected ? 'active' : ''
              }`}
            >
              {t`Highlights`}
            </li>
          </ul>
          <div className={`discover-tab ${isSearchSelected ? '' : 'hidden'}`}>
            <div className="top-label">
              {t`Data sources`}
              <div>
                <div className="checkbox-group">
                  <div className="column" key={selectedThemeId || ''}>
                    {selectedThemeId === null ? (
                      <div className="no-theme-selected">{t`Please select a theme.`}</div>
                    ) : (
                      renderDataSourcesInputs()
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="clear" />
            <div className="select-time-range">
              <div className="top-label">{t`Time range [UTC]`}</div>
              <div className="date-pickers-wrapper">
                <DatePicker
                  id="from-search-datepicker"
                  selectedDay={fromMoment}
                  setSelectedDay={this.setTimeFrom}
                  calendarContainer={this.calendarHolder}
                  minDate={minDateRange}
                  maxDate={toMoment}
                />

                <span className="date-picker-separator">-</span>
                <DatePicker
                  id="to-search-datepicker"
                  selectedDay={toMoment}
                  setSelectedDay={this.setTimeTo}
                  calendarContainer={this.calendarHolder}
                  minDate={fromMoment}
                  maxDate={maxDateRange}
                />
                <div className="calendar-holder" ref={(e) => (this.calendarHolder = e)} />
              </div>
              <EOBFilterSearchByMonths onChange={this.setFilterMonths} />
            </div>
          </div>
          {isSearchSelected && (
            <div className="search-btn-wrapper">
              <EOBButton loading={searchInProgress} onClick={() => this.doSearch()} fluid text={t`Search`} />
            </div>
          )}
          <div className={`discover-tab ${areHighlightsSelected ? '' : 'hidden'}`}>
            <Highlights
              isThemeSelected={selectedThemeId !== null}
              highlights={highlightsAvailable ? selectedTheme.pins : []}
              resetSearch={this.props.resetSearch}
              setTimeSpanExpanded={this.props.setTimeSpanExpanded}
              setSelectedHighlight={this.props.setSelectedHighlight}
              terrainViewerId={terrainViewerId}
              is3D={is3D}
              userdata={this.props.user}
            />
          </div>
          <div className={`discover-tab ${isCommercialDataSelected ? '' : 'hidden'}`}>
            <CommercialData displayVideo={termsPrivacyAccepted} />
          </div>

          {error ? (
            <NotificationPanel
              msg={
                <div>
                  <span>{error.message}</span>
                  {error.link ? (
                    <ExternalLink href={error.link}>
                      <i className="fas fa-external-link-alt" />
                    </ExternalLink>
                  ) : null}
                </div>
              }
              type="error"
            />
          ) : null}
          {this.state.searchError ? (
            <NotificationPanel msg={<div>{this.state.searchError.msg}</div>} type="error" />
          ) : null}
          {this.props.failedThemeParts.length > 0 && this.state.shouldShowThemesError && (
            <NotificationPanel
              type="error"
              additionalClass="notification-error-themes"
              hideErrorOnClick={this.hideThemesErrorOnClick}
              msg={
                <div>
                  {t`Error retrieving additional data!`}
                  <div>
                    <span>{t`These are theme parts which contain unavailable data sources:`}</span>
                    <ul style={{ textAlign: 'left' }}>
                      {this.props.failedThemeParts.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              }
            />
          )}
        </div>
      </>
    );
  }
}

const mapStoreToProps = (store) => ({
  anonToken: store.auth.anonToken,
  termsPrivacyAccepted: store.auth.terms_privacy_accepted,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  mapBounds: store.mainMap.bounds,
  is3D: store.mainMap.is3D,
  user: store.auth.user.userdata,
  selectedModeId: store.themes.selectedModeId,
  selectedThemeId: store.themes.selectedThemeId,
  modeThemesList: store.themes.themesLists[MODE_THEMES_LIST],
  userInstancesThemesList: store.themes.themesLists[USER_INSTANCES_THEMES_LIST],
  urlThemesList: store.themes.themesLists[URL_THEMES_LIST],
  failedThemeParts: store.themes.failedThemeParts,
  themesLists: store.themes.themesLists,
  selectedThemesListId: store.themes.selectedThemesListId,
  selectedLanguage: store.language.selectedLanguage,
  error: store.notification.panelError,
  selectedTab: store.tabs.selectedTabSearchPanelIndex,
  terrainViewerId: store.terrainViewer.id,
});

export default connect(mapStoreToProps, null)(withRouter(SearchPanel));
