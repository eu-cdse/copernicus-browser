import React from 'react';
import { ResponsiveXYFrame } from 'semiotic';
import { t } from 'ttag';
import store, { elevationProfileSlice } from '../../store';
import { mainDarkest, mainDark } from '../../variables.module.scss';

const margin = { left: 70, right: 30, top: 30, bottom: 55 };

const getFrameProps = ({ data, width, height }) => {
  const frameProps = {
    lines: data,
    size: [width - (margin.left + margin.right), height - (margin.bottom + margin.top)],
    margin: margin,
    responsiveWidth: true,

    lineType: { type: 'area' },

    xAccessor: (d) => d.distance,
    yAccessor: (d) => d.elevation,
    lineStyle: () => {
      return {
        stroke: mainDarkest,
        strokeWidth: 1,
        fill: mainDark,
        fillOpacity: 0.6,
      };
    },

    axes: [
      {
        orient: 'left',
        label: `${t`Elevation`} [m]`,
      },
      {
        orient: 'bottom',
        tickFormat: (d) => {
          return d > 0 ? `${d / 1000} km` : 0;
        },
        ticks: 5,
        label: `${t`Distance`} [km]`,
      },
    ],
    hoverAnnotation: [{ type: 'frame-hover' }, { type: 'x', disable: ['connector', 'note'] }],

    customHoverBehavior: (d) => {
      if (d) {
        store.dispatch(
          elevationProfileSlice.actions.setHighlightedPoint({
            geometry: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [d.lng, d.lat],
              },
            },
          }),
        );
      }
    },
  };
  return frameProps;
};

const getTooltipContent = (dataPoint) => {
  return (
    <div className="tooltip-content">
      <div>{`${t`Distance`}: ${(dataPoint.distance / 1000).toFixed(2)} km`}</div>
      <div>{`${t`Elevation`}: ${dataPoint.elevation.toFixed(2)} m`}</div>
      <div>{`${t`Slope`}: ${dataPoint.slope.toFixed(2)}%`}</div>
    </div>
  );
};

const ElevationProfileChart = ({ data = [], width, height }) => {
  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <div className="container">
      <ResponsiveXYFrame
        key={`elevation-profile-chart`}
        {...getFrameProps({
          data: data,
          width,
          height,
        })}
        tooltipContent={(dataPoint) => getTooltipContent(dataPoint)}
      />
    </div>
  );
};

export default ElevationProfileChart;
