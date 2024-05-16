import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import './CollectionCard.scss';
import CollectionCardDatasets from './CollectionCardDatasets';

export const CollectionCard = ({ collectionGroup, selected, onSelect, defaultSelected }) => {
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const isCollectionGroupSelected = selected && selected.datasource === collectionGroup.datasource;
  const cardDescription = collectionGroup.description;

  const onCardSelect = () => {
    onSelect({
      datasource: !isCollectionGroupSelected ? collectionGroup.datasource : undefined,
      dataset: undefined,
    });
  };

  useEffect(() => {
    setIsCardExpanded(selected && selected.datasource === collectionGroup.datasource);
  }, [selected, collectionGroup]);

  return (
    <div className={`collection-card-wrapper ${isCollectionGroupSelected ? 'selected-card' : ''}`}>
      <div className={`collection-card-title`} onClick={onCardSelect}>
        {collectionGroup.title}
        <i className="fas fa-arrow-right"></i>
      </div>
      <div className="collection-card-description" onClick={onCardSelect}>
        <ReactMarkdown children={isCardExpanded ? cardDescription : cardDescription.split('\n\n')[0]} />
      </div>
      <div className="collection-card-dataset-wrapper">
        {isCardExpanded && (
          <CollectionCardDatasets
            selected={selected}
            collectionGroup={collectionGroup}
            onSelect={onSelect}
            defaultSelected={defaultSelected}
          />
        )}
      </div>
      <div className="open-close-button" onClick={() => setIsCardExpanded(!isCardExpanded)}>
        <i className={`fas fa-chevron-${isCardExpanded ? 'up' : 'down'}`}></i>
      </div>
    </div>
  );
};
