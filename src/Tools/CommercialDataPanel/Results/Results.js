import React, { useState } from 'react';
import Rodal from 'rodal';
import moment from 'moment';
import { TPDProvider } from '@sentinel-hub/sentinelhub-js';
import store, { commercialDataSlice } from '../../../store';

import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../../Notification/NotificationPanel';

import PreviewSmall from './PreviewSmall';
import PreviewLarge from './PreviewLarge';
import { filterSearchResults, formatNumberAsRoundedUnit } from '../commercialData.utils';

import './Results.scss';
import { t } from 'ttag';

export const formatDate = (value, formatMask = 'YYYY-MM-DD HH:mm:ss z') =>
  moment.utc(value).format(formatMask);

const ProductProperties = {
  [TPDProvider.AIRBUS]: {
    cloudCover: {
      label: () => t`Cloud cover`,
      format: formatNumberAsRoundedUnit,
    },
    constellation: {
      label: () => t`Constellation`,
    },
    processingLevel: {
      label: () => t`Processing level`,
    },
    snowCover: {
      label: () => t`Snow cover`,
      format: formatNumberAsRoundedUnit,
    },
    incidenceAngle: {
      label: () => t`Incidence angle`,
      format: (value) => formatNumberAsRoundedUnit(value, 2, '°'),
    },
    coverage: {
      label: () => t`Coverage`,
      format: (value) => formatNumberAsRoundedUnit(value * 100, 2, '%'),
    },
  },
  [TPDProvider.PLANET]: {
    cloud_cover: {
      label: () => t`Cloud cover`,
      format: (value) => formatNumberAsRoundedUnit(100 * value, 2),
    },
    snow_ice_percent: {
      label: () => t`Snow cover`,
      format: formatNumberAsRoundedUnit,
    },
    shadow_percent: {
      label: () => t`Shadow percent`,
      format: formatNumberAsRoundedUnit,
    },
    pixel_resolution: {
      label: () => t`Pixel resolution`,
    },
    coverage: {
      label: () => t`Coverage`,
      format: (value) => formatNumberAsRoundedUnit(value * 100, 2, '%'),
    },
  },
  [TPDProvider.MAXAR]: {
    coverage: {
      label: () => t`Coverage`,
      format: (value) => formatNumberAsRoundedUnit(value * 100, 2, '%'),
    },
  },
};

const renderProductDetails = (provider, product) => {
  return (
    <div className="details">
      {Object.keys(product)
        .filter((property) => !['id', 'date', 'geometry'].includes(property))
        .map((property) => (
          <div key={property} className="product-property">
            <div className="bold">
              {ProductProperties[provider] &&
              ProductProperties[provider][property] &&
              ProductProperties[provider][property].label()
                ? ProductProperties[provider][property].label()
                : property}
              :
            </div>
            <div>
              {ProductProperties[provider] &&
              ProductProperties[provider][property] &&
              ProductProperties[provider][property].format
                ? ProductProperties[provider][property].format(product[property])
                : product[property]}
            </div>
          </div>
        ))}
    </div>
  );
};

