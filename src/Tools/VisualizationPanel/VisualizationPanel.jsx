import React, { useEffect, useRef, useState } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { connect } from 'react-redux';
import { t } from 'ttag';

import DateSelection from './DateSelection';
import WmsDateSelection from './WmsDateSelection';
import VisualizationLayerContainer from './VisualizationLayer/VisualizationLayerContainer';
import CollectionSelection from './CollectionSelection/CollectionSelection';
import Highlights from '../SearchPanel/Highlights/Highlights';
import EOBEffectsPanel from '../../junk/EOBEffectsPanel/EOBEffectsPanel';
import MessagePanel from './MessagePanel/MessagePanel';
import useMessagePanelContent from './MessagePanel/useMessagePanelContent';
import ActionBar from '../../components/ActionBar/ActionBar';
import SocialShare from '../../components/SocialShare/SocialShare';
import PinPanel from '../Pins/PinPanel';
import ComparePanel from '../ComparePanel/ComparePanel';
import ThemeSelect from './ThemeSelect/ThemeSelect';
import Loader from '../../Loader/Loader';

import { haveEffectsChangedFromDefault } from './VisualizationPanel.utils';
import store, { visualizationSlice, collapsiblePanelSlice } from '../../store';
import { selectActiveExternalLayer } from '../../store/slices/externalLayersSlice';
import {
  EXPIRED_ACCOUNT,
  MIN_SCREEN_HEIGHT_FOR_DATE_AND_COLLECTION_PANEL,
  PROCESSING_OPTIONS,
} from '../../const';

import './VisualizationPanel.scss';
import { getVisualizationEffectsFromStore } from '../../utils/effectsUtils';
import { getAppropriateAuthToken } from '../../App';
import { resetMessagePanel } from '../../utils';
import { isOpenEoSupported } from '../../api/openEO/openEOHelpers';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';
import ExternalWmsLayerContainer from '../../ExternalLayers/ExternalWmsLayerContainer';

const showEffectsText = () => t`Show effects and advanced options`;
const appliedEffectsText = () => t`Effects and advanced options applied`;
const showVisualizationsText = () => t`Show visualisations`;

