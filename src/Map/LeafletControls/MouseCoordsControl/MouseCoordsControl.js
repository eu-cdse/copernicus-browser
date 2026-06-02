import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import { roundDegrees } from '../../../junk/EOBCommon/utils/coords';

const createMouseCoordsControl = (props) => {
  let panelDiv;
  let mouseCoords = null;

  const handleMouseMoveAndZoomChange = (e) => {
    if (e.type === 'mousemove') {
      mouseCoords = e.latlng.wrap();
    } else {
      mouseCoords = mouseCoords ?? e.target._lastCenter;
    }
    const zoom = e.target.getZoom();
    const lng = roundDegrees(mouseCoords.lng, zoom);
    const lat = roundDegrees(mouseCoords.lat, zoom);
    panelDiv.innerHTML = `Lat: ${lat}, Lng: ${lng}`;
    panelDiv.classList.remove('no-coordinates');
  };

  const MouseCoordsLeafletControl = L.Control.extend({
    onAdd(map) {
      panelDiv = L.DomUtil.create('div', 'leaflet-control-map-coordinates no-coordinates');
      map.on('mousemove', handleMouseMoveAndZoomChange);
      map.on('zoomend', handleMouseMoveAndZoomChange);
      return panelDiv;
    },
    onRemove(map) {
      map.off('mousemove', handleMouseMoveAndZoomChange);
      map.off('zoomend', handleMouseMoveAndZoomChange);
    },
  });

  return new MouseCoordsLeafletControl({ position: props.position });
};

const MouseCoordsControl = createControlComponent(createMouseCoordsControl);
export default MouseCoordsControl;
