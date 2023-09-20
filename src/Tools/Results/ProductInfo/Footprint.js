import { GeoJSON, Map, TileLayer } from 'react-leaflet';

import './Footprint.scss';
import { useEffect, useRef, useState } from 'react';
import { getBoundsAndLatLng } from '../../CommercialDataPanel/commercialData.utils';

const Footprint = ({ product, lat, lng }) => {
  const [center, setCenter] = useState([lat, lng]);
  const [zoom, setZoom] = useState(10);
  const mapRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      if (mapRef?.current?.leafletElement) {
        mapRef.current.leafletElement.invalidateSize();
      }
    }, 250);
  }, []);

  useEffect(() => {
    if (product?.geometry) {
      const { zoom, lat, lng } = getBoundsAndLatLng(product.geometry);
      setCenter([lat, lng]);
      setZoom(Math.max(3, zoom - 2));
    }
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
        center={center}
        zoom={zoom}
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