const Result = ({
  addProduct,
  isSelected,
  product,
  provider,
  removeProduct,
  searchParams,
  setPreviewLarge,
  cachedPreviews,
  setCachedPreviews,
  quotasEnabled,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetailsLabel = showDetails ? t`Hide details` : t`Show details`;
  return (
    <div
      className="products-container"
      key={product.id}
      onMouseEnter={() => store.dispatch(commercialDataSlice.actions.setHighlightedResult(product))}
      onMouseLeave={() => store.dispatch(commercialDataSlice.actions.setHighlightedResult(null))}
    >
      <div className="product">
        <div className="preview">
          <PreviewSmall
            collectionId={searchParams.dataProvider}
            onClick={setPreviewLarge}
            product={product}
            cachedPreviews={cachedPreviews}
            setCachedPreviews={setCachedPreviews}
          ></PreviewSmall>
          {!!quotasEnabled && !isSelected && (
            <EOBButton fluid onClick={() => addProduct(product.id)} text={t`add`} />
          )}
          {!!quotasEnabled && isSelected && (
            <EOBButton fluid onClick={() => removeProduct(product.id)} text={t`remove`} />
          )}
        </div>
        <div className="basic-info">
          <div className="bold" title={t`Product id`}>
            <i className="fa fa-info" />
            {product.id}
          </div>
          <div title={t`Acquisition date`}>
            <i className="fa fa-calendar" />
            {formatDate(product.date)}
          </div>
          <div
            className="toggle-details"
            title={toggleDetailsLabel}
            onClick={() => setShowDetails(!showDetails)}
          >
            {toggleDetailsLabel}{' '}
            <i className={`fa ${showDetails ? 'fa-angle-double-up' : 'fa-angle-double-down'}`}></i>
          </div>
        </div>
      </div>
      {!!showDetails && renderProductDetails(provider, product)}
    </div>
  );
};

export const Results = ({
  addProduct,
  onCreateOrder,
  provider,
  removeProduct,
  searchParams,
  searchResults,
  selectedProducts,
  location,
  cachedPreviews,
  setCachedPreviews,
  displaySearchResults,
  quotasEnabled,
}) => {
  const [previewLarge, setPreviewLarge] = useState(null);

  if (!searchResults || !searchResults.length) {
    return (
      <div className="commercial-data-results">
        <NotificationPanel msg={t`No products found`} type="info" />
      </div>
    );
  }
  const results = filterSearchResults(searchResults, provider);
  return (
    <div className="commercial-data-results">
      <label className="toggle-display-results">
        <input
          type="checkbox"
          checked={displaySearchResults}
          value={displaySearchResults}
          onChange={() =>
            store.dispatch(commercialDataSlice.actions.setDisplaySearchResults(!displaySearchResults))
          }
        />
        {t`Show products on map`}
      </label>

      {results.map((product) => (
        <Result
          key={product.id}
          provider={provider}
          product={product}
          searchParams={searchParams}
          setPreviewLarge={setPreviewLarge}
          addProduct={addProduct}
          removeProduct={removeProduct}
          isSelected={!!selectedProducts.find((id) => id === product.id)}
          cachedPreviews={cachedPreviews}
          setCachedPreviews={setCachedPreviews}
          searchResults={searchResults}
          quotasEnabled={quotasEnabled}
        />
      ))}
      <div className="actions-container">
        <EOBButton
          className="commercial-data-button"
          fluid
          onClick={onCreateOrder}
          text={t`Prepare order`}
          disabled={!quotasEnabled}
        />
      </div>
      {!!location && (
        <Rodal
          animation="slideUp"
          visible={true}
          width={600}
          height={450}
          onClose={() => store.dispatch(commercialDataSlice.actions.setLocation(null))}
          closeOnEsc={true}
        >
          <div className="commercial-data-results-modal">
            <div className="header">{t`Products`}</div>
            <div className="commercial-data-results">
              {filterSearchResults(searchResults, provider, location).map((product) => (
                <Result
                  key={product.id}
                  provider={provider}
                  product={product}
                  searchParams={searchParams}
                  setPreviewLarge={setPreviewLarge}
                  addProduct={addProduct}
                  removeProduct={removeProduct}
                  isSelected={!!selectedProducts.find((id) => id === product.id)}
                  cachedPreviews={cachedPreviews}
                  setCachedPreviews={setCachedPreviews}
                  searchResults={searchResults}
                  quotasEnabled={quotasEnabled}
                />
              ))}
            </div>
          </div>
        </Rodal>
      )}
      <PreviewLarge
        imgUrl={previewLarge && previewLarge.url ? previewLarge.url : null}
        onClose={() => setPreviewLarge(null)}
        title={previewLarge && previewLarge.title ? `${previewLarge.title}` : null}
      />
    </div>
  );
};
