import React, { useState, useEffect } from 'react';
import { usePrevious } from '../../../hooks/usePrevious';
import jwt_dec from 'jwt-decode';

import { connect } from 'react-redux';
import Select from 'react-select';
import { t } from 'ttag';

import CollapsiblePanel from '../../../components/CollapsiblePanel/CollapsiblePanel';
import Sentinel1Collection from './Sentinel1Collection';
import { CollectionSearch, CollectionSearchTools } from './CollectionSearch';
import {
  createCollectionGroupsFromDataSourceHandlers,
  displayLatestDateOnSelect,
  getSelectedCollectionTitle,
} from './CollectionSelection.utils';
import store, { clmsSlice, collapsiblePanelSlice, visualizationSlice } from '../../../store';
import { DATASOURCES } from '../../../const';
import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';

import { customSelectStyle } from '../../../components/CustomSelectInput/CustomSelectStyle';

import Loader from '../../../Loader/Loader';
import CheckmarkSvg from './checkmark.svg?react';

import { CustomDropdownIndicator } from '../../../components/CustomSelectInput/CustomDropdownIndicator';
import { CustomOption } from '../../../components/CustomOption/CustomOption';

import './CollectionSelection.scss';
import CollectionTooltip from './CollectionTooltip/CollectionTooltip';

import { HLSConstellationSelection } from './HLSConstellationSelection';
import CLMSCollectionSelection from './CLMSCollectionSelection';
import { CCM_ROLES } from './AdvancedSearch/ccmProductTypeAccessRightsConfig';
import { ACCESS_ROLES } from '../../../api/OData/assets/accessRoles';

const renderCollectionSelectionForm = ({ selectedCollectionGroup, selectedCollection, onSelect }) => {
  const { datasource } = selectedCollectionGroup;
  switch (datasource) {
    case DATASOURCES.AWS_HLS:
      return HLSConstellationSelection({ selected: selectedCollection, onSelect: onSelect });
    case DATASOURCES.S1:
      return (
        <Sentinel1Collection
          datasource={selectedCollectionGroup.datasource}
          selectedCollection={selectedCollection}
          onSelect={onSelect}
        />
      );
    case DATASOURCES.CLMS:
      return <CLMSCollectionSelection datasource={selectedCollectionGroup.datasource} onSelect={onSelect} />;
    default:
      return renderCollectionsList({
        collections: selectedCollectionGroup.collections,
        selectedCollection,
        onSelect,
      });
  }
};

const renderCollectionsList = ({ collections, selectedCollection, onSelect }) => (
  <>
    {/* <div className="collection-label">{t`Collections:`}</div> */}
    <div className={`collection-buttons-wrapper`}>
      {collections.map((collection, index) => {
        const isCollectionSelected = selectedCollection && selectedCollection.dataset === collection.dataset;
        return (
          <div className="single-collection-wrapper" key={index}>
            <EOBButton
              text={
                <>
                  {collection.title}
                  {isCollectionSelected && <CheckmarkSvg />}
                </>
              }
              title={collection.title}
              className={`collection-button secondary ${isCollectionSelected ? 'selected' : ''}`}
              onClick={() =>
                onSelect({
                  datasource: collection.datasource,
                  dataset: collection.dataset,
                })
              }
            />
            <CollectionTooltip
              source={collection.getDescription()}
              credits={collection?.credits}
              className={collection.getDescription && collection.getDescription() ? '' : 'hidden-tooltip'}
            />
          </div>
        );
      })}
    </div>
  </>
);

