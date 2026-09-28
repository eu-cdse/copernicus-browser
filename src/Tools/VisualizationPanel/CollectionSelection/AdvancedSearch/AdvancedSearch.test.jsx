import { AdvancedSearch } from './AdvancedSearch';
import { ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY } from '../../../../const';

// Regression test for issue #1270's review round 2: dispatchSearchResult used to persist a
// brand-new session-config object with no spread of the existing entry, unlike its sibling call
// sites (backToSearch, ResultItem.jsx). Since AdvancedSearch stays mounted (but hidden) while
// another tab is active, and dispatchSearchResult can fire reactively on a fresh login with a
// cached search result regardless of the visible tab, this could silently clobber
// Tools.jsx's shouldShowRapidResponseDeskTab session record from anywhere.
describe('AdvancedSearch.dispatchSearchResult — does not clobber the shared session record (#1270)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('preserves an unrelated field already persisted by another tab', () => {
    sessionStorage.setItem(
      ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY,
      JSON.stringify({ shouldShowRapidResponseDeskTab: true }),
    );
    const advancedSearch = new AdvancedSearch({});

    advancedSearch.dispatchSearchResult({ allResults: [], totalCount: 0, hasMore: false });

    const persisted = JSON.parse(sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY));
    expect(persisted.shouldShowRapidResponseDeskTab).toBe(true);
    expect(persisted.resultsAvailable).toBe(true);
  });
});
