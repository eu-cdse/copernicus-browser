import { t } from 'ttag';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { useEffect, useState } from 'react';
import store, { elevationProfileSlice, modalSlice } from '../../store';
import { useElevationProfile } from './useElevationProfile';

import './ElevationProfile.scss';
import { connect } from 'react-redux';
import ElevationProfileChart from './ElevationProfileChart';
import { DraggableDialogBox } from '../../components/DraggableDialogBox/DraggableDialogBox';
import { getBoundsZoomLevel } from '../../utils/coords';
import Legend from './Legend';

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

const ElevationProfile = ({ geometry, bounds }) => {
  const [{ loading, error, data }, calculate] = useElevationProfile();
  const [size] = useState({ width: 700, height: 400 });
  const [selectedLineIdx, setSelectedLineIdx] = useState(0);

  useEffect(() => {
    if (geometry) {
      setSelectedLineIdx(0);
      calculate({ geometry: geometry, provider: 'MAPZEN', zoom: getBoundsZoomLevel(bounds) });
    } else {
      store.dispatch(elevationProfileSlice.actions.reset());
      store.dispatch(modalSlice.actions.removeModal());
    }
  }, [calculate, geometry, bounds]);

  const showLegend = data && data.length > 1;

  return (
    <DraggableDialogBox
      className="elevation-profile"
      width={size.width}
      height={size.height}
      onClose={() => {
        store.dispatch(elevationProfileSlice.actions.reset());
        store.dispatch(modalSlice.actions.removeModal());
      }}
      title={t`Elevation profile`}
      modal={false}
    >
      <Loading loading={loading} />
      <ErrorMessage error={error} onClose={() => store.dispatch(modalSlice.actions.removeModal())} />
      <div
        className="content"
        onMouseLeave={() => {
          store.dispatch(elevationProfileSlice.actions.reset());
        }}
      >
        {data && data.length && (
          <ElevationProfileChart
            data={data[selectedLineIdx]}
            width={size.width}
            height={size.height - (showLegend ? 0 : 0)}
          />
        )}
        {showLegend && (
          <Legend data={data} selectedLineIdx={selectedLineIdx} setSelectedLineIdx={setSelectedLineIdx} />
        )}
      </div>
    </DraggableDialogBox>
  );
};

const mapStoreToProps = (store) => ({
  geometry: store.loi.geometry,
  bounds: store.loi.bounds,
  zoom: store.mainMap.zoom,
});

export default connect(mapStoreToProps, null)(ElevationProfile);
