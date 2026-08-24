import { persistSearchConfig, resetSearchConfigPersistenceForTests } from './searchConfigPersistence';
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
});
