import React from 'react';
import { useDrop } from 'react-dnd';
import { randomGrayColor } from '../../variables.module.scss';

export const SelectedBand = ({ bands, bandName, value, showName }) => {
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
      >
        <div
          className="selected-band"
          style={{
            backgroundColor: (band && band.color) || randomGrayColor,
          }}
          title={(band && band.description) || 'Drag band'}
        >
          {(value && value[bandName]) || bandName.toUpperCase()}
        </div>
      </div>
    </React.Fragment>
  );
};
