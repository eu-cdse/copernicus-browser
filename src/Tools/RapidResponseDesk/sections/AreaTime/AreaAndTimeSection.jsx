import React, { useEffect, useRef, useState } from 'react';
import './AreaAndTimeSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { t } from 'ttag';
import store, {
  areaAndTimeSectionSlice,
  collapsiblePanelSlice,
  notificationSlice,
  imageQualityAndProviderSectionSlice,
  resultsSectionSlice,
} from '../../../../store';
import { AOISelection } from '../../../../components/AOISelection/AOISelection';
import { TimespanPicker } from '../../../../components/TimespanPicker/TimespanPicker';
import moment from 'moment/moment';
import { MIN_SEARCH_DATE } from '../../../../api/OData/ODataHelpers';
import Button, { ButtonType } from '../../../../components/Button/Button';
import { TABS } from '../../../../const';
import RadioButtonGroup from '../../../../components/RadioButtonGroup/RadioButtonGroup';
import { ProviderImageTypes, ProviderModeSupport } from '../../rapidResponseProperties';

export const AreaAndTimeSectionAttributes = Object.freeze({
  id: 'area-time',
  title: () => t`Area & Time`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setAreaTimeExpanded(v)),
});

const AreaAndTimeSection = ({
  areaTimeExpanded,
  aoiGeometry,
  aoiIsDrawing,
  mapBounds,
  minDate,
  overlappedRanges,
  selectedTabIndex,
  isTaskingEnabled,
  imageType,
}) => {
  const [timespanArray, setTimespanArray] = useState([
    {
      from: moment.utc().subtract(1, 'month').startOf('day'),
      to: moment.utc(),
      id: 0,
      displayCalendarFrom: false,
      displayCalendarTo: false,
    },
  ]);

  const now = moment.utc();
  const minDateRange = isTaskingEnabled
    ? now.clone().startOf('day')
    : moment.utc(minDate || MIN_SEARCH_DATE).startOf('day');

  const maxDateRange = isTaskingEnabled ? now.clone().add(1, 'year') : now;

  const cardHolderRef = useRef(null);

  const getTitle = () => <div className="uppercase-text">{AreaAndTimeSectionAttributes.title()}:</div>;

  const checkIfTimespanIsBetweenAnotherTimespan = (
    selectedFromTimespan,
    selectedToTimespan,
    tempTimespan,
  ) => {
    return (
      // is selected timespan between temp timespan
      selectedFromTimespan.isBetween(tempTimespan.from, tempTimespan.to, undefined, '[]') ||
      selectedToTimespan.isBetween(tempTimespan.from, tempTimespan.to, undefined, '[]') ||
      // is temp timespan between selected timespan
      tempTimespan.from.isBetween(selectedFromTimespan, selectedToTimespan, undefined, '[]') ||
      tempTimespan.to.isBetween(selectedFromTimespan, selectedToTimespan, undefined, '[]')
    );
  };

  const detectIfDateIsOverlapping = (id, selectedFromTimespan, selectedToTimespan) => {
    const overlappedFromRange = timespanArray.filter((tempTimespan) => {
      if (id !== tempTimespan.id) {
        return checkIfTimespanIsBetweenAnotherTimespan(
          selectedFromTimespan,
          selectedToTimespan,
          tempTimespan,
        );
      } else {
        return undefined;
      }
    });

    const overlappedToRange = timespanArray.filter((currentTimespan) => {
      if (id !== currentTimespan.id) {
        return selectedToTimespan.isBetween(currentTimespan.from, currentTimespan.to, undefined, '[]');
      } else {
        return undefined;
      }
    });

    const newOverlappedRanges = overlappedRanges ? [...overlappedRanges] : [];
    storeRangesWhichAreOverlapping(overlappedFromRange, overlappedToRange, newOverlappedRanges, id);
  };

  const storeRangesWhichAreOverlapping = (
    overlappedFromRange,
    overlappedToRange,
    newOverlappedRanges,
    id,
  ) => {
    // clear all out for selected id and check for new overlaps
    newOverlappedRanges = newOverlappedRanges.filter(
      (range) => range.selectedTimeRangeId !== id && range.overlappedRangeId !== id,
    );

    if (overlappedFromRange.length > 0) {
      showOverlapMessage();
      overlappedFromRange.forEach((range) => {
        if (
          !newOverlappedRanges.some(
            (currentRange) =>
              currentRange.selectedTimeRangeId === id && currentRange.overlappedRangeId === range.id,
          )
        ) {
          newOverlappedRanges.push({ selectedTimeRangeId: id, overlappedRangeId: range.id });
        }
      });
    }

    if (overlappedToRange.length > 0) {
      showOverlapMessage();
      overlappedToRange.forEach((range) => {
        if (
          !newOverlappedRanges.some(
            (currentRange) =>
              currentRange.selectedTimeRangeId === id && currentRange.overlappedRangeId === range.id,
          )
        ) {
          newOverlappedRanges.push({ selectedTimeRangeId: id, overlappedRangeId: range.id });
        }
      });
    }

    store.dispatch(areaAndTimeSectionSlice.actions.setRangesOverlapped(newOverlappedRanges));

    removeOverlapErrorMessageIfNoOverlap(newOverlappedRanges);
  };

  const showOverlapMessage = () => {
    store.dispatch(
      notificationSlice.actions.displayPanelError({
        message: t`Please select non-overlapping time ranges.`,
        canBeClosed: false,
      }),
    );
  };

  const removeOverlapErrorMessageIfNoOverlap = (newOverlappedRanges) => {
    if (newOverlappedRanges.length === 0) {
      store.dispatch(notificationSlice.actions.displayPanelError(null));
    }
  };

  useEffect(() => {
    const timespanArrayForReduxStore = timespanArray.map((timespan) => ({
      ...timespan,
      from: timespan.from ? timespan.from.toISOString() : null,
      to: timespan.to ? timespan.to.toISOString() : null,
    }));
    store.dispatch(areaAndTimeSectionSlice.actions.setTimespanArray(timespanArrayForReduxStore));
  }, [timespanArray]);

  useEffect(() => {
    if (overlappedRanges.length > 0 && selectedTabIndex === TABS.RAPID_RESPONSE_DESK) {
      showOverlapMessage();
    }
  }, [selectedTabIndex, overlappedRanges]);

  const getAndSetNextPrevDate = async (direction, selectedDay, id, timespanFrame, isFrom = true) => {
    let newMoment;
    if (direction === 'prev') {
      newMoment = moment.utc(selectedDay).add(-1, 'days');
    } else {
      newMoment = moment.utc(selectedDay).add(1, 'days');
    }

    if (isFrom && (newMoment < minDateRange || newMoment > timespanFrame.to)) {
      throw Error('invalidDateRange');
    }

    if (!isFrom && (newMoment > maxDateRange || newMoment < timespanFrame.from)) {
      throw Error('invalidDateRange');
    }

    isFrom
      ? updateTimespan(id)(newMoment, timespanFrame.to)
      : updateTimespan(id)(timespanFrame.from, newMoment);
  };

  // const setAdditionalDateRange = (currentTimespanFrame) => {
  //   setTimespanArray((prevState) => {
  //     return [
  //       ...prevState,
  //       {
  //         from: currentTimespanFrame.from.clone().add(-1, 'days').startOf('day'),
  //         to: currentTimespanFrame.from.clone().add(-1, 'days').endOf('day'),
  //         id: timespanArray.length,
  //         displayCalendarFrom: false,
  //         displayCalendarTo: false,
  //       },
  //     ];
  //   });
  // };

  const updateTimespan = (id) => (fromTime, toTime) => {
    detectIfDateIsOverlapping(id, fromTime, toTime);
    setTimespanArray((prevState) => {
      return prevState.map((item, index) => (index === id ? { ...item, from: fromTime, to: toTime } : item));
    });
  };

  const closeAllCalendarDialogs = () => {
    setTimespanArray((prevState) => {
      return prevState.map((item) => ({
        ...item,
        displayCalendarFrom: false,
        displayCalendarTo: false,
      }));
    });
  };

  const updateCalendarOpenState = (selectedTimespan, state, isFrom = true) => {
    if (state) {
      closeAllCalendarDialogs();
    }

    setTimespanArray((prevState) => {
      return prevState.map((item, index) =>
        index === selectedTimespan.id
          ? {
              ...item,
              displayCalendarFrom: isFrom ? state : false,
              displayCalendarTo: !isFrom ? state : false,
            }
          : item,
      );
    });
  };

  const removeTimespanFromOverlappedRanges = (id) => {
    let newOverlappedRanges = overlappedRanges ? [...overlappedRanges] : [];
    newOverlappedRanges = newOverlappedRanges.filter(
      (range) => range.selectedTimeRangeId !== id && range.overlappedRangeId !== id,
    );
    store.dispatch(areaAndTimeSectionSlice.actions.setRangesOverlapped(newOverlappedRanges));

    removeOverlapErrorMessageIfNoOverlap(newOverlappedRanges);
  };

  const removeTimespanFromList = (id) => {
    removeTimespanFromOverlappedRanges(id);

    setTimespanArray((prevState) => {
      const newTimespanArray = prevState.filter((item, index) => index !== id);
      return newTimespanArray.map((item, index) => ({ ...item, id: index }));
    });
  };

  const renderTimespanPicker = (timespan, index) => (
    <TimespanPicker
      id="aoi-time-select"
      minDate={minDateRange}
      maxDate={maxDateRange}
      timespan={{ fromTime: timespan.from, toTime: timespan.to }}
      applyTimespan={updateTimespan(index)}
      timespanExpanded={true}
      calendarHolder={cardHolderRef}
      displayCalendarFrom={timespan.displayCalendarFrom}
      openCalendarFrom={() => updateCalendarOpenState(timespan, true)}
      closeCalendarFrom={() => updateCalendarOpenState(timespan, false)}
      displayCalendarUntil={timespan.displayCalendarTo}
      openCalendarUntil={() => updateCalendarOpenState(timespan, true, false)}
      closeCalendarUntil={() => updateCalendarOpenState(timespan, false, false)}
      showNextPrevDateArrows={true}
      getAndSetNextPrevDateFrom={async (direction, selectedDay) =>
        await getAndSetNextPrevDate(direction, selectedDay, index, timespan)
      }
      getAndSetNextPrevDateTo={async (direction, selectedDay) =>
        await getAndSetNextPrevDate(direction, selectedDay, index, timespan, false)
      }
      isDisabled={false}
    />
  );

  const modeSupportOptions = [
    { label: t`Archive`, value: ProviderModeSupport.archive, className: 'uppercase-text' },
    {
      label: t`Tasking`,
      value: ProviderModeSupport.tasking,
      className: 'uppercase-text',
      style: { marginLeft: '20px' },
    },
  ];

  const handleTaskingToggle = (selectedValue) => {
    const newTaskingEnabled = selectedValue === ProviderModeSupport.tasking;

    if (newTaskingEnabled === isTaskingEnabled) {
      return;
    }

    const now = moment.utc();

    store.dispatch(areaAndTimeSectionSlice.actions.setIsTaskingEnabled(newTaskingEnabled));
    store.dispatch(areaAndTimeSectionSlice.actions.setIsArchiveEnabled(!newTaskingEnabled));
    store.dispatch(imageQualityAndProviderSectionSlice.actions.resetProvidersAndMissions());

    store.dispatch(imageQualityAndProviderSectionSlice.actions.setRadarPolarizationFilterArray([]));
    store.dispatch(imageQualityAndProviderSectionSlice.actions.setRadarInstrumentFilterArray([]));

    store.dispatch(resultsSectionSlice.actions.setResults(undefined));
    store.dispatch(resultsSectionSlice.actions.setCurrentPage(1));

    setTimespanArray((prevState) =>
      prevState.map((item) => ({
        ...item,
        from: newTaskingEnabled ? now.clone() : now.clone().subtract(1, 'month').startOf('day'),
        to: newTaskingEnabled ? now.clone().add(1, 'week') : now.clone(),
      })),
    );
  };

  const renderModeSupportOptions = () => (
    <div className="radio-buttons-container">
      <RadioButtonGroup
        name="image-quality-and-provider-mode-support-radio-group"
        options={modeSupportOptions}
        disabled={imageType === ProviderImageTypes.atmos}
        value={
          isTaskingEnabled
            ? modeSupportOptions.find((type) => type.value === ProviderModeSupport.tasking)
            : modeSupportOptions.find((type) => type.value === ProviderModeSupport.archive)
        }
        onChange={handleTaskingToggle}
      ></RadioButtonGroup>
    </div>
  );

  const renderDateRangeContainer = () => (
    <div className="date-picker-container">
      {renderModeSupportOptions()}
      {timespanArray.map((timespanFrame, index) => {
        return (
          <div
            key={`date-picker-${index}`}
            className={`date-picker-content${index + 1 < timespanArray.length ? ' bottom-border' : ''}`}
          >
            {renderTimespanPicker(timespanFrame, index)}
            {timespanArray.length > 1 && (
              <div className="remove-button-container">
                <Button
                  icon={'fas fa-trash'}
                  type={ButtonType.text}
                  rounded={true}
                  onClick={() => removeTimespanFromList(index)}
                ></Button>
              </div>
            )}
            {/* {timespanArray.length === index + 1 && (
              <div className="add-button-container">
                <Button
                  icon={'fas fa-plus'}
                  type={ButtonType.text}
                  iconStyle={{ transform: 'scale(0.85)' }}
                  rounded={true}
                  onClick={() => setAdditionalDateRange(timespanFrame)}
                ></Button>
              </div>
            )} */}
          </div>
        );
      })}
      <div className="calendar-holder" ref={cardHolderRef} />
    </div>
  );

  const renderBody = () => (
    <div className="area-time-body">
      <div className="area-interest-container">
        {renderDateRangeContainer()}
        <AOISelection
          aoiGeometry={aoiGeometry}
          aoiIsDrawing={aoiIsDrawing}
          mapBounds={mapBounds}
        ></AOISelection>
      </div>
    </div>
  );

  return (
    <CollapsiblePanel
      key={AreaAndTimeSectionAttributes.id}
      className={`section`}
      title={getTitle()}
      headerComponent={getTitle()}
      expanded={areaTimeExpanded}
      toggleExpanded={AreaAndTimeSectionAttributes.toggleExpanded}
    >
      {() => {
        return areaTimeExpanded ? renderBody() : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  areaTimeExpanded: store.collapsiblePanel.areaTimeExpanded,
  aoiGeometry: store.aoi.geometry,
  aoiIsDrawing: store.aoi.isDrawing,
  mapBounds: store.mainMap.bounds,
  overlappedRanges: store.areaAndTimeSection.overlappedRanges,
  selectedTabIndex: store.tabs.selectedTabIndex,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
  isArchiveEnabled: store.areaAndTimeSection.isArchiveEnabled,
  imageType: store.imageQualityAndProviderSection.imageType,
});

export default connect(mapStoreToProps, null)(AreaAndTimeSection);
