import { createAddProductToWorkspacePayload } from './workspace';

describe('include thumbnail link in workspace metadata', () => {
  const product = {
    id: '6a450b-YOUR-INSTANCEID-HERE',
    name: 'S2A_MSIL1C_20230815T095031_N0509_R079_T33TWM_20230815T133204.SAFE',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [14.9997416126753, 46.0195192231472],
          [14.9997418700468, 45.9655511485164],
          [16.4166561016066, 45.9567698590758],
          [16.4425080979455, 46.9446214414028],
          [15.3293248279571, 46.9516331696054],
          [15.2782758303862, 46.8085919663381],
          [15.2260618464822, 46.6619979568123],
          [15.176093654611, 46.5148213752761],
          [15.1220898308278, 46.368759788407],
          [15.0708277566774, 46.2220370104089],
          [15.019586326821, 46.0754013286324],
          [14.9997416126753, 46.0195192231472],
        ],
      ],
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
    },
    sensingTime: '2023-08-15T09:50:31.024Z',
    platformShortName: 'SENTINEL-2',
    instrumentShortName: 'MSI',
    productType: 'S2MSI1C',
    size: '753MB',
    originDate: '2023-08-15T16:55:41.269Z',
    publicationDate: '2023-08-15T17:19:48.381Z',
    modificationDate: '2023-08-15T17:20:05.531Z',
    online: true,
    S3Path:
      '/eodata/Sentinel-2/MSI/L1C/2023/08/15/S2A_MSIL1C_20230815T095031_N0509_R079_T33TWM_20230815T133204.SAFE',
    attributes: [
      { '@odata.type': '#OData.CSC.StringAttribute', Name: 'origin', Value: 'ESA', ValueType: 'String' },
      { '@odata.type': '#OData.CSC.StringAttribute', Name: 'tileId', Value: '33TWM', ValueType: 'String' },
      {
        '@odata.type': '#OData.CSC.DoubleAttribute',
        Name: 'cloudCover',
        Value: 0.0429020687437832,
        ValueType: 'Double',
      },
      {
        '@odata.type': '#OData.CSC.IntegerAttribute',
        Name: 'orbitNumber',
        Value: 42547,
        ValueType: 'Integer',
      },
      {
        '@odata.type': '#OData.CSC.DateTimeOffsetAttribute',
        Name: 'processingDate',
        Value: '2023-08-15T13:32:04Z',
        ValueType: 'DateTimeOffset',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'productGroupId',
        Value: 'GS2A_20230815T095031_042547_N05.09',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'operationalMode',
        Value: 'INS-NOBS',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'processingLevel',
        Value: 'S2MSI1C',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'processorVersion',
        Value: '05.09',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'platformShortName',
        Value: 'SENTINEL-2',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'instrumentShortName',
        Value: 'MSI',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.IntegerAttribute',
        Name: 'relativeOrbitNumber',
        Value: 79,
        ValueType: 'Integer',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'platformSerialIdentifier',
        Value: 'A',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.StringAttribute',
        Name: 'productType',
        Value: 'S2MSI1C',
        ValueType: 'String',
      },
      {
        '@odata.type': '#OData.CSC.DateTimeOffsetAttribute',
        Name: 'beginningDateTime',
        Value: '2023-08-15T09:50:31.024Z',
        ValueType: 'DateTimeOffset',
      },
      {
        '@odata.type': '#OData.CSC.DateTimeOffsetAttribute',
        Name: 'endingDateTime',
        Value: '2023-08-15T09:50:31.024Z',
        ValueType: 'DateTimeOffset',
      },
    ],
    contentLength: 789675090,
  };
  const previewUrl =
    'https://catalogue.dataspace.copernicus.eu/odata/v1/Assets(ad7576-YOUR-INSTANCEID-HERE)/$value';

  test.each([
    [{ ...product, previewUrl: previewUrl }, previewUrl],
    [product, undefined],
    [{ ...product, previewUrl: undefined }, undefined],
    [{ ...product, previewUrl: null }, undefined],
    [{ ...product, previewUrl: '' }, undefined],
  ])('add thumbnailDownloadLink', (product, expected) => {
    const payload = createAddProductToWorkspacePayload(product);
    expect(payload).toBeDefined();
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBe(1);
    expect(payload[0].thumbnailDownloadLink).toBe(expected);
  });
});
