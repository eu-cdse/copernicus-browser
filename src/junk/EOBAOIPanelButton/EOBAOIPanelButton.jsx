import React, { useState } from 'react';
import geo_area from '@mapbox/geojson-area';
import { t } from 'ttag';

import { getLoggedInErrorMsg } from '../ConstMessages';
import { AOI_SHAPE } from '../../const';
import SpectralExplorerButton from '../../Controls/SpectralExplorer/SpectralExplorerButton';
import FisChartLink from '../../../src/junk/FisChartLink';

import '../EOBPanel.scss';
import CopyToClipboardButton from '../../components/CopyToClipboardButton/CopyToClipboardButton';

function OpenUploadDataDialogButton({ handleClick }) {
  return (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a title={t`Upload a file to create an area of interest`} onClick={handleClick}>
      <i className="fa fa-upload" />
    </a>
  );
}

function PolygonSvgIcon({ fillColor }) {
  return (
    <svg height="21px" width="21px" viewBox="0 0 16 16">
      <path d="M 8,1 1,7 4,15 h8 l3-8z" fill={fillColor || '#fbfffe'} />
    </svg>
  );
}

export function EOBAOIPanelButton(props) {
  const [showOptions, setShowOptions] = useState(false);

  const { aoiBounds, isAoiClip, disabled, active, aoiGeometry } = props;
  const hasAOI = aoiBounds || isAoiClip;
  const showOptionsMenu = showOptions || hasAOI;
  const errorMsg = disabled ? getLoggedInErrorMsg() : null;
  const isEnabled = errorMsg === null;
  const panelTitle = t`Create an area of interest`;

  function renderOptionButtons() {
    return (
      <div className="aoiCords">
        {!props.aoiBounds && <OpenUploadDataDialogButton handleClick={props.openUploadGeoFileDialog} />}
        {/* jsx-a11y/anchor-is-valid */}
        {/* eslint-disable-next-line */}
        <a
          onClick={() => props.onDrawShape(AOI_SHAPE.rectangle)}
          title={t`Draw rectangular area of interest for image downloads and timelapse`}
        >
          <i className="far fa-square" />
        </a>
        {/* jsx-a11y/anchor-is-valid */}
        {/* eslint-disable-next-line */}
        <a
          onClick={() => props.onDrawShape(AOI_SHAPE.polygon)}
          title={t`Draw polygonal area of interest for image downloads and timelapse`}
        >
          <i className="fa fa-pencil" />
        </a>
      </div>
    );
  }

  function renderAoiInfo() {
    const areaSqKm = parseFloat(geo_area.geometry(props.aoiBounds)) / 1e6;
    const areaLabel =
      areaSqKm < 0.01 ? `${(areaSqKm * 1e6).toFixed(2)} ${t`m`}` : `${areaSqKm.toFixed(2)} ${t`km`}`;

    return (
      <span className="aoiCords">
        {!!aoiGeometry && (
          <CopyToClipboardButton
            className="copy-coord"
            title={t`Copy geometry to clipboard`}
            value={props.aoiBounds}
          />
        )}
        {!isNaN(areaSqKm) && !!aoiGeometry && (
          <span className="area-text">
            {areaLabel}
            <sup>2</sup>
          </span>
        )}
        <span style={{ display: 'inline-flex' }}>
          {/* jsx-a11y/anchor-is-valid */}
          {/* eslint-disable-next-line */}
          <a onClick={() => props.centerOnFeature('aoiLayer')} title={t`Center map on feature`}>
            <i className="fa fa-crosshairs" />
          </a>
          {props.aoiBounds && (
            <FisChartLink
              aoiOrPoi="aoi"
              selectedResult={props.selectedResult}
              openFisPopup={props.openFisPopup}
              presetLayerName={props.presetLayerName}
              fisShadowLayer={props.fisShadowLayer}
              onErrorMessage={props.onErrorMessage}
            />
          )}
          <SpectralExplorerButton
            datasetId={props.datasetId}
            geometry={aoiGeometry}
            onErrorMessage={props.onErrorMessage}
            geometryType="aoi"
          />
        </span>
      </span>
    );
  }

  return (
    <div
      className="aoiPanel panelButton floatItem"
      onClick={(ev) => {
        if (!isEnabled) {
          props.onErrorMessage(panelTitle);
        }
      }}
      title={panelTitle}
    >
      {hasAOI && !disabled && renderAoiInfo()}
      {showOptionsMenu && renderOptionButtons()}
      {/* jsx-a11y/anchor-is-valid */}
      {/* eslint-disable-next-line */}
      <a
        className={`drawGeometry ${disabled ? 'disabled' : ''} ${active ? 'active' : ''} ${
          showOptionsMenu ? 'open-options' : ''
        }`}
        onClick={() => {
          if (showOptionsMenu) {
            props.resetAoi();
          }
          setShowOptions(!showOptionsMenu);
        }}
      >
        <i>
          <PolygonSvgIcon />
        </i>
      </a>
    </div>
  );
}
