import { t } from 'ttag';
import moment from 'moment';

export const MetadataSourceType = Object.freeze({
  ROLLING: 'ROLLING_ARCHIVE',
  CCMES: 'CCME',
  TASKING: 'TASK',
});

export const ProviderImageTypes = Object.freeze({
  optical: 'optical',
  radar: 'radar',
  atmos: 'atmos',
});

export const SensorModesProperties = [
  {
    label: t`Any`,
    value: 'any',
  },
  {
    label: t`Random`,
    value: 'random',
  },
];

export const ProcessorModesProperties = [
  {
    label: t`Any`,
    value: 'any',
  },
  {
    label: t`Random`,
    value: 'random',
  },
];

export const INPUT_TYPES = Object.freeze({
  SLIDER: 'slider',
  RANGE_SLIDER: 'range_slider',
  CHECKBOX: 'checkbox',
  MULTI_SELECT_CHECKBOX: 'multi_select_checkbox',
});

export const ProviderModeSupport = Object.freeze({
  archive: 'archive',
  tasking: 'tasking',
});

export const ResultsSectionSortProperties = [
  {
    label: t`Sensing time descending`,

    value: (results) => {
      const sortedResults = [...results];
      return sortedResults.sort(
        (a, b) => moment(b.properties.datetime).valueOf() - moment(a.properties.datetime).valueOf(),
      );
    },
  },
  {
    label: t`Sensing time ascending`,
    value: (results) => {
      const sortedResults = [...results];
      return sortedResults.sort(
        (a, b) => moment(a.properties.datetime).valueOf() - moment(b.properties.datetime).valueOf(),
      );
    },
  },
  // {
  //   label: t`Resolution descending`,
  //   value: 'resolutionDescending',
  // },
  // {
  //   label: t`Resolution ascending`,
  //   value: 'resolutionAscending',
  // },
];

const resultsSectionFilterProperties = [
  {
    label: t`All`,
    value: 'all',
    mode: [ProviderModeSupport.archive, ProviderModeSupport.tasking],
  },
  {
    label: t`Rolling archive`,
    value: MetadataSourceType.ROLLING,
    mode: [ProviderModeSupport.archive],
  },
  {
    label: t`CCMEs archive`,
    value: MetadataSourceType.CCMES,
    mode: [ProviderModeSupport.archive],
  },
];

export const getResultsSectionFilterDefaultValue = () => resultsSectionFilterProperties[0].value;

export const getResultsSectionFilterProperties = (isTaskingEnabled) => {
  return resultsSectionFilterProperties.filter((option) =>
    option.mode.includes(isTaskingEnabled ? ProviderModeSupport.tasking : ProviderModeSupport.archive),
  );
};

export const ResolutionSliderMarks = {
  0: {
    value: 0,
    label: '0',
  },
  10: {
    value: 0.5,
    label: '.5m',
  },
  20: {
    value: 1,
    label: '1m',
  },
  40: {
    value: 4,
    label: '4m',
  },
  60: {
    value: 10,
    label: '10m',
  },
  80: {
    value: 30,
    label: '30m',
  },
  100: {
    value: 100,
    label: '100m',
  },
};

export const InstructionNamesRRD = {
  IncidenceAngle: 'view:incidence_angle',
  SunElevation: 'view:sun_elevation',
  Azimuth: 'view:azimuth',
  AOICover: 'aoi_cover',
  SunAzimuth: 'view:sun_azimuth',
  ResolutionClass: 'resolution_class',
  CloudCover: 'eo:cloud_cover',
  OrbitState: 'sat:orbit_state',
  Polarizations: 'sar:polarizations',
  InstrumentMode: 'sar:instrument_mode',
};

