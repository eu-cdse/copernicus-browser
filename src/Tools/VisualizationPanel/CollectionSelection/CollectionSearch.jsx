import React from 'react';
import { t } from 'ttag';

import BadgeWrapper from '../../../components/BadgeWrapper/BadgeWrapper';

import Layer from './icons/Layer.svg?react';
import Highlight from './icons/Highlight.svg?react';
import Compare from './icons/Compare.svg?react';
import Pin from './icons/Pin.svg?react';

import './CollectionSearch.scss';

export const CollectionSearchTools = ({
  showLayerPanel,
  setShowLayerPanel,
  showHighlightPanel,
  setShowHighlightPanel,
  highlightsAvailable,
  newCompareLayersCount,
  showComparePanel,
  setComparePanel,
  newPinsCount,
  showPinPanel,
  setPinPanel,
}) => {
  const isLayerPanelActive = () => {
    if (!showLayerPanel) {
      setShowLayerPanel(!showLayerPanel);
    }
  };

  const isHighlightPanelActive = () => {
    if (!showHighlightPanel && highlightsAvailable) {
      setShowHighlightPanel(!showHighlightPanel);
    }
  };

  const isComparePanelActive = () => {
    if (!showComparePanel) {
      setComparePanel(!showComparePanel);
    }
  };

  const isPinPanelActive = () => {
    if (!showPinPanel) {
      setPinPanel(!showPinPanel);
    }
  };

  return (
    <div className="collection-search-tools">
      <BadgeWrapper
        className="collection-search-tools-wrapper"
        showLayerPanel={showLayerPanel}
        onClick={isLayerPanelActive}
      >
        <div
          className={`collection-search-tools-wrapper ${showLayerPanel ? 'active' : ''}`}
          title={t`Layers Panel`}
        >
          <Layer />
        </div>
      </BadgeWrapper>

      <BadgeWrapper
        className="collection-search-tools-wrapper"
        showHighlightPanel={showHighlightPanel}
        onClick={isHighlightPanelActive}
      >
        <div
          className={`collection-search-tools-wrapper ${showHighlightPanel ? 'active' : ''} ${
            highlightsAvailable ? '' : 'disabled'
          }`}
          title={t`Highlights Panel`}
        >
          <Highlight />
        </div>
      </BadgeWrapper>

      <BadgeWrapper
        showComparePanel={showComparePanel}
        count={newCompareLayersCount}
        onClick={isComparePanelActive}
      >
        <div
          className={`collection-search-tools-wrapper ${showComparePanel ? 'active' : ''}`}
          title={t`Compare Panel`}
        >
          <Compare />
        </div>
      </BadgeWrapper>

      <BadgeWrapper showPinPanel={showPinPanel} count={newPinsCount} onClick={isPinPanelActive}>
        <div
          className={`collection-search-tools-wrapper ${showPinPanel ? 'active' : ''}`}
          title={t`Pins Panel`}
        >
          <Pin />
        </div>
      </BadgeWrapper>
    </div>
  );
};

export const CollectionSearch = ({
  title,
  showLayerPanel,
  setShowLayerPanel,
  showHighlightPanel,
  setShowHighlightPanel,
  highlightsAvailable,
  showComparePanel,
  setComparePanel,
  showPinPanel,
  setPinPanel,
  newCompareLayersCount,
  newPinsCount,
}) => {
  return (
    <div className="collection-search" onClick={(e) => e.stopPropagation()}>
      <div className="collection-search-header">
        <div className="collection-search-title">{title}</div>
        <CollectionSearchTools
          showLayerPanel={showLayerPanel}
          setShowLayerPanel={setShowLayerPanel}
          showHighlightPanel={showHighlightPanel}
          setShowHighlightPanel={setShowHighlightPanel}
          highlightsAvailable={highlightsAvailable}
          newCompareLayersCount={newCompareLayersCount}
          showComparePanel={showComparePanel}
          setComparePanel={setComparePanel}
          newPinsCount={newPinsCount}
          showPinPanel={showPinPanel}
          setPinPanel={setPinPanel}
        />
      </div>
    </div>
  );
};
