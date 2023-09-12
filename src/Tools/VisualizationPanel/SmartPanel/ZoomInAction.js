import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { t } from 'ttag';

import SearchBox from '../../../SearchBox/SearchBox';

function ZoomInAction({
  minZoom,
  maxZoom,
  is3D,
  googleAPI,
  shouldAnimate,
  onSelectLocationCallback,
  searchBarRef,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="smart-panel-action zoom-in-action">
      <div className="message">{t`Please zoom in or search for a location of interest`}!</div>
      {mounted && searchBarRef && searchBarRef.current
        ? ReactDOM.createPortal(
            <SearchBox
              googleAPI={googleAPI}
              giscoAPI={true}
              is3D={is3D}
              minZoom={minZoom}
              maxZoom={maxZoom}
              onSelectLocationCallback={onSelectLocationCallback}
              className={`${shouldAnimate ? 'fly-to-top' : ''} smart-panel-search-bar`}
            />,
            searchBarRef.current,
          )
        : null}
      <div className="blue-triangle-topright"></div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  is3D: store.mainMap.is3D,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(ZoomInAction);
