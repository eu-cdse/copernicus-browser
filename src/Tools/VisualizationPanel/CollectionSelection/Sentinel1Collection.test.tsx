import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';

import Sentinel1Collection from './Sentinel1Collection';

jest.mock('./checkmark.svg?react', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./CollectionTooltip/CollectionTooltip', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('./MultipleSelection', () => ({
  MultipleSelection: () => null,
}));

jest.mock('../../../api/OData/assets/tooltips', () => ({
  AttributeTooltips: {
    S1: {
      swathIdentifier: () => null,
      polarisationChannels: () => null,
      orbitDirection: () => null,
    },
  },
}));

jest.mock('../../../api/OData/assets/attributes', () => ({
  AttributeNames: {
    swathIdentifier: 'swathIdentifier',
    polarisationChannels: 'polarisationChannels',
    orbitDirection: 'orbitDirection',
  },
  AttributeConsolidationPeriodValues: {
    RT0: { value: 0, label: 'RT0' },
    RT1: { value: 1, label: 'RT1' },
    RT2: { value: 2, label: 'RT2' },
    RT5: { value: 5, label: 'RT5' },
    RT6: { value: 6, label: 'RT6' },
  },
}));

jest.mock('../../SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler', () => ({
  S1_OBSERVATION_SCENARIOS: {
    ACQUISITION_MODES: {
      SM: 'SM - Stripmap Mode 3.5m x 3.5m',
      IW: 'IW - Interferometric Wide Swath 10m x 10m',
      EW: 'EW - Extra-Wide Swath 40m x 40m',
    },
    POLARIZATIONS: {
      SM: { VV: 'VV', VVVH: 'VV+VH', HH: 'HH', HHHV: 'HH+HV' },
      IW: { VV: 'VV', VVVH: 'VV+VH', HH: 'HH', HHHV: 'HH+HV' },
      EW: { HH: 'HH', HHHV: 'HH+HV', VV: 'VV', VVVH: 'VV+VH' },
    },
    ORBIT_DIRECTIONS: {
      ASCENDING: 'Ascending',
      DESCENDING: 'Descending',
    },
  },
}));

jest.mock('../../SearchPanel/dataSourceHandlers/dataSourceConstants', () => ({
  S1: 'S1',
  ASCENDING: 'ASCENDING',
  DESCENDING: 'DESCENDING',
  S1_CDAS_SM_VVVH: 'S1_CDAS_SM_VVVH',
  S1_CDAS_IW_VVVH: 'S1_CDAS_IW_VVVH',
  S1_CDAS_EW_HHHV: 'S1_CDAS_EW_HHHV',
}));

const visualizationSlice = createSlice({
  name: 'visualization',
  initialState: { orbitDirection: undefined as string | undefined },
  reducers: {},
});

let mockCurrentTestStore: ReturnType<typeof configureStore> | undefined;
jest.mock('../../../store', () => {
  const { createSlice: cs, configureStore: cfg } = jest.requireActual('@reduxjs/toolkit');
  const slice = cs({
    name: 'visualization',
    initialState: { orbitDirection: undefined },
    reducers: {},
  });
  const store = cfg({ reducer: { visualization: slice.reducer } });
  return {
    __esModule: true,
    visualizationSlice: slice,
    get default() {
      return mockCurrentTestStore ?? store;
    },
  };
});

function makeStore(orbitDirection?: string) {
  mockCurrentTestStore = configureStore({
    reducer: { visualization: visualizationSlice.reducer },
    preloadedState: { visualization: { orbitDirection } },
  });
  return mockCurrentTestStore;
}

interface ComponentProps {
  datasource: string;
  onSelect: jest.Mock;
  selectedCollection: { dataset: string };
  availableDatasets?: string[];
}

function renderComponent(props: ComponentProps, orbitDirection?: string) {
  const store = makeStore(orbitDirection);
  return {
    store,
    ...render(
      <Provider store={store}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Sentinel1Collection {...(props as any)} />
      </Provider>,
    ),
  };
}

const DEFAULT_PROPS: ComponentProps = {
  datasource: 'S1',
  onSelect: jest.fn(),
  selectedCollection: { dataset: 'S1_CDAS_IW_VVVH' },
};

