import React from 'react';
import { t } from 'ttag';

import BadgeWrapper from '../../../components/BadgeWrapper/BadgeWrapper';
import CollectionTooltip from './CollectionTooltip/CollectionTooltip';

import Layer from './icons/Layer.svg?react';
import Highlight from './icons/Highlight.svg?react';
import Compare from './icons/Compare.svg?react';
import Pin from './icons/Pin.svg?react';
import DatasetLinked from './icons/DatasetLinked.svg?react';

import './CollectionSearch.scss';

export const CollectionSearchTools = ({
  showLayerPanel,
  setShowLayerPanel,
  showHighlightPanel,
  setShowHighlightPanel,
  highlightsAvailable,
  comparedLayersCount,
  showComparePanel,
  setComparePanel,
  pinsCount,
  showPinPanel,
  setPinPanel,
  onOpenExternalLayers,
  showExternalLayersPanel,
  onCloseExternalLayers,
}) => {
  // The Layers panel is the default view, so this always activates it (no toggle-off): clicking
  // the Layers button when it is already open keeps it open rather than closing it.
  const isLayerPanelActive = () => {
    setShowLayerPanel(true);
    setShowHighlightPanel(false);
    setComparePanel(false);
    setPinPanel(false);
    onCloseExternalLayers?.();
  };

  const isHighlightPanelActive = () => {
    if (!showHighlightPanel && highlightsAvailable) {
      setShowHighlightPanel(true);
      setShowLayerPanel(false);
      setComparePanel(false);
      setPinPanel(false);
      onCloseExternalLayers?.();
    }
  };

  const isComparePanelActive = () => {
    if (!showComparePanel) {
      setComparePanel(true);
      setShowLayerPanel(false);
      setShowHighlightPanel(false);
      setPinPanel(false);
      onCloseExternalLayers?.();
    }
  };

  const isPinPanelActive = () => {
    if (!showPinPanel) {
      setPinPanel(true);
      setShowLayerPanel(false);
      setShowHighlightPanel(false);
      setComparePanel(false);
      onCloseExternalLayers?.();
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
          className={`collection-search-tools-wrapper ${
            showLayerPanel && !showExternalLayersPanel ? 'active' : ''
          }`}
          title={t`Layers Panel`}
          id="layers-panel-button"
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
          id="highlights-panel-button"
        >
          <Highlight />
        </div>
      </BadgeWrapper>

      <BadgeWrapper active={showComparePanel} count={comparedLayersCount} onClick={isComparePanelActive}>
        <div
          className={`collection-search-tools-wrapper ${showComparePanel ? 'active' : ''}`}
          title={t`Compare Panel`}
          id="compare-panel-button"
        >
          <Compare />
        </div>
      </BadgeWrapper>

      <BadgeWrapper active={showPinPanel} count={pinsCount} onClick={isPinPanelActive}>
        <div
          className={`collection-search-tools-wrapper ${showPinPanel ? 'active' : ''}`}
          title={t`Pins Panel`}
          id="pins-panel-button"
        >
          <Pin />
        </div>
      </BadgeWrapper>

      <BadgeWrapper onClick={onOpenExternalLayers}>
        <div
          className={`collection-search-tools-wrapper ${showExternalLayersPanel ? 'active' : ''}`}
          title={t`WMS/WMTS Panel`}
          id="external-layers-panel-button"
        >
          <DatasetLinked />
        </div>
      </BadgeWrapper>
    </div>
  );
};

export const CollectionSearch = ({
  title,
  infoTooltip,
  showLayerPanel,
  setShowLayerPanel,
  showHighlightPanel,
  setShowHighlightPanel,
  highlightsAvailable,
  showComparePanel,
  setComparePanel,
  showPinPanel,
  setPinPanel,
  comparedLayersCount,
  pinsCount,
  onOpenExternalLayers,
  showExternalLayersPanel,
  onCloseExternalLayers,
}) => {
  return (
    <div className="collection-search" onClick={(e) => e.stopPropagation()}>
      <div className="collection-search-header">
        <div className="collection-search-title">
          {title}
          {infoTooltip && <CollectionTooltip source={infoTooltip} credits={null} />}
        </div>
        <CollectionSearchTools
          showLayerPanel={showLayerPanel}
          setShowLayerPanel={setShowLayerPanel}
          showHighlightPanel={showHighlightPanel}
          setShowHighlightPanel={setShowHighlightPanel}
          highlightsAvailable={highlightsAvailable}
          comparedLayersCount={comparedLayersCount}
          showComparePanel={showComparePanel}
          setComparePanel={setComparePanel}
          pinsCount={pinsCount}
          showPinPanel={showPinPanel}
          setPinPanel={setPinPanel}
          onOpenExternalLayers={onOpenExternalLayers}
          showExternalLayersPanel={showExternalLayersPanel}
          onCloseExternalLayers={onCloseExternalLayers}
        />
      </div>
    </div>
  );
};
