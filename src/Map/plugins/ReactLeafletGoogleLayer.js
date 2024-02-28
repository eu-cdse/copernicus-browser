// copy of https://github.com/aviklai/react-leaflet-google-layer/blob/v1/src/index.ts
// used because of leaflet.gridlayer.googlemutant makes it dificult to change placement of Google icon

/*


The MIT License

Copyright (c) 2019-Present Avi Klaiman and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import L from 'leaflet';
import { GridLayer, withLeaflet } from 'react-leaflet';
import './Leaflet.GoogleMutant';

class ReactLeafletGoogleLayer extends GridLayer {
  static defaultProps = {
    useGoogMapsLoader: true,
    googleMapsLoaderConf: { VERSION: undefined },
    googleMapsAddLayers: undefined,
  };

  createLeafletElement(props) {
    const { googleMapsLoaderConf, googleMapsAddLayers, leaflet, apiKey, ...googleMutantProps } = props;
    this.leafletElement = L.gridLayer.googleMutant(googleMutantProps);
    if (googleMapsAddLayers) {
      googleMapsAddLayers.forEach((layer) => {
        this.leafletElement.addGoogleLayer(layer.name, layer.options);
      });
    }
    return this.leafletElement;
  }

  addGoogleLayer = (name, options) => {
    this.leafletElement.addGoogleLayer(name, options);
  };

  removeGoogleLayer = (name) => {
    this.leafletElement.removeGoogleLayer(name);
  };

  updateLeafletElement(prevProps, nextProps) {
    const { opacity, zIndex } = nextProps;
    if (opacity !== undefined && opacity !== prevProps.opacity) {
      this.leafletElement.setOpacity(opacity);
    }
    if (zIndex !== undefined && zIndex !== prevProps.zIndex) {
      this.leafletElement.setZIndex(zIndex);
    }
  }
}

export default withLeaflet(ReactLeafletGoogleLayer);
