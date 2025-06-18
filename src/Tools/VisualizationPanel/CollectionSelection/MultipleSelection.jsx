import React from 'react';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import Toggle from 'react-toggle';
import CollectionTooltip from './CollectionTooltip/CollectionTooltip';

export const MultipleSelection = ({
  title = null,
  options = [],
  defaultOptions = {},
  tooltips = {},
  handleSelect = {},
}) => {
  return (
    <>
      <div className="collection-label">{title}</div>
      <div className={`collection-buttons-wrapper`}>
        {options.map((option) => {
          return (
            <div className="single-collection-wrapper" key={option.value}>
              <EOBButton
                text={
                  <>
                    {option.title}
                    <Toggle
                      icons={false}
                      checked={defaultOptions[option.value]}
                      onChange={() => {}}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </>
                }
                title={option.title}
                className={`collection-button secondary option-toggle ${
                  defaultOptions[option.value] ? 'selected' : ''
                }`}
                onClick={(e) => {
                  const newSelectedOptions = {
                    ...defaultOptions,
                    [option.value]: !defaultOptions[option.value],
                  };
                  handleSelect(newSelectedOptions);
                }}
              />
              <CollectionTooltip
                source={tooltips[option.value]}
                className={tooltips[option.value] ? '' : 'hidden-tooltip'}
              />
            </div>
          );
        })}
      </div>
    </>
  );
};
