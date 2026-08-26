import {
  getServiceEndpoint,
  validateWmsUrl,
  isWebPageMetadataUrl,
  isWebPageMetadata,
  buildExternalGetFeatureInfoUrl,
  getWmsAvailableDatesInMonth,
  buildWmtsPreviewTileUrl,
  fetchWmsCapabilities,
  fetchWmtsCapabilities,
} from './externalLayers.utils';

// ---------------------------------------------------------------------------
// getServiceEndpoint
// ---------------------------------------------------------------------------

describe('getServiceEndpoint', () => {
  it('strips standard WMS request params but keeps non-request params like token', () => {
    const url = 'https://example.com/wms?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0&token=abc123';
    const result = getServiceEndpoint(url);
    expect(result).not.toContain('SERVICE');
    expect(result).not.toContain('REQUEST');
    expect(result).not.toContain('VERSION');
    expect(result).toContain('token=abc123');
  });

  it('keeps apikey param after stripping request params', () => {
    const url = 'https://example.com/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=foo&apikey=secret';
    const result = getServiceEndpoint(url);
    expect(result).not.toContain('LAYERS');
    expect(result).toContain('apikey=secret');
  });

  it('handles a URL with no query string', () => {
    const url = 'https://example.com/wms';
    expect(getServiceEndpoint(url)).toBe('https://example.com/wms');
  });

  it('handles a URL with a trailing slash', () => {
    const url = 'https://example.com/wms/';
    expect(getServiceEndpoint(url)).toBe('https://example.com/wms/');
  });

  it('strips BBOX, SRS, CRS, WIDTH, HEIGHT, FORMAT, TRANSPARENT, TIME params', () => {
    const url =
      'https://example.com/wms?BBOX=0,0,1,1&SRS=EPSG:4326&CRS=EPSG:4326&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=true&TIME=2024-01-01';
    const result = getServiceEndpoint(url);
    expect(result).toBe('https://example.com/wms');
  });

  it('strips WMTS params: TILEMATRIX, TILEMATRIXSET, TILEROW, TILECOL, LAYER, STYLE', () => {
    const url =
      'https://example.com/wmts?SERVICE=WMTS&REQUEST=GetTile&LAYER=foo&STYLE=default&TILEMATRIX=5&TILEMATRIXSET=GoogleMapsCompatible&TILEROW=10&TILECOL=20';
    const result = getServiceEndpoint(url);
    expect(result).toBe('https://example.com/wmts');
  });

  it('returns the input unchanged for a malformed URL', () => {
    const badUrl = 'not-a-valid-url';
    expect(getServiceEndpoint(badUrl)).toBe(badUrl);
  });

  it('preserves multiple non-request params', () => {
    const url = 'https://example.com/wms?SERVICE=WMS&token=abc&env=prod';
    const result = getServiceEndpoint(url);
    expect(result).toContain('token=abc');
    expect(result).toContain('env=prod');
    expect(result).not.toContain('SERVICE');
  });
});

// ---------------------------------------------------------------------------
// validateWmsUrl
// ---------------------------------------------------------------------------

