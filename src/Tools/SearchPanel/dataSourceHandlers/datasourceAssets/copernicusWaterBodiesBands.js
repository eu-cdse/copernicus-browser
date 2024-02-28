import { t } from 'ttag';

export const WATER_BODIES_BANDS = [
  {
    name: 'WB',
    getDescription: () => t`Main Water Bodies detection layer showing water pixels and non-water pixels
0 = Sea
70 = Water
251 = No data
255 = No water`,
    color: '',
  },
  {
    name: 'QUAL',
    getDescription: () => t`Quality layer which gives information on water bodies occurrence
0 = Sea
71 = Very low occurence
72 = Low occurence
73 = Medium occurence
74 = High occurence
75 = Very high occurence
76 = Permanent occurence
251 = No data
252 = Cloud
255 = Not water`,
    color: '',
  },
];
