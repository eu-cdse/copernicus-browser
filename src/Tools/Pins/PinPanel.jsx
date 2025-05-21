import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import distance from '@turf/distance';
import { t, ngettext, msgid } from 'ttag';

import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';
import Pin from './Pin';
import PinTools from './PinTools';
import UpdatingStatus from './UpdatingStatus';
import { constructEffectsFromPinOrHighlight } from '../../utils/effectsUtils';
import { setTerrainViewerFromPin } from '../../TerrainViewer/TerrainViewer.utils';

import store, {
  mainMapSlice,
  modalSlice,
  notificationSlice,
  pinsSlice,
  themesSlice,
  visualizationSlice,
} from '../../store';

import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  formatDeprecatedPins,
  getPinsFromServer,
  getPinsFromSessionStorage,
  getVisualizationUrl,
  removePinsFromServer,
  savePinsToServer,
  savePinsToSessionStorage,
} from './Pin.utils';
import { parsePosition } from '../../utils';
import { customSelectStyle } from '../../components/CustomSelectInput/CustomSelectStyle';
import { CustomDropdownIndicator } from '../../components/CustomSelectInput/CustomDropdownIndicator';

import './Pins.scss';

import {
  DEFAULT_MODE,
  MODES,
  MODE_THEMES_LIST,
  URL_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG,
} from '../../const';
import { ModalId } from '../../const';

import ArrowSvg from '../../icons/arrow.svg?react';

const PINS_LC_NAME = 'eob-pins';
export const UNSAVED_PINS = 'unsaved-pins';
export const SAVED_PINS = 'saved-pins';
export const OPERATION_SHARE = 'share';
export const USE_PINS_BACKEND = true;

const ORDERING_MODE = {
  TITLE: 'title',
  DATE: 'date',
  LOCATION: 'location',
  DATASET_ID: 'datasetId',
};

class PinPanel extends Component {
  state = {
    operation: null, // "preview" operation by default
    selectedPins: [],
    sharePins: false,
    updatingPins: false,
    updatingPinsError: null,
    orderMode: null,
    displayModal: false,
  };

  componentDidMount() {
    if (USE_PINS_BACKEND && this.props.user) {
      this.fetchUserPins()
        .then((pins) => {
          this.setPinsInArray(pins, SAVED_PINS);
          this.setState({
            operation: null,
            selectedPins: [],
            sharePins: false,
            updatingPins: false,
            updatingPinsError: null,
          });
        })
        .catch(() => {});
    } else {
      let pins = getPinsFromSessionStorage();
      this.setPinsInArray(pins, UNSAVED_PINS);
    }
  }

  deleteUserPins = async (pinIds) => {
    this.setState({
      updatingPins: true,
      updatingPinsError: null,
    });
    try {
      await removePinsFromServer(pinIds);
    } catch (e) {
      this.setState({
        updatingPinsError: e.message,
      });
      throw e;
    } finally {
      this.setState({
        updatingPins: false,
      });
    }
  };

  fetchUserPins = async () => {
    this.setState({
      updatingPins: true,
      updatingPinsError: null,
    });
    try {
      const pins = await getPinsFromServer();
      const formattedPins = formatDeprecatedPins(pins);
      return formattedPins;
    } catch (e) {
      this.setState({
        updatingPinsError: e.message,
      });
      throw e;
    } finally {
      this.setState({
        updatingPins: false,
      });
    }
  };

  saveLocalUserPins = async (pins) => {
    this.setState({
      updatingPins: true,
      updatingPinsError: null,
    });
    try {
      const savedPins = await this.props.saveLocalPinsOnLogin(pins);
      return savedPins;
    } catch (e) {
      this.setState({
        updatingPinsError: e.message,
      });
      throw e;
    } finally {
      this.setState({
        updatingPins: false,
      });
    }
  };

