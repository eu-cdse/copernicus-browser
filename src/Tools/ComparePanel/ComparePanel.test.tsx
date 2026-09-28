import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import store, { compareLayersSlice } from '../../store';
import ComparePanel from './ComparePanel';

// The share panel content and each compared-layer row are not under test here; stub them so the
// test focuses on the Share button's enabled/disabled behaviour.
jest.mock('./ComparedLayer', () => () => null);
// The compare-mode dropdown (react-select) is not under test and doesn't render in jsdom.
jest.mock('react-select', () => () => null);
jest.mock(
  '../../components/SocialShare/SocialShare',
  () =>
    ({ displaySocialShareOptions }: { displaySocialShareOptions: boolean }) =>
      displaySocialShareOptions ? <div data-testid="social-share-open" /> : null,
);

const REGULAR_LAYER = { title: 'Regular layer' };
const EXTERNAL_WMS_LAYER = {
  title: 'External WMS layer',
  externalWms: { url: 'https://example.com/wms', layerName: 'l', time: null },
};

const addComparedLayers = (layers: Record<string, unknown>[]) =>
  act(() => {
    store.dispatch(compareLayersSlice.actions.addComparedLayers(layers));
  });

const renderPanel = () =>
  render(
    <Provider store={store}>
      <ComparePanel />
    </Provider>,
  );

const getShareButton = () => screen.getByText('Share');
const getShareWrapper = () => getShareButton().closest('.compare-panel-share-button-wrapper');

describe('ComparePanel Share button', () => {
  afterEach(() => {
    act(() => {
      store.dispatch(compareLayersSlice.actions.reset());
    });
  });

  it('disables Share with no explanatory tooltip when there are no compared layers', () => {
    renderPanel();

    expect(getShareButton()).toHaveClass('disabled');
    expect(getShareWrapper()).not.toHaveAttribute('title');
  });

  it('enables Share for regular (non-external-WMS) compared layers', () => {
    renderPanel();
    addComparedLayers([REGULAR_LAYER]);

    expect(getShareButton()).not.toHaveClass('disabled');
    expect(getShareWrapper()).not.toHaveAttribute('title');
  });

  it('enables Share for external WMS compared layers', () => {
    renderPanel();
    addComparedLayers([EXTERNAL_WMS_LAYER]);

    expect(getShareButton()).not.toHaveClass('disabled');
    expect(getShareWrapper()).not.toHaveAttribute('title');
  });
});
