import React, { useState } from 'react';
import {
  AWS_HLS,
  AWS_HLS_LANDSAT,
  AWS_HLS_SENTINEL,
} from '../../SearchPanel/dataSourceHandlers/dataSourceConstants';
import {
  HLS_Landsat_Markdown,
  HLS_Sentinel_Markdown,
} from '../../SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/HLSTooltip';
import { MultipleSelection } from './MultipleSelection';

const getCollectionIdFromConstellation = (options) => {
  let collectionId;
  if (options[AWS_HLS_LANDSAT] && options[AWS_HLS_SENTINEL]) {
    collectionId = AWS_HLS;
  }

  if (options[AWS_HLS_LANDSAT] && !options[AWS_HLS_SENTINEL]) {
    collectionId = AWS_HLS_LANDSAT;
  }
  if (!options[AWS_HLS_LANDSAT] && options[AWS_HLS_SENTINEL]) {
    collectionId = AWS_HLS_SENTINEL;
  }
  return collectionId;
};

const options = [
  { value: AWS_HLS_LANDSAT, title: 'Landsat' },
  { value: AWS_HLS_SENTINEL, title: 'Sentinel' },
];

export const HLSConstellationSelection = ({ selected, onSelect }) => {
  const [hlsCollections, setHlsCollections] = useState({
    [AWS_HLS_LANDSAT]: selected.dataset === AWS_HLS || selected.dataset === AWS_HLS_LANDSAT,
    [AWS_HLS_SENTINEL]: selected.dataset === AWS_HLS || selected.dataset === AWS_HLS_SENTINEL,
  });

  const tooltips = {
    [AWS_HLS_LANDSAT]: HLS_Landsat_Markdown(),
    [AWS_HLS_SENTINEL]: HLS_Sentinel_Markdown(),
  };

  const handleSelect = (newSelectedOptions) => {
    let collectionId = getCollectionIdFromConstellation(newSelectedOptions);
    if (collectionId) {
      setHlsCollections(newSelectedOptions);
      onSelect({
        ...selected,
        dataset: collectionId,
      });
    }
  };

  return (
    <MultipleSelection
      title={`Constellations:`}
      options={options}
      defaultOptions={hlsCollections}
      tooltips={tooltips}
      handleSelect={handleSelect}
    />
  );
};
