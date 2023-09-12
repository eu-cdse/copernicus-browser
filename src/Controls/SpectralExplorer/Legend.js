import store, { spectralExplorerSlice } from '../../store';

const isSeriesDisplayed = (selectedSeries, datasetId, seriesId, defaultDisplayed = true) => {
  if (selectedSeries?.[datasetId] === undefined) {
    return defaultDisplayed;
  }
  return !!selectedSeries[datasetId].find((s) => s === seriesId);
};

const Legend = ({ series, datasetId, selectedSeries }) => {
  if (!series) {
    return null;
  }

  return (
    <div className="legend">
      {series.map((line, index) => {
        const isDisplayed = isSeriesDisplayed(selectedSeries, datasetId, line.id, true);
        return (
          <div
            className="item"
            key={index}
            onClick={() => {
              let newSelectedSeries;
              if (isDisplayed) {
                newSelectedSeries = (selectedSeries?.[datasetId] || []).filter((s) => s !== line.id);
              } else {
                newSelectedSeries = [...(selectedSeries?.[datasetId] || []), line.id];
              }
              store.dispatch(
                spectralExplorerSlice.actions.setSelectedSeries({
                  datasetId: datasetId,
                  series: newSelectedSeries,
                }),
              );
            }}
          >
            <i
              className={`fa ${isDisplayed ? 'fa-check-square checked' : 'fa-square unchecked'}`}
              style={{ color: line.color }}
              aria-hidden="true"
            ></i>
            <span>{line.title}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Legend;
