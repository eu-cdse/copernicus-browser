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

export function EOBTimelapsePanelButton(props) {
  const onButtonClick = () => {
    const { aoi, is3D } = props;
    if (aoi && aoi.bounds) {
      store.dispatch(modalSlice.actions.addModal({ modal: ModalId.TIMELAPSE }));
    } else if (is3D) {
      store.dispatch(modalSlice.actions.addModal({ modal: ModalId.TIMELAPSE }));
    } else {
      store.dispatch(timelapseSlice.actions.toggleTimelapseAreaPreview());
    }
  };

  const isLayerSelected = !!props.selectedResult;
  const isTimelapseSupported =
    isLayerSelected && props.selectedResult.getDates && props.selectedResult.baseUrls.WMS;

  const errMsg = props.showComparePanel
    ? getCompareModeErrorMsg()
    : !props.isLoggedIn
    ? getLoggedInErrorMsg()
    : !isLayerSelected || props.selectedTabIndex !== TABS.VISUALIZE_TAB
    ? getLayerNotSelectedMsg()
    : !isTimelapseSupported
    ? getDatasourceNotSupportedMsg()
    : props.zoomTooLow
    ? zoomTooLow3DMsg()
    : props.isPlacingVertex
    ? getFinishDrawingMsg()
    : null;

  const isEnabled = errMsg === null;
  const errorMessage = errMsg ? `\n(${errMsg})` : '';
  const title = t`Create timelapse animation` + `${errorMessage}`;

  return (
    <div
      className={`timelapsePanelButton panelButton floatItem ${props.is3D ? 'is3d' : ''}`}
      title={title}
      onClick={(ev) => {
        if (!isEnabled) {
          props.onErrorMessage(title);
          return;
        }
        onButtonClick();
      }}
    >
      {/* jsx-a11y/anchor-is-valid */}
      {/* eslint-disable-next-line */}
      <a
        className={`drawGeometry ${isEnabled ? '' : 'disabled'} ${
          props.displayTimelapseAreaPreview ? 'active' : ''
        } ${props.displayTimelapseAreaPreview ? 'open-options' : ''}`}
      >
        <i className="fa fa-film" />
      </a>
    </div>
  );
}
