import React, { useEffect, useState } from 'react';
import { t } from 'ttag';
import { connect } from 'react-redux';

import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import { checkAllMandatoryOutputsExist } from '../utils/parseEvalscript';
import { reqConfigMemoryCache, STATISTICS_MANDATORY_OUTPUTS } from '../const';
import { getLayerNotSelectedMsg, getNotAvailableForErrorMsg, getLoggedInErrorMsg } from './ConstMessages';

const FisChartLink = (props) => {
  const [statisticalApiSupported, setStatisticalApiSupported] = useState(false);
  const [layerName, setLayerName] = useState();
  useEffect(() => {
    const fetchEvalscript = async () => {
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
  }, [props.visualizationUrl, props.layerId, props.evalscript, props.customSelected]);

  const isSelectedResult = !!props.selectedResult;
  const isStatAvailableOnDatasource = isSelectedResult && statisticalApiSupported;
  const isLoggedIn = !!props.user.userdata;

  const statsEnabled = () => (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a
      onClick={() => props.openFisPopup({ layerName: layerName })}
      title={t`Statistical Info / Feature Info Service chart`}
      className={`${props.active ? 'active' : ''}`}
    >
      <i className={`fa fa-bar-chart`} />
    </a>
  );

  const statsError = (errorMessage) => {
    const errorMsgWithTitle = t`Statistical Info / Feature Info Service chart` + `\n(${errorMessage})`;
    return (
      // jsx-a11y/anchor-is-valid
      // eslint-disable-next-line
      <a
        onClick={(e) => {
          e.preventDefault();
          props.onErrorMessage(errorMsgWithTitle);
        }}
        title={errorMsgWithTitle}
        className="disabled"
      >
        <i className={`fa fa-bar-chart`} />
      </a>
    );
  };

  if (!isLoggedIn) {
    return statsError(getLoggedInErrorMsg());
  }

  if (!isStatAvailableOnDatasource) {
    return statsError(!isSelectedResult ? getLayerNotSelectedMsg() : getNotAvailableForErrorMsg(layerName));
  }

  return statsEnabled();
};

const mapStoreToProps = (store) => ({
  visualizationUrl: store.visualization.visualizationUrl,
  layerId: store.visualization.layerId,
  evalscript: store.visualization.evalscript,
  customSelected: store.visualization.customSelected,
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(FisChartLink);
