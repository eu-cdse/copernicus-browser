import {
  COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  S1_MONTHLY_MOSAIC_DH,
  S1_MONTHLY_MOSAIC_IW,
} from './dataSourceConstants';

type MosaicAvailabilityEntry = {
  minDate: string;
  maxDate: string | null;
  displayRange: string;
};

// Single source of truth for mosaic data availability.
// Update minDate/maxDate (ISO strings for the date picker) and displayRange
// (human-readable label used in tooltips) here whenever new data is ingested.
export const MOSAIC_AVAILABILITY: Record<string, MosaicAvailabilityEntry> = {
  [S1_MONTHLY_MOSAIC_DH]: {
    minDate: '2014-10-01',
    maxDate: null,
    displayRange: 'Oct 2014 – Apr 2026',
  },
  [S1_MONTHLY_MOSAIC_IW]: {
    minDate: '2014-10-01',
    maxDate: null,
    displayRange: 'Oct 2014 – Apr 2026',
  },
  [COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC]: {
    minDate: '2020-01-01',
    maxDate: '2021-01-01',
    displayRange: '2020, 2021',
  },
  [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: {
    minDate: '2015-07-01',
    maxDate: null,
    displayRange: 'Jul 2015 – Jan 2026',
  },
};
