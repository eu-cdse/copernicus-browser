import { t } from 'ttag';
import {
  AWS_L8L1C,
  AWS_LOTL1,
  AWS_LOTL2,
  AWS_LTML1,
  AWS_LTML2,
  AWS_LMSSL1,
  AWS_LETML1,
  AWS_LETML2,
} from '../dataSourceConstants';

import { BAND_UNIT } from '../dataSourceConstants';

export const L8_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Band 1 - Coastal/Aerosol - 433-453 nm`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 443,
  },
  {
    name: 'B02',
    getDescription: () => t`Band 2 - Blue - 450-515 nm`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 482,
  },
  {
    name: 'B03',
    getDescription: () => t`Band 3 - Green - 525-600 nm`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 561.5,
  },
  {
    name: 'B04',
    getDescription: () => t`Band 4 - Red - 630-680 nm`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 654.5,
  },
  {
    name: 'B05',
    getDescription: () => t`Band 5 - NIR - 845-885 nm`,
    color: '#c31e20',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 865,
  },
  {
    name: 'B06',
    getDescription: () => t`Band 6 - SWIR-1 - 1560-1660 nm`,
    color: '#990134',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 1608.5,
  },
  {
    name: 'B07',
    getDescription: () => t`Band 7 - SWIR-2 - 2100-2300 nm`,
    color: '#800000',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 2200.5,
  },
  {
    name: 'B08',
    getDescription: () => t`Band 8 - Panchromatic - 500-680 nm`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 589.5,
  },
  {
    name: 'B09',
    getDescription: () => t`Band 9 - Cirrus - 1360-1390 nm`,
    color: '#d71234',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 1373.5,
  },
  {
    name: 'B10',
    getDescription: () => t`Band 10 - Thermal Infrared (TIRS) - 10895 nm`,
    color: '#d51234',
    unit: BAND_UNIT.KELVIN,
  },
  {
    name: 'B11',
    getDescription: () => t`Band 11 - Thermal Infrared (TIRS) - 12005 nm`,
    color: '#f76244',
    unit: BAND_UNIT.KELVIN,
  },
];

const L8_LOTL1_BANDS = [...L8_BANDS];

const L8_LOTL2_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Ultra Blue (443 nm)`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 443,
  },
  {
    name: 'B02',
    getDescription: () => t`Blue (482 nm)`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 482,
  },
  {
    name: 'B03',
    getDescription: () => t`Green (561.5 nm)`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 561.5,
  },
  {
    name: 'B04',
    getDescription: () => t`Red (654.5 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 654.5,
  },
  {
    name: 'B05',
    getDescription: () => t`Near Infrared (NIR) (865 nm)`,
    color: '#c31e20',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 865,
  },
  {
    name: 'B06',
    getDescription: () => t`Shortwave Infrared (SWIR) 1 (1608.5 nm)`,
    color: '#990134',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 1608.5,
  },
  {
    name: 'B07',
    getDescription: () => t`Shortwave Infrared (SWIR) 2 (2200.5 nm)`,
    color: '#800000',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 2200.5,
  },

  {
    name: 'B10',
    getDescription: () => t`Thermal Infrared (TIRS) 1(10895 nm)`,
    color: '#d51234',
    unit: BAND_UNIT.KELVIN,
  },
];

const L45_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Blue (450-520 nm)`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 485,
  },
  {
    name: 'B02',
    getDescription: () => t`Green (520-600 nm)`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 560,
  },
  {
    name: 'B03',
    getDescription: () => t`Red (630-690 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 660,
  },
  {
    name: 'B04',
    getDescription: () => t`Near Infrared (NIR) (760-900 nm)`,
    color: '#c31e20',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 830,
  },
  {
    name: 'B05',
    getDescription: () => t`Shortwave Infrared (SWIR) 1 (1550-1750 nm)`,
    color: '#990134',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 1650,
  },
  {
    name: 'B06',
    getDescription: () => t`Thermal Infrared (10400-12500 nm)`,
    color: '#d51234',
    unit: BAND_UNIT.KELVIN,
  },
  {
    name: 'B07',
    getDescription: () => t`Shortwave Infrared (SWIR) 2 (2080-2350 nm)`,
    color: '#800000',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 2215,
  },
];

const LMSSL1_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Green (500-600 nm)	`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 550,
  },
  {
    name: 'B02',
    getDescription: () => t`Red (600-700 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 650,
  },
  {
    name: 'B03',
    getDescription: () => t`Ultra Red (700-800 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 750,
  },

  {
    name: 'B04',
    getDescription: () => t`Near Infrared (NIR) (800-1100 nm)`,
    color: '#c31e20',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 950,
  },
];

