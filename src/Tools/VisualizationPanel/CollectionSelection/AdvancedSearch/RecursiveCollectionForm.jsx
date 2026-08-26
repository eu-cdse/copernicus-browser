import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import cloneDeep from 'lodash.clonedeep';

import './CollectionForm.scss';
import { TABS } from '../../../../const';
import { usePrevious } from '../../../../hooks/usePrevious';
import { getODataCollectionInfoFromDatasetId } from '../../../../api/OData/ODataHelpers';
import SelectedFiltersList from './filters/SelectedFiltersList';
import AdditionalFiltersToggle from './filters/AdditionalFiltersToggle';
import { getAllFiltersForCollection } from './filters/AdditionalFilters.utils';
import AdditionalFilters from './filters/AdditionalFilters';

import { recursiveCollections } from './collectionFormConfig';
import {
  buildSelectedCollectionEntry,
  CollectionFormInitialState,
  getCollectionFormInitialState,
  getCollectionFormConfig,
  getNestedValue,
} from './collectionFormConfig.utils';
import RecursiveCollectionItem from './RecursiveCollectionItem';

const CLOUD_COVER_PERCENT = 100;

// Recursively auto-selects all children of a config item (used when a collection/item has
// hideChildren set), building the nested selection object in place on parentObj.
const addAllChildrenToSelection = (items, parentObj) => {
  items.forEach((item) => {
    parentObj[item.id] = { type: item.type };
    if (Array.isArray(item.items) && item.items.length > 0) {
      addAllChildrenToSelection(item.items, parentObj[item.id]);
    }
  });
};

export const createCollectionFormFromDatasetId = (datasetId, params) => {
  const oDataCollectionInfo = getODataCollectionInfoFromDatasetId(datasetId, params);

  if (oDataCollectionInfo === null) {
    return null;
  }

  const collectionForm = cloneDeep(CollectionFormInitialState);

  oDataCollectionInfo.forEach((collectionInfo) => {
    collectionForm.selectedCollections[collectionInfo.id] = buildSelectedCollectionEntry({
      instrumentId: collectionInfo.instrument,
      productTypeId: collectionInfo.productType,
    });

    if (collectionInfo.maxCC) {
      collectionForm.maxCc = {
        [collectionInfo.id]: { [collectionInfo.instrument]: collectionInfo.maxCC },
      };
    }

    if (collectionInfo.selectedFilters) {
      collectionForm.selectedFilters = {
        [collectionInfo.id]: collectionInfo.selectedFilters,
      };
    }
  });

  return collectionForm;
};

