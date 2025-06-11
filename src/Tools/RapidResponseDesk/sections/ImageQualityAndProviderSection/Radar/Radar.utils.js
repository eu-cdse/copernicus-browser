import {
  AttributeInstrumentModesValuesRRD,
  AttributePolarisationChannelsValuesRRD,
} from '../../../../../api/RRD/assets/attributes';
import { ProviderModeSupport } from '../../../rapidResponseProperties';
import {
  AirbusLogo,
  CosmoSkymedLogo,
  CosmoSkymedSecondGenLogo,
  HISDESATLogo,
  IceyeLogo,
  RadarSatLogo,
} from '../logos';

const radarProvidersCollection = [
  {
    id: 'airbus',
    label: 'Airbus',
    missions: [
      {
        id: 1,
        name: 'TerraSAR-X/TanDEM-X',
        stacConstellation: ['TerraSAR-X/TanDEM-X'],
        stacPlatform: ['TDX-1', 'TSX-1'],
        taskName: 'Radar Constellation',
        taskingSupported: true,
        archiveSupported: true,
        label: 'TerraSAR-X/TanDEM-X',
        description: {
          body: "Flying in close formation, the objective of the TerraSAR-X and TanDEM-X satellites is to simultaneously image Earth's terrain from different angles with unprecedented accuracy for research and development purposes as well as scientific and commercial applications.",
          footer: '',
        },
        instruments: [
          AttributeInstrumentModesValuesRRD.SAR_ST_S,
          AttributeInstrumentModesValuesRRD.SAR_HS_S_300,
          AttributeInstrumentModesValuesRRD.SAR_SM_S,
          AttributeInstrumentModesValuesRRD.SAR_SM_D,
          AttributeInstrumentModesValuesRRD.SAR_SC_S,
          AttributeInstrumentModesValuesRRD.SAR_WS_S,
        ],
        propertyType: ['MGD', 'GEC', 'EEC'],
        logo: AirbusLogo,
      },
    ],
    active: true,
  },
  {
    id: 'HISDESAT',
    label: 'HISDESAT',
    missions: [
      {
        id: 15,
        name: 'PAZ',
        stacConstellation: ['PAZ'],
        stacPlatform: ['PAZ-1'],
        taskName: 'PAZ',
        taskingSupported: true,
        archiveSupported: true,
        label: 'PAZ',
        description: {
          body: 'The objective of the PAZ mission is to provide imagery for both civilian and security and defence requirements.',
          footer: '',
        },
        instruments: [
          AttributeInstrumentModesValuesRRD.SAR_ST_S,
          AttributeInstrumentModesValuesRRD.SAR_HS_S_300,
          AttributeInstrumentModesValuesRRD.SAR_HS_D_150,
          AttributeInstrumentModesValuesRRD.SAR_SM_S,
          AttributeInstrumentModesValuesRRD.SAR_SM_D,
          AttributeInstrumentModesValuesRRD.SAR_SC_S,
          AttributeInstrumentModesValuesRRD.SAR_WS_S,
        ],
        logo: HISDESATLogo,
      },
    ],
    active: true,
  },
  {
    id: 'e-geos',
    label: 'e-GEOS',
    missions: [
      {
        id: 3,
        name: 'COSMO SkyMed 1st Gen',
        stacConstellation: ['COSMO-SkyMed (I Generation)'],
        stacPlatform: ['CSK1', 'CSK2', 'CSK3', 'CSK4'],
        label: 'COSMO SkyMed 1st Gen',
        taskingSupported: true,
        archiveSupported: true,
        description: {
          body: 'The COSMO-SkyMed objectives are to provide global Earth observation that can be repeated several times a day in all-weather conditions. The imagery obtained can be applied to both military and civil needs, providing defence, security assurance, seismic hazard analysis, environmental disaster monitoring and agricultural mapping.',
          footer: '',
        },
        instruments: [
          AttributeInstrumentModesValuesRRD.Spotlight_2,
          AttributeInstrumentModesValuesRRD.StripMap_HIMAGE,
          AttributeInstrumentModesValuesRRD.PingPong,
          AttributeInstrumentModesValuesRRD.ScanSAR_Wide,
          AttributeInstrumentModesValuesRRD.ScanSAR_Huge,
        ],
        logo: CosmoSkymedLogo,
      },
      {
        id: 4,
        name: 'COSMO SkyMed 2nd Gen',
        stacConstellation: ['COSMO-SkyMed (II Generation)'],
        stacPlatform: ['CSG1', 'CSG2'],
        label: 'COSMO SkyMed 2nd Gen',
        taskingSupported: true,
        archiveSupported: true,
        description: {
          body: 'The COSMO-SkyMed objectives are to provide global Earth observation that can be repeated several times a day in all-weather conditions. The imagery obtained can be applied to both military and civil needs, providing defence, security assurance, seismic hazard analysis, environmental disaster monitoring and agricultural mapping.',
          footer: '',
        },
        instruments: [
          AttributeInstrumentModesValuesRRD.Spotlight_2B,
          AttributeInstrumentModesValuesRRD.Spotlight_2C,
          AttributeInstrumentModesValuesRRD.Spotlight_OQS,
          AttributeInstrumentModesValuesRRD.StripMap,
          AttributeInstrumentModesValuesRRD.Quadpol,
          AttributeInstrumentModesValuesRRD.PingPong,
          AttributeInstrumentModesValuesRRD.ScanSAR_1,
          AttributeInstrumentModesValuesRRD.ScanSAR_2,
        ],
        logo: CosmoSkymedSecondGenLogo,
      },
    ],
    active: true,
  },
  {
    id: 'iceye',
    label: 'ICEYE',
    missions: [
      {
        id: 10,
        name: 'ICEYE',
        label: 'ICEYE',
        stacConstellation: ['ICEYE'],
        stacPlatform: ['ICEYE-X'],
        taskingSupported: true,
        archiveSupported: true,
        description: {
          body: "ICEYE's overall mission objective is to enable better decision making by providing timely and reliable Earth observation data.",
          footer: '',
        },
        instruments: [
          AttributeInstrumentModesValuesRRD.spotlight_extended_dwell,
          AttributeInstrumentModesValuesRRD.spotlight,
          AttributeInstrumentModesValuesRRD.stripmap,
          AttributeInstrumentModesValuesRRD.scan,
        ],
        logo: IceyeLogo,
      },
    ],
    active: false,
  },
  {
    id: 'mda',
    label: 'MDA',
    missions: [
      {
        id: 13,
        name: 'RADARSAT-2',
        label: 'RADARSAT-2',
        stacConstellation: ['RADARSAT'],
        stacPlatform: ['RS02'],
        taskingSupported: true,
        archiveSupported: true,
        description: {
          body: 'The aim of the RADARSAT missions is provide useful information to both commercial and scientific users in such fields as disaster management, interferometry, agriculture, cartography, hydrology, forestry, oceanography, ice studies and coastal monitoring.',
          footer: '',
        },
        instruments: [
          AttributeInstrumentModesValuesRRD.Wide_Ultrafine,
          AttributeInstrumentModesValuesRRD.Wide_Multi_Look_Fine,
          AttributeInstrumentModesValuesRRD.Wide,
          AttributeInstrumentModesValuesRRD.ScanSAR_Wide,
          AttributeInstrumentModesValuesRRD.Ultrafine,
          AttributeInstrumentModesValuesRRD.Multi_Look_Fine,
        ],
        logo: RadarSatLogo,
      },
    ],
    active: true,
  },
];

export const getActiveRadarProviders = () => {
  return radarProvidersCollection.filter((provider) => provider.active);
};

export const getTaskingFilteredRadarProviders = () => {
  return getActiveRadarProviders().map((provider) => ({
    ...provider,
    missions: provider.missions.map((mission) => ({
      ...mission,
      instruments: mission.instruments.filter(
        (inst) =>
          inst !== AttributeInstrumentModesValuesRRD.Ultrafine &&
          inst !== AttributeInstrumentModesValuesRRD.Multi_Look_Fine,
      ),
    })),
  }));
};

export const getPolarizationFilterOptions = (isTaskingEnabled) => {
  const allPolarizationChannels = Object.values(AttributePolarisationChannelsValuesRRD);
  return allPolarizationChannels.filter((channel) => {
    if (isTaskingEnabled) {
      return channel.mode && channel.mode.includes(ProviderModeSupport.tasking);
    } else {
      return channel.mode && channel.mode.includes(ProviderModeSupport.archive);
    }
  });
};
