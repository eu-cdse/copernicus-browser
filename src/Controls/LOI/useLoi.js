import { useEffect } from 'react';
import store, { loiSlice } from '../../store';
import { getLeafletBoundsFromGeoJSON } from '../../utils/geojson.utils';
import { loiStyle } from '../../Map/const';

export const useLoi = (map, { onEndDrawing }) => {
  useEffect(() => {
    if (map) {
      map.on('pm:create', (e) => {
        if (e.shape && e.shape === 'Line') {
          let geometry = e.layer.toGeoJSON().geometry;
          store.dispatch(
            loiSlice.actions.set({ geometry: geometry, bounds: getLeafletBoundsFromGeoJSON(geometry) }),
          );
          map.removeLayer(e.layer);
          onEndDrawing();
        }
      });
    }
  }, [map, onEndDrawing]);

  const resetLoi = () => {
    map.pm.disableDraw();
    store.dispatch(loiSlice.actions.reset());
  };

  const startDrawingLoi = () => {
    map.pm.enableDraw('Line', {
      finishOn: 'contextmenu',
      allowSelfIntersection: true,
      pathOptions: loiStyle,
    });
  };

  return { resetLoi, startDrawingLoi };
};
