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

const checkButtonDisabled = ({ datasetId, geometry, fromTime, toTime, user }) => {
  if (!user.userdata) {
    return `${spectralExplorerLabels.title()}\n(${spectralExplorerLabels.errorLogIn()})`;
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

const handleOnClick = ({ errorMessage, onErrorMessage, geometryType, datasetId, selectedSeries }) => {
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
}) => {
  if (!SPECTRAL_EXPLORER_ENABLED) {
    return null;
  }

  const errorMessage = checkButtonDisabled({ datasetId, geometry, fromTime, toTime, user });

  return (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a
      onClick={() => {
        handleOnClick({ errorMessage, onErrorMessage, geometryType, datasetId, selectedSeries });
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
});

export default connect(mapStoreToProps, null)(SpectralExplorerButton);
