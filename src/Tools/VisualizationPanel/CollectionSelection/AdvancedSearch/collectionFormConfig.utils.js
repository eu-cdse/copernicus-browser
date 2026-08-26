import cloneDeep from 'lodash.clonedeep';
import { isFunction } from '../../../../utils';
import { DEFAULT_CLOUD_COVER_PERCENT } from '../../../../const';

export const CollectionFormInitialState = {
  selectedCollections: {},
  maxCc: {},
  selectedFilters: {},
};

/**
 * Builds the value the form stores under a collection id in `selectedCollections`.
 *
 * The nesting is how the form encodes *how much* of a selection is specified: `{}` is the whole
 * collection, `{ [instrumentId]: {} }` is an instrument with no particular product type, and
 * `{ [instrumentId]: { [productTypeId]: {} } }` pins both. A product type without an instrument
 * has no representation and is dropped - the tree the form renders only ever reaches a product
 * type through its instrument.
 *
 * Lives here, next to CollectionFormInitialState, because two paths rebuild the form from a
 * completed search - createCollectionFormFromDatasetId (OData) and the STAC branch of
 * FindProductsButton - and they have to agree. If only one changed, the same search would render
 * a different selection depending on which backend answered it.
 */
export const buildSelectedCollectionEntry = ({ instrumentId, productTypeId } = {}) => {
  if (!instrumentId) {
    return {};
  }

  return { [instrumentId]: productTypeId ? { [productTypeId]: {} } : {} };
};

export const checkFormElementAccess = (formElement, props) => {
  const { hasAccess } = formElement || {};

  if (hasAccess === undefined) {
    return true;
  }

  if (isFunction(hasAccess)) {
    return hasAccess(props);
  }

  return !!hasAccess;
};

const checkRecursiveCollectionAccess = (formElements, props) => {
  if (!Array.isArray(formElements)) {
    return formElements;
  }

  return formElements
    .filter((formElement) => checkFormElementAccess(formElement, props))
    .map((formElement) => {
      let result = { ...formElement };

      if (Array.isArray(formElement.items)) {
        result.items = checkRecursiveCollectionAccess(formElement.items, props);
      }

      Object.keys(formElement)
        .filter(
          (key) =>
            !['items'].includes(key) &&
            Array.isArray(formElement[key]) &&
            formElement[key].length > 0 &&
            formElement[key].every((element) => typeof element === 'object'),
        )
        .forEach((key) => {
          result[key] = checkRecursiveCollectionAccess(formElement[key], props);
        });

      return result;
    });
};

export const getCollectionFormConfig = (collections, props) => {
  if (!collections || !Array.isArray(collections)) {
    return null;
  }
  return checkRecursiveCollectionAccess(collections, props);
};

const findItemByPath = (collection, path, currentIndex = 0) => {
  if (currentIndex >= path.length || !collection) {
    return collection;
  }

  const currentId = path[currentIndex];

  // If we are at the root level, check if the collection id matches
  if (currentIndex === 0) {
    if (collection.id !== currentId) {
      return null;
    }
    return findItemByPath(collection, path, currentIndex + 1);
  }

  if (Array.isArray(collection.items)) {
    const foundItem = collection.items.find((item) => item.id === currentId);
    if (foundItem) {
      return findItemByPath(foundItem, path, currentIndex + 1);
    }
  }

  return null;
};

