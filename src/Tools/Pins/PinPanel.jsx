import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import distance from '@turf/distance';
import { t, ngettext, msgid } from 'ttag';
import { v4 as uuid } from 'uuid';

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
  tabsSlice,
  themesSlice,
  visualizationSlice,
  externalLayersSlice,
  panelSlice,
} from '../../store';

import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  formatDeprecatedPins,
  getPinsFromServer,
  getLocalPins,
  getVisualizationUrl,
  normalizePin,
  removePinsFromServer,
  writeLocalPins,
  clearLocalPins,
  savePinsToServer,
  saveLocalPins,
  shouldUsePinsBackend,
} from './Pin.utils';
import { parsePosition, resolveEvalscript } from '../../utils';
import { customSelectStyle } from '../../components/CustomSelectInput/CustomSelectStyle';
import { CustomDropdownIndicator } from '../../components/CustomSelectInput/CustomDropdownIndicator';

import './Pins.scss';

import {
  DATE_MODES,
  DEFAULT_MODE,
  DEFAULT_THEME_ID,
  MODES,
  MODE_THEMES_LIST,
  TABS,
  URL_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG,
  PROCESSING_OPTIONS,
  PANEL,
} from '../../const';
import { ModalId } from '../../const';

import ArrowSvg from '../../icons/arrow.svg?react';
import { isOpenEoSupported } from '../../api/openEO/openEOHelpers';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';

