import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { t } from 'ttag';

import store, { floatingPanelNotificationSlice, tabsSlice } from '../../store';
import { getAccessToken } from '../../Auth/authHelpers';
import { AttributeNames } from './assets/attributes';

export const BATCH_SIZE = 50;

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

  const extractErrorMsg = (error) => {
    if (Array.isArray(error?.response?.data?.detail)) {
      return error.response?.data.detail.at(0)?.msg;
    }

    return error?.response?.data?.detail;
  };

  const batches = [];
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    batches.push(products.slice(i, i + BATCH_SIZE));
  }

  try {
    let totalSuccessCount = 0;
    const uniqueErrors = new Set();

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const payload = createAddProductsToWorkspacePayload(batch);

      try {
        const response = await axios.post(url, payload, { headers });
        if (response?.status === 200 || response?.status === 201) {
          totalSuccessCount += batch.length;
        }
      } catch (error) {
        console.log(`Error adding batch ${i + 1} of ${batches.length} to workspace:`, error);

        const errorDetail = error?.response?.data?.detail;
        const errorMessage = errorDetail?.message || t`Unknown error occurred`;

        uniqueErrors.add(errorMessage);
      }
    }

    const savedWorkspaceProducts = await getSavedWorkspaceProducts();
    store.dispatch(tabsSlice.actions.setSavedWorkspaceProducts(savedWorkspaceProducts));

    if (totalSuccessCount === 0 && uniqueErrors.size > 0) {
      const errorMsg = (
        <div>
          {t`All items failed to be added to the workspace.`}
          <ul>
            {Array.from(uniqueErrors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );
      store.dispatch(
        floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
          notificationUniqueId: uuid(),
          notificationAlertType: 'warning',
          notificationMsg: errorMsg,
        }),
      );
    } else if (totalSuccessCount > 0 && uniqueErrors.size > 0) {
      const errorMsg = (
        <div>
          <span>
            {totalSuccessCount} {t`products added successfully.`} {t`Some failed to be added:`}
          </span>
          <ul>
            {Array.from(uniqueErrors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );
      store.dispatch(
        floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
          notificationUniqueId: uuid(),
          notificationAlertType: 'warning',
          notificationMsg: errorMsg,
        }),
      );
    } else if (totalSuccessCount > 0) {
      const isSingleProduct = totalSuccessCount === 1;
      const successMessage = isSingleProduct
        ? t`Product was successfully added to the `
        : t`Products were successfully added to the `;

      store.dispatch(
        floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
          notificationUniqueId: uuid(),
          notificationAlertType: 'success',
          notificationMsg: [
            successMessage,
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
    }
  } catch (error) {
    console.log('Error adding products to workspace:', error);
    const errorMsg = extractErrorMsg(error) ?? t`Something went wrong!`;
    store.dispatch(
      floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
        notificationUniqueId: uuid(),
        notificationAlertType: 'warning',
        notificationMsg: errorMsg,
      }),
    );
  }
}

export async function getSavedWorkspaceProducts() {
  const token = getAccessToken();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const baseUrl = `https://odp.dataspace.copernicus.eu/odata/v1/Workspace?$count=true`;
  const pageSize = 100;
  let url = `${baseUrl}&$top=${pageSize}`;
  const all = [];

  try {
    while (url) {
      const resp = await axios.get(url, { headers });
      if (resp?.status !== 200 && resp?.status !== 201) {
        break;
      }

      const data = resp.data || {};
      all.push(...(data.value || []));

      if (data['@odata.nextLink']) {
        url = data['@odata.nextLink'];
        continue;
      }

      const total = data['@odata.count'] ?? null;
      if (total !== null && all.length < total) {
        url = `${baseUrl}&$top=${pageSize}&$skip=${all.length}`;
        continue;
      }

      url = null;
    }
    return all;
  } catch (err) {
    return [];
  }
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
