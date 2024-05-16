import { XYFrame } from 'semiotic';
import { spectralExplorerLabels } from './SpectralExplorer.utils';

const getFrameProps = ({ series, labels, tooltipItems, maxReflectance = 1 }) => {
  const frameProps = {
    lines: series,
    className: 'chart',
    size: [650, 370],
    margin: { left: 60, right: 30, top: 30, bottom: 60 },

    xAccessor: (d) => {
      const band = labels?.find((label) => label.name === d.name);
      return band?.centralWL ?? 0;
    },
    lineType: { type: 'line' },
    yAccessor: 'value',
    xExtent: [400],
    yExtent: [0, maxReflectance],
    lineStyle: (d) => {
      return {
        stroke: d?.color ?? '#fff',
        strokeWidth: 2,
        fill: 'none',
      };
    },
    axes: [
      {
        orient: 'left',
        label: spectralExplorerLabels.reflectance(),
        tickFormat: function (e) {
          return e.toFixed(2);
        },
      },
      {
        orient: 'bottom',
        label: spectralExplorerLabels.wavelength(),
        ticks: 10,
      },
    ],
    hoverAnnotation: [{ type: 'x', disable: ['connector', 'note'] }, { type: 'frame-hover' }],
    baseMarkProps: { transitionDuration: { default: 0, fill: 0 } },
    showLinePoints: true,
    pointStyle: (d) => {
      return { fill: d?.parentLine?.color ?? '#fff', r: 4 };
    },
    tooltipContent: (d) => {
      const band = labels?.find((label) => label.name === d.name);

      return (
        <div className="tooltip-content">
          <div key={'header'} className="header">
            {band.getDescription()}
          </div>
          {tooltipItems
            .map((line) => {
              return {
                id: line.id,
                color: line.color,
                data: line.coordinates.find((b) => {
                  return b.name === d.name;
                }),
              };
            })
            .sort((a, b) => b.data.y - a.data.y)
            .map((point, i) => {
              const parentLine = series.find((line) => line.id === point.id);
              const title = parentLine?.title ?? point.id;
              const valString = point.data?.value?.toFixed(2);
              return (
                <div key={`tooltip_line_${i}`} className="line-item">
                  <div
                    key={`tooltip_color_${i}`}
                    className="box"
                    style={{
                      backgroundColor: point.color,
                    }}
                  />
                  <div key={`tooltip_p_${i}`} className="name">{`${title}:`}</div>
                  <div key={`tooltip_p_val_${i}`} className="value">
                    {valString}
                  </div>
                </div>
              );
            })}
        </div>
      );
    },
  };

  return frameProps;
};

const LineChart = ({ series = [], bands = [], selected = [] }) => {
  const selectedSeries = series.filter((s) => selected.find((sel) => sel === s.id));
  const maxReflectance = Math.max(
    1,
    series
      .map((s) =>
        s.coordinates.reduce((acc, { value }) => (value > acc ? value : acc), Number.NEGATIVE_INFINITY),
      )
      .reduce((acc, value) => (value > acc ? value : acc), Number.NEGATIVE_INFINITY),
  );
  return (
    <XYFrame
      key={`line-chart-${JSON.stringify(series)}`}
      {...getFrameProps({
        series: [...selectedSeries].sort((a, b) => a.renderIdx - b.renderIdx), //sort items ascending to always display poi/aoi on the top
        labels: bands,
        selected: selected,
        tooltipItems: selectedSeries, //use default sorting for tooltip
        maxReflectance: maxReflectance,
      })}
    />
  );
};
export default LineChart;
