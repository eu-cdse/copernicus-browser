import L from 'leaflet';
import { withLeaflet, MapControl } from 'react-leaflet';

class MouseCoordsControl extends MapControl {
  state = {
    mouseCcoords: null,
  };

  componentDidMount() {
    const { map } = this.props.leaflet;
    map.on('mousemove', this.handleMouseMoveAndZoomChange);
    map.on('zoomend', this.handleMouseMoveAndZoomChange);
    map.addControl(this.leafletElement);
  }

  componentWillUnmount() {
    const { map } = this.props.leaflet;
    map.off('mousemove', this.handleMouseMoveAndZoomChange);
    map.off('zoomend', this.handleMouseMoveAndZoomChange);
    map.removeControl(this.leafletElement);
  }

  handleMouseMoveAndZoomChange = (e) => {
    let mouseCoords;
    if (e.type === 'mousemove') {
      mouseCoords = e.latlng.wrap();
      this.setState({ mouseCcoords: e.latlng.wrap() });
    } else {
      mouseCoords = this.state.mouseCcoords ? this.state.mouseCcoords : e.target._lastCenter;
    }

    const zoom = e.target.getZoom();
    const lng = this.formatDegrees(mouseCoords.lng, zoom);
    const lat = this.formatDegrees(mouseCoords.lat, zoom);
    const value = `Lat: ${lat}, Lng: ${lng}`;
    this.panelDiv.innerHTML = value;
    this.panelDiv.classList.remove('no-coordinates');
  };

  formatDegrees(deg, zoom) {
    if (!Number.isFinite(deg) || !Number.isFinite(zoom)) {
      return '';
    }
    const zRnd = Math.min(31, Math.max(0, Math.ceil(zoom))); // [0..31] is needed for shifting
    const degPerPix = 360 / 256 / (1 << zRnd);
    return deg.toFixed(Math.max(0, -Math.floor(Math.log10(0.5 * degPerPix))));
  }

  createLeafletElement(props) {
    const MouseCoordsControl = L.Control.extend({
      onAdd: (map) => {
        this.panelDiv = L.DomUtil.create('div', 'leaflet-control-map-coordinates no-coordinates');
        return this.panelDiv;
      },
    });
    return new MouseCoordsControl({ position: props.position });
  }
}

export default withLeaflet(MouseCoordsControl);
