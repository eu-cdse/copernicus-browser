import { ProviderModeSupport } from '../../../Tools/RapidResponseDesk/rapidResponseProperties';

export const AttributePolarisationChannelsValuesRRD = {
  HH: { value: 'HH', label: 'HH', mode: [ProviderModeSupport.archive, ProviderModeSupport.tasking] },

  HV: { value: 'HV', label: 'HV', mode: [ProviderModeSupport.archive, ProviderModeSupport.tasking] },

  VV: { value: 'VV', label: 'VV', mode: [ProviderModeSupport.archive, ProviderModeSupport.tasking] },

  VH: { value: 'VH', label: 'VH', mode: [ProviderModeSupport.archive, ProviderModeSupport.tasking] },

  VH_VV: { value: 'VH_VV', label: 'VH+VV', mode: [ProviderModeSupport.tasking] },

  VV_VH: { value: 'VV_HV', label: 'VV+HV', mode: [ProviderModeSupport.tasking] },

  HH_HV: { value: 'HH_HV', label: 'HH+HV', mode: [ProviderModeSupport.tasking] },

  HH_VV: { value: 'HH_VV', label: 'HH+VV', mode: [ProviderModeSupport.tasking] },

  HH_HV_VV_VH: {
    value: 'HH_HV_VV_VH',
    label: 'HH+HV+VV+VH',
    mode: [ProviderModeSupport.tasking],
  },
};

export const AttributeInstrumentModesValuesRRD = {
  SAR_ST_S: { value: 'SAR_ST_S', label: 'Spotlight' },
  SAR_HS_S_300: { value: 'SAR_HS_S_300', label: 'High Resolution Spotlight' },
  SAR_SM_S: { value: 'SAR_SM_S', label: 'Single Polarization Stripmap' },
  SAR_SM_D: { value: 'SAR_SM_D', label: 'Dual Polarization Stripmap' },
  SAR_SC_S: { value: 'SAR_SC_S', label: 'ScanSAR' },
  SAR_WS_S: { value: 'SAR_WS_S', label: 'Wide ScanSAR' },
  SAR_HS_D_150: { value: 'SAR_HS_D_150', label: 'High Resolution Dual Polarization Spotlight' },
  Spotlight_2: { value: 'Spotlight-2', label: 'Spotlight-2' },
  StripMap_HIMAGE: { value: 'StripMap', label: 'StripMap HIMAGE' },
  PingPong: { value: 'PingPong', label: 'PingPong' },
  ScanSAR_Wide: { value: 'ScanSAR Wide', label: 'ScanSAR Wide' },
  ScanSAR_Huge: { value: 'ScanSAR Huge', label: 'ScanSAR Huge' },
  Spotlight_2B: { value: 'Spotlight-2B', label: 'Spotlight-2B' },
  Spotlight_2C: { value: 'Spotlight-2C', label: 'Spotlight-2C' },
  Spotlight_OQS: { value: 'Spotlight-2 OQS', label: 'Spotlight-2 OQS' },
  StripMap: { value: 'StripMap', label: 'StripMap' },
  Quadpol: { value: 'Quadpol', label: 'Quadpol' },
  ScanSAR_1: { value: 'ScanSAR-1', label: 'ScanSAR-1' },
  ScanSAR_2: { value: 'ScanSAR-2', label: 'ScanSAR-2' },
  Wide_Ultrafine: { value: 'Wide Ultrafine', label: 'Wide Ultrafine' },
  Wide_Multi_Look_Fine: { value: 'Wide Multi-Look Fine', label: 'Wide Multi-Look Fine' },
  Wide: { value: 'Wide', label: 'Wide' },
  Ultrafine: { value: 'Ultrafine', label: 'Ultrafine' },
  Multi_Look_Fine: { value: 'Multi-Look Fine', label: 'Multi-Look Fine' },
  spotlight_extended_dwell: { value: 'SPOTLIGHT_EXTENDED_DWELL', label: 'Dwell' },
  spotlight: { value: 'SPOTLIGHT', label: 'Spot' },
  stripmap: { value: 'STRIPMAP', label: 'Strip' },
  scan: { value: 'SCAN', label: 'Scan' },
};
