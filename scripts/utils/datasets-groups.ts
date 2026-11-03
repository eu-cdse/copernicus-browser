// Pure logic for the split dataset catalogue (public/datasets/): which group file each dataset goes
// to, how the near-real-time CLMS variants are folded into one dataset, and the common-datasets
// block of public/llms.txt. Deterministic (fixed group order, code-point sorting, no dates), so CI
// can regenerate the files and `git diff` them.

import {
  CDAS_L8_L9_LOTL1,
  CDAS_LANDSAT_MOSAIC,
  COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_VVVH,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3OLCI_CDAS,
  S3SLSTR_CDAS,
  S5_CH4_CDAS,
  S5_CO_CDAS,
  S5_NO2_CDAS,
} from '../../src/Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { compareIds, type DatasetSection } from './datasets-catalogue';

// A file an agent fetches should stay well below what fetch tools truncate or summarise.
export const MAX_FILE_BYTES = 30000;

// The shape of CLMS_OPTIONS in src/Tools/VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils.js
export type ClmsOption = {
  id: string;
  label?: string;
  options?: ClmsOption[];
  consolidationPeriods?: { id: string }[];
};

export type GroupDefinition = {
  id: string;
  title: string;
  description: string;
};

// File names come from the group id, never from the CLMS tree ids (one of them is "Water Bodies 1").
// The order here is the order of the index and so also of the output.
export const GROUPS: GroupDefinition[] = [
  {
    id: 'sentinel-1',
    title: 'Sentinel-1',
    description: 'Sentinel-1 radar in IW, EW and SM modes (the Sentinel-1 mosaics are in Mosaics)',
  },
  { id: 'sentinel-2', title: 'Sentinel-2', description: 'Sentinel-2 L1C and L2A' },
  {
    id: 'sentinel-3-5p',
    title: 'Sentinel-3 and Sentinel-5P',
    description: 'Sentinel-3 OLCI, SLSTR and SYNERGY, and the Sentinel-5P products',
  },
  { id: 'landsat', title: 'Landsat', description: 'Landsat 8-9 Level-1' },
  { id: 'dem', title: 'Digital elevation models', description: 'Copernicus DEM 30 m and 90 m' },
  {
    id: 'mosaics',
    title: 'Mosaics',
    description: 'Sentinel-1 (IW and DH), Sentinel-2 quarterly, WorldCover and Landsat mosaics',
  },
  {
    id: 'ccm',
    title: 'Contributing Missions (CCM)',
    description: 'Very high resolution imagery and thermal data from Copernicus Contributing Missions',
  },
  {
    id: 'clms-bio-auxiliary',
    title: 'CLMS Bio-geophysical Parameters: Auxiliary data',
    description: 'Cloud mask',
  },
  {
    id: 'clms-bio-evapotranspiration',
    title: 'CLMS Bio-geophysical Parameters: Evapotranspiration',
    description: 'Evapotranspiration',
  },
  {
    id: 'clms-bio-snow',
    title: 'CLMS Bio-geophysical Parameters: Snow',
    description: 'Snow cover, snow water equivalent and snow phenology',
  },
  {
    id: 'clms-bio-soil-moisture',
    title: 'CLMS Bio-geophysical Parameters: Soil Moisture',
    description: 'Surface soil moisture and soil water index',
  },
  {
    id: 'clms-bio-temperature-reflectance',
    title: 'CLMS Bio-geophysical Parameters: Temperature and Reflectance',
    description: 'Land surface temperature and reflectance',
  },
  {
    id: 'clms-bio-vegetation-productivity',
    title: 'CLMS Bio-geophysical Parameters: Vegetation, productivity',
    description:
      'Dry and gross dry matter productivity (DMP, GDMP) and net and gross primary production (NPP, GPP)',
  },
  {
    id: 'clms-bio-vegetation-properties',
    title: 'CLMS Bio-geophysical Parameters: Vegetation, properties',
    description: 'FAPAR, FCOVER and LAI',
  },
  {
    id: 'clms-bio-vegetation-indices',
    title: 'CLMS Bio-geophysical Parameters: Vegetation, indices, burnt area and phenology',
    description: 'NDVI and other vegetation indices, burnt area and land surface phenology',
  },
  {
    id: 'clms-bio-water-bodies',
    title: 'CLMS Bio-geophysical Parameters: Water Bodies',
    description: 'Water bodies, water extent, lake water quality and ice',
  },
  {
    id: 'clms-priority-areas',
    title: 'CLMS Land Cover and Land Use in Priority Areas',
    description: 'Urban Atlas and Protected Areas',
  },
  {
    id: 'clms-lcm-croplands',
    title: 'CLMS Land Cover and Land Use Mapping: Croplands',
    description:
      'Crop types, cropping patterns and seasons, main crop duration, emergence and harvest, secondary crop duration, emergence and types, bare soil and fallow land',
  },
  {
    id: 'clms-lcm-grasslands',
    title: 'CLMS Land Cover and Land Use Mapping: Grasslands',
    description: 'Grassland cover, change and mowing events, herbaceous cover and ploughing indicator',
  },
  {
    id: 'clms-lcm-tree-cover-forests',
    title: 'CLMS Land Cover and Land Use Mapping: Tree Cover and Forests',
    description: 'Tree cover density, forest types, coniferous and broadleaved cover',
  },
  {
    id: 'clms-lcm-other',
    title: 'CLMS Land Cover and Land Use Mapping: Dynamic Land Cover and CLCplus',
    description:
      'Dynamic land cover (global land cover map, land cover change, pantropical tree cover density) and the CLCplus LULUCF instance',
  },
];

