import { useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { hasLongBandName } from './utils';
import styles from '../../variables.module.scss';
import { BandDragItem, BandDropResult, DraggableBandProps } from './types';

export const DraggableBand = <T extends object = Record<string, string | null>>({
  band,
  value,
  onChange,
  style,
}: DraggableBandProps<T>) => {
  const [textRunner, setTextRunner] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag<BandDragItem, BandDropResult, { isDragging: boolean }>({
    type: 'band',
    item: { name: band.name },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult && value && onChange) {
        onChange({ ...value, [dropResult.id]: item.name } as T);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  return (
    <div
      ref={ref}
      key={band.name}
      className={`band-item ${hasLongBandName(band) ? 'band-item-runner' : ''}`}
      title={band.getDescription ? band.getDescription() : ''}
      style={{
        ...style,
        backgroundColor: band.color ? band.color : styles.mainDarkest,
        ...(!band.color
          ? { color: styles.whiteColor, textShadow: ' 0px 0px 1px rgba(255, 255, 255, 0.5)' }
          : {}),
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
