import fs from 'fs';
import path from 'path';

import { CLMS_OPTIONS } from '../../src/Tools/VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils.js';
import type { DatasetSection } from './datasets-catalogue';
import {
  assignGroups,
  buildClmsGroupIndex,
  type ClmsOption,
  collapseConsolidationPeriods,
  COMMON_BLOCK_END,
  COMMON_BLOCK_START,
  COMMON_DATASETS,
  GROUPS,
  groupForSection,
  MAX_FILE_BYTES,
  renderCommonDatasets,
  replaceCommonBlock,
} from './datasets-groups';

const section = (datasetId: string, label = datasetId, layers = ['L1']): DatasetSection => ({
  datasetId,
  label,
  layers: layers.map((id) => ({ id, title: id })),
  clms: datasetId.startsWith('COPERNICUS_CLMS_'),
});

// Mirrors the shape of CLMS_OPTIONS: a base product, a product that starts at _RT0, and a plain one.
const tree: ClmsOption[] = [
  {
    id: 'Bio-geophysical Parameters',
    label: 'Bio-geophysical Parameters',
    options: [
      {
        id: 'Vegetation',
        label: 'Vegetation',
        options: [
          {
            id: 'Vegetation Properties',
            label: 'Vegetation Properties',
            options: [
              {
                id: 'COPERNICUS_CLMS_BASE',
                consolidationPeriods: [
                  { id: 'COPERNICUS_CLMS_BASE' },
                  { id: 'COPERNICUS_CLMS_BASE_RT0' },
                  { id: 'COPERNICUS_CLMS_BASE_RT1' },
                ],
              },
              {
                id: 'COPERNICUS_CLMS_NOBASE_RT0',
                consolidationPeriods: [
                  { id: 'COPERNICUS_CLMS_NOBASE_RT0' },
                  { id: 'COPERNICUS_CLMS_NOBASE_RT6' },
                ],
              },
            ],
          },
          {
            id: 'Burnt Area',
            label: 'Burnt Area',
            options: [{ id: 'COPERNICUS_CLMS_BA' }],
          },
        ],
      },
      { id: 'Water Bodies 1', label: 'Water Bodies', options: [{ id: 'COPERNICUS_CLMS_WB' }] },
    ],
  },
  {
    id: 'Land Cover and Land Use Mapping',
    label: 'Land Cover and Land Use Mapping',
    options: [
      { id: 'Dynamic Land Cover', label: 'Dynamic Land Cover', options: [{ id: 'uuid-dlc' }] },
      { id: 'Croplands', label: 'Croplands', options: [{ id: 'COPERNICUS_CLMS_CROP' }] },
      {
        id: 'CLCplus LULUCF Instance',
        label: 'CLCplus LULUCF Instance',
        options: [{ id: 'COPERNICUS_CLMS_CLCPLUS' }],
      },
    ],
  },
];

describe('collapseConsolidationPeriods', () => {
  const sections = [
    section('COPERNICUS_CLMS_BASE'),
    section('COPERNICUS_CLMS_BASE_RT0'),
    section('COPERNICUS_CLMS_BASE_RT1'),
    section('COPERNICUS_CLMS_NOBASE_RT0'),
    section('COPERNICUS_CLMS_NOBASE_RT6'),
    section('COPERNICUS_CLMS_WB'),
  ];

  it('keeps the base dataset where there is one, otherwise the _RT0 stage', () => {
    const ids = collapseConsolidationPeriods(sections, tree).map((s) => s.datasetId);

    expect(ids).toEqual(['COPERNICUS_CLMS_BASE', 'COPERNICUS_CLMS_NOBASE_RT0', 'COPERNICUS_CLMS_WB']);
  });

  it('names the left-out stages on the kept dataset, sorted', () => {
    const kept = collapseConsolidationPeriods(sections, tree);

    expect(kept[0].omittedStages).toEqual(['COPERNICUS_CLMS_BASE_RT0', 'COPERNICUS_CLMS_BASE_RT1']);
    expect(kept[1].omittedStages).toEqual(['COPERNICUS_CLMS_NOBASE_RT6']);
    expect(kept[2].omittedStages).toBeUndefined();
  });

  it('does not change the input', () => {
    collapseConsolidationPeriods(sections, tree);

    expect(sections).toHaveLength(6);
    expect(sections[0].omittedStages).toBeUndefined();
  });
});

