import React from 'react';
import geo_area from '@mapbox/geojson-area';
import { t } from 'ttag';

// import FisChartLink from '../FisChartLink';
import { getLoggedInErrorMsg } from '../ConstMessages';
import { AOI_SHAPE /*, ModalId*/ } from '../../const';
import SpectralExplorerButton from '../../Controls/SpectralExplorer/SpectralExplorerButton';
import FisChartLink from '../../../src/junk/FisChartLink';

import '../EOBPanel.scss';
import CopyToClipboardButton from '../../components/CopyToClipboardButton/CopyToClipboardButton';

export class EOBAOIPanelButton extends React.Component {
  state = {
    showOptions: false,
  };

  showOptions = () => {
    if (this.hideOptionsTimeout) {
      clearTimeout(this.hideOptionsTimeout);
      this.hideOptionsTimeout = null;
    }
    this.setState({ showOptions: true });
  };

  hideOptions = () => {
    this.hideOptionsTimeout = setTimeout(() => {
      this.setState({ showOptions: false });
    }, 400);
  };

  renderOptionButtons = () => (
    <div className="aoiCords">
      {!this.props.aoiBounds && (
        <OpenUploadDataDialogButton handleClick={this.props.openUploadGeoFileDialog} />
      )}
      {
        // jsx-a11y/anchor-is-valid
        // eslint-disable-next-line
        <a
          onClick={() => {
            this.props.onDrawShape(AOI_SHAPE.rectangle);
          }}
          title={t`Draw rectangular area of interest for image downloads and timelapse`}
        >
          <i className={`far fa-square`} />
        </a>
      }
      {
        // jsx-a11y/anchor-is-valid
        // eslint-disable-next-line
        <a
          onClick={() => {
            this.props.onDrawShape(AOI_SHAPE.polygon);
          }}
          title={t`Draw polygonal area of interest for image downloads and timelapse`}
        >
          <i className={`fa fa-pencil`} />
        </a>
      }
    </div>
  );

  renderAioInfo = () => {
    const area = (parseFloat(geo_area.geometry(this.props.aoiBounds)) / 1000000).toFixed(2);
    return (
      <span className="aoiCords">
        <CopyToClipboardButton
          className={`copy-coord`}
          title={t`Copy geometry to clipboard`}
          value={this.props.aoiBounds}
        />
        {!isNaN(area) && (
          <span className="area-text">
            {area} {t`km`}
            <sup>2</sup>
          </span>
        )}
        <span style={{ display: 'inline-flex' }}>
          {
            // jsx-a11y/anchor-is-valid
            // eslint-disable-next-line
            <a
              onClick={this.props.resetAoi}
              title={this.props.isAoiClip ? t`Cancel edit.` : t`Remove geometry`}
            >
              <i className={`fa fa-close`} />
            </a>
          }
          {
            // jsx-a11y/anchor-is-valid
            // eslint-disable-next-line
            <a onClick={() => this.props.centerOnFeature('aoiLayer')} title={t`Center map on feature`}>
              <i className={`fa fa-crosshairs`} />
            </a>
          }
          {this.props.aoiBounds && (
            <FisChartLink
              aoiOrPoi={'aoi'}
              selectedResult={this.props.selectedResult}
              openFisPopup={this.props.openFisPopup}
              presetLayerName={this.props.presetLayerName}
              fisShadowLayer={this.props.fisShadowLayer}
              onErrorMessage={this.props.onErrorMessage}
              // active={this.props.modalId === ModalId.FIS}
            />
          )}

          <SpectralExplorerButton
            datasetId={this.props.datasetId}
            geometry={this.props.aoiGeometry}
            onErrorMessage={this.props.onErrorMessage}
            geometryType={'aoi'}
          />
        </span>
      </span>
    );
  };

  render() {
    const { aoiBounds, isAoiClip } = this.props;
    const { showOptions } = this.state;
    const doWeHaveAOI = aoiBounds || isAoiClip;
    const showOptionsMenu = showOptions || doWeHaveAOI;
    const errMsg = this.props.disabled ? getLoggedInErrorMsg() : null;
    const isEnabled = errMsg === null;
    const title = t`Create an area of interest`;

    return (
      <div
        className="aoiPanel panelButton floatItem"
        onMouseEnter={!this.props.disabled ? this.showOptions : null}
        onMouseLeave={!this.props.disabled ? this.hideOptions : null}
        onClick={(ev) => {
          if (!isEnabled) {
            this.props.onErrorMessage(title);
          }
        }}
        title={title}
      >
        {doWeHaveAOI && !this.props.disabled && this.renderAioInfo()}
        {showOptionsMenu && this.renderOptionButtons()}
        {
          // jsx-a11y/anchor-is-valid
          // eslint-disable-next-line
          <a
            className={`drawGeometry ${this.props.disabled ? 'disabled' : ''} ${
              this.props.active ? 'active' : ''
            }`}
          >
            <i>
              <PolygonSvgIcon />
            </i>
          </a>
        }
      </div>
    );
  }
}

const OpenUploadDataDialogButton = ({ handleClick }) => (
  // jsx-a11y/anchor-is-valid
  // eslint-disable-next-line
  <a title={t`Upload a file to create an area of interest`} onClick={handleClick}>
    <i className="fa fa-upload" />
  </a>
);

const PolygonSvgIcon = ({ fillColor }) => (
  <svg height="21px" version="1.1" viewBox="0 0 16 16" width="21px" xmlns="http://www.w3.org/2000/svg">
    <defs id="defs4" />
    <g id="layer1" transform="translate(0,-1036.3622)">
      <path
        d="M 8,0.75 0.75,6.5 4,15.25 l 8,0 3.25,-8.75 z"
        id="path2985"
        fill={fillColor || '#fbfffe'}
        transform="translate(0,1036.3622)"
      />
    </g>
  </svg>
);
