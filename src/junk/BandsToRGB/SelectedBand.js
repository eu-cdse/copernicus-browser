import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { hasLongBandName } from './utils';
import { randomGrayColor } from '../../variables.module.scss';

export const SelectedBand = ({ bands, bandName, value, showName }) => {
  const [textRunner, setTextRunner] = useState(false);
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'band',
    drop: () => ({
      id: bandName,
    }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const band = value && bands.find((b) => b.name === value[bandName]);

  return (
    <React.Fragment key={bandName}>
      {showName && <b>{bandName.toUpperCase()}:</b>}
      <div
        className={`col-holder${canDrop ? ' can-drop' : ''}${canDrop && isOver ? ' is-active' : ''}`}
        id={bandName}
        name={bandName}
        ref={drop}
        onMouseDown={() => setTextRunner(false)}
        onMouseUp={() => setTextRunner(true)}
        onMouseEnter={() => setTextRunner(true)}
        onMouseLeave={() => setTextRunner(false)}
      >
        <div
          className={`selected-band ${hasLongBandName(band) ? 'selected-band-runner' : ''}`}
          style={{
            backgroundColor: (band && band.color) || randomGrayColor,
            textShadow: (band && band.color) || '0px 0px 1px rgba(255, 255, 255, 0.5)',
          }}
          title={hasLongBandName(band) ? '' : (band && band.description) || 'Drag band'}
        >
          <span
            className={`${!textRunner && hasLongBandName(band) ? 'band-text' : ''} ${
              textRunner && hasLongBandName(band) ? 'band-text-runner' : ''
            }`}
          >
            {(value && value[bandName]) || bandName.toUpperCase()}
          </span>
        </div>
      </div>
    </React.Fragment>
  );
};