const renderCollections = (collectionGroups, selectedCollection, onSelect, isExpanded, user) => {
  if (isExpanded) {
    const selectedCollectionGroup = collectionGroups.find(
      (d) => d.datasource === selectedCollection.datasource,
    );
    const collectionsPerGroup = Object.fromEntries(
      collectionGroups.map((g) => [
        g.title,
        g.collections.map((c) => ({ label: c.title, value: c.dataset })),
      ]),
    );

    const isUserCopernicusServicesUser =
      user.access_token !== null
        ? jwt_dec(user.access_token).realm_access?.roles.includes(CCM_ROLES.COPERNICUS_SERVICES_CCM) ||
          jwt_dec(user.access_token).realm_access?.roles.includes(ACCESS_ROLES.COPERNICUS_SERVICES)
        : false;
    const options = [
      ...collectionGroups
        .map((g) =>
          [{ label: g.title, value: g.datasource, type: 'datasource' }].concat(
            g.collections.map((c) => ({
              label: c.title,
              value: c.dataset,
              type: 'dataset',
              parentDataset: g.datasource,
            })),
          ),
        )
        .flat(),
    ].filter((opt) => {
      if (isUserCopernicusServicesUser) {
        return true;
      }
      if (opt.value === DATASOURCES.CCM || opt.parentDataset === DATASOURCES.CCM) {
        return false;
      }
      return true;
    });

    const filterOption = (option, string) => {
      if (string.length < 3 && option.data.type === 'dataset') {
        return false;
      }
      string = string.toLowerCase();
      if (option.label.toLowerCase().includes(string) || option.value.toLowerCase().includes(string)) {
        return true;
      }
      if (option.data.type === 'datasource') {
        for (let dataset of collectionsPerGroup[option.label]) {
          if (dataset.label.toLowerCase().includes(string) || dataset.value.toLowerCase().includes(string)) {
            return true;
          }
        }
      }
      return false;
    };

    function setValue({ label, value, type, parentDataset }) {
      if (type === 'datasource') {
        onSelect({
          datasource: value,
          dataset: collectionGroups.find((d) => d.datasource === value).preselectedDataset,
        });
        store.dispatch(clmsSlice.actions.reset());
        store.dispatch(clmsSlice.actions.setSelected(value === DATASOURCES.CLMS));
      }
      if (type === 'dataset') {
        onSelect({
          datasource: parentDataset,
          dataset: value,
        });
        store.dispatch(clmsSlice.actions.setSelectedCollection(value));
      }
    }

    const value = options.find((o) => o.value === selectedCollection.datasource);
    return (
      <div className="collection-buttons-container">
        <div className="sensors-satellites-selection">
          <Select
            value={value}
            getValue={() => selectedCollection.datasource}
            options={options}
            placeholder={'No collection selected'}
            onChange={setValue}
            styles={customSelectStyle}
            menuPosition="fixed"
            menuShouldBlockScroll={true}
            className="collection-select-dropdown"
            classNamePrefix="collection-select"
            filterOption={filterOption}
            components={{ DropdownIndicator: CustomDropdownIndicator, Option: CustomOption }}
          ></Select>

          {!!selectedCollectionGroup?.getDescription && (
            <CollectionTooltip
              source={selectedCollectionGroup.getDescription()}
              credits={selectedCollectionGroup?.credits}
            />
          )}
        </div>

        {selectedCollectionGroup &&
          renderCollectionSelectionForm({
            selectedCollectionGroup: selectedCollectionGroup,
            selectedCollection: selectedCollection,
            onSelect: onSelect,
          })}
      </div>
    );
  }
};

