import React from 'react';
import { t } from 'ttag';

import { DEFAULT_CLOUD_COVER_PERCENT } from '../../../../const';

import CustomCheckbox from '../../../../components/CustomCheckbox/CustomCheckbox';
import { EOBCCSlider } from '../../../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { InstrumentTooltips } from '../../../../api/OData/assets/tooltips';
import CollectionTooltip from '../CollectionTooltip/CollectionTooltip';
import { getNestedCloudCover, getNestedValue } from './collectionFormConfig.utils';

const RecursiveCollectionItem = ({
  item,
  path = [],
  level = 0,
  selectedCollections,
  maxCc,
  onItemToggle,
  onMaxCcChange,
  userToken,
  additionalFilterToggle,
}) => {
  const currentPath = [...path, item.id];

  const isSelected = getNestedValue(selectedCollections, currentPath) !== undefined;

  // Skip rendering if user does not have access to this item
  if (item.hasAccess && typeof item.hasAccess === 'function' && !item.hasAccess({ userToken })) {
    return null;
  }

  const isCollection = level === 0;
  const isInstrument = item.type === 'instrument';
  const isProductType = item.type === 'productType';

  const cloudCoverValue =
    item.supportsCloudCover && isSelected ? getNestedCloudCover(maxCc, currentPath) : null;

  const renderCloudCover = () => {
    if (!item.supportsCloudCover || !isSelected) {
      return null;
    }

    return (
      <div className="cloud-filter">
        <EOBCCSlider
          sliderWidth={120}
          cloudCoverPercentage={cloudCoverValue || DEFAULT_CLOUD_COVER_PERCENT}
          onChange={(val) => onMaxCcChange(val, currentPath)}
        />
      </div>
    );
  };

  const renderTooltip = () => {
    if (isInstrument && path.length > 0) {
      const collectionId = path[0];
      if (InstrumentTooltips[collectionId]?.[item.id]) {
        return <CollectionTooltip source={InstrumentTooltips[collectionId][item.id]()} />;
      }
    }
    return null;
  };

  const renderGeometryTooltip = () => {
    if (isProductType && item.supportsGeometry === false) {
      return (
        <CollectionTooltip
          source={t`Data product without location information - the product will be searched without geometry.`}
        />
      );
    }
    return null;
  };

  return (
    <div className={`${isCollection ? 'collection' : `item`}`}>
      <div className={`item-wrapper`}>
        <CustomCheckbox checked={isSelected} onChange={() => onItemToggle(currentPath)} label={item.label} />
        {renderTooltip()}
        {renderGeometryTooltip()}
        {additionalFilterToggle}
      </div>

      {renderCloudCover()}

      {isSelected && item.items?.length > 0 && (
        <div className="item-nested">
          {item.items.map((item) => (
            <RecursiveCollectionItem
              key={`${currentPath.join('-')}-${item.id}`}
              item={item}
              path={currentPath}
              level={level + 1}
              selectedCollections={selectedCollections}
              maxCc={maxCc}
              onItemToggle={onItemToggle}
              onMaxCcChange={onMaxCcChange}
              userToken={userToken}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecursiveCollectionItem;
