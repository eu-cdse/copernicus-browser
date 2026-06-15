// Browser storage keys shared between the app and the e2e test fixtures.
//
// This module intentionally has NO imports so it can be imported from the
// Playwright fixtures (e2e/) without dragging in the app's dependency graph
// (ttag, theme assets, etc.) that a full `src/const.ts` import would pull in.
// Keep it dependency-free.

// sessionStorage key holding the persisted advanced-search config. The sidebar
// tab restored on page refresh is derived from this entry (read in
// Tools.componentDidMount and AdvancedSearch.componentDidMount).
export const ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY = 'cdsebrowser_search_config';
