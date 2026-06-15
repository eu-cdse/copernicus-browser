import React from 'react';
import { t } from 'ttag';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

import { useAppSelector } from '../../hooks';
import styleVariables from '../../variables.module.scss';

interface HistogramBucket {
  value: number;
  occurrences: number;
}

interface HistogramTooltipProps {
  active?: boolean;
  payload?: { payload: HistogramBucket }[];
}

const HistogramTooltip = ({ active, payload }: HistogramTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }
  const point = payload[0].payload;
  return (
    <div className="histogram-tooltip">
      <div>{`${t`Value`}: ${Number(point.value).toFixed(3)}`}</div>
      <div>{`${t`Frequency`}: ${point.occurrences}`}</div>
    </div>
  );
};

interface HistogramProps {
  data?: HistogramBucket[];
}

const Histogram = ({ data }: HistogramProps) => {
  // re-render (axis labels are translated) when the language changes
  useAppSelector((store) => store.language.selectedLanguage);

  const histogramData = data || [];
  const tickInterval = Math.max(0, Math.ceil(histogramData.length / 5) - 1);

  return (
    <div className="histogram">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={histogramData} margin={{ top: 30, right: 50, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="5 5" stroke={styleVariables.chartGridColor} />
          <XAxis
            dataKey="value"
            interval={tickInterval}
            tickFormatter={(value) => Number(value).toFixed(3)}
            stroke={styleVariables.textColor}
            tick={{ fill: styleVariables.textColor }}
            tickMargin={10}
            label={{ value: t`Value`, position: 'bottom', offset: 25, fill: styleVariables.textColor }}
          />
          <YAxis
            width={75}
            stroke={styleVariables.textColor}
            tick={{ fill: styleVariables.textColor }}
            tickMargin={10}
            tickCount={6}
            label={{
              value: t`Frequency`,
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              style: { textAnchor: 'middle', fill: styleVariables.textColor },
            }}
          />
          <Tooltip
            content={<HistogramTooltip />}
            cursor={{ fill: 'transparent' }}
            isAnimationActive={false}
          />
          <Bar
            dataKey="occurrences"
            fill={styleVariables.primaryColor}
            stroke={styleVariables.primaryColor}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Histogram;
