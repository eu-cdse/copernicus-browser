import { t } from 'ttag';

export const HRSI_RLIE_BANDS = [
  {
    name: 'QC',
    getDescription: () => t`River and Lake Ice Extent Quality`,
  },
  {
    name: 'RLIE',
    getDescription: () => t`River and Lake Ice Extent`,
  },
  {
    name: 'QCFLAGS',
    getDescription: () => t`Quality Flags`,
  },
];
