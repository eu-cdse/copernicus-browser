import React from 'react';
import { useMap } from 'react-leaflet';
import Measure from './Measure/Measure';
import AOI from './AOI/AOI';
import POI from './POI/POI';
import LeafletPMLanguage from './LeafletPMLanguage';
import ImageDownloadBtn from './ImgDownload/ImageDownloadBtn';
import TimelapseButton from './Timelapse/TimelapseButton';
import { IS_3D_MODULE_ENABLED } from '../TerrainViewer/TerrainViewer.const';
import TerrainViewerButton from '../TerrainViewer/TerrainViewerButton';
import HistogramWrapper from './Histogram/HistogramWrapper';

import './Controls.scss';
import LOI from './LOI/LOI';

const MapControls = ({ shouldAnimateControls, selectedLanguage, histogramContainer }) => {
  const map = useMap();
  const animatedClass = shouldAnimateControls ? 'animated' : '';
  return (
    <>
      <LeafletPMLanguage map={map} />
      <AOI className={animatedClass} map={map} locale={selectedLanguage} />
      <LOI className={animatedClass} map={map} locale={selectedLanguage} />
      <POI className={animatedClass} map={map} locale={selectedLanguage} />
      <Measure className={animatedClass} map={map} locale={selectedLanguage} />
      <HistogramWrapper locale={selectedLanguage} histogramContainer={histogramContainer} />
    </>
  );
};

const Controls = ({
  is3D,
  shouldAnimateControls,
  selectedLanguage,
  showComparePanel,
  histogramContainer,
}) => (
  <div className="controls-wrapper">
    {!is3D && (
      <MapControls
        shouldAnimateControls={shouldAnimateControls}
        selectedLanguage={selectedLanguage}
        histogramContainer={histogramContainer}
      />
    )}
    <ImageDownloadBtn locale={selectedLanguage} showComparePanel={showComparePanel} />
    <TimelapseButton locale={selectedLanguage} showComparePanel={showComparePanel} />
    {IS_3D_MODULE_ENABLED && (
      <TerrainViewerButton locale={selectedLanguage} showComparePanel={showComparePanel} />
    )}
  </div>
);

export default Controls;
