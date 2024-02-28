import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const CollectionCardDatasets = ({ collectionGroup, selected, onSelect, defaultSelected }) => {
  const [orderedCollectionDatasets, setOrderedCollectionDatasets] = useState([]);

  const handleDatasetClick = (dataset) => {
    onSelect({
      datasource: collectionGroup.datasource,
      dataset: dataset,
    });
  };

  useEffect(() => {
    const ordered = [...collectionGroup.collections];
    if (defaultSelected && defaultSelected.dataset) {
      const selectedIdx = ordered.findIndex((el) => el.dataset === defaultSelected.dataset);
      if (selectedIdx > -1) {
        ordered.unshift(ordered.splice(selectedIdx, 1)[0]);
      }
    }

    setOrderedCollectionDatasets(ordered);
  }, [collectionGroup, defaultSelected]);

  return orderedCollectionDatasets.map((col, idx) => (
    <div
      key={idx}
      className={`collection-card-dataset ${selected.dataset === col.dataset ? 'selected-dataset' : ''}`}
    >
      <div className="collection-card-dataset-title" onClick={() => handleDatasetClick(col.dataset)}>
        {col.title}
        {col.description && (
          <i className={`fas fa-chevron-${selected.dataset === col.dataset ? 'up' : 'down'}`}></i>
        )}
      </div>
      {selected.dataset === col.dataset && (
        <div className="collection-card-dataset-description">
          <ReactMarkdown source={col.description} />
        </div>
      )}
    </div>
  ));
};

export default CollectionCardDatasets;
