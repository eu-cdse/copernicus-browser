import React from 'react';
import { jwtDecode } from 'jwt-decode';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import oDataHelpers from '../../../api/OData/ODataHelpers';
import { AttributeNames } from '../../../api/OData/assets/attributes';
import { getLoggedInErrorMsg } from '../../../junk/ConstMessages';
import { openLoginPrompt } from '../../../Auth/LoginPrompt/loginPrompt.utils';
import store, { notificationSlice } from '../../../store';
import BrowseProduct from '../BrowseProduct/BrowseProduct';
import { ErrorMessage } from '../ResultItem';
import { CCM_PRODUCT_TYPE_ACCESS_RIGHTS } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';
import { LANDSAT_ACCESS_RIGHTS } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/landsatAccessRightsConfig';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../../rehypeConfig';
import { MODIS_ACCESS_RIGHTS } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/modisAccessRightsConfig';

export const commonProductAttributes = [
  'name',
  'size',
  'sensingTime',
  'originDate',
  'publicationDate',
  'modificationDate',
  'S3Path',
];

export const getAllProductAttributes = (product) => {
  const allAttributes = [
    ...commonProductAttributes
      .map((key) => ({ key: key, value: product[key] }))
      // Hide the size row for zero-byte products, regardless of which formatter (OData's
      // MB-only '< 1MB'/'NMB' or STAC's Bytes-TB range) produced the displayed string —
      // check the underlying byte value rather than string-matching the formatted output.
      .filter((attr) => !(attr.key === 'size' && !product.contentLength))
      .filter((attr) => attr.value !== undefined && attr.value !== null),
    ...(product?.attributes ?? []).map((attr) => ({
      key: attr.Name,
      value: attr.Value,
    })),
  ].map(({ key, value }) => ({
    key: key,
    name: oDataHelpers.formatAttributesNames(key),
    value: `${value}`,
  }));
  return allAttributes;
};

export const sectionAttributes = {
  summary: [
    'name',
    AttributeNames.platformShortName,
    AttributeNames.instrumentShortName,
    'size',
    'sensingTime',
  ],
  instrument: [AttributeNames.instrumentShortName],
  platform: [AttributeNames.platformShortName, AttributeNames.platformSerialIdentifier],
};

export const productAttributesSections = [
  {
    id: 'summary',
    title: () => t`Summary`,
    attributes: () => sectionAttributes.summary,
    render: renderSectionAttributes,
  },
  {
    id: 'product',
    title: () => t`Product`,
    attributes: (allAttributes) =>
      allAttributes
        .map((attr) => attr.key)
        .filter(
          (key) =>
            !(
              sectionAttributes.summary.includes(key) ||
              sectionAttributes.instrument.includes(key) ||
              sectionAttributes.platform.includes(key)
            ),
        ),
    render: renderSectionAttributes,
    sort: (a, b) => a.localeCompare(b),
  },
  {
    id: 'instrument',
    title: () => t`Instrument`,
    attributes: () => sectionAttributes.instrument,
    render: renderSectionAttributes,
  },
  {
    id: 'platform',
    title: () => t`Platform`,
    attributes: () => sectionAttributes.platform,
    render: renderSectionAttributes,
  },
  {
    id: 'singleFileDownload',
    title: () => t`Download single files`,
    render: ({ product, userToken }) => {
      const errorMessage = getProductErrorMessage(null, {
        userToken,
        product,
      });

      if (errorMessage) {
        return (
          <div className="error-message">
            {<ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{errorMessage}</ReactMarkdown>}
          </div>
        );
      }

      return <BrowseProduct product={product} userToken={userToken} onClose={() => {}} />;
    },
  },
];

function renderSectionAttributes({ section, attributes }) {
  let sectionAttributes = attributes.filter((attr) => section.attributes(attributes).includes(attr.key));
  if (section.sort) {
    sectionAttributes = sectionAttributes.sort((a, b) => section.sort(a.name, b.name));
  }
  return (
    <>
      {sectionAttributes.map((attr) => (
        <div className={`row`} key={attr.key}>
          <div className={`attribute left`}>{attr.name}: </div>
          <div className={`attribute right`}>{attr.value}</div>
        </div>
      ))}
    </>
  );
}

export const getProductErrorMessage = (title, { userToken, product }) => {
  let errorMessage = null;

  if (!userToken) {
    errorMessage = getLoggedInErrorMsg();
  } else if (product === null) {
    errorMessage = ErrorMessage.atleastOneProductSelected();
  } else if (!product.online) {
    errorMessage = ErrorMessage.downloadOfflineProduct();
  } else if (shouldShowAccessError(userToken, product, CCM_PRODUCT_TYPE_ACCESS_RIGHTS, 'productType')) {
    errorMessage = ErrorMessage.CCMAccessRoleNotEligible();
  } else if (shouldShowAccessError(userToken, product, LANDSAT_ACCESS_RIGHTS, 'platformShortName')) {
    errorMessage = ErrorMessage.landsatAccessRoleNotEligible();
  } else if (shouldShowAccessError(userToken, product, MODIS_ACCESS_RIGHTS, 'instrumentShortName')) {
    errorMessage = ErrorMessage.modisAccessRoleNotEligible();
  }

  if (errorMessage) {
    return title ? `${title}\n${errorMessage}` : errorMessage;
  }

  return null;
};

// Single entry point for reporting why a product action (download / add to Workspace / order
// processing) is blocked. Computes the reason once and routes it to the actionable login prompt
// or the plain error notification depending on what that reason was — the login case is
// recognised by comparing against getLoggedInErrorMsg() rather than re-checking accessValidation
// itself, so there's exactly one source of truth for "why is this blocked".
// Returns whether an error was actually reported, so callers can use it as their own guard
// instead of computing the same message a second time just to decide that.
export const showProductActionError = (title, accessValidation) => {
  const errorMessage = getProductErrorMessage(null, accessValidation);
  if (!errorMessage) {
    return false;
  }

  if (errorMessage === getLoggedInErrorMsg()) {
    openLoginPrompt(errorMessage, title);
  } else {
    store.dispatch(
      notificationSlice.actions.displayError(title ? `${title}\n${errorMessage}` : errorMessage),
    );
  }

  return true;
};

export const isProductInConfig = (product, config, productKey) =>
  config[product[productKey]]?.DOWNLOAD_PRODUCT_ROLES !== undefined;
export const hasDownloadAccessForConfig = (userToken, product, config, productKey) => {
  if (!userToken) {
    return false;
  }

  try {
    const roles = jwtDecode(userToken).realm_access?.roles;
    const downloadProductRoles = config[product[productKey]]?.DOWNLOAD_PRODUCT_ROLES;

    return !!downloadProductRoles?.some((accessRight) => roles.includes(accessRight));
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return false;
  }
};

export const shouldShowAccessError = (userToken, product, config, productKey) =>
  isProductInConfig(product, config, productKey) &&
  !hasDownloadAccessForConfig(userToken, product, config, productKey);
