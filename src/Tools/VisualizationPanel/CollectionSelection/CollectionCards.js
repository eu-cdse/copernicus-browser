import React, { useState, useEffect } from 'react';
import { CollectionCard } from './CollectionCard';

const CollectionCards = ({ collectionGroups, onSelect, selected, defaultSelected }) => {
  const [orderedCollectionGroups, setOrderedCollectionGroups] = useState([]);

  useEffect(() => {
    const ordered = [...collectionGroups];
    if (defaultSelected && defaultSelected.datasource) {
      const selectedIdx = ordered.findIndex((el) => el.datasource === defaultSelected.datasource);

      if (selectedIdx > -1) {
        ordered.unshift(ordered.splice(selectedIdx, 1)[0]);
      }
    }
    setOrderedCollectionGroups(ordered);
  }, [collectionGroups, defaultSelected]);

  return orderedCollectionGroups.map((collection, index) => (
    <CollectionCard
      key={index}
      collectionGroup={collection}
      onSelect={onSelect}
      selected={selected}
      defaultSelected={defaultSelected}
    />
  ));
};

export default CollectionCards;
