import moment from 'moment';

import { visualizationSlice } from './visualizationSlice';

const { reducer, actions } = visualizationSlice;

describe('visualizationSlice pendingLatestDate', () => {
  const initial = reducer(undefined, { type: '@@INIT' });

  it('is false initially', () => {
    expect(initial.pendingLatestDate).toBe(false);
  });

  it('is set by setPendingLatestDate and setVisualizationParams', () => {
    expect(reducer(initial, actions.setPendingLatestDate(true)).pendingLatestDate).toBe(true);
    expect(
      reducer(initial, actions.setVisualizationParams({ pendingLatestDate: true })).pendingLatestDate,
    ).toBe(true);
  });

  it('is left unchanged by setVisualizationParams when not given', () => {
    const pending = reducer(initial, actions.setPendingLatestDate(true));
    expect(reducer(pending, actions.setVisualizationParams({ layerId: 'X' })).pendingLatestDate).toBe(true);
  });

  it('is cleared when a date is set, so a manual choice cancels a pending lookup', () => {
    const pending = reducer(initial, actions.setPendingLatestDate(true));
    const toTime = moment.utc('2026-10-10T23:59:59.999Z');

    const next = reducer(pending, actions.setVisualizationTime({ fromTime: null, toTime }));

    expect(next.pendingLatestDate).toBe(false);
    expect(next.toTime).toBe(toTime);
  });

  it('is cleared when the dataset changes', () => {
    const pending = reducer(initial, actions.setPendingLatestDate(true));
    expect(
      reducer(pending, actions.setNewDatasetId({ datasetId: 'S1_CDAS_IW_VVVH' })).pendingLatestDate,
    ).toBe(false);
  });

  it('is cleared by reset', () => {
    const pending = reducer(initial, actions.setPendingLatestDate(true));
    expect(reducer(pending, actions.reset()).pendingLatestDate).toBe(false);
  });
});
