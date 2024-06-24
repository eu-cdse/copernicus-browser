import React from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import { t } from 'ttag';
import store, { modalSlice } from '../../../store';
import BrowseProduct from './BrowseProduct';

const onClose = () => store.dispatch(modalSlice.actions.removeModal());

const BrowseProductModal = ({ selectedResult, params, userToken }) => {
  const { onDownload, downloadInProgress } = params;

  return (
    <Rodal
      animation="slideUp"
      className="browse-product-modal"
      customStyles={{
        width: '700px',
        height: 'auto',
      }}
      visible={true}
      onClose={onClose}
      closeOnEsc={true}
    >
      <>
        <h3 className="browse-product-title">{t`Download single files`}</h3>

        <BrowseProduct
          product={selectedResult}
          onClose={onClose}
          onDownload={onDownload}
          downloadInProgress={downloadInProgress}
          userToken={userToken}
        />
      </>
    </Rodal>
  );
};

const mapStoreToProps = (store) => ({
  userToken: store.auth.user.access_token,
  selectedResult: store.searchResults.selectedResult,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(BrowseProductModal);
