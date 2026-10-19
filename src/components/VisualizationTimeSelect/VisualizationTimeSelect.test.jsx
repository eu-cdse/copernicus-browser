import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import moment from 'moment';

import { VisualizationTimeSelect } from './VisualizationTimeSelect';
import store, { visualizationSlice } from '../../store';
import { DATE_MODES } from '../../const';

// The header always renders these three mode-switch icons regardless of datePanelExpanded, but
// jest's fileTransform.cjs maps `*.svg?react` imports to a plain object (not a valid React
// element type), so they must be stubbed with a real element to avoid an "invalid element type"
// render error.
jest.mock('./icons/single.svg?react', () => {
  const React = require('react');
  return { __esModule: true, default: (props) => React.createElement('svg', props) };
});
jest.mock('./icons/mosaic.svg?react', () => {
  const React = require('react');
  return { __esModule: true, default: (props) => React.createElement('svg', props) };
});
jest.mock('./icons/time-range.svg?react', () => {
  const React = require('react');
  return { __esModule: true, default: (props) => React.createElement('svg', props) };
});

// `openLayerPanel` is only reachable through `updateDate`/`getAndSetLatestDateWithData`, both
// internal (non-exported) functions. Stub the real DatePicker (a Redux-connected class component
// with its own async fetch/calendar machinery, irrelevant here) with a button that invokes the
// `setSelectedDay` prop it's given — which is `updateDate` — so tests can drive `openLayerPanel`
// through the component's public interface.
jest.mock('../DatePicker/DatePicker', () => (props) => {
  const React = require('react');
  const moment = require('moment');
  return React.createElement(
    'button',
    { 'data-testid': 'mock-date-picker', onClick: () => props.setSelectedDay(moment.utc()) },
    'mock date picker',
  );
});

// Not under test here; stub it out so it doesn't need its own icon import resolved.
jest.mock('./ShowLatestDateButton', () => () => null);

function renderComponent(overrides = {}) {
  const setShowLayerPanel = jest.fn();
  const props = {
    isTimeless: false,
    maxDate: moment.utc(),
    minDate: moment.utc().subtract(1, 'year'),
    onQueryDatesForActiveMonth: jest.fn(),
    onQueryDatesForRange: jest.fn(),
    showNextPrev: false,
    fromTime: null,
    toTime: null,
    timespanSupported: false,
    onQueryFlyoversForActiveMonth: jest.fn(),
    onQueryFlyoversForRange: jest.fn(),
    hasCloudCoverage: false,
    isZoomLevelOk: true,
    updateSelectedTime: jest.fn(),
    getLatestAvailableDate: jest.fn().mockResolvedValue(null),
    limitMonthsSearch: 6,
    maxCloudCover: 100,
    setMaxCloudCover: jest.fn(),
    setMaxCloudCoverAfterChange: jest.fn(),
    datePanelExpanded: false,
    showLayerPanel: false,
    setShowLayerPanel,
    showHighlightPanel: false,
    showComparePanel: false,
    showPinPanel: false,
    dateMode: DATE_MODES.SINGLE.value,
    compareShare: false,
    wmsPanelOpen: false,
    clmsSelection: { selected: false },
    ...overrides,
  };

  render(
    <Provider store={store}>
      <VisualizationTimeSelect {...props} />
    </Provider>,
  );

  return { setShowLayerPanel, props };
}

