import React, { Component } from 'react';
import { t } from 'ttag';

import { EOBCCSlider } from '../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { getDatasetLabel } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  dateTimeDisplayFormat,
  isImageApplicable,
  isImageCoverageEnough,
  isImageClearEnough,
  isImageSelected,
} from './Timelapse.utils';
import Loader from '../../Loader/Loader';

export class TimelapseImages extends Component {
  renderImage(image, i) {
    const {
      selectedPeriod,
      canWeFilterByClouds,
      canWeFilterByCoverage,
      maxCCPercentAllowed,
      minCoverageAllowed,
      activeImageIndex,
    } = this.props;

    const isApplicable = isImageApplicable(
      image,
      canWeFilterByClouds,
      canWeFilterByCoverage,
      maxCCPercentAllowed,
      minCoverageAllowed,
    );
    const isSelected = isImageSelected(image);
    const isClearEnough =
      image && isImageClearEnough(image.averageCloudCoverPercent, canWeFilterByClouds, maxCCPercentAllowed);
    const isCoverageEnough =
      image && isImageCoverageEnough(image.coveragePercent, canWeFilterByCoverage, minCoverageAllowed);

    return (
      <div className="image-container" key={i}>
        <div
          className={`image-item ${i === activeImageIndex ? 'active' : ''} ${
            !isApplicable ? 'not-applicable' : ''
          }`}
        >
          {!isCoverageEnough ? <i className="fas fa-border-all" /> : null}
          {!isClearEnough ? <i className="fas fa-cloud-sun" /> : null}

          {isClearEnough && isCoverageEnough ? (
            <span
              className={`image-select ${isSelected ? 'selected' : ''}`}
              onClick={() => this.props.toggleImageSelected(i)}
            />
          ) : null}

          {image.url ? (
            <img className="image" src={image.url} alt="" onClick={() => this.props.setImageToActive(i)} />
          ) : isApplicable ? (
            <Loader />
          ) : null}
          <i className="image-date">{dateTimeDisplayFormat(image.toTime, selectedPeriod)}</i>
        </div>
        {isApplicable ? (
          <div className="dataset-info">
            {image.pin ? (
              <span className="break">{image.pin.title}</span>
            ) : (
              <>
                <span>{getDatasetLabel(image.datasetId)}</span>
                <span className="break">{image.customSelected ? 'Custom' : image.layer.title}</span>
              </>
            )}
            {image.coveragePercent !== undefined ? (
              <span>
                {t`Coverage`}: {Math.round(image.coveragePercent)}%
              </span>
            ) : null}
            {image.averageCloudCoverPercent !== undefined ? (
              <span>
                {t`Cloud cover`}: {Math.round(image.averageCloudCoverPercent)}%
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  render() {
    const {
      images,
      loadingImages,
      canWeFilterByClouds,
      canWeFilterByCoverage,
      maxCCPercentAllowed,
      minCoverageAllowed,
      isSelectAllChecked,
      enableBorders,
      showBorders,
      is3D,
    } = this.props;

    if (!images) {
      return null;
    }
    return (
      <>
        <h2>{t`Visualisations`}</h2>
        <div className="container">
          <div className="filter-tools">
            {canWeFilterByCoverage ? (
              <div className={`ccslider ${loadingImages && is3D ? 'disabled' : ''}`}>
                {t`Min. tile coverage`}:
                <EOBCCSlider
                  sliderWidth={100}
                  onChange={this.props.setMinCoverageAllowed}
                  cloudCoverPercentage={Math.round(minCoverageAllowed)}
                  icon={'fas fa-border-all'}
                />
              </div>
            ) : null}
          </div>

          <div className="filter-tools">
            {canWeFilterByClouds ? (
              <div className={`ccslider ${loadingImages && is3D ? 'disabled' : ''}`}>
                {t`Max. cloud coverage`}:
                <EOBCCSlider
                  sliderWidth={100}
                  onChange={this.props.setMaxCCPercentAllowed}
                  cloudCoverPercentage={Math.round(maxCCPercentAllowed)}
                />
              </div>
            ) : null}
          </div>

          <div className="overlays">
            <div className="checkbox">
              <label className="label">
                <input
                  type="checkbox"
                  checked={showBorders}
                  value={showBorders}
                  disabled={!enableBorders || loadingImages}
                  onChange={this.props.toggleShowBorders}
                />
                {t`Borders`}
              </label>
            </div>
          </div>

          <div className="select-all">
            <label className="left">
              <input
                type="checkbox"
                checked={isSelectAllChecked}
                value={isSelectAllChecked}
                onChange={this.props.toggleAllImagesSelected}
              />
              {t`Select All`}
            </label>
          </div>
        </div>

        <div className="images">
          {!images ? <span className="loader" /> : images.map(this.renderImage.bind(this))}
        </div>
      </>
    );
  }
}
