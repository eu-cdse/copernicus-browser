import { t } from 'ttag';

export const GLOBAL_LAND_COVER_BANDS = [
  {
    name: 'Discrete_Classification_map',
    getDescription: () => t`Main discrete land cover classification according to FAO LCCS scheme`,
    color: '',
  },
  {
    name: 'Discrete_Classification_proba',
    getDescription: () => t`Classification probability, a quality indicator for the discrete classification`,
    color: '',
  },
  {
    name: 'Forest_Type_layer',
    getDescription: () => t`Forest type for all pixels where tree cover fraction is bigger than 1 %`,
    color: '',
  },
  {
    name: 'Bare_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the bare and sparse vegetation class`,
    color: '#cccccc',
  },
  {
    name: 'Crops_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the cropland class`,
    color: '#ffe6a6',
  },
  {
    name: 'Grass_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the herbaceous vegetation class`,
    color: '#ccf24d',
  },
  {
    name: 'MossLichen_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the moss & lichen class`,
    color: '#a6ff80',
  },
  {
    name: 'Shrub_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the shrubland class`,
    color: '#a6f200',
  },
  {
    name: 'Snow_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the snow & ice class`,
    color: '#a6e6cc',
  },
  {
    name: 'Tree_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the forest class`,
    color: '#00a600',
  },
  {
    name: 'BuiltUp_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the built-up class`,
    color: '#e6004d',
  },
  {
    name: 'PermanentWater_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the permanent inland water bodies class`,
    color: '#4c17e2',
  },
  {
    name: 'SeasonalWater_CoverFraction_layer',
    getDescription: () => t`Fractional cover (%) for the seasonal inland water bodies class`,
    color: '#00ccf2',
  },
  {
    name: 'DataDensityIndicator',
    getDescription: () =>
      t`Data density indicator showing quality of the EO input data (0 = bad, 100 = perfect data)`,
    color: '',
  },
  {
    name: 'Change_Confidence_layer',
    getDescription:
      () => t`Quality layer regarding the change detection of the current mapped year to the previous mapped year. It is a 3 level confidence mask for all CONSO and NRT maps with value definitions as:
0 = No change.
1 - Potential confidence.
2 - Medium confidence.
3 = High confidence.
NOTE: The values of Change_Confidence_layer band in 2015 data are not shown correctly, therefore this band in 2015 data should not be used.`,
    color: '',
  },
];
