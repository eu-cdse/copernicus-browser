import React, { useEffect, useState } from 'react';
import { t } from 'ttag';
import { connect } from 'react-redux';

import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import { isCustomPreset } from './EOBCommon/utils/utils';
import { checkAllMandatoryOutputsExist } from '../utils/parseEvalscript';
import { reqConfigMemoryCache, STATISTICS_MANDATORY_OUTPUTS } from '../const';

const FisChartLink = (props) => {
  const [statisticalApiSupported, setStatisticalApiSupported] = useState(false);
  useEffect(() => {
    const fetchEvalscript = async () => {
      let evalscript;

      if (props.customSelected) {
        evalscript = props.evalscript;
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
            evalscript = layer.evalscript;
          }
        }
      }
      if (evalscript) {
        setStatisticalApiSupported(checkAllMandatoryOutputsExist(evalscript, STATISTICS_MANDATORY_OUTPUTS));
      }
    };
    fetchEvalscript();
  }, [props.visualizationUrl, props.layerId, props.evalscript, props.customSelected]);

  const isSelectedResult = !!props.selectedResult;
  const isCustomLayer = props.selectedResult && isCustomPreset(props.selectedResult.preset);
  const isShadowLayerAvailable = props.selectedResult && !!props.fisShadowLayer;

  const isStatAvailableOnDatasource = !!(
    (props.selectedResult && props.selectedResult.baseUrls.FIS) ||
    statisticalApiSupported
  );
  if (isSelectedResult && isStatAvailableOnDatasource && (isShadowLayerAvailable || isCustomLayer)) {
    return (
      // jsx-a11y/anchor-is-valid
      // eslint-disable-next-line
      <a
        onClick={() => props.openFisPopup(props.aoiOrPoi)}
        title={t`Statistical Info / Feature Info Service chart`}
        className={`${props.active ? 'active' : ''}`}
      >
        <i className={`fa fa-bar-chart`} />
      </a>
    );
  } else {
    const errorMessage =
      t`Statistical Info / Feature Info Service chart - ` +
      `${
        !isSelectedResult
          ? t`please select a layer`
          : !isStatAvailableOnDatasource
          ? t`not available for ` + props.selectedResult.name
          : t`not available for "${props.presetLayerName}" (layer with value is not set up)`
      }`;
    return (
      // jsx-a11y/anchor-is-valid
      // eslint-disable-next-line
      <a
        onClick={(e) => {
          e.preventDefault();
          props.onErrorMessage(errorMessage);
        }}
        title={errorMessage}
        className="disabled"
      >
        <i className={`fa fa-bar-chart`} />
      </a>
    );
  }
};

const mapStoreToProps = (store) => ({
  visualizationUrl: store.visualization.visualizationUrl,
  layerId: store.visualization.layerId,
  evalscript: store.visualization.evalscript,
  customSelected: store.visualization.customSelected,
});

export default connect(mapStoreToProps, null)(FisChartLink);
