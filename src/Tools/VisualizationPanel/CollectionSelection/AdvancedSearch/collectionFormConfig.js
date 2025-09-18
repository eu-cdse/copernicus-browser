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
  AttributeProductClassValues,
  AttributeProductResolution,
  FormatedAttributeNames,
  ODataAttributes,
  AttributeDEMDatasetVersions,
  AttributeDEMDatasetsMap,
  AttributeS2ProductTypeValues,
  AttributeConsolidationPeriodValues,
} from '../../../../api/OData/assets/attributes';
import { EXPERT_ROLES } from '../../../../api/OData/assets/accessRoles';
import {
  createAcrossTrackIncidenceAngleFilter,
  createOriginFilter,
  createS1GRDResolutionFilter,
  getS5MaxAbsoluteOrbit,
} from './filters/AdditionalFilters.utils';
import { DefaultInput } from './filters/DefaultInput';
import { MultiSelectInput } from './filters/MultiSelectInput';
import { NumericInput } from './filters/NumericInput';
import { AcrossTrackIncidenceAngleTag } from './filters/CustomTags';

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
        id: 'AIS',
        label: 'AIS',
        hasAccess: ({ userToken }) => hasRole(userToken, EXPERT_ROLES.S1C_COMMISSIONING),
        productTypes: [
          { id: 'RAW', name: 'RAW', label: 'Level-0 RAW' },
          {
            id: 'AISAUX',
            name: 'AISAUX',
            label: 'AISAUX',
            supportsGeometry: false,
          },
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
          { id: 'AUX_MOEORB', name: 'AUX_MOEORB', label: 'AUX_MOEORB', supportsGeometry: false },
          {
            id: 'AMV_ERRMAT',
            name: 'AMV_ERRMAT',
            label: 'AMV_ERRMAT',
            supportsGeometry: false,
            hasAccess: ({ userToken }) => hasRole(userToken, EXPERT_ROLES.S1_EXPERT),
          },
          {
            id: 'AMH_ERRMAT',
            name: 'AMH_ERRMAT',
            label: 'AMH_ERRMAT',
            supportsGeometry: false,
            hasAccess: ({ userToken }) => hasRole(userToken, EXPERT_ROLES.S1_EXPERT),
          },
        ],
      },
    ],
    supportsCloudCover: false,
    additionalFilters: [
      {
        id: AttributeNames.platformSerialIdentifier,
        render: MultiSelectInput,
        getOptions: ({ userToken }) =>
          hasRole(userToken, EXPERT_ROLES.S1C_COMMISSIONING)
            ? [
                AttributePlatformSerialIdentifierValues.S1A,
                AttributePlatformSerialIdentifierValues.S1B,
                AttributePlatformSerialIdentifierValues.S1C,
                AttributePlatformSerialIdentifierValues.S1D,
              ]
            : [
                AttributePlatformSerialIdentifierValues.S1A,
                AttributePlatformSerialIdentifierValues.S1B,
                AttributePlatformSerialIdentifierValues.S1C,
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
          {
            id: 'MSI_L1B_DS',
            name: 'L1B',
            label: 'L1B',
            productTypeIds: ['MSI_L1B_DS', 'MSI_L1B_GR'],
            customFilterQueryByProductType: true,
            hasAccess: ({ userToken }) => hasRole(userToken, EXPERT_ROLES.S2_EXPERT),
          },
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
        getOptions: () => [
          AttributePlatformSerialIdentifierValues.S2A,
          AttributePlatformSerialIdentifierValues.S2B,
          AttributePlatformSerialIdentifierValues.S2C,
        ],
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
        id: AttributeNames.productType,
        render: MultiSelectInput,
        getOptions: () => [AttributeS2ProductTypeValues.MSI_L1B_GR, AttributeS2ProductTypeValues.MSI_L1B_DS],
        hasAccess: ({ userToken }) => hasRole(userToken, EXPERT_ROLES.S2_EXPERT),
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
        id: 'Complementary',
        label: 'Complementary',
        supportsInstrumentName: false,
        supportsCloudCover: false,
        productTypes: [
          {
            id: 'SR_2_TDP_LI',
            name: 'SR_2_TDP_LI',
            label: 'SR_2_TDP_LI',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'SR_2_TDP_LI',
            ),
          },
          {
            id: 'SR_2_TDP_HY',
            name: 'SR_2_TDP_HY',
            label: 'SR_2_TDP_HY',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'SR_2_TDP_HY',
            ),
          },
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
        id: 'Complementary',
        label: 'Complementary',
        supportsInstrumentName: false,
        supportsCloudCover: false,
        productTypes: [
          {
            id: 'L2__AER_OT',
            name: 'L2__AER_OT',
            label: 'L2__AER_OT',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'L2__AER_OT',
            ),
          },
          {
            id: 'L2__BRO___',
            name: 'L2__BRO___',
            label: 'L2__BRO___',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'L2__BRO___',
            ),
          },
          {
            id: 'L2B_SIF___',
            name: 'L2B_SIF___',
            label: 'L2B_SIF___',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'L2B_SIF___',
            ),
          },
          {
            id: 'L2__CHOCHO',
            name: 'L2__CHOCHO',
            label: 'L2__CHOCHO',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'L2__CHOCHO',
            ),
          },
          {
            id: 'L2__OCLO__',
            name: 'L2__OCLO__',
            label: 'L2__OCLO__',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'L2__OCLO__',
            ),
          },
          {
            id: 'L2__SIF___',
            name: 'L2__SIF___',
            label: 'L2__SIF___',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'L2__SIF___',
            ),
          },
          {
            id: 'L2__TCWV__',
            name: 'L2__TCWV__',
            label: 'L2__TCWV__',
            customFilterExpression: FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'L2__TCWV__',
            ),
          },
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
            id: 'VHR_IMAGE_2024',
            label: 'VHR Europe (2023–2025)',
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
            label: 'MR Europe Monthly (Mar–Oct 2014)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'DWH_MG2-3_CORE_08',
            label: 'MR Europe Monthly (2011–2012)',
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
        id: AttributeNames.dataset,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.dataset(),
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
        filterElement: FilterElement.CustomFilter,
        customFilter: (key, value) => createAcrossTrackIncidenceAngleFilter(key, value),
        customTag: AcrossTrackIncidenceAngleTag,
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
        id: AttributeNames.deliveryId,
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
    id: ODataCollections.CCM_SAR.id,
    label: ODataCollections.CCM_SAR.label,
    collectionName: ODataCollections.CCM_SAR.collection,
    instruments: [
      {
        id: 'HR-MR',
        label: 'HR-MR Sea Ice Monitoring',
        supportsInstrumentName: false,
        supportsCloudCover: false,
        productTypes: [
          {
            id: 'DWH_MG1_CORE_11',
            label: 'HR-MR Sea Ice Monitoring (2011–2014)',
            customFilterQueryByDatasetFull: true,
          },
          {
            id: 'SAR_SEA_ICE',
            label: 'HR-MR Sea Ice Monitoring (2015–2024)',
            customFilterQueryByDatasetFull: true,
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
        id: AttributeNames.dataset,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.dataset(),
      },
      {
        id: AttributeNames.productType,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.productType(),
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

export const recursiveCollectionCLMS = [
  {
    id: ODataCollections.CLMS_LAND_COVER_AND_LAND_USE_MAPPING.id,
    label: ODataCollections.CLMS_LAND_COVER_AND_LAND_USE_MAPPING.label,
    type: 'collection',
    collectionName: ODataCollections.CLMS_LAND_COVER_AND_LAND_USE_MAPPING.collection,
    supportsGeometry: false,
    supportsCloudCover: false,
    items: [
      {
        id: 'DYNAMIC_LAND_COVER',
        label: 'Dynamic Land Cover',
        type: 'instrument',
        supportsCloudCover: false,
        customFilterExpression: `(${FilterElement.Attribute(
          ODataAttributes.productType,
          ODataFilterOperator.eq,
          'dynamic_land_cover',
        )})`,
        items: [
          {
            id: 'lc_global_100m_yearly_v3',
            label: 'Global, Yearly, 100m, (2015–2019), V3',
            type: 'productType',
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.datasetIdentifier,
              ODataFilterOperator.eq,
              'lc_global_100m_yearly_v3',
            )})`,
          },
          {
            id: 'lcm_global_10m_yearly_v1',
            label: 'LCM Global, Yearly, 10m, 2020, V1',
            type: 'productType',
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.datasetIdentifier,
              ODataFilterOperator.eq,
              'lcm_global_10m_yearly_v1',
            )})`,
          },
          {
            id: 'tcd_pantropical_10m_yearly_v1',
            label: 'TCD Pan-tropical, Yearly, 10m, 2020, V1',
            type: 'productType',
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.datasetIdentifier,
              ODataFilterOperator.eq,
              'tcd_pantropical_10m_yearly_v1',
            )})`,
          },
        ],
      },
      // {
      //   id: 'CORINE_LAND_COVER',
      //   label: 'CORINE Land Cover',
      //   type: 'instrument',
      //   supportsCloudCover: false,
      //   customFilterExpression: `(${FilterElement.Attribute(
      //      ODataAttributes.productType,
      //      ODataFilterOperator.eq,
      //      'vegetation_phenology_and_productivity_parameters', // fix this
      //   )})`,
      //   items: [],
      // },
      // {
      //   id: 'CLC+BACKBONE',
      //   label: 'CLC + Backbone',
      //   type: 'instrument',
      //   supportsCloudCover: false,
      //   customFilterExpression: `(${FilterElement.Attribute(
      //      ODataAttributes.productType,
      //      ODataFilterOperator.eq,
      //      'vegetation_phenology_and_productivity_parameters', // fix this
      //   )})`,
      //   items: [],
      // },
      // {
      //   id: 'HIGH_RESOLUTION_LAYER',
      //   label: 'High Resolution Layer',
      //   type: 'instrument',
      //   supportsCloudCover: false,
      //   customFilterExpression: `(${FilterElement.Attribute(
      //      ODataAttributes.productType,
      //      ODataFilterOperator.eq,
      //      'vegetation_phenology_and_productivity_parameters', // fix this
      //   )})`,
      //   items: [],
      // },
    ],
    additionalFilters: [
      {
        id: AttributeNames.fileFormat,
        render: MultiSelectInput,
        getOptions: () => [
          { value: 'nc', label: 'NetCDF' },
          { value: 'cog', label: 'Cloud Optimized GeoTIFF' },
        ],
      },
      {
        id: AttributeNames.consolidationPeriod,
        title: FormatedAttributeNames.consolidationPeriod(),
        render: MultiSelectInput,
        getOptions: () => [
          AttributeConsolidationPeriodValues.RT0,
          AttributeConsolidationPeriodValues.RT1,
          AttributeConsolidationPeriodValues.RT2,
          AttributeConsolidationPeriodValues.RT5,
          AttributeConsolidationPeriodValues.RT6,
        ],
      },
      {
        id: AttributeNames.datasetIdentifier,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.datasetIdentifier(),
      },
      {
        id: AttributeNames.productType,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.productType(),
      },
    ],
  },
  // {
  //   id: ODataCollections.CLMS_PRIORITY_AREA_MONITORING.id,
  //   label: ODataCollections.CLMS_PRIORITY_AREA_MONITORING.label,
  //   type: 'collection',
  //   collectionName: ODataCollections.CLMS_PRIORITY_AREA_MONITORING.collection,
  //   supportsGeometry: false,
  //   supportsCloudCover: false,
  //   items: [
  //     {
  //       id: 'COASTAL_ZONES',
  //       label: 'Coastal Zones',
  //       type: 'instrument',
  //       supportsCloudCover: false,
  //       customFilterExpression: `(${FilterElement.Attribute(
  //         ODataAttributes.productType,
  //         ODataFilterOperator.eq,
  //         'vegetation_phenology_and_productivity_parameters', // fix this
  //       )})`,
  //       items: [],
  //     },
  //     {
  //       id: 'N2K',
  //       label: 'N2K',
  //       type: 'instrument',
  //       supportsCloudCover: false,
  //       customFilterExpression: `(${FilterElement.Attribute(
  //         ODataAttributes.productType,
  //         ODataFilterOperator.eq,
  //         'vegetation_phenology_and_productivity_parameters', // fix this
  //       )})`,
  //       items: [],
  //     },
  //     {
  //       id: 'RIPARIAN_ZONES',
  //       label: 'Riparian Zones',
  //       type: 'instrument',
  //       supportsCloudCover: false,
  //       customFilterExpression: `(${FilterElement.Attribute(
  //         ODataAttributes.productType,
  //         ODataFilterOperator.eq,
  //         'vegetation_phenology_and_productivity_parameters', // fix this
  //       )})`,
  //       items: [],
  //     },
  //     {
  //       id: 'URBAN_ATLAS',
  //       label: 'Urban Atlas',
  //       type: 'instrument',
  //       supportsCloudCover: false,
  //       customFilterExpression: `(${FilterElement.Attribute(
  //         ODataAttributes.productType,
  //         ODataFilterOperator.eq,
  //         'vegetation_phenology_and_productivity_parameters', // fix this
  //       )})`,
  //       items: [],
  //     },
  //     {
  //       id: 'REFERENCE_LAND_COVER_AND_LAND_COVER_CHANGE_IN_SELECTED_HOT_SPOTS',
  //       label: 'Reference Land Cover and Land Cover Change in selected Hot Spots',
  //       type: 'instrument',
  //       supportsCloudCover: false,
  //       customFilterExpression: `(${FilterElement.Attribute(
  //         ODataAttributes.productType,
  //         ODataFilterOperator.eq,
  //         'vegetation_phenology_and_productivity_parameters', // fix this
  //       )})`,
  //       items: [],
  //     },
  //   ],
  //   additionalFilters: [
  //     {
  //       id: AttributeNames.fileFormat,
  //       render: MultiSelectInput,
  //       getOptions: () => [
  //         { value: 'nc', label: 'NetCDF' },
  //         { value: 'cog', label: 'Cloud Optimized GeoTIFF' },
  //       ],
  //     },
  //     {
  //       id: AttributeNames.consolidationPeriod,
  //       title: FormatedAttributeNames.consolidationPeriod(),
  //       render: MultiSelectInput,
  //       getOptions: () => [
  //         AttributeConsolidationPeriodValues.RT0,
  //         AttributeConsolidationPeriodValues.RT1,
  //         AttributeConsolidationPeriodValues.RT2,
  //         AttributeConsolidationPeriodValues.RT5,
  //         AttributeConsolidationPeriodValues.RT6,
  //       ],
  //     },
  //     {
  //       id: AttributeNames.datasetIdentifier,
  //       render: DefaultInput,
  //       type: 'text',
  //       placeholder: FormatedAttributeNames.datasetIdentifier(),
  //     },
  //     {
  //       id: AttributeNames.productType,
  //       render: DefaultInput,
  //       type: 'text',
  //       placeholder: FormatedAttributeNames.productType(),
  //     },
  //   ],
  // },
  {
    id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
    label: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.label,
    type: 'collection',
    collectionName: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.collection,
    supportsGeometry: false,
    supportsCloudCover: false,
    items: [
      {
        id: 'SOIL_MOISTURE',
        label: 'Soil Moisture',
        type: 'group',
        items: [
          {
            id: 'SURFACE_SOIL_MOISTURE',
            label: 'Surface Soil Moisture',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'surface_soil_moisture',
            )})`,
            items: [
              {
                id: 'ssm_europe_1km_daily_v1',
                label: 'Europe, Daily, 1km, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ssm_europe_1km_daily_v1',
                )})`,
              },
            ],
          },
          {
            id: 'SOIL_WATER_INDEX',
            label: 'Soil Water Index',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'soil_water_index',
            )})`,
            items: [
              {
                id: 'swi_europe_1km_daily_v1',
                label: 'Europe, Daily, 1km, (2015–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi_europe_1km_daily_v1',
                )})`,
              },
              {
                id: 'swi_europe_1km_daily_v2',
                label: 'Europe, Daily, 1km, (2025–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi_europe_1km_daily_v2',
                )})`,
              },
              {
                id: 'swi_global_12.5km_daily_v3',
                label: 'Global, Daily, 12.5km, (2007–present), V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi_global_12.5km_daily_v3',
                )})`,
              },
              {
                id: 'swi_global_12.5km_daily_v4',
                label: 'Global, Daily, 12.5km, (2025–present), V4',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi_global_12.5km_daily_v4',
                )})`,
              },
              {
                id: 'swi_global_12.5km_10daily_v3',
                label: 'Global, 10-daily, 12.5km, (2007–present), V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi_global_12.5km_10daily_v3',
                )})`,
              },
              {
                id: 'swi_global_12.5km_10daily_v4',
                label: 'Global, 10-daily, 12.5km, (2025–present), V4',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi_global_12.5km_10daily_v4',
                )})`,
              },
              {
                id: 'swi-static_global_12.5km_daily_v3',
                label: 'Static Layers, Global, Daily, 12.5km, V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi-static_global_12.5km_daily_v3',
                )})`,
              },

              {
                id: 'swi-timeseries_global_12.5km_daily_v3',
                label: 'Time Series, Global, Daily, 12.5km, (2007–present), V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swi-timeseries_global_12.5km_daily_v3',
                )})`,
              },
            ],
          },
        ],
      },
      {
        id: 'SNOW',
        label: 'Snow',
        type: 'group',
        items: [
          {
            id: 'SNOW_COVER_EXTENT',
            label: 'Snow Cover Extent',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'snow_cover_extent',
            )})`,
            items: [
              {
                id: 'sce_europe_500m_daily_v1',
                label: 'Europe, Daily, 500m, (2017–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'sce_europe_500m_daily_v1',
                )})`,
              },
              {
                id: 'sce_northernhemisphere_1km_daily_v1',
                label: 'Northern Hemisphere, Daily, 1km, (2018–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'sce_northernhemisphere_1km_daily_v1',
                )})`,
              },
            ],
          },
          // {
          //   id: 'SNOW_STATE',
          //   label: 'Snow State',
          //   type: 'instrument',
          //   supportsCloudCover: false,
          //   customFilterExpression: `(${FilterElement.Attribute(
          //     ODataAttributes.productType,
          //     ODataFilterOperator.eq,
          //     'snow_state',
          //   )})`,
          //   items: [],
          // },
          {
            id: 'SNOW_WATER_EQUIVALENT',
            label: 'Snow Water Equivalent',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'snow_water_equivalent',
            )})`,
            items: [
              {
                id: 'swe_northernhemisphere_5km_daily_v1',
                label: 'Northern Hemisphere, Daily, 5km, (2006–2024), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swe_northernhemisphere_5km_daily_v1',
                )})`,
              },
              {
                id: 'swe_northernhemisphere_5km_daily_v2',
                label: 'Northern Hemisphere, Daily, 5km, (2024–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'swe_northernhemisphere_5km_daily_v2',
                )})`,
              },
            ],
          },
        ],
      },
      {
        id: 'TEMPERATURE_AND_REFLECTANCE',
        label: 'Temperature and Reflectance',
        type: 'group',
        items: [
          {
            id: 'LAND_SURFACE_TEMPERATURE',
            label: 'Land Surface Temperature',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'land_surface_temperature',
            )})`,
            items: [
              {
                id: 'lst_global_5km_hourly_v1',
                label: 'Global, Hourly, 5km, (2010–2021), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lst_global_5km_hourly_v1',
                )})`,
              },
              {
                id: 'lst_global_5km_hourly_v2',
                label: 'Global, Hourly, 5km, (2021–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lst_global_5km_hourly_v2',
                )})`,
              },
              {
                id: 'lst-tci_global_5km_10daily_v1',
                label: 'Synthesis and Thermal Condition Index, Global, 5km, 10-daily, (2017–2021), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lst-tci_global_5km_10daily_v1',
                )})`,
              },
              {
                id: 'lst-tci_global_5km_10daily_v2',
                label: 'Synthesis and Thermal Condition Index, Global, 5km, 10-daily, (2021–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lst-tci_global_5km_10daily_v2',
                )})`,
              },
              {
                id: 'lst-daily-cycle_global_5km_10daily_v1',
                label: 'Daily Cycle, Global, 10-daily, 5km, (2017–2021), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lst-daily-cycle_global_5km_10daily_v1',
                )})`,
              },
              {
                id: 'lst-daily-cycle_global_5km_10daily_v2',
                label: 'Daily Cycle, Global, 10-daily, 5km, (2021–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lst-daily-cycle_global_5km_10daily_v2',
                )})`,
              },
            ],
          },
          {
            id: 'LAKE_SURFACE_WATER_TEMPERATURE',
            label: 'Lake Surface Water Temperature',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'lake_surface_water_temperature',
            )})`,
            items: [
              {
                id: 'lswt-offline_global_1km_10daily_v1',
                label: 'Offline, Global, 10-daily, 1km, (2002–2012), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lswt-offline_global_1km_10daily_v1',
                )})`,
              },
              {
                id: 'lswt-nrt_global_1km_10daily_v1',
                label: 'NRT, Global, 10-daily, 1km, (2002–2012), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lswt-nrt_global_1km_10daily_v1',
                )})`,
              },
            ],
          },
          {
            id: 'TOP_OF_CANOPY_REFLECTANCES',
            label: 'Top of Canopy Reflectances',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'top-of-canopy_reflectances',
            )})`,
            items: [
              {
                id: 'toc_global_300m_daily_v2',
                label: 'TOC, Global, Daily, 300m, (2018–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'toc_global_300m_daily_v2',
                )})`,
              },
            ],
          },
        ],
      },
      {
        id: 'VEGETATION',
        label: 'Vegetation',
        type: 'group',
        items: [
          {
            id: 'BURNT_AREA',
            label: 'Burnt Area',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'burnt_area',
            )})`,
            items: [
              {
                id: 'ba_global_300m_daily_v3',
                label: 'Global, Daily, 300m, (2023–present), V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ba_global_300m_daily_v3',
                )})`,
              },
              {
                id: 'ba_global_300m_monthly_v3',
                label: 'Global, Monthly, 300m, (2019–present), V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ba_global_300m_monthly_v3',
                )})`,
              },
            ],
          },
          {
            id: 'VEGETATION_PROPERTIES',
            label: 'Vegetation Properties',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'vegetation_properties',
            )})`,
            items: [
              {
                id: 'fcover_global_1km_10daily_v2',
                label: 'Fraction of Green Vegetation Cover, Global, 10-daily, 1km, (1999–2020), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'fcover_global_1km_10daily_v2',
                )})`,
              },
              {
                id: 'fcover_global_300m_10daily_v1',
                label: 'Fraction of Green Vegetation Cover, Global, 10-daily, 300m, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'fcover_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'fapar_global_1km_10daily_v2',
                label:
                  'Fraction of Absorbed Photosynthetically Active Radiation, Global, 10-daily, 1km, (1999–2020), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'fapar_global_1km_10daily_v2',
                )})`,
              },
              {
                id: 'fapar_global_300m_10daily_v1',
                label:
                  'Fraction of Absorbed Photosynthetically Active Radiation, Global, 10-daily, 300m, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'fapar_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'lai_global_1km_10daily_v2',
                label: 'Leaf Area Index, Global, 10-daily, 1km, (1999–2020), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lai_global_1km_10daily_v2',
                )})`,
              },
              {
                id: 'lai_global_300m_10daily_v1',
                label: 'Leaf Area Index, Global, 10-daily, 300m, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lai_global_300m_10daily_v1',
                )})`,
              },
            ],
          },
          {
            id: 'VEGETATION_INDICES',
            label: 'Vegetation Indices',
            type: 'instrument',
            selected: true,
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'vegetation_indices',
            )})`,
            items: [
              {
                id: 'ndvi_global_1km_10daily_v3',
                label: 'NDVI, Global, 10-daily, 1km, (1999–2020), V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ndvi_global_1km_10daily_v3',
                )})`,
              },
              {
                id: 'ndvi_global_1km_10daily_v2',
                label: 'NDVI, Global, 10-daily, 1km, (1998–2020), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ndvi_global_1km_10daily_v2',
                )})`,
              },
              {
                id: 'ndvi_global_300m_10daily_v2',
                label: 'NDVI, Global, 10-daily, 300m, (2020–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ndvi_global_300m_10daily_v2',
                )})`,
              },
              {
                id: 'ndvi_global_300m_10daily_v1',
                label: 'NDVI, Global, 10-daily, 300m, (2014–2020), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ndvi_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'ndvi-lts_global_1km_10daily_v3',
                label: 'NDVI Long Term Statistics, Global, 10-daily, 1km, (1999–2019), V3',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ndvi-lts_global_1km_10daily_v3',
                )})`,
              },
              {
                id: 'ndvi-lts_global_1km_10daily_v2',
                label: 'NDVI Long Term Statistics, Global, 10-daily, 1km, (1999–2017), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'ndvi-lts_global_1km_10daily_v2',
                )})`,
              },
            ],
          },
          // {
          //   id: 'VEGETATION_SEASONAL_TRAJECTORIES',
          //   label: 'Vegetation Seasonal Trajectories',
          //   type: 'instrument',
          //   supportsInstrumentName: false,
          //   supportsCloudCover: false,
          //   customFilterExpression: `(${FilterElement.Attribute(
          //      ODataAttributes.productType,
          //      ODataFilterOperator.eq,
          //      'vegetation_phenology_and_productivity_parameters', // fix this
          //   )})`,
          //   items: [],
          // },
          {
            id: 'VEGETATION_PHENOLOGY_AND_PRODUCTIVITY_PARAMETERS',
            label: 'Vegetation Phenology and Productivity Parameters',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'vegetation_phenology_and_productivity_parameters',
            )})`,
            items: [
              {
                id: 'lsp_global_300m_yearly_v1',
                label: 'LSP, Global, Yearly, 300m, (2023–2024), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lsp_global_300m_yearly_v1',
                )})`,
              },
            ],
          },
          {
            id: 'DRY_GROSS_DRY_MATTER_PRODUCTIVITY',
            label: 'Dry/Gross Dry Matter Productivity',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'dry-gross_dry_matter_productivity',
            )})`,
            items: [
              {
                id: 'dmp_global_300m_10daily_v1',
                label: 'Dry Matter Productivity, Global, 10-daily, 300m, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'dmp_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'dmp_global_1km_10daily_v2',
                label: 'Dry Matter Productivity, Global, 10-daily, 1km, (1999–2020), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'dmp_global_1km_10daily_v2',
                )})`,
              },
              {
                id: 'gdmp_global_300m_10daily_v1',
                label: 'Gross Dry Matter Productivity, Global, 10-daily, 300m, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'gdmp_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'gdmp_global_1km_10daily_v2',
                label: 'Gross Dry Matter Productivity, Global, 10-daily, 1km, (1999–2020), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'gdmp_global_1km_10daily_v2',
                )})`,
              },
            ],
          },
          {
            id: 'NET_GROSS_PRIMARY_PRODUCTION',
            label: 'Net/Gross Primary Production',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'net-gross_primary_production',
            )})`,
            items: [
              {
                id: 'npp_global_300m_10daily_v1',
                label: 'Net Primary Production, Global, 10-daily, 300m, (2023–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'npp_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'gpp_global_300m_10daily_v1',
                label: 'Gross Primary Production, Global, 10-daily, 300m, (2023–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'gpp_global_300m_10daily_v1',
                )})`,
              },
            ],
          },
        ],
      },
      {
        id: 'WATER_BODIES',
        label: 'Water Bodies',
        type: 'group',
        items: [
          {
            id: 'WATER_BODIES_1',
            label: 'Water Bodies',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'water_bodies',
            )})`,
            items: [
              {
                id: 'wb_global_1km_10daily_v2',
                label: 'Global, 10-daily, 1km, (2014–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'wb_global_1km_10daily_v2',
                )})`,
              },
              {
                id: 'wb_global_300m_10daily_v1',
                label: 'Global, 10-daily, 300m, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'wb_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'wb_global_100m_monthly_v1',
                label: 'Global, 10-daily, 100m, (2014–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'wb_global_100m_monthly_v1',
                )})`,
              },
              {
                id: 'wb_global_300m_monthly_v2',
                label: 'Global, Monthly, 300m, (2020–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'wb_global_300m_monthly_v2',
                )})`,
              },
            ],
          },
          {
            id: 'RIVER_AND_LAKE_WATER_LEVEL',
            label: 'River and Lake Water Level',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'river_and_lake_water_level',
            )})`,
            items: [
              {
                id: 'wl-lakes_global_vector_daily_v2',
                label: 'Lake Water Level NRT (vector), Daily, (1992–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'wl-lakes_global_vector_daily_v2',
                )})`,
              },
              {
                id: 'wl-rivers_global_vector_daily_v2',
                label: 'River Water Level NRT (vector), Daily, (2002–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'wl-rivers_global_vector_daily_v2',
                )})`,
              },
            ],
          },
          {
            id: 'LAKE_WATER_QUALITY',
            label: 'Lake Water Quality',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'lake_water_quality',
            )})`,
            items: [
              {
                id: 'lwq-reproc_global_1km_10daily_v1',
                label: 'Global Reproc, 10-daily, 1km, (2002–2012), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lwq-reproc_global_1km_10daily_v1',
                )})`,
              },
              {
                id: 'lwq-reproc_global_300m_10daily_v1',
                label: 'Global Reproc, 10-daily, 300m, (2002–2012), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lwq-reproc_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'lwq-nrt_global_1km_10daily_v1',
                label: 'Global NRT, 10-daily, 1km, (2002–2012), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lwq-nrt_global_1km_10daily_v1',
                )})`,
              },
              {
                id: 'lwq-nrt_global_300m_10daily_v1',
                label: 'Global NRT, 10-daily, 300m, (2002–2012), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lwq-nrt_global_300m_10daily_v1',
                )})`,
              },
              {
                id: 'lwq-nrt_global_100m_10daily_v1',
                label: 'Global NRT, 10-daily, 100m, (2002–2012), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lwq-nrt_global_100m_10daily_v1',
                )})`,
              },
              {
                id: 'lwq-nrt_global_300m_10daily_v2',
                label: 'Global NRT, 10-daily, 300m, (2024–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lwq-nrt_global_300m_10daily_v2',
                )})`,
              },
              {
                id: 'lwq-nrt_global_100m_10daily_v2',
                label: 'Global NRT, 10-daily, 100m, (2024–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lwq-nrt_global_100m_10daily_v2',
                )})`,
              },
            ],
          },
          {
            id: 'RIVER_AND_LAKE_ICE_EXTENT',
            label: 'River and Lake Ice Extent',
            type: 'instrument',
            supportsCloudCover: false,
            customFilterExpression: `(${FilterElement.Attribute(
              ODataAttributes.productType,
              ODataFilterOperator.eq,
              'river_and_lake_ice_extent',
            )})`,
            items: [
              {
                id: 'lie_baltic_250m_daily_v1',
                label: 'Baltic, Daily, 250m, (2017–2024), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lie_baltic_250m_daily_v1',
                )})`,
              },
              {
                id: 'lie_northernhemisphere_500m_daily_v1',
                label: 'Northern Hemisphere, Daily, 500m, (2021–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lie_northernhemisphere_500m_daily_v1',
                )})`,
              },
              {
                id: 'lie_europe_250m_daily_v2',
                label: 'Europe, Daily, 250m, (2024–present), V1',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lie_europe_250m_daily_v2',
                )})`,
              },
              {
                id: 'lie_global_500m_daily_v2',
                label: 'Global, Daily, 500m, (2025–present), V2',
                type: 'productType',
                customFilterExpression: `(${FilterElement.Attribute(
                  ODataAttributes.datasetIdentifier,
                  ODataFilterOperator.eq,
                  'lie_global_500m_daily_v2',
                )})`,
              },
            ],
          },
        ],
      },
    ],
    additionalFilters: [
      {
        id: AttributeNames.fileFormat,
        render: MultiSelectInput,
        getOptions: () => [
          { value: 'nc', label: 'NetCDF' },
          { value: 'cog', label: 'Cloud Optimized GeoTIFF' },
        ],
      },
      {
        id: AttributeNames.consolidationPeriod,
        title: FormatedAttributeNames.consolidationPeriod(),
        render: MultiSelectInput,
        getOptions: () => [
          AttributeConsolidationPeriodValues.RT0,
          AttributeConsolidationPeriodValues.RT1,
          AttributeConsolidationPeriodValues.RT2,
          AttributeConsolidationPeriodValues.RT5,
          AttributeConsolidationPeriodValues.RT6,
        ],
      },
      {
        id: AttributeNames.datasetIdentifier,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.datasetIdentifier(),
      },
      {
        id: AttributeNames.productType,
        render: DefaultInput,
        type: 'text',
        placeholder: FormatedAttributeNames.productType(),
      },
    ],
  },
];

function transformToRecursive(collections) {
  return collections.map((collection) => {
    const result = { ...collection };
    result.type = 'collection';
    result.items = [];

    // Transform instruments to items
    if (Array.isArray(collection.instruments)) {
      collection.instruments.forEach((instrument) => {
        const transformedInstrument = { ...instrument };
        transformedInstrument.type = 'instrument';
        transformedInstrument.items = [];

        // Transform product types to items
        if (Array.isArray(instrument.productTypes)) {
          instrument.productTypes.forEach((productType) => {
            const transformedProductType = { ...productType };
            transformedProductType.type = 'productType';
            transformedProductType.items = [];
            transformedInstrument.items.push(transformedProductType);
          });
        }

        // Remove original product types property
        delete transformedInstrument.productTypes;

        result.items.push(transformedInstrument);
      });
    }

    // Remove original instruments property
    delete result.instruments;

    return result;
  });
}

const recursiveCollections = transformToRecursive(collections);
recursiveCollections.push(...recursiveCollectionCLMS);
export { recursiveCollections };
