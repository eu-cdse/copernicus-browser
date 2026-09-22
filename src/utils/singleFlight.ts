// Dedupes concurrent requests for the same key so a double click, a re-render, or several
// components asking for the same resource at once share one in-flight promise instead of each
// firing their own request.
export function singleFlight<T>(
  inFlight: Map<string, Promise<T>>,
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) {
    return existing;
  }
  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
