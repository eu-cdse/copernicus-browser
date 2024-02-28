import { t } from 'ttag';

export const HRSI_PSA_BANDS = [
  {
    name: 'QC',
    getDescription: () => t`Persistent Snow Area Quality`,
  },
  {
    name: 'PSA',
    getDescription: () => t`Persistent Snow Area`,
  },
];
