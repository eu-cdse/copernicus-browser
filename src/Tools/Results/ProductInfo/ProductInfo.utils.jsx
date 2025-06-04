import React from 'react';
import jwt_dec from 'jwt-decode';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import oDataHelpers from '../../../api/OData/ODataHelpers';
import { AttributeNames } from '../../../api/OData/assets/attributes';
import { getLoggedInErrorMsg } from '../../../junk/ConstMessages';
import BrowseProduct from '../BrowseProduct/BrowseProduct';
import { ErrorMessage } from '../ResultItem';
import { CCM_PRODUCT_TYPE_ACCESS_RIGHTS } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';

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
      .filter((attr) => !(attr.key === 'size' && attr.value === '0MB')),
    ...product?.attributes.map((attr) => ({
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
          <div className="error-message">{<ReactMarkdown children={errorMessage} linkTarget="_blank" />}</div>
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
  } else if (shouldShowCCMAccessError(userToken, product)) {
    errorMessage = ErrorMessage.CCMAccessRoleNotEligible();
  }

  if (errorMessage) {
    return title ? `${title}\n${errorMessage}` : errorMessage;
  }

  return null;
};

export const shouldShowCCMAccessError = (userToken, product) =>
  isProductCCM(product) && !hasCCMDownloadAccess(userToken, product);

export const isProductCCM = ({ productType }) => {
  // we assume that all necessary access rights for products in CCM are in CCM_PRODUCT_TYPE_ACCESS_RIGHTS
  // so, we can assume that the product with productType is part of CCM
  // if there is an entry for productType in CCM_PRODUCT_TYPE_ACCESS_RIGHTS
  const downloadProductRoles = CCM_PRODUCT_TYPE_ACCESS_RIGHTS[productType]?.DOWNLOAD_PRODUCT_ROLES;
  return downloadProductRoles !== undefined;
};

export const hasCCMDownloadAccess = (userToken, { productType }) => {
  if (!userToken) {
    return false;
  }

  try {
    const roles = jwt_dec(userToken).realm_access.roles;
    const downloadProductRoles = CCM_PRODUCT_TYPE_ACCESS_RIGHTS[productType]?.DOWNLOAD_PRODUCT_ROLES;

    return !!downloadProductRoles?.some((accessRight) => roles.includes(accessRight));
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return false;
  }
};
