import type { Geometry } from 'geojson';
import type { Moment } from 'moment';
import type { LatLngBounds } from 'leaflet';
import moment from 'moment';
import { buildSearchGeometry } from '../../utils/geojson.utils';
import { findConfigNodeIdsByType, isSTACCollectionNode } from '../../utils/collectionConfigTree';

export interface CQL2Filter {
  op: string;
  args: unknown[];
}

// selectedCollections has the shape { collectionId: { subCollectionId: {...} } }, where nested
// nodes can themselves carry a `type` of 'instrument' | 'productType' and further nested `items`.
type SelectedCollectionNode = Record<string, unknown> & { type?: string; platform?: string };
type SelectedCollections = Record<string, SelectedCollectionNode>;
type SelectedFilters = Record<string, Record<string, unknown>>;

interface CollectionFormConfigItem {
  id: string;
  collectionName?: string;
  supportsInstrumentName?: boolean;
  items?: CollectionFormConfigItem[];
  [key: string]: unknown;
}

interface TimeInterval {
  fromTime: string | null;
  toTime: string | null;
}

interface MonthFilterInterval {
  fromMoment: Moment;
  toMoment: Moment;
}

export interface CreateSTACSearchPayloadParams {
  collectionForm: {
    selectedCollections: SelectedCollections;
    selectedFilters?: SelectedFilters;
  };
  collectionFormConfig?: CollectionFormConfigItem[];
  fromMoment?: Moment | null;
  toMoment?: Moment | null;
  searchCriteria?: string;
  filterMonths?: unknown;
  mapBounds?: unknown;
  aoiBounds?: unknown;
  poiBounds?: unknown;
  applyFilterMonthsToDateRange?: (
    fromMoment: Moment | null | undefined,
    toMoment: Moment | null | undefined,
    filterMonths: unknown,
  ) => MonthFilterInterval[];
}

export interface STACSearchPayload {
  collections?: string[];
  datetime?: string;
  filter?: CQL2Filter | { op: 'and'; args: CQL2Filter[] };
  limit: number;
}

/**
 * Extracts platform values from selected collections structure
 */
const extractPlatforms = (selectedCollections: SelectedCollections): string[] => {
  const platforms: string[] = [];
  Object.entries(selectedCollections).forEach(([_collectionId, collectionData]) => {
    if (collectionData.platform) {
      platforms.push(collectionData.platform);
    }
  });
  return platforms;
};

/**
 * Recursively extracts instruments and product types from collection data
 */
const extractInstrumentsAndProductTypes = (
  obj: SelectedCollectionNode,
): { instruments: string[]; productTypes: string[] } => {
  const instruments: string[] = [];
  const productTypes: string[] = [];

  const extractFromNode = (nodeObj: Record<string, unknown> | null | undefined) => {
    if (!nodeObj || typeof nodeObj !== 'object') {
      return;
    }

    Object.entries(nodeObj).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        const node = value as SelectedCollectionNode;
        if (node.type === 'instrument') {
          instruments.push(key);
          // Look for product types within this instrument
          extractFromNode(node);
        } else if (node.type === 'productType') {
          productTypes.push(key);
        } else {
          // Continue searching in nested objects
          extractFromNode(node);
        }
      }
    });
  };

  extractFromNode(obj);
  return { instruments, productTypes };
};

/**
 * Applies filter months to date range and creates time intervals
 */
const createTimeIntervals = (
  fromMoment: Moment | null | undefined,
  toMoment: Moment | null | undefined,
  filterMonths: unknown,
  applyFilterMonthsToDateRange: CreateSTACSearchPayloadParams['applyFilterMonthsToDateRange'],
): TimeInterval | null => {
  if (filterMonths) {
    const intervals = applyFilterMonthsToDateRange!(fromMoment, toMoment, filterMonths);
    if (intervals.length > 0) {
      const firstInterval = intervals[0];
      return {
        fromTime: moment.utc(firstInterval.fromMoment).toDate().toISOString(),
        toTime: moment.utc(firstInterval.toMoment).toDate().toISOString(),
      };
    }
  } else {
    return {
      fromTime: fromMoment
        ? moment
            .utc(fromMoment)
            .toDate()
            .toISOString()
            .replace(/\.\d{3}Z$/, 'Z')
        : null,
      toTime: toMoment
        ? moment
            .utc(toMoment)
            .toDate()
            .toISOString()
            .replace(/\.\d{3}Z$/, 'Z')
        : null,
    };
  }
  return null;
};

