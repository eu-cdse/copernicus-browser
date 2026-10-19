import moment from 'moment';

import {
  canFindLatestDate,
  getFromTime,
  isLatestDateParam,
  resolveUrlTimes,
  shouldLookUpLatestDate,
} from './VisualizationTimeSelect.utils';

describe('getFromTime', () => {
  const date = moment.utc('2026-10-10T15:30:00Z');

  it('returns the start of the day for a single date', () => {
    expect(getFromTime(date).toISOString()).toBe('2026-10-10T00:00:00.000Z');
  });

  it('goes back 6 months for a mosaic', () => {
    expect(getFromTime(date, null, false, true).toISOString()).toBe('2026-04-10T00:00:00.000Z');
  });

  it('does not go earlier than minDate', () => {
    const minDate = moment.utc('2026-09-01T00:00:00Z');
    expect(getFromTime(date, minDate, false, true).toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });
});

describe('canFindLatestDate', () => {
  const notClms = { selected: false };

  it.each([
    [true, false, notClms, true],
    [false, false, notClms, false],
    [true, true, notClms, false],
    [true, false, { selected: true, selectedCollection: 'COPERNICUS_CLMS_FOO' }, true],
    [true, false, { selected: true, selectedCollection: null }, false],
    [undefined, false, notClms, false],
  ])('isZoomLevelOk=%s isTimeless=%s clms=%j -> %s', (isZoomLevelOk, isTimeless, clmsSelection, expected) => {
    expect(canFindLatestDate({ isZoomLevelOk, isTimeless, clmsSelection })).toBe(expected);
  });
});

describe('shouldLookUpLatestDate', () => {
  const base = {
    date: undefined,
    datasetId: 'S2_L2A_CDAS',
    toTime: null,
    dateMode: undefined,
    fromTime: null,
    compareShare: undefined,
    compareSharedPinsId: undefined,
    timelapse: undefined,
    panel: undefined,
  };
  const toTime = moment.utc('2026-10-10T23:59:59.999Z');

  it('looks up the latest date when a dataset is given without a date', () => {
    expect(shouldLookUpLatestDate(base)).toBe(true);
  });

  it('does not look it up when the URL has a date', () => {
    expect(shouldLookUpLatestDate({ ...base, toTime })).toBe(false);
  });

  it('looks it up for date=latest, even when the URL also has a date', () => {
    expect(shouldLookUpLatestDate({ ...base, date: 'latest', toTime })).toBe(true);
  });

  it('ignores other values of date', () => {
    expect(shouldLookUpLatestDate({ ...base, date: 'yesterday', toTime })).toBe(false);
  });

  it('never looks it up without a dataset, also for date=latest (plain visits are unchanged)', () => {
    expect(shouldLookUpLatestDate({ ...base, datasetId: undefined })).toBe(false);
    expect(shouldLookUpLatestDate({ ...base, datasetId: undefined, date: 'latest' })).toBe(false);
  });

  it.each([
    ['compareShare', { compareShare: 'true' }],
    ['compareSharedPinsId', { compareSharedPinsId: 'abc' }],
    ['timelapse', { timelapse: '{}' }],
    ['panel=pins', { panel: 'pins' }],
    ['panel=wms', { panel: 'wms' }],
  ])('does not look it up for a %s restore', (_name, extra) => {
    expect(shouldLookUpLatestDate({ ...base, ...extra })).toBe(false);
    expect(shouldLookUpLatestDate({ ...base, ...extra, date: 'latest' })).toBe(false);
  });

  it('still looks it up with panel=layers or panel=highlights', () => {
    expect(shouldLookUpLatestDate({ ...base, panel: 'layers' })).toBe(true);
    expect(shouldLookUpLatestDate({ ...base, panel: 'highlights' })).toBe(true);
  });

  it('looks it up for SINGLE and MOSAIC without dates', () => {
    expect(shouldLookUpLatestDate({ ...base, dateMode: 'SINGLE' })).toBe(true);
    expect(shouldLookUpLatestDate({ ...base, dateMode: 'MOSAIC' })).toBe(true);
  });

  it('leaves a TIME RANGE without dates, or with only a start date, alone', () => {
    expect(shouldLookUpLatestDate({ ...base, dateMode: 'TIME RANGE' })).toBe(false);
    expect(
      shouldLookUpLatestDate({
        ...base,
        dateMode: 'TIME RANGE',
        fromTime: moment.utc('2026-01-01T00:00:00Z'),
      }),
    ).toBe(false);
  });

  it('looks it up for date=latest even in TIME RANGE mode', () => {
    expect(shouldLookUpLatestDate({ ...base, dateMode: 'TIME RANGE', date: 'latest' })).toBe(true);
  });
});

describe('isLatestDateParam', () => {
  it.each(['latest', 'LATEST', 'Latest'])('accepts %s', (value) => {
    expect(isLatestDateParam(value)).toBe(true);
  });

  it.each([undefined, null, '', 'yesterday', 'latest ', 5, true])('rejects %j', (value) => {
    expect(isLatestDateParam(value)).toBe(false);
  });

  it('is what makes date=LATEST ask for the latest image', () => {
    expect(
      shouldLookUpLatestDate({
        date: 'LATEST',
        datasetId: 'S2_L2A_CDAS',
        toTime: moment.utc('2026-10-10T23:59:59Z'),
        dateMode: undefined,
        fromTime: null,
        compareShare: undefined,
        compareSharedPinsId: undefined,
        timelapse: undefined,
        panel: undefined,
      }),
    ).toBe(true);
  });
});

// The date part of URLParamsParser.setStore, which has no test of its own. The 180-day clamp is
// documented in public/deep-linking.txt, and an edit to this code once silently removed it.
describe('resolveUrlTimes', () => {
  const base = {
    date: undefined,
    fromTime: undefined,
    toTime: undefined,
    dateMode: undefined,
    datasetId: 'S2_L2A_CDAS',
    compareShare: undefined,
    compareSharedPinsId: undefined,
    timelapse: undefined,
    panel: undefined,
    maxRangeDays: 180,
  };
  const iso = (m) => (m ? m.toISOString() : m);

  it('parses fromTime and toTime as UTC', () => {
    const r = resolveUrlTimes({
      ...base,
      fromTime: '2026-01-01T00:00:00.000Z',
      toTime: '2026-01-03T23:59:59.999Z',
    });

    expect(iso(r.fromTime)).toBe('2026-01-01T00:00:00.000Z');
    expect(iso(r.toTime)).toBe('2026-01-03T23:59:59.999Z');
    expect(r.pendingLatestDate).toBe(false);
  });

  it('returns null times when the URL has none', () => {
    const r = resolveUrlTimes({ ...base, datasetId: undefined });

    expect(r.fromTime).toBeNull();
    expect(r.toTime).toBeNull();
    expect(r.pendingLatestDate).toBe(false);
  });

  describe('180-day clamp', () => {
    const range = { dateMode: 'TIME RANGE', toTime: '2026-06-29T23:59:59.999Z' };

    it('moves fromTime to 180 days before toTime when a TIME RANGE is longer', () => {
      const r = resolveUrlTimes({ ...base, ...range, fromTime: '2025-01-01T00:00:00.000Z' });

      // start of the day 180 days before toTime, the same as URLParamsParser did before this helper
      expect(iso(r.fromTime)).toBe('2025-12-31T00:00:00.000Z');
      expect(iso(r.toTime)).toBe('2026-06-29T23:59:59.999Z');
    });

    it('keeps a TIME RANGE of exactly the limit or shorter', () => {
      const exactly = resolveUrlTimes({ ...base, ...range, fromTime: '2026-01-01T00:00:00.000Z' });
      expect(iso(exactly.fromTime)).toBe('2026-01-01T00:00:00.000Z');

      const shorter = resolveUrlTimes({ ...base, ...range, fromTime: '2026-05-01T00:00:00.000Z' });
      expect(iso(shorter.fromTime)).toBe('2026-05-01T00:00:00.000Z');
    });

    it('only clamps in TIME RANGE mode', () => {
      const r = resolveUrlTimes({
        ...base,
        dateMode: 'SINGLE',
        fromTime: '2020-01-01T00:00:00.000Z',
        toTime: '2026-06-29T23:59:59.999Z',
      });

      expect(iso(r.fromTime)).toBe('2020-01-01T00:00:00.000Z');
    });

    it('uses the maxRangeDays it is given', () => {
      const r = resolveUrlTimes({
        ...base,
        ...range,
        fromTime: '2026-05-01T00:00:00.000Z',
        maxRangeDays: 30,
      });

      expect(iso(r.fromTime)).toBe('2026-05-30T00:00:00.000Z');
    });
  });

  describe('date=latest', () => {
    const dated = { fromTime: '2026-01-01T00:00:00.000Z', toTime: '2026-01-03T23:59:59.999Z' };

    it('drops the URL dates and asks for a lookup when a dataset is given', () => {
      const r = resolveUrlTimes({ ...base, ...dated, date: 'latest' });

      expect(r.fromTime).toBeNull();
      expect(r.toTime).toBeNull();
      expect(r.pendingLatestDate).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(resolveUrlTimes({ ...base, ...dated, date: 'LATEST' }).pendingLatestDate).toBe(true);
    });

    it.each([
      ['no dataset', { datasetId: undefined }],
      ['a compare restore', { compareShare: 'true' }],
      ['a timelapse restore', { timelapse: '{}' }],
      ['the pins panel', { panel: 'pins' }],
    ])('keeps the URL dates and does no lookup for %s', (_name, extra) => {
      const r = resolveUrlTimes({ ...base, ...dated, date: 'latest', ...extra });

      expect(iso(r.fromTime)).toBe('2026-01-01T00:00:00.000Z');
      expect(iso(r.toTime)).toBe('2026-01-03T23:59:59.999Z');
      expect(r.pendingLatestDate).toBe(false);
    });

    it('does not touch the dates of a link without date=latest', () => {
      const r = resolveUrlTimes({ ...base, ...dated });

      expect(iso(r.toTime)).toBe('2026-01-03T23:59:59.999Z');
      expect(r.pendingLatestDate).toBe(false);
    });
  });

  it('asks for a lookup for a dataset without any date', () => {
    expect(resolveUrlTimes(base).pendingLatestDate).toBe(true);
  });
});
