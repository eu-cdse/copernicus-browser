import React, { useCallback, useEffect, useState } from 'react';
import { t } from 'ttag';

import { getBoundsAndLatLng } from '../CommercialDataPanel/commercialData.utils';
import { ModalId } from '../../const';
import store, {
  mainMapSlice,
  modalSlice,
  notificationSlice,
  productDownloadSlice,
  searchResultsSlice,
} from '../../store';
import { usePrevious } from '../../hooks/usePrevious';

import { getProductErrorMessage } from './ProductInfo/ProductInfo.utils';
import {
  ODataCollections,
  ODataProductFileExtension,
  ODataProductTypeExtension,
} from '../../api/OData/ODataTypes';
import { AttributeNames } from '../../api/OData/assets/attributes';

export const ResultItemLabels = {
  productInfo: () => t`Product info`,
  zoomToProduct: () => t`Zoom to product`,
  addProductsToWorkspace: () => t`Add products to workspace`,
  loginToAddToWorkspace: () => t`You need to be logged in to add products to your workspace.`,
  downloadProductLabel: () => t`Download product`,
  orderProcessing: () => t`Go to Workspace to order processing`,
  noWorkspaceSelected: () => t`No workflows selected`,
  noAvailableProcessors: () => t`No available processors for this product.`,
};

const zoomToProduct = ({ geometry }) => {
  if (geometry) {
    const { lat, lng, zoom } = getBoundsAndLatLng(geometry);
    store.dispatch(
      mainMapSlice.actions.setPosition({
        lat: lat,
        lng: lng,
        zoom: zoom,
      }),
    );
  }
};

const setProgress = (productId, value) =>
  store.dispatch(productDownloadSlice.actions.setProgress({ productId: productId, value: value }));

const openProductDetailsModal = ({ tile, downloadInProgress, onDownload }) => {
  store.dispatch(searchResultsSlice.actions.setSelectedResult(tile));
  store.dispatch(
    modalSlice.actions.addModal({
      modal: ModalId.PRODUCT_DETAILS,
      params: {
        downloadInProgress: downloadInProgress,
        onDownload: onDownload,
      },
    }),
  );
};

const getFileNameWithExtensionForProductType = ({ name, productType, attributes }) => {
  const extension = ODataProductTypeExtension[productType];

  // Explanation for this hack: https://hello.planet.com/code/sentinel-hub/sentinel-frontend/cdse/copernicus-browser/-/issues/256
  // download shouldn't be zipped in this case for S5P (https://jira.cloudferro.com/browse/CDSE-1655)
  const platformShortName = attributes.find((attr) => attr.Name === AttributeNames.platformShortName);
  if (platformShortName !== undefined && platformShortName.Value === ODataCollections.S5P.label) {
    return name;
  }

  //ignore extension for EOF product types
  if (extension === ODataProductFileExtension.EOF) {
    return name;
  }
  return `${name}.${extension || ODataProductFileExtension.ZIP}`;
};

export const ResultItemFooter = ({
  userToken,
  tile,
  tags,
  modalId,
  downloadInProgress,
  downloadProduct,
  cancelToken,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const accessValidation = {
    userToken,
    product: tile,
  };

  const downloadProductErrorMessage = getProductErrorMessage(
    ResultItemLabels.downloadProductLabel(),
    accessValidation,
  );

  const previousValueDownloadInProgress = usePrevious(downloadInProgress);

  useEffect(() => {
    if (modalId !== ModalId.PRODUCT_DETAILS) {
      setDetailsOpen(false);
    }
  }, [modalId]);

  const onDownload = useCallback(() => {
    if (downloadProductErrorMessage) {
      store.dispatch(notificationSlice.actions.displayError(downloadProductErrorMessage));
      return null;
    }

    if (downloadInProgress) {
      return null;
    }

    downloadProduct({
      id: tile.id,
      name: getFileNameWithExtensionForProductType(tile),
      token: userToken,
      cancelToken: cancelToken,
      setProgress: setProgress,
    });
    // eslint-disable-next-line
  }, [downloadInProgress, cancelToken, downloadProduct, tile, userToken]);

  useEffect(() => {
    //rerender modal after download is completed if it was open during download
    if (detailsOpen && !downloadInProgress && previousValueDownloadInProgress) {
      openProductDetailsModal({ tile, userToken, downloadInProgress, onDownload });
    }
  }, [detailsOpen, downloadInProgress, previousValueDownloadInProgress, onDownload, tile, userToken]);

  const downloadDisabled = downloadInProgress || !!downloadProductErrorMessage;

  return (
    <div className="footer">
      <div className="tags">
        {tags
          .filter((tag) => tag)
          .map((tag, index) => (
            <div className="tag" key={index} title={tag.description}>
              {tag?.value}
            </div>
          ))}
      </div>
      <div className="buttons">
        <i
          className={`fa fa-info-circle ${detailsOpen ? 'active' : ''}`}
          title={ResultItemLabels.productInfo()}
          onClick={() => {
            setDetailsOpen(true);
            openProductDetailsModal({ tile, userToken, downloadInProgress, onDownload });
          }}
        ></i>
        {tile.geometry && (
          <i
            className="fa fa-crosshairs"
            onClick={() => zoomToProduct(tile)}
            title={ResultItemLabels.zoomToProduct()}
          ></i>
        )}
        <i
          className={`fa fa-download ${
            downloadInProgress ? 'active disabled' : downloadDisabled ? 'disabled' : ''
          }`}
          title={ResultItemLabels.downloadProductLabel()}
          onClick={onDownload}
        ></i>
      </div>
    </div>
  );
};
