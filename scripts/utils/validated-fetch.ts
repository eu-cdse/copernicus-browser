/**
 * Wraps a single page fetch with payload validation and a fixed-delay retry, for endpoints that
 * can return HTTP 200 with a malformed body -- e.g. Keycloak's admin "users per role" endpoint,
 * which (per CloudFerro) aborts a request that runs past its ~5-minute server-side limit while the
 * response is still streaming, appending a trailing error object to the truncated JSON. Axios's
 * default lenient JSON parsing then silently returns that unparseable body as a raw string instead
 * of throwing, so a caller that trusts the payload shape (e.g. `res.data ?? []`) would otherwise
 * treat the string's individual characters as "users" with no error at all.
 *
 * A genuinely empty page (`[]`) passes validation -- this only rejects a payload that isn't an
 * array of objects with a truthy `id`, it never changes what counts as "end of pagination" (see
 * scripts/utils/pagination.ts's drainOffsetPages for that).
 */
export const MAX_PAGE_ATTEMPTS = 3;
export const PAGE_RETRY_DELAY_MS = 5000;

export const isValidPage = <T extends { id?: unknown }>(data: unknown): data is T[] =>
  Array.isArray(data) &&
  data.every((item) => item != null && typeof item === 'object' && !!(item as { id?: unknown }).id);

export const fetchValidatedPage = async <T extends { id?: unknown }>(
  fetchPage: () => Promise<unknown>,
  label: string,
  attempts = MAX_PAGE_ATTEMPTS,
  delayMs = PAGE_RETRY_DELAY_MS,
): Promise<T[]> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const data = await fetchPage();
      if (isValidPage<T>(data)) {
        return data;
      }
      lastError = new Error(
        `${label}: page is not a valid array of objects with a truthy "id" (attempt ${attempt}/${attempts})`,
      );
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};
