// Shared timeout budgets for live-backend Playwright waits. The live CDSE backend
// occasionally responds slowly or rate-limits under CI, so waits against it need more
// headroom than Playwright's 30s default action timeout provides.
export const LIVE_REQUEST_TIMEOUT = 45_000;

// For specs with multiple chained live waits (e.g. navigation + search + tile load),
// the sum of individual wait budgets can exceed the default 30s test timeout.
export const HEAVY_TEST_TIMEOUT = 90_000;

// For the setup availability check of the live services: a healthy service answers within a few
// seconds, so a longer wait means it is down or overloaded and the run should not start.
export const BACKEND_PROBE_TIMEOUT = 10_000;

// For UI-only assertions (e.g. a radio becoming checked after a client-side redirect) that
// don't wait on a live backend request but still need more than Playwright's 5s assertion default.
export const UI_ASSERTION_TIMEOUT = 15_000;
