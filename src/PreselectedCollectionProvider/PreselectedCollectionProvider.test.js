import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import PreselectedCollectionProvider, { getPreselectedDatasetId } from './PreselectedCollectionProvider';
import {
  getAllAvailableCollections,
  getDataSourceHandler,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { S2_L2A_CDAS, S2_L1C_CDAS } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { visualizationSlice, notificationSlice, collapsiblePanelSlice } from '../store';

let mockCurrentTestStore;
jest.mock('../store', () => {
  const actual = jest.requireActual('../store');
  return {
    __esModule: true,
    ...actual,
    get default() {
      return mockCurrentTestStore;
    },
  };
});

jest.mock('../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getAllAvailableCollections: jest.fn(),
  getDataSourceHandler: jest.fn(),
}));

describe('getPreselectedDatasetId', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prefers S2_L2A_CDAS when available, regardless of the fallback flag', () => {
    getAllAvailableCollections.mockReturnValue(['SOME_OTHER_DATASET', S2_L2A_CDAS]);

    expect(getPreselectedDatasetId(false)).toBe(S2_L2A_CDAS);
  });

  it('falls back to S2_L1C_CDAS when S2_L2A_CDAS is not available', () => {
    getAllAvailableCollections.mockReturnValue(['SOME_OTHER_DATASET', S2_L1C_CDAS]);

    expect(getPreselectedDatasetId(false)).toBe(S2_L1C_CDAS);
  });

  it('does not fall back to an arbitrary collection when allowAnyCollectionFallback is false', () => {
    getAllAvailableCollections.mockReturnValue(['SOME_OTHER_DATASET']);

    expect(getPreselectedDatasetId(false)).toBeUndefined();
  });

  it('falls back to the first available collection when allowAnyCollectionFallback is true', () => {
    getAllAvailableCollections.mockReturnValue(['SOME_OTHER_DATASET']);

    expect(getPreselectedDatasetId(true)).toBe('SOME_OTHER_DATASET');
  });

  it('defaults allowAnyCollectionFallback to true when not provided', () => {
    getAllAvailableCollections.mockReturnValue(['SOME_OTHER_DATASET']);

    expect(getPreselectedDatasetId()).toBe('SOME_OTHER_DATASET');
  });
});

describe('PreselectedCollectionProvider (connected component)', () => {
  const INVALID_DATASET_ID = 'INVALID_DATASET_ID';

  function makeStore(preloadedThemesState = {}) {
    mockCurrentTestStore = configureStore({
      reducer: {
        visualization: visualizationSlice.reducer,
        notification: notificationSlice.reducer,
        collapsiblePanel: collapsiblePanelSlice.reducer,
        themes: (
          state = {
            selectedThemeId: 'theme1',
            dataSourcesInitialized: true,
            dataSourcesReadyVersion: 1,
            ...preloadedThemesState,
          },
        ) => state,
      },
    });
    return mockCurrentTestStore;
  }

  function renderProvider(store) {
    return render(
      <Provider store={store}>
        <PreselectedCollectionProvider>
          <div>children</div>
        </PreselectedCollectionProvider>
      </Provider>,
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('recovers to a safe dataset when datasetId is invalid', async () => {
    getDataSourceHandler.mockImplementation((id) => (id === S2_L2A_CDAS ? { some: 'handler' } : undefined));
    getAllAvailableCollections.mockReturnValue([S2_L2A_CDAS]);

    const store = makeStore();
    store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: INVALID_DATASET_ID }));
    store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(false));

    renderProvider(store);

    await waitFor(() => {
      expect(store.getState().visualization.datasetId).toBe(S2_L2A_CDAS);
    });

    expect(store.getState().notification.type).toBe('error');
    expect(store.getState().notification.msg).toBe('Selected dataset does not exist!');
    expect(store.getState().collapsiblePanel.collectionPanelExpanded).toBe(true);
  });

  it('does not reset anything when datasetId is valid', async () => {
    getDataSourceHandler.mockImplementation((id) =>
      id === 'VALID_DATASET_ID' ? { some: 'handler' } : undefined,
    );
    getAllAvailableCollections.mockReturnValue([S2_L2A_CDAS]);

    const store = makeStore();
    store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: 'VALID_DATASET_ID' }));
    store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(false));

    renderProvider(store);

    await waitFor(() => {
      expect(getDataSourceHandler).toHaveBeenCalledWith('VALID_DATASET_ID');
    });

    expect(store.getState().visualization.datasetId).toBe('VALID_DATASET_ID');
    expect(store.getState().notification.type).toBeNull();
    expect(store.getState().notification.msg).toBeNull();
    expect(store.getState().collapsiblePanel.collectionPanelExpanded).toBe(false);
  });

  it('fires the error but keeps the invalid datasetId when there is no fallback available', async () => {
    getDataSourceHandler.mockReturnValue(undefined);
    getAllAvailableCollections.mockReturnValue([]);

    const store = makeStore();
    store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: INVALID_DATASET_ID }));

    renderProvider(store);

    await waitFor(() => {
      expect(store.getState().notification.msg).toBe('Selected dataset does not exist!');
    });

    expect(store.getState().visualization.datasetId).toBe(INVALID_DATASET_ID);
  });
});
