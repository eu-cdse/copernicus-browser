import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { latLngBounds } from 'leaflet';

import ImageDownload from './ImageDownload';
import { IMAGE_FORMATS } from './consts';
import store, { mainMapSlice } from '../../store';
import { externalLayersSlice } from '../../store/slices/externalLayersSlice';

// ImageDownload reaches into App.jsx purely for the auth-token helper, which pulls in the whole
// app module graph (Map, Tools, TerrainViewer, ...). Nothing in this test exercises a real
// download/preview request, so stub it out the same way PinPreviewImage.test.jsx does.
jest.mock('../../App', () => ({
  getAppropriateAuthToken: () => null,
  getGetMapAuthToken: () => null,
}));

// Keep dataset/datasource lookups out of this test: no datasetId is set (props.datasetId stays
// undefined), so every lookup would be a no-op anyway.
jest.mock('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getDataSourceHandler: jest.fn(() => undefined),
}));

// The preview panel fires a real image-fetch request as soon as it mounts (it's rendered whenever
// an external layer is active, which this test's regression scenario requires). It's unrelated to
// the BasicForm image-format effect under test, so stub it out to keep the test hermetic.
jest.mock('./ImageDownloadPreview', () => () => null);

const SERVER_ID = 'test-server';

const bounds = latLngBounds([46, 14], [46.2, 14.3]);
const pixelBounds = { min: { x: 0, y: 0 }, max: { x: 1024, y: 768 } };

function activateExternalLayer() {
  store.dispatch(
    externalLayersSlice.actions.addExternalServer({
      id: SERVER_ID,
      name: 'Test WMS server',
      url: 'https://example.com/wms',
      type: 'WMS',
      layers: [{ id: 'layer-1', name: 'test-layer', title: 'Test layer' }],
    }),
  );
}

function renderImageDownload() {
  store.dispatch(mainMapSlice.actions.setBounds({ bounds, pixelBounds }));
  return render(
    <Provider store={store}>
      <ImageDownload />
    </Provider>,
  );
}

function getImageFormatSelect() {
  // BasicForm's image format dropdown is the only <select> rendered on the Basic tab.
  return screen.getByRole('combobox');
}

describe('ImageDownload basic form image format', () => {
  afterEach(() => {
    // Unmount before resetting shared store slices: ImageDownload is still subscribed at this
    // point, and clearing mainMap.pixelBounds while it's mounted crashes it (getMapDimensions
    // dereferences pixelBounds unconditionally on every render).
    cleanup();
    store.dispatch(mainMapSlice.actions.reset());
    store.dispatch(externalLayersSlice.actions.removeExternalServer(SERVER_ID));
  });

  test('resets WEBP back to PNG if it is selected while an external layer is already active (regression for the basicFormState.imageFormat dependency)', async () => {
    activateExternalLayer();
    renderImageDownload();

    const select = getImageFormatSelect();
    expect(select.value).toBe(IMAGE_FORMATS.JPG);

    fireEvent.change(select, { target: { value: IMAGE_FORMATS.WEBP } });

    // Without `basicFormState.imageFormat` in the effect's dependency array, activeExternalLayer
    // never changes here (it was already active before the format changed), so the effect would
    // not re-run and the format would incorrectly stay WEBP.
    await waitFor(() => expect(select.value).toBe(IMAGE_FORMATS.PNG));
  });

  test('keeps WEBP selected when no external layer is active', async () => {
    renderImageDownload();

    const select = getImageFormatSelect();
    fireEvent.change(select, { target: { value: IMAGE_FORMATS.WEBP } });

    await waitFor(() => expect(select.value).toBe(IMAGE_FORMATS.WEBP));
  });
});
