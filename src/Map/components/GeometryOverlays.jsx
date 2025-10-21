import React from 'react';
import { GeoJSON, Rectangle, Marker } from 'react-leaflet';
import { isRectangle } from '../../utils/geojson.utils';

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
        <GeoJSON id="aoi-layer" data={aoiGeometry} key={aoiLastEdited} />
      )}

      {aoiGeometry && aoiBounds && isRectangle(aoiGeometry) && (
        <Rectangle id="aoi-layer" bounds={aoiBounds} key={aoiLastEdited} />
      )}

      {loiGeometry && <GeoJSON id="loi-layer" data={loiGeometry} key={loiLastEdited} />}

      {poiPosition ? <Marker id="poi-layer" position={poiPosition} key={poiLastEdited} /> : null}
    </>
  );
};

export default React.memo(GeometryOverlays);
