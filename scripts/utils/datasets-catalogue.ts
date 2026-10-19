// Pure logic for scripts/generate-datasets.ts: turns the DEFAULT-THEME entries, the cached layer
// configuration and the known BYOC collection tables into the text of public/datasets.txt.
// Everything here is deterministic (sorted, no dates) so CI can regenerate and `git diff` the file.

import {
  CDAS_L8_L9_LOTL1,
  COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  S1_CDAS_EW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_IW_HH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_VVVH,
  S1_CDAS_SM_HH,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_VVVH,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3OLCI_CDAS,
  S3OLCIL2_LAND,
  S3OLCIL2_WATER,
  S3SLSTR_CDAS,
  S3SLSTRL2_CDAS,
  S3SYNERGY_L2_SYN,
  S3SYNERGY_L2_V10,
  S3SYNERGY_L2_VG1,
  S5_AER_AI_CDAS,
  S5_CH4_CDAS,
  S5_CLOUD_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_NO2_CDAS,
  S5_O3_CDAS,
  S5_OTHER_CDAS,
  S5_SO2_CDAS,
} from '../../src/Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

export type ThemeEntry = { name: string; url: string };
export type ConfigLayer = {
  id: string;
  title?: string;
  collectionType?: string;
  collectionId?: string;
};
export type LayerConfiguration = Record<string, ConfigLayer[]>;
export type KnownCollections = Record<string, Record<string, string[]>>;

export type DatasetSection = {
  datasetId: string;
  label: string;
  layers: { id: string; title: string }[];
  clms: boolean;
};

export const BASE_URL = 'https://browser.dataspace.copernicus.eu/';

// Theme entries that are not BYOC collections map from their display name to a dataset constant.
// (The name is what the app itself shows in the collection list.) The ids come from
// dataSourceConstants, so a renamed or removed constant fails the build instead of quietly
// producing a wrong id in the generated file.
const DATASET_BY_ENTRY_NAME: Record<string, string> = {
  'Sentinel-1 IW VV+VH': S1_CDAS_IW_VVVH,
  'Sentinel-1 IW HH+HV': S1_CDAS_IW_HHHV,
  'Sentinel-1 IW VV': S1_CDAS_IW_VV,
  'Sentinel-1 IW HH': S1_CDAS_IW_HH,
  'Sentinel-1 EW VV+VH': S1_CDAS_EW_VVVH,
  'Sentinel-1 EW HH+HV': S1_CDAS_EW_HHHV,
  'Sentinel-1 EW VV': S1_CDAS_EW_VV,
  'Sentinel-1 EW HH': S1_CDAS_EW_HH,
  'Sentinel-1 SM VV+VH': S1_CDAS_SM_VVVH,
  'Sentinel-1 SM HH+HV': S1_CDAS_SM_HHHV,
  'Sentinel-1 SM VV': S1_CDAS_SM_VV,
  'Sentinel-1 SM HH': S1_CDAS_SM_HH,
  'Sentinel-2 L1C': S2_L1C_CDAS,
  'Sentinel-2 L2A': S2_L2A_CDAS,
  'Sentinel-3 OLCI': S3OLCI_CDAS,
  'Sentinel-3 SLSTR': S3SLSTR_CDAS,
  'Sentinel-3 SLSTR L2': S3SLSTRL2_CDAS,
  'DEM COPERNICUS_30': DEM_COPERNICUS_30_CDAS,
  'DEM COPERNICUS_90': DEM_COPERNICUS_90_CDAS,
  'Landsat-8/9 L1': CDAS_L8_L9_LOTL1,
};

// Datasets that the Sentinel Hub instance splits further by layer; the layer id decides the dataset.
// These mirror the data source handlers' own rules (the handlers cannot be imported from Node, as
// they need the Redux store): Sentinel5PCDASDataSourceHandler, Sentinel3CDASDataSourceHandler.
//
// Sentinel-5P: a layer belongs to a dataset when its id starts with the dataset's search id, and the
// handler only offers the "_VISUALIZED" layers (shadow layers starting with "__" are dropped).
const S5P_DATASET_BY_SEARCH_ID: [string, string][] = [
  ['AER_AI', S5_AER_AI_CDAS],
  ['CLOUD', S5_CLOUD_CDAS],
  ['HCHO', S5_HCHO_CDAS],
  ['NO2', S5_NO2_CDAS],
  ['SO2', S5_SO2_CDAS],
  ['CH4', S5_CH4_CDAS],
  ['CO', S5_CO_CDAS],
  ['O3', S5_O3_CDAS],
];

