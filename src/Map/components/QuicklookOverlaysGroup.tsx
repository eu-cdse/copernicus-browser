import React from 'react';
import QuicklookOverlay from '../plugins/QuicklookOverlay';
import type { QuicklookOverlay as QuicklookOverlayData } from '../../store/slices/mainMapSlice';

type Props = {
  quicklookOverlays?: QuicklookOverlayData[];
};

const QuicklookOverlaysGroup = ({ quicklookOverlays = [] }: Props) => {
  if (!Array.isArray(quicklookOverlays) || quicklookOverlays.length === 0) {
    return null;
  }

  return (
    <>
      {quicklookOverlays.map((overlay) => (
        <QuicklookOverlay key={overlay._internalId} quicklookOverlay={overlay} />
      ))}
    </>
  );
};

export default React.memo(QuicklookOverlaysGroup);
