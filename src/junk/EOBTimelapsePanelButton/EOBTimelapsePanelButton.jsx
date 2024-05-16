import React from 'react';
import { t } from 'ttag';

import {
  getLoggedInErrorMsg,
  getLayerNotSelectedMsg,
  getCompareModeErrorMsg,
  getDatasourceNotSupportedMsg,
  zoomTooLow3DMsg,
  getFinishDrawingMsg,
} from '../ConstMessages';
import store, { modalSlice, timelapseSlice } from '../../store';

import '../EOBPanel.scss';
import { ModalId, TABS } from '../../const';
import BadgeWrapper from '../../components/BadgeWrapper/BadgeWrapper';

export class EOBTimelapsePanelButton extends React.Component {
  onButtonClick = () => {
    const { aoi } = this.props;
    if (aoi && aoi.bounds) {
      store.dispatch(modalSlice.actions.addModal({ modal: ModalId.TIMELAPSE }));
    } else if (this.props.is3D) {
      store.dispatch(modalSlice.actions.addModal({ modal: ModalId.TIMELAPSE }));
    } else {
      store.dispatch(timelapseSlice.actions.toggleTimelapseAreaPreview());
    }
  };

  render() {
    const isLayerSelected = !!this.props.selectedResult;
    const isTimelapseSupported =
      isLayerSelected && this.props.selectedResult.getDates && this.props.selectedResult.baseUrls.WMS;

    const errMsg = this.props.showComparePanel
      ? getCompareModeErrorMsg()
      : !this.props.isLoggedIn
      ? getLoggedInErrorMsg()
      : !isLayerSelected || this.props.selectedTabIndex !== TABS.VISUALIZE_TAB
      ? getLayerNotSelectedMsg()
      : !isTimelapseSupported
      ? getDatasourceNotSupportedMsg()
      : this.props.zoomTooLow
      ? zoomTooLow3DMsg()
      : this.props.isPlacingVertex
      ? getFinishDrawingMsg()
      : null;
    const isEnabled = errMsg === null;
    const errorMessage = errMsg ? `\n(${errMsg})` : '';
    const title = t`Create timelapse animation` + `${errorMessage}`;
    return (
      <div
        className={`timelapsePanelButton panelButton floatItem ${this.props.is3D ? 'is3d' : ''}`}
        title={title}
        onClick={(ev) => {
          if (!isEnabled) {
            this.props.onErrorMessage(title);
            return;
          }
          this.onButtonClick();
        }}
      >
        <BadgeWrapper count={this.props.newLayersCount}>
          {
            // jsx-a11y/anchor-is-valid
            // eslint-disable-next-line
            <a
              className={`drawGeometry ${isEnabled ? '' : 'disabled'} ${
                this.props.displayTimelapseAreaPreview ? 'active' : ''
              }`}
            >
              <i className="fa fa-film" />
            </a>
          }
        </BadgeWrapper>
      </div>
    );
  }
}