// Covers #1184 F4: `openLayerPanel` (called from `updateDate`, itself invoked via the DatePicker's
// `setSelectedDay` prop) must not bounce the sidebar back to the Layers panel while the Pins panel
// is showing — mirrors the ThemeSelect panel-race guard fixed for F3.
describe('VisualizationTimeSelect — openLayerPanel panel-race guard (#1184 F4)', () => {
  it('does not call setShowLayerPanel when the Pins panel is showing', () => {
    const { setShowLayerPanel } = renderComponent({ showPinPanel: true });

    fireEvent.click(screen.getByTestId('mock-date-picker'));

    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });

  it('still calls setShowLayerPanel(true) when no other panel is pending (pre-existing behavior)', () => {
    const { setShowLayerPanel } = renderComponent();

    fireEvent.click(screen.getByTestId('mock-date-picker'));

    expect(setShowLayerPanel).toHaveBeenCalledWith(true);
  });

  it('does not call setShowLayerPanel when the Compare panel is showing', () => {
    const { setShowLayerPanel } = renderComponent({ showComparePanel: true });

    fireEvent.click(screen.getByTestId('mock-date-picker'));

    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });

  it('does not call setShowLayerPanel when compareShare is true', () => {
    const { setShowLayerPanel } = renderComponent({ compareShare: true });

    fireEvent.click(screen.getByTestId('mock-date-picker'));

    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });

  // Regression test for issue #1270: compareShare (Redux) is still false at mount for a
  // compare-share URL, since URLParamsParser's restore dispatch is async — compareShareInit is the
  // URL-parsed flag that is already correct at this point, same as ThemeSelect.jsx's guard.
  it('does not call setShowLayerPanel when compareShareInit is true and compareShare is not yet true', () => {
    const { setShowLayerPanel } = renderComponent({ compareShare: false, compareShareInit: true });

    fireEvent.click(screen.getByTestId('mock-date-picker'));

    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });

  // Regression tests for a live, confirmed bug: refreshing while on the WMS panel jumped to Layers.
  // updateSelectedDates (keyed on dateMode) calls updateDate -> openLayerPanel synchronously on
  // mount whenever dateMode is SINGLE (the common case) and selectedDay (derived from the toTime
  // prop) is set — the common case for a restored URL — so the bug was reproducible on mount alone,
  // before wmsPanelOpen (Redux, set async by App.jsx once external-server hydration resolves) could
  // ever be true yet.
  it('does not call setShowLayerPanel on mount when panelFromUrlParams is wms', () => {
    const { setShowLayerPanel } = renderComponent({
      panelFromUrlParams: 'wms',
      wmsPanelOpen: false,
      toTime: moment.utc(),
    });

    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });

  it('does not call setShowLayerPanel when wmsPanelOpen is already true (post-restore)', () => {
    const { setShowLayerPanel } = renderComponent({ wmsPanelOpen: true });

    fireEvent.click(screen.getByTestId('mock-date-picker'));

    expect(setShowLayerPanel).not.toHaveBeenCalled();
  });

  it('still calls setShowLayerPanel(true) on a later click after the mount-time WMS skip is consumed', () => {
    const { setShowLayerPanel } = renderComponent({
      panelFromUrlParams: 'wms',
      wmsPanelOpen: false,
      toTime: moment.utc(),
    });
    expect(setShowLayerPanel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('mock-date-picker'));

    expect(setShowLayerPanel).toHaveBeenCalledWith(true);
  });
});