const GROUP_IDS = new Set(GROUPS.map((g) => g.id));

// Tree labels of the CLMS hierarchy -> group id. A label missing from here throws, so a category added
// to the tree has to be given a group on purpose.
const CLMS_GROUP_BY_PATH: Record<string, string> = {
  'Bio-geophysical Parameters/Auxiliary data': 'clms-bio-auxiliary',
  'Bio-geophysical Parameters/Evapotranspiration': 'clms-bio-evapotranspiration',
  'Bio-geophysical Parameters/Snow': 'clms-bio-snow',
  'Bio-geophysical Parameters/Soil Moisture': 'clms-bio-soil-moisture',
  'Bio-geophysical Parameters/Temperature and Reflectance': 'clms-bio-temperature-reflectance',
  'Bio-geophysical Parameters/Vegetation/Burnt Area': 'clms-bio-vegetation-indices',
  'Bio-geophysical Parameters/Vegetation/Dry/Gross Dry Matter Productivity':
    'clms-bio-vegetation-productivity',
  'Bio-geophysical Parameters/Vegetation/Net/Gross Primary Production': 'clms-bio-vegetation-productivity',
  'Bio-geophysical Parameters/Vegetation/Vegetation Indices': 'clms-bio-vegetation-indices',
  'Bio-geophysical Parameters/Vegetation/Vegetation Phenology and Productivity Parameters':
    'clms-bio-vegetation-indices',
  'Bio-geophysical Parameters/Vegetation/Vegetation Properties': 'clms-bio-vegetation-properties',
  'Bio-geophysical Parameters/Water Bodies': 'clms-bio-water-bodies',
  'Land Cover and Land Use in Priority Areas': 'clms-priority-areas',
  'Land Cover and Land Use Mapping/Croplands': 'clms-lcm-croplands',
  'Land Cover and Land Use Mapping/Grasslands': 'clms-lcm-grasslands',
  'Land Cover and Land Use Mapping/Tree Cover and Forests': 'clms-lcm-tree-cover-forests',
  'Land Cover and Land Use Mapping/Dynamic Land Cover': 'clms-lcm-other',
  'Land Cover and Land Use Mapping/CLCplus LULUCF Instance': 'clms-lcm-other',
};

// Which ancestors name the group: Bio-geophysical Parameters and Land Cover and Land Use Mapping are
// split by their subcategory (each would be close to the size limit as one file), Vegetation one level
// further (it is the largest); Priority Areas is one group.
function clmsGroupPath(labels: string[]): string {
  const [top, sub] = labels;
  if (top === 'Bio-geophysical Parameters' && sub === 'Vegetation') {
    return labels.slice(0, 3).join('/');
  }
  if (top === 'Bio-geophysical Parameters' || top === 'Land Cover and Land Use Mapping') {
    return labels.slice(0, 2).join('/');
  }
  return top;
}

