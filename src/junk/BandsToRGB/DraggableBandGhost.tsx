import { usePreview } from 'react-dnd-multi-backend';
import { DraggableBand } from './DraggableBand';
import { BandDragItem, DraggableBandGhostProps } from './types';

export const DraggableBandGhost = ({ bands }: DraggableBandGhostProps) => {
  const preview = usePreview<BandDragItem>();
  if (!preview.display) {
    return null;
  }

  const { style, item } = preview;
  const ghost = bands.find((band) => band.name === item.name);
  if (!ghost) {
    return null;
  }
  return <DraggableBand band={ghost} style={style} />;
};
