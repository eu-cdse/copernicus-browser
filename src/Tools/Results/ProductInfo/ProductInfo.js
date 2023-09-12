import React from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import oDataHelpers from '../../../api/OData/ODataHelpers';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { getLoggedInErrorMsg } from '../../../junk/ConstMessages';
import { addProductToWorkspace } from '../../../api/OData/workspace';

import { ReactComponent as WorkspacePlusIcon } from '../../../icons/workspace-plus.svg';

import './ProductInfo.scss';
import store, { notificationSlice } from '../../../store';
import { getDownloadProductErrorMessage, DOWNLOAD_PRODUCT_LABEL } from '../ResultItemFooter';

const commonAttributes = [
  'name',
  'size',
  'sensingTime',
  'originDate',
  'publicationDate',
  'modificationDate',
  'S3Path',
];

const ProductInfo = ({ product, onDownload, downloadInProgress, onClose, userToken }) => {
  const allAttributes = [
    ...commonAttributes
      .map((key) => ({ key: key, value: product[key] }))
      .filter((attr) => !(attr.key === 'size' && attr.value === '0MB')),
    ...product?.attributes.map((attr) => ({
      key: attr.Name,
      value: attr.Value,
    })),
  ].map(({ key, value }) => ({ key: oDataHelpers.formatAttributesNames(key), value: value }));
  const downloadDisabled = downloadInProgress || !userToken || !product.online;
  const downloadProductErrorMessage = getDownloadProductErrorMessage(DOWNLOAD_PRODUCT_LABEL, {
    userToken,
    product,
  });

  return (
    <div className="product-info">
      <div className="content">
        {allAttributes.map((attr, index) => (
          <div className={`row ${index % 2 === 0 ? 'even' : 'odd'}`} key={attr.key}>
            <div className={`attribute left`}>{attr.key}: </div>
            <div className={`attribute right`}>{attr.value}</div>
          </div>
        ))}
      </div>
      <div className="actions">
        <EOBButton
          disabled={!userToken}
          svgIcon={WorkspacePlusIcon}
          text={t`Workspace`}
          title={`${t`Add to workspace`}${!userToken ? ` (${getLoggedInErrorMsg()})` : ''}`}
          onClick={() => {
            addProductToWorkspace(product);
            onClose();
          }}
          onDisabledClick={() => {
            store.dispatch(
              notificationSlice.actions.displayError(`${t`Add to workspace`} (${getLoggedInErrorMsg()})`),
            );
            return null;
          }}
        ></EOBButton>

        <EOBButton
          disabled={downloadDisabled}
          loading={downloadInProgress}
          icon="download"
          className="small"
          text={t`Download`}
          title={downloadProductErrorMessage ? downloadProductErrorMessage : DOWNLOAD_PRODUCT_LABEL}
          onClick={onDownload}
          onDisabledClick={() => {
            if (downloadProductErrorMessage) {
              store.dispatch(notificationSlice.actions.displayError(downloadProductErrorMessage));
              return null;
            }
          }}
        ></EOBButton>
      </div>
    </div>
  );
};
const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  userToken: store.auth.user.access_token,
});

export default connect(mapStoreToProps, null)(ProductInfo);
