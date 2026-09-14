import React from 'react';
import { connect } from 'react-redux';
import { ModalId } from '../../const';
import store, { modalSlice, spectralExplorerSlice } from '../../store';
import {
  SPECTRAL_EXPLORER_ENABLED,
  createSeriesId,
  isSpectralExplorerSupported,
  spectralExplorerLabels,
} from './SpectralExplorer.utils';

import SpectralExplorerIcon from '../../icons/spectral_explorer.svg?react';
import { openLoginPrompt } from '../../Auth/LoginPrompt/loginPrompt.utils';

// Spectral explorer is a Sentinel Hub layer tool, so it's only available while a layer is being
// visualized (the Layers or Highlights panel). It is disabled in Compare, Pin and the external
// WMS/WMTS panel (where the previous SH layer's state would otherwise keep it enabled).
const checkButtonDisabled = ({ datasetId, geometry, fromTime, toTime, user, isVisualizingLayer }) => {
  if (!user.userdata) {
    return `${spectralExplorerLabels.title()}\n(${spectralExplorerLabels.errorLogIn()})`;
  }

  if (!isVisualizingLayer) {
    return `${spectralExplorerLabels.title()}\n(${spectralExplorerLabels.errorNotAvailableInPanel()})`;
  }

  if (!datasetId) {
    return `${spectralExplorerLabels.title()}\n(${spectralExplorerLabels.errorDatasetNotSet()})`;
  }

  if (!isSpectralExplorerSupported(datasetId)) {
    return `${spectralExplorerLabels.title()}\n(${spectralExplorerLabels.errorNotSupported()})`;
  }

  if (!geometry) {
    return `${spectralExplorerLabels.title()}\n(${spectralExplorerLabels.errorGeometryNotSet()})`;
  }

  if (!fromTime || !toTime) {
    return `${spectralExplorerLabels.title()}\n(${spectralExplorerLabels.errorDateNotSet()})`;
  }

  return null;
};

const handleOnClick = ({
  errorMessage,
  isLoginError,
  onErrorMessage,
  geometryType,
  datasetId,
  selectedSeries,
}) => {
  if (isLoginError) {
    openLoginPrompt(spectralExplorerLabels.errorLogIn(), spectralExplorerLabels.title());
    return;
  }

  if (errorMessage) {
    return onErrorMessage(errorMessage);
  }

  store.dispatch(
    modalSlice.actions.addModal({ modal: ModalId.SPECTRAL_EXPLORER, params: { geometryType: geometryType } }),
  );

  const defaultSeriesId = createSeriesId({ geometryType: geometryType, datasetId: datasetId });
  const isDefaultSeriesSelected = !!selectedSeries?.[datasetId]?.find((s) => s === defaultSeriesId);

  if (!isDefaultSeriesSelected) {
    store.dispatch(
      spectralExplorerSlice.actions.setSelectedSeries({
        datasetId: datasetId,
        series: [...(selectedSeries?.[datasetId] ?? []), defaultSeriesId],
      }),
    );
  }
};

const SpectralExplorerButton = ({
  datasetId,
  geometry,
  onErrorMessage,
  geometryType = 'poi',
  selectedSeries,
  fromTime,
  toTime,
  user,
  isVisualizingLayer,
}) => {
  if (!SPECTRAL_EXPLORER_ENABLED) {
    return null;
  }

  const errorMessage = checkButtonDisabled({
    datasetId,
    geometry,
    fromTime,
    toTime,
    user,
    isVisualizingLayer,
  });

  // Matches the first branch of checkButtonDisabled, which takes precedence over every other reason.
  const isLoginError = !user.userdata;

  return (
    // jsx-a11y/anchor-is-valid
    <a
      onClick={(e) => {
        e.stopPropagation();
        handleOnClick({
          errorMessage,
          isLoginError,
          onErrorMessage,
          geometryType,
          datasetId,
          selectedSeries,
        });
      }}
      title={errorMessage ? errorMessage : spectralExplorerLabels.title()}
      className={errorMessage ? 'disabled' : ''}
      style={{ height: '40px' }}
    >
      <SpectralExplorerIcon />
    </a>
  );
};

const mapStoreToProps = (store) => ({
  selectedSeries: store.spectralExplorer.selectedSeries,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  user: store.auth.user,
  isVisualizingLayer: store.tabs.isVisualizingLayer,
});

export default connect(mapStoreToProps, null)(SpectralExplorerButton);
