import { t } from 'ttag';

export const HRSI_GFSC_BANDS = [
  {
    name: 'GF',
    getDescription: () => t`Fractional Snow Cover (Gap-filled)`,
  },
  {
    name: 'QC',
    getDescription: () => t`Fractional Snow Cover (Gap-filled) Quality`,
  },
  {
    name: 'QCFLAGS',
    getDescription: () => t`Quality Flags`,
  },
];
