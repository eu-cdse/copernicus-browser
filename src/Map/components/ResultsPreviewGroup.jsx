import React from 'react';
import { FeatureGroup } from 'react-leaflet';
import PreviewLayer from '../../Tools/Results/PreviewLayer';

const ResultsPreviewGroup = ({ tiles = [], highlightedId, idKey = 'id', onClick }) => {
  if (!Array.isArray(tiles) || tiles.length === 0) {
    return null;
  }

  return (
    <FeatureGroup onClick={onClick}>
      {tiles.map((tile) => {
        const keyVal = tile?.[idKey];
        const isHighlighted = keyVal === highlightedId;
        return (
          <PreviewLayer
            key={`result-${keyVal}-${isHighlighted}`}
            isHighlighted={isHighlighted}
            tile={tile}
            pane={isHighlighted ? 'highlightPane' : 'overlayPane'}
          />
        );
      })}
    </FeatureGroup>
  );
};

export default React.memo(ResultsPreviewGroup);
