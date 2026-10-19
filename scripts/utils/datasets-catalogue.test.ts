import {
  addVectorSections,
  bareCollectionId,
  buildCollectionIndex,
  buildSections,
  compareIds,
  DO_NOT_USE,
  exampleUrl,
  instanceIdFromUrl,
  renderDatasets,
  type ConfigLayer,
  type KnownCollections,
} from './datasets-catalogue';

const wms = (instanceId: string) => `https://sh.dataspace.copernicus.eu/ogc/wms/${instanceId}`;

const known: KnownCollections = {
  CLMS: {
    COPERNICUS_CLMS_FOO: ['11111111-1111-1111-1111-111111111111'],
    COPERNICUS_CLMS_BAR: ['22222222-2222-2222-2222-222222222222'],
  },
  MOSAIC: {
    'aaaaaaaa-0000-0000-0000-000000000001': ['aaaaaaaa-0000-0000-0000-000000000001'],
  },
};

describe('instanceIdFromUrl / bareCollectionId', () => {
  it('takes the last path segment of the WMS url', () => {
    expect(instanceIdFromUrl(wms('abc-123'))).toBe('abc-123');
  });

  it('strips the byoc- prefix used in the cached configuration', () => {
    expect(bareCollectionId('byoc-11111111-1111-1111-1111-111111111111')).toBe(
      '11111111-1111-1111-1111-111111111111',
    );
    expect(bareCollectionId('sentinel-2-l2a')).toBe('sentinel-2-l2a');
  });
});

describe('buildCollectionIndex', () => {
  it('maps every collection id to its dataset id', () => {
    const index = buildCollectionIndex(known);

    expect(index.get('11111111-1111-1111-1111-111111111111')).toBe('COPERNICUS_CLMS_FOO');
    expect(index.get('aaaaaaaa-0000-0000-0000-000000000001')).toBe('aaaaaaaa-0000-0000-0000-000000000001');
  });

  it('keeps the first dataset when a collection id appears twice', () => {
    const index = buildCollectionIndex({
      A: { FIRST: ['x'] },
      B: { SECOND: ['x'] },
    });

    expect(index.get('x')).toBe('FIRST');
  });
});

