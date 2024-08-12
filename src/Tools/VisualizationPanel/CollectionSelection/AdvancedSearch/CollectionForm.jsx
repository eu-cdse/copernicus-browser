import React, { useEffect, useState } from 'react';
import cloneDeep from 'lodash.clonedeep';
import { EOBCCSlider } from '../../../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { t } from 'ttag';

import './CollectionForm.scss';
import { getODataCollectionInfoFromDatasetId } from '../../../../api/OData/ODataHelpers';

import SelectedFiltersList from './filters/SelectedFiltersList';
import { connect } from 'react-redux';
import { DEFAULT_CLOUD_COVER_PERCENT, TABS } from '../../../../const';
import { InstrumentTooltips } from '../../../../api/OData/assets/tooltips';
import AdditionalFiltersToggle from './filters/AdditionalFiltersToggle';
import { getAllFiltersForCollection } from './filters/AdditionalFilters.utils';
import AdditionalFilters from './filters/AdditionalFilters';
import CustomCheckbox from '../../../../components/CustomCheckbox/CustomCheckbox';
import { collections } from './collectionFormConfig';
import {
  CollectionFormInitialState,
  getCollectionFormInitialState,
  getCollectionFormConfig,
} from './collectionFormConfig.utils';
import { usePrevious } from '../../../../hooks/usePrevious';
import CollectionTooltip from '../CollectionTooltip/CollectionTooltip';

const CLOUD_COVER_PERCENT = 100;

export const createCollectionFormFromDatasetId = (datasetId, params) => {
  const oDataCollectionInfo = getODataCollectionInfoFromDatasetId(datasetId, params);

  if (!oDataCollectionInfo) {
    return null;
  }

  const collectionForm = cloneDeep(CollectionFormInitialState);

  collectionForm.selectedCollections[oDataCollectionInfo.id] = oDataCollectionInfo.instrument
    ? {
        [oDataCollectionInfo.instrument]: {
          ...(oDataCollectionInfo.productType ? { [oDataCollectionInfo.productType]: {} } : {}),
        },
      }
    : {};

  if (oDataCollectionInfo.maxCC) {
    collectionForm.maxCc = {
      [oDataCollectionInfo.id]: { [oDataCollectionInfo.instrument]: oDataCollectionInfo.maxCC },
    };
  }

  if (oDataCollectionInfo.selectedFilters) {
    collectionForm.selectedFilters = {
      [oDataCollectionInfo.id]: oDataCollectionInfo.selectedFilters,
    };
  }

  return collectionForm;
};

