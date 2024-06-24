import React from 'react';
import { ADDITIONAL_FILTERS_ENABLED } from './AdditionalFilters.utils';

const Tag = ({ value, onRemove }) => {
  if (!value) {
    return null;
  }
  return (
    <div className={'tag'}>
      {value}
      <i className="fa fa-times-circle" onClick={onRemove}></i>
    </div>
  );
};

const renderValueAsTag = ({ collectionId, filterItemId, value, onChange }) => (
  <Tag key={`${collectionId}-${filterItemId}`} value={value} onRemove={() => onChange('')} />
);

const renderArrayAsTags = ({ collectionId, filterItemId, value, onChange }) =>
  value.map((option) => (
    <Tag
      key={`${collectionId}-${filterItemId}-${option.value}`}
      value={option.label}
      onRemove={() => onChange(value.filter((v) => v.value !== option.value))}
    />
  ));

const renderFilterItemValue = ({ collectionId, filterItemId, value, onChange }) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const render = Array.isArray(value) ? renderArrayAsTags : renderValueAsTag;
  return render({ collectionId, filterItemId, value, onChange });
};

const SelectedFiltersList = ({ collectionId, selectedFilters, onChange, allFilters = [] }) => {
  if (!(ADDITIONAL_FILTERS_ENABLED && selectedFilters)) {
    return null;
  }
  return (
    <div className="selected-filters-list">
      {Object.keys(selectedFilters)
        .map((filterItemId) => allFilters.find((f) => f.id === filterItemId))
        .filter((filterItem) => !!filterItem)
        .map((filterItem) =>
          renderFilterItemValue({
            collectionId: collectionId,
            filterItemId: filterItem.id,
            value: selectedFilters[filterItem.id],
            onChange: (value) => onChange(collectionId, filterItem.id, value),
          }),
        )}
    </div>
  );
};

export default SelectedFiltersList;
