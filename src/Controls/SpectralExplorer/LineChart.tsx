import React from 'react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { spectralExplorerLabels, getCentralWaveLength } from './SpectralExplorer.utils';
import styleVariables from '../../variables.module.scss';

interface SpectralCoordinate {
  name: string;
  value: number;
}

interface SpectralSeries {
  id: string;
  title?: string;
  getTitle?: () => string;
  color?: string;
  renderIdx: number;
  coordinates: SpectralCoordinate[];
}

interface SpectralBand {
  name: string;
  centralWL?: number;
  getDescription: () => string;
}

type ChartRow = Record<string, number | string>;

const getSeriesTitle = (serie: SpectralSeries | undefined, fallback: string): string => {
  if (!serie) {
    return fallback;
  }
  if (serie.title) {
    return serie.title;
  }
  if (typeof serie.getTitle === 'function') {
    return serie.getTitle();
  }
  return fallback;
};

// merge the per-series points into a single wavelength-keyed array as recharts expects
const buildChartData = (selectedSeries: SpectralSeries[], bands: SpectralBand[]): ChartRow[] => {
  const pointsByName: Record<string, ChartRow> = {};
  selectedSeries.forEach((serie) => {
    serie.coordinates.forEach((coordinate) => {
      const centralWL = getCentralWaveLength(coordinate.name, bands);
      if (centralWL === undefined || centralWL === null) {
        return;
      }
      if (!pointsByName[coordinate.name]) {
        pointsByName[coordinate.name] = { name: coordinate.name, wavelength: centralWL };
      }
      pointsByName[coordinate.name][serie.id] = coordinate.value;
    });
  });
  return Object.values(pointsByName).sort((a, b) => Number(a.wavelength) - Number(b.wavelength));
};

interface SpectralTooltipPayloadItem {
  value: number;
  dataKey: string;
  color: string;
  payload: ChartRow;
}

interface LineChartProps {
  series?: SpectralSeries[];
  bands?: SpectralBand[];
  selected?: string[];
}

interface SpectralTooltipProps {
  active?: boolean;
  payload?: SpectralTooltipPayloadItem[];
  series?: SpectralSeries[];
  bands?: SpectralBand[];
}

const SpectralTooltip = ({ active, payload, series = [], bands = [] }: SpectralTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }
  const bandName = payload[0].payload.name;
  const band = bands.find((label) => label.name === bandName);

  return (
    <div className="tooltip-content">
      <div key="header" className="header">
        {band?.getDescription()}
      </div>
      {payload
        .slice()
        .sort((a, b) => b.value - a.value)
        .map((point, i) => {
          const parentLine = series.find((line) => line.id === point.dataKey);
          const title = getSeriesTitle(parentLine, point.dataKey);
          const valString = point.value?.toFixed(2);
          return (
            <div key={`tooltip_line_${i}`} className="line-item">
              <div key={`tooltip_color_${i}`} className="box" style={{ backgroundColor: point.color }} />
              <div key={`tooltip_p_${i}`} className="name">{`${title}:`}</div>
              <div key={`tooltip_p_val_${i}`} className="value">
                {valString}
              </div>
            </div>
          );
        })}
    </div>
  );
};

const LineChart = ({ series, bands, selected }: LineChartProps) => {
  // Content initialises `series` to null before its data effect runs, so coalesce here:
  const seriesList = series ?? [];
  const bandList = bands ?? [];
  const selectedList = selected ?? [];

  const selectedSeries = seriesList
    .filter((s) => selectedList.find((sel) => sel === s.id))
    .sort((a, b) => a.renderIdx - b.renderIdx); // sort ascending to always display poi/aoi on top

  const maxReflectance = Math.max(
    1,
    seriesList
      .map((s) =>
        s.coordinates.reduce((acc, { value }) => (value > acc ? value : acc), Number.NEGATIVE_INFINITY),
      )
      .reduce((acc, value) => (value > acc ? value : acc), Number.NEGATIVE_INFINITY),
  );

  const chartData = buildChartData(selectedSeries, bandList);

  // match the previous semiotic axis: ticks every 0.1 reflectance up to the max
  const Y_TICK_STEP = 0.1;
  const yTicks = Array.from({ length: Math.ceil(maxReflectance / Y_TICK_STEP) + 1 }, (_, i) =>
    Number((i * Y_TICK_STEP).toFixed(1)),
  );

  return (
    <ReLineChart
      className="chart"
      width={930}
      height={450}
      data={chartData}
      margin={{ left: 0, right: 30, top: 30, bottom: 30 }}
    >
      <CartesianGrid strokeDasharray="5 5" stroke={styleVariables.chartGridColor} />
      <XAxis
        type="number"
        dataKey="wavelength"
        domain={[400, 'dataMax']}
        tickCount={10}
        tickMargin={10}
        stroke={styleVariables.textColor}
        tick={{ fill: styleVariables.textColor }}
        label={{
          value: spectralExplorerLabels.wavelength(),
          position: 'bottom',
          offset: 5,
          fill: styleVariables.textColor,
        }}
      />
      <YAxis
        type="number"
        domain={[0, maxReflectance]}
        ticks={yTicks}
        tickMargin={10}
        tickFormatter={(value) => value.toFixed(2)}
        stroke={styleVariables.textColor}
        tick={{ fill: styleVariables.textColor }}
        label={{
          value: spectralExplorerLabels.reflectance(),
          angle: -90,
          position: 'insideLeft',
          style: { textAnchor: 'middle', fill: styleVariables.textColor },
        }}
      />
      <Tooltip content={<SpectralTooltip series={seriesList} bands={bandList} />} isAnimationActive={false} />
      {selectedSeries.map((serie) => (
        <Line
          key={serie.id}
          type="linear"
          dataKey={serie.id}
          stroke={serie.color ?? styleVariables.whiteColor}
          strokeWidth={2}
          dot={{
            r: 4,
            fill: serie.color ?? styleVariables.whiteColor,
            stroke: serie.color ?? styleVariables.whiteColor,
          }}
          activeDot={{ r: 5, fill: serie.color ?? styleVariables.whiteColor }}
          connectNulls
          isAnimationActive={false}
        />
      ))}
    </ReLineChart>
  );
};

export default LineChart;
