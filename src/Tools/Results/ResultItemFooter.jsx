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
import { addProductToWorkspace } from '../../api/OData/workspace';

import WorkspacePlus from '../../icons/workspace-plus.svg?react';

import { getProductErrorMessage } from './ProductInfo/ProductInfo.utils';
import { ODataProductFileExtension, ODataProductTypeExtension } from '../../api/OData/ODataTypes';

export const ResultItemLabels = {
  productInfo: () => t`Product info`,
  zoomToProduct: () => t`Zoom to product`,
  addToWorkspace: () => t`Add to workspace`,
  downloadProductLabel: () => t`Download product`,
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

const getFileNameWithExtensionForProductType = ({ name, productType }) => {
  const extension = ODataProductTypeExtension[productType];

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

  const workspaceProductErrorMessage = getProductErrorMessage(
    ResultItemLabels.addToWorkspace(),
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

  const handleAddToWorkspace = () => {
    if (workspaceProductErrorMessage) {
      store.dispatch(notificationSlice.actions.displayError(workspaceProductErrorMessage));
      return null;
    }

    addProductToWorkspace(tile);
  };

  const downloadDisabled = downloadInProgress || !!downloadProductErrorMessage;

  return (
    <div className="footer">
      <div className="tags">
        {tags
          .filter((tag) => tag)
          .map((tag, index) => (
            <div className="tag" key={index}>
              {tag}
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
        <i title={ResultItemLabels.addToWorkspace()} onClick={handleAddToWorkspace}>
          <WorkspacePlus className={`workspace-plus ${workspaceProductErrorMessage ? 'disabled' : ''}`} />
        </i>
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
