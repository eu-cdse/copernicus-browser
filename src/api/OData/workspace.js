import axios from 'axios';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { t } from 'ttag';

import store, { floatingPanelNotificationSlice } from '../../store';
import { getUserTokenFromLocalStorage } from '../../Auth/authHelpers';
import { AttributeNames } from './assets/attributes';

const getAttributes = (attributes, name) => attributes.find((attribute) => attribute.Name === name);

export function createAddProductToWorkspacePayload(product) {
  return [
    {
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
    },
  ];
}

export async function addProductToWorkspace(product) {
  const token = await getUserTokenFromLocalStorage();
  const url = `https://odp.dataspace.copernicus.eu/odata/v1/Workspace/OData.CSC.Create`;
  const headers = {
    Authorization: `Bearer ${token.access_token}`,
    'Content-Type': 'application/json',
  };

  const payload = createAddProductToWorkspacePayload(product);

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
    .then((response) => {
      if (response?.status === 200 || response?.status === 201) {
        store.dispatch(
          floatingPanelNotificationSlice.actions.setFloatingPanelNotification({
            notificationUniqueId: uuid(),
            notificationAlertType: 'success',
            notificationMsg: t`Product was successfully added to the Workspace!`,
          }),
        );
      }
    })
    .catch((error) => {
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
