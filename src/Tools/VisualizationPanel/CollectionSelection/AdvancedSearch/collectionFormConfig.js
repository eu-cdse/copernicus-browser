import { hasRole } from '../../../../Auth/authHelpers';
import { FilterElement } from '../../../../api/OData/FilterElement';
import { ODataCollections, ODataFilterOperator } from '../../../../api/OData/ODataTypes';
import {
  AttributeNames,
  AttributeOriginValues,
  AttributeOnlineValues,
  AttributeOperationalModeValues,
  AttributeOrbitDirectionValues,
  AttributePlatformSerialIdentifierValues,
  AttributePolarisationChannelsValues,
  AttributeProcessingModeValues,
  AttributeTimelinessValues,
  AttributeS2CollectionValues,
  AttributeProductClassValues,
  AttributeProductResolution,
  FormatedAttributeNames,
  ODataAttributes,
  AttributeDEMDatasetVersions,
  AttributeDEMDatasetsMap,
} from '../../../../api/OData/assets/attributes';
import { EXPERT_ROLES } from '../../../../api/OData/assets/accessRoles';
import {
  createOriginFilter,
  createS1GRDResolutionFilter,
  createS2Collection1Filter,
  getS5MaxAbsoluteOrbit,
} from './filters/AdditionalFilters.utils';
import { DefaultInput } from './filters/DefaultInput';
import { MultiSelectInput } from './filters/MultiSelectInput';
import { NumericInput } from './filters/NumericInput';

