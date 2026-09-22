import {
  DEFAULT_THEME_ID,
  MODE_THEMES_LIST,
  RRD_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
} from '../const';
import { isDefaultConfigurationReachable, isDefaultConfigurationSelected } from './themes.utils';

describe('isDefaultConfigurationSelected', () => {
  test('is true for the default theme in the mode themes list', () => {
    expect(isDefaultConfigurationSelected(MODE_THEMES_LIST, DEFAULT_THEME_ID)).toBe(true);
  });

  test('is false for another theme in the mode themes list', () => {
    expect(isDefaultConfigurationSelected(MODE_THEMES_LIST, 'AGRICULTURE')).toBe(false);
  });

  test.each([USER_INSTANCES_THEMES_LIST, URL_THEMES_LIST, RRD_INSTANCES_THEMES_LIST])(
    'is false for the default theme id in the %s list, since theme ids are not unique across lists',
    (themesListId) => {
      expect(isDefaultConfigurationSelected(themesListId, DEFAULT_THEME_ID)).toBe(false);
    },
  );

  test.each([
    [undefined, undefined],
    [null, null],
    [MODE_THEMES_LIST, null],
    [null, DEFAULT_THEME_ID],
  ])('is false when either argument is missing (%p, %p)', (themesListId, themeId) => {
    expect(isDefaultConfigurationSelected(themesListId, themeId)).toBe(false);
  });
});

describe('isDefaultConfigurationReachable', () => {
  test('is true when no url themes list is in play', () => {
    expect(isDefaultConfigurationReachable([])).toBe(true);
  });

  test.each([[undefined], [null]])('is true for %p, treated as no url themes list', (urlThemesList) => {
    expect(isDefaultConfigurationReachable(urlThemesList)).toBe(true);
  });

  test('is false when a url themes list replaced the mode themes list', () => {
    expect(isDefaultConfigurationReachable([{ id: 'URL-THEME' }])).toBe(false);
  });
});