describe('Sentinel1Collection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('no availableDatasets prop – all buttons rendered', () => {
    test('renders all 3 acquisition mode buttons when availableDatasets is omitted', () => {
      renderComponent({ ...DEFAULT_PROPS });

      expect(screen.getByTitle(/SM/i)).toBeInTheDocument();
      expect(screen.getByTitle(/IW/i)).toBeInTheDocument();
      expect(screen.getByTitle(/EW/i)).toBeInTheDocument();
    });

    test('renders all polarization buttons for the selected acquisition mode', () => {
      renderComponent({ ...DEFAULT_PROPS, selectedCollection: { dataset: 'S1_CDAS_IW_VVVH' } });

      expect(screen.getByTitle('VV')).toBeInTheDocument();
      expect(screen.getByTitle('VV+VH')).toBeInTheDocument();
      expect(screen.getByTitle('HH')).toBeInTheDocument();
      expect(screen.getByTitle('HH+HV')).toBeInTheDocument();
    });
  });

  describe('filtered by availableDatasets', () => {
    test('shows only IW mode when availableDatasets contains only an IW dataset', () => {
      renderComponent({
        ...DEFAULT_PROPS,
        selectedCollection: { dataset: 'S1_CDAS_IW_HHHV' },
        availableDatasets: ['S1_CDAS_IW_HHHV'],
      });

      expect(screen.getByTitle(/IW/i)).toBeInTheDocument();
      expect(screen.queryByTitle(/SM/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/EW/i)).not.toBeInTheDocument();
    });

    test('shows only HH+HV polarization when availableDatasets is [S1_CDAS_IW_HHHV]', () => {
      renderComponent({
        ...DEFAULT_PROPS,
        selectedCollection: { dataset: 'S1_CDAS_IW_HHHV' },
        availableDatasets: ['S1_CDAS_IW_HHHV'],
      });

      expect(screen.getByTitle('HH+HV')).toBeInTheDocument();
      expect(screen.queryByTitle('VV')).not.toBeInTheDocument();
      expect(screen.queryByTitle('VV+VH')).not.toBeInTheDocument();
      expect(screen.queryByTitle('HH')).not.toBeInTheDocument();
    });
  });

  describe('multiple datasets in availableDatasets', () => {
    test('shows both HH+HV and VV+VH polarizations when both IW datasets are available', () => {
      renderComponent({
        ...DEFAULT_PROPS,
        selectedCollection: { dataset: 'S1_CDAS_IW_HHHV' },
        availableDatasets: ['S1_CDAS_IW_HHHV', 'S1_CDAS_IW_VVVH'],
      });

      expect(screen.getByTitle('HH+HV')).toBeInTheDocument();
      expect(screen.getByTitle('VV+VH')).toBeInTheDocument();
    });

    test('does not render SM or EW mode buttons when only IW datasets are available', () => {
      renderComponent({
        ...DEFAULT_PROPS,
        selectedCollection: { dataset: 'S1_CDAS_IW_HHHV' },
        availableDatasets: ['S1_CDAS_IW_HHHV', 'S1_CDAS_IW_VVVH'],
      });

      expect(screen.queryByTitle(/SM/i)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/EW/i)).not.toBeInTheDocument();
    });
  });

  describe('mode switching', () => {
    test('calls onSelect with hardcoded default polarization when switching mode without availableDatasets', () => {
      const onSelect = jest.fn();
      renderComponent({ ...DEFAULT_PROPS, onSelect, selectedCollection: { dataset: 'S1_CDAS_IW_VVVH' } });

      fireEvent.click(screen.getByTitle(/EW/i));

      expect(onSelect).toHaveBeenCalledWith({ datasource: 'S1', dataset: 'S1_CDAS_EW_HHHV' }, undefined);
    });

    test('calls onSelect with first supported polarization when switching mode with availableDatasets', () => {
      const onSelect = jest.fn();
      renderComponent({
        ...DEFAULT_PROPS,
        onSelect,
        selectedCollection: { dataset: 'S1_CDAS_IW_HHHV' },
        availableDatasets: ['S1_CDAS_IW_HHHV', 'S1_CDAS_EW_HHHV'],
      });

      fireEvent.click(screen.getByTitle(/EW/i));

      expect(onSelect).toHaveBeenCalledWith({ datasource: 'S1', dataset: 'S1_CDAS_EW_HHHV' }, undefined);
    });

    test('falls back to first available polarization when hardcoded default is not in availableDatasets', () => {
      const onSelect = jest.fn();
      // Only IW+VV is available; the IW hardcoded default (VVVH) is absent
      renderComponent({
        ...DEFAULT_PROPS,
        onSelect,
        selectedCollection: { dataset: 'S1_CDAS_SM_VVVH' },
        availableDatasets: ['S1_CDAS_SM_VVVH', 'S1_CDAS_IW_VV'],
      });

      fireEvent.click(screen.getByTitle(/IW/i));

      expect(onSelect).toHaveBeenCalledWith({ datasource: 'S1', dataset: 'S1_CDAS_IW_VV' }, undefined);
    });
  });
});
