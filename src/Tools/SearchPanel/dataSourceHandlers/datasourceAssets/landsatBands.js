import { t } from 'ttag';
import { CDAS_L8_L9_LOTL1, CDAS_LANDSAT_MOSAIC } from '../dataSourceConstants';

import { BAND_UNIT } from '../dataSourceConstants';

const L8_L9_LOTL1_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Blue (450-520 nm)`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 482,
  },
  {
    name: 'B02',
    getDescription: () => t`Green (520-600 nm)`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 561,
  },
  {
    name: 'B03',
    getDescription: () => t`Red (630-690 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 655,
  },
  {
    name: 'B04',
    getDescription: () => t`Near Infrared (NIR) (760-900 nm)`,
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

const CDAS_LANDSAT_MOSAIC_BANDS = [
  {
    name: 'B01',
    getDescription: () => t`Blue (450-520 nm)`,
    color: '#699aff',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 482,
  },
  {
    name: 'B02',
    getDescription: () => t`Green (520-600 nm)`,
    color: '#a4d26f',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 561,
  },
  {
    name: 'B03',
    getDescription: () => t`Red (630-690 nm)`,
    color: '#e47121',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 655,
  },
  {
    name: 'B04',
    getDescription: () => t`Near Infrared (NIR) (760-900 nm)`,
    color: '#c31e20',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 865,
  },
  {
    name: 'B05',
    getDescription: () => t`Shortwave Infrared (SWIR) 1 (1550-1750 nm)`,
    color: '#990134',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 1609,
  },
  {
    name: 'B06',
    getDescription: () => t`Shortwave Infrared (SWIR) 2 (2080-2350 nm)`,
    color: '#800000',
    unit: BAND_UNIT.REFLECTANCE,
    centralWL: 2215,
  },
  {
    name: 'B07',
    getDescription: () => t`Thermal Infrared (10400-12500 nm)`,
    color: '#d51234',
    unit: BAND_UNIT.REFLECTANCE,
  },
  {
    name: 'clear_sky_mask',
    getDescription: () => '',
    color: '#d51234',
    unit: BAND_UNIT.KELVIN,
  },
];

export const getLandsatBandForDataset = (datasetId) => {
  switch (datasetId) {
    case CDAS_L8_L9_LOTL1:
      return L8_L9_LOTL1_BANDS;
    case CDAS_LANDSAT_MOSAIC:
      return CDAS_LANDSAT_MOSAIC_BANDS;
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
