import CollectionTooltip from '../../CollectionTooltip/CollectionTooltip';

export const DefaultInput = ({ input, value = '', onChange }) => {
  return (
    <div key={`${input.id}`} className="filter-item default">
      <div className="title">
        <div>{input.title}</div>
        <CollectionTooltip
          className={'filter-item-tooltip'}
          source={input.tooltip ?? input.title}
        ></CollectionTooltip>
      </div>
      <div className="content">
        <input
          name={input.id}
          type={input.type}
          placeholder={input.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        ></input>
      </div>
    </div>
  );
};