import { UNSAVED_PINS, SAVED_PINS, OPERATION_SHARE } from './const';
import { fetchServerCapabilities } from '../../ExternalLayers/useExternalServerLayers';

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

  // Guards against migrateAnonymousPins running twice (e.g. componentDidMount and
  // componentDidUpdate both firing) before the async backend save resolves, which would
  // otherwise create duplicate backend pins since savePinsToServer appends and doesn't dedup.
  _anonMigrationDone = false;

  componentDidMount() {
    // Local (client-side) pins are loaded from the per-user localStorage bucket. Logged-in users
    // additionally have their native and external-WMS pins on the backend.
    this.setPinsInArray(getLocalPins(), UNSAVED_PINS);

    if (shouldUsePinsBackend(this.props.user)) {
      // A real login is a full Keycloak redirect + app re-mount, so the user is already set on
      // this first mount and the componentDidUpdate null -> user transition never fires.
      this.migrateAnonymousPins();
    }
  }

  // Migrates pins saved while anonymous to the backend, called both here (real login: user is
  // already set on first mount) and from componentDidUpdate's null -> user transition. Callers
  // don't need to reset updatingPins/updatingPinsError before calling this: the class-field
  // initializer above already sets the right defaults, and the _anonMigrationDone early-return
  // guard below ensures the migration body (and its updatingPins:true) runs at most once, even
  // if both componentDidMount and componentDidUpdate fire.
  migrateAnonymousPins = () => {
    if (this._anonMigrationDone) {
      return;
    }
    this._anonMigrationDone = true;

    // Migrate all pins added while anonymous (including external-WMS pins) to the backend, same
    // as native Sentinel-Hub pins. Same migration pattern as hydrateExternalServers.ts's
    // resolveHydratedExternalLayers (external WMS/WMTS servers) — keep the two in sync if the
    // failure-handling semantics of one changes.
    const anonPins = getLocalPins();
    if (anonPins.length) {
      // Only clear the anon bucket once the backend save has confirmed success, so a failed
      // migration leaves the pins in place instead of silently dropping them.
      this.saveLocalUserPins(anonPins)
        .then((res) => {
          clearLocalPins();
          // Drop the anonymous pins from the UNSAVED array (loaded from the session bucket at mount)
          // now that they live in SAVED — otherwise each migrated pin shows twice (unsaved + saved).
          this.removePinsFromArray(UNSAVED_PINS);
          this.setPinsInArray(res.pins, SAVED_PINS);
        })
        .catch(() => {
          this._anonMigrationDone = false;
          // The migration save failed, but the user may already have pins on the backend.
          // Fall back to fetching them so the UI shows the existing saved pins instead of
          // nothing. The anon bucket is left intact (clearLocalPins only runs on success),
          // so a later retry can still migrate them.
          this.fetchUserPins()
            .then((pins) => this.setPinsInArray(pins, SAVED_PINS))
            .catch(() => {});
        });
    } else {
      this.fetchUserPins()
        .then((pins) => this.setPinsInArray(pins, SAVED_PINS))
        .catch(() => {
          this._anonMigrationDone = false;
        });
    }
  };

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
        // Reset the guard so a later login with new anon pins migrates again.
        this._anonMigrationDone = false;
      } else if (shouldUsePinsBackend(this.props.user)) {
        this.migrateAnonymousPins();
      }
    }

    if (prevProps.lastAddedPin !== this.props.lastAddedPin) {
      if (shouldUsePinsBackend(this.props.user)) {
        this.fetchUserPins()
          .then((pins) => this.setPinsInArray(this.moveAddedPinToTop(pins), SAVED_PINS))
          .catch(() => {});
      } else {
        let pins = getLocalPins();
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

  // Backend GET order is not guaranteed, so a just-added pin can come back anywhere in the
  // response; move it back to the top so it stays visible where the user just placed it.
  moveAddedPinToTop = (pins) => {
    const addedId = this.props.lastAddedPin;
    if (!addedId) {
      return pins;
    }
    const idx = pins.findIndex((p) => p._id === addedId);
    if (idx <= 0) {
      return pins;
    }
    return [pins[idx], ...pins.slice(0, idx), ...pins.slice(idx + 1)];
  };

  onPinIndexChange = (oldIndex, newIndex) => {
    const pinItems = [...this.props.pinItems];
    const pinItem = pinItems[oldIndex];
    pinItems.splice(oldIndex, 1); // remove pinItem from the old place
    pinItems.splice(newIndex, 0, pinItem); // add it elsewhere

    this.setState({ activeOrdering: null }); // manually changing the pin order

    const pins = pinItems.filter((p) => p.type === pinItem.type).map((p) => p.item);
    if (pinItem.type === UNSAVED_PINS) {
      saveLocalPins(pins, true);
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

    // Unsaved (local) pins are deleted from localStorage with no backend call.
    if (type === UNSAVED_PINS) {
      const pins = getLocalPins().filter((p) => p._id !== pin._id);
      writeLocalPins(pins);
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

    if (shouldUsePinsBackend(this.props.user)) {
      const pinIds = this.props.pinItems
        .filter((p) => p.type === SAVED_PINS && !!p.item._id)
        .map((p) => p.item._id);

      // Also clear this user's local bucket: logged-in users can still have local pins (e.g.
      // external-WMS pins saved locally before `user.userdata` was available, see Tools.jsx savePin),
      // and componentDidMount unconditionally reloads that bucket into UNSAVED_PINS on next mount.
      const finishRemoveAll = () => {
        clearLocalPins();
        store.dispatch(pinsSlice.actions.updateItems([]));
        this.props.setLastAddedPin(null);
      };
      if (pinIds.length) {
        this.deleteUserPins(pinIds)
          .then(finishRemoveAll)
          .catch(() => {});
      } else {
        finishRemoveAll();
      }
    } else {
      clearLocalPins();
      store.dispatch(pinsSlice.actions.updateItems([]));
    }
  };

  onPinSelect = async (rawPin, arePinsSelectable) => {
    const pin = normalizePin(rawPin);
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
      evalscriptUrl,
      processGraph,
      processGraphUrl,
      selectedProcessing: pinSelectedProcessing,
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

    if (rawPin.externalWms) {
      const {
        url,
        layerName,
        layerTitle,
        layerAbstract,
        legendUrl,
        tileUrl,
        tileSize,
        type,
        serverName,
        version,
        format,
        infoFormat,
        queryable,
        time,
        style,
      } = rawPin.externalWms;

      // A corrupted or partial cache entry (e.g. `externalWms: {}`) is truthy but has no url/layer,
      // which would dispatch setActiveExternalLayer with an undefined serverId. Bail out instead.
      if (!url || !layerName) {
        return;
      }

      // Reuse an existing server entry with the same URL to avoid duplicates in the list. Read the
      // live store (not props): props are a render-time snapshot, so a rapid second press of the
      // same pin would still see no server and add a duplicate. Redux dispatch is synchronous, so
      // the store already reflects the server added by the first press.
      const existingServer = store.getState().externalLayers.servers.find((s) => s.url === url);

      let serverId;
      if (existingServer) {
        serverId = existingServer.id;
        // Ensure the saved layer is present in the existing server's layer list so it can be highlighted.
        const alreadyHasLayer = !layerName || existingServer.layers?.some((l) => l.name === layerName);
        if (!alreadyHasLayer) {
          // The pin payload only stores the selected `time`, not the layer's time dimension
          // (timeRanges/timeStart/timeEnd), so this restored layer's calendar shows no highlighted
          // available dates until the background capabilities refresh (below) repopulates them.
          const mergedLayers = [
            ...(existingServer.layers ?? []),
            {
              id: layerName,
              name: layerName,
              title: layerTitle || layerName,
              abstract: layerAbstract,
              legendUrl,
              tileUrl,
              tileSize,
              queryable,
            },
          ];
          store.dispatch(externalLayersSlice.actions.updateServerLayers({ serverId, layers: mergedLayers }));
        }
      } else {
        serverId = uuid();
        store.dispatch(
          externalLayersSlice.actions.addExternalServer({
            id: serverId,
            name: serverName,
            url,
            type,
            version,
            format,
            infoFormat,
            addedAt: new Date().toISOString(),
            layers: layerName
              ? [
                  {
                    id: layerName,
                    name: layerName,
                    title: layerTitle || layerName,
                    abstract: layerAbstract,
                    legendUrl,
                    tileUrl,
                    tileSize,
                    queryable,
                  },
                ]
              : [],
          }),
        );
      }

      store.dispatch(
        externalLayersSlice.actions.setActiveExternalLayer({
          serverId,
          layerName,
        }),
      );
      store.dispatch(externalLayersSlice.actions.setActiveExternalLayerTime(time ?? null));
      store.dispatch(externalLayersSlice.actions.setActiveExternalLayerStyle(style ?? null));
      store.dispatch(panelSlice.actions.openPanel(PANEL.WMS));
      const { lat, lng, zoom } = rawPin;
      const { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);
      store.dispatch(mainMapSlice.actions.setPosition({ lat: parsedLat, lng: parsedLng, zoom: parsedZoom }));
      store.dispatch(visualizationSlice.actions.reset());
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));

      // Fetch full capabilities in background so the layer list shows all available layers. Skipped
      // only when the server already has its layers cached — a freshly added server, or an existing
      // one whose layers haven't been lazy-loaded yet, both need this.
      if (!existingServer || !existingServer.layers?.length) {
        fetchServerCapabilities({ id: serverId, url, type }, store.dispatch).then((outcome) => {
          if (outcome.error) {
            console.warn('[ExternalLayers] Background capabilities refresh failed', outcome.error);
          }
        });
      }

      return;
    }

    if (!rawPin.datasetId && !rawPin.visualizationUrl) {
      store.dispatch(
        notificationSlice.actions.displayError(
          t`This pin cannot be restored — it was saved before the layer URL was recorded.`,
        ),
      );
      return;
    }

    if (!themeId) {
      store.dispatch(notificationSlice.actions.displayError('Pin is invalid: themeId is not defined.'));
      return;
    }

    // since we are setting a new theme and changing map state we should reset search results
    this.props.resetSearch();
    store.dispatch(visualizationSlice.actions.reset());
    this.props.setShowPinPanel(false);

    // Guard against races: if the user clicks a second pin before this fetch completes,
    // the newer call increments _pinSelectId and this one bails out after the await.
    const selectId = (this._pinSelectId = (this._pinSelectId || 0) + 1);

    const resolvedEvalscript = await resolveEvalscript(evalscript, evalscriptUrl);

    if (selectId !== this._pinSelectId) {
      return;
    }

    // Calculate visualization params and time-related values after reset.
    let pinTimeFrom, pinTimeTo;
    const dataSourceHandler = getDataSourceHandler(datasetId);
    const supportsTimeRange = dataSourceHandler ? dataSourceHandler.supportsTimeRange() : true;
    if (supportsTimeRange) {
      pinTimeFrom = fromTime ? moment.utc(fromTime) : moment.utc(toTime).startOf('day');
      pinTimeTo = fromTime ? moment.utc(toTime) : moment.utc(toTime).endOf('day');
    } else {
      pinTimeTo = moment.utc(toTime);
    }

    // Infer TIME RANGE for legacy pins saved without dateMode: if fromTime and toTime are
    // on different calendar days, the pin was saved as a time range visualization.
    const effectiveDateMode =
      dateMode ||
      (fromTime && toTime && !moment.utc(fromTime).isSame(moment.utc(toTime), 'day')
        ? DATE_MODES['TIME RANGE'].value
        : undefined);

    const hasEvalscript = !!(resolvedEvalscript || evalscriptUrl);
    const hasProcessGraph = !!(processGraph || processGraphUrl);

    // Determine selectedProcessing following the decision order:
    // 1. Custom evalscript → PROCESS_API
    // 2. ProcessGraph → OPENEO
    // 3. Saved preference
    // 4. OpenEO support (only if no custom code)
    let selectedProcessing;
    if (hasEvalscript) {
      selectedProcessing = PROCESSING_OPTIONS.PROCESS_API;
    } else if (hasProcessGraph) {
      selectedProcessing = PROCESSING_OPTIONS.OPENEO;
    } else {
      // Only check OpenEO support if no custom code is present
      const supportsOpenEo = isOpenEoSupported(
        getVisualizationUrl(pin),
        layerId,
        IMAGE_FORMATS.PNG,
        false, // no evalscript at this point
      );
      selectedProcessing =
        pinSelectedProcessing ||
        (supportsOpenEo ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API);
    }

    let visualizationParams = {
      datasetId: datasetId,
      visualizationUrl: getVisualizationUrl(pin),
      fromTime: pinTimeFrom,
      toTime: pinTimeTo,
      ...(effectiveDateMode ? { dateMode: effectiveDateMode } : {}),
      visibleOnMap: true,
      dataFusion: dataFusion,
      selectedProcessing: selectedProcessing,
    };

    if (hasEvalscript) {
      visualizationParams.evalscript = resolvedEvalscript;
      visualizationParams.evalscriptUrl = evalscriptUrl;
      visualizationParams.customSelected = true;
      visualizationParams.processGraph = '';
      visualizationParams.processGraphUrl = null;
    } else if (hasProcessGraph) {
      visualizationParams.processGraph = processGraph;
      visualizationParams.processGraphUrl = processGraphUrl;
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

    const modeFromPinThemeId = MODES.find((m) => m.themes.find((t) => t.id === themeId));
    let selectedModeId = this.props.selectedModeId;
    let selectedThemesListId = this.props.selectedThemesListId;

    if (
      this.props.urlThemesList.find((t) => t.id === themeId) &&
      this.props.selectedModeId !== DEFAULT_MODE.id
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

    // If the themeId doesn't exist in any known theme list (e.g. pins saved from highlights
    // may have themeId 'HIGHLIGHT' which is not a real theme), fall back to the default theme
    // to avoid "Selected themeId does not exist!" errors in ThemesProvider.
    const allKnownThemes = [
      ...this.props.modeThemesList,
      ...this.props.urlThemesList,
      ...this.props.userInstancesThemesList,
    ];
    const resolvedThemeId = allKnownThemes.some((t) => t.id === themeId) ? themeId : DEFAULT_THEME_ID;

    store.dispatch(
      themesSlice.actions.setSelectedThemeIdAndModeId({
        selectedThemeId: resolvedThemeId,
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
      saveLocalPins(pins, true);
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
    if (!shouldUsePinsBackend(this.props.user)) {
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
    return (a.item.datasetId || '').localeCompare(b.item.datasetId || '');
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
