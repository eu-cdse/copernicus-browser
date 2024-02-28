import { t } from 'ttag';

export const HRSI_WDS_BANDS = [
  {
    name: 'SSC',
    getDescription: () => t`Snow State Classification`,
  },
  {
    name: 'QCSSC',
    getDescription: () => t`Snow State Classification Quality`,
  },
];
