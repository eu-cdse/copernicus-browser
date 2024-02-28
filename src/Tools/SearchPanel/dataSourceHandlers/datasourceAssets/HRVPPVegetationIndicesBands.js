import { t } from 'ttag';

export const HR_VPP_VEGETATION_INDICES_BANDS = [
  {
    name: 'PPI',
    getDescription: () => t`Plant Phenology Index`,
  },
  {
    name: 'NDVI',
    getDescription: () => t`Normalized Difference Vegetation Index`,
  },
  {
    name: 'FAPAR',
    getDescription: () => t`Fraction of Absorbed Photosynthetically Active Radiation`,
  },
  {
    name: 'LAI',
    getDescription: () => t`Leaf Area Index`,
  },
  {
    name: 'QFLAG2',
    getDescription: () => t`Quality Flag`,
  },
];
