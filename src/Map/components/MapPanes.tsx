import React from 'react';
import { Pane } from 'react-leaflet';
import {
  BASE_PANE_ID,
  BASE_PANE_ZINDEX,
  BASE_S2_MOSAIC_PANE_ID,
  BASE_S2_MOSAIC_PANE_ZINDEX,
  HIGHLIGHT_PANE_ID,
  HIGHLIGHT_PANE_ZINDEX,
} from '../const';

const MapPanes = () => {
  return (
    <>
      <Pane name={BASE_PANE_ID} style={{ zIndex: BASE_PANE_ZINDEX }} />
      <Pane name={BASE_S2_MOSAIC_PANE_ID} style={{ zIndex: BASE_S2_MOSAIC_PANE_ZINDEX }} />
      <Pane name={HIGHLIGHT_PANE_ID} style={{ zIndex: HIGHLIGHT_PANE_ZINDEX }} />
    </>
  );
};

export default React.memo(MapPanes);