describe('validateWmsUrl', () => {
  it('accepts http:// URLs', () => {
    expect(validateWmsUrl('http://example.com/wms')).toBe(true);
  });

  it('accepts https:// URLs', () => {
    expect(validateWmsUrl('https://example.com/wms?SERVICE=WMS')).toBe(true);
  });

  it('rejects javascript: protocol', () => {
    expect(validateWmsUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects data: protocol', () => {
    expect(validateWmsUrl('data:text/html,<h1>hello</h1>')).toBe(false);
  });

  it('rejects plain non-URL strings', () => {
    expect(validateWmsUrl('not a url at all')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateWmsUrl('')).toBe(false);
  });

  it('rejects ftp:// protocol', () => {
    expect(validateWmsUrl('ftp://example.com/file')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isWebPageMetadataUrl
// ---------------------------------------------------------------------------

describe('isWebPageMetadataUrl', () => {
  it('hides links whose path ends in a data-file extension', () => {
    expect(isWebPageMetadataUrl('https://example.com/metadata.xml')).toBe(false);
    expect(isWebPageMetadataUrl('https://example.com/data.gml')).toBe(false);
    expect(isWebPageMetadataUrl('https://example.com/record.json')).toBe(false);
    expect(isWebPageMetadataUrl('https://example.com/layer.geojson')).toBe(false);
  });

  it('is case-insensitive on the extension', () => {
    expect(isWebPageMetadataUrl('https://example.com/METADATA.XML')).toBe(false);
  });

  it('shows a catalogue web page with a fragment (no data-file extension in the path)', () => {
    expect(
      isWebPageMetadataUrl(
        'https://www.geocat.ch/geonetwork/srv/ger/catalog.search#/metadata/e986a2d2-aeae-4b3c-87e5-bef9c62c58c8',
      ),
    ).toBe(true);
  });

  it('ignores query strings and fragments when checking the extension', () => {
    // The .xml lives in the query, not the path, so this is treated as a web page.
    expect(isWebPageMetadataUrl('https://example.com/getMetadata?format=xml')).toBe(true);
    // A real .xml path is still hidden even with a trailing query.
    expect(isWebPageMetadataUrl('https://example.com/iso.xml?lang=en')).toBe(false);
  });

  it('hides OGC web-service operations whose path has no data-file extension', () => {
    // A CSW GetRecordById request returns ISO XML even though the path is just .../csw.
    expect(
      isWebPageMetadataUrl(
        'https://csw.open.canada.ca/geonetwork/srv/csw?service=CSW&version=2.0.2&request=GetRecordById&outputschema=csw:IsoRecord&elementsetname=full&id=79550951-6b17-49a6-9028-8ae1c21274cf',
      ),
    ).toBe(false);
    // Any OGC service endpoint (WFS/WCS/…) serves machine-readable documents, not a web page.
    expect(isWebPageMetadataUrl('https://example.com/ows?service=WFS&request=GetCapabilities')).toBe(false);
    // Case-insensitive on both param name and value.
    expect(isWebPageMetadataUrl('https://example.com/srv/csw?SERVICE=csw&REQUEST=GetRecords')).toBe(false);
    // outputSchema alone (CSW) is enough to flag XML output.
    expect(isWebPageMetadataUrl('https://example.com/srv/eng/csw?outputSchema=csw:IsoRecord')).toBe(false);
  });

  it('does not hide a plain web page URL', () => {
    expect(isWebPageMetadataUrl('https://example.com/metadata')).toBe(true);
    expect(isWebPageMetadataUrl('https://example.com/info.html')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isWebPageMetadata (MIME-aware classifier)
// ---------------------------------------------------------------------------

describe('isWebPageMetadata', () => {
  it('trusts a web-page MIME even when the URL looks machine-readable', () => {
    expect(isWebPageMetadata('https://example.com/record.xml', 'text/html')).toBe(true);
    expect(isWebPageMetadata('https://example.com/csw?service=CSW&request=GetRecordById', 'text/html')).toBe(
      true,
    );
    expect(isWebPageMetadata('https://example.com/record', 'application/xhtml+xml')).toBe(true);
  });

  it('hides a machine-readable MIME even when the URL looks like a web page', () => {
    expect(isWebPageMetadata('https://example.com/catalogue/record/abc', 'application/xml')).toBe(false);
    expect(isWebPageMetadata('https://example.com/record', 'text/xml')).toBe(false);
    expect(isWebPageMetadata('https://example.com/record', 'application/gml+xml')).toBe(false);
    expect(isWebPageMetadata('https://example.com/record', 'application/json')).toBe(false);
    expect(isWebPageMetadata('https://example.com/record', 'application/vnd.iso.19139+xml')).toBe(false);
    // A non-web application/* payload (e.g. a downloadable PDF) is not a browsable page.
    expect(isWebPageMetadata('https://example.com/record', 'application/pdf')).toBe(false);
  });

  it('falls back to the URL heuristic when the MIME is absent or unrecognised', () => {
    expect(isWebPageMetadata('https://example.com/metadata.xml')).toBe(false);
    expect(isWebPageMetadata('https://example.com/metadata')).toBe(true);
    // text/plain is neither a known web page nor a known machine type: defer to the URL.
    expect(isWebPageMetadata('https://example.com/metadata.xml', 'text/plain')).toBe(false);
    expect(isWebPageMetadata('https://example.com/metadata', 'text/plain')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildExternalGetFeatureInfoUrl
// ---------------------------------------------------------------------------

describe('buildExternalGetFeatureInfoUrl', () => {
  const baseArgs = {
    serverUrl: 'https://example.com/wms',
    layerName: 'my_layer',
    infoFormat: 'text/plain',
    lat: 50,
    lng: 10,
  };

  it('uses WMS 1.1.1 with SRS + X/Y params (no mapBounds)', () => {
    const url = buildExternalGetFeatureInfoUrl({ ...baseArgs });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('VERSION')).toBe('1.1.1');
    expect(params.get('SRS')).toBe('EPSG:4326');
    expect(params.has('X')).toBe(true);
    expect(params.has('Y')).toBe(true);
    expect(params.has('CRS')).toBe(false);
    expect(params.has('I')).toBe(false);
    expect(params.has('J')).toBe(false);
  });

  it('sets INFO_FORMAT', () => {
    const url = buildExternalGetFeatureInfoUrl({ ...baseArgs });
    expect(new URLSearchParams(url.split('?')[1]).get('INFO_FORMAT')).toBe('text/plain');
  });

  it('sets mandatory WMS params: SERVICE, VERSION, REQUEST, LAYERS, QUERY_LAYERS', () => {
    const url = buildExternalGetFeatureInfoUrl({ ...baseArgs });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('SERVICE')).toBe('WMS');
    expect(params.get('VERSION')).toBe('1.1.1');
    expect(params.get('REQUEST')).toBe('GetFeatureInfo');
    expect(params.get('LAYERS')).toBe('my_layer');
    expect(params.get('QUERY_LAYERS')).toBe('my_layer');
  });

  it('uses 1.1.1 lon/lat bbox order in BBOX param', () => {
    const url = buildExternalGetFeatureInfoUrl({ ...baseArgs });
    const params = new URLSearchParams(url.split('?')[1]);
    const bboxParts = params.get('BBOX')!.split(',').map(Number);
    // For 1.1.1: west,south,east,north — west < east, south < north
    const [west, south, east, north] = bboxParts;
    expect(west).toBeLessThan(east);
    expect(south).toBeLessThan(north);
    // Center should be around our lat/lng
    expect((west + east) / 2).toBeCloseTo(10, 0);
    expect((south + north) / 2).toBeCloseTo(50, 0);
  });

  it('uses mapBounds + width/height when provided and produces a smaller box', () => {
    const mapBounds = { south: 49, west: 9, north: 51, east: 11 };
    const url = buildExternalGetFeatureInfoUrl({
      ...baseArgs,
      mapBounds,
      width: 800,
      height: 600,
    });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('WIDTH')).toBe('9');
    expect(params.get('HEIGHT')).toBe('9');
  });

  it('strips request params from serverUrl before building the GFI URL', () => {
    const url = buildExternalGetFeatureInfoUrl({
      ...baseArgs,
      serverUrl: 'https://example.com/wms?SERVICE=WMS&REQUEST=GetCapabilities',
    });
    const parts = url.split('?');
    expect(parts[0]).toBe('https://example.com/wms');
  });
});

// ---------------------------------------------------------------------------
// getWmsAvailableDatesInMonth
// ---------------------------------------------------------------------------

describe('getWmsAvailableDatesInMonth', () => {
  it('returns an empty array when timeRanges is undefined', () => {
    expect(getWmsAvailableDatesInMonth(undefined, '2024-03-01', '2024-03-31')).toEqual([]);
  });

  it('returns an empty array when timeRanges is empty', () => {
    expect(getWmsAvailableDatesInMonth([], '2024-03-01', '2024-03-31')).toEqual([]);
  });

  it('returns daily dates for a P1D period across a full month', () => {
    const ranges = [{ start: '2024-03-01', end: '2024-03-31', period: 'P1D' }];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-03-01', '2024-03-31');
    expect(result).toHaveLength(31);
    result.forEach((d) => expect(d).toBeInstanceOf(Date));
  });

  it('returns one date per month for a P1M period', () => {
    const ranges = [{ start: '2024-01-15', end: '2024-12-15', period: 'P1M' }];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-03-01', '2024-03-31');
    expect(result).toHaveLength(1);
    expect(result[0].toISOString().slice(0, 10)).toBe('2024-03-15');
  });

  it('returns one date per year for a P1Y period when the anchor falls in the month', () => {
    const ranges = [{ start: '2020-06-01', end: '2025-06-01', period: 'P1Y' }];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-06-01', '2024-06-30');
    expect(result).toHaveLength(1);
    expect(result[0].toISOString().slice(0, 10)).toBe('2024-06-01');
  });

  it('returns no dates for a P1Y period when the anchor does not fall in the month', () => {
    const ranges = [{ start: '2020-06-01', end: '2025-06-01', period: 'P1Y' }];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-03-01', '2024-03-31');
    expect(result).toHaveLength(0);
  });

  it('returns correct dates for a P8D period, stepping from range start', () => {
    // P8D starting 2024-01-01 → 2024-01-01, 2024-01-09, 2024-01-17, 2024-01-25, 2024-02-02, ...
    // In March 2024: step 2024-01-01 + N*8 days to find those in [Mar 1 – Mar 31]
    const ranges = [{ start: '2024-01-01', end: '2024-12-31', period: 'P8D' }];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-03-01', '2024-03-31');
    // All dates must be in March 2024
    result.forEach((d) => {
      expect(d.getUTCFullYear()).toBe(2024);
      expect(d.getUTCMonth()).toBe(2); // month is 0-indexed
    });
    // Each consecutive pair must differ by 8 days
    for (let i = 1; i < result.length; i++) {
      const diffDays = (result[i].getTime() - result[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(8);
    }
  });

  it('handles a discrete (no period) time range', () => {
    const ranges = [
      { start: '2024-03-10', end: '2024-03-10' },
      { start: '2024-03-20', end: '2024-03-20' },
      { start: '2024-04-05', end: '2024-04-05' },
    ];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-03-01', '2024-03-31');
    expect(result).toHaveLength(2);
    expect(result[0].toISOString().slice(0, 10)).toBe('2024-03-10');
    expect(result[1].toISOString().slice(0, 10)).toBe('2024-03-20');
  });

  it('clamps dates to the month window (range extends beyond month)', () => {
    const ranges = [{ start: '2023-01-01', end: '2025-12-31', period: 'P1D' }];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-02-01', '2024-02-29');
    // Feb 2024 is a leap year: 29 days
    expect(result).toHaveLength(29);
    result.forEach((d) => {
      expect(d.getUTCFullYear()).toBe(2024);
      expect(d.getUTCMonth()).toBe(1); // February
    });
  });

  it('deduplicates dates when multiple ranges land on the same day', () => {
    const ranges = [
      { start: '2024-03-15', end: '2024-03-15' },
      { start: '2024-03-15', end: '2024-03-15' },
    ];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-03-01', '2024-03-31');
    expect(result).toHaveLength(1);
  });

  it('returns every day for a sub-daily period (PT1H)', () => {
    const ranges = [{ start: '2024-03-01', end: '2024-03-03', period: 'PT1H' }];
    const result = getWmsAvailableDatesInMonth(ranges, '2024-03-01', '2024-03-31');
    // Only 3 distinct days in the range, all in March
    expect(result).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// buildWmtsPreviewTileUrl
// ---------------------------------------------------------------------------

describe('buildWmtsPreviewTileUrl', () => {
  const template = 'https://tiles.example.com/wmts/{z}/{x}/{y}.png';

  it('substitutes z=0, x=0, y=0 when no bbox is provided (whole-world tile)', () => {
    const result = buildWmtsPreviewTileUrl(template);
    expect(result).toBe('https://tiles.example.com/wmts/0/0/0.png');
  });

  it('substitutes correct z/x/y for a global bbox', () => {
    const bbox = { south: -85, west: -180, north: 85, east: 180 };
    const result = buildWmtsPreviewTileUrl(template, bbox);
    // A global extent → z=0 (log2(360/360)=0)
    expect(result).toContain('/0/');
  });

  it('returns a URL with {z}, {x}, {y} fully substituted', () => {
    const bbox = { south: 45, west: 0, north: 55, east: 15 };
    const result = buildWmtsPreviewTileUrl(template, bbox);
    expect(result).not.toContain('{z}');
    expect(result).not.toContain('{x}');
    expect(result).not.toContain('{y}');
  });

  it('substitutes all occurrences when the template repeats a placeholder', () => {
    const multiTemplate = 'https://tiles.example.com/{z}/{z}/{x}/{y}';
    const result = buildWmtsPreviewTileUrl(multiTemplate);
    expect(result).toBe('https://tiles.example.com/0/0/0/0');
  });

  it('picks a higher zoom for a small regional bbox', () => {
    // A small span (e.g. 5 degrees) should yield z > 0
    const bbox = { south: 48, west: 10, north: 50, east: 15 };
    const result = buildWmtsPreviewTileUrl(template, bbox);
    const z = parseInt(result.split('/')[4], 10);
    expect(z).toBeGreaterThan(0);
  });

  it('caps zoom at 12', () => {
    // A 0.01-degree span would give log2(360/0.01) ≈ 15 → capped at 12
    const tinyBbox = { south: 50, west: 10, north: 50.01, east: 10.01 };
    const result = buildWmtsPreviewTileUrl(template, tinyBbox);
    const z = parseInt(result.split('/')[4], 10);
    expect(z).toBeLessThanOrEqual(12);
  });

  it('keeps x/y within the halved grid range for a 512px TileMatrixSet (regression for tile overshoot)', () => {
    // Same tiny bbox as the "caps zoom at 12" case, so z=12. A 512px TileMatrixSet has half as
    // many columns/rows as the standard 256px grid at the same TILEMATRIX (zoom) label.
    const tinyBbox = { south: 50, west: 10, north: 50.01, east: 10.01 };
    const result = buildWmtsPreviewTileUrl(template, tinyBbox, 512);
    const match = result.match(/\/(\d+)\/(\d+)\/(\d+)\.png$/);
    const [, z, x, y] = match!.map(Number);
    expect(z).toBe(12);
    const maxIndex = (2 ** z * 256) / 512 - 1; // 2047
    expect(x).toBeLessThanOrEqual(maxIndex);
    expect(y).toBeLessThanOrEqual(maxIndex);
  });

  it('defaults to the standard 256px grid when tileSize is omitted', () => {
    const bbox = { south: 50, west: 10, north: 50.01, east: 10.01 };
    expect(buildWmtsPreviewTileUrl(template, bbox)).toBe(buildWmtsPreviewTileUrl(template, bbox, 256));
  });
});

// ---------------------------------------------------------------------------
// fetchWmsCapabilities
// ---------------------------------------------------------------------------

const WMS_130_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0">
  <Service>
    <Title>My WMS Service</Title>
  </Service>
  <Capability>
    <Request>
      <GetMap>
        <Format>image/png</Format>
        <Format>image/jpeg</Format>
      </GetMap>
      <GetFeatureInfo>
        <Format>text/html</Format>
        <Format>application/geo+json</Format>
      </GetFeatureInfo>
    </Request>
    <Layer>
      <Layer queryable="1">
        <Name>my_layer</Name>
        <Title>My Layer</Title>
        <EX_GeographicBoundingBox>
          <westBoundLongitude>-10</westBoundLongitude>
          <eastBoundLongitude>30</eastBoundLongitude>
          <southBoundLatitude>35</southBoundLatitude>
          <northBoundLatitude>70</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <Dimension name="time" default="2024-06-01">2020-01-01/2024-06-01/P1M</Dimension>
      </Layer>
    </Layer>
  </Capability>
</WMS_Capabilities>`;

const WMS_111_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service>
    <Title>Legacy WMS</Title>
  </Service>
  <Capability>
    <Request>
      <GetMap>
        <Format>image/jpeg</Format>
      </GetMap>
    </Request>
    <Layer>
      <Layer>
        <Name>arcgis_layer_0</Name>
        <Title>ArcGIS Layer 0</Title>
        <LatLonBoundingBox minx="-180" miny="-90" maxx="180" maxy="90"/>
      </Layer>
      <Layer>
        <Name>1</Name>
        <Title>ArcGIS Layer 1</Title>
        <LatLonBoundingBox minx="-180" miny="-90" maxx="180" maxy="90"/>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// WMS 1.1.1 carries the time value in a sibling <Extent name="time">, NOT inside <Dimension>
// (which is just a declaration). Regression fixture for that form.
const WMS_111_TIME_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Temporal WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>modis</Name>
        <Title>MODIS</Title>
        <LatLonBoundingBox minx="-180" miny="-90" maxx="180" maxy="90"/>
        <Dimension name="time" units="ISO8601"/>
        <Extent name="time" default="2024-06-01">2020-01-01/2024-06-01/P1M</Extent>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// Service-level Abstract/AccessConstraints/Fees (WMS 1.1.1 form, no ows: prefix).
const WMS_SERVICE_METADATA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service>
    <Title>Metadata WMS</Title>
    <Abstract>A service abstract.</Abstract>
    <AccessConstraints>None</AccessConstraints>
    <Fees>none</Fees>
  </Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A layer with a single MetadataURL.
const WMS_LAYER_METADATA_URL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Metadata WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <MetadataURL type="ISO19115:2003">
          <Format>text/html</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/metadata1"/>
        </MetadataURL>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A layer with multiple MetadataURL entries (document order must be preserved).
const WMS_LAYER_MULTIPLE_METADATA_URLS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Metadata WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <MetadataURL type="ISO19115:2003">
          <Format>text/html</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/metadata1"/>
        </MetadataURL>
        <MetadataURL type="FGDC:1998">
          <Format>text/html</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/metadata2"/>
        </MetadataURL>
        <MetadataURL type="TC211">
          <Format>text/html</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/metadata3"/>
        </MetadataURL>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A layer mixing web-page and machine-readable MetadataURLs: the <Format> MIME decides, so only the
// text/html entry survives even though it has a query-heavy CSW href, while the application/xml entry
// with a clean-looking path is dropped.
const WMS_LAYER_MIXED_METADATA_URLS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Metadata WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <MetadataURL type="ISO19115:2003">
          <Format>application/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/catalogue/record/abc"/>
        </MetadataURL>
        <MetadataURL type="ISO19115:2003">
          <Format>text/html</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://csw.example.com/geonetwork/srv/csw?service=CSW&amp;request=GetRecordById&amp;id=abc"/>
        </MetadataURL>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A layer declaring its own Attribution, with no ancestor Attribution involved.
const WMS_LAYER_ATTRIBUTION_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Attribution WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <Attribution>
          <Title>Sole Provider</Title>
        </Attribution>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// Attribution inheritance: a middle group Layer declares Attribution; child_no_own has none of
// its own and must inherit it; child_own declares its own and must keep it instead.
const WMS_ATTRIBUTION_INHERITANCE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Attribution WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Attribution>
          <Title>Parent Provider</Title>
        </Attribution>
        <Layer>
          <Name>child_no_own</Name>
          <Title>Child Without Own Attribution</Title>
        </Layer>
        <Layer>
          <Name>child_own</Name>
          <Title>Child With Own Attribution</Title>
          <Attribution>
            <Title>Child Provider</Title>
          </Attribution>
        </Layer>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// Attribution/BoundingBox declared only on the un-named document-root <Layer> (no Name/Title of
// its own): a named child with none of its own must inherit both, since both are spec-inheritable
// from any ancestor <Layer>, including the root.
const WMS_ROOT_ATTRIBUTION_BBOX_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Root Attribution WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Attribution>
        <Title>Root Provider</Title>
      </Attribution>
      <LatLonBoundingBox minx="-10" miny="-20" maxx="30" maxy="40"/>
      <Layer>
        <Name>child</Name>
        <Title>Child</Title>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A layer advertising two <Style> entries: order must be preserved (first is the WMS default),
// each carries its own Title (underscore-cleaned) and LegendURL, and the layer-level legendUrl
// is the first declared style's legend.
const WMS_MULTIPLE_STYLES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Styled WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <Style>
          <Name>default_style</Name>
          <Title>Default_Style</Title>
          <LegendURL>
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/legend/default.png"/>
          </LegendURL>
        </Style>
        <Style>
          <Name>alt_style</Name>
          <Title>Alt_Style</Title>
          <LegendURL>
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/legend/alt.png"/>
          </LegendURL>
        </Style>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A layer advertising a single <Style>: populates both `styles` (one entry) and the layer-level
// `legendUrl`.
const WMS_SINGLE_STYLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Styled WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <Style>
          <Name>sole_style</Name>
          <Title>Sole_Style</Title>
          <LegendURL>
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/legend/sole.png"/>
          </LegendURL>
        </Style>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A layer with a named <Style> but no <LegendURL> at all.
const WMS_STYLE_NO_LEGEND_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Styled WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <Style>
          <Name>plain_style</Name>
          <Title>Plain_Style</Title>
        </Style>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// Backward-compatibility regression: the FIRST declared style has no LegendURL, but a LATER one
// does — layer.legendUrl must resolve to the later style's legend (the first-declared-with-a-legend
// rule), not stay empty just because the first style lacks one.
const WMS_STYLE_LEGEND_FALLBACK_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Styled WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <Style>
          <Name>no_legend_style</Name>
          <Title>No_Legend_Style</Title>
        </Style>
        <Style>
          <Name>has_legend_style</Name>
          <Title>Has_Legend_Style</Title>
          <LegendURL>
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/legend/second.png"/>
          </LegendURL>
        </Style>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A nameless <Style> (invalid per spec, but seen in the wild) declares a LegendURL; a later named
// style declares none. The nameless entry's legend is still used as the layer-level fallback, but
// the nameless entry itself is excluded from the selectable `styles` list (GetMap's STYLES param
// can only request a style by name).
const WMS_STYLE_NAMELESS_LEGEND_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Styled WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>
      <Layer>
        <Name>layer1</Name>
        <Title>Layer 1</Title>
        <Style>
          <LegendURL>
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://example.com/legend/nameless.png"/>
          </LegendURL>
        </Style>
        <Style>
          <Name>named_style</Name>
          <Title>Named_Style</Title>
        </Style>
      </Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

describe('fetchWmsCapabilities', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockFetch = (xml: string) => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(xml),
    } as unknown as Response);
  };

  it('parses a WMS 1.3.0 GetCapabilities response correctly', async () => {
    mockFetch(WMS_130_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    expect(result!.serviceTitle).toBe('My WMS Service');
    expect(result!.version).toBe('1.3.0');
    expect(result!.format).toBe('image/png');
    expect(result!.infoFormat).toBe('application/geo+json');
    expect(result!.layers).toHaveLength(1);
    const layer = result!.layers[0];
    expect(layer.name).toBe('my_layer');
    expect(layer.title).toBe('My Layer');
    expect(layer.queryable).toBe(true);
    expect(layer.bbox).toEqual({ west: -10, east: 30, south: 35, north: 70 });
    expect(layer.timeDimension).toBeDefined();
    expect(layer.timeStart).toBe('2020-01-01');
    expect(layer.timeEnd).toBe('2024-06-01');
    expect(layer.timeDefault).toBe('2024-06-01');
    // No Abstract/AccessConstraints/Fees/MetadataURL/Attribution in this fixture: no crash, no
    // empty-string leakage.
    expect(result!.serviceAbstract).toBeUndefined();
    expect(result!.accessConstraints).toBeUndefined();
    expect(result!.fees).toBeUndefined();
    expect(layer.metadataUrls).toBeUndefined();
    expect(layer.attribution).toBeUndefined();
  });

  it('parses a WMS 1.1.1 response with LatLonBoundingBox', async () => {
    mockFetch(WMS_111_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    expect(result!.version).toBe('1.1.1');
    expect(result!.format).toBe('image/jpeg');
    expect(result!.infoFormat).toBeUndefined();
    expect(result!.layers).toHaveLength(2);
    const [l0, l1] = result!.layers;
    expect(l0.name).toBe('arcgis_layer_0');
    expect(l0.bbox).toEqual({ west: -180, south: -90, east: 180, north: 90 });
    // ArcGIS-style numeric name "1" must survive (coerced to string)
    expect(l1.name).toBe('1');
    expect(l1.title).toBe('ArcGIS Layer 1');
    // No Abstract/AccessConstraints/Fees in this fixture's Service block.
    expect(result!.serviceAbstract).toBeUndefined();
    expect(result!.accessConstraints).toBeUndefined();
    expect(result!.fees).toBeUndefined();
  });

  it('parses service-level Abstract, AccessConstraints and Fees from a WMS Service block', async () => {
    mockFetch(WMS_SERVICE_METADATA_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    expect(result!.serviceAbstract).toBe('A service abstract.');
    expect(result!.accessConstraints).toBe('None');
    expect(result!.fees).toBe('none');
  });

  it('parses a single MetadataURL on a WMS layer into a one-element metadataUrls array', async () => {
    mockFetch(WMS_LAYER_METADATA_URL_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    expect(result!.layers[0].metadataUrls).toEqual(['https://example.com/metadata1']);
  });

  it('parses multiple MetadataURL elements on a WMS layer in document order', async () => {
    mockFetch(WMS_LAYER_MULTIPLE_METADATA_URLS_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    expect(result!.layers[0].metadataUrls).toEqual([
      'https://example.com/metadata1',
      'https://example.com/metadata2',
      'https://example.com/metadata3',
    ]);
  });

  it('drops machine-readable MetadataURLs by MIME, keeping only web-page links', async () => {
    mockFetch(WMS_LAYER_MIXED_METADATA_URLS_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    // The application/xml entry is dropped despite its clean path; the text/html entry is kept
    // despite its CSW query string, because the server-declared MIME is authoritative.
    expect(result!.layers[0].metadataUrls).toEqual([
      'https://csw.example.com/geonetwork/srv/csw?service=CSW&request=GetRecordById&id=abc',
    ]);
  });

  it('parses a WMS layer Attribution Title', async () => {
    mockFetch(WMS_LAYER_ATTRIBUTION_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    expect(result!.layers[0].attribution).toBe('Sole Provider');
  });

  it('inherits Attribution from an ancestor Layer when a layer declares none of its own', async () => {
    mockFetch(WMS_ATTRIBUTION_INHERITANCE_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const child = result!.layers.find((l) => l.name === 'child_no_own');
    expect(child?.attribution).toBe('Parent Provider');
  });

  it('keeps its own Attribution instead of an inherited one when a layer declares both', async () => {
    mockFetch(WMS_ATTRIBUTION_INHERITANCE_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const child = result!.layers.find((l) => l.name === 'child_own');
    expect(child?.attribution).toBe('Child Provider');
  });

  it('inherits Attribution and BoundingBox declared only on the document-root Layer', async () => {
    mockFetch(WMS_ROOT_ATTRIBUTION_BBOX_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const child = result!.layers.find((l) => l.name === 'child');
    expect(child?.attribution).toBe('Root Provider');
    expect(child?.bbox).toEqual({ west: -10, south: -20, east: 30, north: 40 });
  });

  it('parses the time dimension from a WMS 1.1.1 <Extent> (value not inside <Dimension>)', async () => {
    mockFetch(WMS_111_TIME_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.timeDimension).toBeDefined();
    expect(layer.timeStart).toBe('2020-01-01');
    expect(layer.timeEnd).toBe('2024-06-01');
    expect(layer.timeDefault).toBe('2024-06-01');
  });

  it('returns null when the response has no layers', async () => {
    const noLayersXml = `<?xml version="1.0"?>
<WMS_Capabilities version="1.3.0">
  <Service><Title>Empty</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer></Layer>
  </Capability>
</WMS_Capabilities>`;
    mockFetch(noLayersXml);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).toBeNull();
  });

  it('returns null when the response is not valid WMS XML', async () => {
    mockFetch('<html><body>Error 404</body></html>');
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).toBeNull();
  });

  it('throws an HttpError when the server returns a non-OK HTTP status', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
    } as unknown as Response);
    await expect(fetchWmsCapabilities('https://example.com/wms')).rejects.toMatchObject({
      name: 'HttpError',
      status: 403,
    });
  });

  it('strips WMS request params from the URL before fetching', async () => {
    mockFetch(WMS_130_XML);
    await fetchWmsCapabilities('https://example.com/wms?SERVICE=WMS&REQUEST=GetMap&token=abc');
    expect(global.fetch as jest.Mock).toHaveBeenCalledTimes(1);
    const calledUrl: string = ((global.fetch as jest.Mock).mock.calls[0] as unknown[])[0] as string;
    expect(calledUrl).toContain('token=abc');
    expect(calledUrl).not.toMatch(/SERVICE=WMS&REQUEST=GetMap/);
    expect(calledUrl).toContain('SERVICE=WMS&REQUEST=GetCapabilities');
  });

  it('parses multiple WMS Style entries in document order, each with its own title and legend', async () => {
    mockFetch(WMS_MULTIPLE_STYLES_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.styles).toEqual([
      { name: 'default_style', title: 'Default Style', legendUrl: 'https://example.com/legend/default.png' },
      { name: 'alt_style', title: 'Alt Style', legendUrl: 'https://example.com/legend/alt.png' },
    ]);
    // Layer-level legendUrl is the first declared style's legend (previous single-legend behaviour).
    expect(layer.legendUrl).toBe('https://example.com/legend/default.png');
  });

  it('parses a single WMS Style into a one-element styles array and the layer legendUrl', async () => {
    mockFetch(WMS_SINGLE_STYLE_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.styles).toEqual([
      { name: 'sole_style', title: 'Sole Style', legendUrl: 'https://example.com/legend/sole.png' },
    ]);
    expect(layer.legendUrl).toBe('https://example.com/legend/sole.png');
  });

  it('leaves styles and legendUrl undefined when the layer declares no Style at all', async () => {
    mockFetch(WMS_LAYER_ATTRIBUTION_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.styles).toBeUndefined();
    expect(layer.legendUrl).toBeUndefined();
  });

  it('parses a named Style with no LegendURL into styles without a legendUrl on the entry', async () => {
    mockFetch(WMS_STYLE_NO_LEGEND_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.styles).toEqual([{ name: 'plain_style', title: 'Plain Style' }]);
    expect(layer.legendUrl).toBeUndefined();
  });

  it('falls back to a later style for the layer legendUrl when the first style has none (backward compat)', async () => {
    mockFetch(WMS_STYLE_LEGEND_FALLBACK_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.styles).toEqual([
      { name: 'no_legend_style', title: 'No Legend Style' },
      {
        name: 'has_legend_style',
        title: 'Has Legend Style',
        legendUrl: 'https://example.com/legend/second.png',
      },
    ]);
    expect(layer.legendUrl).toBe('https://example.com/legend/second.png');
  });

  it("uses a nameless style's legend as the layer fallback but excludes it from the selectable styles list", async () => {
    mockFetch(WMS_STYLE_NAMELESS_LEGEND_XML);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    // GetMap's STYLES param can only request a named style, so the nameless entry is dropped here...
    expect(layer.styles).toEqual([{ name: 'named_style', title: 'Named Style' }]);
    // ...but its legend is still used as the layer-level fallback (preserves prior behaviour).
    expect(layer.legendUrl).toBe('https://example.com/legend/nameless.png');
  });

  // Regression for a large public WMS (e.g. wms.geo.admin.ch, ~1070 layers) failing to parse:
  // fast-xml-parser's default entity-expansion count limit is 1000. Only counted entity types
  // (`&lt;`/`&gt;`/`&apos;`/`&quot;`, DOCTYPE, HTML) increment that counter — `&amp;` is replaced
  // separately and never counted. A document with 1000+ layers each carrying one of the counted
  // entities (e.g. an `&apos;` in a title) used to throw "Entity expansion limit exceeded" and get
  // swallowed into a null result, so the fixture below uses `&apos;` to genuinely trip the counter
  // (and keeps an `&amp;` to assert entity decoding stays enabled).
  it('parses a WMS capabilities response with more than 1000 XML entities', async () => {
    const layerCount = 1001;
    const layers = Array.from(
      { length: layerCount },
      (_, i) => `
      <Layer>
        <Name>layer_${i}</Name>
        <Title>Layer &apos;${i}&apos;</Title>
        <Style>
          <LegendURL>
            <OnlineResource xlink:href="https://example.com/legend?layer=${i}&amp;format=png"/>
          </LegendURL>
        </Style>
      </Layer>`,
    ).join('');
    const largeXml = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Large WMS</Title></Service>
  <Capability>
    <Request><GetMap><Format>image/png</Format></GetMap></Request>
    <Layer>${layers}</Layer>
  </Capability>
</WMT_MS_Capabilities>`;

    mockFetch(largeXml);
    const result = await fetchWmsCapabilities('https://example.com/wms');
    expect(result).not.toBeNull();
    expect(result!.layers).toHaveLength(layerCount);
    // Entity processing must stay enabled: &amp; still decodes to a literal &.
    expect(result!.layers[0].legendUrl).toContain('&');
    expect(result!.layers[0].legendUrl).not.toContain('&amp;');
  });
});

// ---------------------------------------------------------------------------
// fetchWmtsCapabilities
// ---------------------------------------------------------------------------

const WMTS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>My WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>dem_layer</ows:Identifier>
      <ows:Title>DEM Layer</ows:Title>
      <ows:Abstract>Digital Elevation Model</ows:Abstract>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ResourceURL resourceType="tile" template="https://tiles.example.com/wmts/dem/{TileMatrix}/{TileRow}/{TileCol}.png" format="image/png"/>
      <ows:WGS84BoundingBox>
        <ows:LowerCorner>-20 30</ows:LowerCorner>
        <ows:UpperCorner>40 70</ows:UpperCorner>
      </ows:WGS84BoundingBox>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// Same as WMTS_XML, but the TileMatrixSet declares a <TileMatrix> with a non-standard 512px tile
// size (e.g. Planet's PopularWebMercator512) — regression fixture for the "TILECOL/TILEROW
// overshoot the server's valid range" bug: tileSize must be parsed from TileWidth/TileHeight.
const WMTS_512PX_TILEMATRIXSET_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>My WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>dem_layer</ows:Identifier>
      <ows:Title>DEM Layer</ows:Title>
      <ows:Abstract>Digital Elevation Model</ows:Abstract>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ResourceURL resourceType="tile" template="https://tiles.example.com/wmts/dem/{TileMatrix}/{TileRow}/{TileCol}.png" format="image/png"/>
      <ows:WGS84BoundingBox>
        <ows:LowerCorner>-20 30</ows:LowerCorner>
        <ows:UpperCorner>40 70</ows:UpperCorner>
      </ows:WGS84BoundingBox>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
      <TileMatrix>
        <ows:Identifier>0</ows:Identifier>
        <TileWidth>512</TileWidth>
        <TileHeight>512</TileHeight>
      </TileMatrix>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

const WMTS_NON_WEBMERCATOR_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>ETRS89 WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>etrs_layer</ows:Identifier>
      <ows:Title>ETRS Layer</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>ETRS89_LAEA</TileMatrixSet>
      </TileMatrixSetLink>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>ETRS89_LAEA</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG::3035</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// Service-level Abstract/AccessConstraints/Fees under ows:ServiceIdentification.
const WMTS_SERVICE_METADATA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>Metadata WMTS</ows:Title>
    <ows:Abstract>A WMTS service abstract.</ows:Abstract>
    <ows:AccessConstraints>none</ows:AccessConstraints>
    <ows:Fees>none</ows:Fees>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>layer1</ows:Identifier>
      <ows:Title>Layer 1</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// A layer with a single ows:Metadata link (flatter than WMS: href is a direct attribute, no
// nested OnlineResource).
const WMTS_LAYER_METADATA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>Metadata WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>layer1</ows:Identifier>
      <ows:Title>Layer 1</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ows:Metadata xlink:href="https://example.com/metadata1"/>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// A layer with multiple ows:Metadata links (document order must be preserved).
const WMTS_LAYER_MULTIPLE_METADATA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>Metadata WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>layer1</ows:Identifier>
      <ows:Title>Layer 1</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ows:Metadata xlink:href="https://example.com/metadata1"/>
      <ows:Metadata xlink:href="https://example.com/metadata2"/>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// A layer advertising a single non-default <Style> and a ResourceURL template with a {Style}
// placeholder — regression fixture for the "STYLE was hardcoded to 'default'" bug.
const WMTS_STYLE_RESOURCEURL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>Styled WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>styled_layer</ows:Identifier>
      <ows:Title>Styled Layer</ows:Title>
      <Format>image/png</Format>
      <Style>
        <ows:Identifier>SCAN1000</ows:Identifier>
      </Style>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ResourceURL resourceType="tile" template="https://tiles.example.com/wmts/{Style}/{TileMatrix}/{TileRow}/{TileCol}.png" format="image/png"/>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// A layer advertising a single non-default <Style> with no ResourceURL, exercising the KVP
// GetTile fallback's STYLE= param.
const WMTS_STYLE_KVP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>Styled KVP WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>styled_kvp_layer</ows:Identifier>
      <ows:Title>Styled KVP Layer</ows:Title>
      <Format>image/png</Format>
      <Style>
        <ows:Identifier>normal</ows:Identifier>
      </Style>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// A layer advertising two <Style> entries, with the default one flagged isDefault="true" and
// listed second — proves selection isn't just "take the first <Style> element".
const WMTS_STYLE_MULTIPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>Multi-style WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>multi_style_layer</ows:Identifier>
      <ows:Title>Multi Style Layer</ows:Title>
      <Format>image/png</Format>
      <Style>
        <ows:Identifier>alt</ows:Identifier>
      </Style>
      <Style isDefault="true">
        <ows:Identifier>SCAN1000</ows:Identifier>
      </Style>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ResourceURL resourceType="tile" template="https://tiles.example.com/wmts/{Style}/{TileMatrix}/{TileRow}/{TileCol}.png" format="image/png"/>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

// A layer with a {Style} ResourceURL template but no <Style> element at all — regression guard
// that the "no style advertised" case still falls back to the literal 'default'.
const WMTS_NO_STYLE_RESOURCEURL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>No Style WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>no_style_layer</ows:Identifier>
      <ows:Title>No Style Layer</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ResourceURL resourceType="tile" template="https://tiles.example.com/wmts/{Style}/{TileMatrix}/{TileRow}/{TileCol}.png" format="image/png"/>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

describe('fetchWmtsCapabilities', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockFetch = (xml: string) => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(xml),
    } as unknown as Response);
  };

  it('parses a WMTS response with a web-mercator TileMatrixSet and ResourceURL template', async () => {
    mockFetch(WMTS_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    expect(result!.serviceTitle).toBe('My WMTS');
    expect(result!.version).toBe('1.0.0');
    expect(result!.format).toBe('image/png');
    expect(result!.layers).toHaveLength(1);
    const layer = result!.layers[0];
    expect(layer.name).toBe('dem_layer');
    expect(layer.title).toBe('DEM Layer');
    expect(layer.abstract).toBe('Digital Elevation Model');
    // ResourceURL template: {TileMatrix}→{z}, {TileRow}→{y}, {TileCol}→{x}
    expect(layer.tileUrl).toContain('{z}');
    expect(layer.tileUrl).toContain('{y}');
    expect(layer.tileUrl).toContain('{x}');
    expect(layer.tileUrl).not.toContain('{TileMatrix}');
    expect(layer.tileUrl).not.toContain('{TileRow}');
    expect(layer.tileUrl).not.toContain('{TileCol}');
    // bbox from ows:WGS84BoundingBox (LowerCorner is "west south", UpperCorner is "east north")
    expect(layer.bbox).toEqual({ west: -20, south: 30, east: 40, north: 70 });
    // No ows:AccessConstraints/ows:Fees/ows:Metadata in this fixture: no crash, no empty-string
    // leakage.
    expect(result!.accessConstraints).toBeUndefined();
    expect(result!.fees).toBeUndefined();
    expect(layer.metadataUrls).toBeUndefined();
    // No <TileMatrix> under the TileMatrixSet in this fixture: tileSize is left undefined here,
    // but it's optionalTileSize() (externalWmsLeafletLayer.tsx) that omits the prop from Leaflet's
    // options so its 256px default actually applies — passing tileSize: undefined would shadow it.
    expect(layer.tileSize).toBeUndefined();
  });

  it('parses tileSize from TileWidth/TileHeight when the TileMatrixSet declares a non-standard 512px TileMatrix', async () => {
    mockFetch(WMTS_512PX_TILEMATRIXSET_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    expect(result!.layers[0].tileSize).toBe(512);
  });

  it('parses service-level Abstract, AccessConstraints and Fees from ows:ServiceIdentification', async () => {
    mockFetch(WMTS_SERVICE_METADATA_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    expect(result!.serviceAbstract).toBe('A WMTS service abstract.');
    expect(result!.accessConstraints).toBe('none');
    expect(result!.fees).toBe('none');
  });

  it('parses a single ows:Metadata link on a WMTS layer into a one-element metadataUrls array', async () => {
    mockFetch(WMTS_LAYER_METADATA_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    expect(result!.layers[0].metadataUrls).toEqual(['https://example.com/metadata1']);
  });

  it('parses multiple ows:Metadata links on a WMTS layer in document order', async () => {
    mockFetch(WMTS_LAYER_MULTIPLE_METADATA_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    expect(result!.layers[0].metadataUrls).toEqual([
      'https://example.com/metadata1',
      'https://example.com/metadata2',
    ]);
  });

  it('returns null when the only TileMatrixSet is not web-mercator', async () => {
    mockFetch(WMTS_NON_WEBMERCATOR_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).toBeNull();
  });

  it('returns null when the server returns a non-OK HTTP status', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    } as unknown as Response);
    await expect(fetchWmtsCapabilities('https://example.com/wmts')).rejects.toMatchObject({
      name: 'HttpError',
      status: 500,
    });
  });

  it('falls back to KVP GetTile URL when no ResourceURL is present', async () => {
    const kvpXml = `<?xml version="1.0"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>KVP WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>kvp_layer</ows:Identifier>
      <ows:Title>KVP Layer</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;
    mockFetch(kvpXml);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.tileUrl).toContain('SERVICE=WMTS');
    expect(layer.tileUrl).toContain('REQUEST=GetTile');
    expect(layer.tileUrl).toContain('{z}');
    expect(layer.tileUrl).toContain('{y}');
    expect(layer.tileUrl).toContain('{x}');
  });

  it('substitutes the layer-advertised non-default style into a {Style} ResourceURL template', async () => {
    mockFetch(WMTS_STYLE_RESOURCEURL_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.tileUrl).toContain('SCAN1000');
    expect(layer.tileUrl).not.toContain('/default/');
  });

  it('uses the layer-advertised non-default style in the KVP GetTile STYLE param', async () => {
    mockFetch(WMTS_STYLE_KVP_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.tileUrl).toContain('STYLE=normal');
    expect(layer.tileUrl).not.toContain('STYLE=default');
  });

  it('picks the <Style> flagged isDefault="true" over the first listed style', async () => {
    mockFetch(WMTS_STYLE_MULTIPLE_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.tileUrl).toContain('SCAN1000');
    expect(layer.tileUrl).not.toContain('/alt/');
    expect(layer.tileUrl).not.toContain('/default/');
  });

  it('falls back to "default" for a {Style} ResourceURL template when the layer advertises no <Style> (regression guard)', async () => {
    mockFetch(WMTS_NO_STYLE_RESOURCEURL_XML);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.tileUrl).toContain('/default/');
  });

  it('falls back to STYLE=default in the KVP GetTile URL when the layer advertises no <Style> (regression guard)', async () => {
    const kvpNoStyleXml = `<?xml version="1.0"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>KVP No Style WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>
    <Layer>
      <ows:Identifier>kvp_no_style_layer</ows:Identifier>
      <ows:Title>KVP No Style Layer</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
    </Layer>
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;
    mockFetch(kvpNoStyleXml);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    const layer = result!.layers[0];
    expect(layer.tileUrl).toContain('STYLE=default');
  });

  it('returns null when the response XML has no usable layers', async () => {
    const emptyXml = `<?xml version="1.0"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification><ows:Title>Empty</ows:Title></ows:ServiceIdentification>
  <Contents></Contents>
</Capabilities>`;
    mockFetch(emptyXml);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).toBeNull();
  });

  // Regression counterpart to the WMS case above: a large WMTS capabilities document with 1000+
  // counted XML entities (an `&apos;` in each layer title) must still parse instead of throwing.
  // As above, `&amp;` is not counted, so the title uses `&apos;` to trip the counter and the legend
  // URL keeps an `&amp;` to assert entity decoding stays enabled.
  it('parses a WMTS capabilities response with more than 1000 XML entities', async () => {
    const layerCount = 1001;
    const layers = Array.from(
      { length: layerCount },
      (_, i) => `
    <Layer>
      <ows:Identifier>layer_${i}</ows:Identifier>
      <ows:Title>Layer &apos;${i}&apos;</ows:Title>
      <Format>image/png</Format>
      <TileMatrixSetLink>
        <TileMatrixSet>GoogleMapsCompatible</TileMatrixSet>
      </TileMatrixSetLink>
      <ResourceURL resourceType="tile" template="https://tiles.example.com/wmts/${i}/{TileMatrix}/{TileRow}/{TileCol}.png" format="image/png"/>
      <Style>
        <LegendURL xlink:href="https://example.com/legend?layer=${i}&amp;format=png"/>
      </Style>
    </Layer>`,
    ).join('');
    const largeXml = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities version="1.0.0">
  <ows:ServiceIdentification>
    <ows:Title>Large WMTS</ows:Title>
  </ows:ServiceIdentification>
  <Contents>${layers}
    <TileMatrixSet>
      <ows:Identifier>GoogleMapsCompatible</ows:Identifier>
      <ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
    </TileMatrixSet>
  </Contents>
</Capabilities>`;

    mockFetch(largeXml);
    const result = await fetchWmtsCapabilities('https://example.com/wmts');
    expect(result).not.toBeNull();
    expect(result!.layers).toHaveLength(layerCount);
    // Entity processing must stay enabled: &amp; still decodes to a literal &.
    expect(result!.layers[0].legendUrl).toContain('&');
    expect(result!.layers[0].legendUrl).not.toContain('&amp;');
  });
});
