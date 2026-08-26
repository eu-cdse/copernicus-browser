/**
 * Helpers for walking the collection form config tree.
 *
 * The tree nests through `items`: collection -> group -> instrument -> productType. Several call
 * sites need "every node of kind X under this subtree", and each used to hand-roll the same
 * recursion - four copies in ODataHelpers.js, one in STACSearchPayloadBuilder.ts and two in
 * AdvancedSearch.jsx. They differed only in how far down they were willing to look, which is the
 * one thing worth stating explicitly, so that distinction is a named function here rather than an
 * accident of each copy's shape.
 *
 * This module is deliberately dependency-free: collectionFormConfig itself pulls in src/hooks and
 * src/api, so anything both sides can import has to be a leaf (same reasoning as stacCollections.js).
 */

export interface CollectionConfigNode {
  id: string;
  type?: string;
  items?: CollectionConfigNode[];
  [key: string]: unknown;
}

/**
 * Collects every node in the subtree that satisfies `matches`.
 *
 * A matching node is returned as-is and is NOT descended into - the callers all want the outermost
 * node of a kind, and the config never nests a node inside another of the same kind. Anything that
 * does not match is descended into when it has children.
 */
export const findConfigNodes = <T extends CollectionConfigNode>(
  items: T[] | null | undefined,
  matches: (item: T) => boolean,
): T[] =>
  (items ?? []).flatMap((item) => {
    if (!item) {
      return [];
    }
    if (matches(item)) {
      return [item];
    }
    if (Array.isArray(item.items)) {
      return findConfigNodes(item.items as T[], matches);
    }
    return [];
  });

/**
 * Collects every node of the given `type` anywhere in the subtree, however deeply nested.
 */
export const findConfigNodesByType = <T extends CollectionConfigNode>(
  items: T[] | null | undefined,
  type: string,
): T[] => findConfigNodes(items, (item) => item.type === type);

/**
 * Ids of every node of the given `type` in the subtree - findConfigNodesByType, mapped to ids.
 *
 * Callers that only want ids should reach for this rather than mapping themselves, so that the
 * choice between this and findConfigNodeIdsByTypeInScope - which is the part that actually differs
 * between call sites - is the only thing their one-liner says.
 */
export const findConfigNodeIdsByType = (
  items: CollectionConfigNode[] | null | undefined,
  type: string,
): string[] => findConfigNodesByType(items, type).map((item) => item.id);

/**
 * Collects nodes of the given `type` that belong to the *same scope* as `items`.
 *
 * `group` nodes are purely presentational - a heading the UI renders inside its parent - so they
 * are descended through, but `collection` and `instrument` nodes open a new scope and are stopped
 * at. Asking a collection for its product types therefore yields only the ones it owns directly,
 * not those belonging to the instruments beneath it, which each answer for themselves.
 *
 * Contrast findConfigNodesByType, which ignores scope and returns everything in the subtree. Use
 * that one when the question is "what does this collection offer in total", and this one when the
 * answer has to line up with a single level of the selection tree.
 */
export const findConfigNodesByTypeInScope = <T extends CollectionConfigNode>(
  items: T[] | null | undefined,
  type: string,
): T[] =>
  // Matching everything that is not a group is what stops the walk at scope boundaries:
  // findConfigNodes does not descend into a node it has matched, so only groups are traversed.
  findConfigNodes(items, (item) => item.type !== 'group').filter((item) => item.type === type);

/**
 * Ids of the nodes of the given `type` in the same scope as `items` - the scope-respecting
 * counterpart to findConfigNodeIdsByType. See findConfigNodesByTypeInScope for what "scope" means.
 */
export const findConfigNodeIdsByTypeInScope = (
  items: CollectionConfigNode[] | null | undefined,
  type: string,
): string[] => findConfigNodesByTypeInScope(items, type).map((item) => item.id);

/**
 * True when this node *owns* a STAC collection, i.e. searching it means issuing a STAC query
 * against `collectionName`.
 *
 * Both fields are required, and neither alone is sufficient. `collectionName` is also carried by
 * every OData-only collection (it holds the OData collection there), and `supportsStacSearch` marks
 * the owning node in a subtree whose product types inherit STAC support from it - see
 * getSTACConfigForDatasetId, which resolves collectionName up the same chain. A node with the flag
 * but no name would route to the STAC branch and then contribute no collection to the payload,
 * which is silent rather than loud, so it is excluded here instead.
 *
 * This lives in the leaf module because the two places that must agree - the search partitioner in
 * AdvancedSearch.jsx and the payload builder in STACSearchPayloadBuilder.ts - cannot share anything
 * heavier: collectionFormConfig.utils.js reaches src/utils, and src/utils reaches the store.
 */
export const isSTACCollectionNode = (item: CollectionConfigNode | null | undefined): boolean =>
  Boolean(item?.supportsStacSearch && item?.collectionName);
