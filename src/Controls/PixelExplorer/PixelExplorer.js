import { useEffect } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';
import { formatIndexValue } from './PixelExplorer.utils';
import usePixelExplorer from './usePixelExplorer';

const PixelExplorer = (props) => {
  const [{ enabled, loading, result }, setPixelExplorerParams] = usePixelExplorer();

  useEffect(() => {
    setPixelExplorerParams(props);
  }, [setPixelExplorerParams, props]);

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <span>
        <i className="fa fa-spinner fa-spin fa-fw" />
      </span>
    );
  }

  if (!result) {
    return null;
  }

  const { title, value } = result;
  return (
    <span className="index-value" title={t`Index value`}>
      {title}: {formatIndexValue(value)}
    </span>
  );
};

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  selectedTabIndex: store.tabs.selectedTabIndex,
  evalscript: store.visualization.evalscript,
  visualizationUrl: store.visualization.visualizationUrl,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  geometry: store.poi.geometry,
});

export default connect(mapStoreToProps)(PixelExplorer);
