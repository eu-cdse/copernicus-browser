import React from 'react';
import { GeoJSON, FeatureGroup } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import store, { commercialDataSlice } from '../../store';
import PreviewLayer from '../../Tools/Results/PreviewLayer';
import { highlightedTileStyle } from '../const';

type CommercialDataResult = {
  id: string;
  geometry: GeoJSON.Geometry;
};

type CommercialDataOrder = {
  id: string;
  input?: {
    bounds?: {
      geometry?: GeoJSON.Geometry;
    };
  };
};

type Props = {
  displaySearchResults: boolean;
  highlightedResult: CommercialDataResult | null;
  searchResults: CommercialDataResult[];
  selectedOrder: CommercialDataOrder | null;
};

const selectedOrderStyle = () => ({
  weight: 2,
  color: 'green',
  opacity: 1,
  fillColor: 'green',
  fillOpacity: 0.3,
});

const CommercialDataOverlay = ({
  displaySearchResults,
  highlightedResult,
  searchResults,
  selectedOrder,
}: Props) => {
  return (
    <>
      {displaySearchResults && !!highlightedResult && (
        <GeoJSON
          id="commercialDataResult"
          data={highlightedResult.geometry}
          key={highlightedResult.id}
          style={() => highlightedTileStyle}
        />
      )}

      {displaySearchResults && searchResults.length > 0 && (
        <FeatureGroup
          onClick={(e: LeafletMouseEvent) => {
            store.dispatch(commercialDataSlice.actions.setLocation({ lat: e.latlng.lat, lng: e.latlng.lng }));
          }}
        >
          {searchResults.map((result, i) => (
            <PreviewLayer tile={result} key={`preview-layer-${i}`} />
          ))}
        </FeatureGroup>
      )}

      {!!selectedOrder?.input?.bounds?.geometry && (
        <GeoJSON
          id="commercialDataSelectedOrder"
          data={selectedOrder.input.bounds.geometry}
          key={selectedOrder.id}
          style={selectedOrderStyle}
        />
      )}
    </>
  );
};

export default CommercialDataOverlay;
