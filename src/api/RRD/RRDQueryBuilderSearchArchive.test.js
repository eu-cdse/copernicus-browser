import moment from 'moment';
import {
  InstructionNamesRRD,
  ProviderImageTypes,
} from '../../Tools/RapidResponseDesk/rapidResponseProperties';
import { getActiveOpticalProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Optical/Optical.utils';
import { RRDQueryBuilder } from './RRDQueryBuilder';
import { getActiveRadarProviders } from '../../Tools/RapidResponseDesk/sections/ImageQualityAndProviderSection/Radar/Radar.utils';

describe('RRD Search Query builder - Archive', () => {
  const opticalProvidersCollection = getActiveOpticalProviders();
  const radarProvidersCollection = getActiveRadarProviders();

  const selectedOpticalProvidersAndMissions = opticalProvidersCollection.at(0);
  const selectedRadarProvidersAndMissions = radarProvidersCollection.at(0);

  let mainMap = {
    bounds: {
      _southWest: { lat: 28.497660832963472, lng: -12.436523437500002 },
      _northEast: { lat: 65.10914820386476, lng: 53.96484375000001 },
    },
  };

  let aoi = { geometry: null };

  let areaAndTimeSection = {
    timespanArray: [
      {
        from: moment('2024-10-22T00:00:00.000Z').toISOString(),
        to: moment('2024-11-21T23:59:59.999Z').utc(false).toISOString(),
      },
    ],
  };

  let imageQualityAndProviderSection;

  let advancedSection = {
    aoiCoverage: 0.3,
    satelliteAzimuth: [0, 360],
    azimuth: [0, 360],
    sunAzimuth: [0, 360],
    sunElevation: [0, 90],
    productType: [],
    incidenceAngle: [0, 90],
  };

  const defaultDate = '2024-10-22T00:00:00.000Z/2024-11-21T23:59:59.999Z';

  const isTaskingEnabled = false;

  const createFilter = (property, operation, value) => ({ op: operation, args: [{ property }, value] });

  const createQueryBody = (collection, filters, intersects, date) => {
    return {
      collections: collection,
      filter: {
        op: 'and',
        args: filters,
      },
      intersects: intersects,
      datetime: date,
    };
  };

  const defaultAOIMapBounds = {
    type: 'Polygon',
    coordinates: [
      [
        [11.45874, 48.275882],
        [11.45874, 49.253465],
        [13.161621, 49.253465],
        [13.161621, 48.275882],
        [11.45874, 48.275882],
      ],
    ],
  };

  const defaultMapBounnds = {
    type: 'Polygon',
    coordinates: [
      [
        [-12.436523437500002, 28.497660832963472],
        [53.96484375000001, 28.497660832963472],
        [53.96484375000001, 65.10914820386476],
        [-12.436523437500002, 65.10914820386476],
        [-12.436523437500002, 28.497660832963472],
      ],
    ],
  };

  beforeEach(() => {
    imageQualityAndProviderSection = {
      imageType: ProviderImageTypes.optical,
      imageResolution: [0, 20],
      cloudCoverage: 0.3,
      selectedOpticalProvidersAndMissions: [],
      selectedRadarProvidersAndMissions: [],
      selectedAtmosProvidersAndMissions: [],
      radarPolarizationFilterArray: [],
      radarInstrumentFilterArray: [],
      radarOrbitDirectionArray: [],
    };
  });

  describe('Optical', () => {
    it('Create a search query body for archive search with optical and without aoi', () => {
      imageQualityAndProviderSection.selectedOpticalProvidersAndMissions = [
        selectedOpticalProvidersAndMissions,
      ];

      const searchRequestBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        areaAndTimeSection,
        imageQualityAndProviderSection,
        advancedSection,
        undefined,
        isTaskingEnabled,
      ).createSearchRequestBody();

      const filters = [
        createFilter(InstructionNamesRRD.CloudCover, '<=', 30),
        createFilter(InstructionNamesRRD.Azimuth, '>=', 0),
        createFilter(InstructionNamesRRD.Azimuth, '<=', 360),
        createFilter(InstructionNamesRRD.SunAzimuth, '>=', 0),
        createFilter(InstructionNamesRRD.SunAzimuth, '<=', 360),
        createFilter(InstructionNamesRRD.SunElevation, '>=', 0),
        createFilter(InstructionNamesRRD.SunElevation, '<=', 90),
        createFilter(InstructionNamesRRD.IncidenceAngle, '>=', 0),
        createFilter(InstructionNamesRRD.IncidenceAngle, '<=', 90),
        createFilter(InstructionNamesRRD.AOICover, '>=', 70),
        createFilter(InstructionNamesRRD.ResolutionClass, 'in', ['VHR1a', 'VHR1b']),
      ];

      const expectedSearchArchiveQueryBodyOptical = createQueryBody(
        [2],
        filters,
        defaultMapBounnds,
        defaultDate,
      );
      expect(searchRequestBody).toEqual([expectedSearchArchiveQueryBodyOptical]);
    });

    it('Create a search query body with aoi', () => {
      imageQualityAndProviderSection.selectedOpticalProvidersAndMissions = [
        selectedOpticalProvidersAndMissions,
      ];
      const searchRequestBody = new RRDQueryBuilder(
        { geometry: defaultAOIMapBounds },
        mainMap.bounds,
        areaAndTimeSection,
        imageQualityAndProviderSection,
        advancedSection,
        undefined,
        isTaskingEnabled,
      ).createSearchRequestBody()[0];
      expect(searchRequestBody.intersects).toEqual(defaultAOIMapBounds);
      aoi = {
        geometry: null,
      };
    });
  });

  describe('Radar', () => {
    const commonRadarFilters = [
      createFilter(InstructionNamesRRD.Azimuth, '>=', 0),
      createFilter(InstructionNamesRRD.Azimuth, '<=', 360),
      createFilter(InstructionNamesRRD.IncidenceAngle, '>=', 0),
      createFilter(InstructionNamesRRD.IncidenceAngle, '<=', 90),
      createFilter(InstructionNamesRRD.AOICover, '>=', 70),
      createFilter(InstructionNamesRRD.ResolutionClass, 'in', ['VHR1a', 'VHR1b']),
    ];

    it('Create a search query for tasking search with radar', () => {
      imageQualityAndProviderSection.imageType = ProviderImageTypes.radar;
      imageQualityAndProviderSection.selectedRadarProvidersAndMissions = [selectedRadarProvidersAndMissions];
      imageQualityAndProviderSection.radarPolarizationFilterArray = [{ value: 'HH', label: 'HH' }];
      imageQualityAndProviderSection.radarInstrumentFilterArray = [{ value: 'SAR_ST_S', label: 'SAR_ST_S' }];

      const filters = [
        createFilter(InstructionNamesRRD.Polarizations, '=', 'HH'),
        createFilter(InstructionNamesRRD.InstrumentMode, '=', 'SAR_ST_S'),
        ...commonRadarFilters,
      ];

      const expectedSearchArchiveQueryBodyRadar = createQueryBody(
        [1],
        filters,
        defaultMapBounnds,
        defaultDate,
      );

      const searchRequestBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        areaAndTimeSection,
        imageQualityAndProviderSection,
        advancedSection,
        undefined,
        isTaskingEnabled,
      ).createSearchRequestBody();

      expect(searchRequestBody).toEqual([expectedSearchArchiveQueryBodyRadar]);
    });

    it('Create a search query body with multi polarization', () => {
      imageQualityAndProviderSection.imageType = ProviderImageTypes.radar;
      imageQualityAndProviderSection.selectedRadarProvidersAndMissions = [selectedRadarProvidersAndMissions];
      imageQualityAndProviderSection.radarPolarizationFilterArray = [
        { value: 'HH', label: 'HH' },
        { value: 'HV', label: 'HV' },
      ];
      imageQualityAndProviderSection.radarInstrumentFilterArray = [{ value: 'SAR_ST_S', label: 'SAR_ST_S' }];
      const filters = [
        createFilter(InstructionNamesRRD.Polarizations, 'in', ['HH', 'HV']),
        createFilter(InstructionNamesRRD.InstrumentMode, '=', 'SAR_ST_S'),
        ...commonRadarFilters,
      ];

      const expectedSearchArchiveQueryBodyRadar = createQueryBody(
        [1],
        filters,
        defaultMapBounnds,
        defaultDate,
      );

      const searchRequestBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        areaAndTimeSection,
        imageQualityAndProviderSection,
        advancedSection,
        undefined,
        isTaskingEnabled,
      ).createSearchRequestBody()[0];

      expect(searchRequestBody).toEqual(expectedSearchArchiveQueryBodyRadar);
    });

    it('Create a search query body with single orbit', () => {
      imageQualityAndProviderSection.imageType = ProviderImageTypes.radar;
      imageQualityAndProviderSection.selectedRadarProvidersAndMissions = [selectedRadarProvidersAndMissions];
      imageQualityAndProviderSection.radarOrbitDirectionArray = [{ value: 'ascending', label: 'Ascending' }];
      imageQualityAndProviderSection.radarPolarizationFilterArray = [{ value: 'HH', label: 'HH' }];
      imageQualityAndProviderSection.radarInstrumentFilterArray = [{ value: 'SAR_ST_S', label: 'SAR_ST_S' }];

      const filters = [
        createFilter(InstructionNamesRRD.Polarizations, '=', 'HH'),
        createFilter(InstructionNamesRRD.InstrumentMode, '=', 'SAR_ST_S'),
        createFilter(InstructionNamesRRD.OrbitState, '=', 'ascending'),
        ...commonRadarFilters,
      ];

      const expectedSearchArchiveQueryBodyRadar = createQueryBody(
        [1],
        filters,
        defaultMapBounnds,
        defaultDate,
      );

      const searchRequestBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        areaAndTimeSection,
        imageQualityAndProviderSection,
        advancedSection,
        undefined,
        isTaskingEnabled,
      ).createSearchRequestBody();
      expect(searchRequestBody).toEqual([expectedSearchArchiveQueryBodyRadar]);
    });

    it('Create a search query body with multi orbit', () => {
      imageQualityAndProviderSection.imageType = ProviderImageTypes.radar;
      imageQualityAndProviderSection.selectedRadarProvidersAndMissions = [selectedRadarProvidersAndMissions];
      imageQualityAndProviderSection.radarOrbitDirectionArray = [
        { value: 'ascending', label: 'Ascending' },
        { value: 'descending', label: 'Descending' },
      ];
      imageQualityAndProviderSection.radarPolarizationFilterArray = [{ value: 'HH', label: 'HH' }];
      imageQualityAndProviderSection.radarInstrumentFilterArray = [{ value: 'SAR_ST_S', label: 'SAR_ST_S' }];

      const filters = [
        createFilter(InstructionNamesRRD.Polarizations, '=', 'HH'),
        createFilter(InstructionNamesRRD.InstrumentMode, '=', 'SAR_ST_S'),
        createFilter(InstructionNamesRRD.OrbitState, '=', 'all'),
        ...commonRadarFilters,
      ];

      const expectedSearchArchiveQueryBodyRadar = createQueryBody(
        [1],
        filters,
        defaultMapBounnds,
        defaultDate,
      );

      const searchRequestBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        areaAndTimeSection,
        imageQualityAndProviderSection,
        advancedSection,
        undefined,
        isTaskingEnabled,
      ).createSearchRequestBody()[0];

      expect(searchRequestBody).toEqual(expectedSearchArchiveQueryBodyRadar);
    });

    it('Create a search query body with multi instrument mode', () => {
      imageQualityAndProviderSection.imageType = ProviderImageTypes.radar;
      imageQualityAndProviderSection.selectedRadarProvidersAndMissions = [selectedRadarProvidersAndMissions];
      imageQualityAndProviderSection.radarPolarizationFilterArray = [{ value: 'HH', label: 'HH' }];
      imageQualityAndProviderSection.radarInstrumentFilterArray = [
        { value: 'SAR_ST_S', label: 'SAR_ST_S' },
        { value: 'SAR_HS_S_300', label: 'SAR_HS_S_300' },
      ];

      const filters = [
        createFilter(InstructionNamesRRD.Polarizations, '=', 'HH'),
        createFilter(InstructionNamesRRD.InstrumentMode, 'in', ['SAR_ST_S', 'SAR_HS_S_300']),
        ...commonRadarFilters,
      ];

      const expectedSearchArchiveQueryBodyRadar = createQueryBody(
        [1],
        filters,
        defaultMapBounnds,
        defaultDate,
      );

      const searchRequestBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        areaAndTimeSection,
        imageQualityAndProviderSection,
        advancedSection,
        undefined,
        isTaskingEnabled,
      ).createSearchRequestBody()[0];
      expect(searchRequestBody).toEqual(expectedSearchArchiveQueryBodyRadar);
    });
  });
});
