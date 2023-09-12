import { t } from 'ttag';

export const HRSI_FSC_BANDS = [
  {
    name: 'CLD',
    getDescription: () => t`Cloud Mask`,
  },
  {
    name: 'NDSI',
    getDescription: () => t`Normalised Difference Snow Index`,
  },
  {
    name: 'QCOG',
    getDescription: () => t`Fractional Snow Cover On Ground Quality`,
  },
  {
    name: 'FSCOG',
    getDescription: () => t`Fractional Snow Cover On Ground`,
  },
  {
    name: 'QCTOC',
    getDescription: () => t`Fractional Snow Cover Top Of Canopy Quality`,
  },
  {
    name: 'FSCTOC',
    getDescription: () => t`Fractional Snow Cover Top Of Canopy`,
  },
  {
    name: 'QCFLAGS',
    getDescription: () => t`Quality Flags`,
  },
];
