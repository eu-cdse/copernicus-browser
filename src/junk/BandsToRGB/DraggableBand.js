import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { hasLongBandName } from './utils';

import { mainDarkest, whiteColor } from '../../variables.module.scss';

export const DraggableBand = ({ band, value, onChange, style }) => {
  const [textRunner, setTextRunner] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    item: { name: band.name, type: 'band' },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        value[dropResult.id] = item.name;
        onChange(value);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      key={band.name}
      className={`band-item ${hasLongBandName(band) ? 'band-item-runner' : ''}`}
      title={band.getDescription ? band.getDescription() : ''}
      style={{
        ...style,
        backgroundColor: band.color ? band.color : mainDarkest,
        ...(!band.color ? { color: whiteColor, textShadow: ' 0px 0px 1px rgba(255, 255, 255, 0.5)' } : {}),
        opacity: isDragging ? 0.4 : 1,
      }}
      onMouseDown={() => setTextRunner(false)}
      onMouseUp={() => setTextRunner(true)}
      onMouseEnter={() => setTextRunner(true)}
      onMouseLeave={() => setTextRunner(false)}
    >
      <span
        className={`${!textRunner && hasLongBandName(band) ? 'band-text' : ''} ${
          textRunner && hasLongBandName(band) ? 'band-text-runner' : ''
        }`}
      >
        {band.name}
      </span>
    </div>
  );
};
