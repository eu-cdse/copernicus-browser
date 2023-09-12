import { t } from 'ttag';

export const CNES_LAND_COVER_BANDS = [
  {
    name: 'OCS',
    getDescription: () => t`Main discrete classification according to 23-categories nomenclature`,
    color: '',
  },
  {
    name: 'OCS_Confidence',
    getDescription: () => t`The confidence of the classifier`,
    color: '',
  },
  {
    name: 'OCS_Validity',
    getDescription: () => t`The number of cloudless images`,
    color: '',
  },
];
