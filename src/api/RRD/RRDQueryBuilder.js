import { boundsToPolygon } from '../../utils/geojson.utils';
import { RRD_DATEFORMAT, RRD_RESOLUTION_CLASSES } from './assets/rrd.utils';
import moment from 'moment/moment';
import {
  ADVANCED_PROPERTY_FILTERS,
  InstructionNamesRRD,
  ProviderImageTypes,
  ProviderModeSupport,
} from '../../Tools/RapidResponseDesk/rapidResponseProperties';
import { AttributeOrbitDirectionValues } from '../OData/assets/attributes';
import { getRrdCollectionId } from './api.utils';

function filterPropertySupportsSensorType(filterName, sensorType) {
  return ADVANCED_PROPERTY_FILTERS[filterName].sensorType.includes(sensorType);
}

function filterPropertySupportsMode(filterName, isTaskingEnabled) {
  const mode = isTaskingEnabled ? ProviderModeSupport.tasking : ProviderModeSupport.archive;
  return ADVANCED_PROPERTY_FILTERS[filterName].modeSupport.includes(mode);
}

export class RRDQueryBuilder {
  constructor(...storeStates) {
    [
      this.latestAoiStoreState,
      this.latestMapBoundsStoreState,
      this.latestAreaAndTimeSectionStoreState,
      this.latestProviderSectionStoreState,
      this.latestAdvancedSectionState,
      this.latestResultsSectionState,
      this.isTaskingEnabled,
    ] = storeStates;
  }

  _getOrbitDirection() {
    const orbitDirection = this.latestProviderSectionStoreState.radarOrbitDirectionArray;
    return orbitDirection.length === 1 ? orbitDirection[0].value : 'Any';
  }

  _getDateTime(timespanArray) {
    return `${moment(timespanArray.from).utc(false).format(RRD_DATEFORMAT)}/${moment(timespanArray.to)
      .utc(false)
      .format(RRD_DATEFORMAT)}`;
  }

  _getCollections() {
    let collections = [];
    this.latestProviderSectionStoreState.selectedOpticalProvidersAndMissions.forEach(
      (provider) =>
        (collections = collections.concat(
          provider.missions
            .filter(
              (mission) =>
                (this.isTaskingEnabled && mission.taskingSupported) ||
                (!this.isTaskingEnabled && mission.archiveSupported),
            )
            .map((mission) => mission.id),
        )),
    );
    this.latestProviderSectionStoreState.selectedRadarProvidersAndMissions.forEach(
      (provider) =>
        (collections = collections.concat(
          provider.missions
            .filter(
              (mission) =>
                (this.isTaskingEnabled && mission.taskingSupported) ||
                (!this.isTaskingEnabled && mission.archiveSupported),
            )
            .map((mission) => mission.id),
        )),
    );
    return collections;
  }

  _generateCorrectFilterPropertyFromValuesArray(property, values) {
    if (values.length > 1) {
      return {
        op: 'in',
        args: [{ property: property }, values],
      };
    } else {
      return {
        op: '=',
        args: [{ property: property }, values[0]],
      };
    }
  }

  _generateSarFilter() {
    const generateArguments = () => {
      let conditions = [];

      const polarizationArray = this.latestProviderSectionStoreState.radarPolarizationFilterArray.map(
        (polarization) => polarization.value,
      );

      // polarization filters
      if (polarizationArray.length > 0) {
        conditions.push(
          this._generateCorrectFilterPropertyFromValuesArray(
            InstructionNamesRRD.Polarizations,
            polarizationArray,
          ),
        );
      }

      const instrumentArray = this.latestProviderSectionStoreState.radarInstrumentFilterArray.map(
        (instrument) => instrument.value,
      );

      // instrument filters
      if (instrumentArray.length > 0) {
        conditions.push(
          this._generateCorrectFilterPropertyFromValuesArray(
            InstructionNamesRRD.InstrumentMode,
            instrumentArray,
          ),
        );
      }

      const orbitArray = this.latestProviderSectionStoreState.radarOrbitDirectionArray.map((orbit) =>
        orbit.label.toLowerCase(),
      );

      if (orbitArray.length > 0) {
        if (orbitArray.length === Object.keys(AttributeOrbitDirectionValues).length) {
          conditions.push({
            op: '=',
            args: [{ property: InstructionNamesRRD.OrbitState }, 'All'],
          });
        } else {
          conditions.push({
            op: '=',
            args: [{ property: InstructionNamesRRD.OrbitState }, orbitArray[0]],
          });
        }
      }

      return conditions;
    };

    if (this.latestProviderSectionStoreState.selectedRadarProvidersAndMissions.length > 0) {
      return generateArguments();
    } else {
      return [];
    }
  }

