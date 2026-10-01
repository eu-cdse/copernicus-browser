import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

// Not under test here — stubbed so we can assert on the props WmsDateSelection computes for it
// (in particular `toTime`), without needing the real calendar/react-day-picker machinery to render.
jest.mock('../../components/VisualizationTimeSelect/VisualizationTimeSelect', () => ({
  VisualizationTimeSelect: jest.fn(() => null),
}));

import { useSelector, useDispatch } from 'react-redux';
import { VisualizationTimeSelect } from '../../components/VisualizationTimeSelect/VisualizationTimeSelect';
import { selectActiveExternalLayer } from '../../store/slices/externalLayersSlice';
import WmsDateSelection from './WmsDateSelection';

const mockedUseSelector = useSelector as unknown as jest.Mock;
const mockedUseDispatch = useDispatch as unknown as jest.Mock;
const mockedVisualizationTimeSelect = VisualizationTimeSelect as unknown as jest.Mock;

// Regression for #1280: some WMS servers advertise a non-ISO `time`/`timeDefault` value (e.g. the
// WMS-spec keyword "current", meaning "most recent time" — not a literal date). Before the fix this
// produced an Invalid moment that crashed the date picker when it was later formatted.
function mockActiveLayer(overrides: Partial<ReturnType<typeof selectActiveExternalLayer>> = {}) {
  mockedUseSelector.mockImplementation((selector: unknown) => {
    if (selector === selectActiveExternalLayer) {
      return {
        time: 'current',
        timeStart: '2020-01-01',
        timeEnd: '2024-06-01',
        timeDefault: '2024-06-01',
        timeRanges: null,
        ...overrides,
      };
    }
    // Any other selector call is for collapsiblePanel.datePanelExpanded.
    return false;
  });
}

describe('WmsDateSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDispatch.mockReturnValue(jest.fn());
  });

  it('does not throw and falls back toTime to maxDate when the active layer time is not a valid ISO date', () => {
    // moment.utc('current') logs its own noisy (expected) deprecation warning for the
    // non-ISO/RFC2822 input before the component's isValid() check discards the result.
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockActiveLayer();

    expect(() => render(<WmsDateSelection />)).not.toThrow();

    expect(mockedVisualizationTimeSelect).toHaveBeenCalledTimes(1);
    const props = mockedVisualizationTimeSelect.mock.calls[0][0];
    expect(props.maxDate.isValid()).toBe(true);
    expect(props.toTime.isValid()).toBe(true);
    expect(props.toTime.format('YYYY-MM-DD')).toBe(props.maxDate.format('YYYY-MM-DD'));
    warnSpy.mockRestore();
  });

  // Regression: a WMS forecast layer's extent (and thus its "current"-resolved timeDefault) can
  // reach days into the future — see MR !1264 review discussion on #1280. The calendar shouldn't
  // default to, or allow picking, a date that hasn't happened yet.
  it('clamps maxDate to today when the extent/time reaches into the future', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-30T09:00:00.000Z'));
    mockActiveLayer({
      time: undefined,
      timeStart: '2026-09-28T21:00:00.000Z',
      timeEnd: '2026-10-07T12:00:00.000Z',
      timeDefault: '2026-10-07T12:00:00.000Z',
    });

    render(<WmsDateSelection />);

    const props = mockedVisualizationTimeSelect.mock.calls[0][0];
    expect(props.maxDate.format('YYYY-MM-DD')).toBe('2026-09-30');
    // toTime (the initially selected/displayed date) must not leak the future timeDefault either.
    expect(props.toTime.format('YYYY-MM-DD')).toBe('2026-09-30');

    jest.useRealTimers();
  });

  // Regression: a WMS extent's timeStart/timeEnd are precise timestamps (e.g.
  // "2026-09-28T21:00:00.000Z"), not midnight. The calendar/available-day search compares whole-day
  // markers against minDate/maxDate, so an un-floored minDate excludes the very day the extent
  // starts on — the prev arrow then can't reach it (see externalLayers.utils.test.ts for the full
  // getNextBestDate repro). minDate/maxDate must be floored/ceiled to day boundaries.
  it('floors minDate and ceils maxDate to day boundaries', () => {
    mockActiveLayer({
      time: '2026-09-29T12:00:00.000Z',
      timeStart: '2026-09-28T21:00:00.000Z',
      timeEnd: '2020-01-01T03:00:00.000Z', // in the past, so the future-date cap doesn't interfere
      timeDefault: '2026-09-29T12:00:00.000Z',
    });

    render(<WmsDateSelection />);

    const props = mockedVisualizationTimeSelect.mock.calls[0][0];
    expect(props.minDate.format('YYYY-MM-DD HH:mm:ss')).toBe('2026-09-28 00:00:00');
    expect(props.maxDate.format('YYYY-MM-DD HH:mm:ss')).toBe('2020-01-01 23:59:59');
  });
});
