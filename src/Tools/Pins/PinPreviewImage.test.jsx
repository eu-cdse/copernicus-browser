import React from 'react';
import { Provider } from 'react-redux';
import { render, screen, waitFor } from '@testing-library/react';

import PinPreviewImage from './PinPreviewImage';
import store from '../../store';

// The preview component reaches into App.jsx purely for the auth-token helpers, which pull in the
// whole app module graph. External WMS/WMTS pins never use a token (their thumbnail is a plain
// URL), so stub the helpers out.
jest.mock('../../App', () => ({
  getAppropriateAuthToken: () => null,
  getGetMapAuthToken: () => null,
}));

// jsdom doesn't implement the object-URL API the component revokes on unmount/prop change.
beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:stub');
  URL.revokeObjectURL = jest.fn();
});

const renderPreview = (pin) =>
  render(
    <Provider store={store}>
      <PinPreviewImage pin={pin} />
    </Provider>,
  );

// sentinelhub-js emits its own params lowercase but passes `unknown` params through with the
// caller's casing (STYLES), so match keys case-insensitively.
const getPreviewParams = async () => {
  const img = await screen.findByAltText('saved pin');
  await waitFor(() => expect(img.getAttribute('src')).toContain('example.com'));
  const src = img.getAttribute('src');
  const raw = new URLSearchParams(src.slice(src.indexOf('?') + 1));
  const params = new URLSearchParams();
  raw.forEach((value, key) => params.append(key.toLowerCase(), value));
  return params;
};

const wmsPin = {
  _id: 'pin-wms-1',
  lat: 45,
  lng: 15,
  zoom: 8,
  externalWms: {
    url: 'https://example.com/wms',
    layerName: 'my_layer',
    type: 'WMS',
  },
};

describe('PinPreviewImage — external WMS thumbnail', () => {
  it('requests the style the pin was saved with, not the server default (#1162)', async () => {
    renderPreview({ ...wmsPin, externalWms: { ...wmsPin.externalWms, style: 'ndvi' } });
    expect((await getPreviewParams()).get('styles')).toBe('ndvi');
  });

  it('requests the pinned TIME so the thumbnail matches the pinned date', async () => {
    renderPreview({
      ...wmsPin,
      externalWms: { ...wmsPin.externalWms, style: 'ndvi', time: '2023-06-01T00:00:00Z' },
    });
    expect((await getPreviewParams()).get('time')).toBe('2023-06-01');
  });

  it('falls back to the server default (empty STYLES, no TIME) when the pin has neither', async () => {
    renderPreview({ ...wmsPin, externalWms: { ...wmsPin.externalWms, style: null, time: null } });
    const params = await getPreviewParams();
    expect(params.get('styles')).toBe('');
    expect(params.has('time')).toBe(false);
  });
});
