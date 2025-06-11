import React from 'react';
import CollectionTooltip from '../../CollectionTooltip/CollectionTooltip';
import { EOBButton } from '../../../../../junk/EOBCommon/EOBButton/EOBButton';
import { t } from 'ttag';

export const MultiSelectInput = ({
  input,
  value = [],
  inputStyle,
  onChange,
  titleEnabled = true,
  userToken,
}) => {
  const selectionLimit = input.selectionLimit;
  const isSelectionLimited = !!selectionLimit && value.length >= selectionLimit;
  const options = input?.getOptions({ userToken }) ?? [];

  return (
    <div key={`${input.id}`} className="filter-item multiselect">
      {titleEnabled && (
        <div className="title">
          <span>{input.title}</span>
          {!!input.tooltip && (
            <CollectionTooltip source={input.tooltip} className={'filter-item-tooltip'}></CollectionTooltip>
          )}
        </div>
      )}
      <div className="content">
        {options.map((option) => {
          const isSelected = !!value?.find((v) => v.value === option.value);
          return (
            <EOBButton
              key={`${input.id}-${option.value}`}
              text={option.label}
              className={`${isSelected ? 'selected' : ''}`}
              inputStyle={inputStyle}
              disabled={isSelectionLimited && !isSelected}
              onClick={() => {
                if (isSelected) {
                  onChange(value.filter((v) => v.value !== option.value));
                } else {
                  if (isSelectionLimited) {
                    return;
                  }
                  onChange([...value, option]);
                }
              }}
            />
          );
        })}
        {isSelectionLimited && (
          <span className="notification" style={{ margin: '0px', padding: '6px' }}>
            {selectionLimit === 1
              ? t`Selection limit: ${selectionLimit} item.`
              : t`Selection limit: ${selectionLimit} items.`}
          </span>
        )}
      </div>
    </div>
  );
};