/** A config node that owns a STAC `collectionName`, paired with the selection branch under it. */
interface STACCollectionNode {
  config: CollectionFormConfigItem;
  selectedNode: SelectedCollectionNode;
}

/**
 * Resolves the selected collections against the config and returns one entry per node that owns a
 * STAC collection. selectedCollections has the shape { collectionId: { subCollectionId: {...} } }:
 * a top-level entry that owns one is a single STAC collection and short-circuits, otherwise it is a
 * group node and each selected sub-collection that owns one becomes its own entry.
 *
 * `type` and `platform` are UI bookkeeping keys on the selection node rather than sub-collection
 * ids, so they are skipped — neither can match a config id.
 *
 * Which nodes count is isSTACCollectionNode's to say, shared with the partitioner in
 * AdvancedSearch.jsx that decides one call earlier whether this payload gets built at all. Both
 * extractCollectionNames and extractProductTypesPerSTACCollection derive from this function, so
 * neither those two nor the partitioner can drift apart on the answer.
 */
const collectSTACCollectionNodes = (
  selectedCollections: SelectedCollections,
  collectionFormConfig: CollectionFormConfigItem[] | undefined,
): STACCollectionNode[] => {
  if (!collectionFormConfig) {
    return [];
  }
  const nodes: STACCollectionNode[] = [];
  Object.keys(selectedCollections).forEach((collectionId) => {
    const collectionConfig = collectionFormConfig.find((c) => c.id === collectionId);
    if (!collectionConfig) {
      return;
    }
    const selectedNode = selectedCollections[collectionId];
    if (isSTACCollectionNode(collectionConfig)) {
      nodes.push({ config: collectionConfig, selectedNode });
      return;
    }
    if (!collectionConfig.items) {
      return;
    }
    Object.keys(selectedNode)
      .filter((key) => key !== 'type' && key !== 'platform')
      .forEach((subId) => {
        const subConfig = collectionConfig.items!.find((item) => item.id === subId);
        if (isSTACCollectionNode(subConfig)) {
          nodes.push({
            config: subConfig!,
            selectedNode: selectedNode[subId] as SelectedCollectionNode,
          });
        }
      });
  });
  return nodes;
};

/**
 * Extracts collectionName values from config for the given selected collections.
 */
const extractCollectionNames = (
  selectedCollections: SelectedCollections,
  collectionFormConfig: CollectionFormConfigItem[] | undefined,
): string[] =>
  collectSTACCollectionNodes(selectedCollections, collectionFormConfig).map(
    ({ config }) => config.collectionName!,
  );

interface STACCollectionProductTypes {
  /** Product types the user actually ticked under this STAC collection. */
  selected: string[];
  /** Every product type the config offers under it, used when nothing was ticked. */
  configured: string[];
}

/**
 * Reports, for each STAC collection the selection resolves to, both what the user ticked under it
 * and what the config offers there. The grouping is deliberately not flattened: it is the
 * per-collection emptiness that matters, not the total count.
 *
 * Returns an empty array when there is no config to resolve collection boundaries with,
 * which callers read as "no reason to change anything".
 */
const extractProductTypesPerSTACCollection = (
  selectedCollections: SelectedCollections,
  collectionFormConfig: CollectionFormConfigItem[] | undefined,
): STACCollectionProductTypes[] =>
  collectSTACCollectionNodes(selectedCollections, collectionFormConfig).map(({ config, selectedNode }) => ({
    selected: extractInstrumentsAndProductTypes(selectedNode).productTypes,
    // Scope-crossing on purpose: `configured` stands in for a collection the user left unticked,
    // so it has to cover every product type beneath it - directly, under a group, or under one of
    // its instruments - because ticking the collection would have matched all of them.
    configured: findConfigNodeIdsByType(config.items, 'productType'),
  }));

