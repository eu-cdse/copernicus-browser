import React from 'react';
import { Preview, PreviewContext } from 'react-dnd-multi-backend';
import { DraggableBand } from './DraggableBand';

/**
 * Drag preview necessary only on touch devices, when using the reactdnd touch backend engine
 */
export const DraggableBandGhost = ({ bands }) => {
  const GeneratePreview = () => {
    const { style, item } = React.useContext(PreviewContext);
    const ghost = bands.find((band) => band.name === item.name);

    return <DraggableBand band={ghost} style={style} />;
  };

  return (
    <Preview>
      <GeneratePreview />
    </Preview>
  );
};
