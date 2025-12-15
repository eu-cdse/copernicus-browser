import React, { useEffect, useMemo } from 'react';
import { t } from 'ttag';

import store, { productDownloadSlice, notificationSlice, visualizationSlice, clmsSlice } from '../../store';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { connect } from 'react-redux';
import oDataHelpers, { getDatasetIdFromProductType } from '../../api/OData/ODataHelpers';
import moment from 'moment';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import { useODataDownload } from '../../hooks/useODataDownload';
import { ResultItemFooter } from './ResultItemFooter';

import {
  S1_CDAS_EW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HH,
  S1_CDAS_IW_HHHV,
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
} from '../SearchPanel/dataSourceHandlers/dataSourceConstants';
import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { constructBBoxFromBounds } from '../../Controls/ImgDownload/ImageDownload.utils';
import { getLeafletBoundsFromGeoJSON } from '../../utils/geojson.utils';
import { ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY, DATASOURCES, reqConfigMemoryCache } from '../../const';
import ProductPreview from './ProductPreview/ProductPreview';
import { handleError } from './BrowseProduct/BrowseProduct.utils';
import { AttributeNames } from '../../api/OData/assets/attributes';
import {
  CLMS_OPTIONS,
  flattenCLMSOptionsWithParent,
} from '../VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils';
import CustomCheckbox from '../../components/CustomCheckbox/CustomCheckbox';
import { doesUserHaveAccessToCCMVisualization } from '../VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';
import { getTagsFromAttributes } from '../../api/OData/OData.utils';
import { handleCLMSConsolidationPeriod } from '../../utils/clms';

export const ErrorMessage = {
  visualizationNotSupported: () => t`Visualization for this product type is not supported yet`,
  visualizationNotPossible: () => `Visualisation for this product is not possible`,
  ingestionDelay: () =>
    t`Visualisation for this product is not possible yet due to ingestion delay. Please try again later`,
  visualizeOfflineProduct: () => t`Visualization for offline products is not supported`,
  downloadOfflineProduct: () =>
    t`This product is currently unavailable and can not be downloaded. Add it to Workspace to order it.`,
  CCMAccessRoleNotEligible: () =>
    t`You are not eligible to use this feature. More info [here](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/ccm-how-to-register).`,
  atleastOneProductSelected: () => t`At least one product needs to be selected.`,
  productAlreadySavedToWorkspace: () => t`This product has already been saved to the workspace.`,
  landsatAccessRoleNotEligible: () => t`You are not eligible to use this feature.`,
};

const visualizationButtonDisabled = (tile, user) => {
  const datasetId = getDatasetIdFromProductType(tile?.productType, tile?.attributes);
  if (!datasetId) {
    return ErrorMessage.visualizationNotSupported();
  }

  if (!tile.online) {
    return ErrorMessage.visualizeOfflineProduct();
  }

  // Some Landsat-8/9 products have cloudCoverLand === -1 and cloudCover === undefined
  // which means that the sensingTime is at night, so visualization is not possible
  const cloudCoverAttribute = tile.attributes.find((attr) => attr.Name === 'cloudCover');
  const cloudCoverLandAttribute = tile.attributes.find((attr) => attr.Name === 'cloudCoverLand');
  if (
    cloudCoverLandAttribute !== undefined &&
    cloudCoverLandAttribute.Value === -1 &&
    cloudCoverAttribute === undefined
  ) {
    return ErrorMessage.visualizationNotSupported();
  }

  const hasAccessToCCMVisualization = doesUserHaveAccessToCCMVisualization(user.access_token);
  if (
    [
      CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
      CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
      CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
    ].includes(datasetId) &&
    !hasAccessToCCMVisualization
  ) {
    return ErrorMessage.CCMAccessRoleNotEligible();
  }

  return false;
};