/**
 * Creates platform filters for STAC search
 */
const createPlatformFilters = (platforms: string[]): CQL2Filter[] => {
  const filterArgs: CQL2Filter[] = [];

  if (platforms.length === 1) {
    filterArgs.push({
      op: '=',
      args: [{ property: 'platform' }, platforms[0]],
    });
  } else if (platforms.length > 1) {
    filterArgs.push({
      op: 'in',
      args: [{ property: 'platform' }, platforms],
    });
  }

  return filterArgs;
};

/**
 * Creates the STAC API top-level datetime interval string.
 * The STAC API Item Search spec accepts a top-level `datetime` parameter in interval
 * format ("from/to") which is more broadly supported than CQL2 timestamp literals.
 */
export const createDatetimeInterval = (timeInterval: TimeInterval | null): string | null => {
  if (!timeInterval) {
    return null;
  }
  const from = timeInterval.fromTime || '..';
  const to = timeInterval.toTime || '..';
  return `${from}/${to}`;
};

/**
 * Creates geometry filters for STAC search
 */
export const createGeometryFilters = (geometry: Geometry | null | undefined): CQL2Filter[] => {
  const filterArgs: CQL2Filter[] = [];

  if (geometry) {
    filterArgs.push({
      op: 's_intersects',
      args: [{ property: 'geometry' }, geometry],
    });
  }

  return filterArgs;
};

/**
 * Combines a list of CQL2 filters into a single filter object: a bare filter when there's
 * only one, or an `and`-wrapped filter when there's more than one. Returns undefined when
 * the list is empty, matching STACSearchPayload's optional `filter` field.
 */
export const combineFilters = (
  filterArgs: CQL2Filter[],
): CQL2Filter | { op: 'and'; args: CQL2Filter[] } | undefined => {
  if (filterArgs.length === 0) {
    return undefined;
  }
  if (filterArgs.length === 1) {
    return filterArgs[0];
  }
  return { op: 'and', args: filterArgs };
};

/**
 * Creates product type filters for STAC search
 */
export const createProductTypeFilters = (productTypes: string[]): CQL2Filter[] => {
  const filterArgs: CQL2Filter[] = [];

  if (productTypes.length > 0) {
    if (productTypes.length === 1) {
      filterArgs.push({
        op: '=',
        args: [{ property: 'product:type' }, productTypes[0]],
      });
    } else {
      filterArgs.push({
        op: 'in',
        args: [{ property: 'product:type' }, productTypes],
      });
    }
  }

  return filterArgs;
};

const createInstrumentFilters = (instruments: string[]): CQL2Filter[] => {
  const filterArgs: CQL2Filter[] = [];

  if (instruments.length > 0) {
    if (instruments.length === 1) {
      filterArgs.push({
        op: '=',
        args: [{ property: 'instruments' }, instruments[0]],
      });
    } else {
      filterArgs.push({
        op: 'in',
        args: [{ property: 'instruments' }, instruments],
      });
    }
  }

  return filterArgs;
};

const additionalFiltersMap: Record<string, string> = {
  processingMode: 'product:timeliness_category',
  orbitNumber: 'sat:absolute_orbit',
};

/**
 * Maps OData filter keys to STAC property names
 */
export const mapODataKeyToSTAC = (odataKey: string): string => {
  return additionalFiltersMap[odataKey] || odataKey;
};

/**
 * Creates additional filters from selected filters.
 * STAC counterpart of ODataHelpers.js's createAdditionalFilters (same name, same
 * collectionForm/selectedFilters shape) - keep the two in sync when new filter keys
 * are added to either side, since mapODataKeyToSTAC above is the mapping between them.
 */
