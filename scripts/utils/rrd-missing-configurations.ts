export interface Collection {
  id: string;
  name: string;
}

/**
 * Bare tier "umbrella" collections that intentionally never have a configuration.
 *
 * These are matched by exact name rather than id on purpose: the RRD collection ids
 * are not stable (they change whenever a collection is recreated), whereas these names
 * are fixed and unambiguous. Includes tier umbrella collections (GENERAL, CSESA, FRTX)
 * and GHGSat collections that intentionally have no configuration.
 */
export const SKIPPED_COLLECTION_NAMES: string[] = [
  'GENERAL',
  'CSESA',
  'FRTX',
  'GENERAL_GHGSAT_CH4',
  'FRTX_GHGSAT_CH4',
  'CSESA_FRTX',
];

/**
 * Find collections that are not referenced by any configuration layer.
 *
 * A collection is considered to have a configuration when at least one
 * configuration layer references its id via `layer.datasourceDefaults.collectionId`.
 *
 * Collections named in {@link SKIPPED_COLLECTION_NAMES} are never reported, as they are
 * tier umbrella collections that intentionally have no configuration.
 *
 * @param collections - All collections from the RRD collection account.
 * @param referencedCollectionIds - Collection ids referenced by configuration layers.
 * @returns Collections without a configuration.
 */
export const findCollectionsWithoutConfiguration = (
  collections: Collection[],
  referencedCollectionIds: Set<string> | string[],
): Collection[] => {
  const referenced =
    referencedCollectionIds instanceof Set ? referencedCollectionIds : new Set(referencedCollectionIds);
  const skipped = new Set(SKIPPED_COLLECTION_NAMES);

  return collections
    .filter((collection) => !referenced.has(collection.id) && !skipped.has(collection.name))
    .map(({ id, name }) => ({ id, name }));
};

/**
 * Build the markdown body of the GitLab tracking issue that lists collections without a configuration.
 *
 * @param missing - Collections without a configuration.
 * @param date - Timestamp of the check (defaults to now).
 * @returns Markdown issue body.
 */
export const buildMissingConfigIssueBody = (missing: Collection[], date: Date = new Date()): string => {
  const list = missing.map(({ id, name }) => `- ${name} (\`${id}\`)`).join('\n');

  return [
    'The following RRD collections have no configuration referencing them.',
    '',
    `Total: ${missing.length}`,
    '',
    ...(list ? [list, ''] : []),
    `_Last checked: ${date.toISOString()} (automated daily RRD configuration check)._`,
  ].join('\n');
};