  savePins = async (pins, replace) => {
    this.setState({
      updatingPins: true,
      updatingPinsError: null,
    });
    try {
      await savePinsToServer(pins, replace);
      return pins;
    } catch (e) {
      this.setState({
        updatingPinsError: e.message,
      });
      throw e;
    } finally {
      this.setState({
        updatingPins: false,
      });
    }
  };

  componentDidUpdate(prevProps) {
    let prevPinsIds = prevProps.pinItems.map((pin) => pin.item._id).sort((a, b) => a.localeCompare(b));
    let currentPinsIds = this.props.pinItems.map((pin) => pin.item._id).sort((a, b) => a.localeCompare(b));

    let prevPinsTitles = prevProps.pinItems.map((pin) => pin.item.title).sort((a, b) => a.localeCompare(b));
    let currentPinsTitles = this.props.pinItems
      .map((pin) => pin.item.title)
      .sort((a, b) => a.localeCompare(b));

    // (If ids have changed) or (if titles have changed and is ordered by title)
    if (
      !prevPinsIds.every((pinId, idx) => pinId === currentPinsIds[idx]) ||
      (!prevPinsTitles.every((pinTitle, idx) => pinTitle === currentPinsTitles[idx]) &&
        this.state.activeOrdering === ORDERING_MODE.TITLE)
    ) {
      this.setState({ activeOrdering: null });
    }

    if (prevProps.user !== this.props.user) {
      if (!this.props.user) {
        this.removePinsFromArray(SAVED_PINS);
        this.cancelSharePins();
      } else if (USE_PINS_BACKEND) {
        // user logged in
        if (this.props.pinItems.filter((p) => p.type === UNSAVED_PINS).length) {
          let pins = getPinsFromSessionStorage();
          if (!pins.length) {
            return;
          }
          this.saveLocalUserPins(pins)
            .then((pins) => {
              sessionStorage.setItem(PINS_LC_NAME, JSON.stringify([]));
              this.removePinsFromArray(UNSAVED_PINS);
              this.setPinsInArray(pins.pins, SAVED_PINS);
            })
            .catch(() => {});
        } else {
          this.fetchUserPins()
            .then((pins) => this.setPinsInArray(pins, SAVED_PINS))
            .catch(() => {});
        }
      }
    }

    if (prevProps.lastAddedPin !== this.props.lastAddedPin) {
      if (USE_PINS_BACKEND && this.props.user) {
        this.fetchUserPins()
          .then((pins) => this.setPinsInArray(pins, SAVED_PINS))
          .catch(() => {});
      } else {
        let pins = getPinsFromSessionStorage();
        this.setPinsInArray(pins, UNSAVED_PINS);
      }
    }

    if (prevProps.pinItems?.length !== this.props.pinItems?.length && this.state.orderMode) {
      this.updateOrderedPinsOnPinItemsChange();
    }
  }

  removePinsFromArray = (pinType) => {
    store.dispatch(pinsSlice.actions.clearByType(pinType));
  };

  setPinsInArray = (pins, pinType) => {
    store.dispatch(
      pinsSlice.actions.updatePinsByType({
        pins: pins,
        pinType: pinType,
      }),
    );
  };

  onPinIndexChange = (oldIndex, newIndex) => {
    const pinItems = [...this.props.pinItems];
    const pinItem = pinItems[oldIndex];
    pinItems.splice(oldIndex, 1); // remove pinItem from the old place
    pinItems.splice(newIndex, 0, pinItem); // add it elsewhere

    this.setState({ activeOrdering: null }); // manually changing the pin order

    const pins = pinItems.filter((p) => p.type === pinItem.type).map((p) => p.item);
    if (pinItem.type === UNSAVED_PINS) {
      savePinsToSessionStorage(pins, true);
    }
    if (pinItem.type === SAVED_PINS) {
      this.savePins(pins, true)
        .then(() => store.dispatch(pinsSlice.actions.updateItems(pinItems)))
        .catch(() => {});
    }
  };