describe('buildSections', () => {
  const index = buildCollectionIndex(known);
  const layer = (id: string, extra: Partial<ConfigLayer> = {}): ConfigLayer => ({ id, title: id, ...extra });

  it('maps a non-BYOC entry from its display name', () => {
    const { sections } = buildSections(
      [{ name: 'Sentinel-2 L2A', url: wms('i1') }],
      { i1: [layer('1_TRUE_COLOR', { collectionType: 'S2L2A' })] },
      index,
    );

    expect(sections).toEqual([
      {
        datasetId: 'S2_L2A_CDAS',
        label: 'Sentinel-2 L2A',
        layers: [{ id: '1_TRUE_COLOR', title: '1_TRUE_COLOR' }],
        clms: false,
      },
    ]);
  });

  it.each([
    ['Sentinel-1 IW VV+VH', 'S1_CDAS_IW_VVVH'],
    ['Sentinel-1 EW HH+HV', 'S1_CDAS_EW_HHHV'],
    ['Sentinel-1 SM VV', 'S1_CDAS_SM_VV'],
    ['Landsat-8/9 L1', 'CDAS_L8_L9_LOTL1'],
    ['DEM COPERNICUS_90', 'DEM_COPERNICUS_90_CDAS'],
  ])('maps "%s" to %s', (name, datasetId) => {
    const { sections } = buildSections(
      [{ name, url: wms('i1') }],
      { i1: [layer('L', { collectionType: 'X' })] },
      index,
    );

    expect(sections.map((s) => s.datasetId)).toEqual([datasetId]);
  });

  it('matches BYOC layers through the collection id, ignoring the byoc- prefix', () => {
    const { sections } = buildSections(
      [{ name: 'foo', url: wms('i1') }],
      {
        i1: [
          layer('A', { collectionType: 'CUSTOM', collectionId: 'byoc-11111111-1111-1111-1111-111111111111' }),
        ],
      },
      index,
    );

    expect(sections.map((s) => s.datasetId)).toEqual(['COPERNICUS_CLMS_FOO']);
    expect(sections[0].clms).toBe(true);
  });

  it('splits an instance spanning several collections per layer, not per instance', () => {
    const { sections } = buildSections(
      [{ name: 'multi', url: wms('i1') }],
      {
        i1: [
          layer('A', { collectionType: 'CUSTOM', collectionId: 'byoc-11111111-1111-1111-1111-111111111111' }),
          layer('B', { collectionType: 'CUSTOM', collectionId: 'byoc-22222222-2222-2222-2222-222222222222' }),
        ],
      },
      index,
    );

    expect(sections.map((s) => [s.datasetId, s.layers.map((l) => l.id)])).toEqual([
      ['COPERNICUS_CLMS_BAR', ['B']],
      ['COPERNICUS_CLMS_FOO', ['A']],
    ]);
  });

  it("assigns Sentinel-5P layers by the handler's startsWith rule, and only offers the _VISUALIZED ones", () => {
    const { sections, skipped, excluded } = buildSections(
      [{ name: 'S5P', url: wms('i1') }],
      {
        i1: [
          'NO2_VISUALIZED',
          'CO_VISUALIZED',
          'O3_VISUALIZED',
          'AER_AI_340_AND_380_VISUALIZED',
          'CLOUD_BASE_HEIGHT_VISUALIZED',
          'WEIRD_VISUALIZED',
          'NO2',
          '__SHADOW_VISUALIZED',
        ].map((id) => layer(id, { collectionType: 'S5PL2' })),
      },
      index,
    );

    expect(Object.fromEntries(sections.map((s) => [s.datasetId, s.layers.map((l) => l.id)]))).toEqual({
      S5_AER_AI_CDAS: ['AER_AI_340_AND_380_VISUALIZED'],
      S5_CLOUD_CDAS: ['CLOUD_BASE_HEIGHT_VISUALIZED'],
      S5_CO_CDAS: ['CO_VISUALIZED'],
      S5_NO2_CDAS: ['NO2_VISUALIZED'],
      S5_O3_CDAS: ['O3_VISUALIZED'],
      S5_OTHER_CDAS: ['WEIRD_VISUALIZED'],
    });
    // not offered by the app on purpose, so they are counted as excluded, not reported as unmapped
    expect(skipped).toEqual([]);
    expect(excluded).toBe(2);
  });

  it("splits Sentinel-3 OLCI L2 into land and water, and SYNERGY by the handler's layer lists", () => {
    const { sections, skipped, excluded } = buildSections(
      [
        { name: 'Sentinel-3 OLCI L2', url: wms('olci') },
        { name: 'Sentinel-3 SYNERGY', url: wms('syn') },
      ],
      {
        olci: [
          layer('1_LAND_GIFAPAR', { collectionType: 'S3OLCIL2' }),
          layer('2_WATER_CHL_OC4ME', { collectionType: 'S3OLCIL2' }),
        ],
        syn: ['TRUE-COLOR', 'FALSE-COLOR', 'S6', 'NDVI_VG1', 'TOA_NDVI_VG1', 'NDVI_V10', 'B04', 'B0_V10'].map(
          (id) => layer(id, { collectionType: 'S3SYNL2' }),
        ),
      },
      index,
    );

    expect(Object.fromEntries(sections.map((s) => [s.datasetId, s.layers.map((l) => l.id)]))).toEqual({
      S3OLCIL2_LAND: ['1_LAND_GIFAPAR'],
      S3OLCIL2_WATER: ['2_WATER_CHL_OC4ME'],
      S3SYNERGY_L2_SYN: ['FALSE-COLOR', 'S6', 'TRUE-COLOR'],
      S3SYNERGY_L2_V10: ['NDVI_V10'],
      S3SYNERGY_L2_VG1: ['NDVI_VG1', 'TOA_NDVI_VG1'],
    });
    // plain bands are not offered for any SYNERGY dataset, so they must not appear as valid layers,
    // and they are not "unmapped" either: they are left out on purpose
    expect(skipped).toEqual([]);
    expect(excluded).toBe(2);
  });

  it('reports entries it cannot map instead of dropping them silently', () => {
    const { sections, skipped, excluded } = buildSections(
      [
        { name: 'Unknown thing', url: wms('i1') },
        { name: 'No layers', url: wms('i2') },
      ],
      { i1: [layer('A', { collectionType: 'CUSTOM', collectionId: 'byoc-does-not-exist' })] },
      index,
    );

    expect(sections).toEqual([]);
    expect(skipped).toEqual(['No layers (no cached layers)', 'Unknown thing / A']);
    expect(excluded).toBe(0);
  });

  it('still reports an unmapped layer of a split dataset (OLCI L2 with neither LAND nor WATER)', () => {
    const { skipped, excluded } = buildSections(
      [{ name: 'Sentinel-3 OLCI L2', url: wms('i1') }],
      { i1: [layer('9_SOMETHING_NEW', { collectionType: 'S3OLCIL2' })] },
      index,
    );

    expect(skipped).toEqual(['Sentinel-3 OLCI L2 / 9_SOMETHING_NEW']);
    expect(excluded).toBe(0);
  });

  it('trims titles, de-duplicates layers and sorts datasets and layers', () => {
    const { sections } = buildSections(
      [
        { name: 'Sentinel-2 L2A', url: wms('i1') },
        { name: 'Sentinel-2 L1C', url: wms('i2') },
      ],
      {
        i1: [
          layer('B', { collectionType: 'S2L2A', title: 'Beta ' }),
          layer('A', { collectionType: 'S2L2A', title: 'Alpha' }),
          layer('A', { collectionType: 'S2L2A', title: 'Alpha again' }),
        ],
        i2: [layer('X', { collectionType: 'S2L1C' })],
      },
      index,
    );

    expect(sections.map((s) => s.datasetId)).toEqual(['S2_L1C_CDAS', 'S2_L2A_CDAS']);
    expect(sections[1].layers).toEqual([
      { id: 'A', title: 'Alpha' },
      { id: 'B', title: 'Beta' },
    ]);
  });
});

