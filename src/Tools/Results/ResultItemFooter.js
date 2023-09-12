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
import { usePrevious } from '../../utils';
import { addProductToWorkspace } from '../../api/OData/workspace';

import { ReactComponent as WorkspacePlus } from '../../icons/workspace-plus.svg';

import { getLoggedInErrorMsg } from '../../junk/ConstMessages';
import { BROWSE_PRODUCT_ENABLED } from './BrowseProduct/BrowseProduct';
import { ErrorMessage } from './ResultItem';

export const DOWNLOAD_PRODUCT_LABEL = t`Download product`;
const DOWNLOAD_SINGLE_FILES_LABEL = t`Download single files`;

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

export const getDownloadProductErrorMessage = (title, { userToken, product }) => {
  if (!userToken) {
    return `${title} (${getLoggedInErrorMsg()})`;
  }

  if (!product.online) {
    return `${title} (${ErrorMessage.downloadOfflineProduct()})`;
  }

  return null;
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
  const [browseProductOpen, setBrowseProductOpen] = useState(false);

  const previousValueDownloadInProgress = usePrevious(downloadInProgress);

  useEffect(() => {
    if (modalId !== ModalId.PRODUCT_DETAILS) {
      setDetailsOpen(false);
    }

    if (modalId !== ModalId.BROWSE_PRODUCT) {
      setBrowseProductOpen(false);
    }
  }, [modalId]);

  const onDownload = useCallback(() => {
    const downloadProductErrorMessage = getDownloadProductErrorMessage(DOWNLOAD_PRODUCT_LABEL, {
      userToken,
      product: tile,
    });

    if (downloadProductErrorMessage) {
      store.dispatch(notificationSlice.actions.displayError(downloadProductErrorMessage));
      return null;
    }

    if (downloadInProgress) {
      return null;
    }
    downloadProduct({
      id: tile.id,
      name: `${tile.name}.zip`,
      token: userToken,
      cancelToken: cancelToken,
      setProgress: setProgress,
    });
  }, [downloadInProgress, cancelToken, downloadProduct, tile, userToken]);

  useEffect(() => {
    //rerender modal after download is completed if it was open during download
    if (detailsOpen && !downloadInProgress && previousValueDownloadInProgress) {
      openProductDetailsModal({ tile, userToken, downloadInProgress, onDownload });
    }
  }, [detailsOpen, downloadInProgress, previousValueDownloadInProgress, onDownload, tile, userToken]);

  const onBrowseProduct = () => {
    const downloadProductErrorMessage = getDownloadProductErrorMessage(DOWNLOAD_SINGLE_FILES_LABEL, {
      userToken,
      product: tile,
    });

    if (downloadProductErrorMessage) {
      store.dispatch(notificationSlice.actions.displayError(downloadProductErrorMessage));
      return null;
    }

    if (downloadInProgress) {
      return null;
    }

    setBrowseProductOpen(true);
    store.dispatch(searchResultsSlice.actions.setSelectedResult(tile));
    store.dispatch(
      modalSlice.actions.addModal({
        modal: ModalId.BROWSE_PRODUCT,
        params: {
          downloadInProgress: downloadInProgress,
          onDownload: onDownload,
        },
      }),
    );
  };

  const handleAddToWorkspace = () =>
    !userToken
      ? store.dispatch(
          notificationSlice.actions.displayError(`${t`Add to workspace`} (${getLoggedInErrorMsg()})`),
        )
      : addProductToWorkspace(tile);

  const downloadDisabled = !userToken || !tile.online;

  const downloadProductErrorMessage = getDownloadProductErrorMessage(DOWNLOAD_PRODUCT_LABEL, {
    userToken,
    product: tile,
  });

  const downloadSingleFileErrorMessage = getDownloadProductErrorMessage(DOWNLOAD_SINGLE_FILES_LABEL, {
    userToken,
    product: tile,
  });

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
          title={t`Product info`}
          onClick={() => {
            setDetailsOpen(true);
            openProductDetailsModal({ tile, userToken, downloadInProgress, onDownload });
          }}
        ></i>
        {tile.geometry && (
          <i className="fa fa-crosshairs" onClick={() => zoomToProduct(tile)} title={t`Zoom to product`}></i>
        )}
        <WorkspacePlus
          className={`workspace-plus ${!userToken ? 'disabled' : ''}`}
          title={`${t`Add to workspace`}${!userToken ? ` (${getLoggedInErrorMsg()})` : ''}`}
          onClick={handleAddToWorkspace}
        />
        <i
          className={`fa fa-download ${
            downloadInProgress ? 'active disabled' : downloadDisabled ? 'disabled' : ''
          }`}
          title={downloadProductErrorMessage ? downloadProductErrorMessage : DOWNLOAD_PRODUCT_LABEL}
          onClick={onDownload}
        ></i>
        {BROWSE_PRODUCT_ENABLED && (
          <i
            className={`fa ${browseProductOpen ? 'fa-folder-open-o active ' : 'fa-folder-o '}${
              downloadDisabled ? 'disabled' : ''
            }`}
            title={
              downloadSingleFileErrorMessage ? downloadSingleFileErrorMessage : DOWNLOAD_SINGLE_FILES_LABEL
            }
            onClick={onBrowseProduct}
          ></i>
        )}
      </div>
    </div>
  );
};
