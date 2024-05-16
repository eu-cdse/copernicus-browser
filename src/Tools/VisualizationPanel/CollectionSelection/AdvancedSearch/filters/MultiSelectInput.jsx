import CollectionTooltip from '../../CollectionTooltip/CollectionTooltip';
import { EOBButton } from '../../../../../junk/EOBCommon/EOBButton/EOBButton';

export const MultiSelectInput = ({ input, value = [], onChange }) => {
  return (
    <div key={`${input.id}`} className="filter-item multiselect">
      <div className="title">
        <span>{input.title}</span>
        <CollectionTooltip
          source={input.tooltip ?? input.title}
          className={'filter-item-tooltip'}
        ></CollectionTooltip>
      </div>
      <div className="content">
        {input?.options?.map((option) => {
          const isSelected = !!value?.find((v) => v.value === option.value);
          return (
            <EOBButton
              key={`${input.id}-${option.value}`}
              text={option.label}
              className={`${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (isSelected) {
                  onChange(value.filter((v) => v.value !== option.value));
                } else {
                  onChange([...value, option]);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