// Issue #1290: a URL with a dataset but no date (or with date=latest) sets pendingLatestDate, and
// the component then runs the same lookup as the "Show latest date" button, silently, once the map
// bounds, auth and data sources are ready.
describe('VisualizationTimeSelect — silent latest-date lookup on load (#1290)', () => {
  const latest = moment.utc('2026-10-10T10:00:00Z');
  const ready = {
    datasetId: 'S2_L2A_CDAS',
    pendingLatestDate: true,
    mapBoundsKnown: true,
    authenticated: true,
    dataSourcesInitialized: true,
  };

  beforeEach(() => {
    store.dispatch(visualizationSlice.actions.reset());
    store.dispatch(visualizationSlice.actions.setVisualizationParams({ datasetId: 'S2_L2A_CDAS' }));
    store.dispatch(visualizationSlice.actions.setPendingLatestDate(true));
  });

  it('sets the latest date once everything is ready', async () => {
    const { props } = renderComponent({
      ...ready,
      getLatestAvailableDate: jest.fn().mockResolvedValue(latest),
    });

    await waitFor(() => expect(props.updateSelectedTime).toHaveBeenCalledTimes(1));
    const [fromTime, toTime] = props.updateSelectedTime.mock.calls[0];
    expect(fromTime.toISOString()).toBe('2026-10-10T00:00:00.000Z');
    expect(toTime.toISOString()).toBe('2026-10-10T23:59:59.999Z');
    expect(store.getState().visualization.pendingLatestDate).toBe(false);
  });

  it('sets the same single-day range as the "Show latest date" button in MOSAIC mode', async () => {
    const { props } = renderComponent({
      ...ready,
      dateMode: DATE_MODES.MOSAIC.value,
      minDate: moment.utc('2015-01-01T00:00:00Z'),
      getLatestAvailableDate: jest.fn().mockResolvedValue(latest),
    });

    await waitFor(() => expect(props.updateSelectedTime).toHaveBeenCalled());
    const [fromTime, toTime] =
      props.updateSelectedTime.mock.calls[props.updateSelectedTime.mock.calls.length - 1];
    expect(fromTime.toISOString()).toBe('2026-10-10T00:00:00.000Z');
    expect(toTime.toISOString()).toBe('2026-10-10T23:59:59.999Z');
  });

  // Regression for the review of #1290: the existing mount effect for TIME RANGE dispatches the URL's
  // (here empty) dates, which cleared the pending flag before the map bounds arrived, so
  // date=latest&dateMode=TIME RANGE silently never looked anything up.
  it('does not let the TIME RANGE mount effect cancel a pending lookup', async () => {
    const getLatestAvailableDate = jest.fn().mockResolvedValue(latest);
    const { props } = renderComponent({
      ...ready,
      dateMode: DATE_MODES['TIME RANGE'].value,
      mapBoundsKnown: false,
      getLatestAvailableDate,
    });

    // mounted without map bounds: nothing was dispatched, and the flag is still pending
    expect(props.updateSelectedTime).not.toHaveBeenCalled();
    expect(store.getState().visualization.pendingLatestDate).toBe(true);
    expect(getLatestAvailableDate).not.toHaveBeenCalled();
  });

  it('looks the latest date up in TIME RANGE mode once everything is ready', async () => {
    const { props } = renderComponent({
      ...ready,
      dateMode: DATE_MODES['TIME RANGE'].value,
      getLatestAvailableDate: jest.fn().mockResolvedValue(latest),
    });

    await waitFor(() => expect(props.updateSelectedTime).toHaveBeenCalledTimes(1));
    const [fromTime, toTime] = props.updateSelectedTime.mock.calls[0];
    expect(fromTime.toISOString()).toBe('2026-10-10T00:00:00.000Z');
    expect(toTime.toISOString()).toBe('2026-10-10T23:59:59.999Z');
  });

  it('still applies the URL time range in TIME RANGE mode when no lookup is pending', () => {
    store.dispatch(visualizationSlice.actions.setPendingLatestDate(false));
    const fromTime = moment.utc('2026-01-01T00:00:00Z');
    const toTime = moment.utc('2026-02-01T23:59:59Z');
    const { props } = renderComponent({
      ...ready,
      pendingLatestDate: false,
      dateMode: DATE_MODES['TIME RANGE'].value,
      fromTime,
      toTime,
    });

    expect(props.updateSelectedTime).toHaveBeenCalledWith(fromTime, toTime);
  });

  it.each([
    ['map bounds', { mapBoundsKnown: false }],
    ['authentication', { authenticated: false }],
    ['data sources', { dataSourcesInitialized: false }],
  ])('waits for %s before looking anything up', async (_name, missing) => {
    const getLatestAvailableDate = jest.fn().mockResolvedValue(latest);
    renderComponent({ ...ready, ...missing, getLatestAvailableDate });

    await new Promise((r) => setTimeout(r, 0));
    expect(getLatestAvailableDate).not.toHaveBeenCalled();
    expect(store.getState().visualization.pendingLatestDate).toBe(true);
  });

  it('does nothing when no lookup is pending', async () => {
    store.dispatch(visualizationSlice.actions.setPendingLatestDate(false));
    const getLatestAvailableDate = jest.fn().mockResolvedValue(latest);
    renderComponent({ ...ready, pendingLatestDate: false, getLatestAvailableDate });

    await new Promise((r) => setTimeout(r, 0));
    expect(getLatestAvailableDate).not.toHaveBeenCalled();
  });

  it('gives up quietly when the button itself would be disabled (zoom too low)', async () => {
    const getLatestAvailableDate = jest.fn().mockResolvedValue(latest);
    const { props } = renderComponent({ ...ready, isZoomLevelOk: false, getLatestAvailableDate });

    await waitFor(() => expect(store.getState().visualization.pendingLatestDate).toBe(false));
    expect(getLatestAvailableDate).not.toHaveBeenCalled();
    expect(props.updateSelectedTime).not.toHaveBeenCalled();
  });

  it('leaves timeless datasets to the existing isTimeless lookup (no double lookup)', async () => {
    const getLatestAvailableDate = jest.fn().mockResolvedValue(latest);
    renderComponent({ ...ready, isTimeless: true, getLatestAvailableDate });

    await waitFor(() => expect(store.getState().visualization.pendingLatestDate).toBe(false));
    expect(getLatestAvailableDate).toHaveBeenCalledTimes(1);
  });

  it('stays silent when the lookup fails: no error panel, no layer panel change', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { props, setShowLayerPanel } = renderComponent({
      ...ready,
      getLatestAvailableDate: jest.fn().mockRejectedValue(new Error('catalog down')),
    });

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(props.updateSelectedTime).not.toHaveBeenCalled();
    expect(store.getState().notification.panelError).toBeNull();
    expect(store.getState().visualization.error).toBeFalsy();
    expect(setShowLayerPanel).not.toHaveBeenCalled();
    expect(store.getState().visualization.pendingLatestDate).toBe(false);
    console.error.mockRestore();
  });

  it('stays silent and sets nothing when there is no image', async () => {
    const { props } = renderComponent({
      ...ready,
      getLatestAvailableDate: jest.fn().mockResolvedValue(undefined),
    });

    await waitFor(() => expect(store.getState().visualization.pendingLatestDate).toBe(false));
    expect(props.updateSelectedTime).not.toHaveBeenCalled();
    expect(store.getState().notification.panelError).toBeNull();
  });

  it('drops the result when the user picked another dataset while waiting', async () => {
    let resolveLookup;
    const getLatestAvailableDate = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveLookup = resolve;
        }),
    );
    const { props } = renderComponent({ ...ready, getLatestAvailableDate });

    await waitFor(() => expect(getLatestAvailableDate).toHaveBeenCalled());
    store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: 'S1_CDAS_IW_VVVH' }));
    resolveLookup(latest);

    await new Promise((r) => setTimeout(r, 0));
    expect(props.updateSelectedTime).not.toHaveBeenCalled();
  });

  it('drops the result when a date was set while waiting', async () => {
    let resolveLookup;
    const getLatestAvailableDate = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveLookup = resolve;
        }),
    );
    const { props } = renderComponent({ ...ready, getLatestAvailableDate });

    await waitFor(() => expect(getLatestAvailableDate).toHaveBeenCalled());
    store.dispatch(
      visualizationSlice.actions.setVisualizationTime({
        fromTime: null,
        toTime: moment.utc('2025-01-01T23:59:59Z'),
      }),
    );
    resolveLookup(latest);

    await new Promise((r) => setTimeout(r, 0));
    expect(props.updateSelectedTime).not.toHaveBeenCalled();
  });
});
