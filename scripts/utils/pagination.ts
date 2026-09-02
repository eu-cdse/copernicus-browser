/**
 * Page through an offset-paginated endpoint until a page comes back empty, or bail out (throwing,
 * so a caller never silently syncs/acts on a partial read) at maxPages so a misbehaving endpoint
 * (e.g. always returning a full page) can never loop forever.
 *
 * Offset advances by the number of items actually received, not by an assumed `page * pageSize`,
 * and a page is only treated as final when it's empty (not merely shorter than requested) -- a
 * server/gateway that silently clamps the requested page size (e.g. Keycloak capping `max`) would
 * otherwise return a "short" page that looks identical to a genuine end-of-list, silently
 * truncating the result. This costs at most one extra request per resource (to observe the empty
 * page) in the un-clamped case.
 *
 * Not a fit for cursor-paginated endpoints (e.g. `links.next`) -- see
 * scripts/utils/byoc-api.js's fetchAllData for that shape instead.
 */
export const drainOffsetPages = async <T>(
  fetchPage: (offset: number) => Promise<T[]>,
  maxPages: number,
  warnLabel: string,
): Promise<T[]> => {
  const all: T[] = [];
  let offset = 0;
  for (let page = 0; page < maxPages; page++) {
    const items = await fetchPage(offset);
    if (items.length === 0) {
      return all;
    }
    all.push(...items);
    offset += items.length;
  }
  // Hit without a caller-visible way to tell "still more data" from "actually done" -- throwing
  // (rather than warning and returning the partial list) stops a caller from computing a diff off
  // data it doesn't know is incomplete, which for an ACL/membership sync means silently mass-adding
  // or mass-revoking access.
  throw new Error(`${warnLabel}: stopped at the ${maxPages}-page safety cap without an empty page`);
};
