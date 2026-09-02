import React, { useState, useEffect } from 'react';
import { usePrevious } from '../../../hooks/usePrevious';

import { connect } from 'react-redux';
import { t } from 'ttag';

import CollapsiblePanel from '../../../components/CollapsiblePanel/CollapsiblePanel';
import Sentinel1Collection from './Sentinel1Collection';
import { CollectionSearch, CollectionSearchTools } from './CollectionSearch';
import {
  createCollectionGroupsFromDataSourceHandlers,
  displayLatestDateOnSelect,
} from './CollectionSelection.utils';
import { useSelector } from 'react-redux';

import store, {
  clmsSlice,
  collapsiblePanelSlice,
  visualizationSlice,
  externalLayersSlice,
} from '../../../store';
import { selectExternalLayers } from '../../../store/slices/externalLayersSlice';
import { DATASOURCES, FATHOM_TRACK_EVENT_LIST } from '../../../const';
import { handleFathomTrackEvent } from '../../../utils/fathom';
import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';

import { SearchableSelect } from '../../../components/SearchableSelect/SearchableSelect';

import Loader from '../../../Loader/Loader';
import CheckmarkSvg from './checkmark.svg?react';

import './CollectionSelection.scss';
import CollectionTooltip from './CollectionTooltip/CollectionTooltip';

import CLMSCollectionSelection from './CLMSCollectionSelection';
import ExtraCollectionsPanel from '../../../ExternalLayers/ExtraCollectionsPanel';
import {
  doesUserHaveAccessToCCMVisualization,
  doesUserHaveAccessToCopDem30Visualization,
} from './AdvancedSearch/ccmProductTypeAccessRightsConfig';
import {
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
} from '../../SearchPanel/dataSourceHandlers/dataSourceConstants';
import {
  CLMS_OPTIONS,
  filterCLMSOptionsByDatasets,
  flattenCLMSCategoryOptions,
} from './CLMSCollectionSelection.utils';

