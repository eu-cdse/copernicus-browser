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

// Centralizes the parse (and its corrupted-entry handling) so every reader gets the same safe
// behaviour instead of each call site re-implementing (and sometimes forgetting) it.
export function readSearchConfig(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Reads the current entry and spreads it under `partial` before writing, so a caller that only
// cares about a couple of fields can never accidentally clobber the rest of the persisted config —
// the bug this MR fixed at one call site (issue #1270 review) was exactly this spread being skipped.
export function mergeSearchConfig(partial: Record<string, unknown>): void {
  persistSearchConfig({ ...readSearchConfig(), ...partial });
}

export function resetSearchConfigPersistenceForTests(): void {
  persistDisabled = false;
}