describe('buildClmsGroupIndex', () => {
  const index = buildClmsGroupIndex(tree);

  it('splits Bio-geophysical Parameters by subcategory, and names the group from the label, not the id', () => {
    expect(index.get('COPERNICUS_CLMS_BASE')).toBe('clms-bio-vegetation-properties');
    expect(index.get('COPERNICUS_CLMS_WB')).toBe('clms-bio-water-bodies');
  });

  it('splits Vegetation by its own subcategory, since it is the largest', () => {
    expect(index.get('COPERNICUS_CLMS_BA')).toBe('clms-bio-vegetation-indices');
  });

  it('places the consolidation periods with their product', () => {
    expect(index.get('COPERNICUS_CLMS_BASE_RT1')).toBe('clms-bio-vegetation-properties');
    expect(index.get('COPERNICUS_CLMS_NOBASE_RT6')).toBe('clms-bio-vegetation-properties');
  });

  it('splits Land Cover and Land Use Mapping by subcategory too, also for UUID datasets', () => {
    expect(index.get('COPERNICUS_CLMS_CROP')).toBe('clms-lcm-croplands');
    expect(index.get('uuid-dlc')).toBe('clms-lcm-other');
    expect(index.get('COPERNICUS_CLMS_CLCPLUS')).toBe('clms-lcm-other');
  });

  it('keeps Priority Areas as one group', () => {
    const priority: ClmsOption[] = [
      {
        id: 'p',
        label: 'Land Cover and Land Use in Priority Areas',
        options: [{ id: 'UA_X', label: 'Urban Atlas', options: [{ id: 'UA_X_VECTOR' }] }],
      },
    ];

    expect(buildClmsGroupIndex(priority).get('UA_X_VECTOR')).toBe('clms-priority-areas');
  });

  it('throws on a category it has no group for, naming the dataset', () => {
    const unknown: ClmsOption[] = [
      { id: 'New', label: 'New category', options: [{ id: 'COPERNICUS_CLMS_NEW' }] },
    ];

    expect(() => buildClmsGroupIndex(unknown)).toThrow(/New category.*COPERNICUS_CLMS_NEW/);
  });
});

describe('groupForSection / assignGroups', () => {
  const clms = buildClmsGroupIndex(tree);

  it.each([
    ['S2_L2A_CDAS', 'Sentinel-2 L2A', 'sentinel-2'],
    ['S1_CDAS_IW_VVVH', 'Sentinel-1 IW VV+VH', 'sentinel-1'],
    ['S3OLCI_CDAS', 'Sentinel-3 OLCI', 'sentinel-3-5p'],
    ['S5_NO2_CDAS', 'Sentinel-5P NO2', 'sentinel-3-5p'],
    ['CDAS_L8_L9_LOTL1', 'Landsat-8/9 L1', 'landsat'],
    ['DEM_COPERNICUS_30_CDAS', 'DEM COPERNICUS_30', 'dem'],
    ['CCM_VHR_IMAGE_2024', 'VHR Image 2024', 'ccm'],
    ['CCM_MR_THERMAL_LST', 'MR Thermal LST', 'ccm'],
  ])('%s goes to %s', (datasetId, label, group) => {
    expect(groupForSection(section(datasetId, label), clms)).toBe(group);
  });

  it('puts every mosaic in mosaics, but the CCM mosaic in CCM', () => {
    expect(groupForSection(section('CDAS_LANDSAT_MOSAIC', 'Landsat Mosaics'), clms)).toBe('mosaics');
    expect(groupForSection(section('3c662330-uuid', 'Sentinel-1 Mosaics IW'), clms)).toBe('mosaics');
    expect(groupForSection(section('CCM_VHR_IMAGE_MOSAIC_2024', 'VHR Mosaic 2024'), clms)).toBe('ccm');
  });

  it('uses the CLMS tree before anything else, so a UUID CLMS dataset is not taken for a mosaic', () => {
    expect(groupForSection(section('uuid-dlc', 'Some Mosaic-like name'), clms)).toBe('clms-lcm-other');
  });

  it('throws on a dataset that fits no group, naming it', () => {
    expect(() => groupForSection(section('SOMETHING_NEW', 'Something new'), clms)).toThrow(
      /SOMETHING_NEW.*fits no group/,
    );
  });

  it('puts every section in exactly one group, in the fixed group order, sorted by id', () => {
    const byGroup = assignGroups(
      [
        section('S2_L2A_CDAS'),
        section('S2_L1C_CDAS'),
        section('S1_CDAS_IW_VV'),
        section('COPERNICUS_CLMS_WB'),
      ],
      clms,
    );

    expect([...byGroup.keys()]).toEqual(GROUPS.map((g) => g.id));
    expect(byGroup.get('sentinel-2')?.map((s) => s.datasetId)).toEqual(['S2_L1C_CDAS', 'S2_L2A_CDAS']);
    expect([...byGroup.values()].flat()).toHaveLength(4);
  });
});

