import { t } from 'ttag';

export const ADDITIONAL_FILTERS_ENABLED = true;

export const ErrorCode = {
  noResults: 'noResults',
  noMatchingProducts: 'noMatchingProducts',
  selectSearchCriteria: 'selectSearchCriteria',
  invalidTimeRange: 'invalidTimeRange',
  invalidDateRange: 'invalidDateRange',
};

export const ErrorMessage = {
  [ErrorCode.noResults]: () =>
    t`No products were found for the selected time range and area. To search for products select a time range within an area where data is displayed on the map first.`,
  [ErrorCode.noMatchingProducts]: () =>
    t`No products were found for the selected search parameters.\n\nTo get more results, try selecting more data sources, extending the time range and/or selecting a larger area on the map.`,
  [ErrorCode.selectSearchCriteria]: () => t`Please select at least one search criteria!`,
  [ErrorCode.invalidTimeRange]: () => t`Invalid time range!`,
  [ErrorCode.invalidDateRange]: () => t`Invalid date range!`,
};
