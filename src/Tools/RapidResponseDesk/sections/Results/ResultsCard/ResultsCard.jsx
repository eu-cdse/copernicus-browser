import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { t } from 'ttag';
import moment from 'moment';

import store, {
  mainMapSlice,
  modalSlice,
  resultsSectionSlice,
  searchResultsSlice,
  tabsSlice,
  themesSlice,
  visualizationSlice,
} from '../../../../../store';

import Button, { ButtonType } from '../../../../../components/Button/Button';
import { TagType } from '../../../../../components/Tag/Tag';
import TagGroup from '../../../../../components/TagGroup/TagGroup';
import ProductPreview from '../../../../Results/ProductPreview/ProductPreview';

import { rrdApi } from '../../../../../api/RRD/RRDApi';
import { RRDQueryBuilder } from '../../../../../api/RRD/RRDQueryBuilder';
import { getBoundsAndLatLng } from '../../../../CommercialDataPanel/commercialData.utils';
import { fetchPreviewImage, isImageLoading } from './results.utils';

import { MetadataSourceType } from '../../../rapidResponseProperties';
import { ModalId, RRD_INSTANCES_THEMES_LIST, TABS } from '../../../../../const';
import { ResultItemLabels } from '../../../../Results/ResultItemFooter';

import useOnHoverElement from '../../../../../hooks/useOnHoverElement';
import { useRRDHttpRequest } from '../../../../../hooks/useRRDHttpRequest';

import './ResultsCard.scss';
import { RRD_COLLECTIONS } from '../../../../SearchPanel/dataSourceHandlers/RRDDataSources/dataSourceRRDConstants';
import { isInGroup } from '../../../../../Auth/authHelpers';
import { RRD_GROUP } from '../../../../../api/RRD/assets/rrd.utils';