const L7ETML1_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Blue (450-520 nm)`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 485,
  },
  {
    name: 'B02',
    getDescription: () => t`Green (520-600 nm)`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 560,
  },
  {
    name: 'B03',
    getDescription: () => t`Red (630-690 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 660,
  },
  {
    name: 'B04',
    getDescription: () => t`Near Infrared (NIR) (760-900 nm)`,
    color: '#c31e20',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 830,
  },
  {
    name: 'B05',
    getDescription: () => t`Shortwave Infrared (SWIR) 1 (1550-1750 nm)`,
    color: '#990134',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 1650,
  },
  {
    name: 'B06_VCID_1',
    getDescription: () => t`Thermal Infrared (10400-12500 nm)`,
    color: '#d51234',
    unit: BAND_UNIT.KELVIN,
  },
  {
    name: 'B06_VCID_2',
    getDescription: () => t`Thermal Infrared (10400-12500 nm)`,
    color: '#d51234',
    unit: BAND_UNIT.KELVIN,
  },
  {
    name: 'B07',
    getDescription: () => t`Shortwave Infrared (SWIR) 2 (2080-2350 nm)`,
    color: '#800000',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 2215,
  },
  {
    name: 'B08',
    getDescription: () => t`Panchromatic (520-900 nm)`,
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 710,
  },
];

const L7ETML2_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Blue (450-520 nm)`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 485,
  },
  {
    name: 'B02',
    getDescription: () => t`Green (520-600 nm)`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 560,
  },
  {
    name: 'B03',
    getDescription: () => t`Red (630-690 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 660,
  },
  {
    name: 'B04',
    getDescription: () => t`Near Infrared (NIR) (760-900 nm)`,
    color: '#c31e20',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 830,
  },
  {
    name: 'B05',
    getDescription: () => t`Shortwave Infrared (SWIR) 1 (1550-1750 nm)`,
    color: '#990134',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 1650,
  },
  {
    name: 'B06',
    getDescription: () => t`Thermal Infrared (10400-12500 nm)`,
    color: '#d51234',
    unit: BAND_UNIT.KELVIN,
  },
  {
    name: 'B07',
    getDescription: () => t`Shortwave Infrared (SWIR) 2 (2080-2350 nm)`,
    color: '#800000',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 2215,
  },
];

export const getLandsatBandForDataset = (datasetId) => {
  switch (datasetId) {
    case AWS_L8L1C:
      return L8_BANDS;
    case AWS_LOTL1:
      return L8_LOTL1_BANDS;
    case AWS_LOTL2:
      return L8_LOTL2_BANDS;
    case AWS_LTML1:
    case AWS_LTML2:
      return L45_BANDS;
    case AWS_LMSSL1:
      return LMSSL1_BANDS;
    case AWS_LETML1:
      return L7ETML1_BANDS;
    case AWS_LETML2:
      return L7ETML2_BANDS;
    default:
      return [];
  }
};
export const getGroupedBands = (datasetId) => {
  let bands = getLandsatBandForDataset(datasetId);
  if (!bands.length) {
    return;
  }
  return {
    [t`Reflectance`]: bands.filter((band) => band.unit === BAND_UNIT.REFLECTANCE),
    [t`Brightness temperature`]: bands.filter((band) => band.unit === BAND_UNIT.KELVIN),
  };
};
