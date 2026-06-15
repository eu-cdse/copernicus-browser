import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { clmsSlice } from '../../../store';
import CLMSCollectionSelection from './CLMSCollectionSelection';

jest.mock('./checkmark.svg?react', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getDataSourceHandler: jest.fn().mockReturnValue(null),
}));

// CLMSCollectionSelection dispatches directly to the `store` default-import rather
// than through the Provider's dispatch. To keep each test isolated we mock the
// module so that default-import accesses go through a getter that always returns
// the current test store created by makeStore().
let mockCurrentTestStore;
jest.mock('../../../store', () => {
  const actual = jest.requireActual('../../../store');
  return {
    __esModule: true, // must be explicit — not enumerable on the real module, so ...actual doesn't carry it
    ...actual,
    get default() {
      return mockCurrentTestStore;
    },
  };
});

const DATASOURCE = 'CLMS';
const DMP_300M_BASE_ID = 'COPERNICUS_CLMS_DMP_300M_10DAILY_RT0';
const DMP_300M_RT2_ID = 'COPERNICUS_CLMS_DMP_300M_10DAILY_RT2';
const DMP_300M_NODE_LABEL = 'clms_global_dmp_300m_v1_10daily_geotiff_RT0';
const DMP_PATH = 'Dry/Gross Dry Matter Productivity';

function makeStore(preloadedClmsState = {}) {
  const initialClmsState = clmsSlice.reducer(undefined, { type: '@@INIT' });
  mockCurrentTestStore = configureStore({
    reducer: { clms: clmsSlice.reducer },
    preloadedState: { clms: { ...initialClmsState, ...preloadedClmsState } },
  });
  return mockCurrentTestStore;
}

function renderComponent(props, preloadedClmsState = {}) {
  const store = makeStore(preloadedClmsState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <CLMSCollectionSelection {...props} />
      </Provider>,
    ),
  };
}

describe('CLMSCollectionSelection consolidation period filtering', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows only available consolidation periods when availableDatasets is restricted', () => {
    const { container } = renderComponent(
      { datasource: DATASOURCE, onSelect: jest.fn(), availableDatasets: [DMP_300M_RT2_ID] },
      { selectedPath: DMP_PATH, selectedCollection: DMP_300M_BASE_ID },
    );

    const cpWrapper = container.querySelector('.consolidation-period-wrapper');
    expect(cpWrapper).toBeInTheDocument();

    const cpButtons = cpWrapper.querySelectorAll('.collection-button.secondary.consolidation-period');
    expect(cpButtons).toHaveLength(1);
    expect(cpButtons[0]).toHaveTextContent('RT2');
  });

  test('auto-selects first available CP when dataset button is clicked', () => {
    const onSelect = jest.fn();
    const { store } = renderComponent(
      { datasource: DATASOURCE, onSelect, availableDatasets: [DMP_300M_RT2_ID] },
      { selectedPath: DMP_PATH },
    );

    fireEvent.click(screen.getByText(DMP_300M_NODE_LABEL));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({ datasource: DATASOURCE, dataset: DMP_300M_RT2_ID });
    expect(store.getState().clms.selectedConsolidationPeriodIndex).toBe(2);
  });

  test('clicking a CP button dispatches the full-array index', () => {
    const onSelect = jest.fn();
    const { container, store } = renderComponent(
      { datasource: DATASOURCE, onSelect, availableDatasets: [DMP_300M_RT2_ID] },
      { selectedPath: DMP_PATH, selectedCollection: DMP_300M_BASE_ID },
    );

    const cpButton = container.querySelector(
      '.consolidation-period-wrapper .collection-button.secondary.consolidation-period',
    );
    expect(cpButton).toBeInTheDocument();
    fireEvent.click(cpButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({ datasource: DATASOURCE, dataset: DMP_300M_RT2_ID });
    expect(store.getState().clms.selectedConsolidationPeriodIndex).toBe(2);
  });
});