function CollectionForm({
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
    //close filters panel if opened collection is no longer among selected collections
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
      const formConfig = getCollectionFormConfig(collections, { userToken });

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

  const onCollectionChange = (collectionId) => {
    const collection = getCollectionFormConfig(collections, { userToken: userToken }).find((collection) => {
      return collection.id === collectionId;
    });
    const mustRemove = !!selectedCollections[collectionId];

    if (mustRemove) {
      const newSelectedOptionsObj = cloneDeep(selectedCollections);
      delete newSelectedOptionsObj[collectionId];
      setSelectedCollections(newSelectedOptionsObj);
    } else {
      setSelectedCollections({
        ...selectedCollections,
        [collectionId]: {},
      });

      let selectedInstruments = [];
      let selectedProductId;
      //select instrument if there is only one child
      if (collection && collection.instruments && collection.instruments.length === 1) {
        selectedInstruments.push(collection.instruments[0]);
        //select product if instrument has only one child
        if (collection.instruments[0].productTypes?.length === 1) {
          selectedProductId = collection.instruments[0].productTypes[0].id;
        }
      } else {
        selectedInstruments = collection.instruments.filter((i) => !!i.selected);
      }

      selectedInstruments.forEach((selectedInstrument) => {
        setSelectedCollections({
          ...selectedCollections,
          [collectionId]: {
            ...selectedCollections?.[collectionId],
            [selectedInstrument.id]: {
              ...(selectedProductId ? { [selectedProductId]: {} } : {}),
            },
          },
        });

        if (selectedInstrument.supportsCloudCover) {
          setMaxCc({
            ...maxCc,
            [collectionId]: {
              ...maxCc?.[collectionId],
              [selectedInstrument.id]: CLOUD_COVER_PERCENT,
            },
          });
        }
      });

      //set default filters
      if (collection?.additionalFilters) {
        collection?.additionalFilters
          .filter((af) => af.defaultValue)
          .forEach((af) => setSelectedFilters(collectionId, af.id, af.defaultValue));
      }
    }

    if (collection.supportsCloudCover) {
      if (mustRemove) {
        deleteMaxCc(collectionId);
      } else {
        setMaxCc({ ...maxCc, [collection.id]: CLOUD_COVER_PERCENT });
      }
    }
  };

  const onInstrumentChange = (value, collectionId) => {
    const instrumentConfig = getCollectionFormConfig(collections, { userToken: userToken })
      .find((collection) => collection.id === collectionId)
      .instruments.find((child) => child.id === value);

    const instrumentSupportsCloudCover = !!instrumentConfig?.supportsCloudCover;

    const mustRemove = !!selectedCollections[collectionId][value];

    if (mustRemove) {
      const newObj = cloneDeep(selectedCollections);
      delete newObj[collectionId][value];
      setSelectedCollections(newObj);
    } else {
      let selectedProductId;
      //select product if instrument has only one child
      if (instrumentConfig?.productTypes?.length === 1) {
        selectedProductId = instrumentConfig.productTypes[0].id;
      }

      setSelectedCollections({
        ...selectedCollections,
        [collectionId]: {
          ...selectedCollections?.[collectionId],
          [value]: {
            ...(selectedProductId ? { [selectedProductId]: {} } : {}),
          },
        },
      });
    }

    if (instrumentSupportsCloudCover) {
      if (mustRemove) {
        deleteMaxCc(collectionId, value);
      } else {
        setMaxCc({
          ...maxCc,
          [collectionId]: {
            ...maxCc?.[collectionId],
            [value]: CLOUD_COVER_PERCENT,
          },
        });
      }
    }
  };

  const onProductTypeChange = (value, collectionId, instrumentId) => {
    if (selectedCollections[collectionId][instrumentId][value]) {
      const newObj = cloneDeep(selectedCollections);
      delete newObj[collectionId][instrumentId][value];
      setSelectedCollections(newObj);
    } else {
      setSelectedCollections({
        ...selectedCollections,
        [collectionId]: {
          ...selectedCollections?.[collectionId],
          [instrumentId]: {
            ...selectedCollections?.[collectionId]?.[instrumentId],
            [value]: {},
          },
        },
      });
    }
  };

  const deleteMaxCc = (collectionId, instrumentId) => {
    const newMaxCc = cloneDeep(maxCc);
    if (instrumentId !== undefined) {
      if (Object.keys(maxCc[collectionId]).length > 1) {
        delete newMaxCc[collectionId][instrumentId];
      } else {
        delete newMaxCc[collectionId];
      }
    } else {
      delete newMaxCc[collectionId];
    }

    setMaxCc(newMaxCc);
  };

  const onMaxCcChange = (value, collectionId, instrumentId) => {
    setMaxCc({
      ...maxCc,
      ...(instrumentId
        ? {
            [collectionId]: {
              ...maxCc?.[collectionId],
              [instrumentId]: value,
            },
          }
        : { [collectionId]: value }),
    });
  };

  const isAdditionalFiltersPanelOpen = (collectionId) => {
    //not on search tab
    if (selectedTabIndex !== TABS.SEARCH_TAB) {
      return false;
    }

    //displaying results
    if (resultsPanelSelected) {
      return false;
    }

    if (!additionalFiltersCollection) {
      return false;
    }

    return additionalFiltersCollection === collectionId;
  };

  return getCollectionFormConfig(collections, { userToken: userToken }).map((collection) => (
    <div className="collection-group" key={`${collection.id}`}>
      <div className="collection">
        <CustomCheckbox
          checked={Object.keys(selectedCollections).includes(collection.id)}
          onChange={() => {
            onCollectionChange(collection.id);
            setAdditionalFiltersCollection(null);
          }}
          label={collection.label}
        />
        <AdditionalFiltersToggle
          isSelected={additionalFiltersCollection === collection.id}
          onOpen={() => {
            if (additionalFiltersCollection === collection.id) {
              //close addition filter panel
              setAdditionalFiltersCollection(null);
            } else {
              //check if collection is selected and select it if it is not
              if (!Object.keys(selectedCollections).includes(collection.id)) {
                onCollectionChange(collection.id);
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
      </div>
      {selectedCollections[collection.id] !== undefined && collection?.instruments?.length > 0 && (
        <div className="instruments">
          {collection.instruments.map((instrument) => {
            const isInstrumentChecked = selectedCollections[collection.id][instrument.id];
            return (
              <div key={`${collection.id}-${instrument.id}`} className="instrument">
                <div className="instrument-wrapper">
                  <CustomCheckbox
                    checked={isInstrumentChecked}
                    onChange={() => onInstrumentChange(instrument.id, collection.id)}
                    label={instrument.label}
                  />
                  {InstrumentTooltips[collection.id]?.[instrument.id] && (
                    <CollectionTooltip source={InstrumentTooltips[collection.id][instrument.id]()} />
                  )}
                </div>
                <div className="product-type">
                  {isInstrumentChecked &&
                    instrument.productTypes.map((productType) => (
                      <div
                        className="product-type-checkbox-tooltip-wrapper"
                        key={`${collection.id}-${instrument.id}-${productType.id}`}
                      >
                        <CustomCheckbox
                          className={`custom-checkbox-product-container`}
                          checked={selectedCollections[collection.id][instrument.id][productType.id]}
                          onChange={() => onProductTypeChange(productType.id, collection.id, instrument.id)}
                          label={productType.label}
                        />
                        {productType.supportsGeometry === false && (
                          <CollectionTooltip
                            source={t`Data product without location information - the product will be searched without geometry.`}
                          />
                        )}
                      </div>
                    ))}
                  {isInstrumentChecked && instrument.supportsCloudCover && (
                    <div className="cloud-filter ">
                      <EOBCCSlider
                        sliderWidth={120}
                        cloudCoverPercentage={
                          maxCc[collection.id] && maxCc[collection.id][instrument.id]
                            ? maxCc[collection.id][instrument.id]
                            : DEFAULT_CLOUD_COVER_PERCENT
                        }
                        onChange={(val) => onMaxCcChange(val, collection.id, instrument.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {selectedCollections[collection.id] !== undefined && collection.supportsCloudCover && (
        <div className="cloud-filter ">
          <EOBCCSlider
            sliderWidth={120}
            cloudCoverPercentage={maxCc[collection.id]}
            onChange={(val) => onMaxCcChange(val, collection.id)}
          />
        </div>
      )}
      <SelectedFiltersList
        collectionId={collection.id}
        selectedFilters={selectedFilters?.[collection.id]}
        onChange={setSelectedFilters}
        allFilters={getAllFiltersForCollection(collection)}
      ></SelectedFiltersList>
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

export default connect(mapStoreToProps, null)(CollectionForm);
