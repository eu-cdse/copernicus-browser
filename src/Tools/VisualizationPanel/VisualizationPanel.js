import React, { useEffect, useRef, useState } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { connect } from 'react-redux';
import { t } from 'ttag';

import DateSelection from './DateSelection';
import VisualizationLayerContainer from './VisualizationLayer/VisualizationLayerContainer';
import CollectionSelection from './CollectionSelection/CollectionSelection';
import Highlights from '../SearchPanel/Highlights/Highlights';
import EOBEffectsPanel from '../../junk/EOBEffectsPanel/EOBEffectsPanel';
import MessagePanel from './MessagePanel/MessagePanel';
import ActionBar from '../../components/ActionBar/ActionBar';
import SocialShare from '../../components/SocialShare/SocialShare';
import PinPanel from '../Pins/PinPanel';
import ComparePanel from '../ComparePanel/ComparePanel';
import ThemeSelect from './ThemeSelect/ThemeSelect';

import { haveEffectsChangedFromDefault } from './VisualizationPanel.utils';
import store, {
  commercialDataSlice,
  visualizationSlice,
  compareLayersSlice,
  pinsSlice,
  collapsiblePanelSlice,
} from '../../store';
import { EXPIRED_ACCOUNT, MIN_SCREEN_HEIGHT_FOR_DATE_AND_COLLECTION_PANEL } from '../../const';

import './VisualizationPanel.scss';
import { getVisualizationEffectsFromStore } from '../../utils/effectsUtils';
import { getAppropriateAuthToken } from '../../App';

const showEffectsText = () => t`Show effects and advanced options`;
const appliedEffectsText = () => t`Effects and advanced options applied`;
const showVisualizationsText = () => t`Show visualizations`;

//number of ms to delay notification reset (to avoid notification reset on double click)
export const NOTIFICATION_BADGE_RESET_TIMEOUT = 300;

const getActions = ({
  displayEffects,
  toggleEffects,
  displaySocialShareOptions,
  toggleSocialShareOptions,
  effects,
  displayLayer,
  toggleLayer,
}) => {
  const haveEffectsChanged = haveEffectsChangedFromDefault(effects);

  return [
    {
      id: 'showEffects',
      label: () =>
        displayEffects
          ? showVisualizationsText()
          : haveEffectsChanged
          ? appliedEffectsText()
          : showEffectsText(),
      onClick: () => {
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
      onClick: () => {
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
      onClick: () => {
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
  newCompareLayersCount,
  newPinsCount,
  visibleOnMap,
  authToken,
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

  const visualizationActionsRef = useRef();

  useEffect(() => {
    if ((displaySocialShareOptions || displayEffects) && visualizationActionsRef.current) {
      visualizationActionsRef.current.scrollIntoView();
    }
  }, [displaySocialShareOptions, displayEffects]);

  useEffect(() => {
    if (is3D && shouldShowTPDI) {
      setShouldShowTPDI(false);
    }
    if (!shouldShowTPDI) {
      store.dispatch(commercialDataSlice.actions.reset());
    }
  }, [is3D, shouldShowTPDI]);

  useEffect(() => {
    let resetNewCompareLayerCountTimeout;

    if (showComparePanel && newCompareLayersCount > 0) {
      resetNewCompareLayerCountTimeout = setTimeout(
        () => store.dispatch(compareLayersSlice.actions.setNewCompareLayersCount(0)),
        NOTIFICATION_BADGE_RESET_TIMEOUT,
      );

      return () => {
        if (resetNewCompareLayerCountTimeout) {
          clearTimeout(resetNewCompareLayerCountTimeout);
        }
      };
    }
  }, [showComparePanel, newCompareLayersCount]);

  useEffect(() => {
    let resetNewPinsCountTimeout;

    if (showPinPanel && newPinsCount > 0) {
      resetNewPinsCountTimeout = setTimeout(
        () => store.dispatch(pinsSlice.actions.setNewPinsCount(0)),
        NOTIFICATION_BADGE_RESET_TIMEOUT,
      );

      return () => {
        if (resetNewPinsCountTimeout) {
          clearTimeout(resetNewPinsCountTimeout);
        }
      };
    }
  }, [showPinPanel, newPinsCount]);

  const handleTPDIClick = () => {
    setShouldShowTPDI(!shouldShowTPDI);
  };

  const shouldShowLayerList =
    toTime &&
    datasetId &&
    visualizationUrl &&
    !showHighlightPanel &&
    !showComparePanel &&
    !showPinPanel &&
    authToken;

  useEffect(() => {
    if (shouldShowLayerList) {
      if (showLayerPanel) {
        return;
      }
      setShowLayerPanel(!showLayerPanel);
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
  });

  useEffect(() => {
    const shouldCollapse = windowHeight >= MIN_SCREEN_HEIGHT_FOR_DATE_AND_COLLECTION_PANEL;

    if (shouldShowLayerList) {
      store.dispatch(collapsiblePanelSlice.actions.setDatePanelExpanded(shouldCollapse));
      store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(shouldCollapse));
    }
  }, [windowHeight, shouldShowLayerList]);

  return (
    <div className="visualization-panel">
      <>
        {selectedThemeId !== EXPIRED_ACCOUNT.instanceId && datasetId && (
          <div className="date-selection">
            <DateSelection showLayerPanel={showLayerPanel} setShowLayerPanel={setShowLayerPanel} />
          </div>
        )}
        <MessagePanel />
        <ThemeSelect
          setShowLayerPanel={setShowLayerPanel}
          highlightsAvailable={highlightsAvailable}
          setShowHighlightPanel={setShowHighlightPanel}
        />

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
                newCompareLayersCount={newCompareLayersCount}
                newPinsCount={newPinsCount}
              />
            )}
            {showLayerPanel && !displayEffects && shouldShowLayerList && (
              <VisualizationLayerContainer
                shouldShowLayerList={shouldShowLayerList}
                savePin={savePin}
                displayEffects={displayEffects}
                toggleLayerActions={toggleLayerActions}
                layerActionsOpen={layerActionsOpen}
              />
            )}
            {shouldShowLayerList && (
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
                      toggleSocialSharePanel={() => toggleSocialShareOptions(false)}
                    />
                  )}
                  <ActionBar actionsOpen={shouldShowLayerList} actions={actions} />
                </div>
              </>
            )}

            {showHighlightPanel && highlightsAvailable && (
              <Highlights
                highlights={selectedTheme.pins}
                terrainViewerId={terrainViewerId}
                is3D={is3D}
                showComparePanel={showComparePanel}
                setComparePanel={setShowComparePanel}
                newCompareLayersCount={newCompareLayersCount}
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
  visibleOnMap: store.visualization.visibleOnMap,
  selectedLanguage: store.language.selectedLanguage,
  is3D: store.mainMap.is3D,
  terrainViewerId: store.terrainViewer.id,
  selectedThemeId: store.themes.selectedThemeId,
  themesLists: store.themes.themesLists,
  selectedThemesListId: store.themes.selectedThemesListId,
  effects: getVisualizationEffectsFromStore(store),
  newCompareLayersCount: store.compare.newCompareLayersCount,
  newPinsCount: store.pins.newPinsCount,
  authToken: getAppropriateAuthToken(store.auth, store.themes.selectedThemeId),
});

export default connect(mapStoreToProps, null)(VisualizationPanel);
