import { t } from 'ttag';

import store, { compareLayersSlice, timelapseSlice } from '../../../store';
import {
  getDatasetLabel,
  getDataSourceHandler,
} from '../../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

import {
  getDatasourceNotSupportedMsg,
  getLoggedInErrorMsg,
  getNotSupportedIn3DMsg,
} from '../../../junk/ConstMessages';

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
    evalscripturl,
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
    evalscript: customSelected ? evalscript : '',
    evalscripturl: customSelected ? evalscripturl : '',
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
    processGraph: processGraph,
    selectedProcessing: selectedProcessing,
  };

  store.dispatch(dispatchAction(visualizationProps));
};

const addVisualizationToCompare = (props) => {
  addVisualizationToComponent(compareLayersSlice.actions.addToCompare, props);
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