const createAdditionalFilters = (selectedFilters: SelectedFilters | undefined): CQL2Filter[] => {
  const filterArgs: CQL2Filter[] = [];

  if (selectedFilters) {
    Object.entries(selectedFilters).forEach(([_collectionId, filters]) => {
      Object.entries(filters).forEach(([filterKey, filterValue]) => {
        const stacProperty = mapODataKeyToSTAC(filterKey);

        if (Array.isArray(filterValue)) {
          const values = filterValue.map((item) => item.value || item);
          if (values.length === 1) {
            filterArgs.push({
              op: '=',
              args: [{ property: stacProperty }, values[0]],
            });
          } else {
            filterArgs.push({
              op: 'in',
              args: [{ property: stacProperty }, values],
            });
          }
        } else if (typeof filterValue === 'number') {
          filterArgs.push({
            op: '=',
            args: [{ property: stacProperty }, filterValue],
          });
        } else {
          filterArgs.push({
            op: '=',
            args: [{ property: stacProperty }, filterValue],
          });
        }
      });
    });
  }

  return filterArgs;
};

/**
 * Creates search criteria filters for STAC search
 */
const createSearchCriteriaFilters = (searchCriteria: string | undefined): CQL2Filter[] => {
  const filterArgs: CQL2Filter[] = [];

  if (searchCriteria && searchCriteria !== '') {
    filterArgs.push({
      op: 'like',
      args: [{ property: 'title' }, `%${searchCriteria}%`],
    });
  }

  return filterArgs;
};

/**
 * Creates a STAC search payload from form data
 */
