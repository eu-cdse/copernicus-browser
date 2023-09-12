import InputWithBouncyLimit from '../../../../../components/InputWithBouncyLimit/InputWithBouncyLimit';
import CollectionTooltip from '../../CollectionTooltip/CollectionTooltip';

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
          placeholder={input.placeholder}
          min={input.min}
          max={input.max}
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
