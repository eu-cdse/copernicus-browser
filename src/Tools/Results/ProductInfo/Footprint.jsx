import React, { useEffect } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';

import { getBoundsAndLatLng } from '../../CommercialDataPanel/commercialData.utils';

import './Footprint.scss';

const FootprintMapInner = ({ product }) => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      if (product?.geometry) {
        const { bounds } = getBoundsAndLatLng(product.geometry);
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }, 250);
  }, [product, map]);

  return null;
};

const Footprint = ({ product, lat, lng }) => {
  if (!product) {
    return null;
  }

  if (!product.geometry) {
    return <div className="error-message">No footprint available</div>;
  }

  return (
    <div className="footprint-container">
      <MapContainer
        center={[lat, lng]}
        zoom={3}
        zoomControl={false}
        className="footprint-map"
        attributionControl={false}
      >
        <TileLayer
          url={`https://gisco-services.ec.europa.eu/maps/tiles/OSMCartoCompositeEN/EPSG3857/{z}/{x}/{y}.png`}
        />
        <GeoJSON data={product.geometry} key={product.id} />
        <FootprintMapInner product={product} />
      </MapContainer>
    </div>
  );
};

export default Footprint;
