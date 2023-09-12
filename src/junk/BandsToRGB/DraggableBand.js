import React from 'react';
import { useDrag } from 'react-dnd';
import { mainDarkest, textColor } from '../../variables.module.scss';

export const DraggableBand = ({ band, value, onChange, style }) => {
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
      className="band-item"
      title={band.getDescription ? band.getDescription() : ''}
      style={{
        ...style,
        backgroundColor: band.color ? band.color : mainDarkest,
        ...(!band.color ? { color: textColor, textShadow: '1px 1px 3px rgba(255, 255, 255, 0.5)' } : {}),
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {band.name}
    </div>
  );
};
