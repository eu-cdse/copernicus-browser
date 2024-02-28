import L from 'leaflet';
import { GridLayer, withLeaflet } from 'react-leaflet';

L.TileLayer.MakeLabelsReadable = L.TileLayer.extend({
  initialize: function (url, options) {
    options = options || {};
    L.TileLayer.prototype.initialize.call(this, url, options);
  },

  createTile: function (coords, done) {
    const tile = L.DomUtil.create('canvas', 'leaflet-tile');
    tile.width = tile.height = this.options.tileSize;
    const imageObj = new Image();
    imageObj.crossOrigin = '';

    imageObj.onload = () => {
      const ctx = tile.getContext('2d');
      ctx.drawImage(imageObj, 0, 0);
      tile.originalImage = ctx.getImageData(0, 0, tile.width, tile.height);
      this.createGrayscale(tile, this);
      done(null, tile); // Syntax is 'done(error, tile)'
    };

    imageObj.onerror = (error) => {
      done(error, null);
    };
    imageObj.src = this.getTileUrl(coords);
    return tile;
  },
  createGrayscale: function (tile) {
    if (!tile.originalImage) {
      return;
    }
    const ctx = tile.getContext('2d');
    const tgtData = ctx.getImageData(0, 0, tile.width, tile.height);
    const data = tgtData.data;
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const grayColor = 1.7 * red;
      tgtData.data[i] = grayColor;
      tgtData.data[i + 1] = grayColor;
      tgtData.data[i + 2] = grayColor;
    }
    ctx.putImageData(tgtData, 0, 0);
  },
});

L.tileLayer.makeLabelsReadable = function (url, options) {
  return new L.TileLayer.MakeLabelsReadable(url, options);
};

class MakeLabelsReadable extends GridLayer {
  createLeafletElement(props) {
    return new L.TileLayer.MakeLabelsReadable(props.url, this.getOptions(props));
  }
}
export default withLeaflet(MakeLabelsReadable);