const checkProductVisualization = async (datasetId, { geometry, sensingTime, attributes }) => {
  const dsh = getDataSourceHandler(datasetId);

  if (!(datasetId && dsh && geometry && sensingTime)) {
    return ErrorMessage.visualizationNotSupported();
  }

  const nominalDate = attributes.find((attr) => attr.Name === AttributeNames.nominalDate)?.Value;
  const fromTime = moment(nominalDate ?? sensingTime)
    .utc()
    .startOf('day')
    .toDate();
  const toTime = moment(nominalDate ?? sensingTime)
    .utc()
    .endOf('day')
    .toDate();

  const bbox = constructBBoxFromBounds(getLeafletBoundsFromGeoJSON(geometry));

  const { tiles } = await dsh.findTiles({
    datasetId: datasetId,
    bbox: bbox,
    fromTime: fromTime,
    toTime: toTime,
    nDates: 1,
    offset: 0,
    reqConfig: reqConfigMemoryCache,
    maxCloudCoverPercent: 100,
  });

  if (!(tiles && tiles.length)) {
    return moment.utc().diff(moment.utc(sensingTime), 'hours') < 6
      ? ErrorMessage.ingestionDelay()
      : ErrorMessage.visualizationNotPossible();
  }

  return null;
};

const createNewAbortController = () => new AbortController();

const setNewAbortController = (productId) => {
  const controller = createNewAbortController();
  store.dispatch(
    productDownloadSlice.actions.setCancelToken({
      productId: productId,
      cancelToken: controller,
    }),
  );
};

