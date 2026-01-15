import React, { Component } from 'react';
import { isMobile } from 'react-device-detect';
import { t } from 'ttag';

import DatePicker from '../../components/DatePicker/DatePicker';
import EOBFilterSearchByMonths from '../../junk/EOBCommon/EOBFilterSearchByMonths/EOBFilterSearchByMonths';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { getDatasetLabel } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import ReactMarkdown from 'react-markdown';
import {
  COPERNICUS_CLMS_LST_5KM_HOURLY_V1,
  COPERNICUS_CLMS_LST_5KM_HOURLY_V2,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

const getPeriodsForBestImg = () => [
  { value: 'orbit', text: t`orbit` },
  { value: 'day', text: t`day` },
  { value: 'isoWeek', text: t`week` },
  { value: 'month', text: t`month` },
  { value: 'year', text: t`year` },
];

const getTooltipContent = () => t`
**orbit**: selects one image\* per satellite orbit (only available for datasets with orbit-based or hourly acquisition)

**day**: selects one image\* per calendar day

**week**: selects one image\* per ISO week (weeks start on Monday)

**month**: selects one image\* per calendar month

**year**: selects one image\* per calendar year

\*with highest coverage of the selected area and lowest cloud coverage (if available)
`;

const ORBIT_HOURLY_LIMIT_IN_DAYS = 5;

export class TimelapseControls extends Component {
  calendarHolder = React.createRef();

  state = {
    displayCalendarFrom: false,
    displayCalendarTo: false,
  };

  openCalendarFrom = () => this.setState({ displayCalendarFrom: true });
  closeCalendarFrom = () => this.setState({ displayCalendarFrom: false });
  openCalendarTo = () => this.setState({ displayCalendarTo: true });
  closeCalendarTo = () => this.setState({ displayCalendarTo: false });

  render() {
    const {
      fromTime,
      toTime,
      minDate,
      maxDate,
      loadingLayer,
      loadingImages,
      filterMonths,
      selectedPeriod,
      supportsOrbitPeriod,
      pins,
      layer,
      customSelected,
      datasetId,
      onRemovePin,
      onSidebarPopupToggle,
    } = this.props;

    const isHourlyDatasetWithOrbit =
      selectedPeriod === 'orbit' &&
      [COPERNICUS_CLMS_LST_5KM_HOURLY_V1, COPERNICUS_CLMS_LST_5KM_HOURLY_V2].includes(datasetId);
    const fromToDiff = toTime !== null && fromTime !== null ? toTime.diff(fromTime, 'hours') : 0;
    const shouldShowOrbitWarning = isHourlyDatasetWithOrbit && fromToDiff > ORBIT_HOURLY_LIMIT_IN_DAYS * 24;

    return (
      <div className="controls">
        <div className="timespan-wrapper">
          {fromTime && toTime ? (
            <>
              <DatePicker
                id="date-picker-from"
                calendarContainer={this.calendarHolder}
                selectedDay={fromTime}
                setSelectedDay={(e) => this.props.updateDate('from', e)}
                minDate={minDate}
                maxDate={toTime}
                onQueryDatesForActiveMonth={this.props.onQueryDatesForActiveMonth}
                displayCalendar={this.state.displayCalendarFrom}
                openCalendar={this.openCalendarFrom}
                closeCalendar={this.closeCalendarFrom}
              />
              <span className="date-picker-separator">-</span>
              <DatePicker
                id="date-picker-to"
                calendarContainer={this.calendarHolder}
                selectedDay={toTime}
                setSelectedDay={(e) => this.props.updateDate('to', e)}
                minDate={fromTime}
                maxDate={maxDate}
                onQueryDatesForActiveMonth={this.props.onQueryDatesForActiveMonth}
                displayCalendar={this.state.displayCalendarTo}
                openCalendar={this.openCalendarTo}
                closeCalendar={this.closeCalendarTo}
              />
            </>
          ) : null}
        </div>
        <div className="timelapse-calendar-holder" ref={this.calendarHolder} />

        <div className="filter-months">
          <EOBFilterSearchByMonths selectedMonths={filterMonths} onChange={this.props.setFilterMonths} />
        </div>

        <div className="select-period-container">
          <div className="select-period-label">
            <span>{t`Select 1 image per:`}</span>
            <HelpTooltip direction="right" closeOnClickOutside={true}>
              <ReactMarkdown linkTarget="_blank">{getTooltipContent()}</ReactMarkdown>
            </HelpTooltip>
          </div>

          <div className="select-period-options">
            {getPeriodsForBestImg().map((p) => (
              <label key={p.value} className={`period ${selectedPeriod === p.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  checked={selectedPeriod === p.value}
                  onChange={() => this.props.setSelectedPeriod(p.value)}
                  disabled={!supportsOrbitPeriod && p.value === 'orbit'}
                />
                {p.text}
              </label>
            ))}
          </div>
          {shouldShowOrbitWarning && (
            <div className="orbit-warning">
              <i className="fa fa-exclamation-circle" />
              {t`This dataset supports a maximum time range of ${ORBIT_HOURLY_LIMIT_IN_DAYS} days for the "orbit" selection.`}
            </div>
          )}
        </div>

        <div className="visualisations">
          <div className="layer">
            {getDatasetLabel(datasetId)}: {customSelected ? 'Custom' : layer?.title}
          </div>

          {pins.map((pin, index) => (
            <div className="layer" key={index}>
              <span className="remove" onClick={() => onRemovePin(pin)}>
                <i className="far fa-trash-alt"></i>
              </span>
              {pin.title}
            </div>
          ))}
        </div>

        <EOBButton
          className="search-button"
          disabled={loadingLayer || shouldShowOrbitWarning}
          onClick={() => this.props.onSearch()}
          text={t`Search`}
          icon={'search'}
          loading={loadingImages || loadingLayer}
        />

        {!isMobile && !!import.meta.env.VITE_CDSE_BACKEND && (
          <div className="add-layers">
            <span onClick={() => onSidebarPopupToggle('pins')}>
              <i className="fas fa-plus-circle"></i> {t`Add layers from pins`}
            </span>
          </div>
        )}
      </div>
    );
  }
}
