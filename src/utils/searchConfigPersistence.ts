import { ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY } from '../constants/storageKeys';

// Latched (not retried) after the first quota failure: STAC "Load more" pages can accumulate
// enough raw payload that sessionStorage.setItem throws QuotaExceededError. Once that happens,
// further attempts this session are skipped rather than crashing the render tree again.
let persistDisabled = false;

export function persistSearchConfig(config: Record<string, unknown>): void {
  if (persistDisabled) {
    return;
  }
  try {
    sessionStorage.setItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    persistDisabled = true;
    console.warn('Could not persist search config, disabling further writes for this session:', e);
  }
}

export function resetSearchConfigPersistenceForTests(): void {
  persistDisabled = false;
}