describe('addVectorSections', () => {
  const metadata = [
    {
      match: [{ datasourceId: 'UA_LCU_2021_VECTOR', layerId: 'CLMS_UA_LCU_S2021_V025ha' }],
      title: () => 'Land Cover 2021 ',
    },
    {
      match: [{ datasourceId: 'PA_LCU_2021_VECTOR', layerId: 'CLMS_PA-LCU_S2021_V05ha' }],
      title: () => 'Protected Areas 2021',
    },
    { match: [{ datasourceId: 'S2_L2A_CDAS', layerId: '1_TRUE_COLOR' }], title: () => 'ignored' },
    { match: [{ datasourceId: 'UA_BUILDING_HEIGHT_RASTER', layerId: 'X' }] },
  ];

  it('adds every CLMS vector dataset (Urban Atlas and Protected Areas), with trimmed titles', () => {
    const sections = addVectorSections([], metadata);

    expect(sections).toEqual([
      {
        datasetId: 'PA_LCU_2021_VECTOR',
        label: 'CLMS vector dataset PA_LCU_2021_VECTOR',
        layers: [{ id: 'CLMS_PA-LCU_S2021_V05ha', title: 'Protected Areas 2021' }],
        clms: true,
      },
      {
        datasetId: 'UA_LCU_2021_VECTOR',
        label: 'CLMS vector dataset UA_LCU_2021_VECTOR',
        layers: [{ id: 'CLMS_UA_LCU_S2021_V025ha', title: 'Land Cover 2021' }],
        clms: true,
      },
    ]);
  });

  it('keeps existing sections and does not duplicate layers', () => {
    const once = addVectorSections([], metadata);
    const twice = addVectorSections(once, metadata);

    expect(twice).toEqual(once);
  });
});

