import React, { Component } from 'react';
import Measure from './Measure/Measure';
import AOI from './AOI/AOI';
import POI from './POI/POI';
import LeafletPMLanguage from './LeafletPMLanguage';
import ImageDownloadBtn from './ImgDownload/ImageDownloadBtn';
import TimelapseButton from './Timelapse/TimelapseButton';
import { IS_3D_MODULE_ENABLED } from '../TerrainViewer/TerrainViewer.const';
import TerrainViewerButton from '../TerrainViewer/TerrainViewerButton';
import HistogramWrapper from './Histogram/HistogramWrapper';
import { withLeaflet } from 'react-leaflet';

import './Controls.scss';
import LOI from './LOI/LOI';

class Controls extends Component {
  render() {
    const { is3D, shouldAnimateControls } = this.props;
    const animatedClass = shouldAnimateControls ? 'animated' : '';
    return (
      <div className="controls-wrapper">
        {!is3D && (
          <>
            <LeafletPMLanguage map={this.props.leaflet.map} />
            <AOI
              className={animatedClass}
              map={this.props.leaflet.map}
              locale={this.props.selectedLanguage}
            />
            <LOI
              className={animatedClass}
              map={this.props.leaflet.map}
              locale={this.props.selectedLanguage}
            />
            <POI
              className={animatedClass}
              map={this.props.leaflet.map}
              locale={this.props.selectedLanguage}
            />
            <Measure
              className={animatedClass}
              map={this.props.leaflet.map}
              locale={this.props.selectedLanguage}
            />
          </>
        )}
        <ImageDownloadBtn
          locale={this.props.selectedLanguage}
          showComparePanel={this.props.showComparePanel}
        />
        <TimelapseButton
          locale={this.props.selectedLanguage}
          showComparePanel={this.props.showComparePanel}
        />
        {IS_3D_MODULE_ENABLED && (
          <TerrainViewerButton
            locale={this.props.selectedLanguage}
            showComparePanel={this.props.showComparePanel}
          />
        )}
        {!is3D && (
          <HistogramWrapper
            locale={this.props.selectedLanguage}
            histogramContainer={this.props.histogramContainer}
          />
        )}
      </div>
    );
  }
}

export default withLeaflet(Controls);