  onRemovePin = (index) => {
    const confirmation = window.confirm(t`WARNING: You're about to delete a pin. Do you wish to continue?`);
    if (!confirmation) {
      return;
    }
    const pin = this.props.pinItems[index].item;
    const type = this.props.pinItems[index].type;

    if (type === UNSAVED_PINS) {
      let pins = getPinsFromSessionStorage();
      if (!pins.length) {
        return;
      }
      pins = pins.filter((p) => p._id !== pin._id);
      sessionStorage.setItem(PINS_LC_NAME, JSON.stringify(pins));
      store.dispatch(pinsSlice.actions.removeItem(index));
      this.props.setLastAddedPin(null);
    } else if (type === SAVED_PINS) {
      this.deleteUserPins([pin._id])
        .then(() => {
          store.dispatch(pinsSlice.actions.removeItem(index));
          this.props.setLastAddedPin(null);
        })
        .catch(() => {});
    }

    this.setState((prevState) => {
      return {
        selectedPins: prevState.selectedPins.filter((p) => p._id !== pin._id),
      };
    });
  };

  onRemoveAllPins = () => {
    if (this.props.pinItems.length === 0) {
      return;
    }

    const confirmation = window.confirm(
      t`WARNING: You're about to delete all pins. Do you wish to continue?`,
    );
    if (!confirmation) {
      return;
    }

    this.cancelSharePins();

    if (USE_PINS_BACKEND && this.props.user) {
      const pinIds = this.props.pinItems
        .filter((p) => p.type === SAVED_PINS && !!p.item._id)
        .map((p) => p.item._id);

      if (pinIds.length) {
        this.deleteUserPins(pinIds)
          .then(() => {
            store.dispatch(pinsSlice.actions.updateItems([]));
            this.props.setLastAddedPin(null);
          })
          .catch(() => {});
      }
    } else {
      sessionStorage.setItem(PINS_LC_NAME, JSON.stringify([]));
      store.dispatch(pinsSlice.actions.updateItems([]));
    }
  };

