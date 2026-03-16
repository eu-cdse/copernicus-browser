import { ODataCollections } from '../api/OData/ODataTypes';

const buildDatasetFullFilter = (datasetValue) =>
  `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq '${datasetValue}')`;

const buildProductTypeFilter = (productType) =>
  `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq '${productType}')`;

const createCollectionResponse = ({
  title = 'Test Collection',
  start = '2020-01-01',
  end = '2020-12-31',
} = {}) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({
      title,
      extent: {
        temporal: {
          interval: [[`${start}T00:00:00Z`, `${end}T00:00:00Z`]],
        },
      },
    }),
  });

const createBatchCollectionsResponse = (collectionsArray) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({
      collections: collectionsArray,
    }),
  });

const createCollectionEntry = ({
  id,
  title = 'Test Collection',
  start = '2020-01-01',
  end = '2020-12-31',
}) => ({
  id,
  title,
  extent: {
    temporal: {
      interval: [[`${start}T00:00:00Z`, end === null ? null : `${end}T00:00:00Z`]],
    },
  },
});

describe('stacAvailability getAvailabilityInfo', () => {
  let getAvailabilityInfo;

  beforeEach(async () => {
    jest.resetModules();
    global.fetch = jest.fn();
    ({ getAvailabilityInfo } = await import('./stacAvailability'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls batch STAC collections endpoint and returns availability', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({
          id: 'sentinel-6-p4-1b-nrt',
          title: 'Sentinel-6 P4 1B NRT',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-p4-1b-ntc',
          title: 'Sentinel-6 P4 1B NTC',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-p4-1b-stc',
          title: 'Sentinel-6 P4 1B STC',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-p4-2-nrt',
          title: 'Sentinel-6 P4 2 NRT',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-p4-2-ntc',
          title: 'Sentinel-6 P4 2 NTC',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-p4-2-stc',
          title: 'Sentinel-6 P4 2 STC',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-amr-c-nrt',
          title: 'Sentinel-6 AMR-C NRT',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-amr-c-ntc',
          title: 'Sentinel-6 AMR-C NTC',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
        createCollectionEntry({
          id: 'sentinel-6-amr-c-stc',
          title: 'Sentinel-6 AMR-C STC',
          start: '2021-01-01',
          end: '2021-12-31',
        }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.S6.label}')`;

    const result = await getAvailabilityInfo(filter);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = String(global.fetch.mock.calls[0][0]);
    expect(calledUrl).toContain('/v1/collections?limit=200');

    expect(result).toContain('Available data:');
    expect(result).toContain('1 Jan 2021 to 31 Dec 2021');
  });

  it('returns no S3 availability when no product type is matched (no silent fallback)', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({ id: 'sentinel-2-l1c', title: 'Sentinel-2 L1C' }),
        createCollectionEntry({ id: 'sentinel-2-l2a', title: 'Sentinel-2 L2A' }),
        createCollectionEntry({ id: 'sentinel-3-olci-1-efr-nrt', title: 'Sentinel-3 OLCI 1 EFR NRT' }),
        createCollectionEntry({ id: 'sentinel-3-olci-1-efr-ntc', title: 'Sentinel-3 OLCI 1 EFR NTC' }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.S2.label}') and (Collection/Name eq '${ODataCollections.S3.label}')`;

    const result = await getAvailabilityInfo(filter);

    // S2 collections are still shown
    expect(result).toContain('Sentinel-2 L1C');
    // S3 EFR should NOT appear — no silent fallback when no product type matches
    expect(result).not.toContain('Sentinel-3 OLCI 1 EFR NRT');
  });

  it('does not call STAC collection endpoint for CCM SAR and returns CCM label', async () => {
    const filter = `(Collection/Name eq '${
      ODataCollections.OPTICAL.collection
    }') and ${buildDatasetFullFilter('DWH_MG1_CORE_11')}`;

    const result = await getAvailabilityInfo(filter);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toContain('Available data:');
    expect(result).toContain('HR-MR Sea Ice Monitoring (2011–2014)');
  });

  it('returns all CCM Optical product labels when no specific dataset matches', async () => {
    const filter = `(Collection/Name eq '${ODataCollections.OPTICAL.collection}')`;

    const result = await getAvailabilityInfo(filter);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toContain('Available data:');
    expect(result).toContain('VHR Europe (2011–2013)');
    expect(result).toContain('VHR Europe (2014–2016)');
    expect(result).toContain('VHR Europe (2017–2019)');
    expect(result).toContain('HR Europe (2006, 2009)');
    expect(result).toContain('MR Europe Monthly (Mar–Oct 2014)');
  });

  it('returns all CCM SAR product labels when no specific dataset matches', async () => {
    const filter = `(Collection/Name eq '${
      ODataCollections.OPTICAL.collection
    }') and ${buildDatasetFullFilter('UNKNOWN_DATASET')}`;

    const result = await getAvailabilityInfo(filter);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toContain('Available data:');
    // Both ccm-optical and ccm-sar labels returned when no specific match
    expect(result).toContain('VHR Europe (2011–2013)');
    expect(result).toContain('HR-MR Sea Ice Monitoring (2011–2014)');
  });

  it('calls batch endpoint for DEM dataset and includes extent', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({ id: 'cop-dem-glo-90-dged-cog', title: 'COP DEM GLO 90', end: null }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.DEM.label}') and ${buildDatasetFullFilter(
      'COP-DEM_GLO-90-DGED',
    )}`;

    const result = await getAvailabilityInfo(filter);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain('/v1/collections?limit=200');
    expect(result).toContain('Available data:');
    expect(result).toContain('COP DEM GLO 90');
    expect(result).toContain('1 Jan 2020 to ongoing');
  });

  it('falls back to individual calls for collections missing from batch response', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        createBatchCollectionsResponse([
          createCollectionEntry({ id: 'cop-dem-eea-10-laea-tif', title: 'DEM EEA10' }),
        ]),
      )
      .mockImplementationOnce(() => createCollectionResponse({ title: 'DEM GLO30' }))
      .mockImplementationOnce(() => createCollectionResponse({ title: 'DEM GLO90' }));

    const filter = `(Collection/Name eq '${ODataCollections.DEM.label}') and ${buildDatasetFullFilter(
      'COP-DEM_UNKNOWN',
    )}`;

    const result = await getAvailabilityInfo(filter);

    // 1 batch call + 2 individual fallback calls
    expect(global.fetch).toHaveBeenCalledTimes(3);
    const calledUrls = global.fetch.mock.calls.map(([url]) => String(url));
    expect(calledUrls[0]).toContain('/v1/collections?limit=200');
    expect(calledUrls.some((url) => url.includes('/v1/collections/cop-dem-glo-30-dged-cog'))).toBe(true);
    expect(calledUrls.some((url) => url.includes('/v1/collections/cop-dem-glo-90-dged-cog'))).toBe(true);

    expect(result).toContain('Available data:');
    expect(result).toContain('DEM EEA10');
    expect(result).toContain('DEM GLO30');
    expect(result).toContain('DEM GLO90');
    expect(result).toContain('1 Jan 2020 to 31 Dec 2020');
  });

  it('falls back to individual call when interval is null in batch response', async () => {
    global.fetch
      .mockImplementationOnce(() =>
        createBatchCollectionsResponse([
          {
            id: 'sentinel-2-l1c',
            title: 'S2 L1C',
            extent: { temporal: { interval: null } },
          },
          createCollectionEntry({ id: 'sentinel-2-l2a', title: 'S2 L2A', start: '2017-03-28', end: null }),
        ]),
      )
      .mockImplementationOnce(() =>
        createCollectionResponse({ title: 'S2 L1C Individual', start: '2015-06-27', end: '2024-01-01' }),
      );

    const filter = `(Collection/Name eq '${ODataCollections.S2.label}')`;

    const result = await getAvailabilityInfo(filter);

    // 1 batch + 1 individual fallback for null-interval collection
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const calledUrls = global.fetch.mock.calls.map(([url]) => String(url));
    expect(calledUrls[0]).toContain('/v1/collections?limit=200');
    expect(calledUrls[1]).toContain('/v1/collections/sentinel-2-l1c');

    expect(result).toContain('S2 L1C Individual');
    expect(result).toContain('27 Jun 2015 to 1 Jan 2024');
    expect(result).toContain('S2 L2A');
    expect(result).toContain('28 Mar 2017 to ongoing');
  });

  it('caches the batch collections response across multiple calls', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({ id: 'sentinel-2-l1c', title: 'S2 L1C' }),
        createCollectionEntry({ id: 'sentinel-2-l2a', title: 'S2 L2A' }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.S2.label}')`;

    await getAvailabilityInfo(filter);
    await getAvailabilityInfo(filter);

    // Only 1 batch fetch despite 2 calls
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('groups entries by date and collapses processing mode variants', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({
          id: 'sentinel-5p-l2-no2-offl',
          title: 'Sentinel-5P NO2 (OFFL)',
          start: '2018-04-30',
          end: null,
        }),
        createCollectionEntry({
          id: 'sentinel-5p-l2-no2-nrti',
          title: 'Sentinel-5P NO2 (NRTI)',
          start: '2018-04-30',
          end: null,
        }),
        createCollectionEntry({
          id: 'sentinel-5p-l2-no2-rpro',
          title: 'Sentinel-5P NO2 (RPRO)',
          start: '2018-04-30',
          end: null,
        }),
        createCollectionEntry({
          id: 'sentinel-5p-l2-ch4-offl',
          title: 'Sentinel-5P CH4 (OFFL)',
          start: '2018-04-01',
          end: null,
        }),
        createCollectionEntry({
          id: 'sentinel-5p-l2-ch4-nrti',
          title: 'Sentinel-5P CH4 (NRTI)',
          start: '2018-04-01',
          end: null,
        }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.S5P.label}') and ${buildProductTypeFilter(
      'L2__NO2___',
    )} and ${buildProductTypeFilter('L2__CH4___')}`;

    const result = await getAvailabilityInfo(filter);

    // Modes are collapsed — each base product appears once
    expect(result).toContain('Sentinel-5P NO2 (OFFL / NRTI / RPRO)');
    expect(result).toContain('Sentinel-5P CH4 (OFFL / NRTI)');

    // Entries are grouped under bold date headers with soft line breaks, no bullet points
    expect(result).toContain('**30 Apr 2018 to ongoing**');
    expect(result).toContain('**1 Apr 2018 to ongoing**');
    expect(result).not.toContain('- Sentinel-5P');
    expect(result).not.toMatch(/Sentinel-5P NO2.*:.*30 Apr/);
  });

  it('retries batch fetch on each search after a network failure', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));

    const filter = `(Collection/Name eq '${ODataCollections.S2.label}')`;

    const result1 = await getAvailabilityInfo(filter);
    const result2 = await getAvailabilityInfo(filter);

    const batchCalls = global.fetch.mock.calls.filter(([url]) =>
      String(url).includes('/v1/collections?limit=200'),
    );
    expect(batchCalls).toHaveLength(2);
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('resolves multiple timeliness tokens for Sentinel-6', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({ id: 'sentinel-6-p4-1b-nrt', title: 'S6 P4 1B NRT' }),
        createCollectionEntry({ id: 'sentinel-6-p4-2-nrt', title: 'S6 P4 2 NRT' }),
        createCollectionEntry({ id: 'sentinel-6-amr-c-nrt', title: 'S6 AMR-C NRT' }),
        createCollectionEntry({ id: 'sentinel-6-p4-1b-stc', title: 'S6 P4 1B STC' }),
        createCollectionEntry({ id: 'sentinel-6-p4-2-stc', title: 'S6 P4 2 STC' }),
        createCollectionEntry({ id: 'sentinel-6-amr-c-stc', title: 'S6 AMR-C STC' }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.S6.label}') and (timeliness eq 'NR' or timeliness eq 'ST')`;

    const result = await getAvailabilityInfo(filter);

    expect(result).toContain('S6 P4 1B NRT');
    expect(result).toContain('S6 P4 1B STC');
    expect(result).not.toContain('NTC');
  });

  it('queries only OLI_TIRS collection when both OLI and TIRS product types are filtered', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({ id: 'landsat-c2-l1-oli-tirs', title: 'Landsat C2 OLI+TIRS' }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.LANDSAT8.label}') and ${buildProductTypeFilter(
      'OLI',
    )} and ${buildProductTypeFilter('TIRS')}`;

    const result = await getAvailabilityInfo(filter);

    // Only 1 batch call — no individual fallback calls for OLI-only or TIRS-only collections
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toContain('Landsat C2 OLI+TIRS');
  });

  it('queries sentinel-1-grd only when GRD product type is filtered', async () => {
    global.fetch.mockImplementation(() =>
      createBatchCollectionsResponse([
        createCollectionEntry({ id: 'sentinel-1-grd', title: 'Sentinel-1 GRD' }),
      ]),
    );

    const filter = `(Collection/Name eq '${ODataCollections.S1.label}') and ${buildProductTypeFilter('GRD')}`;

    const result = await getAvailabilityInfo(filter);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result).toContain('Sentinel-1 GRD');
  });
});
