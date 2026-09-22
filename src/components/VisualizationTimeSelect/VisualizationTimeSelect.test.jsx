import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import moment from 'moment';

import { VisualizationTimeSelect } from './VisualizationTimeSelect';
import store from '../../store';
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
    clmsSelection: { selected: false },
    ...overrides,
  };

  render(
    <Provider store={store}>
      <VisualizationTimeSelect {...props} />
    </Provider>,
  );

  return { setShowLayerPanel };
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
});
