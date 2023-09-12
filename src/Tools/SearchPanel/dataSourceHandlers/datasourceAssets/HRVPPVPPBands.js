import { t } from 'ttag';

export const HR_VPP_VPP_BANDS = [
  {
    name: 'SOSD',
    getDescription: () => t`Day of start-of-season`,
  },
  {
    name: 'EOSD',
    getDescription: () => t`Day of end-of-season`,
  },
  {
    name: 'MAXD',
    getDescription: () => t`Day of maximum-of-season`,
  },
  {
    name: 'SOSV',
    getDescription: () => t`Vegetation index value at SOSD`,
  },
  {
    name: 'EOSV',
    getDescription: () => t`Vegetation index value at EOSD`,
  },
  {
    name: 'MAXV',
    getDescription: () => t`Vegetation index value at MAXD`,
  },
  {
    name: 'MINV',
    getDescription: () => t`Average vegetation index value of minima on left and right sides of each season`,
  },
  {
    name: 'AMPL',
    getDescription: () => t`Season amplitude (MAXV – MINV)`,
  },
  {
    name: 'LENGTH',
    getDescription: () => t`Length of Season (number of days between start and end)`,
  },
  {
    name: 'LSLOPE',
    getDescription: () => t`Slope of the greening up period`,
  },
  {
    name: 'RSLOPE',
    getDescription: () => t`Slope of the senescent period`,
  },
  {
    name: 'SPROD',
    getDescription: () =>
      t`Seasonal productivity. The growing season integral computed as the sum of all daily values between SOSD and EOSD`,
  },
  {
    name: 'TPROD',
    getDescription: () =>
      t`Total productivity. The growing season integral computed as sum of all daily values minus their base level value.`,
  },
  {
    name: 'QFLAG',
    getDescription: () => t`Quality Flag`,
  },
];