  _generateOpticalFilter() {
    let conditions = [];
    if (this.latestProviderSectionStoreState.imageType === ProviderImageTypes.optical) {
      conditions.push({
        op: '<=',
        args: [
          { property: InstructionNamesRRD.CloudCover },
          this.latestProviderSectionStoreState.cloudCoverage * 100,
        ],
      });
    }

    return conditions;
  }

  _generateAdvancedFilter() {
    const getAllResolutionClasses = () => {
      const resolution = this.latestProviderSectionStoreState.imageResolution;
      const resolutionKeys = Object.keys(RRD_RESOLUTION_CLASSES).map(Number);

      if (this.isTaskingEnabled) {
        const closestKey = resolutionKeys.find((key) => key >= resolution);
        return closestKey ? [RRD_RESOLUTION_CLASSES[closestKey]] : [];
      }

      const [minResolution, maxResolution] = resolution;
      const matchingKeys = resolutionKeys.filter((key) => key >= minResolution && key <= maxResolution);
      return matchingKeys.map((key) => RRD_RESOLUTION_CLASSES[key]);
    };

    const generateArguments = () => {
      let conditions = [];

      if (
        filterPropertySupportsSensorType(
          InstructionNamesRRD.Azimuth,
          this.latestProviderSectionStoreState.imageType,
        ) &&
        filterPropertySupportsMode(InstructionNamesRRD.Azimuth, this.isTaskingEnabled)
      ) {
        conditions.push({
          op: '>=',
          args: [{ property: InstructionNamesRRD.Azimuth }, this.latestAdvancedSectionState.azimuth[0]],
        });
        conditions.push({
          op: '<=',
          args: [{ property: InstructionNamesRRD.Azimuth }, this.latestAdvancedSectionState.azimuth[1]],
        });
      }

      if (filterPropertySupportsMode(InstructionNamesRRD.SunAzimuth, this.isTaskingEnabled)) {
        if (
          filterPropertySupportsSensorType(
            InstructionNamesRRD.SunAzimuth,
            this.latestProviderSectionStoreState.imageType,
          )
        ) {
          conditions.push({
            op: '>=',
            args: [
              { property: InstructionNamesRRD.SunAzimuth },
              this.latestAdvancedSectionState.sunAzimuth[0],
            ],
          });
          conditions.push({
            op: '<=',
            args: [
              { property: InstructionNamesRRD.SunAzimuth },
              this.latestAdvancedSectionState.sunAzimuth[1],
            ],
          });
        }
      }

      if (
        filterPropertySupportsSensorType(
          InstructionNamesRRD.SunElevation,
          this.latestProviderSectionStoreState.imageType,
        ) &&
        filterPropertySupportsMode(InstructionNamesRRD.SunElevation, this.isTaskingEnabled)
      ) {
        conditions.push({
          op: '>=',
          args: [
            { property: InstructionNamesRRD.SunElevation },
            this.latestAdvancedSectionState.sunElevation[0],
          ],
        });
        conditions.push({
          op: '<=',
          args: [
            { property: InstructionNamesRRD.SunElevation },
            this.latestAdvancedSectionState.sunElevation[1],
          ],
        });
      }

      if (
        filterPropertySupportsSensorType(
          InstructionNamesRRD.IncidenceAngle,
          this.latestProviderSectionStoreState.imageType,
        ) &&
        filterPropertySupportsMode(InstructionNamesRRD.IncidenceAngle, this.isTaskingEnabled)
      ) {
        conditions.push({
          op: '>=',
          args: [
            { property: InstructionNamesRRD.IncidenceAngle },
            this.latestAdvancedSectionState.incidenceAngle[0],
          ],
        });
        conditions.push({
          op: '<=',
          args: [
            { property: InstructionNamesRRD.IncidenceAngle },
            this.latestAdvancedSectionState.incidenceAngle[1],
          ],
        });
      }

      conditions.push({
        op: '>=',
        args: [
          {
            property: InstructionNamesRRD.AOICover,
          },
          100 - this.latestAdvancedSectionState.aoiCoverage * 100,
        ],
      });

      const resolutionClasses = getAllResolutionClasses();
      if (resolutionClasses.length > 0) {
        conditions.push(
          this.isTaskingEnabled
            ? {
                op: '=',
                args: [{ property: InstructionNamesRRD.ResolutionClass }, resolutionClasses.at(-1)],
              }
            : this._generateCorrectFilterPropertyFromValuesArray(
                InstructionNamesRRD.ResolutionClass,
                resolutionClasses,
              ),
        );
      }

      return conditions;
    };

    return generateArguments();
  }