export const getCollectionFormInitialState = (collectionFormConfig, formState, options = {}) => {
  if (!formState?.selectedCollections || !Object.keys(formState?.selectedCollections).length) {
    return CollectionFormInitialState;
  }

  let initialState = cloneDeep(formState);
  const { selectedCollections = {}, selectedFilters = {} } = initialState;
  const { setDefaultValues } = options;

  // Process each selected collection
  Object.keys(selectedCollections).forEach((selectedCollection) => {
    //check if selected collection is supported in current config
    const collectionConfig = collectionFormConfig.find((c) => c.id === selectedCollection);
    if (!collectionConfig) {
      delete initialState.selectedCollections?.[selectedCollection];
      delete initialState.maxCc?.[selectedCollection];
      delete initialState.selectedFilters?.[selectedCollection];
      return;
    }

    // Process the recursive structure
    const validateRecursiveSelections = (selections, path = [selectedCollection]) => {
      if (!selections || typeof selections !== 'object') {
        return;
      }

      Object.keys(selections).forEach((itemId) => {
        // 'Skip type' and 'platform' because they are metadata properties, not child item ids
        if (itemId === 'type' || itemId === 'platform') {
          return;
        }

        const itemPath = [...path, itemId];

        const item = findItemByPath(collectionConfig, itemPath);

        if (!item) {
          let current = initialState.selectedCollections;
          for (let i = 0; i < path.length; i++) {
            current = current[path[i]];
          }
          delete current[itemId];

          if (initialState.maxCc) {
            let ccCurrent = initialState.maxCc;
            let foundPath = true;

            for (let i = 0; i < path.length && foundPath; i++) {
              if (ccCurrent[path[i]]) {
                ccCurrent = ccCurrent[path[i]];
              } else {
                foundPath = false;
              }
            }

            if (foundPath && ccCurrent[itemId]) {
              delete ccCurrent[itemId];
            }
          }
        } else {
          const selectionObj = selections[itemId];
          if (typeof selectionObj === 'object' && !selectionObj.type && item.type) {
            // Add the type property
            selections[itemId].type = item.type;
          }
          validateRecursiveSelections(selections[itemId], itemPath);
        }
      });
    };

    validateRecursiveSelections(selectedCollections[selectedCollection]);

    // Process selected filters
    const selectedFiltersForCollection = selectedFilters?.[selectedCollection];
    if (selectedFiltersForCollection) {
      Object.keys(selectedFiltersForCollection).forEach((selectedFilter) => {
        //check if selected filter is supported in current config
        const additionalFiltersConfig = collectionConfig.additionalFilters?.find(
          (f) => f.id === selectedFilter,
        );

        if (!additionalFiltersConfig) {
          delete initialState.selectedFilters?.[selectedCollection]?.[selectedFilter];
        }
      });
    }

    //set default values for additional filter if needed
    if (setDefaultValues && collectionConfig.additionalFilters) {
      if (!initialState.selectedFilters[selectedCollection]) {
        initialState.selectedFilters[selectedCollection] = {};
      }

      collectionConfig.additionalFilters
        ?.filter((df) => df.defaultValue !== undefined)
        .forEach((df) => {
          if (!selectedFilters?.[selectedCollection]?.[df.id]) {
            initialState.selectedFilters[selectedCollection][df.id] = df.defaultValue;
          }
        });
    }
  });

  return initialState;
};

/**
 * Returns STAC search config for a visualization datasetId, or null if OData should be used.
 *
 * To add STAC support for a new dataset, set `datasetId` and `supportsStacSearch: true`
 * on the relevant entry in collectionFormConfig.js. Top-level collections, their items
 * (instruments) and those items' own items (product types) are all checked, so a datasetId
 * can live at any of the three nesting levels.
 *
 * `supportsStacSearch` is only required on the node that owns the STAC collection (the
 * top-level collection or the instrument) — product-type nodes inherit it from their parent,
 * which is what Global Mosaics relies on: one datasetId per product type, two STAC
 * collections, one `supportsStacSearch` flag per instrument.
 *
 * @param {string} datasetId - The visualization datasetId from Redux state
 * @param {Array} collections - The raw recursiveCollections array from collectionFormConfig.js
 * @returns {{ collectionName: string, collectionId: string, instrumentId?: string, productTypeId?: string } | null}
 */
export const getSTACConfigForDatasetId = (datasetId, collections) => {
  if (!datasetId || !Array.isArray(collections)) {
    return null;
  }

  for (const entry of collections) {
    if (entry.datasetId === datasetId && entry.supportsStacSearch) {
      return { collectionName: entry.collectionName, collectionId: entry.id };
    }

    if (Array.isArray(entry.items)) {
      for (const item of entry.items) {
        if (item.datasetId === datasetId && item.supportsStacSearch) {
          return { collectionName: item.collectionName ?? entry.collectionName, collectionId: entry.id };
        }

        if (!Array.isArray(item.items)) {
          continue;
        }

        for (const productType of item.items) {
          if (productType.datasetId !== datasetId) {
            continue;
          }
          if (!(productType.supportsStacSearch || item.supportsStacSearch || entry.supportsStacSearch)) {
            continue;
          }
          return {
            collectionName: productType.collectionName ?? item.collectionName ?? entry.collectionName,
            collectionId: entry.id,
            instrumentId: item.id,
            productTypeId: productType.id,
          };
        }
      }
    }
  }

  return null;
};

export const getNestedValue = (obj, path) => {
  if (!obj || !path.length) {
    return;
  }
  let current = obj;
  for (const key of path) {
    if (!current[key]) {
      return;
    }
    current = current[key];
  }

  return current;
};

export const getNestedCloudCover = (maxCc, path) => {
  if (!maxCc) {
    return DEFAULT_CLOUD_COVER_PERCENT;
  }

  let current = maxCc;
  for (const key of path) {
    if (!current[key]) {
      return DEFAULT_CLOUD_COVER_PERCENT;
    }
    if (typeof current[key] === 'number') {
      return current[key];
    }
    current = current[key];
  }

  return DEFAULT_CLOUD_COVER_PERCENT;
};
