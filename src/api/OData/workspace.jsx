import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { t } from 'ttag';

import store, { floatingPanelNotificationSlice, tabsSlice } from '../../store';
import { getAccessToken } from '../../Auth/authHelpers';
import { AttributeNames } from './assets/attributes';

const getAttributes = (attributes, name) => attributes.find((attribute) => attribute.Name === name);

export function createAddProductsToWorkspacePayload(products) {
  return products.map((product) => ({
    name: product.name,
    productId: product.id,
    cloudCover: getAttributes(product.attributes, AttributeNames.cloudCover)?.Value ?? 100,
    platformShortName: product.platformShortName,
    platformSerialIdentifier:
      getAttributes(product.attributes, AttributeNames.platformSerialIdentifier)?.Value ?? 'N/A',
    startDate: moment.utc(product.sensingTime).format(),
    online: product.online,
    size: product.contentLength < 0 ? 0 : product.contentLength,
    productType: product.productType,
    ...(product?.previewUrl ? { thumbnailDownloadLink: product.previewUrl } : {}),
  }));
}

export async function addProductsToWorkspace(products) {
  const token = getAccessToken();
  const url = `https://odp.dataspace.copernicus.eu/odata/v1/Workspace/OData.CSC.Create`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const payload = createAddProductsToWorkspacePayload(products);

  const extractErrorMsg = (error) => {
    if (Array.isArray(error?.response?.data?.detail)) {
      return error.response.data.detail.at(0)?.msg;
    }

    return error?.response?.data?.detail;
  };

  axios
    .post(url, payload, {
      headers: headers,
    })
    .then(async (response) => {
      if (response?.status === 200 || response?.status === 201) {
        store.dispatch(
          floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
            notificationUniqueId: uuid(),
            notificationAlertType: 'success',
            notificationMsg: [
              t`Product was successfully added to the `,
              <a
                key="workspace-link"
                href="https://workspace.dataspace.copernicus.eu/workspace/my-products"
                target="_blank"
                rel="noreferrer"
              >{t`Workspace`}</a>,
              '!',
            ],
          }),
        );
        const savedWorkspaceProducts = await getSavedWorkspaceProducts();
        store.dispatch(tabsSlice.actions.setSavedWorkspaceProducts(savedWorkspaceProducts));
      }
    })
    .catch((error) => {
      console.log('Error adding product to workspace:', error);
      const errorMsg = extractErrorMsg(error) ?? t`Something went wrong!`;
      store.dispatch(
        floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
          notificationUniqueId: uuid(),
          notificationAlertType: 'warning',
          notificationMsg: errorMsg,
        }),
      );
    });
}

export async function getSavedWorkspaceProducts() {
  const token = getAccessToken();
  const url = `https://odp.dataspace.copernicus.eu/odata/v1/Workspace?$count=true`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return axios
    .get(url, {
      headers: headers,
    })
    .then((response) => {
      if (response?.status === 200 || response?.status === 201) {
        return response.data.value;
      }
      return null;
    })
    .catch(() => []);
}

export async function getAvailableProcesorsForProducts(productIds) {
  const token = getAccessToken();
  const url = `https://odp.dataspace.copernicus.eu/odata/v1/Workflows/CompatibleWithProducts`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const payload = {
    ProductIDs: productIds,
  };

  return axios
    .post(url, payload, { headers })
    .then((response) => {
      if (response?.status === 200 || response?.status === 201) {
        return response.data.value;
      }
      return [];
    })
    .catch(() => []);
}
