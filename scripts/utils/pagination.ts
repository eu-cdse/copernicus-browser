/**
 * Page through an offset-paginated endpoint (offset = page * pageSize) until a short page
 * signals the end, or bail out at maxPages so a misbehaving endpoint (e.g. always returning a
 * full page) can never loop forever.
 *
 * Not a fit for cursor-paginated endpoints (e.g. `links.next`) -- see
 * scripts/utils/byoc-api.js's fetchAllData for that shape instead.
 */
export const drainOffsetPages = async <T>(
  fetchPage: (offset: number) => Promise<T[]>,
  pageSize: number,
  maxPages: number,
  warnLabel: string,
): Promise<T[]> => {
  const all: T[] = [];
  for (let page = 0; page < maxPages; page++) {
    const items = await fetchPage(page * pageSize);
    all.push(...items);
    if (items.length < pageSize) {
      return all;
    }
  }
  console.warn(`${warnLabel}: stopped at the ${maxPages}-page safety cap`);
  return all;
};
