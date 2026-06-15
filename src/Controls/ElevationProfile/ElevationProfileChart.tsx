import React from 'react';
import { t } from 'ttag';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import store, { elevationProfileSlice } from '../../store';
import styleVariables from '../../variables.module.scss';

const margin = { left: 20, right: 30, top: 30, bottom: 25 };

// the chart is sized off the dialog dimensions; these offsets leave room for the
// dialog's horizontal padding and the title bar / legend below the chart.
const CHART_WIDTH_OFFSET = 30;
const CHART_HEIGHT_OFFSET = 90;

interface ElevationPoint {
  lng: number;
  lat: number;
  elevation: number;
  distance: number;
  slope: number;
}

interface ElevationLine {
  coordinates: ElevationPoint[];
}

interface ElevationTooltipProps {
  active?: boolean;
  payload?: { payload: ElevationPoint }[];
}

const ElevationProfileTooltip = ({ active, payload }: ElevationTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }
  const dataPoint = payload[0].payload;
  return (
    <div className="tooltip-content">
      <div>{`${t`Distance`}: ${(dataPoint.distance / 1000).toFixed(2)} km`}</div>
      <div>{`${t`Elevation`}: ${dataPoint.elevation.toFixed(2)} m`}</div>
      <div>{`${t`Slope`}: ${dataPoint.slope.toFixed(2)}%`}</div>
    </div>
  );
};

interface ElevationProfileChartProps {
  data?: ElevationLine;
  width: number;
  height: number;
}

const ElevationProfileChart = ({ data, width, height }: ElevationProfileChartProps) => {
  if (!data || !data.coordinates) {
    return <div>{t`No data available`}</div>;
  }

  const coordinates = data.coordinates;

  return (
    <div className="container">
      <AreaChart
        width={width - CHART_WIDTH_OFFSET}
        height={height - CHART_HEIGHT_OFFSET}
        data={coordinates}
        margin={margin}
        onMouseMove={(state) => {
          const index = Number(state?.activeTooltipIndex);
          const point = Number.isInteger(index) ? coordinates[index] : undefined;
          if (point) {
            store.dispatch(
              elevationProfileSlice.actions.setHighlightedPoint({
                geometry: {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [point.lng, point.lat],
                  },
                },
              }),
            );
          }
        }}
        onMouseLeave={() => store.dispatch(elevationProfileSlice.actions.reset())}
      >
        <CartesianGrid strokeDasharray="5 5" stroke={styleVariables.chartGridColor} />
        <XAxis
          type="number"
          dataKey="distance"
          domain={['auto', 'auto']}
          allowDecimals={false}
          tickFormatter={(d) => `${d / 1000} km`}
          stroke={styleVariables.textColor}
          tick={{ fill: styleVariables.textColor }}
          tickMargin={10}
          label={{
            value: `${t`Distance`} [km]`,
            position: 'bottom',
            offset: 5,
            fill: styleVariables.textColor,
          }}
        />
        <YAxis
          dataKey="elevation"
          width={75}
          domain={['auto', 'auto']}
          allowDecimals={false}
          stroke={styleVariables.textColor}
          tick={{ fill: styleVariables.textColor }}
          tickMargin={10}
          label={{
            value: `${t`Elevation`} [m]`,
            angle: -90,
            position: 'insideLeft',
            offset: 0,
            style: { textAnchor: 'middle', fill: styleVariables.textColor },
          }}
        />
        <Tooltip
          content={<ElevationProfileTooltip />}
          cursor={{ stroke: styleVariables.mainDarkest }}
          isAnimationActive={false}
        />
        <Area
          type="linear"
          dataKey="elevation"
          stroke={styleVariables.mainDarkest}
          strokeWidth={1}
          fill={styleVariables.mainDark}
          fillOpacity={0.6}
          activeDot={{ r: 4, fill: styleVariables.mainDarkest, stroke: styleVariables.textColor }}
          isAnimationActive={false}
        />
      </AreaChart>
    </div>
  );
};

export default ElevationProfileChart;