describe('renderCommonDatasets / replaceCommonBlock', () => {
  const sections = [section('S2_L2A_CDAS', 'x', ['1_TRUE_COLOR', '3_NDVI'])];

  it('lists each pair with its note', () => {
    const text = renderCommonDatasets(
      [{ datasetId: 'S2_L2A_CDAS', layerId: '1_TRUE_COLOR', note: 'Sentinel-2 L2A' }],
      sections,
    );

    expect(text).toBe('- Sentinel-2 L2A: `datasetId=S2_L2A_CDAS`, `layerId=1_TRUE_COLOR`');
  });

  it('throws when a dataset is not in the generated datasets', () => {
    expect(() => renderCommonDatasets([{ datasetId: 'GONE', layerId: 'L', note: 'n' }], sections)).toThrow(
      /GONE is not in the generated datasets/,
    );
  });

  it('throws when the layer does not exist, and lists the real layers', () => {
    expect(() =>
      renderCommonDatasets([{ datasetId: 'S2_L2A_CDAS', layerId: 'MADE_UP', note: 'n' }], sections),
    ).toThrow(/no layer MADE_UP.*1_TRUE_COLOR, 3_NDVI/);
  });

  it('replaces only what is between the markers', () => {
    const text = `before\n${COMMON_BLOCK_START}\nold\n${COMMON_BLOCK_END}\nafter`;

    expect(replaceCommonBlock(text, 'new')).toBe(
      `before\n${COMMON_BLOCK_START}\nnew\n${COMMON_BLOCK_END}\nafter`,
    );
  });

  it('throws when the markers are missing', () => {
    expect(() => replaceCommonBlock('no markers here', 'x')).toThrow(/needs the markers/);
  });

  it('throws when the end marker comes before the start marker', () => {
    const text = `${COMMON_BLOCK_END}\nold\n${COMMON_BLOCK_START}`;

    expect(() => replaceCommonBlock(text, 'x')).toThrow(/needs the markers/);
  });
});

// Reads the files that are committed, so a hand edit or a forgotten `npm run generate-datasets` fails here.
describe('generated catalogue files (public/)', () => {
  const root = path.resolve(__dirname, '../..');
  const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
  const datasetIds = (text: string) => [...text.matchAll(/^### (.+)$/gm)].map((m) => m[1]);
  const groupFiles = GROUPS.map((g) => `public/datasets/${g.id}.txt`).filter((f) =>
    fs.existsSync(path.join(root, f)),
  );

  it('keeps the index and every group file within the size limit', () => {
    ['public/datasets/index.txt', ...groupFiles].forEach((file) => {
      expect(Buffer.byteLength(read(file))).toBeLessThanOrEqual(MAX_FILE_BYTES);
    });
  });

  it('has a group file only for the groups, and the index links every one of them', () => {
    const onDisk = fs.readdirSync(path.join(root, 'public/datasets')).sort();
    const index = read('public/datasets/index.txt');

    expect(onDisk).toEqual(['index.txt', ...groupFiles.map((f) => path.basename(f))].sort());
    groupFiles.forEach((f) => expect(index).toContain(`/datasets/${path.basename(f)}`));
  });

  it('lists every dataset of the full file in exactly one group file, and nothing else', () => {
    const inGroups = groupFiles.flatMap((f) => datasetIds(read(f)));

    expect(new Set(inGroups).size).toBe(inGroups.length);
    expect([...inGroups].sort()).toEqual([...datasetIds(read('public/datasets.txt'))].sort());
  });

  it('leaves the other consolidation stages out of the headings and names them on the kept product', () => {
    const full = read('public/datasets.txt');
    const headings = datasetIds(full);
    const omitted = [...full.matchAll(/^Also available as (.+?) \(/gm)].flatMap((m) =>
      m[1].split(', ').map((id) => id.replace(/`/g, '')),
    );

    expect(omitted.length).toBeGreaterThan(0);
    omitted.forEach((id) => expect(headings).not.toContain(id));
  });

  it('keeps every consolidation stage of CLMS_OPTIONS either as a dataset or as an omitted stage', () => {
    const full = read('public/datasets.txt');
    const headings = new Set(datasetIds(full));
    const named = new Set([...full.matchAll(/`(COPERNICUS_CLMS_[A-Z0-9_]+_RT\d)`/g)].map((m) => m[1]));
    const walk = (nodes: ClmsOption[]): string[] =>
      nodes.flatMap((n) => (n.options ? walk(n.options) : (n.consolidationPeriods ?? []).map((p) => p.id)));

    walk(CLMS_OPTIONS as ClmsOption[]).forEach((id) => {
      expect(headings.has(id) || named.has(id)).toBe(true);
    });
  });

  it('has a common-datasets block in llms.txt that matches what the generator would write', () => {
    const llms = read('public/llms.txt');
    const full = read('public/datasets.txt');

    COMMON_DATASETS.forEach((c) => {
      expect(llms).toContain(`\`datasetId=${c.datasetId}\`, \`layerId=${c.layerId}\``);
      expect(full).toContain(`### ${c.datasetId}`);
      expect(full).toContain(`- \`${c.layerId}\`:`);
    });
  });
});