export const createSTACSearchPayload = ({
  collectionForm,
  collectionFormConfig,
  fromMoment,
  toMoment,
  searchCriteria,
  filterMonths,
  mapBounds,
  aoiBounds,
  poiBounds,
  applyFilterMonthsToDateRange,
}: CreateSTACSearchPayloadParams): STACSearchPayload => {
  const payload: STACSearchPayload = { limit: 50 };
  const filterArgs: CQL2Filter[] = [];

  // Extract platforms from selected collections
  if (Object.keys(collectionForm.selectedCollections).length) {
    const platforms = extractPlatforms(collectionForm.selectedCollections);
    const platformFilters = createPlatformFilters(platforms);
    filterArgs.push(...platformFilters);

    // Add top-level STAC `collections` parameter to scope the search
    const collectionNames = extractCollectionNames(collectionForm.selectedCollections, collectionFormConfig);
    if (collectionNames.length > 0) {
      payload.collections = collectionNames;
    }
  }

  // Use the top-level STAC `datetime` interval parameter instead of CQL2 timestamp
  // literals, which the stac-fastapi-opensearch backend rejects as invalid RFC3339.
  if (!searchCriteria) {
    const timeInterval = createTimeIntervals(
      fromMoment,
      toMoment,
      filterMonths,
      applyFilterMonthsToDateRange,
    );
    const datetimeInterval = createDatetimeInterval(timeInterval);
    if (datetimeInterval) {
      payload.datetime = datetimeInterval;
    }
  }

  // Convert geometry to STAC filter format
  if (Object.keys(collectionForm.selectedCollections).length || aoiBounds || poiBounds) {
    const { geometry } = buildSearchGeometry({
      mapBounds: mapBounds as LatLngBounds | undefined,
      aoiBounds: aoiBounds as LatLngBounds | undefined,
      poiBounds: poiBounds as LatLngBounds | undefined,
    });
    const geometryFilters = createGeometryFilters(geometry);
    filterArgs.push(...geometryFilters);
  }

  // Extract instruments and product types from selected collections
  if (Object.keys(collectionForm.selectedCollections).length) {
    const allProductTypes: string[] = [];
    const allInstruments: string[] = [];
    Object.entries(collectionForm.selectedCollections).forEach(([_collectionId, collectionData]) => {
      const { productTypes, instruments } = extractInstrumentsAndProductTypes(collectionData);
      allProductTypes.push(...productTypes);
      // Collected unconditionally here; whether instrument filters actually make it into
      // the final payload is decided below by the `shouldIncludeInstruments` check.
      allInstruments.push(...instruments);
    });

    // `allProductTypes` is one flat list feeding an `and`-combined filter, which only reads as
    // a union because product types are disjoint across STAC collections. A collection that
    // contributes none (selecting an instrument node does not auto-select its product types the
    // way a `hideChildren` collection's are) would therefore be excluded by the other
    // collections' values and silently drop out of the results. Expand those to everything the
    // config offers under them - which is what an unticked parent node means - so the union
    // stays exact instead of dropping the filter and letting unselected product types back in.
    const productTypesPerSTACCollection = extractProductTypesPerSTACCollection(
      collectionForm.selectedCollections,
      collectionFormConfig,
    );
    const effectiveProductTypes = [...allProductTypes];
    // A collection offering no product types at all cannot be expanded; there is nothing to
    // stand in for it, so fall back to emitting no product:type filter rather than one that
    // would exclude it.
    let hasUnexpandableCollection = false;
    productTypesPerSTACCollection.forEach(({ selected, configured }) => {
      if (selected.length > 0) {
        return;
      }
      if (configured.length === 0) {
        hasUnexpandableCollection = true;
        return;
      }
      effectiveProductTypes.push(...configured);
    });

    if (!hasUnexpandableCollection) {
      const productTypeFilters = createProductTypeFilters([...new Set(effectiveProductTypes)]);
      filterArgs.push(...productTypeFilters);
    }

    // Instrument filters are all-or-nothing across the selected collections: `allInstruments`
    // above is one flat list, and the CQL2 filter is `and`-combined, so emitting it when only
    // some of the selections support instrument names applies one collection's instrument keys
    // to every other collection and matches nothing. `supportsInstrumentName: false` is
    // therefore authoritative - if any selected collection resolves to false, no instrument
    // filter is emitted at all (hence `every`, not `some`).
    const shouldIncludeInstruments =
      collectionFormConfig &&
      Object.keys(collectionForm.selectedCollections).every((collectionId) => {
        // Find the main collection config (e.g., S5P)
        const collectionConfig = collectionFormConfig.find((c) => c.id === collectionId);
        if (!collectionConfig) {
          return true; // Default to including instruments if config not found
        }

        // Check if the collection itself has supportsInstrumentName set to false
        if (collectionConfig.supportsInstrumentName === false) {
          return false;
        }

        // Check selected instruments within the collection
        const collectionData = collectionForm.selectedCollections[collectionId];

        // Look for selected instruments in the nested structure. Metadata keys like
        // 'type' and 'platform' (present on every selected collection) are not instrument
        // entries and must be excluded here — otherwise .some() below would short-circuit
        // to true on them regardless of what any real instrument's config says.
        const instrumentKeys = Object.keys(collectionData).filter((selectedKey) => {
          const selectedItem = collectionData[selectedKey] as SelectedCollectionNode | undefined;
          return selectedItem && selectedItem.type === 'instrument';
        });

        // No instrument-level selection to check — default to including instruments.
        if (instrumentKeys.length === 0) {
          return true;
        }

        // Otherwise, include instruments if at least one selected instrument supports them.
        return instrumentKeys.some((selectedKey) => {
          const instrumentConfig = collectionConfig.items?.find((inst) => inst.id === selectedKey);
          return instrumentConfig?.supportsInstrumentName !== false;
        });
      });

    // Only add instrument filters if supported by the collection configuration
    if (shouldIncludeInstruments) {
      const instrumentFilters = createInstrumentFilters(allInstruments);
      filterArgs.push(...instrumentFilters);
    }
  }

  // Convert additional filters to STAC filter format
  const additionalFilters = createAdditionalFilters(collectionForm.selectedFilters);
  filterArgs.push(...additionalFilters);

  // Handle product name search
  const searchFilters = createSearchCriteriaFilters(searchCriteria);
  filterArgs.push(...searchFilters);

  // Build the filter object
  const filter = combineFilters(filterArgs);
  if (filter) {
    payload.filter = filter;
  }

  return payload;
};