const ResultItem = ({
  userToken,
  tile,
  onResultSelected,
  onHover,
  onStopHover,
  modalId,
  zoom,
  productDownloadProgress,
  productDownloadCancelTokens,
  searchFormData,
  isResultChecked,
  onResultCheck,
  isAuthenticated,
  user,
  isProductAlreadySavedToWorkspace,
}) => {
  const { sensingTime, name, platformShortName, instrumentShortName, size, contentLength } = tile;

  const [{ downloadError }, downloadProduct] = useODataDownload();

  const tileTags = useMemo(() => getTagsFromAttributes(tile), [tile]);

  useEffect(() => {
    if (downloadError) {
      handleError(downloadError);
    }
  }, [downloadError]);

  useEffect(() => {
    if (!productDownloadCancelTokens[tile.id]) {
      setNewAbortController(tile.id);
    }
  }, [tile.id, productDownloadCancelTokens]);

  const visualize = async ({ onResultSelected, tile, currentZoom }) => {
    const datasetId = getDatasetIdFromProductType(tile?.productType, tile?.attributes);
    const collectionName = tile?.attributes.find((att) => att.Name === 'collectionName');
    if (collectionName?.Value === DATASOURCES.CLMS) {
      const clmsOptionsWithParent = flattenCLMSOptionsWithParent(CLMS_OPTIONS, DATASOURCES.CLMS);
      const { consolidationPeriodIndex, clmsDataset } = handleCLMSConsolidationPeriod(
        datasetId,
        clmsOptionsWithParent,
      );

      if (consolidationPeriodIndex !== undefined) {
        store.dispatch(clmsSlice.actions.setSelectedConsolidationPeriodIndex(consolidationPeriodIndex));
      }

      store.dispatch(clmsSlice.actions.setSelectedPath(clmsDataset.parentPath));
      store.dispatch(clmsSlice.actions.setSelectedCollection(clmsDataset.id));
    }

    const productVisualizationError = await checkProductVisualization(datasetId, tile);
    if (productVisualizationError) {
      store.dispatch(notificationSlice.actions.displayError(productVisualizationError));
      return;
    }

    if (
      [
        S1_CDAS_IW_VV,
        S1_CDAS_IW_VVVH,
        S1_CDAS_IW_HH,
        S1_CDAS_IW_HHHV,
        S1_CDAS_EW_HH,
        S1_CDAS_EW_HHHV,
        S1_CDAS_EW_VV,
        S1_CDAS_EW_VVVH,
      ].includes(datasetId)
    ) {
      const orbitDirection = searchFormData?.collectionForm?.selectedFilters?.S1?.orbitDirection;
      if (orbitDirection) {
        store.dispatch(
          visualizationSlice.actions.setOrbitDirection(
            orbitDirection.length > 0 ? orbitDirection.map((direction) => direction.value) : undefined,
          ),
        );
      }
    }

    onResultSelected({ ...tile, datasetId: datasetId });
  };

  const downloadInProgress =
    productDownloadProgress[tile.id] !== null && productDownloadProgress[tile.id] !== undefined;

  const visualizeButtonDisabled = visualizationButtonDisabled(tile, user);
  return (
    <div onMouseEnter={(e) => onHover(tile)} onMouseLeave={onStopHover} className="result-item">
      <div className="container">
        {onResultCheck && (
          <CustomCheckbox
            className={'tile-checkbox'}
            inputClassName="white"
            checked={isResultChecked}
            onChange={() => onResultCheck(tile)}
            disabled={isProductAlreadySavedToWorkspace}
            disabledTitle={ErrorMessage.productAlreadySavedToWorkspace()}
          />
        )}
        <ProductPreview product={tile} validate={true} />
        <div className="details">
          <div className="title" title={oDataHelpers.formatAttributesNames('name')}>
            {name}
          </div>
          <div className="content">
            {platformShortName ? (
              <div className="detail" title={oDataHelpers.formatAttributesNames('mission')}>
                <div>{oDataHelpers.formatAttributesNames('mission')}:</div>
                <div>
                  {platformShortName.length > 30 ? `${platformShortName.slice(0, 30)}...` : platformShortName}
                </div>
              </div>
            ) : null}
            {instrumentShortName ? (
              <div className="detail" title={oDataHelpers.formatAttributesNames('instrument')}>
                <div>{oDataHelpers.formatAttributesNames('instrument')}:</div>
                <div>{instrumentShortName}</div>
              </div>
            ) : null}
            {contentLength && contentLength > 0 ? (
              <div className="detail" title={oDataHelpers.formatAttributesNames('size')}>
                <div>{oDataHelpers.formatAttributesNames('size')}:</div>
                <div>{size}</div>
              </div>
            ) : null}
            {sensingTime ? (
              <div className="detail" title={oDataHelpers.formatAttributesNames('sensingTime')}>
                <div>{oDataHelpers.formatAttributesNames('sensingTime')}:</div>
                <div>{sensingTime}</div>
              </div>
            ) : null}
          </div>
        </div>
        <EOBButton
          disabled={!!visualizeButtonDisabled}
          text={t`Visualise`}
          className="small ellipsis"
          onClick={() => {
            const searchConfigFromSession = JSON.parse(
              sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY),
            );
            sessionStorage.setItem(
              ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY,
              JSON.stringify({
                ...searchConfigFromSession,
                shouldShowAdvancedSearchTab: false,
              }),
            );
            visualize({ onResultSelected, tile, currentZoom: zoom });
          }}
          title={
            visualizeButtonDisabled
              ? visualizeButtonDisabled
              : t`Visualise the latest acquisition for this day/location`
          }
        />
        <ResultItemFooter
          userToken={userToken}
          tile={tile}
          tags={tileTags}
          modalId={modalId}
          downloadInProgress={downloadInProgress}
          downloadProduct={downloadProduct}
          cancelToken={productDownloadCancelTokens[tile.id]}
          isAuthenticated={isAuthenticated}
        />
      </div>
      {downloadInProgress && (
        <ProgressBar
          value={productDownloadProgress[tile.id]}
          onCancel={() => {
            productDownloadCancelTokens[tile.id].abort();
            setNewAbortController(tile.id);
          }}
        />
      )}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  userToken: store.auth.user.access_token,
  selectedResult: store.searchResults.selectedResult,
  modalId: store.modal.id,
  selectedLanguage: store.language.selectedLanguage,
  productDownloadProgress: store.productDownload.progress,
  productDownloadCancelTokens: store.productDownload.cancelTokens,
  searchFormData: store.searchResults.searchFormData,
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(ResultItem);