function RecursiveCollectionForm({
  selectedCollections,
  maxCc,
  setSelectedCollections,
  setMaxCc,
  selectedFilters = {},
  setSelectedFilters,
  resetSelectedFilters,
  selectedTabIndex,
  resultsPanelSelected,
  additionFiltersPositionTop,
  setAdditionalFiltersPositionTop,
  userToken,
  setCollectionForm,
}) {
  const [additionalFiltersCollection, setAdditionalFiltersCollection] = useState();
  const prevUserToken = usePrevious(userToken);

  useEffect(() => {
    if (
      additionalFiltersCollection &&
      selectedCollections &&
      !selectedCollections[additionalFiltersCollection]
    ) {
      setAdditionalFiltersCollection(null);
    }
  }, [selectedCollections, additionalFiltersCollection]);

  useEffect(() => {
    if (!!userToken !== !!prevUserToken) {
      const formConfig = getCollectionFormConfig(recursiveCollections, { userToken });
      const initialState = getCollectionFormInitialState(
        formConfig,
        {
          selectedCollections: selectedCollections,
          maxCc: maxCc,
          selectedFilters: selectedFilters,
        },
        { setDefaultValues: userToken && !prevUserToken },
      );

      setCollectionForm(initialState);
    }
  }, [selectedCollections, userToken, prevUserToken, selectedFilters, setCollectionForm, maxCc]);

  const onItemToggle = (path) => {
    if (!path.length) {
      return;
    }

    const collectionId = path[0];
    const collection = getCollectionFormConfig(recursiveCollections, { userToken }).find(
      (c) => c.id === collectionId,
    );
    if (!collection) {
      return;
    }

    // Collection-level toggle
    if (path.length === 1) {
      handleCollectionToggle(collectionId, collection);
      return;
    }

    handleNestedItemToggle(path);
  };

  const handleCollectionToggle = (collectionId, collection) => {
    const mustRemove = !!selectedCollections[collectionId];
    if (mustRemove) {
      const newSelectedOptionsObj = cloneDeep(selectedCollections);
      delete newSelectedOptionsObj[collectionId];
      setSelectedCollections(newSelectedOptionsObj);

      if (maxCc[collectionId]) {
        const newMaxCc = cloneDeep(maxCc);
        delete newMaxCc[collectionId];
        setMaxCc(newMaxCc);
      }
    } else {
      // Build the complete new selectedCollections state
      const newSelectedCollections = {
        ...selectedCollections,
        [collectionId]: { platform: collection.platform },
      };

      // If hideChildren is true, auto-select all children recursively
      if (collection.hideChildren && Array.isArray(collection.items)) {
        addAllChildrenToSelection(collection.items, newSelectedCollections[collectionId]);
      }
      // Auto-select default instruments from items array (existing behavior for non-hideChildren)
      else if (Array.isArray(collection.items)) {
        let selectedInstruments = collection.items.filter(
          (item) => item.type === 'instrument' && item.selected,
        );

        if (
          selectedInstruments.length === 0 &&
          collection.items.length === 1 &&
          collection.items[0].type === 'instrument' &&
          collection.items[0].selected === true
        ) {
          selectedInstruments = [collection.items[0]];
        }

        // Build cloud cover state for instruments
        const newMaxCc = { ...maxCc };

        // Add selected instruments to the state object
        selectedInstruments.forEach((instrument) => {
          newSelectedCollections[collectionId] = {
            ...newSelectedCollections[collectionId],
            [instrument.id]: {
              type: instrument.type,
            },
          };

          // Set cloud cover for instrument if supported
          if (instrument.supportsCloudCover) {
            if (!newMaxCc[collectionId]) {
              newMaxCc[collectionId] = {};
            }
            newMaxCc[collectionId][instrument.id] = CLOUD_COVER_PERCENT;
          }
        });

        // Update maxCc state if any instruments support cloud cover
        if (selectedInstruments.some((instrument) => instrument.supportsCloudCover)) {
          setMaxCc(newMaxCc);
        }
      }

      // Set cloud cover at collection level if supported
      if (collection.supportsCloudCover) {
        setMaxCc({ ...maxCc, [collectionId]: CLOUD_COVER_PERCENT });
      }

      // Call setSelectedCollections only once with the complete state
      setSelectedCollections(newSelectedCollections);

      // Set default filters
      if (collection?.additionalFilters) {
        collection?.additionalFilters
          .filter((af) => af.defaultValue)
          .forEach((af) => setSelectedFilters(collectionId, af.id, af.defaultValue));
      }
    }
  };

  const handleNestedItemToggle = (path) => {
    const collectionId = path[0];

    const collections = getCollectionFormConfig(recursiveCollections, { userToken });
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) {
      return;
    }

    const findItemByPath = (currentItem, currentPath, index = 0) => {
      if (index >= currentPath.length || !currentItem) {
        return null;
      }

      if (index === 0) {
        if (currentItem.id !== currentPath[0]) {
          return null;
        }
        if (index === currentPath.length - 1) {
          return currentItem;
        }
        return findItemByPath(currentItem, currentPath, index + 1);
      }

      if (Array.isArray(currentItem.items)) {
        const foundItem = currentItem.items.find((item) => item.id === currentPath[index]);
        if (foundItem) {
          if (index === currentPath.length - 1) {
            return foundItem;
          }
          return findItemByPath(foundItem, currentPath, index + 1);
        }
      }

      return null;
    };

    // Find the toggled item
    const toggledItem = findItemByPath(collection, path);
    if (!toggledItem) {
      return;
    }

    const isItemSelected = getNestedValue(selectedCollections, path) !== undefined;
    if (isItemSelected) {
      const newSelectedCollections = cloneDeep(selectedCollections);
      let current = newSelectedCollections;

      // Navigate to the parent object
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          return;
        }
        current = current[path[i]];
      }

      delete current[path[path.length - 1]];
      setSelectedCollections(newSelectedCollections);

      // Handle cloud cover if needed
      if (toggledItem.supportsCloudCover) {
        const newMaxCc = cloneDeep(maxCc);
        let ccCurrent = newMaxCc;

        // Navigate to the parent object
        let validPath = true;
        for (let i = 0; i < path.length - 1 && validPath; i++) {
          if (!ccCurrent[path[i]]) {
            validPath = false;
          } else {
            ccCurrent = ccCurrent[path[i]];
          }
        }

        if (validPath) {
          delete ccCurrent[path[path.length - 1]];
          setMaxCc(newMaxCc);
        }
      }
    } else {
      const newSelectedCollections = cloneDeep(selectedCollections);
      let current = newSelectedCollections;

      // Ensure the path exists and navigate. When this creates the top-level group entry
      // (i.e. a nested child is toggled before the group itself), carry over the group's
      // `platform` the same way handleCollectionToggle does - otherwise extractPlatforms()
      // in STACSearchPayloadBuilder.ts (which only reads the top-level entry) would silently
      // build no platform filter for a STAC-enabled collection nested inside a group that
      // needs one - see MR review F3.
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = i === 0 ? { platform: collection.platform } : {};
        }
        current = current[path[i]];
      }

      current[path[path.length - 1]] = { type: toggledItem.type };

      // If hideChildren is true, auto-select all children recursively
      if (toggledItem.hideChildren && Array.isArray(toggledItem.items)) {
        addAllChildrenToSelection(toggledItem.items, current[path[path.length - 1]]);
      }

      setSelectedCollections(newSelectedCollections);

      // Handle cloud cover if needed
      if (toggledItem.supportsCloudCover) {
        const newMaxCc = cloneDeep(maxCc);
        let ccCurrent = newMaxCc;

        // Ensure the path exists and navigate
        for (let i = 0; i < path.length - 1; i++) {
          if (!ccCurrent[path[i]]) {
            ccCurrent[path[i]] = {};
          }
          ccCurrent = ccCurrent[path[i]];
        }

        ccCurrent[path[path.length - 1]] = CLOUD_COVER_PERCENT;
        setMaxCc(newMaxCc);
      }
    }
  };

  // Handle changes to cloud cover values for any nesting level
  const onMaxCcChange = (value, path) => {
    if (!path || path.length === 0) {
      return;
    }

    const newMaxCc = cloneDeep(maxCc || {});

    // For a simple path with just one element, set directly
    if (path.length === 1) {
      newMaxCc[path[0]] = value;
      setMaxCc(newMaxCc);
      return;
    }

    const result = {};
    let current = result;

    // Build the path up to the second-to-last element
    for (let i = 0; i < path.length - 2; i++) {
      current[path[i]] = {};
      current = current[path[i]];
    }

    // Set the last two elements properly
    const secondLastKey = path[path.length - 2];
    const lastKey = path[path.length - 1];
    current[secondLastKey] = { [lastKey]: value };

    // Merge with existing state, handling any potential conflicts
    const mergedMaxCc = mergeCloudCoverSettings(newMaxCc, result);

    // Update the state
    setMaxCc(mergedMaxCc);
  };

  const mergeCloudCoverSettings = (existingSettings, newSettings) => {
    const result = { ...existingSettings };

    // Process each top-level key
    Object.entries(newSettings).forEach(([key, value]) => {
      // If the existing value is a number and new value is an object, replace it
      if (typeof existingSettings[key] === 'number' && typeof value === 'object') {
        result[key] = value;
      }
      // If both are objects, recursively merge
      else if (typeof existingSettings[key] === 'object' && typeof value === 'object') {
        result[key] = mergeCloudCoverSettings(existingSettings[key], value);
      }
      // Otherwise, just use the new value
      else {
        result[key] = value;
      }
    });

    return result;
  };

  const isAdditionalFiltersPanelOpen = (collectionId) => {
    if (selectedTabIndex !== TABS.SEARCH_TAB) {
      return false;
    }

    if (resultsPanelSelected) {
      return false;
    }

    if (!additionalFiltersCollection) {
      return false;
    }

    return additionalFiltersCollection === collectionId;
  };

  return getCollectionFormConfig(recursiveCollections, { userToken }).map((collection) => (
    <div className="collection-group" key={`${collection.id}`}>
      <RecursiveCollectionItem
        item={collection}
        path={[]}
        level={0}
        selectedCollections={selectedCollections}
        maxCc={maxCc}
        onItemToggle={onItemToggle}
        onMaxCcChange={onMaxCcChange}
        userToken={userToken}
        additionalFilterToggle={
          <AdditionalFiltersToggle
            isSelected={additionalFiltersCollection === collection.id}
            onOpen={() => {
              if (additionalFiltersCollection === collection.id) {
                //close addition filter panel
                setAdditionalFiltersCollection(null);
              } else {
                //check if collection is selected and select it if it is not
                if (!selectedCollections[collection.id]) {
                  onItemToggle([collection.id]);
                }
                //open addition filter panel for selected collection
                setAdditionalFiltersCollection(collection.id);
              }
            }}
            selectedCollections={selectedCollections}
            setAdditionalFiltersPositionTop={setAdditionalFiltersPositionTop}
            isDisplayed={
              selectedTabIndex === TABS.SEARCH_TAB &&
              !resultsPanelSelected &&
              additionalFiltersCollection === collection.id
            }
            disabled={!collection.additionalFilters}
          />
        }
      />

      <SelectedFiltersList
        collectionId={collection.id}
        selectedFilters={selectedFilters?.[collection.id]}
        onChange={setSelectedFilters}
        allFilters={getAllFiltersForCollection(collection)}
      />

      {isAdditionalFiltersPanelOpen(collection.id) && (
        <AdditionalFilters
          onClose={() => setAdditionalFiltersCollection(null)}
          title={collection.label}
          collectionId={collection.id}
          onChange={setSelectedFilters}
          selectedFilters={selectedFilters?.[collection.id]}
          allFilters={getAllFiltersForCollection(collection)}
          onReset={() => resetSelectedFilters(collection.id)}
          positionTop={additionFiltersPositionTop}
          userToken={userToken}
        />
      )}
    </div>
  ));
}

const mapStoreToProps = (store) => ({
  selectedTabIndex: store.tabs.selectedTabIndex,
  resultsPanelSelected: store.searchResults.resultsPanelSelected,
  userToken: store.auth.user.access_token,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(RecursiveCollectionForm);
