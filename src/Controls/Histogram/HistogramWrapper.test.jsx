import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import store, { tabsSlice, visualizationSlice, themesSlice } from '../../store';
import { TABS } from '../../const';
import HistogramWrapper from './HistogramWrapper';

// The modal's own content isn't under test here; stub it so we can just assert on its
// presence/absence in the DOM once it's portaled into the histogramContainer.
jest.mock('./HistogramModal', () => () => <div data-testid="histogram-modal" />);

// Index-output checking normally hits the SH APIs; resolve it as present so the gating tests focus
// purely on the isVisualizingLayer / WMS / tab checks in checkIfEnabled().
jest.mock('./Histogram.utils', () => ({
  checkIfIndexOutputPresent: jest.fn().mockResolvedValue(true),
  getMissingIndexOutputError: jest.fn(() => 'missing index output'),
  getNoIndexLayerOutputError: jest.fn(() => 'no index layer output'),
}));

// Stub the data source handler lookup so the layer under test is always treated as supporting the
// v3 evalscript (i.e. not blocked by the "Histogram not available for <dataset>" branch).
jest.mock('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  ...jest.requireActual('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers'),
  getDataSourceHandler: jest.fn(() => ({ supportsV3Evalscript: () => true })),
}));

const DATASET_ID = 'TEST_DATASET';
const LAYER_ID = 'TEST_LAYER';

const setVisualizingAndSelectedLayer = () =>
  act(() => {
    store.dispatch(themesSlice.actions.setDataSourcesInitialized(true));
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));
    store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: DATASET_ID }));
    store.dispatch(visualizationSlice.actions.setLayerId(LAYER_ID));
    store.dispatch(tabsSlice.actions.setIsVisualizingLayer(true));
  });

const renderWrapper = (histogramContainer) =>
  render(
    <Provider store={store}>
      <HistogramWrapper histogramContainer={histogramContainer} />
    </Provider>,
  );

const getButton = () => document.querySelector('.histogram-button');
const getButtonWrapper = () => document.querySelector('.histogram-button-wrapper');

describe('HistogramWrapper', () => {
  afterEach(() => {
    act(() => {
      store.dispatch(visualizationSlice.actions.reset());
      store.dispatch(tabsSlice.actions.setIsVisualizingLayer(false));
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));
      store.dispatch(themesSlice.actions.setDataSourcesInitialized(false));
    });
  });

  it('enables the histogram button when visualizing a layer on the Visualize tab', async () => {
    setVisualizingAndSelectedLayer();
    renderWrapper(document.createElement('div'));

    await waitFor(() => {
      expect(getButton()).not.toHaveClass('disabled');
    });
  });

  it('disables the histogram button and shows a tooltip when isVisualizingLayer becomes false', async () => {
    setVisualizingAndSelectedLayer();
    renderWrapper(document.createElement('div'));

    await waitFor(() => {
      expect(getButton()).not.toHaveClass('disabled');
    });

    act(() => {
      store.dispatch(tabsSlice.actions.setIsVisualizingLayer(false));
    });

    await waitFor(() => {
      expect(getButton()).toHaveClass('disabled');
    });
    expect(getButtonWrapper().getAttribute('title')).toEqual(
      expect.stringContaining('Histogram is not available in this panel.'),
    );
  });

  it('re-enables the histogram button once isVisualizingLayer becomes true again', async () => {
    setVisualizingAndSelectedLayer();
    renderWrapper(document.createElement('div'));

    await waitFor(() => {
      expect(getButton()).not.toHaveClass('disabled');
    });

    act(() => {
      store.dispatch(tabsSlice.actions.setIsVisualizingLayer(false));
    });
    await waitFor(() => {
      expect(getButton()).toHaveClass('disabled');
    });

    act(() => {
      store.dispatch(tabsSlice.actions.setIsVisualizingLayer(true));
    });
    await waitFor(() => {
      expect(getButton()).not.toHaveClass('disabled');
    });
  });

  it('force-closes an open histogram modal when the tool becomes disabled mid-session', async () => {
    setVisualizingAndSelectedLayer();
    // The portal target must be attached to the document for the portaled modal to be queryable
    // via `screen`.
    const histogramContainer = document.createElement('div');
    document.body.appendChild(histogramContainer);
    renderWrapper(histogramContainer);

    await waitFor(() => {
      expect(getButton()).not.toHaveClass('disabled');
    });

    fireEvent.click(getButton());
    await waitFor(() => {
      expect(screen.getByTestId('histogram-modal')).toBeInTheDocument();
    });

    act(() => {
      store.dispatch(tabsSlice.actions.setIsVisualizingLayer(false));
    });

    await waitFor(() => {
      expect(screen.queryByTestId('histogram-modal')).not.toBeInTheDocument();
    });
  });
});
