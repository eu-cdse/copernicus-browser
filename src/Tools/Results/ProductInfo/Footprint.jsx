import React, { useEffect, useRef } from 'react';
import { GeoJSON, Map, TileLayer } from 'react-leaflet';

import { getBoundsAndLatLng } from '../../CommercialDataPanel/commercialData.utils';

import './Footprint.scss';

const Footprint = ({ product, lat, lng }) => {
  const mapRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      if (mapRef?.current?.leafletElement) {
        const map = mapRef.current.leafletElement;
        // Invalidate size first so map knows its actual dimensions
        map.invalidateSize();

        // Then fit bounds after the map size is correct
        if (product?.geometry) {
          const { bounds } = getBoundsAndLatLng(product.geometry);
          map.fitBounds(bounds, {
            padding: [30, 30],
          });
        }
      }
    }, 250);
  }, [product]);

  if (!product) {
    return null;
  }

  if (!product.geometry) {
    return <div className="error-message">No footprint available</div>;
  }

  return (
    <div className="footprint-container">
      <Map
        center={[lat, lng]}
        zoom={3}
        zoomControl={false}
        className="footprint-map"
        ref={mapRef}
        attributionControl={false}
      >
        <TileLayer
          url={`https://gisco-services.ec.europa.eu/maps/tiles/OSMCartoCompositeEN/EPSG3857/{z}/{x}/{y}.png`}
        />
        <GeoJSON data={product.geometry} key={product.id} />
      </Map>
    </div>
  );
};

export default Footprint;
