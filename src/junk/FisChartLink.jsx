import React, { useEffect, useState } from 'react';
import { t } from 'ttag';
import { connect } from 'react-redux';

import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import { checkAllMandatoryOutputsExist } from '../utils/parseEvalscript';
import { PROCESSING_OPTIONS, reqConfigMemoryCache, STATISTICS_MANDATORY_OUTPUTS } from '../const';
import {
  getLayerNotSelectedMsg,
  getNotAvailableForErrorMsg,
  getLoggedInErrorMsg,
  getHowToConfigLayersStatInfoMsg,
  getStatisticalInfoMsg,
  getStatInfoNotAvailableInPanelMsg,
} from './ConstMessages';

import StatisticalInfoIcon from '../icons/statistical_info.svg?react';
import { openLoginPrompt } from '../Auth/LoginPrompt/loginPrompt.utils';

const FisChartLink = (props) => {
  const [statisticalApiSupported, setStatisticalApiSupported] = useState(false);
  const [layerName, setLayerName] = useState();
  useEffect(() => {
    const fetchEvalscript = async () => {
      if (!props.dataSourcesInitialized) {
        return;
      }

      let evalscript;
      let layerName;

      if (props.customSelected) {
        evalscript = props.evalscript;
        layerName = t`Custom`;
      } else {
        if (props.layerId) {
          const layer = await LayersFactory.makeLayer(
            props.visualizationUrl,
            props.layerId,
            null,
            reqConfigMemoryCache,
          );
          if (layer) {
            await layer.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
            layerName = layer.title;
            evalscript = layer.evalscript;
          }
        }
      }
      if (evalscript) {
        setStatisticalApiSupported(checkAllMandatoryOutputsExist(evalscript, STATISTICS_MANDATORY_OUTPUTS));
      }
      setLayerName(layerName);
    };
    fetchEvalscript();
  }, [
    props.visualizationUrl,
    props.layerId,
    props.evalscript,
    props.customSelected,
    props.dataSourcesInitialized,
  ]);

  const isSelectedResult = !!props.selectedResult;
  const isStatAvailableOnDatasource =
    props.dataSourcesInitialized && isSelectedResult && statisticalApiSupported;
  const isLoggedIn = !!props.user.userdata;
  const isEditedOpenEOProcessingSelected =
    props.selectedProcessing === PROCESSING_OPTIONS.OPENEO && props.isProcessGraphModified;
  const editedOpenEOErrorMsg = t`Statistical info not available for edited OpenEO process graph`;

  const getTitleBasedOnStatus = (errorMessage) => {
    if (!isLoggedIn || !props.isVisualizingLayer) {
      return errorMessage;
    }

    return `${getStatisticalInfoMsg()} (${
      !isSelectedResult ? getLayerNotSelectedMsg() : getNotAvailableForErrorMsg(layerName)
    }).`;
  };

  const statsEnabled = () => (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a
      onClick={(e) => {
        e.stopPropagation();
        props.openFisPopup({ layerName: layerName });
      }}
      title={getStatisticalInfoMsg()}
      className={`${props.active ? 'active' : ''}`}
      style={{ height: '40px' }}
    >
      <StatisticalInfoIcon />
    </a>
  );

  // `isLoginError` marks the not-logged-in case, where the click opens the actionable login prompt
  // instead of the plain error notification.
  const statsError = (errorMessage, { isLoginError } = {}) => {
    return (
      // jsx-a11y/anchor-is-valid
      // eslint-disable-next-line
      <a
        onClick={(e) => {
          e.preventDefault();
          if (isLoginError) {
            openLoginPrompt(errorMessage);
            return;
          }
          props.onErrorMessage(errorMessage);
        }}
        title={getTitleBasedOnStatus(errorMessage)}
        className="disabled"
        style={{ height: '40px' }}
      >
        <StatisticalInfoIcon />
      </a>
    );
  };

  if (!isLoggedIn) {
    return statsError(getLoggedInErrorMsg(), { isLoginError: true });
  }

  // Available only while visualizing a layer (Layers/Highlights panel); disabled elsewhere
  // (Compare, Pin, external WMS/WMTS) where the previous SH layer's support flags would linger.
  if (!props.isVisualizingLayer) {
    return statsError(getStatInfoNotAvailableInPanelMsg());
  }

  if (isEditedOpenEOProcessingSelected) {
    return statsError(editedOpenEOErrorMsg);
  }

  if (!isStatAvailableOnDatasource) {
    const statisticalInfoMsg = getStatisticalInfoMsg();
    const additionalErrorMsg = !isSelectedResult
      ? `(${getLayerNotSelectedMsg()})`
      : `(${getNotAvailableForErrorMsg(layerName)}) \n${getHowToConfigLayersStatInfoMsg()}`;
    const combinedStatErrorMsg = `${statisticalInfoMsg} \n${additionalErrorMsg}`;

    return statsError(combinedStatErrorMsg);
  }

  return statsEnabled();
};

const mapStoreToProps = (store) => ({
  visualizationUrl: store.visualization.visualizationUrl,
  layerId: store.visualization.layerId,
  evalscript: store.visualization.evalscript,
  customSelected: store.visualization.customSelected,
  selectedProcessing: store.visualization.selectedProcessing,
  isProcessGraphModified: store.visualization.isProcessGraphModified,
  user: store.auth.user,
  isVisualizingLayer: store.tabs.isVisualizingLayer,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
});

export default connect(mapStoreToProps, null)(FisChartLink);
