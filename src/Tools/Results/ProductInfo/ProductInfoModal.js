import { connect } from 'react-redux';
import Rodal from 'rodal';
import { t } from 'ttag';
import store, { modalSlice } from '../../../store';
import ProductInfo from './ProductInfo';

const onClose = () => store.dispatch(modalSlice.actions.removeModal());

const ProductInfoModal = ({ selectedResult, params }) => {
  const { onDownload, downloadInProgress } = params;
  return (
    <Rodal
      animation="slideUp"
      className="product-info-modal"
      customStyles={{
        width: '200px',
        height: 'auto',
      }}
      visible={true}
      onClose={onClose}
      closeOnEsc={true}
    >
      <>
        <h3 className="product-info-title">{t`Product info`}</h3>
        <ProductInfo
          onClose={onClose}
          product={selectedResult}
          downloadInProgress={downloadInProgress}
          onDownload={() => {
            onDownload();
            onClose();
          }}
        />
      </>
    </Rodal>
  );
};

const mapStoreToProps = (store) => ({
  selectedResult: store.searchResults.selectedResult,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(ProductInfoModal);
