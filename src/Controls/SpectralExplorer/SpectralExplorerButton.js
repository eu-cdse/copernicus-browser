import { connect } from 'react-redux';
import { ModalId } from '../../const';
import store, { modalSlice, spectralExplorerSlice } from '../../store';
import {
  SPECTRAL_EXPLORER_ENABLED,
  createSeriesId,
  isSpectralExplorerSupported,
  spectralExplorerLabels,
} from './SpectralExplorer.utils';

const checkButtonDisabled = ({ datasetId, geometry, fromTime, toTime }) => {
  if (!datasetId) {
    return `${spectralExplorerLabels.title()} - ${spectralExplorerLabels.errorDatasetNotSet()}`;
  }

  if (!isSpectralExplorerSupported(datasetId)) {
    return `${spectralExplorerLabels.title()} - ${spectralExplorerLabels.errorNotSupported()}`;
  }

  if (!geometry) {
    return `${spectralExplorerLabels.title()} - ${spectralExplorerLabels.errorGeometryNotSet()}`;
  }

  if (!fromTime || !toTime) {
    return `${spectralExplorerLabels.title()} - ${spectralExplorerLabels.errorDateNotSet()}`;
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
}) => {
  if (!SPECTRAL_EXPLORER_ENABLED) {
    return null;
  }

  const errorMessage = checkButtonDisabled({ datasetId, geometry, fromTime, toTime });

  return (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a
      onClick={() => handleOnClick({ errorMessage, onErrorMessage, geometryType, datasetId, selectedSeries })}
      title={errorMessage ? errorMessage : spectralExplorerLabels.title()}
      className={errorMessage ? 'disabled' : ''}
    >
      <i className={`fa fa-line-chart`} aria-hidden="true"></i>
    </a>
  );
};

const mapStoreToProps = (store) => ({
  selectedSeries: store.spectralExplorer.selectedSeries,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
});

export default connect(mapStoreToProps, null)(SpectralExplorerButton);
