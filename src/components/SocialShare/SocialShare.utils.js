import axios from 'axios';
import { HTTPS, MAX_CHARACTER_LIMIT_ERROR } from '../../const';
import store, { notificationSlice } from '../../store';

import { getDataSourceHashtags } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getAccessToken } from '../../Auth/authHelpers';

const DEFAULT_HASHTAGS = 'EarthObservation,RemoteSensing';
const LOCAL_STORAGE_SHARED_LINKS = 'cdsebrowser_shared_links';

const savedSharedLinksToLocalStorage = (destination, shortUrl) => {
  const existingLinks = getSharedLinks();

  const updatedLinks = {
    ...existingLinks,
    [destination]: shortUrl.startsWith(HTTPS) ? shortUrl : HTTPS + shortUrl,
  };

  localStorage.setItem(LOCAL_STORAGE_SHARED_LINKS, JSON.stringify(updatedLinks));
};

export const getSharedLinks = () => {
  try {
    const parsedSharedLinks = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SHARED_LINKS));
    return parsedSharedLinks || {};
  } catch (err) {
    console.error(err);
    return {};
  }
};

const handleStructureErrorMessages = (errors) =>
  errors.map((error) =>
    error?.code === MAX_CHARACTER_LIMIT_ERROR.TYPE ? MAX_CHARACTER_LIMIT_ERROR.MESSAGE : error?.message,
  );

const handleErrorMessages = (errors) =>
  store.dispatch(notificationSlice.actions.displayError(...handleStructureErrorMessages(errors)));

export async function getCustomDomainFullName() {
  const urlRequest = `${import.meta.env.VITE_CDSE_BACKEND}getcustomdomainfullname`;
  const token = getAccessToken();

  return axios({
    method: 'get',
    url: urlRequest,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.data)
    .catch((err) => {
      console.error(err);
    });
}

export async function getShortUrl(urlLocation) {
  const sharedLinks = getSharedLinks();
  const token = getAccessToken();

  if (!sharedLinks[urlLocation]) {
    const urlRequest = `${import.meta.env.VITE_CDSE_BACKEND}generateshorturl`;
    const fullName = await getCustomDomainFullName();
    const data = {
      ...(fullName && { domain: { fullName: fullName } }),
      destination: urlLocation,
      // Uncomment if you want to add back tracking user's id
      // description: { userId: 'anonymous user' },
    };

    // Uncomment if you want to add back tracking user's id
    // if (token !== undefined) {
    //   const decodedToken = jwt_dec(token);
    //   data.description.userId = decodedToken.user_context_id;
    // }

    // Uncomment if you want to add back tracking user's id
    // data.description = JSON.stringify(data.description);

    return axios({
      method: 'post',
      url: urlRequest,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: data,
    })
      .then((response) => {
        const { destination, shortUrl } = response.data;
        savedSharedLinksToLocalStorage(destination, shortUrl);

        return shortUrl;
      })
      .catch((err) => {
        handleErrorMessages(err?.response?.data?.detail?.errors, urlLocation);
        console.error(err);
        return '';
      });
  } else {
    return sharedLinks[urlLocation];
  }
}

export function getAppropriateHashtags(datasetId, useDefault = true) {
  let hashtags = getDataSourceHashtags(datasetId);

  if (useDefault) {
    hashtags += `${hashtags.length ? ',' : ''}${DEFAULT_HASHTAGS}`;
  }
  return hashtags;
}
