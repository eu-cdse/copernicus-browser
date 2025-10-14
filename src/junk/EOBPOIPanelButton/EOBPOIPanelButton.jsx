import React from 'react';
import { t } from 'ttag';
import FisChartLink from '../FisChartLink';
import { getLoggedInErrorMsg } from '../ConstMessages';
import '../EOBPanel.scss';
import PixelExplorer from '../../Controls/PixelExplorer/PixelExplorer';
import SpectralExplorerButton from '../../Controls/SpectralExplorer/SpectralExplorerButton';
import { connect } from 'react-redux';

function EOBPOIPanelButton(props) {
  const errMsg = props.disabled ? getLoggedInErrorMsg() : null;
  const isEnabled = errMsg === null;
  const errorMessage = errMsg ? `\n(${errMsg})` : '';
  const title = t`Mark point of interest` + ` ${errorMessage}`;

  const renderMarkerIcon = () => (
    <span title={title}>
      {/* jsx-a11y/anchor-is-valid */}
      {/* eslint-disable-next-line */}
      <a
        className={`drawGeometry ${props.disabled ? 'disabled' : ''} ${props.active ? 'active' : ''} ${
          props.active ? 'open-options' : ''
        }`}
        onClick={() => {
          if (!isEnabled) {
            props.onErrorMessage(title);
            return;
          }

          if (!!props.poi) {
            props.deleteMarker();
          } else {
            props.drawMarker();
          }
        }}
      >
        <i className="fa fa-map-marker" />
      </a>
    </span>
  );

  const renderMarkerInfo = () => (
    <span style={{ display: 'inline-flex' }}>
      {/* jsx-a11y/anchor-is-valid */}
      {/* eslint-disable-next-line */}
      <a onClick={() => props.centerOnFeature('poiLayer')} title={t`Center map on feature`}>
        <i className="fa fa-crosshairs" />
      </a>
      {props.poi && (
        <FisChartLink
          aoiOrPoi="poi"
          selectedResult={props.selectedResult}
          openFisPopup={props.openFisPopup}
          presetLayerName={props.presetLayerName}
          fisShadowLayer={props.fisShadowLayer}
          onErrorMessage={props.onErrorMessage}
        />
      )}
      {props.poi && (
        <SpectralExplorerButton
          datasetId={props.datasetId}
          geometry={props.poiGeometry}
          onErrorMessage={props.onErrorMessage}
          geometryType="poi"
        />
      )}
    </span>
  );

  const { poi } = props;
  return (
    <div className="poiPanel panelButton floatItem" title={t`Area of interest`}>
      <PixelExplorer />
      {poi && !props.disabled && renderMarkerInfo()}
      {renderMarkerIcon()}
    </div>
  );
}

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  poiGeometry: store.poi.geometry,
});

export default connect(mapStoreToProps)(EOBPOIPanelButton);
