import React from 'react';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';

import './CollectionGroup.scss';

const renderCollectionButtons = (collectionGroup, selected, onSelect, buttonClass) => {
  const { collections } = collectionGroup;
  return (
    <div>
      {buttonClass === 'secondary' && (
        <div className="secondary-collection-button-title">{`Collections:`}</div>
      )}
      {collections.map((collection, index) => {
        const isCollectionSelected = selected && selected.dataset === collection.dataset;
        return (
          <EOBButton
            key={index}
            text={collection.title}
            className={`collection-button ${buttonClass} ${isCollectionSelected ? 'selected' : ''}`}
            onClick={() =>
              onSelect({
                datasource: collection.datasource,
                dataset: collection.dataset,
              })
            }
          />
        );
      })}
    </div>
  );
};

export const CollectionGroup = ({ collectionGroup, selected, onSelect, expanded }) => {
  const { collections, displayedAsGroup } = collectionGroup;
  const isCollectionGroupSelected = selected && selected.datasource === collectionGroup.datasource;

  // if displayedAsGroup is set to true, group button will not be shown when there is only one collection in the group
  const skipGroupButton = displayedAsGroup && collections && collections.length === 1;

  /*
  collections are rendered when they exists and 
  - group is expanded
  - group is selected
  - group button is skipped
  */
  const shouldRenderCollectionButtons =
    collections && collections.length && (skipGroupButton || isCollectionGroupSelected || expanded);

  return (
    <>
      {!skipGroupButton && (
        <div className="collection-button-wrapper">
          <EOBButton
            text={collectionGroup.title}
            className={`collection-button primary ${isCollectionGroupSelected ? 'selected' : ''}`}
            onClick={() =>
              onSelect({
                datasource: !isCollectionGroupSelected ? collectionGroup.datasource : undefined,
                dataset: undefined,
              })
            }
          />
        </div>
      )}
      {!!shouldRenderCollectionButtons && (
        <div className={`collection-button-wrapper ${!skipGroupButton ? 'collections-full-width' : ''}`}>
          {renderCollectionButtons(
            collectionGroup,
            selected,
            onSelect,
            skipGroupButton ? 'primary' : 'secondary',
          )}
        </div>
      )}
    </>
  );
};