function datasetForS5P(layerId: string): string | undefined {
  if (layerId.startsWith('__') || !layerId.endsWith('_VISUALIZED')) {
    return undefined;
  }
  return S5P_DATASET_BY_SEARCH_ID.find(([searchId]) => layerId.startsWith(searchId))?.[1] ?? S5_OTHER_CDAS;
}

// Sentinel-3 SYNERGY: the handler offers an explicit list of layers per dataset
// (S3SYNERGY_SYN_LAYERS, S3SYNERGY_VG1_LAYERS, S3SYNERGY_V10_LAYERS). The plain bands (B04, S1, ...)
// that the instance also contains are not offered for any SYNERGY dataset.
const S3_SYNERGY_DATASET_BY_LAYER_ID: Record<string, string> = {
  'TRUE-COLOR': S3SYNERGY_L2_SYN,
  'FALSE-COLOR': S3SYNERGY_L2_SYN,
  S6: S3SYNERGY_L2_SYN,
  NDVI_VG1: S3SYNERGY_L2_VG1,
  TOA_NDVI_VG1: S3SYNERGY_L2_VG1,
  NDVI_V10: S3SYNERGY_L2_V10,
};

function datasetForS3Synergy(layerId: string): string | undefined {
  return S3_SYNERGY_DATASET_BY_LAYER_ID[layerId];
}

// The handler decides by which bands a layer's evalscript uses; the layer ids in the cached
// configuration carry the same information in their name (1_LAND_..., 2_WATER_...).
function datasetForS3OlciL2(layerId: string): string | undefined {
  if (layerId.includes('_WATER_')) {
    return S3OLCIL2_WATER;
  }
  if (layerId.includes('_LAND_')) {
    return S3OLCIL2_LAND;
  }
  return undefined;
}

// Wrong dataset ids that were seen in AI-built links, with the correct id where one exists.
export const DO_NOT_USE: { wrong: string; correct: string | null; note: string }[] = [
  { wrong: 'S1_AWS_IW_VVVH', correct: S1_CDAS_IW_VVVH, note: 'there is no AWS Sentinel-1 dataset' },
  { wrong: 'S1_AWS_*', correct: 'S1_CDAS_*', note: 'use the S1_CDAS_* ids listed below' },
  { wrong: 'LOTL1_CDAS', correct: CDAS_L8_L9_LOTL1, note: 'Landsat 8-9 Level-1' },
  { wrong: 'LANDSAT_8_9_CDAS', correct: CDAS_L8_L9_LOTL1, note: 'Landsat 8-9 Level-1' },
  { wrong: 'MODIS_CDAS', correct: null, note: 'no MODIS dataset exists in the Browser' },
  {
    wrong: 'S2_WORLDCOVER_ANNUAL_CDAS',
    correct: COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
    note: 'WorldCover annual cloudless mosaic',
  },
  {
    wrong: 'ESA_WORLDCOVER_CDAS',
    correct: COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
    note: 'WorldCover annual cloudless mosaic',
  },
  {
    wrong: 'CCM_VHR_OPTICAL_PLEIADES',
    correct: null,
    note: 'Contributing Missions VHR ids are CCM_VHR_IMAGE_<year>',
  },
];