describe('exampleUrl', () => {
  it('builds a link with the dataset, its first layer and date=latest', () => {
    const url = new URL(
      exampleUrl({
        datasetId: 'S2_L2A_CDAS',
        label: 'S2',
        layers: [{ id: '1_TRUE_COLOR', title: 'True' }],
        clms: false,
      }),
    );

    expect(url.origin + url.pathname).toBe('https://browser.dataspace.copernicus.eu/');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      themeId: 'DEFAULT-THEME',
      datasetId: 'S2_L2A_CDAS',
      layerId: '1_TRUE_COLOR',
      date: 'latest',
    });
    expect(url.searchParams.has('clmsSelectedPath')).toBe(false);
  });

  it('adds the CLMS parameters for CLMS datasets', () => {
    const url = new URL(
      exampleUrl({
        datasetId: 'COPERNICUS_CLMS_FOO',
        label: 'F',
        layers: [{ id: 'L', title: 'L' }],
        clms: true,
      }),
    );

    expect(url.searchParams.get('clmsSelectedPath')).toBe('COPERNICUS_CLMS_FOO');
    expect(url.searchParams.get('clmsSelectedCollection')).toBe('COPERNICUS_CLMS_FOO');
  });
});

describe('renderDatasets', () => {
  const sections = [
    { datasetId: 'B_SET', label: 'Bee', layers: [{ id: 'L1', title: 'One' }], clms: false },
    { datasetId: 'A_SET', label: 'Aye', layers: [{ id: 'L2', title: 'Two' }], clms: false },
  ];

  it('is deterministic for the same input', () => {
    expect(renderDatasets(sections, [])).toBe(renderDatasets(sections, []));
  });

  it('lists every dataset id as a heading with its layers', () => {
    const text = renderDatasets(sections, []);

    expect(text).toContain('### A_SET');
    expect(text).toContain('### B_SET');
    expect(text).toContain('- `L1`: One');
    expect(text).toContain('2 datasets.');
  });

  it('lists every do-not-use id, with its replacement where one exists', () => {
    const text = renderDatasets(sections, []);

    DO_NOT_USE.forEach((d) => expect(text).toContain(`\`${d.wrong}\``));
    expect(text).toContain('`LOTL1_CDAS`: use `CDAS_L8_L9_LOTL1` instead');
    expect(text).toContain('`MODIS_CDAS`: no replacement');
  });

  it('only has a "Not listed" section when something was skipped', () => {
    expect(renderDatasets(sections, [])).not.toContain('## Not listed');
    expect(renderDatasets(sections, ['Foo / bar'])).toContain('- Foo / bar');
  });

  it('contains no dates, so regenerating never changes the file', () => {
    expect(renderDatasets(sections, [])).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/);
  });
});

describe('compareIds', () => {
  it('orders by code point, whatever the machine locale is', () => {
    // localeCompare puts these in a different order under cs_CZ ("CH" sorts after "CZ") and da_DK
    // ("aa" sorts last), which would make CI's git-diff check fail for those developers.
    expect(['S5_CO_CDAS', 'S5_CH4_CDAS', 'aaaa-1', 'Zeta', 'alpha'].sort(compareIds)).toEqual([
      'S5_CH4_CDAS',
      'S5_CO_CDAS',
      'Zeta',
      'aaaa-1',
      'alpha',
    ]);
  });

  it('returns 0 for equal ids', () => {
    expect(compareIds('a', 'a')).toBe(0);
  });

  it('sorts the rendered datasets by code point', () => {
    const { sections } = buildSections(
      [
        { name: 'Sentinel-2 L2A', url: wms('i1') },
        { name: 'Sentinel-2 L1C', url: wms('i2') },
      ],
      {
        i1: [
          { id: 'b', collectionType: 'S2L2A' },
          { id: 'B', collectionType: 'S2L2A' },
        ],
        i2: [{ id: 'x', collectionType: 'S2L1C' }],
      },
      new Map(),
    );

    expect(sections.map((s) => s.datasetId)).toEqual(['S2_L1C_CDAS', 'S2_L2A_CDAS']);
    expect(sections[1].layers.map((l) => l.id)).toEqual(['B', 'b']);
  });
});