  _generateTaskingFilter() {
    let conditions = [];

    conditions.push({
      op: '=',
      args: [{ property: 'taskingUseCase' }, 'UC3'],
    });

    return conditions;
  }

  createSearchRequestBody() {
    const generateSearchRequestsBody = (dateTime) => {
      const collections = this._getCollections();

      if (collections.length === 0) {
        return null;
      }

      let combinedFilter = [];
      let sarFilter = this._generateSarFilter();
      let opticalFilter = this._generateOpticalFilter();
      let advancedFilter = this._generateAdvancedFilter();

      combinedFilter = [...sarFilter, ...opticalFilter, ...advancedFilter];

      if (this.isTaskingEnabled) {
        let taskingFilter = this._generateTaskingFilter();
        combinedFilter = [...combinedFilter, ...taskingFilter];
      }

      if (this.latestProviderSectionStoreState.imageType === ProviderImageTypes.radar) {
        const requiredFields = [InstructionNamesRRD.Polarizations, InstructionNamesRRD.InstrumentMode];

        const filterProperties = combinedFilter.map((filter) => filter.args[0].property);
        const missingFields = requiredFields.filter((field) => !filterProperties.includes(field));

        if (missingFields.length > 0) {
          console.error(`Missing required fields in the search request body: ${missingFields.join(', ')}`);
          throw new Error(`Missing required fields in the search request body: ${missingFields.join(', ')}`);
        }
      }

      const intersects = this.latestAoiStoreState.geometry ?? boundsToPolygon(this.latestMapBoundsStoreState);
      const datetime = this._getDateTime(dateTime);

      return {
        collections: collections,
        filter: {
          op: 'and',
          args: combinedFilter,
        },
        intersects: intersects,
        datetime: datetime,
      };
    };

    let searchRequestBody = [];
    for (let timeSpan of this.latestAreaAndTimeSectionStoreState.timespanArray) {
      // only tasking
      if (moment().isBefore(moment(timeSpan.from))) {
        searchRequestBody.push(generateSearchRequestsBody(timeSpan, true));
      }
      // both tasking and rolling/ccme
      // else if (moment().isAfter(moment(timeSpan.from)) && moment().isBefore(moment(timeSpan.to))) {
      //   searchRequestBody = searchRequestBody.concat([
      //     generateSearchRequestsBody({ from: timeSpan.from, to: moment().startOf('day') }),
      //     generateSearchRequestsBody({ from: moment().endOf('day'), to: timeSpan.to }, true),
      //   ]);
      // }
      // only rolling/ccmes
      else {
        searchRequestBody.push(generateSearchRequestsBody(timeSpan));
      }
    }
    return searchRequestBody;
  }

  createAddToCartRequestBody(item) {
    const currentFiltersForSearch = this.latestResultsSectionState.filtersForSearch.at(0);
    const collectionId = getRrdCollectionId(
      item.properties.constellation,
      item.properties.platform,
      this.isTaskingEnabled,
    );

    return {
      request: currentFiltersForSearch,
      order_type: this.isTaskingEnabled ? ProviderModeSupport.tasking : ProviderModeSupport.archive,
      collections: [
        {
          collection_id: collectionId,
          items: [item],
          product_options: [],
          source: 'MANUAL',
        },
      ],
    };
  }

  //TODO: this needs to adjusted
  createRemoveFromCartRequestBody(item, cartResults) {
    let quoteItemId = -1,
      sceneId = -1;

    for (let product of cartResults.quote.products) {
      const scene = product.scenes.find((scene) => scene.item.id === item.id);

      if (scene) {
        sceneId = scene.scene_id;
        quoteItemId = product.quote_item_id;
      }
    }

    if (quoteItemId === -1 && sceneId === -1) {
      throw new Error('Scene does not exists');
    }

    return {
      quote_item: quoteItemId,
      scene_ids: [sceneId],
    };
  }

  // ... add additional queries
}