// Plain code-point order. localeCompare depends on the machine's locale, so a developer with another
// locale would regenerate a differently ordered file and CI's git-diff check would fail.
export function compareIds(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

export function instanceIdFromUrl(url: string): string {
  return url.split('/').pop() || '';
}

// byoc collection ids in the cached configuration look like "byoc-<uuid>"; the tables hold the bare uuid.
export function bareCollectionId(collectionId: string): string {
  return collectionId.replace(/^byoc-/, '');
}

export function buildCollectionIndex(known: KnownCollections): Map<string, string> {
  const index = new Map<string, string>();
  for (const table of Object.values(known)) {
    for (const [datasetId, collectionIds] of Object.entries(table)) {
      for (const collectionId of collectionIds) {
        if (!index.has(collectionId)) {
          index.set(collectionId, datasetId);
        }
      }
    }
  }
  return index;
}

// Layers that exist in the instance but that the app deliberately does not offer for any dataset
// (Sentinel-5P shadow/non-visualised layers, the plain SYNERGY bands). They are not unmapped, so they
// must not show up under "Not listed", where a reader would take them for ids we failed to resolve.
function isDeliberatelyExcluded(layer: ConfigLayer): boolean {
  if (layer.collectionType === 'S5PL2') {
    return layer.id.startsWith('__') || !layer.id.endsWith('_VISUALIZED');
  }
  if (layer.collectionType === 'S3SYNL2') {
    return datasetForS3Synergy(layer.id) === undefined;
  }
  return false;
}

// Several datasets come from one theme entry (all Sentinel-5P products, OLCI L2 land/water,
// SYNERGY), so the entry name alone would give them identical labels. Say which one it is.
function labelFor(datasetId: string, entryName: string): string {
  const known = DATASET_LABEL_SUFFIX[datasetId];
  return known ? `${entryName} (${known})` : entryName;
}

const DATASET_LABEL_SUFFIX: Record<string, string> = {
  [S5_AER_AI_CDAS]: 'aerosol index',
  [S5_CH4_CDAS]: 'methane',
  [S5_CLOUD_CDAS]: 'cloud',
  [S5_CO_CDAS]: 'carbon monoxide',
  [S5_HCHO_CDAS]: 'formaldehyde',
  [S5_NO2_CDAS]: 'nitrogen dioxide',
  [S5_O3_CDAS]: 'ozone',
  [S5_OTHER_CDAS]: 'other products',
  [S5_SO2_CDAS]: 'sulfur dioxide',
  [S3OLCIL2_LAND]: 'land',
  [S3OLCIL2_WATER]: 'water',
  [S3SYNERGY_L2_SYN]: 'true and false colour',
  [S3SYNERGY_L2_VG1]: 'NDVI, 1 day',
  [S3SYNERGY_L2_V10]: 'NDVI, 10 days',
};

function datasetForLayer(
  entryName: string,
  layer: ConfigLayer,
  collectionIndex: Map<string, string>,
): string | undefined {
  if (layer.collectionType === 'CUSTOM' && layer.collectionId) {
    return collectionIndex.get(bareCollectionId(layer.collectionId));
  }
  if (layer.collectionType === 'S5PL2') {
    return datasetForS5P(layer.id);
  }
  if (layer.collectionType === 'S3OLCIL2') {
    return datasetForS3OlciL2(layer.id);
  }
  if (layer.collectionType === 'S3SYNL2') {
    return datasetForS3Synergy(layer.id);
  }
  return DATASET_BY_ENTRY_NAME[entryName];
}

export function buildSections(
  entries: ThemeEntry[],
  configuration: LayerConfiguration,
  collectionIndex: Map<string, string>,
): { sections: DatasetSection[]; skipped: string[]; excluded: number } {
  const byDataset = new Map<string, DatasetSection>();
  const skipped: string[] = [];
  let excluded = 0;

  for (const entry of entries) {
    const layers = configuration[instanceIdFromUrl(entry.url)] ?? [];
    if (layers.length === 0) {
      skipped.push(`${entry.name} (no cached layers)`);
      continue;
    }
    for (const layer of layers) {
      if (isDeliberatelyExcluded(layer)) {
        excluded++;
        continue;
      }
      const datasetId = datasetForLayer(entry.name, layer, collectionIndex);
      if (!datasetId) {
        skipped.push(`${entry.name} / ${layer.id}`);
        continue;
      }
      let section = byDataset.get(datasetId);
      if (!section) {
        section = {
          datasetId,
          label: labelFor(datasetId, entry.name),
          layers: [],
          clms: datasetId.startsWith('COPERNICUS_CLMS_'),
        };
        byDataset.set(datasetId, section);
      }
      if (!section.layers.some((l) => l.id === layer.id)) {
        section.layers.push({ id: layer.id, title: (layer.title ?? layer.id).trim() });
      }
    }
  }

  const sections = [...byDataset.values()].sort((a, b) => compareIds(a.datasetId, b.datasetId));
  sections.forEach((s) => s.layers.sort((a, b) => compareIds(a.id, b.id)));
  return { sections, skipped: [...new Set(skipped)].sort(), excluded };
}

export type PredefinedLayerMetadata = {
  match?: { datasourceId?: string; layerId?: string }[];
  title?: () => string;
};

// CLMS vector datasets (Urban Atlas, Protected Areas) are served from a MapServer WMS, not a Sentinel
// Hub instance, so the cached instance configuration has no layers for them. The app's predefined
// layer metadata does list them.
export function addVectorSections(
  sections: DatasetSection[],
  metadata: PredefinedLayerMetadata[],
): DatasetSection[] {
  const byDataset = new Map(sections.map((s) => [s.datasetId, s]));
  for (const item of metadata) {
    for (const m of item.match ?? []) {
      if (!m.datasourceId || !m.layerId || !m.datasourceId.endsWith('_VECTOR')) {
        continue;
      }
      let section = byDataset.get(m.datasourceId);
      if (!section) {
        section = {
          datasetId: m.datasourceId,
          label: `CLMS vector dataset ${m.datasourceId}`,
          layers: [],
          clms: true,
        };
        byDataset.set(m.datasourceId, section);
      }
      if (!section.layers.some((l) => l.id === m.layerId)) {
        section.layers.push({ id: m.layerId, title: (item.title ? item.title() : m.layerId).trim() });
      }
    }
  }
  const merged = [...byDataset.values()].sort((a, b) => compareIds(a.datasetId, b.datasetId));
  merged.forEach((s) => s.layers.sort((a, b) => compareIds(a.id, b.id)));
  return merged;
}

export function exampleUrl(section: DatasetSection): string {
  const params = new URLSearchParams();
  params.set('zoom', '11');
  params.set('lat', '45.35625');
  params.set('lng', '8.45879');
  params.set('themeId', 'DEFAULT-THEME');
  params.set('datasetId', section.datasetId);
  params.set('layerId', section.layers[0].id);
  params.set('date', 'latest');
  if (section.clms) {
    params.set('clmsSelectedPath', section.datasetId);
    params.set('clmsSelectedCollection', section.datasetId);
  }
  return `${BASE_URL}?${params.toString()}`;
}

export function renderDatasets(sections: DatasetSection[], skipped: string[]): string {
  const out: string[] = [];
  out.push('# Copernicus Browser — Dataset and layer ids');
  out.push('');
  out.push(
    'Every `datasetId` and `layerId` that can be used in a Browser link in the default theme (`themeId=DEFAULT-THEME`). ' +
      'Use these ids exactly as written (they are case-sensitive) and never invent one: an unknown `datasetId` makes the Browser ' +
      'show "Selected dataset does not exist!" and silently switch to Sentinel-2 L2A. See deep-linking.txt for the other parameters.',
  );
  out.push('');
  out.push(
    "This file is generated by `npm run generate-datasets` from the app's own configuration. Do not edit it by hand.",
  );
  out.push('');
  out.push('Layer ids can differ between themes. The ids below are the ones for the default theme.');
  out.push('');
  out.push(
    'The example links use a fixed placeholder position (zoom 11 near Lake Maggiore). Replace `lat`, `lng` and `zoom` with the place the user asked for: a dataset with only regional coverage finds no image at the placeholder.',
  );
  out.push('');
  out.push('## Do not use these ids');
  out.push('');
  out.push('These ids look plausible but do not exist.');
  out.push('');
  for (const d of DO_NOT_USE) {
    out.push(
      `- \`${d.wrong}\`: ${d.correct ? `use \`${d.correct}\` instead` : 'no replacement'} (${d.note})`,
    );
  }
  out.push('');
  out.push('## Datasets');
  out.push('');
  out.push(`${sections.length} datasets.`);
  out.push('');
  for (const s of sections) {
    out.push(`### ${s.datasetId}`);
    out.push('');
    out.push(`Name: ${s.label}`);
    if (s.clms) {
      out.push(
        `CLMS: also pass \`clmsSelectedPath=${s.datasetId}\` and \`clmsSelectedCollection=${s.datasetId}\``,
      );
    }
    out.push('');
    out.push('Layers:');
    for (const l of s.layers) {
      out.push(`- \`${l.id}\`: ${l.title}`);
    }
    out.push('');
    out.push('Example:');
    out.push('');
    out.push(`    ${exampleUrl(s)}`);
    out.push('');
  }
  if (skipped.length > 0) {
    out.push('## Not listed');
    out.push('');
    out.push('Collections in the default theme that this file could not map to a dataset id:');
    out.push('');
    skipped.forEach((s) => out.push(`- ${s}`));
    out.push('');
  }
  return out.join('\n');
}
