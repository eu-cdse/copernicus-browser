import {
  S5_AER_AI,
  S5_AER_AI_CDAS,
  S5_CH4,
  S5_CH4_CDAS,
  S5_CLOUD,
  S5_CLOUD_CDAS,
  S5_CO,
  S5_CO_CDAS,
  S5_HCHO,
  S5_HCHO_CDAS,
  S5_NO2,
  S5_NO2_CDAS,
  S5_O3,
  S5_O3_CDAS,
  S5_SO2,
  S5_SO2_CDAS,
} from '../dataSourceConstants';

// function is used by Sentinel5PDataSourceHandler and update-previews
export const getS5ProductType = (datasetId) => {
  switch (datasetId) {
    case S5_O3:
    case S5_O3_CDAS:
      return 'O3';
    case S5_NO2:
    case S5_NO2_CDAS:
      return 'NO2';
    case S5_SO2:
    case S5_SO2_CDAS:
      return 'SO2';
    case S5_CO:
    case S5_CO_CDAS:
      return 'CO';
    case S5_HCHO:
    case S5_HCHO_CDAS:
      return 'HCHO';
    case S5_CH4:
    case S5_CH4_CDAS:
      return 'CH4';
    case S5_AER_AI:
    case S5_AER_AI_CDAS:
      return 'AER_AI';
    case S5_CLOUD:
    case S5_CLOUD_CDAS:
      return 'CLOUD';
    default:
      return 'CLOUD';
  }
};