const ResultsCard = ({
  item,
  user,
  aoi,
  mapBounds,
  currentZoom,
  areaAndTimeSection,
  providerSection,
  advancedSection,
  resultsSection,
  isTaskingEnabled,
  onImageLoad,
  quicklookImages,
}) => {
  // eslint-disable-next-line
  const [dropdownEnabled, setDropdownEnabled] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [requestInProgress, setHttpRequest] = useRRDHttpRequest();
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const openProductDetailsModal = ({ tile, downloadInProgress, onDownload }) => {
    store.dispatch(searchResultsSlice.actions.setSelectedResult(item));
    store.dispatch(
      modalSlice.actions.addModal({
        modal: ModalId.RRD_PRODUCT_DETAILS,
        params: {
          downloadInProgress: downloadInProgress,
          onDownload: onDownload,
          previewImageUrl: previewImageUrl,
        },
      }),
    );
  };

  const hasValidQuicklook = (item, quicklookImages) =>
    !!(
      (item?.assets?.quicklook?.href || item?.assets?.['quicklook-png']?.href) &&
      (Array.isArray(item.bbox) || (item.geometry && typeof item.geometry === 'object')) &&
      quicklookImages[item._internalId] &&
      quicklookImages[item._internalId].startsWith('blob:')
    );
  useEffect(() => {
    const isItemInCart = () => {
      return resultsSection.cartResults?.quote?.products.some((product) =>
        product.scenes.some((scene) => scene.item.id === item.id),
      );
    };
    setInCart(isItemInCart());
  }, [resultsSection.cartResults, item]);

  useEffect(() => {
    const loadImage = async () => {
      if (quicklookImages[item._internalId]) {
        setPreviewImageUrl(quicklookImages[item._internalId]);
        return;
      }

      const imageUrl = await fetchPreviewImage(
        item,
        user.access_token,
        providerSection.imageType,
        isTaskingEnabled,
      );
      if (imageUrl) {
        setPreviewImageUrl(imageUrl);
        onImageLoad(item._internalId, imageUrl);
      }
    };

    loadImage();
  }, [item, user.access_token, quicklookImages, onImageLoad, providerSection.imageType, isTaskingEnabled]);

  const triggerAddToCartQuery = () => {
    try {
      const addToCartRequestBody = new RRDQueryBuilder(
        aoi,
        mapBounds,
        areaAndTimeSection,
        providerSection,
        advancedSection,
        resultsSection,
        isTaskingEnabled,
      ).createAddToCartRequestBody(item);

      setHttpRequest({
        request: rrdApi.addToCart,
        authToken: user.access_token,
        queryBody: addToCartRequestBody,
        responseHandler: (response) => {
          store.dispatch(resultsSectionSlice.actions.setCartResults(response));
        },
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  const triggerRemoveFromCartQuery = () => {
    try {
      const removeFromCartRequestBody = new RRDQueryBuilder(
        aoi,
        mapBounds,
        areaAndTimeSection,
        providerSection,
        advancedSection,
        resultsSection,
      ).createRemoveFromCartRequestBody(item, resultsSection.cartResults);

      setHttpRequest({
        request: rrdApi.removeFromCart,
        authToken: user.access_token,
        queryBody: removeFromCartRequestBody,
        responseHandler: (response) => store.dispatch(resultsSectionSlice.actions.setCartResults(response)),
      });
    } catch (e) {
      console.error(e.message);
    }
  };

  const visualizeResult = () => {
    const datasetId = item.assets?.visual['sh:collection_id'];
    if (!datasetId) {
      throw new Error(`No dataset found for ${item.id}`);
    }
    const fromTime = moment(item.properties.start_datetime).add(-1, 'second').utc();
    const toTime = moment(item.properties.end_datetime).add(1, 'second').utc();
    store.dispatch(
      themesSlice.actions.setSelectedThemeId({
        selectedThemeId: RRD_INSTANCES_THEMES_LIST,
        selectedThemesListId: RRD_INSTANCES_THEMES_LIST,
      }),
    );
    store.dispatch(searchResultsSlice.actions.setDisplayingSearchResults(false));
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        datasetId: datasetId,
        fromTime: fromTime,
        toTime: toTime,
      }),
    );

    if (item.geometry) {
      const { lat, lng, zoom } = getBoundsAndLatLng(item.geometry);
      store.dispatch(
        mainMapSlice.actions.setPosition({
          lat: lat,
          lng: lng,
          zoom: zoom,
        }),
      );
    }
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
  const quicklookOverlay = useSelector((state) => state.mainMap.quicklookOverlay);

  const isQuicklookActive = quicklookOverlay && quicklookOverlay._internalId === item._internalId;

  const handleQuicklookOnMap = () => {
    if (isQuicklookActive) {
      store.dispatch(mainMapSlice.actions.setQuicklookOverlay(null));
      return;
    }
    store.dispatch(mainMapSlice.actions.setQuicklookOverlay(null));

    setTimeout(() => {
      store.dispatch(
        mainMapSlice.actions.setQuicklookOverlay({
          id: item.id,
          _internalId: item._internalId,
          imageUrl: item?.assets?.quicklook?.href || item?.assets?.['quicklook-png']?.href || '',
          bbox: item.bbox,
          geometry: item.geometry,
        }),
      );
      zoomToProduct(item);
    }, 0);
  };

  const onHover = () => {
    store.dispatch(resultsSectionSlice.actions.setHighlightedResult(item._internalId));
  };

  const onLeave = () => {
    store.dispatch(resultsSectionSlice.actions.setHighlightedResult(undefined));
  };

  const transformMetaDataToReadableText = () => {
    switch (item.properties.metadata_source.toUpperCase()) {
      case MetadataSourceType.ROLLING:
        return 'rolling archive';
      case MetadataSourceType.CCMES:
        return 'ccme archive';
      case MetadataSourceType.TASKING:
        return 'tasking';
      default:
        return '';
    }
  };

  const isCollectionIdInCollections = (collectionId) => {
    if (!collectionId) {
      return false;
    }
    return RRD_COLLECTIONS.includes(collectionId);
  };

  const cardRef = useOnHoverElement(onHover, onLeave);

  const detailsOpen = false;
  const renderButtons = () => {
    return (
      <>
        {item.properties.metadata_source === MetadataSourceType.ROLLING ? (
          <>
            <Button
              label={t`Visualize`}
              style={{ height: '22px' }}
              type={ButtonType.success}
              onClick={visualizeResult}
              disabled={
                !item.assets?.visual ||
                !item.assets.visual['sh:collection_id'] ||
                !isCollectionIdInCollections(item.assets.visual['sh:collection_id'])
              }
            />
            {inCart ? (
              <Button
                disabled={requestInProgress}
                onClick={triggerRemoveFromCartQuery}
                label={t`Remove from cart`}
                outlined={true}
                style={{ height: '22px' }}
                type={ButtonType.success}
                isLoading={requestInProgress}
              />
            ) : (
              <Button
                disabled={requestInProgress}
                onClick={triggerAddToCartQuery}
                label={t`Add to cart`}
                style={{ height: '22px' }}
                type={ButtonType.success}
                isLoading={requestInProgress}
              />
            )}
          </>
        ) : inCart ? (
          <Button
            disabled={requestInProgress}
            onClick={triggerRemoveFromCartQuery}
            label={t`Remove from cart`}
            outlined={true}
            style={{ height: '22px' }}
            type={ButtonType.primary}
            isLoading={requestInProgress}
          />
        ) : (
          <Button
            disabled={requestInProgress}
            onClick={triggerAddToCartQuery}
            label={t`Add to cart`}
            style={{ height: '22px' }}
            type={ButtonType.primary}
            isLoading={requestInProgress}
          />
        )}
      </>
    );
  };

  return (
    <div ref={cardRef} className={`results-card ${transformMetaDataToReadableText()}`}>
      <div className="visible-content">
        <div className="thumbnail-container">
          <label className="archive-name">{`${transformMetaDataToReadableText()}`}</label>
          <ProductPreview
            product={{
              name: item.assets?.quicklook?.title || item.assets?.['quicklook-png']?.title || '',
              previewUrl: previewImageUrl,
            }}
            validate={true}
            isLoading={isImageLoading(item.id)}
          />
        </div>
        <div className="description-container">
          <span className="card-name">{item.id}</span>
          <div className="card-body">
            <div className="information-points-container">
              <div className="information-point">
                <label>{t`Mission`}:</label>
                <span>{item.properties.constellation}</span>
              </div>
              <div className="information-point">
                <label>{t`Instrument`}:</label>
                <span>{item.properties.instrument}</span>
              </div>
              <div className="information-point">
                <label>{t`Sensing Start`}:</label>
                <span>{item.properties.datetime}</span>
              </div>
              {item.properties['view:incidence_angle'] != null && (
                <div className="information-point">
                  <label>{t`Incidence angle`}:</label>
                  <span>{item.properties['view:incidence_angle']}</span>
                </div>
              )}
              {item.properties['eo:cloud_cover'] != null && (
                <div className="information-point">
                  <label>{t`Cloud cover`}:</label>
                  <span>{`${item.properties['eo:cloud_cover'].toFixed(2)}%`}</span>
                </div>
              )}
              {item.properties.spectralBand && (
                <div className="information-point">
                  <label>{t`Spectral band`}:</label>
                  <span>{item.properties.spectralBand}</span>
                </div>
              )}
              {item.properties.resolution && (
                <div className="information-point">
                  <label>{t`Resolution`}:</label>
                  <span>{item.properties.resolution}</span>
                </div>
              )}
            </div>
          </div>
          {item.properties.platform && (
            <TagGroup
              wrapMode={dropdownEnabled}
              items={[
                {
                  style: { textTransform: 'uppercase' },
                  type: TagType.light,
                  label: item.properties.platform,
                },
              ]}
            />
          )}
        </div>
        {/*<div className="dropdown-container">*/}
        {/*  <div*/}
        {/*    className={`title-arrow-wrapper${dropdownEnabled ? ' selected' : ''}`}*/}
        {/*    onClick={() => setDropdownEnabled(!dropdownEnabled)}*/}
        {/*  >*/}
        {/*    <div>{t`More`}</div>*/}
        {/*    {dropdownEnabled ? <i className="fa fa-chevron-up" /> : <i className="fa fa-chevron-down" />}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
      <div className="buttons-container">
        {renderButtons()}
        <div className="zoom-info">
          <i
            className={`fa fa-info-circle ${detailsOpen ? 'active' : ''}`}
            title={ResultItemLabels.productInfo()}
            onClick={() => {
              // setDetailsOpen(true);
              openProductDetailsModal({
                item,
                userToken: user.auth_token,
                downloadInProgress: false,
                onDownload: () => {},
              });
            }}
          ></i>
          {item.geometry && (
            <i
              className="fa fa-crosshairs"
              onClick={() => zoomToProduct(item)}
              title={ResultItemLabels.zoomToProduct()}
            ></i>
          )}
          {isInGroup(RRD_GROUP) && hasValidQuicklook(item, quicklookImages) && !isTaskingEnabled && (
            <i
              className={`fa ${isQuicklookActive ? 'fa-eye-slash' : 'fa-eye'}`}
              onClick={handleQuicklookOnMap}
              title={`${isQuicklookActive ? t`Hide quicklook from map` : t`Show quicklook on map`}`}
            ></i>
          )}
        </div>
      </div>

      {dropdownEnabled && (
        <div className="dropdown-content">
          <div className="description">{item.additionalContent}</div>
        </div>
      )}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  user: store.auth.user,
  anonToken: store.auth.anonToken,
  aoi: store.aoi,
  mapBounds: store.mainMap.bounds,
  currentZoom: store.mainMap.zoom,
  areaAndTimeSection: store.areaAndTimeSection,
  providerSection: store.imageQualityAndProviderSection,
  advancedSection: store.advancedSection,
  resultsSection: store.resultsSection,
  isTaskingEnabled: store.areaAndTimeSection.isTaskingEnabled,
  quicklookImages: store.resultsSection.quicklookImages,
});

export default connect(mapStoreToProps, null)(ResultsCard);
