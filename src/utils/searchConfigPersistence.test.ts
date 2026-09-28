import {
  persistSearchConfig,
  readSearchConfig,
  mergeSearchConfig,
  resetSearchConfigPersistenceForTests,
} from './searchConfigPersistence';
import { ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY } from '../constants/storageKeys';

describe('searchConfigPersistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetSearchConfigPersistenceForTests();
  });

  describe('persistSearchConfig', () => {
    test('writes the serialized config to the correct sessionStorage key', () => {
      const config = { datasourceId: 'S2', page: 2 };
      persistSearchConfig(config);
      expect(sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY)).toBe(JSON.stringify(config));
    });

    test('degrades gracefully when storage throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => persistSearchConfig({ datasourceId: 'S2' })).not.toThrow();
      expect(warn).toHaveBeenCalled();
      spy.mockRestore();
      warn.mockRestore();
    });

    test('stops attempting to write after the first failure (latch)', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      persistSearchConfig({ datasourceId: 'S2' });
      expect(spy).toHaveBeenCalledTimes(1);
      persistSearchConfig({ datasourceId: 'S2' });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
      warn.mockRestore();
    });

    test('resumes writing after resetSearchConfigPersistenceForTests is called', () => {
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      persistSearchConfig({ datasourceId: 'S2' });
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
      warn.mockRestore();

      resetSearchConfigPersistenceForTests();

      const config = { datasourceId: 'S3' };
      persistSearchConfig(config);
      expect(sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY)).toBe(JSON.stringify(config));
    });
  });

  describe('readSearchConfig', () => {
    test('returns null when nothing is persisted', () => {
      expect(readSearchConfig()).toBeNull();
    });

    test('returns the parsed config when one is persisted', () => {
      persistSearchConfig({ datasourceId: 'S2', page: 2 });
      expect(readSearchConfig()).toEqual({ datasourceId: 'S2', page: 2 });
    });

    test('returns null instead of throwing on a corrupted entry', () => {
      sessionStorage.setItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY, '{not valid json');
      expect(readSearchConfig()).toBeNull();
    });
  });

  describe('mergeSearchConfig', () => {
    test('spreads the existing entry before applying the partial update', () => {
      persistSearchConfig({ shouldShowAdvancedSearchTab: true, cachedResults: ['a'] });
      mergeSearchConfig({ shouldShowRapidResponseDeskTab: true });
      expect(readSearchConfig()).toEqual({
        shouldShowAdvancedSearchTab: true,
        cachedResults: ['a'],
        shouldShowRapidResponseDeskTab: true,
      });
    });

    test('writes just the partial when nothing was previously persisted', () => {
      mergeSearchConfig({ shouldShowRapidResponseDeskTab: true });
      expect(readSearchConfig()).toEqual({ shouldShowRapidResponseDeskTab: true });
    });
  });
});
