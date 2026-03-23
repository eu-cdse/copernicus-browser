import React from 'react';
import { FeatureGroup } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import PreviewLayer from '../../Tools/Results/PreviewLayer';
import { HIGHLIGHT_PANE_ID } from '../const';

type Tile = {
  id?: string;
  _internalId?: string;
  geometry?: object;
  [key: string]: unknown;
};

type Props = {
  tiles?: Tile[];
  highlightedId?: string;
  idKey?: string;
  onClick?: (e: LeafletMouseEvent) => void;
};

const ResultsPreviewGroup = ({ tiles = [], highlightedId, idKey = 'id', onClick }: Props) => {
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
            pane={isHighlighted ? HIGHLIGHT_PANE_ID : 'overlayPane'}
          />
        );
      })}
    </FeatureGroup>
  );
};

export default React.memo(ResultsPreviewGroup);