  onPinSelect = async (pin, arePinsSelectable) => {
    const {
      zoom,
      lat,
      lng,
      fromTime,
      toTime,
      dateMode,
      datasetId,
      layerId,
      evalscript,
      evalscripturl,
      themeId,
      dataFusion,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      backscatterCoeff,
      demSource3D,
      terrainViewerSettings,
      orbitDirection,
      cloudCoverage,
    } = pin;

    if (arePinsSelectable) {
      return;
    }

    // since we are setting a new theme and changing map state we should reset search results
    this.props.resetSearch();
    store.dispatch(visualizationSlice.actions.reset());
    this.props.setShowPinPanel(false);

    if (!themeId) {
      store.dispatch(notificationSlice.actions.displayError('Pin is invalid: themeId is not defined.'));
      return;
    }

    const modeFromPinThemeId = MODES.find((m) => m.themes.find((t) => t.id === themeId));
    let selectedModeId = this.props.selectedModeId;
    let selectedThemesListId = this.props.selectedThemesListId;

    if (
      this.props.urlThemesList.find((t) => t.id === themeId) &&
      this.props.selectedModeId !== DEFAULT_MODE
    ) {
      // themeId is one of the url themes, we set the default mode if not set
      selectedModeId = DEFAULT_MODE.id;
      selectedThemesListId = URL_THEMES_LIST;
    } else if (modeFromPinThemeId && modeFromPinThemeId.id !== this.props.selectedModeId) {
      // themeId is in one of the modes themes and we set the mode if it's other than currently selected
      selectedModeId = modeFromPinThemeId.id;
      selectedThemesListId = MODE_THEMES_LIST;
    } else if (this.props.userInstancesThemesList.find((t) => t.id === themeId)) {
      // themeId is in a user instance, we keep the current mode.
      selectedThemesListId = USER_INSTANCES_THEMES_LIST;
    } else if (
      selectedThemesListId !== MODE_THEMES_LIST &&
      this.props.modeThemesList.find((t) => t.id === themeId)
    ) {
      // Check mode themes when theme is not found in userInstancesThemesList or urlThemesList
      // and change selectedThemesListId accordingly
      selectedThemesListId = MODE_THEMES_LIST;
    }

    store.dispatch(
      themesSlice.actions.setSelectedThemeIdAndModeId({
        selectedThemeId: themeId,
        selectedThemesListId: selectedThemesListId,
        selectedModeId: selectedModeId,
      }),
    );

    const { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);

    store.dispatch(
      mainMapSlice.actions.setPosition({
        lat: parsedLat,
        lng: parsedLng,
        zoom: parsedZoom,
      }),
    );

    let pinTimeFrom, pinTimeTo;
    const dataSourceHandler = getDataSourceHandler(datasetId);
    const supportsTimeRange = dataSourceHandler ? dataSourceHandler.supportsTimeRange() : true;
    if (supportsTimeRange) {
      pinTimeFrom = fromTime ? moment.utc(fromTime) : moment.utc(toTime).startOf('day');
      pinTimeTo = fromTime ? moment.utc(toTime) : moment.utc(toTime).endOf('day');
    } else {
      pinTimeTo = moment.utc(toTime);
    }

    let visualizationParams = {
      datasetId: datasetId,
      visualizationUrl: getVisualizationUrl(pin),
      fromTime: pinTimeFrom,
      toTime: pinTimeTo,
      ...(dateMode ? { dateMode: dateMode } : {}),
      visibleOnMap: true,
      dataFusion: dataFusion,
    };

    if (evalscript || evalscripturl) {
      visualizationParams.evalscript = evalscript;
      visualizationParams.evalscripturl = evalscripturl;
      visualizationParams.customSelected = true;
    } else {
      visualizationParams.layerId = layerId;
    }

    const effects = constructEffectsFromPinOrHighlight(pin);
    visualizationParams = { ...visualizationParams, ...effects };

    if (minQa !== undefined) {
      visualizationParams.minQa = minQa;
    }
    if (mosaickingOrder) {
      visualizationParams.mosaickingOrder = mosaickingOrder;
    }
    if (upsampling) {
      visualizationParams.upsampling = upsampling;
    }
    if (downsampling) {
      visualizationParams.downsampling = downsampling;
    }
    if (speckleFilter) {
      visualizationParams.speckleFilter = speckleFilter;
    }
    if (orthorectification) {
      visualizationParams.orthorectification = orthorectification;
    }
    if (backscatterCoeff) {
      visualizationParams.backscatterCoeff = backscatterCoeff;
    }
    if (demSource3D) {
      visualizationParams.demSource3D = demSource3D;
    }
    if (orbitDirection) {
      visualizationParams.orbitDirection = [orbitDirection];
    }
    if (cloudCoverage !== undefined) {
      visualizationParams.cloudCoverage = cloudCoverage;
    }
    store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));
    this.props.setSelectedPin(this.props.item);

    setTerrainViewerFromPin({
      lat: parsedLat,
      lng: parsedLng,
      zoom: parsedZoom,
      terrainViewerSettings: terrainViewerSettings,
      is3D: this.props.is3D,
      terrainViewerId: this.props.terrainViewerId,
    });
  };

  onTogglePinForSelection = (pinForSharing) => {
    //check if pin is already in list of pins for sharing
    const isPinSelected = this.state.selectedPins.find((pin) => pin._id === pinForSharing._id);

    //if pin is not already selected, add it to the list. Otherwise remove it from the list
    if (!isPinSelected) {
      this.setState({
        selectedPins: [...this.state.selectedPins, pinForSharing],
      });
    } else {
      this.setState({
        selectedPins: [...this.state.selectedPins.filter((pin) => pin._id !== pinForSharing._id)],
      });
    }
  };

  savePinProperty = (index, key, value) => {
    const pinItems = cloneDeep(this.props.pinItems);
    pinItems[index].item[key] = value;

    const pinType = pinItems[index].type;
    const pins = pinItems.filter((p) => p.type === pinType).map((p) => p.item);

    if (pinType === UNSAVED_PINS) {
      savePinsToSessionStorage(pins, true);
      store.dispatch(pinsSlice.actions.updateItems(pinItems));
    }
    if (pinType === SAVED_PINS) {
      this.savePins(pins, true)
        .then(() => store.dispatch(pinsSlice.actions.updateItems(pinItems)))
        .catch(() => {});
    }
  };

  cancelSharePins = () => {
    this.setState((prevState) => ({
      operation: prevState.operation === OPERATION_SHARE ? null : prevState.operation,
      selectedPins: [],
    }));
  };

  checkIfUserLoggedInAndPinsPresent() {
    if (!this.props.user || !USE_PINS_BACKEND) {
      return false;
    }
    if (!this.props.pinItems || this.props.pinItems.length === 0) {
      return false;
    }
    return true;
  }

  toggleSharePins = () => {
    if (!this.checkIfUserLoggedInAndPinsPresent()) {
      return;
    }

    const { pinItems } = this.props;
    this.setState((prevState) => ({
      operation: prevState.operation === OPERATION_SHARE ? null : OPERATION_SHARE,
      selectedPins: prevState.operation === OPERATION_SHARE ? [] : pinItems.map((pin) => pin.item),
    }));
  };

  openAnimatePanel = () => {
    if (!this.checkIfUserLoggedInAndPinsPresent()) {
      return;
    }

    this.setState({
      operation: null,
      comparingPins: false,
      compareMode: null,
    });

    store.dispatch(
      modalSlice.actions.addModal({
        modal: ModalId.PINS_STORY_BUILDER,
        params: {},
      }),
    );
  };

  resetSelectedPins = () => {
    this.setState({
      selectedPins: [],
      operation: null,
    });
  };

  createSharePinsLink = () => {
    store.dispatch(
      modalSlice.actions.addModal({
        modal: ModalId.SHAREPINSLINK,
        params: { selectedPins: this.state.selectedPins, onClose: this.resetSelectedPins },
      }),
    );
  };

  toggleSelectAllPins = (areAllPinsSelected) => {
    if (areAllPinsSelected) {
      this.setState({
        selectedPins: [],
      });
    } else {
      const { pinItems } = this.props;
      const allPins = pinItems.map((pin) => pin.item);
      this.setState({
        selectedPins: [...allPins],
      });
    }
  };

  calculateGeoLocationDistance = (pinLat, pinLng) => {
    const { currentMapLat, currentMapLng } = this.props;
    const from = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [currentMapLng, currentMapLat] },
    };
    const to = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [pinLng, pinLat] },
    };
    const options = { units: 'kilometers' };
    return distance(from, to, options);
  };

  compareByDate = (a, b) => {
    return new Date(a.item.toTime) - new Date(b.item.toTime);
  };

  compareByLocation = (a, b) => {
    const distanceToA = this.calculateGeoLocationDistance(a.item.lat, a.item.lng);
    const distanceToB = this.calculateGeoLocationDistance(b.item.lat, b.item.lng);

    return distanceToA - distanceToB;
  };

  compareByDatasetId = (a, b) => {
    return a.item.datasetId.localeCompare(b.item.datasetId);
  };

  compareByTitle = (a, b) => {
    return a.item.title.toLowerCase().localeCompare(b.item.title.toLowerCase());
  };

  orderPins = (compareFunction, shouldOrderBeAscending) => {
    const { pinItems } = this.props;
    let orderedPinItems = pinItems.slice().sort((a, b) => a.item._id.localeCompare(b.item._id));
    orderedPinItems.sort(compareFunction);

    if (!shouldOrderBeAscending) {
      orderedPinItems.reverse();
    }

    store.dispatch(pinsSlice.actions.updateItems(orderedPinItems));
  };

  getOrderingOptions = () => [
    {
      value: 'Title ascending',
      label: t`Title ascending`,
      compareFunction: this.compareByTitle,
      isAscending: true,
    },
    {
      value: 'Title descending',
      label: t`Title descending`,
      compareFunction: this.compareByTitle,
      isAscending: false,
    },
    {
      value: 'Date ascending',
      label: t`Date ascending`,
      compareFunction: this.compareByDate,
      isAscending: true,
    },
    {
      value: 'Date descending',
      label: t`Date descending`,
      compareFunction: this.compareByDate,
      isAscending: false,
    },
    {
      value: 'Location ascending',
      label: t`Location ascending`,
      compareFunction: this.compareByLocation,
      isAscending: true,
    },
    {
      value: 'Location descending',
      label: t`Location descending`,
      compareFunction: this.compareByLocation,
      isAscending: false,
    },
    {
      value: 'Dataset ID ascending',
      label: t`Dataset ID ascending`,
      compareFunction: this.compareByDatasetId,
      isAscending: true,
    },
    {
      value: 'Dataset ID descending',
      label: t`Dataset ID descending`,
      compareFunction: this.compareByDatasetId,
      isAscending: false,
    },
  ];

  handleSelectOrder = (e) => {
    this.setState({ orderMode: e.value }, () => this.orderPins(e.compareFunction, e.isAscending));
  };

  handleModalAction = (modalStateBool) => {
    this.setState({
      displayModal: modalStateBool,
    });
  };

  getOrderDisplayText = () =>
    !this.state.orderMode || this.props.pinItems.length < 2 ? t`Default order` : this.state.orderMode;

  updateOrderedPinsOnPinItemsChange() {
    const selectedOption = this.getOrderingOptions().find(
      (orderingOpt) => orderingOpt.value === this.state.orderMode,
    );

    if (selectedOption) {
      this.orderPins(selectedOption.compareFunction, selectedOption.isAscending);
    }
  }

  render() {
    const { operation, selectedPins, updatingPins, updatingPinsError, displayModal, orderMode } = this.state;
    const { pinItems, is3D, showPinPanel } = this.props;
    const arePinsSelectable = operation === OPERATION_SHARE;
    const areAllPinsSelected = pinItems && selectedPins && selectedPins.length === pinItems.length;

    if (!import.meta.env.VITE_CDSE_BACKEND) {
      return (
        <div className="pin-panel">
          <div className="pins-container">
            <NotificationPanel type="info" msg={FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG} />
          </div>
        </div>
      );
    }

    if (!showPinPanel) {
      return null;
    }

    const loggedIn = this.props.user ? true : false;
    const noPinMsg = t`No pins. Go to the Visualise tab to save a pin or upload a JSON file with saved pins.`;
    const NOT_LOGGED_IN_AND_TEMP_PIN_MSG = t`Note that the pins will be saved only if you log in. Otherwise, the pins will be lost once the application is closed.`;
    return (
      <div className="pin-panel">
        <div className={`pins-header ${displayModal ? '' : 'sticky'}`}>
          <div className="pins-header-title-wrapper">
            <div className="pins-header-title">{t`Pins`}:</div>
            <div className="pins-header-order-select">
              <div className="pins-header-order-label">{t`Order by:`}</div>
              <Select
                placeholder={this.getOrderDisplayText()}
                value={orderMode}
                options={this.getOrderingOptions()}
                onChange={this.handleSelectOrder}
                styles={customSelectStyle}
                menuPosition="fixed"
                menuShouldBlockScroll={true}
                className="order-by-select-dropdown"
                classNamePrefix="order-by-select"
                components={{ DropdownIndicator: CustomDropdownIndicator }}
                isSearchable={false}
                menuPlacement="auto"
                isDisabled={pinItems.length < 2}
              />
            </div>
          </div>

          <div className="pins-controls">
            <PinTools
              pins={pinItems.map((p) => p.item)}
              setLastAddedPin={this.props.setLastAddedPin}
              onDeleteAllPins={this.onRemoveAllPins}
              isUserLoggedIn={loggedIn}
              importEnabled={true}
              onShareClick={this.toggleSharePins}
              cancelSharePins={this.cancelSharePins}
              onAnimateClick={this.openAnimatePanel}
              pinsStoryBuilderEnabled={!is3D}
              operation={operation}
              displayModal={displayModal}
              handleModalAction={this.handleModalAction}
            />
          </div>
        </div>
        <div className="pins-container" key={this.props.lastAddedPin}>
          <UpdatingStatus updatingPins={updatingPins} updatingPinsError={updatingPinsError} />
          {pinItems.map((pin, index) => (
            <Pin
              item={pin.item}
              key={pin.item._id}
              index={index}
              pinType={pin.type}
              allowRemove={true}
              onRemovePin={this.onRemovePin}
              arePinsSelectable={arePinsSelectable}
              canAddToCompare={!is3D}
              savePinProperty={this.savePinProperty}
              setSelectedPin={this.props.setSelectedPin}
              onPinSelect={() =>
                arePinsSelectable
                  ? this.onTogglePinForSelection(pin.item)
                  : this.onPinSelect(pin.item, arePinsSelectable)
              }
              selectedForSharing={!!selectedPins.find((sharedPin) => sharedPin._id === pin.item._id)}
              onPinIndexChange={this.onPinIndexChange}
            />
          ))}
          {/* no pins found and not logged in notification banner */}
          {pinItems.length === 0 && loggedIn && <NotificationPanel type="info" msg={noPinMsg} />}
          {/* not logged in notification banner */}
          {!loggedIn && pinItems.length === 0 && (
            /* the space before the second string is on purpose to have a space between the texts*/
            <NotificationPanel type="info" msg={t`No pins.` + ` ${NOT_LOGGED_IN_AND_TEMP_PIN_MSG}`} />
          )}
          {!loggedIn && pinItems.length > 0 && (
            <NotificationPanel type="info" msg={NOT_LOGGED_IN_AND_TEMP_PIN_MSG} />
          )}
        </div>
        {operation === OPERATION_SHARE && (
          <>
            <div className="pins-selection-confirm">
              <EOBButton
                disabled={!selectedPins || selectedPins.length === 0}
                fluid
                text={
                  <>
                    {ngettext(
                      msgid`Create link (${selectedPins.length} pin selected)`,
                      `Create link (${selectedPins.length} pins selected)`,
                      selectedPins.length,
                    )}
                    <ArrowSvg />
                  </>
                }
                onClick={this.createSharePinsLink}
              />
            </div>
            <div className="select-all-share" onClick={() => this.toggleSelectAllPins(areAllPinsSelected)}>
              {areAllPinsSelected ? t`Deselect all` : t`Select all`}
            </div>
          </>
        )}
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  user: store.auth.user.userdata,
  access_token: store.auth.user.access_token,
  bounds: store.mainMap.bounds,
  selectedModeId: store.themes.selectedModeId,
  selectedThemesListId: store.themes.selectedThemesListId,
  themesLists: store.themes.themesLists,
  selectedThemeId: store.themes.selectedThemeId,
  modeThemesList: store.themes.themesLists[MODE_THEMES_LIST],
  urlThemesList: store.themes.themesLists[URL_THEMES_LIST],
  userInstancesThemesList: store.themes.themesLists[USER_INSTANCES_THEMES_LIST],
  pinItems: store.pins.items,
  selectedLanguage: store.language.selectedLanguage,
  currentMapLat: store.mainMap.lat,
  currentMapLng: store.mainMap.lng,
  is3D: store.mainMap.is3D,
  terrainViewerId: store.terrainViewer.id,
});

export default connect(mapStoreToProps, null)(PinPanel);
