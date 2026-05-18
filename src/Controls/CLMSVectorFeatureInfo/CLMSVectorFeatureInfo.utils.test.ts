import { parseGmlResponse, GFI_IMAGE_SIZE } from './CLMSVectorFeatureInfo.utils';
import { CLMSVectorDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/CLMSVectorDataSourceHandler';
import { COPERNICUS_CLMS_UA_LCU_2021_VECTOR } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

const LAT = 50.8;
const LNG = 4.5;

const EXAMPLE_GML = `<?xml version="1.0" encoding="UTF-8"?>
<msGMLOutput
   xmlns:gml="http://www.opengis.net/gml"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <UA_LCU_2021_VECTOR_layer>
    <gml:name>Urban Atlas Land Cover Land Use 2021 (Vector)</gml:name>
    <UA_LCU_2021_VECTOR_feature>
      <gml:boundedBy>
        <gml:Box srsName="EPSG:4326">
          <gml:coordinates>4.359349,50.863128 4.360996,50.865113</gml:coordinates>
        </gml:Box>
      </gml:boundedBy>
      <country>BE</country>
      <fua_name>Bruxelles/Brussel/Leuven</fua_name>
      <fua_code>BE001L3</fua_code>
      <code_2021>014110</code_2021>
      <class_2021>Green urban areas (Public access)</class_2021>
      <prod_date>2025-09</prod_date>
      <identifier>69963-BE001L3</identifier>
      <perimeter>535.417587509516</perimeter>
      <area>12327.8010093391</area>
      <comment></comment>
    </UA_LCU_2021_VECTOR_feature>
  </UA_LCU_2021_VECTOR_layer>
</msGMLOutput>`;

const EMPTY_GML = `<?xml version="1.0" encoding="UTF-8"?>
<msGMLOutput
   xmlns:gml="http://www.opengis.net/gml"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <UA_LCU_2021_VECTOR_layer>
    <gml:name>Urban Atlas Land Cover Land Use 2021 (Vector)</gml:name>
  </UA_LCU_2021_VECTOR_layer>
</msGMLOutput>`;

// ─── parseGmlResponse ────────────────────────────────────────────────────────

describe('parseGmlResponse', () => {
  it('returns attributes from a valid GML response', () => {
    const result = parseGmlResponse(EXAMPLE_GML);
    expect(result).not.toBeNull();
    expect(result!.country).toBe('BE');
    expect(result!.fua_name).toBe('Bruxelles/Brussel/Leuven');
    expect(result!.class_2021).toBe('Green urban areas (Public access)');
    expect(result!.code_2021).toBe('014110');
  });

  it('strips gml namespace fields from the result', () => {
    const result = parseGmlResponse(EXAMPLE_GML);
    expect(result).not.toHaveProperty('gml:boundedBy');
    expect(result).not.toHaveProperty('gml:name');
  });

  it('returns null when no feature is present (click on empty area)', () => {
    const result = parseGmlResponse(EMPTY_GML);
    expect(result).toBeNull();
  });

  it('returns null for malformed / non-GML response', () => {
    const result = parseGmlResponse(
      '<ServiceExceptionReport><ServiceException>Error</ServiceException></ServiceExceptionReport>',
    );
    expect(result).toBeNull();
  });
});

// ─── buildGetFeatureInfoUrl ──────────────────────────────────────────────────

describe('buildGetFeatureInfoUrl', () => {
  let handler: CLMSVectorDataSourceHandler;

  beforeEach(() => {
    handler = new CLMSVectorDataSourceHandler();
  });

  const getParams = (lat: number, lng: number) => {
    const url = handler.buildGetFeatureInfoUrl(COPERNICUS_CLMS_UA_LCU_2021_VECTOR, lat, lng);
    return new URLSearchParams(url.split('?')[1]);
  };

  it('uses GFI_IMAGE_SIZE for WIDTH and HEIGHT', () => {
    const params = getParams(LAT, LNG);
    expect(params.get('WIDTH')).toBe(String(GFI_IMAGE_SIZE));
    expect(params.get('HEIGHT')).toBe(String(GFI_IMAGE_SIZE));
  });

  it('always places click point at centre pixel (256, 256)', () => {
    const params = getParams(LAT, LNG);
    expect(params.get('X')).toBe('256');
    expect(params.get('Y')).toBe('256');
  });

  it('centers BBOX on click point', () => {
    const params = getParams(LAT, LNG);
    const [west, south, east, north] = params.get('BBOX')!.split(',').map(Number);
    const centerLng = (west + east) / 2;
    const centerLat = (south + north) / 2;
    expect(centerLng).toBeCloseTo(LNG, 5);
    expect(centerLat).toBeCloseTo(LAT, 5);
  });

  it('always produces a resolution well below the vector zoom threshold (fixed 1 m bbox)', () => {
    const params = getParams(LAT, LNG);
    const [west, , east] = params.get('BBOX')!.split(',').map(Number);
    const bboxWidthMeters = (east - west) * 111320 * Math.cos((LAT * Math.PI) / 180);
    const mpp = bboxWidthMeters / GFI_IMAGE_SIZE;
    // 1 m / 512 px ≈ 0.002 m/px — far below the 39.7 m/px vector threshold
    expect(mpp).toBeLessThan(1);
  });

  it('includes the correct layer name for the dataset', () => {
    const params = getParams(LAT, LNG);
    expect(params.get('LAYERS')).toBe('CLMS_UA_LCU_S2021_V025ha');
    expect(params.get('QUERY_LAYERS')).toBe('CLMS_UA_LCU_S2021_V025ha');
  });

  it('sets mandatory WMS parameters', () => {
    const params = getParams(LAT, LNG);
    expect(params.get('SERVICE')).toBe('WMS');
    expect(params.get('VERSION')).toBe('1.1.1');
    expect(params.get('REQUEST')).toBe('GetFeatureInfo');
    expect(params.get('SRS')).toBe('EPSG:4326');
    expect(params.get('INFO_FORMAT')).toBe('application/vnd.ogc.gml');
  });
});