export const ADVANCED_PROPERTY_FILTERS = {
  [InstructionNamesRRD.AOICover]: {
    name: t`Minimum AOI coverage`,
    propertyName: InstructionNamesRRD.AOICover,
    min: 0,
    max: 1,
    step: 0.01,
    value: 'aoiCoverage',
    storeAction: 'setAoiCoverage',
    inputType: INPUT_TYPES.SLIDER,
    sensorType: [ProviderImageTypes.optical, ProviderImageTypes.radar],
    modeSupport: [ProviderModeSupport.archive, ProviderModeSupport.tasking],
  },
  [InstructionNamesRRD.Azimuth]: {
    name: t`Azimuth`,
    propertyName: InstructionNamesRRD.Azimuth,
    min: 0,
    max: 360,
    step: 1,
    value: 'azimuth',
    storeAction: 'setAzimuth',
    sensorType: [ProviderImageTypes.optical, ProviderImageTypes.radar],
    modeSupport: [ProviderModeSupport.archive],
    inputType: INPUT_TYPES.RANGE_SLIDER,
    marks: {
      0: {
        value: 0,
        label: '0',
      },
      360: {
        value: 360,
        label: '360',
      },
    },
  },
  [InstructionNamesRRD.SunAzimuth]: {
    name: t`Sun azimuth`,
    propertyName: 'view:sun_azimuth',
    min: 0,
    max: 360,
    step: 1,
    value: 'sunAzimuth',
    storeAction: 'setSunAzimuth',
    sensorType: [ProviderImageTypes.optical],
    modeSupport: [ProviderModeSupport.archive],
    inputType: INPUT_TYPES.RANGE_SLIDER,
    marks: {
      0: {
        value: 0,
        label: '0',
      },
      360: {
        value: 360,
        label: '360',
      },
    },
  },
  [InstructionNamesRRD.SunElevation]: {
    name: t`Sun elevation`,
    propertyName: InstructionNamesRRD.SunElevation,
    min: 0,
    max: 90,
    step: 1,
    value: 'sunElevation',
    storeAction: 'setSunElevation',
    sensorType: [ProviderImageTypes.optical],
    modeSupport: [ProviderModeSupport.archive, ProviderModeSupport.tasking],
    inputType: INPUT_TYPES.RANGE_SLIDER,
    marks: {
      0: {
        value: 0,
        label: '0',
      },
      90: {
        value: 90,
        label: '90',
      },
    },
  },
  [InstructionNamesRRD.IncidenceAngle]: {
    name: t`Incidence angle`,
    propertyName: InstructionNamesRRD.IncidenceAngle,
    min: 0,
    max: 90,
    step: 1,
    value: 'incidenceAngle',
    storeAction: 'setIncidenceAngle',
    sensorType: [ProviderImageTypes.optical, ProviderImageTypes.radar],
    modeSupport: [ProviderModeSupport.archive, ProviderModeSupport.tasking],
    inputType: INPUT_TYPES.RANGE_SLIDER,
    marks: {
      0: {
        value: 0,
        label: '0',
      },
      90: {
        value: 90,
        label: '90',
      },
    },
  },
};

export const RRD_CONSTELLATIONS = {
  AIRBUS_DE: 'TerraSAR-X/TanDEM-X',
  GEOSAT: 'GEOSAT',
  SKYMED_1: 'COSMO-SkyMed (I Generation)',
  SKYMED_2: 'COSMO-SkyMed (II Generation)',
  EUSI: 'EUSI',
  ICEYE: 'ICEYE',
  PLANET_SCOPE: 'planetscope',
  SKYSAT: 'skysat',
  RADARSAT2: 'RADARSAT',
  PAZ: 'PAZ',
  AIRBUS_FE_SPOT: 'SPOT',
  AIRBUS_FE_PLEIADAS: 'PHR',
  AIRBUS_FE_PLEIADAS_NEO: 'PNEO',
  GHGSAT: 'GHGSat',
};

export const ProviderImageOptions = [
  {
    label: t`Optical`,
    value: ProviderImageTypes.optical,
    className: 'uppercase-text',
    searchModes: [ProviderModeSupport.archive, ProviderModeSupport.tasking],
  },
  {
    label: t`Radar`,
    value: ProviderImageTypes.radar,
    className: 'uppercase-text',
    style: { marginLeft: '20px' },
    searchModes: [ProviderModeSupport.archive, ProviderModeSupport.tasking],
  },
  {
    label: t`Atmospheric`,
    value: ProviderImageTypes.atmos,
    className: 'uppercase-text',
    style: { marginLeft: '20px' },
    searchModes: [ProviderModeSupport.archive],
  },
];
