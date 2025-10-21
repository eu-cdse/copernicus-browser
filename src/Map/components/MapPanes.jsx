import React from 'react';
import { Pane } from 'react-leaflet';

const MapPanes = ({ BASE_PANE_ID, BASE_PANE_ZINDEX, BASE_S2_MOSAIC_PANE_ID, BASE_S2_MOSAIC_PANE_ZINDEX }) => {
  return (
    <>
      <Pane name={BASE_PANE_ID} style={{ zIndex: BASE_PANE_ZINDEX }} />
      <Pane name={BASE_S2_MOSAIC_PANE_ID} style={{ zIndex: BASE_S2_MOSAIC_PANE_ZINDEX }} />
      <Pane name={'highlightPane'} style={{ zIndex: 500 }} />
    </>
  );
};

export default React.memo(MapPanes);
