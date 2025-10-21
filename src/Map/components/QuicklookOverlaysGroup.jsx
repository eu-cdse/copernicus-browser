import React from 'react';
import QuicklookOverlay from '../plugins/QuicklookOverlay';

const QuicklookOverlaysGroup = ({ quicklookImages = [] }) => {
  if (!Array.isArray(quicklookImages) || quicklookImages.length === 0) {
    return null;
  }

  return (
    <>
      {quicklookImages.map((overlay) => (
        <QuicklookOverlay
          key={overlay._internalId}
          quicklookOverlay={overlay}
          quicklookImages={quicklookImages}
        />
      ))}
    </>
  );
};

export default React.memo(QuicklookOverlaysGroup);
