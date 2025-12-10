import React from 'react';
import { GeoJSON, Rectangle, Marker } from 'react-leaflet';
import { isRectangle } from '../../utils/geojson.utils';
import { aoiStyle, loiStyle } from '../const';

const GeometryOverlays = ({
  aoiGeometry,
  aoiBounds,
  aoiLastEdited,
  loiGeometry,
  loiLastEdited,
  poiPosition,
  poiLastEdited,
}) => {
  return (
    <>
      {aoiGeometry && !isRectangle(aoiGeometry) && (
        <GeoJSON id="aoi-layer" data={aoiGeometry} key={aoiLastEdited} style={() => aoiStyle} />
      )}

      {aoiGeometry && aoiBounds && isRectangle(aoiGeometry) && (
        <Rectangle id="aoi-layer" bounds={aoiBounds} key={aoiLastEdited} {...aoiStyle} />
      )}

      {loiGeometry && (
        <GeoJSON id="loi-layer" data={loiGeometry} key={loiLastEdited} style={() => loiStyle} />
      )}

      {poiPosition ? <Marker id="poi-layer" position={poiPosition} key={poiLastEdited} /> : null}
    </>
  );
};

export default React.memo(GeometryOverlays);
