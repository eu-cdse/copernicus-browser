import React from 'react';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';

const ElevationPointLayer = ({ feature }) => {
  if (!feature) {
    return null;
  }

  return (
    <GeoJSON
      data={feature}
      key={JSON.stringify(feature)}
      pointToLayer={(f, latlng) => {
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: '#fff',
          color: '#3388ff',
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        });
      }}
    />
  );
};

export default React.memo(ElevationPointLayer);
