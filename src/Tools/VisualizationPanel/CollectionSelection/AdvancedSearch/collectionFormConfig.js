import { FilterElement } from '../../../../api/OData/FilterElement';
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
} from '../../../../api/OData/assets/attributes';
import { createOriginFilter, createS2Collection1Filter } from './filters/AdditionalFilters.utils';
import { DefaultInput } from './filters/DefaultInput';
import { MultiSelectInput } from './filters/MultiSelectInput';
import { NumericInput } from './filters/NumericInput';

export const collections = [
  {
    id: 'S1',
    label: 'SENTINEL-1',
    instruments: [
      {
        id: 'SAR',
        label: 'C-SAR',
        productTypes: [
          { id: 'RAW', name: 'RAW', label: 'Level-0 RAW' },
          { id: 'SLC', name: 'SLC', label: 'Level-1 SLC' },
          { id: 'GRD', name: 'GRD', notName: '_COG', label: 'Level-1 GRD' },
          { id: 'GRD-COG', name: ['GRD', '_COG'], label: 'Level-1 GRD COG' },
          { id: 'OCN', name: 'OCN', label: 'Level-2 OCN' },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.platformSerialIdentifier,
        render: MultiSelectInput,
        options: [AttributePlatformSerialIdentifierValues.S1A, AttributePlatformSerialIdentifierValues.S1B],
      },
      {
        id: AttributeNames.orbitDirection,
        render: MultiSelectInput,
        options: [AttributeOrbitDirectionValues.ASCENDING, AttributeOrbitDirectionValues.DESCENDING],
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
        options: [
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
        options: [
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
        options: [AttributeOnlineValues.online, AttributeOnlineValues.offline],
      },
    ],
  },
  {
    id: 'S2',
    label: 'SENTINEL-2',
    instruments: [
      {
        id: 'MSI',
        label: 'MSI',
        supportsCloudCover: true,
        productTypes: [
          { id: 'S2MSI1C', name: 'L1C', label: 'L1C' },
          { id: 'S2MSI2A', name: 'L2A', label: 'L2A' },
          { id: 'S2MSI2Ap', name: 'L2AP', label: 'L2AP' },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.platformSerialIdentifier,
        render: MultiSelectInput,
        options: [AttributePlatformSerialIdentifierValues.S2A, AttributePlatformSerialIdentifierValues.S2B],
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
        options: [AttributeOriginValues.ESA, AttributeOriginValues.CLOUDFERRO],
        filterElement: FilterElement.CustomFilter,
        customFilter: (key, value) => createOriginFilter(key, value),
      },
      {
        id: AttributeNames.S2Collection,
        render: MultiSelectInput,
        options: [AttributeS2CollectionValues.COLLECTION1],
        filterElement: FilterElement.CustomFilter,
        customFilter: (key, value) => createS2Collection1Filter(key, value),
      },
      {
        id: AttributeNames.online,
        render: MultiSelectInput,
        filterElement: FilterElement.Expression,
        defaultValue: [AttributeOnlineValues.online],
        options: [AttributeOnlineValues.online, AttributeOnlineValues.offline],
      },
    ],
  },
  {
    id: 'S3',
    label: 'SENTINEL-3',
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
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.timeliness,
        render: MultiSelectInput,
        options: [AttributeTimelinessValues.NR, AttributeTimelinessValues.ST, AttributeTimelinessValues.NT],
      },
      {
        id: AttributeNames.platformSerialIdentifier,
        render: MultiSelectInput,
        options: [AttributePlatformSerialIdentifierValues.S3A, AttributePlatformSerialIdentifierValues.S3B],
      },
      {
        id: AttributeNames.orbitDirection,
        render: MultiSelectInput,
        options: [AttributeOrbitDirectionValues.ASCENDING, AttributeOrbitDirectionValues.DESCENDING],
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
    id: 'S5P',
    label: 'SENTINEL-5P',
    instruments: [
      {
        id: 'TROPOMI',
        label: 'TROPOMI',
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
        id: 'AuxiliaryFiles',
        label: 'Auxiliary Files',
        supportsInstrumentName: false,
        productTypes: [
          { id: 'AUX_CTMANA', name: 'AUX_CTMANA', label: 'CTMANA', supportsGeometry: false },
          { id: 'AUX_CTMFCT', name: 'AUX_CTMFCT', label: 'CTMFCT', supportsGeometry: false },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.processingMode,
        render: MultiSelectInput,
        options: [
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
        max: 30000,
        placeholder: '1-30000',
      },
    ],
  },
];
