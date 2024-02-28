import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';
import store, { modalSlice } from '../../store';
import {
  getDataSourceHandler,
  getDatasetLabel,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getBandsValues, spectralExplorerLabels } from './SpectralExplorer.utils';
import Content from './Content';

import './SpectralExplorer.scss';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { CancelToken } from '@sentinel-hub/sentinelhub-js';
import { BAND_UNIT } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { DraggableDialogBox } from '../../components/DraggableDialogBox/DraggableDialogBox';

let cancelToken = new CancelToken();

const Loading = ({ loading }) => {
  if (!loading) {
    return null;
  }
  return (
    <div className="fetching">
      <i className="fa fa-cog fa-spin fa-3x fa-fw" />
      {t`Loading, please wait`}
    </div>
  );
};

const ErrorMessage = ({ error, onClose }) => {
  if (!error) {
    return null;
  }
  return (
    <div className="error-message">
      <div>{error}</div>
      <EOBButton text={t`Close`} onClick={onClose} />
    </div>
  );
};

const SpectralExplorer = ({
  datasetId,
  fromTime,
  toTime,
  geometry,
  customSelected,
  visualizationUrl,
  layerId,
  geometryType,
}) => {
  const [bandsValues, setBandsValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    const load = async (cancelToken) => {
      try {
        setLoading(true);
        setError(null);

        const result = await getBandsValues({
          datasetId,
          fromTime,
          geometry,
          toTime,
          visualizationUrl,
          cancelToken,
        });
        setBandsValues(result);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    //cancel previous requests in progress and create new cancel token
    if (cancelToken) {
      cancelToken.cancel();
    }
    cancelToken = new CancelToken();

    load(cancelToken);

    return () => {
      if (cancelToken) {
        cancelToken.cancel();
      }
    };
  }, [datasetId, customSelected, fromTime, geometry, layerId, toTime, visualizationUrl]);

  const dsh = getDataSourceHandler(datasetId);
  const bands = dsh?.getBands(datasetId)?.filter((b) => b.unit === BAND_UNIT.REFLECTANCE);
  const onClose = () => store.dispatch(modalSlice.actions.removeModal());
  return (
    <DraggableDialogBox
      className="spectral-explorer"
      width={700}
      height={550}
      onClose={onClose}
      title={`${spectralExplorerLabels.title()}: ${getDatasetLabel(datasetId)}`}
      modal={false}
    >
      <Loading loading={loading} />
      <ErrorMessage error={error} onClose={onClose} />
      <Content
        datasetId={datasetId}
        loading={loading}
        error={error}
        values={bandsValues}
        bands={bands}
        geometryType={geometryType}
      ></Content>
    </DraggableDialogBox>
  );
};

const getPoiOrAoiGeometry = (store) => {
  const geometryType = store?.modal?.params?.geometryType;

  if (!geometryType) {
    return null;
  }

  return store?.[geometryType]?.geometry;
};

const mapStoreToProps = (store) => ({
  customSelected: store.visualization.customSelected,
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  geometry: getPoiOrAoiGeometry(store),
  visualizationUrl: store.visualization.visualizationUrl,
  layerId: store.visualization.layerId,
  geometryType: store?.modal?.params?.geometryType,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(SpectralExplorer);