const renderCollectionSelectionForm = ({ selectedCollectionGroup, selectedCollection, onSelect }) => {
  const { datasource } = selectedCollectionGroup;
  switch (datasource) {
    case DATASOURCES.S1:
      return (
        <Sentinel1Collection
          datasource={selectedCollectionGroup.datasource}
          selectedCollection={selectedCollection}
          onSelect={onSelect}
          availableDatasets={selectedCollectionGroup.collections?.map((collection) => collection.dataset)}
        />
      );
    case DATASOURCES.CLMS:
      return (
        <CLMSCollectionSelection
          datasource={selectedCollectionGroup.datasource}
          onSelect={onSelect}
          availableDatasets={selectedCollectionGroup.collections?.map((collection) => collection.dataset)}
        />
      );
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
                  <span className="collection-button-title">{collection.title}</span>
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

const renderCollections = (
  collectionGroups,
  selectedCollection,
  onSelect,
  isExpanded,
  user,
  dataSourcesLoading,
) => {
  if (isExpanded) {
    const hasAccessToCCMVisualization = doesUserHaveAccessToCCMVisualization(user?.access_token);
    const hasAccessToCopDem30Visualization = doesUserHaveAccessToCopDem30Visualization(user?.access_token);

    // COP DEM 30m is restricted to CCM users (issue #1185); hide only that dataset while
    // leaving the DEM group and the 90m dataset visible to everyone. Filtering collectionGroups
    // itself (rather than just the dropdown options) keeps the expanded group's collection
    // buttons (renderCollectionsList) in sync with the dropdown.
    const visibleCollectionGroups = hasAccessToCopDem30Visualization
      ? collectionGroups
      : collectionGroups.map((g) =>
          g.datasource === DATASOURCES.DEM_CDAS
            ? { ...g, collections: g.collections.filter((c) => c.dataset !== DEM_COPERNICUS_30_CDAS) }
            : g,
        );

    const selectedCollectionGroup = visibleCollectionGroups.find(
      (d) => d.datasource === selectedCollection.datasource,
    );
    const collectionsPerGroup = Object.fromEntries(
      visibleCollectionGroups.map((g) => [
        g.title,
        g.collections.map((c) => ({ label: c.title, value: c.dataset })),
      ]),
    );

    const clmsGroup = visibleCollectionGroups.find((g) => g.datasource === DATASOURCES.CLMS);
    const clmsCategoryOptions = clmsGroup
      ? flattenCLMSCategoryOptions(
          filterCLMSOptionsByDatasets(
            CLMS_OPTIONS,
            clmsGroup.collections.map((c) => c.dataset),
          ),
        ).map((node) => ({ label: node.label, value: node.id, type: 'category' }))
      : [];

    const options = [
      ...visibleCollectionGroups
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
      ...clmsCategoryOptions,
    ].filter((opt) => {
      if (hasAccessToCCMVisualization) {
        return true;
      }
      if (opt.value === DATASOURCES.CCM || opt.parentDataset === DATASOURCES.CCM) {
        return false;
      }
      return true;
    });

    const filterOption = (option, string) => {
      if (string.length < 3 && (option.data.type === 'dataset' || option.data.type === 'category')) {
        return false;
      }

      const terms = string.toLowerCase().split(/\s+/).filter(Boolean);

      if (!terms.length) {
        return true;
      }

      const matchesAll = (termsToMatch, text) => termsToMatch.every((term) => text.includes(term));

      const label = option.label.toLowerCase();
      const value = option.value.toLowerCase();

      if (matchesAll(terms, label) || matchesAll(terms, value)) {
        return true;
      }

      if (option.data.type === 'datasource') {
        return (collectionsPerGroup[option.label] || []).some((dataset) => {
          const dLabel = dataset.label.toLowerCase();
          const dValue = dataset.value.toLowerCase();
          return matchesAll(terms, dLabel) || matchesAll(terms, dValue);
        });
      }

      return false;
    };

    const setValue = ({ value, type, parentDataset }) => {
      if (type === 'datasource') {
        const group = collectionGroups.find((d) => d.datasource === value);
        let preselected = group?.preselectedDataset;
        // Non-CCM users can't see COP DEM 30m (issue #1185), which is the DEM group's default
        // preselection — fall back to 90m so selecting the group doesn't strand them on a hidden dataset.
        if (
          value === DATASOURCES.DEM_CDAS &&
          preselected === DEM_COPERNICUS_30_CDAS &&
          !hasAccessToCopDem30Visualization
        ) {
          preselected = DEM_COPERNICUS_90_CDAS;
        }
        onSelect({
          datasource: value,
          dataset: preselected,
        });
        if (value !== DATASOURCES.EXTERNAL_WMS) {
          store.dispatch(clmsSlice.actions.reset());
          store.dispatch(clmsSlice.actions.setSelected(value === DATASOURCES.CLMS));
        }
      }
      if (type === 'dataset') {
        onSelect({
          datasource: parentDataset,
          dataset: value,
        });
        if (parentDataset !== DATASOURCES.EXTERNAL_WMS) {
          store.dispatch(clmsSlice.actions.setSelectedCollection(value));
        }
      }
      if (type === 'category') {
        onSelect({ datasource: DATASOURCES.CLMS });
        store.dispatch(clmsSlice.actions.reset());
        store.dispatch(clmsSlice.actions.setSelected(true));
        store.dispatch(clmsSlice.actions.setSelectedPath(value));
        store.dispatch(clmsSlice.actions.setSelectedCollection(null));
      }
    };

    const value = options.find((o) => o.value === selectedCollection.datasource);
    return (
      <div className="collection-buttons-container">
        <div className="sensors-satellites-selection">
          <SearchableSelect
            value={value}
            options={options}
            placeholder={'No collection selected'}
            onChange={setValue}
            menuPosition="fixed"
            menuShouldBlockScroll={true}
            className="collection-select-dropdown"
            classNamePrefix="collection-select"
            filterOption={filterOption}
            isLoading={dataSourcesLoading}
          />

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
  dataSourcesReadyVersion,
  dataSourcesLoading,
  datasetId,
  visualizationDate,
  bounds,
  showLayerPanel,
  setShowLayerPanel,
  showHighlightPanel,
  setShowHighlightPanel,
  highlightsAvailable,
  showComparePanel,
  setComparePanel,
  setPinPanel,
  showPinPanel,
  comparedLayersCount,
  pinsCount,
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

  const {
    activeServerId,
    activeLayerName,
    servers: externalServers,
    panelOpen: showExternalLayersPanel,
    lastActiveServerId,
    lastActiveLayerName,
    lastActiveLayerTime,
    lastActiveLayerStyle,
  } = useSelector(selectExternalLayers);

  // When the WMS/WMTS panel is open with collections loaded but nothing active (e.g. after
  // switching to a Sentinel Hub layer and back, or after deleting the active server), restore the
  // last layer the user had — falling back to the first layer of the first collection — so the map
  // isn't blank.
  useEffect(() => {
    if (!showExternalLayersPanel || activeServerId) {
      return;
    }
    const remembered = externalServers?.find(
      (s) => s.id === lastActiveServerId && s.layers?.some((l) => l.name === lastActiveLayerName),
    );
    const fallback = externalServers?.find((s) => s.layers?.length);
    const server = remembered ?? fallback;
    const layerName = remembered ? lastActiveLayerName : fallback?.layers?.[0]?.name;
    if (server && layerName) {
      store.dispatch(externalLayersSlice.actions.setActiveExternalLayer({ serverId: server.id, layerName }));
      // Restore the date the user had picked on this layer (setActiveExternalLayer reset it because
      // the layer was inactive), so navigating back to the panel keeps the chosen date.
      if (remembered && lastActiveLayerTime) {
        store.dispatch(externalLayersSlice.actions.setActiveExternalLayerTime(lastActiveLayerTime));
      }
      // Same for the SLD style, which setActiveExternalLayer also reset — without this the layer
      // comes back rendered in the server's default style instead of the one the user picked.
      if (remembered && lastActiveLayerStyle) {
        store.dispatch(externalLayersSlice.actions.setActiveExternalLayerStyle(lastActiveLayerStyle));
      }
    }
  }, [
    showExternalLayersPanel,
    activeServerId,
    externalServers,
    lastActiveServerId,
    lastActiveLayerName,
    lastActiveLayerTime,
    lastActiveLayerStyle,
  ]);

  const handleOpenExternalLayers = () => {
    // Only open (never toggle off) so a second click / double-click doesn't deselect it — matching
    // the other panel buttons. It still closes when another panel is selected (onCloseExternalLayers).
    if (showExternalLayersPanel) {
      return;
    }
    handleFathomTrackEvent(FATHOM_TRACK_EVENT_LIST.EXTERNAL_LAYERS_PANEL_BUTTON);
    store.dispatch(externalLayersSlice.actions.setWmsPanelOpen(true));
    if (!collectionPanelExpanded) {
      store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(true));
    }
    setShowLayerPanel(false);
    setComparePanel(false);
    setPinPanel(false);
    setShowHighlightPanel(false);
  };

  const onSelect = async (selectedCollection, orbitDirection = null) => {
    const selectedConfig = { ...selectedCollection };

    //prevent unselecting collection group
    if (!selectedConfig || !selectedConfig.datasource) {
      return;
    }

    store.dispatch(externalLayersSlice.actions.setWmsPanelOpen(false));
    store.dispatch(externalLayersSlice.actions.clearActiveExternalLayer());
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
    if (dataSourcesInitialized || dataSourcesReadyVersion > 0) {
      const collectionGroupsFromDsh = createCollectionGroupsFromDataSourceHandlers(filter);
      setCollectionGroups(collectionGroupsFromDsh);
      // A shared link or saved pin can carry COP DEM 30m, which is restricted to CCM users
      // (issue #1185). If a non-CCM user restores it, redirect to 90m instead of loading the
      // hidden dataset. This only fires while datasetId === 30m, so it never un-does itself if
      // the user later gains a CCM role — that's fine in practice because AuthProvider blocks
      // rendering of this component until Keycloak/anon auth has resolved, and gaining a role
      // (logging in) goes through a full-page redirect that remounts the app, not an in-place
      // token swap.
      if (
        datasetId === DEM_COPERNICUS_30_CDAS &&
        !doesUserHaveAccessToCopDem30Visualization(user?.access_token)
      ) {
        const demGroup = collectionGroupsFromDsh.find((g) => g.datasource === DATASOURCES.DEM_CDAS);
        if (demGroup) {
          setSelected({ datasource: DATASOURCES.DEM_CDAS, dataset: DEM_COPERNICUS_90_CDAS });
          // DEM is timeless, and resetting dates here would null `toTime` with nothing left to
          // repopulate it (the isTimeless effect that normally does so only re-fires when
          // isTimeless itself changes, which it doesn't for a 30m->90m switch) — leaving the
          // layer panel gated off with no visible layer. Mirror onSelect's sibling-based check
          // so switching between DEM siblings preserves the existing date, as it does there.
          const dsh = getDataSourceHandler(DEM_COPERNICUS_90_CDAS);
          const sibling = dsh && dsh.getSibling(DEM_COPERNICUS_90_CDAS);
          const resetDates = sibling ? sibling.siblingId !== datasetId : true;
          store.dispatch(
            visualizationSlice.actions.setNewDatasetId({
              datasetId: DEM_COPERNICUS_90_CDAS,
              resetDates: resetDates,
              orbitDirection: null,
            }),
          );
          return;
        }
      }
      const preSelected = collectionGroupsFromDsh.find((collectionGroup) => {
        const { collections } = collectionGroup;
        return collections && collections.find((collection) => collection.dataset === datasetId);
      });
      if (!!preSelected) {
        setSelected({ datasource: preSelected.datasource, dataset: datasetId });
        store.dispatch(clmsSlice.actions.setSelected(preSelected.datasource === DATASOURCES.CLMS));
      }
    }
  }, [
    filter,
    selectedThemeId,
    dataSourcesInitialized,
    dataSourcesReadyVersion,
    datasetId,
    user?.access_token,
  ]);

  useEffect(() => {
    if (!previousVisualizationDate && visualizationDate) {
      store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(false));
    }
    // eslint-disable-next-line
  }, [visualizationDate]);

  const renderCollectionSelectionContent = (isExpanded) => {
    if (!isExpanded) {
      return null;
    }
    if (!dataSourcesInitialized) {
      return <Loader />;
    }
    if (showExternalLayersPanel) {
      return <ExtraCollectionsPanel />;
    }
    return renderCollections(
      collectionGroups,
      selectedCollection,
      onSelect,
      isExpanded,
      user,
      dataSourcesLoading,
    );
  };

  const extraCollectionsInfo = t`External WMS and WMTS layers from third-party map servers.`;

  const closeExternalLayers = () => {
    store.dispatch(externalLayersSlice.actions.setWmsPanelOpen(false));
    store.dispatch(externalLayersSlice.actions.clearActiveExternalLayer());
  };

  const isExtraCollectionsMode = showExternalLayersPanel || !!activeServerId;

  const renderCollectionSelectionTitle = (allGroups, selectedCollection) => {
    const titleLabel = isExtraCollectionsMode
      ? (() => {
          if (!showExternalLayersPanel && activeLayerName) {
            const activeServer = externalServers.find((s) => s.id === activeServerId);
            const activeLayer = activeServer?.layers?.find((l) => l.name === activeLayerName);
            const title = activeLayer?.title || activeLayerName;
            return (
              <div className="sensors-satellites-selection">
                <span className="collection-title-label external-source-title" title={title}>
                  {title}
                </span>
              </div>
            );
          }
          if (activeServerId) {
            const activeServer = externalServers.find((s) => s.id === activeServerId);
            const serverName = activeServer?.name || activeServerId;
            return (
              <div className="sensors-satellites-selection">
                <span className="collection-title-label external-source-title" title={serverName}>
                  {serverName}
                </span>
              </div>
            );
          }
          return (
            <div className="sensors-satellites-selection">
              <span className="collection-title-label">{t`WMS/WMTS:`}</span>
              <CollectionTooltip source={extraCollectionsInfo} credits={null} />
            </div>
          );
        })()
      : (() => {
          const selectedCollectionGroup = allGroups.find(
            (d) => d.datasource === selectedCollection.datasource,
          );
          const temporaryLabel = selectedCollectionGroup?.collections.find(
            (collection) => collection.dataset === selectedCollection.dataset,
          );
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
            <div className="sensors-satellites-selection">
              {temporaryLabel && <span className="collection-title-label">{temporaryLabel.title}</span>}
              {selectedCollectionGroup?.getDescription && (
                <CollectionTooltip
                  source={getSelectionDescription()}
                  credits={selectedCollectionGroup?.credits}
                />
              )}
            </div>
          );
        })();

    return (
      <div className="collection-search">
        <div className="collection-search-header">
          {titleLabel}
          <CollectionSearchTools
            showLayerPanel={showLayerPanel}
            setShowLayerPanel={setShowLayerPanel}
            showHighlightPanel={showHighlightPanel}
            setShowHighlightPanel={setShowHighlightPanel}
            highlightsAvailable={highlightsAvailable}
            comparedLayersCount={comparedLayersCount}
            showComparePanel={showComparePanel}
            setComparePanel={setComparePanel}
            pinsCount={pinsCount}
            showPinPanel={showPinPanel}
            setPinPanel={setPinPanel}
            onOpenExternalLayers={handleOpenExternalLayers}
            showExternalLayersPanel={showExternalLayersPanel}
            onCloseExternalLayers={closeExternalLayers}
          />
        </div>
      </div>
    );
  };

  const collapsedTitle = (() => {
    if (isExtraCollectionsMode) {
      if (activeServerId) {
        const activeServer = externalServers.find((s) => s.id === activeServerId);
        const serverName = activeServer?.name || activeServerId;
        return (
          <span className="collection-title-label external-source-title" title={serverName}>
            {serverName}
          </span>
        );
      }
      return <span className="collection-title-label">{t`WMS/WMTS:`}</span>;
    }
    const group = collectionGroups.find((d) => d.datasource === selectedCollection.datasource);
    const col = group?.collections.find((c) => c.dataset === selectedCollection.dataset);
    if (col?.title) {
      return <span className="collection-title-label">{col.title}</span>;
    }
    return t`Data Collections:`;
  })();

  return (
    <CollapsiblePanel
      headerComponent={
        advanced ? (
          <div>{collapsedTitle}</div>
        ) : (
          <CollectionSearch
            title={isExtraCollectionsMode ? collapsedTitle : t`Data Collections:`}
            infoTooltip={isExtraCollectionsMode && !activeServerId ? extraCollectionsInfo : null}
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
            comparedLayersCount={comparedLayersCount}
            pinsCount={pinsCount}
            onOpenExternalLayers={handleOpenExternalLayers}
            showExternalLayersPanel={showExternalLayersPanel}
            onCloseExternalLayers={closeExternalLayers}
          />
        )
      }
      title={renderCollectionSelectionTitle(collectionGroups, selectedCollection)}
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
  dataSourcesReadyVersion: store.themes.dataSourcesReadyVersion,
  dataSourcesLoading: store.themes.dataSourcesLoading,
  datasetId: store.visualization.datasetId,
  visualizationDate: store.visualization.toTime,
  bounds: store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  collectionPanelExpanded: store.collapsiblePanel.collectionPanelExpanded,
  maxCloudCover: store.visualization.cloudCoverage,
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(CollectionSelection);
