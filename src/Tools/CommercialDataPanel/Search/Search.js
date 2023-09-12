import React from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import { TPDICollections } from '@sentinel-hub/sentinelhub-js';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../../Notification/NotificationPanel';

import './Search.scss';
import SearchForm from './SearchForm';
import { GEOCENTO_EARTHIMAGES } from './config';

export const TPDICollectionsWithLabels = [
  { value: TPDICollections.AIRBUS_PLEIADES, label: 'Airbus Pleiades' },
  { value: TPDICollections.AIRBUS_SPOT, label: 'Airbus SPOT' },
  { value: TPDICollections.MAXAR_WORLDVIEW, label: 'Maxar WorldView ' },
  { value: TPDICollections.PLANET_SCOPE, label: 'Planet PlanetScope' },
  { value: TPDICollections.PLANET_SKYSAT, label: 'Planet SkySat' },
  { value: GEOCENTO_EARTHIMAGES, label: 'Geocento EarthImages' },
];

const Search = ({
  onSearch,
  searchParams,
  handleSearchParamChange,
  searchInProgress,
  searchError,
  aoiGeometry,
}) => {
  const validateSearchParams = () => {
    //check provider specific params

    return !!aoiGeometry;
  };

  return (
    <div className="commercial-data-search">
      <SearchForm searchParams={searchParams} handleSearchParamChange={handleSearchParamChange} />

      <EOBButton
        className="commercial-data-button"
        fluid
        onClick={onSearch}
        text={t`Search`}
        disabled={searchInProgress || !validateSearchParams()}
        loading={searchInProgress}
      />
      {searchError && <NotificationPanel type="error" msg={searchError} />}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  aoiGeometry: store.aoi.geometry,
});

export default connect(mapStoreToProps, null)(Search);
