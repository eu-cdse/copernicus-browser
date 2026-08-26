import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import store, { authSlice, mainMapSlice } from '../../../../../store';
import { MetadataSourceType } from '../../../rapidResponseProperties';
import ResultsCard from './ResultsCard';

// isInGroup reads a Keycloak instance singleton that isn't set up in tests; force the RRD-user
// branch on so the eye icon (the thing under test) always renders.
jest.mock('../../../../../Auth/authHelpers', () => ({
  isInGroup: () => true,
}));

// addToCart/removeFromCart are only invoked on button click, but the module must not throw on
// import.
jest.mock('../../../../../api/RRD/RRDApi', () => ({
  rrdApi: {
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    search: jest.fn(),
    getCollections: jest.fn(),
    getCart: jest.fn(),
    getProfile: jest.fn(),
  },
}));

// Keep hasQuicklookAsset/getQuicklookAsset as their real implementations (the component imports
// them directly from this module); only fetchPreviewImage/fetchThumbnailImage are mocked so each
// test can fully control what the async image-loading effect resolves to.
jest.mock('./results.utils', () => ({
  ...jest.requireActual('./results.utils'),
  fetchPreviewImage: jest.fn(),
  fetchThumbnailImage: jest.fn(),
}));

import { fetchPreviewImage, fetchThumbnailImage } from './results.utils';

const buildItem = ({ internalId, assets = {}, bbox = [0, 0, 1, 1] }) => ({
  _internalId: internalId,
  id: `item-${internalId}`,
  properties: {
    constellation: 'S1',
    instrument: 'SAR',
    datetime: '2024-01-01T00:00:00Z',
    metadata_source: MetadataSourceType.CCMES,
    platform: 'S1A',
  },
  assets,
  bbox,
});

const renderCard = (item, onImageLoad = jest.fn()) =>
  render(
    <Provider store={store}>
      <ResultsCard item={item} onImageLoad={onImageLoad} />
    </Provider>,
  );

const getEyeIcon = () => document.querySelector('.zoom-info .fa-eye, .zoom-info .fa-eye-slash');

describe('ResultsCard - quicklook on map eye icon', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(
        authSlice.actions.setUser({
          userdata: {},
          access_token: 'test-token',
          token_expiration: Date.now() + 100000,
        }),
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => {
      store.dispatch(authSlice.actions.resetUser());
      store.dispatch(mainMapSlice.actions.clearQuicklookOverlays());
    });
  });

  it('enables the eye icon (no disabled class, "Show quicklook on map" title) when the preview is a real quicklook', async () => {
    fetchPreviewImage.mockResolvedValueOnce({ url: 'blob:x', isFallback: false });
    const item = buildItem({
      internalId: 'card-real-quicklook',
      assets: { 'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' } },
    });

    renderCard(item);

    await waitFor(() => {
      expect(getEyeIcon()).not.toBeNull();
      expect(getEyeIcon()).not.toHaveClass('disabled');
    });
    expect(getEyeIcon().getAttribute('title')).toBe('Show quicklook on map');
  });

  it('disables the eye icon (disabled class, "No quicklook available for this item" title) when the preview is a fallback logo', async () => {
    fetchPreviewImage.mockResolvedValueOnce({ url: 'logo.png', isFallback: true });
    const item = buildItem({
      internalId: 'card-fallback-logo',
      assets: { 'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' } },
    });

    renderCard(item);

    await waitFor(() => {
      expect(getEyeIcon()).toHaveClass('disabled');
    });
    expect(getEyeIcon().getAttribute('title')).toBe('No quicklook available for this item');
  });

  it('disables the eye icon for a thumbnail-only item (no quicklook-png/quicklook asset)', async () => {
    fetchThumbnailImage.mockResolvedValueOnce({ url: 'thumb.png', isFallback: false });
    const item = buildItem({
      internalId: 'card-thumbnail-only',
      assets: { thumbnail: { href: 'https://example.com/thumb.png', type: 'image/png' } },
    });

    renderCard(item);

    await waitFor(() => {
      expect(getEyeIcon()).toHaveClass('disabled');
    });
    expect(getEyeIcon().getAttribute('title')).toBe('No quicklook available for this item');
  });

  it('enables the eye icon for an item with both a thumbnail and a valid quicklook asset', async () => {
    fetchThumbnailImage.mockResolvedValueOnce({ url: 'thumb.png', isFallback: false });
    fetchPreviewImage.mockResolvedValueOnce({ url: 'blob:x', isFallback: false });
    const item = buildItem({
      internalId: 'card-thumbnail-and-quicklook',
      assets: {
        thumbnail: { href: 'https://example.com/thumb.png', type: 'image/png' },
        'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' },
      },
    });

    renderCard(item);

    await waitFor(() => {
      expect(getEyeIcon()).not.toHaveClass('disabled');
    });
    expect(getEyeIcon().getAttribute('title')).toBe('Show quicklook on map');
  });

  it('disables the eye icon for an item with a thumbnail whose quicklook asset resolves to a fallback logo', async () => {
    fetchThumbnailImage.mockResolvedValueOnce({ url: 'thumb.png', isFallback: false });
    fetchPreviewImage.mockResolvedValueOnce({ url: 'logo.png', isFallback: true });
    const item = buildItem({
      internalId: 'card-thumbnail-and-fallback-quicklook',
      assets: {
        thumbnail: { href: 'https://example.com/thumb.png', type: 'image/png' },
        'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' },
      },
    });

    renderCard(item);

    await waitFor(() => {
      expect(getEyeIcon()).toHaveClass('disabled');
    });
    expect(getEyeIcon().getAttribute('title')).toBe('No quicklook available for this item');
  });

  it('shows the provider logo preview (not "No preview available") for an item with no thumbnail and no valid quicklook asset', async () => {
    fetchPreviewImage.mockResolvedValueOnce({ url: 'logo.png', isFallback: true });
    const item = buildItem({
      internalId: 'card-no-thumbnail-no-quicklook',
      assets: {},
    });

    renderCard(item);

    await waitFor(() => {
      expect(fetchPreviewImage).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(document.querySelector('.product-preview img')).toHaveAttribute('src', 'logo.png');
    });
    expect(document.querySelector('.product-preview .no-image')).toBeNull();
  });

  it('dispatches no addQuicklookOverlay action when the disabled icon is clicked', async () => {
    fetchPreviewImage.mockResolvedValueOnce({ url: 'logo.png', isFallback: true });
    const item = buildItem({
      internalId: 'card-click-disabled',
      assets: { 'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' } },
    });

    renderCard(item);

    await waitFor(() => {
      expect(getEyeIcon()).toHaveClass('disabled');
    });

    fireEvent.click(getEyeIcon());

    expect(store.getState().mainMap.quicklookOverlays).toEqual([]);
  });
});
