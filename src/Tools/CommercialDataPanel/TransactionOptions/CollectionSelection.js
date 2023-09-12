import React, { useEffect, useState } from 'react';
import { t } from 'ttag';
import {
  TPDICollections,
  TPDI,
  CancelToken,
  isCancelled,
  BBox,
  CRS_EPSG4326,
} from '@sentinel-hub/sentinelhub-js';

import { OrderInputTooltip } from './OrderInputTooltip';
import { getProvider, createSearchParams } from '../commercialData.utils';

export const CollectionSelectionType = {
  CREATE: 'CREATE',
  MANUAL: 'MANUAL',
  USER: 'USER',
};

const createCollectionSelectionTypeLabel = () => ({
  [CollectionSelectionType.CREATE]: t`Create a new collection`,
  [CollectionSelectionType.MANUAL]: t`Manual Entry`,
  [CollectionSelectionType.USER]: t`Your collections`,
});

const DefaultCollections = {
  [TPDICollections.AIRBUS_PLEIADES]: 'My Airbus Pleiades',
  [TPDICollections.AIRBUS_SPOT]: 'My Airbus Spot',
  [TPDICollections.MAXAR_WORLDVIEW]: 'My Maxar',
  [TPDICollections.PLANET_SCOPE]: 'My PlanetScope',
};

const CollectionsCache = new Map();

const createCollectionsCacheKey = (user, searchParams) => {
  const cacheKeys = [user.access_token, searchParams.dataProvider];
  if (
    searchParams.dataProvider === TPDICollections.PLANET_SCOPE ||
    searchParams.dataProvider === TPDICollections.PLANET_SKYSAT
  ) {
    cacheKeys.push(searchParams.itemType);
    cacheKeys.push(searchParams.productBundle);
  }

  return cacheKeys.join('-');
};

export const CollectionSelection = ({
  disabled,
  transactionOptions,
  setTransactionOptions,
  searchParams,
  user,
}) => {
  const [userCollections, setUserCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e) => {
    switch (e.target.value) {
      case CollectionSelectionType.CREATE:
        setTransactionOptions({
          ...transactionOptions,
          collectionId: null,
          collectionSelectionType: CollectionSelectionType.CREATE,
          manualCollection: false,
        });
        break;
      case CollectionSelectionType.MANUAL:
        setTransactionOptions({
          ...transactionOptions,
          collectionId: null,
          collectionSelectionType: CollectionSelectionType.MANUAL,
          manualCollection: true,
        });

        break;
      default: {
        setTransactionOptions({
          ...transactionOptions,
          collectionId: e.target.value,
          collectionSelectionType: CollectionSelectionType.USER,
          manualCollection: false,
        });
      }
    }
  };

  // try to find correct collection based
  // returns MANUAL, CREATE or existing collectionId
  const defaultCollectionId = (provider, transactionOptions) => {
    const { collectionId, collectionSelectionType } = transactionOptions;

    if (manualCollection) {
      return CollectionSelectionType.MANUAL;
    }
    if (!collectionId || collectionId === '') {
      if (collectionSelectionType === CollectionSelectionType.CREATE) {
        return CollectionSelectionType.CREATE;
      }
      const regex = new RegExp(DefaultCollections[provider], 'i');
      const defaultCollection = userCollections.find((collection) => regex.test(collection.name));
      return defaultCollection
        ? defaultCollection.id
        : userCollections.length
        ? userCollections[0].id
        : CollectionSelectionType.CREATE;
    }

    return collectionId;
  };

  useEffect(() => {
    let cancelToken = new CancelToken();
    const fetchUserCollections = async () => {
      try {
        setLoading(true);
        const provider = getProvider(searchParams.dataProvider);

        if (CollectionsCache.has(createCollectionsCacheKey(user, searchParams))) {
          setUserCollections(CollectionsCache.get(createCollectionsCacheKey(user, searchParams)));
          return;
        }

        const requestConfig = {
          authToken: user.access_token,
          cancelToken: cancelToken,
        };

        const params = createSearchParams(searchParams);
        // use default bbox as bounds (bbox or geometry) are mandatory for searchcompatiblecollections endpoint
        params.bbox = new BBox(CRS_EPSG4326, -180, -90, 180, 90);
        const compatibleCollections = await TPDI.getCompatibleCollections(provider, params, requestConfig);
        setUserCollections(compatibleCollections);
        CollectionsCache.set(createCollectionsCacheKey(user, searchParams), compatibleCollections);
      } catch (err) {
        if (!isCancelled(err)) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    if (user && user.access_token) {
      fetchUserCollections();
    }
    return () => {
      if (cancelToken) {
        cancelToken.cancel();
      }
    };
  }, [user, searchParams]);

  //update collectionId param once collections are loaded
  useEffect(() => {
    const calculatedCollectionId = defaultCollectionId(searchParams.dataProvider, transactionOptions);

    if (
      calculatedCollectionId !== CollectionSelectionType.CREATE &&
      calculatedCollectionId !== CollectionSelectionType.MANUAL
    ) {
      setTransactionOptions({ ...transactionOptions, collectionId: calculatedCollectionId });
    }
    // eslint-disable-next-line
  }, [userCollections]);

  const { collectionId, manualCollection } = transactionOptions;
  return (
    <div className="row">
      <label title={t`Collection ID`}>{t`Collection ID`}</label>
      <div>
        <div className="collection-selection">
          <select
            className="dropdown"
            disabled={disabled || loading}
            value={defaultCollectionId(searchParams.dataProvider, transactionOptions)}
            onChange={onChangeHandler}
          >
            <option value={CollectionSelectionType.CREATE}>
              {createCollectionSelectionTypeLabel().CREATE}
            </option>
            <option value={CollectionSelectionType.MANUAL}>
              {createCollectionSelectionTypeLabel().MANUAL}
            </option>
            {userCollections.length > 0 && (
              <optgroup label={createCollectionSelectionTypeLabel().USER}>
                {userCollections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {!!manualCollection && (
            <input
              defaultValue={collectionId}
              disabled={disabled}
              placeholder={t`Collection ID`}
              onChange={(e) => setTransactionOptions({ ...transactionOptions, collectionId: e.target.value })}
            ></input>
          )}
        </div>
        <OrderInputTooltip inputId="collectionId" />
      </div>
    </div>
  );
};