const CollectionSelection = ({
  selectedThemeId,
  dataSourcesInitialized,
  datasetId,
  visualizationDate,
  bounds,
  showLayerPanel,
  setShowLayerPanel,
  shouldShowLayerList,
  showHighlightPanel,
  setShowHighlightPanel,
  highlightsAvailable,
  showComparePanel,
  setComparePanel,
  setPinPanel,
  showPinPanel,
  newCompareLayersCount,
  newPinsCount,
  collectionPanelExpanded,
  pixelBounds,
  maxCloudCover,
  user,
}) => {
  const [advanced] = useState(false);
  const [selectedCollection, setSelected] = useState({});
  const [filter, setFilter] = useState();
  const [collectionGroups, setCollectionGroups] = useState([]);
  const previousVisualizationDate = usePrevious(visualizationDate);

  const onSelect = async (selectedCollection, orbitDirection = null) => {
    const selectedConfig = { ...selectedCollection };

    //prevent unselecting collection group
    if (!selectedConfig || !selectedConfig.datasource) {
      return;
    }

    setSelected(selectedCollection);
    if (!showLayerPanel && setShowLayerPanel) {
      setShowLayerPanel(true);
    }
    if (!selectedConfig.dataset) {
      const collectionGroupsFromDsh = createCollectionGroupsFromDataSourceHandlers(filter, bounds);
      const collectionGroup = collectionGroupsFromDsh.find(
        (collectionGroup) => collectionGroup.datasource === selectedCollection.datasource,
      );
      if (
        collectionGroup &&
        collectionGroup.preselectedDataset &&
        collectionGroup.collections.find((c) => c.dataset === collectionGroup.preselectedDataset)
      ) {
        selectedConfig.dataset = collectionGroup.preselectedDataset;
        setSelected(selectedConfig);
      }
    }
    const { dataset: selectedDatasetId } = selectedConfig;
    if (selectedDatasetId !== datasetId) {
      const dsh = getDataSourceHandler(selectedDatasetId);
      const sibling = dsh && dsh.getSibling(selectedDatasetId);
      let resetDates = sibling ? sibling.siblingId !== datasetId : true;

      store.dispatch(
        visualizationSlice.actions.setNewDatasetId({
          datasetId: selectedDatasetId,
          resetDates: resetDates,
          orbitDirection: orbitDirection,
        }),
      );

      if (dsh && dsh.supportsDisplayLatestDateOnSelect(selectedDatasetId)) {
        await displayLatestDateOnSelect({
          datasetId: selectedDatasetId,
          bounds: bounds,
          pixelBounds: pixelBounds,
          maxCloudCover: maxCloudCover,
          orbitDirection: orbitDirection,
        });
      }
    }
  };

  useEffect(() => {
    if (dataSourcesInitialized) {
      const collectionGroupsFromDsh = createCollectionGroupsFromDataSourceHandlers(filter);
      setCollectionGroups(collectionGroupsFromDsh);
      const preSelected = collectionGroupsFromDsh.find((collectionGroup) => {
        const { collections } = collectionGroup;
        return collections && collections.find((collection) => collection.dataset === datasetId);
      });
      if (!!preSelected) {
        setSelected({ datasource: preSelected.datasource, dataset: datasetId });
        store.dispatch(clmsSlice.actions.setSelected(preSelected.datasource === DATASOURCES.CLMS));
      }
    }
  }, [filter, selectedThemeId, dataSourcesInitialized, datasetId]);

  useEffect(() => {
    if (!previousVisualizationDate && visualizationDate) {
      store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(false));
    }
    // eslint-disable-next-line
  }, [visualizationDate]);

  const renderCollectionSelectionContent = (isExpanded) => {
    if (!dataSourcesInitialized) {
      return isExpanded && <Loader />;
    }

    return <>{renderCollections(collectionGroups, selectedCollection, onSelect, isExpanded, user)}</>;
  };

  const renderCollectionSelectionTitle = (collectionGroups, selectedCollection, onSelect) => {
    const selectedCollectionGroup = collectionGroups.find(
      (d) => d.datasource === selectedCollection.datasource,
    );

    let temporaryLabel;
    if (selectedCollectionGroup) {
      temporaryLabel = selectedCollectionGroup.collections.find(
        (collection) => collection.dataset === selectedCollection.dataset,
      );
    }

    const getSelectionDescription = () => {
      if (datasetId) {
        const dsh = getDataSourceHandler(datasetId);
        if (dsh?.getDescriptionForDataset) {
          const desc = dsh.getDescriptionForDataset(datasetId);
          if (desc) {
            return desc;
          }
        }
        if (dsh?.getDescription) {
          const desc = dsh.getDescription();
          if (desc) {
            return desc;
          }
        }
      }
      return t`No description available`;
    };

    return (
      <div className="collection-search">
        <div className="collection-search-header">
          <div className="sensors-satellites-selection">
            {temporaryLabel && temporaryLabel.title}
            {selectedCollectionGroup?.getDescription && (
              <CollectionTooltip
                source={getSelectionDescription()}
                credits={selectedCollectionGroup?.credits}
              />
            )}
          </div>
          <CollectionSearchTools
            showLayerPanel={showLayerPanel}
            setShowLayerPanel={setShowLayerPanel}
            showHighlightPanel={showHighlightPanel}
            setShowHighlightPanel={setShowHighlightPanel}
            highlightsAvailable={highlightsAvailable}
            newCompareLayersCount={newCompareLayersCount}
            showComparePanel={showComparePanel}
            setComparePanel={setComparePanel}
            newPinsCount={newPinsCount}
            showPinPanel={showPinPanel}
            setPinPanel={setPinPanel}
          />
        </div>
      </div>
    );
  };

  const selectedCollectionTitle = getSelectedCollectionTitle(selectedCollection);

  return (
    <CollapsiblePanel
      headerComponent={
        advanced ? (
          <div>{selectedCollectionTitle}</div>
        ) : (
          <CollectionSearch
            title={t`Data Collections:`}
            filter={filter}
            onChange={setFilter}
            showLayerPanel={showLayerPanel}
            setShowLayerPanel={setShowLayerPanel}
            showHighlightPanel={showHighlightPanel}
            setShowHighlightPanel={setShowHighlightPanel}
            highlightsAvailable={highlightsAvailable}
            showComparePanel={showComparePanel}
            setComparePanel={setComparePanel}
            setPinPanel={setPinPanel}
            showPinPanel={showPinPanel}
            newCompareLayersCount={newCompareLayersCount}
            newPinsCount={newPinsCount}
          />
        )
      }
      title={renderCollectionSelectionTitle(collectionGroups, selectedCollection, onSelect)}
      expanded={collectionPanelExpanded}
      toggleExpanded={(v) => store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(v))}
      className="collection-selection-container"
    >
      {renderCollectionSelectionContent}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedThemeId: store.themes.selectedThemeId,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  datasetId: store.visualization.datasetId,
  visualizationDate: store.visualization.toTime,
  bounds: store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  collectionPanelExpanded: store.collapsiblePanel.collectionPanelExpanded,
  maxCloudCover: store.visualization.cloudCoverage,
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(CollectionSelection);
