import React from 'react';
import './RapidResponseDesk.scss';
import { connect } from 'react-redux';
import { getAppropriateAuthToken } from '../../App';

const RapidResponseDesk = ({ authToken }) => {
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

export default connect(mapStoreToProps, null)(RapidResponseDesk);