// datasetId -> group id, for every dataset in CLMS_OPTIONS (leaves and their consolidation periods).
export function buildClmsGroupIndex(options: ClmsOption[]): Map<string, string> {
  const index = new Map<string, string>();
  const place = (id: string, path: string) => {
    const group = CLMS_GROUP_BY_PATH[path];
    if (!group) {
      throw new Error(`CLMS category "${path}" has no group in datasets-groups.ts (dataset ${id})`);
    }
    index.set(id, group);
  };
  const walk = (node: ClmsOption, labels: string[]) => {
    if (node.options) {
      node.options.forEach((child) => walk(child, [...labels, child.label ?? child.id]));
      return;
    }
    const path = clmsGroupPath(labels);
    place(node.id, path);
    node.consolidationPeriods?.forEach((period) => place(period.id, path));
  };
  options.forEach((top) => walk(top, [top.label ?? top.id]));
  return index;
}

// Several stages (RT0, RT1, ...) of one CLMS product are separate datasets with identical layers.
// Keep the one the app itself lists as the product (the base dataset where there is one, otherwise
// the _RT0 stage) and say on it which stages were left out. The omitted ids stay valid in the app.
export function collapseConsolidationPeriods(
  sections: DatasetSection[],
  options: ClmsOption[],
): DatasetSection[] {
  const omittedBy = new Map<string, string[]>();
  const walk = (node: ClmsOption) => {
    if (node.options) {
      node.options.forEach(walk);
      return;
    }
    const others = (node.consolidationPeriods ?? []).map((p) => p.id).filter((id) => id !== node.id);
    if (others.length > 0) {
      omittedBy.set(node.id, others.sort(compareIds));
    }
  };
  options.forEach(walk);

  const omitted = new Set([...omittedBy.values()].flat());
  return sections
    .filter((s) => !omitted.has(s.datasetId))
    .map((s) => {
      const others = omittedBy.get(s.datasetId);
      return others ? { ...s, omittedStages: others } : s;
    });
}

// Non-CLMS datasets by id. Sentinel-3/5P datasets are matched by prefix (S3*, S5_*), the Landsat and
// DEM ones by their constants. The mosaics have UUID ids, so they are matched by their name.
// Sentinel-2 is matched by id only, with no S2_ prefix rule like S1/S3/S5: a new Sentinel-2 dataset makes
// the generator throw, so it is placed on purpose.
const EXPLICIT_GROUP: Record<string, string> = {
  [S2_L1C_CDAS]: 'sentinel-2',
  [S2_L2A_CDAS]: 'sentinel-2',
  [CDAS_L8_L9_LOTL1]: 'landsat',
  [DEM_COPERNICUS_30_CDAS]: 'dem',
  [DEM_COPERNICUS_90_CDAS]: 'dem',
};

export function groupForSection(section: DatasetSection, clmsGroups: Map<string, string>): string {
  const fromTree = clmsGroups.get(section.datasetId);
  if (fromTree) {
    return fromTree;
  }
  const { datasetId, label } = section;
  if (EXPLICIT_GROUP[datasetId]) {
    return EXPLICIT_GROUP[datasetId];
  }
  if (datasetId.startsWith('CCM_')) {
    return 'ccm';
  }
  if (/mosaic/i.test(label)) {
    return 'mosaics';
  }
  if (datasetId.startsWith('S1_')) {
    return 'sentinel-1';
  }
  if (datasetId.startsWith('S3') || datasetId.startsWith('S5_')) {
    return 'sentinel-3-5p';
  }
  throw new Error(
    `Dataset ${datasetId} ("${label}") fits no group in datasets-groups.ts. Add it to a group on purpose.`,
  );
}

// Every section to exactly one group, in the fixed GROUPS order, sections sorted by id.
export function assignGroups(
  sections: DatasetSection[],
  clmsGroups: Map<string, string>,
): Map<string, DatasetSection[]> {
  const byGroup = new Map<string, DatasetSection[]>(GROUPS.map((g) => [g.id, []]));
  for (const section of sections) {
    const group = groupForSection(section, clmsGroups);
    if (!GROUP_IDS.has(group)) {
      throw new Error(`Dataset ${section.datasetId} was given the unknown group "${group}"`);
    }
    byGroup.get(group)!.push(section);
  }
  byGroup.forEach((list) => list.sort((a, b) => compareIds(a.datasetId, b.datasetId)));
  return byGroup;
}

