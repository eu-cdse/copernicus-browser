import React from 'react';
import { t } from 'ttag';
import FisChartLink from '../FisChartLink';
import { getLoggedInErrorMsg } from '../ConstMessages';
import '../EOBPanel.scss';
import PixelExplorer from '../../Controls/PixelExplorer/PixelExplorer';
import SpectralExplorerButton from '../../Controls/SpectralExplorer/SpectralExplorerButton';
import { connect } from 'react-redux';

class EOBPOIPanelButton extends React.Component {
  state = {
    showOptions: false,
  };

  renderMarkerIcon = () => {
    const errMsg = this.props.disabled ? getLoggedInErrorMsg() : null;
    const isEnabled = errMsg === null;
    const errorMessage = errMsg ? `\n(${errMsg})` : '';
    const title = t`Mark point of interest` + ` ${errorMessage}`;
    return (
      <span
        onClick={(ev) => {
          if (!isEnabled) {
            this.props.onErrorMessage(title);
            return;
          }
          this.props.drawMarker();
        }}
        title={title}
      >
        {' '}
        {
          // jsx-a11y/anchor-is-valid
          // eslint-disable-next-line
          <a
            className={`drawGeometry ${this.props.disabled ? 'disabled' : ''} ${
              this.props.active ? 'active' : ''
            }`}
          >
            <i className="fa fa-map-marker" />
          </a>
        }
      </span>
    );
  };

  renderMarkerInfo = () => (
    <span>
      {
        // jsx-a11y/anchor-is-valid
        // eslint-disable-next-line
        <a onClick={this.props.deleteMarker} title={t`Remove geometry`}>
          <i className={`fa fa-close`} />
        </a>
      }
      {
        // jsx-a11y/anchor-is-valid
        // eslint-disable-next-line
        <a onClick={() => this.props.centerOnFeature('poiLayer')} title={t`Center map on feature`}>
          <i className={`fa fa-crosshairs`} />
        </a>
      }
      {this.props.poi && (
        <FisChartLink
          aoiOrPoi={'poi'}
          selectedResult={this.props.selectedResult}
          openFisPopup={this.props.openFisPopup}
          presetLayerName={this.props.presetLayerName}
          fisShadowLayer={this.props.fisShadowLayer}
          onErrorMessage={this.props.onErrorMessage}
          // active={this.props.fisOpened}
        />
      )}

      {this.props.poi && (
        <SpectralExplorerButton
          datasetId={this.props.datasetId}
          geometry={this.props.poiGeometry}
          onErrorMessage={this.props.onErrorMessage}
          geometryType={'poi'}
        />
      )}
    </span>
  );

  render() {
    const { poi } = this.props;
    return (
      <div className="poiPanel panelButton floatItem" title={t`Area of interest`}>
        {<PixelExplorer />}
        {poi && !this.props.disabled && this.renderMarkerInfo()}
        {this.renderMarkerIcon()}
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  poiGeometry: store.poi.geometry,
});

export default connect(mapStoreToProps)(EOBPOIPanelButton);
