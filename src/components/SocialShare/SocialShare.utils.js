import axios from 'axios';
import { HTTPS, MAX_CHARACTER_LIMIT_ERROR } from '../../const';
import store, { notificationSlice } from '../../store';

import { getDataSourceHashtags } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const API_KEY = `${import.meta.env.VITE_REBRANDLY_API_KEY}`;
const DEFAULT_HASHTAGS = 'EarthObservation,RemoteSensing';
const DOMAIN_TYPE = {
  CUSTOM_DOMAIN: 'USER',
};
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
  const urlRequest = 'https://api.rebrandly.com/v1/domains';

  return axios({
    method: 'get',
    url: urlRequest,
    headers: {
      'Content-Type': 'application/json',
      apiKey: API_KEY,
    },
  })
    .then(
      (response) =>
        response.data.find((d) => d.type === DOMAIN_TYPE.CUSTOM_DOMAIN && d.active === true)?.fullName,
    )
    .catch((err) => {
      console.error(err);
    });
}

export async function getShortUrl(urlLocation) {
  const sharedLinks = getSharedLinks();

  if (!sharedLinks[urlLocation]) {
    const urlRequest = 'https://api.rebrandly.com/v1/links';
    const fullName = await getCustomDomainFullName();
    const data = {
      ...(fullName && { domain: { fullName: fullName } }),
      destination: urlLocation,
    };

    return axios({
      method: 'post',
      url: urlRequest,
      headers: {
        'Content-Type': 'application/json',
        apiKey: API_KEY,
      },
      data: data,
    })
      .then((response) => {
        const { destination, shortUrl } = response.data;
        savedSharedLinksToLocalStorage(destination, shortUrl);

        return shortUrl;
      })
      .catch((err) => {
        handleErrorMessages(err?.response?.data?.errors, urlLocation);
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