// The datasets agents ask for most. `layerId` is the layer to show; it must exist in the sections, so a
// renamed layer or dataset fails the generator instead of leaving a dead id in llms.txt.
export type CommonDataset = { datasetId: string; layerId: string; note: string };

export const COMMON_DATASETS: CommonDataset[] = [
  { datasetId: S2_L2A_CDAS, layerId: '1_TRUE_COLOR', note: 'Sentinel-2 L2A, true colour' },
  { datasetId: S2_L1C_CDAS, layerId: '1_TRUE_COLOR', note: 'Sentinel-2 L1C, true colour' },
  {
    datasetId: S1_CDAS_IW_VVVH,
    layerId: 'IW-DV-VV-DECIBEL-GAMMA0-ORTHORECTIFIED',
    note: 'Sentinel-1 IW VV+VH, VV in decibel',
  },
  {
    datasetId: S1_CDAS_IW_HHHV,
    layerId: 'IW-DH-HH-DECIBEL-GAMMA0-ORTHORECTIFIED',
    note: 'Sentinel-1 IW HH+HV, HH in decibel',
  },
  { datasetId: S3OLCI_CDAS, layerId: '1_TRUE_COLOR', note: 'Sentinel-3 OLCI, true colour' },
  { datasetId: S3SLSTR_CDAS, layerId: 'FALSE_COLOR', note: 'Sentinel-3 SLSTR, false colour' },
  { datasetId: S5_NO2_CDAS, layerId: 'NO2_VISUALIZED', note: 'Sentinel-5P nitrogen dioxide' },
  { datasetId: S5_CO_CDAS, layerId: 'CO_VISUALIZED', note: 'Sentinel-5P carbon monoxide' },
  { datasetId: S5_CH4_CDAS, layerId: 'CH4_VISUALIZED', note: 'Sentinel-5P methane' },
  { datasetId: CDAS_L8_L9_LOTL1, layerId: '1_TRUE_COLOR', note: 'Landsat 8-9 Level-1, true colour' },
  {
    datasetId: COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
    layerId: 'TRUE-COLOR-CLOUDLESS',
    note: 'Sentinel-2 quarterly cloudless mosaic, true colour',
  },
  {
    datasetId: COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
    layerId: 'TRUE-COLOR-CLOUDLESS',
    note: 'WorldCover annual cloudless mosaic, true colour',
  },
  { datasetId: CDAS_LANDSAT_MOSAIC, layerId: '1-TRUE-COLOUR', note: 'Landsat mosaic, true colour' },
  { datasetId: DEM_COPERNICUS_30_CDAS, layerId: '1_TOPOGRAPHIC', note: 'Copernicus DEM 30 m' },
  { datasetId: DEM_COPERNICUS_90_CDAS, layerId: '1_TOPOGRAPHIC', note: 'Copernicus DEM 90 m' },
];

export const COMMON_BLOCK_START = '<!-- BEGIN GENERATED: common-datasets -->';
export const COMMON_BLOCK_END = '<!-- END GENERATED: common-datasets -->';

export function renderCommonDatasets(common: CommonDataset[], sections: DatasetSection[]): string {
  const byId = new Map(sections.map((s) => [s.datasetId, s]));
  const lines = common.map((c) => {
    const section = byId.get(c.datasetId);
    if (!section) {
      throw new Error(`Common dataset ${c.datasetId} is not in the generated datasets`);
    }
    if (!section.layers.some((l) => l.id === c.layerId)) {
      throw new Error(
        `Common dataset ${c.datasetId} has no layer ${c.layerId} (layers: ${section.layers.map((l) => l.id).join(', ')})`,
      );
    }
    return `- ${c.note}: \`datasetId=${c.datasetId}\`, \`layerId=${c.layerId}\``;
  });
  return lines.join('\n');
}

// Replaces what sits between the markers, so the rest of the hand-written llms.txt is untouched.
export function replaceCommonBlock(llmsText: string, block: string): string {
  const start = llmsText.indexOf(COMMON_BLOCK_START);
  const end = llmsText.indexOf(COMMON_BLOCK_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`public/llms.txt needs the markers ${COMMON_BLOCK_START} and ${COMMON_BLOCK_END}`);
  }
  return `${llmsText.slice(0, start + COMMON_BLOCK_START.length)}\n${block}\n${llmsText.slice(end)}`;
}