const getActions = ({
  displayEffects,
  toggleEffects,
  displaySocialShareOptions,
  toggleSocialShareOptions,
  effects,
  displayLayer,
  toggleLayer,
  datasetId,
}) => {
  const haveEffectsChanged = haveEffectsChangedFromDefault(effects, datasetId);
  return [
    {
      id: 'showEffects',
      label: () =>
        displayEffects
          ? showVisualizationsText()
          : haveEffectsChanged
            ? appliedEffectsText()
            : showEffectsText(),
      onClick: (e) => {
        e.stopPropagation();
        toggleEffects(!displayEffects);
      },
      icon: () => `${displayEffects ? 'fa fa-paint-brush' : 'fa fa-sliders'}`,
      visible: () => true,
      disabled: () => false,
      className: () => `${haveEffectsChanged && !displayEffects ? 'active' : ''}`,
    },
    {
      id: 'hideLayer',
      label: () => (displayLayer ? t`Hide layer` : t`Show layer`),
      onClick: (e) => {
        e.stopPropagation();
        toggleLayer(!displayLayer);
      },
      icon: () => (displayLayer ? 'fa fa-eye-slash' : 'fa fa-eye'),
      visible: () => true,
      disabled: () => false,
      className: () => '',
    },
    {
      id: 'socialShare',
      label: () => t`Share`,
      onClick: (e) => {
        e.stopPropagation();
        toggleSocialShareOptions(!displaySocialShareOptions);
      },
      icon: () => 'fas fa-share-alt',
      visible: () => true,
      disabled: () => false,
      className: () => `ignore-react-onclickoutside ${displaySocialShareOptions ? 'active' : ''}`,
    },
  ];
};
function VisualizationPanel({
  toTime,
  datasetId,
  visualizationUrl,
  layerId,
  selectedThemeId,
  selectedThemesListId,
  themesLists,
  terrainViewerId,
  is3D,
  savePin,
  effects,
  showLayerPanel,
  setShowLayerPanel,
  showHighlightPanel,
  setShowHighlightPanel,
  showPinPanel,
  setShowPinPanel,
  showComparePanel,
  setShowComparePanel,
  setLastAddedPin,
  saveLocalPinsOnLogin,
  comparedLayersCount,
  pinsCount,
  visibleOnMap,
  authToken,
  dataSourcesInitialized,
  dataSourcesLoading,
  compareShare,
  selectedTabIndex,
  customSelected,
  selectedProcessing,
  activeExternalServerId,
  wmsLayersPanelOpen,
  activeExternalLayer,
}) {
  const selectedTheme = selectedThemesListId
    ? themesLists[selectedThemesListId].find((t) => t.id === selectedThemeId)
    : null;
  const highlightsAvailable = selectedTheme?.pins?.length > 0;
  const [shouldShowTPDI, setShouldShowTPDI] = useState(false);
  const [displaySocialShareOptions, toggleSocialShareOptions] = useState(false);
  const [displayEffects, toggleEffects] = useState(false);
  const [layerActionsOpen, setLayerActionsOpen] = useState(false);

  const { height: windowHeight } = useWindowSize();

  const {
    show: showMessagePanel,
    onClose: onMessagePanelClose,
    content: messagePanelContent,
  } = useMessagePanelContent();

  const visualizationActionsRef = useRef();
  const selectedTimeRef = useRef(toTime);

  const supportsOpenEo = isOpenEoSupported(
    visualizationUrl,
    layerId,
    IMAGE_FORMATS.PNG,
    customSelected && selectedProcessing === PROCESSING_OPTIONS.PROCESS_API,
  );

  useEffect(() => {
    const newSelectedProcessing = supportsOpenEo ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API;
    if (newSelectedProcessing !== selectedProcessing) {
      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          selectedProcessing: newSelectedProcessing,
        }),
      );
    }
  }, [supportsOpenEo, selectedProcessing]);

  useEffect(() => {
    if ((displaySocialShareOptions || displayEffects) && visualizationActionsRef.current) {
      visualizationActionsRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [displaySocialShareOptions, displayEffects]);

  useEffect(() => {
    if (is3D && shouldShowTPDI) {
      setShouldShowTPDI(false);
    }
  }, [is3D, shouldShowTPDI]);

  const handleTPDIClick = () => {
    setShouldShowTPDI(!shouldShowTPDI);
  };

  const shouldShowLayerList = !!(
    toTime &&
    datasetId &&
    visualizationUrl &&
    !showHighlightPanel &&
    !showComparePanel &&
    !showPinPanel &&
    !wmsLayersPanelOpen &&
    authToken
  );

  const shouldShowExternalLayerList = !!(
    activeExternalServerId &&
    wmsLayersPanelOpen &&
    !showHighlightPanel &&
    !showComparePanel &&
    !showPinPanel
  );

  useEffect(() => {
    if (shouldShowLayerList && !showLayerPanel) {
      setShowLayerPanel(true);
    }
  }, [shouldShowLayerList, showLayerPanel, setShowLayerPanel]);

  const toggleLayerActions = (e) => {
    e.stopPropagation();
    setLayerActionsOpen((prevState) => !prevState);
  };

  const toggleLayer = (shouldShowLayer) => {
    store.dispatch(visualizationSlice.actions.setVisibleOnMap(shouldShowLayer));
  };

  const actions = getActions({
    displaySocialShareOptions: displaySocialShareOptions,
    toggleSocialShareOptions: toggleSocialShareOptions,
    displayEffects: displayEffects,
    toggleEffects: toggleEffects,
    effects: effects,
    displayLayer: visibleOnMap,
    toggleLayer: toggleLayer,
    datasetId: datasetId,
  });

  useEffect(() => {
    resetMessagePanel();
  }, [selectedTabIndex]);

  useEffect(() => {
    const shouldCollapse = windowHeight >= MIN_SCREEN_HEIGHT_FOR_DATE_AND_COLLECTION_PANEL;

    if (shouldShowLayerList && selectedTimeRef.current) {
      store.dispatch(collapsiblePanelSlice.actions.setDatePanelExpanded(shouldCollapse));
      store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(shouldCollapse));
    }
  }, [windowHeight, shouldShowLayerList, datasetId]);

  useEffect(() => {
    selectedTimeRef.current = toTime;
  }, [toTime]);

  // Before authToken exists, the user is still on the login/anonymous-auth modal — render
  // nothing rather than a loader.
  if (!authToken) {
    return null;
  }

  // Once authToken is set (anon auth completed or logged in), show a loader only for the
  // brief gap before ThemesProvider starts loading data sources.
  if (!dataSourcesInitialized && !dataSourcesLoading) {
    return (
      <div className="visualization-panel">
        <Loader />
      </div>
    );
  }

  return (
    <div className="visualization-panel">
      <>
        {selectedThemeId !== EXPIRED_ACCOUNT.instanceId &&
          (activeExternalLayer && (activeExternalLayer.timeStart || activeExternalLayer.timeDefault) ? (
            <div className="date-selection">
              <WmsDateSelection
                compareShare={compareShare}
                showLayerPanel={showLayerPanel}
                setShowLayerPanel={setShowLayerPanel}
                showHighlightPanel={showHighlightPanel}
                showComparePanel={showComparePanel}
              />
            </div>
          ) : (
            datasetId && (
              <div className={`date-selection ${wmsLayersPanelOpen ? 'wms-disabled-overlay' : ''}`}>
                <DateSelection
                  compareShare={compareShare}
                  showLayerPanel={showLayerPanel}
                  setShowLayerPanel={setShowLayerPanel}
                  showHighlightPanel={showHighlightPanel}
                  showComparePanel={showComparePanel}
                />
              </div>
            )
          ))}
        {showMessagePanel && (
          <MessagePanel variant="plain" onClose={onMessagePanelClose}>
            {messagePanelContent}
          </MessagePanel>
        )}
        <div className={wmsLayersPanelOpen ? 'wms-disabled-overlay' : ''}>
          <ThemeSelect
            compareShare={compareShare}
            setShowLayerPanel={setShowLayerPanel}
            highlightsAvailable={highlightsAvailable}
            setShowHighlightPanel={setShowHighlightPanel}
          />
        </div>

        {selectedThemeId && (
          <>
            {selectedThemeId !== EXPIRED_ACCOUNT.instanceId && (
              <CollectionSelection
                handleTPDIClick={handleTPDIClick}
                showLayerPanel={showLayerPanel}
                setShowLayerPanel={setShowLayerPanel}
                shouldShowLayerList={shouldShowLayerList}
                showHighlightPanel={showHighlightPanel}
                setShowHighlightPanel={setShowHighlightPanel}
                highlightsAvailable={highlightsAvailable}
                showComparePanel={showComparePanel}
                setComparePanel={setShowComparePanel}
                showPinPanel={showPinPanel}
                setPinPanel={setShowPinPanel}
                comparedLayersCount={comparedLayersCount}
                pinsCount={pinsCount}
              />
            )}
            {showLayerPanel && !displayEffects && shouldShowLayerList && !shouldShowExternalLayerList && (
              <VisualizationLayerContainer
                shouldShowLayerList={shouldShowLayerList}
                savePin={savePin}
                displayEffects={displayEffects}
                toggleLayerActions={toggleLayerActions}
                layerActionsOpen={layerActionsOpen}
              />
            )}
            {!displayEffects && shouldShowExternalLayerList && (
              <ExternalWmsLayerContainer
                savePin={savePin}
                toggleLayerActions={toggleLayerActions}
                layerActionsOpen={layerActionsOpen}
              />
            )}
            {shouldShowLayerList && !shouldShowExternalLayerList && (
              <>
                {displayEffects && (
                  <EOBEffectsPanel
                    effects={effects}
                    onClose={() => toggleEffects(false)}
                    savePin={savePin}
                  ></EOBEffectsPanel>
                )}
                <div className="visualization-actions" ref={visualizationActionsRef}>
                  {!!displaySocialShareOptions && (
                    <SocialShare
                      displaySocialShareOptions={displaySocialShareOptions}
                      onHandleOutsideClick={() => toggleSocialShareOptions(false)}
                      datasetId={datasetId}
                    />
                  )}
                  <ActionBar actionsOpen={shouldShowLayerList} actions={actions} />
                </div>
              </>
            )}

            {/* dataSourcesInitialized guards against clicking a highlight while handlers are
                still loading after a theme switch, which would cause getDataSourceHandler to
                return null and fail dataset validation in Highlights.onPinSelect. */}
            {showHighlightPanel && highlightsAvailable && dataSourcesInitialized && (
              <Highlights
                highlights={selectedTheme.pins}
                terrainViewerId={terrainViewerId}
                is3D={is3D}
                showComparePanel={showComparePanel}
                setComparePanel={setShowComparePanel}
              />
            )}

            <PinPanel
              setLastAddedPin={setLastAddedPin}
              setSelectedPin={() => null}
              resetSearch={() => null}
              setShowPinPanel={setShowPinPanel}
              saveLocalPinsOnLogin={saveLocalPinsOnLogin}
              showPinPanel={showPinPanel}
            />
            {showComparePanel && <ComparePanel />}
          </>
        )}
      </>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  datasetId: store.visualization.datasetId,
  toTime: store.visualization.toTime,
  visualizationUrl: store.visualization.visualizationUrl,
  layerId: store.visualization.layerId,
  visibleOnMap: store.visualization.visibleOnMap,
  customSelected: store.visualization.customSelected,
  selectedProcessing: store.visualization.selectedProcessing,
  selectedLanguage: store.language.selectedLanguage,
  is3D: store.mainMap.is3D,
  terrainViewerId: store.terrainViewer.id,
  selectedThemeId: store.themes.selectedThemeId,
  themesLists: store.themes.themesLists,
  selectedThemesListId: store.themes.selectedThemesListId,
  effects: getVisualizationEffectsFromStore(store),
  comparedLayersCount: store.compare.comparedLayers.length,
  pinsCount: store.pins.items.length,
  authToken: getAppropriateAuthToken(store.auth, store.themes.selectedThemeId),
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  dataSourcesLoading: store.themes.dataSourcesLoading,
  selectedTabIndex: store.tabs.selectedTabIndex,
  activeExternalLayer: selectActiveExternalLayer(store),
  activeExternalServerId: store.externalLayers.activeServerId,
  wmsLayersPanelOpen: store.externalLayers.panelOpen,
});

export default connect(mapStoreToProps, null)(VisualizationPanel);
