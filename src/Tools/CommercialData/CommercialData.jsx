import React from 'react';
import './CommercialData.scss';
import { connect } from 'react-redux';
import { getAppropriateAuthToken } from '../../App';

const CommercialData = ({ authToken }) => {
  return (
    <div className="commercial-data-panel">
      <p>Commercial Data</p>
      <p>...</p>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  authToken: getAppropriateAuthToken(store.auth, store.themes.selectedThemeId),
});

export default connect(mapStoreToProps, null)(CommercialData);
