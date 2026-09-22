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
  panelSlice,
} from '../../../store';
import { selectExternalLayers } from '../../../store/slices/externalLayersSlice';
import {
  ALL_COLLECTIONS_HINT_VALUE,
  DATASOURCES,
  FATHOM_TRACK_EVENT_LIST,
  URL_THEMES_LIST,
  PANEL,
} from '../../../const';

import { handleFathomTrackEvent } from '../../../utils/fathom';
import { isDefaultConfigurationReachable, isDefaultConfigurationSelected } from '../../../utils/themes.utils';
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
  showAllCollectionsHint,
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

    const baseOptions = [
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

    const allCollectionsHintOption = {
      label: t`Switch back to the default configuration to see all collections`,
      value: ALL_COLLECTIONS_HINT_VALUE,
      type: 'info',
      // react-select's default isOptionDisabled reads `isDisabled`: it strips the click handler,
      // excludes the option from keyboard navigation and marks the row aria-disabled.
      isDisabled: true,
    };

    // Curated configurations only expose a subset of the collections (issue #1221). Append a
    // non-selectable hint as the last entry so users understand where the rest went. It is
    // appended after the CCM filter above so that filter can never strip it.
    const options = showAllCollectionsHint ? [...baseOptions, allCollectionsHintOption] : baseOptions;

    const filterOption = (option, string) => {
      // Keep the hint visible while searching: a search that matches nothing in a curated
      // configuration is exactly when the user needs to be told to switch back.
      if (option.data.type === 'info') {
        return true;
      }

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
      // react-select never fires onChange for a disabled option, so this is defensive only —
      // but the native <select> stand-in used in CollectionSelection.test.jsx can reach it.
      if (type === 'info') {
        return;
      }
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
  selectedThemesListId,
  urlThemesList,
  dataSourcesInitialized,
  dataSourcesReadyVersion,
  dataSourcesLoading,
  datasetId,
  visualizationDate,
  bounds,
  showLayerPanel,
  showHighlightPanel,
  highlightsAvailable,
  showComparePanel,
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
    lastActiveServerId,
    lastActiveLayerName,
    lastActiveLayerTime,
    lastActiveLayerStyle,
  } = useSelector(selectExternalLayers);
  const showExternalLayersPanel = useSelector((store) => store.panel.wms);

  // When the WMS/WMTS panel is open with collections loaded but nothing active (e.g. after
  // switching to a Sentinel Hub layer and back, or after deleting the active server), restore the
  // last layer the user had — falling back to the first collection in the list — so the map isn't
  // blank. Layers are a lazily-fetched runtime cache (see useExternalServerLayers), so the chosen
  // server's layers may not be loaded yet: this effect first makes it the active server (which mounts
  // ExternalWmsLayerContainer and triggers the fetch), then completes the exact layer/time/style
  // restore once `externalServers` updates with the fetched layers.
  useEffect(() => {
    if (!showExternalLayersPanel) {
      return;
    }
    const remembered = externalServers?.find((s) => s.id === lastActiveServerId);
    const fallback = externalServers?.[0];
    // Prefer whatever server is already active (e.g. just clicked in ExtraCollectionsPanel) so its
    // layer gets picked once they load, even if it isn't the remembered/first one — otherwise this
    // effect would keep resolving `server` to the previously remembered server and never complete
    // the restore for the newly activated one.
    const active = externalServers?.find((s) => s.id === activeServerId);
    const server = active ?? remembered ?? fallback;
    if (!server) {
      return;
    }
    // Some other server is already active — either the user picked it manually, or a previous run
    // of this effect already started restoring it. Never override an unrelated active selection.
    if (activeServerId && activeServerId !== server.id) {
      return;
    }
    // `undefined` while the server's layers haven't loaded yet — there's nothing to select until then.
    // Once loaded, fall back to the first layer if the remembered one is gone (renamed/removed on
    // the remote service since it was last active) instead of leaving nothing selected. `remembered`
    // is only consulted when it's the same server being resolved here — it can be a different server
    // (e.g. the user switched to a server other than the last-remembered one), in which case its
    // layers say nothing about this server's remembered layer.
    const layersLoaded = !!server.layers?.length;
    const rememberedMatchesServer = remembered?.id === server.id;
    const layerName = layersLoaded
      ? ((rememberedMatchesServer
          ? server.layers.find((l) => l.name === lastActiveLayerName)?.name
          : undefined) ?? server.layers[0].name)
      : undefined;
    // Only restore the remembered time/style when the exact remembered layer was found — they were
    // saved for that layer, so applying them to a fallback layer would be wrong.
    const isRestoredLayer = rememberedMatchesServer && layerName === lastActiveLayerName;

    // Already the active server: only something left to do if its layers have since loaded and we
    // haven't picked the target layer yet. Re-checking on every `externalServers` change (rather than
    // returning as soon as any server is active) is what lets this effect complete the restore once
    // the lazy fetch resolves, without re-dispatching once activeLayerName already matches.
    if (activeServerId === server.id) {
      if (layerName && activeLayerName !== layerName) {
        store.dispatch(
          externalLayersSlice.actions.setActiveExternalLayer({ serverId: server.id, layerName }),
        );
        if (isRestoredLayer && lastActiveLayerTime) {
          store.dispatch(externalLayersSlice.actions.setActiveExternalLayerTime(lastActiveLayerTime));
        }
        if (isRestoredLayer && lastActiveLayerStyle) {
          store.dispatch(externalLayersSlice.actions.setActiveExternalLayerStyle(lastActiveLayerStyle));
        }
      }
      return;
    }

    if (!layerName) {
      // Layers not loaded yet — just activate the server so its layers get fetched; this effect
      // re-runs and completes the restore above once they land.
      store.dispatch(externalLayersSlice.actions.setActiveExternalServer(server.id));
      return;
    }

    store.dispatch(externalLayersSlice.actions.setActiveExternalLayer({ serverId: server.id, layerName }));
    // Restore the date the user had picked on this layer (setActiveExternalLayer reset it because
    // the layer was inactive), so navigating back to the panel keeps the chosen date.
    if (isRestoredLayer && lastActiveLayerTime) {
      store.dispatch(externalLayersSlice.actions.setActiveExternalLayerTime(lastActiveLayerTime));
    }
    // Same for the SLD style, which setActiveExternalLayer also reset — without this the layer
    // comes back rendered in the server's default style instead of the one the user picked.
    if (isRestoredLayer && lastActiveLayerStyle) {
      store.dispatch(externalLayersSlice.actions.setActiveExternalLayerStyle(lastActiveLayerStyle));
    }
  }, [
    showExternalLayersPanel,
    activeServerId,
    activeLayerName,
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
    // collapsiblePanelSlice's extraReducers force-expands the collection view on openPanel(WMS).
    store.dispatch(panelSlice.actions.openPanel(PANEL.WMS));
  };

  const onSelect = async (selectedCollection, orbitDirection = null) => {
    const selectedConfig = { ...selectedCollection };

    //prevent unselecting collection group
    if (!selectedConfig || !selectedConfig.datasource) {
      return;
    }

    if (!showLayerPanel) {
      store.dispatch(panelSlice.actions.openPanel(PANEL.LAYERS));
    }
    store.dispatch(externalLayersSlice.actions.clearActiveExternalLayer());
    setSelected(selectedCollection);
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
    // Layers/WMS always force-expand the data collections view (issue #1246, see
    // collapsiblePanelSlice's panelSlice.openPanel listener) - skip this data-driven collapse while
    // either is the active panel, otherwise a date that resolves for the first time right after
    // navigating there would immediately re-collapse what force-expand just opened.
    if (!previousVisualizationDate && visualizationDate && !showLayerPanel && !showExternalLayersPanel) {
      store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(false));
    }
    // eslint-disable-next-line
  }, [visualizationDate]);

  // Curated configurations expose only a subset of the collections (issue #1221). Offer the hint
  // only when the Default configuration is actually reachable from the Configuration dropdown —
  // both predicates are shared with the components that own those rules (AdvancedSearch switches
  // back to Default on result select; ThemeSelect decides which list the dropdown renders).
  const showAllCollectionsHint =
    !!selectedThemeId &&
    !isDefaultConfigurationSelected(selectedThemesListId, selectedThemeId) &&
    isDefaultConfigurationReachable(urlThemesList);

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
      showAllCollectionsHint,
    );
  };

  const extraCollectionsInfo = t`External WMS and WMTS layers from third-party map servers.`;

  const closeExternalLayers = () => {
    store.dispatch(panelSlice.actions.closePanel(PANEL.WMS));
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
            showHighlightPanel={showHighlightPanel}
            highlightsAvailable={highlightsAvailable}
            comparedLayersCount={comparedLayersCount}
            showComparePanel={showComparePanel}
            pinsCount={pinsCount}
            showPinPanel={showPinPanel}
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
            showHighlightPanel={showHighlightPanel}
            highlightsAvailable={highlightsAvailable}
            showComparePanel={showComparePanel}
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
  selectedThemesListId: store.themes.selectedThemesListId,
  urlThemesList: store.themes.themesLists[URL_THEMES_LIST],
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
