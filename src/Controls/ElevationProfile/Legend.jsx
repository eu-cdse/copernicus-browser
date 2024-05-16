const Legend = ({ data, selectedLineIdx = 0, setSelectedLineIdx }) => {
  return (
    <div className="legend">
      {data.map((line, index) => {
        const isSelected = index === selectedLineIdx;
        return (
          <div
            className="item"
            key={index}
            onClick={() => {
              if (!isSelected) {
                setSelectedLineIdx(index);
              }
            }}
          >
            <i className={`fa ${isSelected ? 'fa-check-square checked' : 'fa-square unchecked'}`}>
              <span>{line.title}</span>
            </i>
          </div>
        );
      })}
    </div>
  );
};

export default Legend;