export const collections = [
  {
    id: ODataCollections.S1.id,
    label: ODataCollections.S1.label,
    instruments: [
      {
        id: 'SAR',
        label: 'C-SAR',
        selected: true,
        productTypes: [
          { id: 'RAW', name: 'RAW', label: 'Level-0 RAW' },
          { id: 'SLC', name: 'SLC', label: 'Level-1 SLC' },
          { id: 'GRD', name: 'GRD', notName: '_COG', label: 'Level-1 GRD' },
          { id: 'GRD-COG', name: ['GRD', '_COG'], label: 'Level-1 GRD COG' },
          { id: 'OCN', name: 'OCN', label: 'Level-2 OCN' },
        ],
      },
      {
        id: 'S1ETAD',
        label: 'ETAD',
        supportsInstrumentName: false,
        productTypes: [
          { id: 'S1_ETA__AX', name: 'S1_ETA__AX', label: 'S1_ETA__AX', supportsGeometry: true },
          { id: 'S2_ETA__AX', name: 'S2_ETA__AX', label: 'S2_ETA__AX', supportsGeometry: true },
          { id: 'S3_ETA__AX', name: 'S3_ETA__AX', label: 'S3_ETA__AX', supportsGeometry: true },
          { id: 'S4_ETA__AX', name: 'S4_ETA__AX', label: 'S4_ETA__AX', supportsGeometry: true },
          { id: 'S5_ETA__AX', name: 'S5_ETA__AX', label: 'S5_ETA__AX', supportsGeometry: true },
          { id: 'S6_ETA__AX', name: 'S6_ETA__AX', label: 'S6_ETA__AX', supportsGeometry: true },
          { id: 'EW_ETA__AX', name: 'EW_ETA__AX', label: 'EW_ETA__AX', supportsGeometry: true },
          { id: 'IW_ETA__AX', name: 'IW_ETA__AX', label: 'IW_ETA__AX', supportsGeometry: true },
        ],
      },
      {
        id: 'S1AuxiliaryFiles',
        label: 'Auxiliary Data File',
        supportsInstrumentName: false,
        productTypes: [
          { id: 'AUX_RESORB', name: 'AUX_RESORB', label: 'AUX_RESORB', supportsGeometry: false },
          { id: 'AUX_POEORB', name: 'AUX_POEORB', label: 'AUX_POEORB', supportsGeometry: false },
          { id: 'AUX_PREORB', name: 'AUX_PREORB', label: 'AUX_PREORB', supportsGeometry: false },
          { id: 'AUX_GNSSRD', name: 'AUX_GNSSRD', label: 'AUX_GNSSRD', supportsGeometry: false },
          { id: 'AUX_PROQUA', name: 'AUX_PROQUA', label: 'AUX_PROQUA', supportsGeometry: false },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.platformSerialIdentifier,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributePlatformSerialIdentifierValues.S1A,
          AttributePlatformSerialIdentifierValues.S1B,
        ],
      },
      {
        id: AttributeNames.orbitDirection,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributeOrbitDirectionValues.ASCENDING,
          AttributeOrbitDirectionValues.DESCENDING,
        ],
      },
      {
        id: AttributeNames.relativeOrbitNumber,
        render: NumericInput,
        type: 'integer',
        min: 1,
        max: 175,
        placeholder: '1-175',
      },
      {
        id: AttributeNames.operationalMode,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributeOperationalModeValues.SM,
          AttributeOperationalModeValues.IW,
          AttributeOperationalModeValues.EW,
          AttributeOperationalModeValues.WV,
        ],
      },
      {
        id: AttributeNames.swathIdentifier,
        render: DefaultInput,
        type: 'text',
        placeholder: 'Beam id',
      },
      {
        id: AttributeNames.polarisationChannels,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributePolarisationChannelsValues.HH,
          AttributePolarisationChannelsValues.VV,
          AttributePolarisationChannelsValues.VV_VH,
          AttributePolarisationChannelsValues.HH_HV,
        ],
      },
      {
        id: AttributeNames.online,
        title: 'Product availability',
        render: MultiSelectInput,
        filterElement: FilterElement.Expression,
        defaultValue: [AttributeOnlineValues.online],
        getOptions: ({ userToken }) => [AttributeOnlineValues.online, AttributeOnlineValues.offline],
      },
      {
        id: AttributeNames.resolution,
        title: 'Resolution',
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributeProductResolution.FULL,
          AttributeProductResolution.HIGH,
          AttributeProductResolution.MEDIUM,
        ],
        hasAccess: ({ userToken }) => hasRole(userToken, EXPERT_ROLES.S1_EXPERT),
        filterElement: FilterElement.CustomFilter,
        customFilter: (key, value) => createS1GRDResolutionFilter(key, value),
      },
      {
        id: AttributeNames.productClass,
        title: 'Product class',
        render: MultiSelectInput,
        defaultValue: [AttributeProductClassValues.STANDARD],
        getOptions: ({ userToken }) => [
          AttributeProductClassValues.STANDARD,
          AttributeProductClassValues.CALIBRATION,
          AttributeProductClassValues.NOISE,
          AttributeProductClassValues.ANNOTATON,
        ],
        hasAccess: ({ userToken }) => hasRole(userToken, EXPERT_ROLES.S1_EXPERT),
      },
    ],
  },
  {
    id: ODataCollections.S2.id,
    label: ODataCollections.S2.label,
    instruments: [
      {
        id: 'MSI',
        label: 'MSI',
        selected: true,
        supportsCloudCover: true,
        productTypes: [
          { id: 'S2MSI1C', name: 'L1C', label: 'L1C' },
          { id: 'S2MSI2A', name: 'L2A', label: 'L2A' },
          // temporarily disabled upon ESA request
          // { id: 'S2MSI2Ap', name: 'L2AP', label: 'L2AP' },
        ],
      },
      {
        id: 'S2AuxiliaryFiles',
        label: 'Auxiliary Data File',
        supportsInstrumentName: false,
        productTypes: [
          { id: 'AUX_GNSSRD', name: 'AUX_GNSSRD', label: 'AUX_GNSSRD', supportsGeometry: false },
          { id: 'AUX_PROQUA', name: 'AUX_PROQUA', label: 'AUX_PROQUA', supportsGeometry: false },
          { id: 'AUX_POEORB', name: 'AUX_POEORB', label: 'AUX_POEORB', supportsGeometry: false },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.platformSerialIdentifier,
        render: MultiSelectInput,
        getOptions: ({ userToken }) =>
          hasRole(userToken, EXPERT_ROLES.S2C_COMMISSIONING)
            ? [
                AttributePlatformSerialIdentifierValues.S2A,
                AttributePlatformSerialIdentifierValues.S2B,
                AttributePlatformSerialIdentifierValues.S2C,
              ]
            : [AttributePlatformSerialIdentifierValues.S2A, AttributePlatformSerialIdentifierValues.S2B],
      },
      {
        id: AttributeNames.relativeOrbitNumber,
        render: NumericInput,
        type: 'integer',
        min: 1,
        max: 143,
        placeholder: '1-143',
      },
      {
        id: AttributeNames.origin,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [AttributeOriginValues.ESA, AttributeOriginValues.CLOUDFERRO],
        filterElement: FilterElement.CustomFilter,
        customFilter: (key, value) => createOriginFilter(key, value),
      },
      {
        id: AttributeNames.S2Collection,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [AttributeS2CollectionValues.COLLECTION1],
        filterElement: FilterElement.CustomFilter,
        customFilter: (key, value) => createS2Collection1Filter(key, value),
      },
      {
        id: AttributeNames.online,
        render: MultiSelectInput,
        filterElement: FilterElement.Expression,
        defaultValue: [AttributeOnlineValues.online],
        getOptions: ({ userToken }) => [AttributeOnlineValues.online, AttributeOnlineValues.offline],
      },
    ],
  },

  {
    id: ODataCollections.S3.id,
    label: ODataCollections.S3.label,
    instruments: [
      {
        id: 'OLCI',
        label: 'OLCI',
        productTypes: [
          { id: 'OL_1_EFR___', name: 'OL_1_EFR___', label: 'Level-1 EFR' },
          { id: 'OL_1_ERR___', name: 'OL_1_ERR___', label: 'Level-1 ERR' },
          { id: 'OL_2_LFR___', name: 'OL_2_LFR___', label: 'Level-2 LFR' },
          { id: 'OL_2_LRR___', name: 'OL_2_LRR___', label: 'Level-2 LRR' },
          { id: 'OL_2_WFR___', name: 'OL_2_WFR___', label: 'Level-2 WFR' },
          { id: 'OL_2_WRR___', name: 'OL_2_WRR___', label: 'Level-2 WRR' },
        ],
      },
      {
        id: 'SRAL',
        label: 'SRAL',
        productTypes: [
          { id: 'SR_1_SRA___', name: 'SR_1_SRA___', label: 'Level-1 SRA' },
          { id: 'SR_1_SRA_A_', name: 'SR_1_SRA_A_', label: 'Level-1 SRA_A' },
          { id: 'SR_1_SRA_BS', name: 'SR_1_SRA_BS', label: 'Level-1 SRA_BS' },
          { id: 'SR_2_LAN___', name: 'SR_2_LAN___', label: 'Level-2 LAN' },
          { id: 'SR_2_WAT___', name: 'SR_2_WAT___', label: 'Level-2 WAT' },
          { id: 'SR_2_LAN_HY', name: 'SR_2_LAN_HY', label: 'Level-2 LAN_HY' },
          { id: 'SR_2_LAN_SI', name: 'SR_2_LAN_SI', label: 'Level-2 LAN_SI' },
          { id: 'SR_2_LAN_LI', name: 'SR_2_LAN_LI', label: 'Level-2 LAN_LI' },
        ],
      },
      {
        id: 'SLSTR',
        label: 'SLSTR',
        supportsCloudCover: false,
        productTypes: [
          { id: 'SL_1_RBT___', name: 'SL_1_RBT___', label: 'Level-1 RBT' },
          { id: 'SL_2_AOD___', name: 'SL_2_AOD___', label: 'Level-2 AOD' },
          { id: 'SL_2_FRP___', name: 'SL_2_FRP___', label: 'Level-2 FRP' },
          { id: 'SL_2_LST___', name: 'SL_2_LST___', label: 'Level-2 LST' },
          { id: 'SL_2_WST___', name: 'SL_2_WST___', label: 'Level-2 WST' },
        ],
      },
      {
        id: 'SYNERGY',
        label: 'SYNERGY',
        supportsCloudCover: false,
        productTypes: [
          { id: 'SY_2_AOD___', name: 'SY_2_AOD___', label: 'Level-2 SY_AOD' },
          { id: 'SY_2_SYN___', name: 'SY_2_SYN___', label: 'Level-2 SY_SYN' },
          { id: 'SY_2_V10___', name: 'SY_2_V10___', label: 'Level-2 SY_V10' },
          { id: 'SY_2_VG1___', name: 'SY_2_VG1___', label: 'Level-2 SY_VG1' },
          { id: 'SY_2_VGP___', name: 'SY_2_VGP___', label: 'Level-2 SY_VGP' },
        ],
      },
      {
        id: 'S3AuxiliaryFiles',
        label: 'Auxiliary Data File',
        supportsInstrumentName: false,
        productTypes: [
          { id: 'AUX_MOEORB', name: 'AUX_MOEORB', label: 'AUX_MOEORB', supportsGeometry: false },
          { id: 'AUX_POEORB', name: 'AUX_POEORB', label: 'AUX_POEORB', supportsGeometry: false },
          { id: 'AUX_PRCPTF', name: 'AUX_PRCPTF', label: 'AUX_PRCPTF', supportsGeometry: false },
          { id: 'AUX_GNSSRD', name: 'AUX_GNSSRD', label: 'AUX_GNSSRD', supportsGeometry: false },
          { id: 'AUX_PROQUA', name: 'AUX_PROQUA', label: 'AUX_PROQUA', supportsGeometry: false },
          { id: 'SR___ROE_AX', name: 'SR___ROE_AX', label: 'SR___ROE_AX', supportsGeometry: false },
          { id: 'SR___MDO_AX', name: 'SR___MDO_AX', label: 'SR___MDO_AX', supportsGeometry: false },
          { id: 'SR___POE_AX', name: 'SR___POE_AX', label: 'SR___POE_AX', supportsGeometry: false },
          {
            id: 'AUX_COMB__',
            name: 'AUX_COMB__',
            label: 'AUX_COMB',
            supportsGeometry: false,
            customFilterQueryByProductType: true,
          },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.timeliness,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributeTimelinessValues.NR,
          AttributeTimelinessValues.ST,
          AttributeTimelinessValues.NT,
        ],
      },
      {
        id: AttributeNames.platformSerialIdentifier,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributePlatformSerialIdentifierValues.S3A,
          AttributePlatformSerialIdentifierValues.S3B,
        ],
      },
      {
        id: AttributeNames.orbitDirection,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributeOrbitDirectionValues.ASCENDING,
          AttributeOrbitDirectionValues.DESCENDING,
        ],
      },
      {
        id: AttributeNames.relativeOrbitNumber,
        render: NumericInput,
        type: 'integer',
        min: 1,
        max: 442,
        placeholder: '1-442',
      },
    ],
  },
  {
    id: ODataCollections.S5P.id,
    label: ODataCollections.S5P.label,
    instruments: [
      {
        id: 'TROPOMI',
        label: 'TROPOMI',
        selected: true,
        productTypes: [
          { id: 'L1B_RA_BD1', name: 'L1B_RA_BD1', label: 'Level-1 RA_BD1' },
          { id: 'L1B_RA_BD2', name: 'L1B_RA_BD2', label: 'Level-1 RA_BD2' },
          { id: 'L1B_RA_BD3', name: 'L1B_RA_BD3', label: 'Level-1 RA_BD3' },
          { id: 'L1B_RA_BD4', name: 'L1B_RA_BD4', label: 'Level-1 RA_BD4' },
          { id: 'L1B_RA_BD5', name: 'L1B_RA_BD5', label: 'Level-1 RA_BD5' },
          { id: 'L1B_RA_BD6', name: 'L1B_RA_BD6', label: 'Level-1 RA_BD6' },
          { id: 'L1B_RA_BD7', name: 'L1B_RA_BD7', label: 'Level-1 RA_BD7' },
          { id: 'L1B_RA_BD8', name: 'L1B_RA_BD8', label: 'Level-1 RA_BD8' },
          { id: 'L1B_IR_SIR', name: 'L1B_IR_SIR', label: 'Level-1 IR_SIR', supportsGeometry: false },
          { id: 'L1B_IR_UVN', name: 'L1B_IR_UVN', label: 'Level-1 IR_UVN', supportsGeometry: false },
          { id: 'L2__AER_AI', name: 'L2__AER_AI', label: 'Level-2 AER_AI' },
          { id: 'L2__AER_LH', name: 'L2__AER_LH', label: 'Level-2 AER_LH' },
          { id: 'L2__CH4___', name: 'L2__CH4___', label: 'Level-2 CH4' },
          { id: 'L2__CLOUD_', name: 'L2__CLOUD_', label: 'Level-2 CLOUD' },
          { id: 'L2__CO____', name: 'L2__CO____', label: 'Level-2 CO' },
          { id: 'L2__HCHO__', name: 'L2__HCHO__', label: 'Level-2 HCHO' },
          { id: 'L2__NO2___', name: 'L2__NO2___', label: 'Level-2 NO2' },
          { id: 'L2__NP_BD3', name: 'L2__NP_BD3', label: 'Level-2 NP_BD3' },
          { id: 'L2__NP_BD6', name: 'L2__NP_BD6', label: 'Level-2 NP_BD6' },
          { id: 'L2__NP_BD7', name: 'L2__NP_BD7', label: 'Level-2 NP_BD7' },
          { id: 'L2__O3____', name: 'L2__O3____', label: 'Level-2 O3' },
          { id: 'L2__O3_TCL', name: 'L2__O3_TCL', label: 'Level-2 O3_TCL', supportsGeometry: false },
          { id: 'L2__O3__PR', name: 'L2__O3__PR', label: 'Level-2 O3__PR' },
          { id: 'L2__SO2___', name: 'L2__SO2___', label: 'Level-2 SO2' },
        ],
      },
      {
        id: 'S5PAuxiliaryFiles',
        label: 'Auxiliary Data File',
        supportsInstrumentName: false,
        productTypes: [
          { id: 'AUX_CTMANA', name: 'AUX_CTMANA', label: 'AUX_CTMANA', supportsGeometry: false },
          {
            id: 'AUX_CTMFCT',
            name: 'AUX_CTMFCT',
            label: 'AUX_CTMFCT',
            supportsGeometry: false,
          },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.processingMode,
        render: MultiSelectInput,
        getOptions: ({ userToken }) => [
          AttributeProcessingModeValues.NRTI,
          AttributeProcessingModeValues.OFFL,
          AttributeProcessingModeValues.RPRO,
        ],
      },
      {
        id: AttributeNames.orbitNumber,
        render: NumericInput,
        type: 'integer',
        min: 1,
        max: () => getS5MaxAbsoluteOrbit(),
        placeholder: () => `1-${getS5MaxAbsoluteOrbit()}`,
      },
    ],
  },
  {
    id: ODataCollections.S6.id,
    label: ODataCollections.S6.label,
    instruments: [
      {
        id: 'S6AuxiliaryFiles',
        label: 'Auxiliary Data File',
        supportsInstrumentName: false,
        productTypes: [
          { id: 'AUX_GNSSRD', name: 'AUX_GNSSRD', label: 'AUX_GNSSRD', supportsGeometry: false },
          { id: 'AUX_PROQUA', name: 'AUX_PROQUA', label: 'AUX_PROQUA', supportsGeometry: false },
          { id: 'AX____POE__AX', name: 'AX____POE__AX', label: 'AX____POE__AX', supportsGeometry: false },
          { id: 'AX____ROE__AX', name: 'AX____ROE__AX', label: 'AX____ROE__AX', supportsGeometry: false },
          { id: 'AX____MOED_AX', name: 'AX____MOED_AX', label: 'AX____MOED_AX', supportsGeometry: false },
          {
            id: 'AUX_COMB__',
            name: 'AUX_COMB__',
            label: 'AUX_COMB',
            supportsGeometry: false,
            customFilterQueryByProductType: true,
          },
        ],
      },
    ],
    supportsCloudCover: false,
  },
  {
    id: ODataCollections.OPTICAL.id,
    label: ODataCollections.OPTICAL.label,
    collectionName: ODataCollections.OPTICAL.collection,
    instruments: [
      {
        id: 'VHR_EUROPE',
        label: 'VHR Europe',
        selected: true,
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'DWH_MG2b_CORE_03',
            label: 'VHR Europe (2011–2013)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'VHR_IMAGE_2015',
            label: 'VHR Europe (2014–2016)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'VHR_IMAGE_2018',
            label: 'VHR Europe (2017–2019)',
            customFilterQueryByDatasetFull: true,
            productTypeIds: ['VHR_IMAGE_2018', 'VHR_IMAGE_2018_ENHANCED'],
          },
          {
            id: 'VHR_IMAGE_2021',
            label: 'VHR Europe (2020–2022)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'DEM_VHR_2018',
            label: 'VHR DEM (2018)',
            customFilterQueryByDatasetFull: true,
          },
        ],
        supportsCloudCover: true,
      },
      {
        id: 'VHR_URBAN_ATLAS',
        label: ' VHR Urban Atlas',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'DAP_MG2b_01',
            label: 'VHR Urban Atlas (2006, 2009)',
            customFilterQueryByDatasetFull: true,
            productTypeIds: ['DAP_MG2b_01', 'DAP_MG2b_02'],
          },
          {
            id: 'VHR1-2_Urban_Atlas_2012',
            label: 'VHR Urban Atlas (2011–2013)',
            customFilterQueryByDatasetFull: true,
          },
        ],
        supportsCloudCover: true,
      },
      {
        id: 'HR_EUROPE',
        label: 'HR Europe',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'DAP_MG2-3_01',
            label: 'HR Europe (2006, 2009)',
            customFilterQueryByDatasetFull: true,
            productTypeIds: ['DAP_MG2-3_01', 'DWH_MG2_CORE_02'],
          },
          {
            id: 'DWH_MG2_CORE_01',
            label: 'HR Europe (2011–2013)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'HR_IMAGE_2015',
            label: 'HR Europe (2014–2015)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'EUR_HR2_MULTITEMP',
            label: 'HR Europe Monthly (Apr–Oct 2015)',
            customFilterQueryByDatasetFull: true,
          },
        ],
        supportsCloudCover: true,
      },
      {
        id: 'MR_EUROPE',
        label: 'MR Europe',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'MR_IMAGE_2015',
            label: 'MR Europe Monthly (Mar-Oct 2014)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'DWH_MG2-3_CORE_08',
            label: 'MR Europe Monthly (2011-2012)',
            customFilterQueryByDatasetFull: true,
          },
        ],
        supportsCloudCover: true,
      },
    ],
    additionalFilters: [
      {
        id: AttributeNames.eopIdentifier,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.eopIdentifier(),
      },
      {
        id: AttributeNames.platformShortName,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.platformShortName(),
      },
      {
        id: AttributeNames.platformName,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.platformName(),
      },
      {
        id: AttributeNames.datasetFull,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.datasetFull(),
      },
      {
        id: AttributeNames.productType,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.productType(),
      },
      {
        id: AttributeNames.acrossTrackIncidenceAngle,
        render: NumericInput,
        type: 'float',
        min: -180,
        max: 180,
        placeholder: '-180 - 180',
      },
    ],
  },
  {
    id: ODataCollections.DEM.id,
    label: ODataCollections.DEM.label,
    collectionName: ODataCollections.DEM.collection,
    supportsCloudCover: false,
    instruments: [
      {
        id: 'open',
        label: 'Copernicus DEM (Global Coverage)',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'COP-DEM_GLO-30-DGED',
            label: 'COP-DEM_GLO-30-DGED',
            customFilterQueryByDatasetFull: true,
            productTypes: [],
          },
          {
            id: 'COP-DEM_GLO-30-DTED',
            label: 'COP-DEM_GLO-30-DTED',
            customFilterQueryByDatasetFull: true,
            productTypes: [],
          },
          {
            id: 'COP-DEM_GLO-90-DGED',
            label: 'COP-DEM_GLO-90-DGED',
            customFilterQueryByDatasetFull: true,
            productTypes: [],
          },
          {
            id: 'COP-DEM_GLO-90-DTED',
            label: 'COP-DEM_GLO-90-DTED',
            customFilterQueryByDatasetFull: true,
            productTypes: [],
          },
        ],
      },
      {
        id: 'restricted',
        label: 'Copernicus DEM (EEA Coverage)',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'COP-DEM_EEA-10-DGED',
            label: 'COP-DEM_EEA-10-DGED',
            customFilterQueryByDatasetFull: true,
            productTypes: [],
          },
          {
            id: 'COP-DEM_EEA-10-INSP',
            label: 'COP-DEM_EEA-10-INSP',
            customFilterQueryByDatasetFull: true,
            productTypes: [],
          },
        ],
      },
    ],
    additionalFilters: [
      {
        id: AttributeNames.eopIdentifier,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.eopIdentifier(),
      },
      {
        id: AttributeNames.dataset,
        render: MultiSelectInput,
        defaultValue: AttributeDEMDatasetVersions.slice(-1),
        getOptions: ({ userToken }) => AttributeDEMDatasetVersions,
        selectionLimit: 5,
        preProcessFilters: (filters) => {
          return filters.flatMap((filter) => {
            return AttributeDEMDatasetsMap.flatMap((dataset) => {
              return dataset.productTypes.map((productType) => ({
                value: `${productType.id}/${filter.value}`,
              }));
            });
          });
        },
      },
      {
        id: AttributeNames.gridId,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.gridId(),
      },
    ],
  },
  {
    id: ODataCollections.GLOBAL_MOSAICS.id,
    label: ODataCollections.GLOBAL_MOSAICS.label,
    supportsCloudCover: false,
    instruments: [
      {
        id: 'S1Mosaics',
        label: 'Sentinel-1',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: '_IW_mosaic_',
            name: '_IW_mosaic_',
            label: 'IW Monthly Mosaics',
          },
          {
            id: '_DH_mosaic_',
            name: '_DH_mosaic_',
            label: 'DH Monthly Mosaics',
          },
        ],
      },
      {
        id: 'S2Mosaics',
        label: 'Sentinel-2',
        supportsInstrumentName: false,
        productTypes: [
          {
            id: 'S2MSI_L3__MCQ',
            name: 'Quarterly Mosaics',
            label: 'Quarterly Mosaics',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'S2MSI_L3__MCQ',
            ),
          },
        ],
      },
    ],
  },
];
