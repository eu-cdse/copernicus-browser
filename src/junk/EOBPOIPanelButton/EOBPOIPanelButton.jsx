import React from 'react';
import { t } from 'ttag';
import FisChartLink from '../FisChartLink';
import { getLoggedInErrorMsg } from '../ConstMessages';
import '../EOBPanel.scss';
import PixelExplorer from '../../Controls/PixelExplorer/PixelExplorer';
import SpectralExplorerButton from '../../Controls/SpectralExplorer/SpectralExplorerButton';
import { connect } from 'react-redux';
import { modalSlice } from '../../store';
import { selectActiveExternalLayer } from '../../store/slices/externalLayersSlice';
import { ModalId, DATASOURCES } from '../../const';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

function EOBPOIPanelButton(props) {
  const errMsg = props.disabled ? getLoggedInErrorMsg() : null;
  const isEnabled = errMsg === null;
  const errorMessage = errMsg ? `\n(${errMsg})` : '';
  const panelTitle = t`Mark point of interest`;
  const panelTitleRemove = t`Remove point of interest`;

  const panelTitleFinal = props.poi ? panelTitleRemove : panelTitle;
  const title = panelTitleFinal + ` ${errorMessage}`;

  const renderMarkerIcon = () => (
    <span>
      {/* jsx-a11y/anchor-is-valid */}
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
      {!props.activeExternalLayer &&
        getDataSourceHandler(props.datasetId)?.datasource === DATASOURCES.CLMS_VECTOR && (
          <a
            title={t`Show feature info`}
            onClick={(e) => {
              e.stopPropagation();
              props.openFeatureInfo({
                datasetId: props.datasetId,
                lat: props.poiPosition.lat,
                lng: props.poiPosition.lng,
              });
            }}
          >
            <i className="fa fa-info-circle" />
          </a>
        )}
      {props.activeExternalLayer?.queryable && props.activeExternalLayer?.server?.infoFormat && (
        <a
          title={t`Show feature info`}
          onClick={(e) => {
            e.stopPropagation();
            const b = props.mapBounds;
            const pb = props.pixelBounds;
            props.openFeatureInfo({
              externalWms: {
                serverUrl: props.activeExternalLayer?.server?.url,
                layerName: props.activeExternalLayer?.layerName,
                layerTitle: props.activeExternalLayer?.layerTitle,
                infoFormat: props.activeExternalLayer?.server?.infoFormat,
                mapBounds: b
                  ? { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
                  : undefined,
                width: pb ? pb.max.x - pb.min.x : undefined,
                height: pb ? pb.max.y - pb.min.y : undefined,
              },
              lat: props.poiPosition.lat,
              lng: props.poiPosition.lng,
            });
          }}
        >
          <i className="fa fa-info-circle" />
        </a>
      )}
    </span>
  );

  const { poi } = props;
  return (
    <div className="poiPanel panelButton floatItem" title={title}>
      <PixelExplorer />
      {poi && !props.disabled && renderMarkerInfo()}
      {renderMarkerIcon()}
    </div>
  );
}

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  poiGeometry: store.poi.geometry,
  poiPosition: store.poi.position,
  activeExternalLayer: selectActiveExternalLayer(store),
  mapBounds: store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
});

const mapDispatchToProps = (dispatch) => ({
  openFeatureInfo: (params) => dispatch(modalSlice.actions.addModal({ modal: ModalId.FEATURE_INFO, params })),
});

export default connect(mapStoreToProps, mapDispatchToProps)(EOBPOIPanelButton);
