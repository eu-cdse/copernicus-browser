import cloneDeep from 'lodash.clonedeep';
import { isFunction } from '../../../../utils';
import { DEFAULT_CLOUD_COVER_PERCENT } from '../../../../const';

export const CollectionFormInitialState = {
  selectedCollections: {},
  maxCc: {},
  selectedFilters: {},
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
        // 'Skip type' because is a metadata property
        if (itemId === 'type') {
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
