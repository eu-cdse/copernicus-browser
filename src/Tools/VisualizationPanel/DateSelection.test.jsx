import { mapStoreToProps } from './DateSelection';

// These props gate the silent latest-date lookup (#1290). `authenticated` once read a field that
// does not exist in the auth slice, so it was always false and the lookup never ran in the real app
// even though the component tests passed.
jest.mock('../SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getDataSourceHandler: () => null,
}));

const baseState = (auth, selectedThemeId = 'DEFAULT-THEME') => ({
  mainMap: { zoom: 11, bounds: { _southWest: {}, _northEast: {} }, pixelBounds: null },
  visualization: {
    visualizationUrl: null,
    fromTime: null,
    toTime: null,
    datasetId: 'S2_L2A_CDAS',
    layerId: '1_TRUE_COLOR',
    dateMode: 'SINGLE',
    orbitDirection: undefined,
    cloudCoverage: 30,
    pendingLatestDate: true,
  },
  language: { selectedLanguage: 'en' },
  collapsiblePanel: { datePanelExpanded: false },
  clms: { selected: false },
  themes: { dataSourcesInitialized: true, selectedThemeId },
  auth,
});

const loggedOut = { user: { access_token: null }, anonToken: null };

describe('DateSelection mapStoreToProps (#1290)', () => {
  it('is authenticated with a logged-in user token', () => {
    const props = mapStoreToProps(baseState({ user: { access_token: 'user-token' }, anonToken: null }));
    expect(props.authenticated).toBe(true);
  });

  it('is authenticated with an anonymous token', () => {
    const props = mapStoreToProps(baseState({ user: { access_token: null }, anonToken: 'anon-token' }));
    expect(props.authenticated).toBe(true);
  });

  it('is not authenticated without any token', () => {
    expect(mapStoreToProps(baseState(loggedOut)).authenticated).toBe(false);
  });

  it('is not authenticated before a theme is selected, like App.jsx', () => {
    const props = mapStoreToProps(baseState({ user: { access_token: 'user-token' }, anonToken: null }, null));
    expect(props.authenticated).toBe(false);
  });

  it('passes the pending flag and data source readiness through', () => {
    const props = mapStoreToProps(baseState(loggedOut));
    expect(props.pendingLatestDate).toBe(true);
    expect(props.dataSourcesInitialized).toBe(true);
  });
});
