import { t } from 'ttag';

import store, { compareLayersSlice, timelapseSlice } from '../../../store';
import { selectActiveExternalLayer } from '../../../store/slices/externalLayersSlice';
import { buildExternalWmsPayload } from '../../Pins/Pin.utils';
import {
  getDatasetLabel,
  getDataSourceHandler,
} from '../../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

import {
  getDatasourceNotSupportedMsg,
  getLoggedInErrorMsg,
  getNotSupportedIn3DMsg,
} from '../../../junk/ConstMessages';
import { FATHOM_TRACK_EVENT_LIST } from '../../../const';
import { handleFathomTrackEvent } from '../../../utils/fathom';
import { notifyAddedToCompare } from '../../../utils/floatingPanelNotification';

const addVisualizationToComponent = (
  dispatchAction,
  {
    zoom,
    lat,
    lng,
    fromTime,
    toTime,
    datasetId,
    visualizationUrl,
    selectedVisualizationId,
    evalscript,
    evalscriptUrl,
    dataFusion,
    gainEffect,
    gammaEffect,
    redRangeEffect,
    greenRangeEffect,
    blueRangeEffect,
    minQa,
    mosaickingOrder,
    upsampling,
    downsampling,
    speckleFilter,
    orthorectification,
    customSelected,
    selectedThemeId,
    orbitDirection,
    selectedProcessing,
    processGraph,
    processGraphUrl,
  },
) => {
  const title = `${getDatasetLabel(datasetId)}: ${customSelected ? 'Custom' : selectedVisualizationId}`;

  const visualizationProps = {
    title,
    zoom,
    lat,
    lng,
    fromTime,
    toTime,
    datasetId,
    visualizationUrl,
    layerId: selectedVisualizationId,
    evalscript: evalscript || '',
    evalscriptUrl: evalscriptUrl || '',
    dataFusion,
    gainEffect,
    gammaEffect,
    redRangeEffect,
    greenRangeEffect,
    blueRangeEffect,
    minQa,
    mosaickingOrder,
    upsampling,
    downsampling,
    speckleFilter,
    orthorectification,
    themeId: selectedThemeId,
    orbitDirection,
    processGraph: processGraph || '',
    processGraphUrl: processGraphUrl || '',
    selectedProcessing,
  };

  store.dispatch(dispatchAction(visualizationProps));
};

const addVisualizationToCompare = (props) => {
  const activeExternalLayer = selectActiveExternalLayer(store.getState());
  if (activeExternalLayer) {
    const externalTitle = activeExternalLayer.server.name;
    store.dispatch(
      compareLayersSlice.actions.addToCompare({
        title: externalTitle,
        zoom: props.zoom,
        lat: props.lat,
        lng: props.lng,
        themeId: store.getState().themes.selectedThemeId,
        externalWms: buildExternalWmsPayload(activeExternalLayer),
      }),
    );
    handleFathomTrackEvent(
      FATHOM_TRACK_EVENT_LIST.EXTERNAL_LAYER_ADD_TO_COMPARE,
      activeExternalLayer.server.type,
    );
    notifyAddedToCompare();
    return;
  }
  addVisualizationToComponent(compareLayersSlice.actions.addToCompare, props);
  notifyAddedToCompare();
};

const addVisualizationToTimelapse = (props) => {
  addVisualizationToComponent(timelapseSlice.actions.addPin, props);
};

const isAddToTimelapseEnabled = ({ datasetId, user, is3D }) => {
  //add to timelapse is disabled for not logged in users
  if (!(user && user.userdata)) {
    return false;
  }

  // add to timelapse is disabled in 3d
  if (!!is3D) {
    return false;
  }

  const dsh = getDataSourceHandler(datasetId);
  return dsh && dsh.supportsTimelapse();
};

const createAddToTimelapseTitle = ({ datasetId, user, is3D }) => {
  let title = t`Add to Timelapse`;

  if (is3D) {
    return `${title}\n(${getNotSupportedIn3DMsg()})`;
  }

  if (!(user && user.userdata)) {
    return `${title}\n(${getLoggedInErrorMsg()})`;
  }

  const dsh = getDataSourceHandler(datasetId);
  if (!(dsh && dsh.supportsTimelapse())) {
    return `${title}\n(${getDatasourceNotSupportedMsg()})`;
  }

  return title;
};

export const createLayerActions = (props) => [
  {
    id: 'addToCompare',
    label: () => t`Add to Compare`,
    title: () => `${t`Add to Compare`} ${props.is3D ? `\n(${getNotSupportedIn3DMsg()})` : ''}`,
    onClick: () => addVisualizationToCompare(props),
    icon: () => 'fas fa-exchange-alt',
    visible: () => true,
    disabled: () => props && props.is3D,
  },
  {
    id: 'savePin',
    label: () => t`Add to Pins`,
    onClick: () => props && props.savePin(),
    icon: () => 'fa fa-thumb-tack',
    visible: () => true,
    disabled: () => props && !props.savePin,
  },

  {
    id: 'addToTimelapse',
    label: () => t`Add to Timelapse`,
    title: () => createAddToTimelapseTitle(props),
    onClick: () => addVisualizationToTimelapse(props),
    icon: () => `fa fa-film`,
    visible: () => true,
    disabled: () => !isAddToTimelapseEnabled(props),
  },
];
