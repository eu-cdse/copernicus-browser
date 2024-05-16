import InputWithBouncyLimit from '../../../../../components/InputWithBouncyLimit/InputWithBouncyLimit';
import { isFunction } from '../../../../../utils';
import CollectionTooltip from '../../CollectionTooltip/CollectionTooltip';

const getValue = (input) => {
  if (input && isFunction(input)) {
    return input();
  }

  return input;
};

export const NumericInput = ({ input, value = '', onChange }) => {
  return (
    <div key={`${input.id}`} className="filter-item numeric">
      <div className="title">
        <div>{input.title}</div>
        <CollectionTooltip
          className={'filter-item-tooltip'}
          source={input.tooltip ?? input.title}
        ></CollectionTooltip>
      </div>
      <div className="content">
        <InputWithBouncyLimit
          type={input.type}
          placeholder={getValue(input.placeholder)}
          min={getValue(input.min)}
          max={getValue(input.max)}
          step={1}
          timeoutDuration={1000}
          value={value}
          setValue={onChange}
          allowNull={true}
        />
      </div>
    </div>
  );
};
