import { isProductInConfig, hasDownloadAccessForConfig, shouldShowAccessError } from './ProductInfo.utils';
import { CCM_PRODUCT_TYPE_ACCESS_RIGHTS } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';
import { LANDSAT_ACCESS_RIGHTS } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/landsatAccessRightsConfig';
import { MODIS_ACCESS_RIGHTS } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/modisAccessRightsConfig';

const userTokenWithProperAccessRole =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYVUh3VWZKaHVDVWo0X3k4ZF8xM0hxWXBYMFdwdDd2anhob2FPLUxzREZFIn0.eyJleHAiOjE3NzM4NDk4NzIsImlhdCI6MTc3Mzg0ODA3MiwiYXV0aF90aW1lIjoxNzczODQ4MDcyLCJqdGkiOiJvbnJ0YWM6NWVjNzE1MzYtYzEyMS1jMzcwLTEwZDgtMjNlNWU0YmM4YjBjIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5kYXRhc3BhY2UuY29wZXJuaWN1cy5ldS9hdXRoL3JlYWxtcy9DRFNFIiwiYXVkIjpbIkNMT1VERkVSUk9fUFVCTElDIiwiYWNjb3VudCJdLCJzdWIiOiJjMDUzNjBkOC1mMGQ0LTRkOTItYWFkYS05OGI2YzdlNTBkZjUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaC1kMzFhOGQ5Ni1hYjI4LTQyNDktYTIzYS1hYTRmNzU0NzU5MTYiLCJzaWQiOiJjYmEzZmI5Yi1mNjE2LWEyM2YtZWRlMS0wM2E1NWQ2NTc0ODUiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9kZXZleHQtZmUuc2luZXJnaXNlLmNvbSIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImh0dHBzOi8vd2ViZGV2MS5zaW5lcmdpc2UuY29tIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJzMi1leHBlcnQiLCJzMS1leHBlcnQiLCJsYW5kc2F0LWFjY2VzcyIsInM1cC1leHBlcnQiLCJjb3Blcm5pY3VzLXNlcnZpY2VzLWNjbSIsInMxYy1jb21taXNzaW9uaW5nIiwiY29wZXJuaWN1cy1jb2xsYWJvcmF0aXZlLXF1b3RhIiwiczMtZXhwZXJ0IiwibW9kaXMtYWNjZXNzIiwiczJjLWNvbW1pc3Npb25pbmciLCJjb3Blcm5pY3VzLWdlbmVyYWwtcXVvdGEiLCJvZmZsaW5lX2FjY2VzcyIsImNvcGVybmljdXMtb3BlcmF0b3JzLWNjbSIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1jZGFzIiwiY29wZXJuaWN1cy1nZW5lcmFsIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgQVVESUVOQ0VfUFVCTElDIGVtYWlsIHByb2ZpbGUgdXNlci1jb250ZXh0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInppcF9tYXhfc2VzcyI6MjAsImNvbnRleHRfZ3JvdXBzIjpbIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19nZW5lcmFsLyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19vcGVyYXRvcnNfY2NtLyIsIi9vcmdhbml6YXRpb25zL2FjYy1hZjVmMWEwOC1hN2MzLTQ4YjAtODFjZi02NjJiNDc3ZThlMDMvcmVndWxhcl91c2VyLyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczFfZXhwZXJ0LyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczJfZXhwZXJ0LyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczJjLWNvbW1pc3Npb25pbmcvIiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zMmNfY29tbWlzc2lvbmluZy8iLCIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L3MzX2V4cGVydC8iLCIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L3M1cF9leHBlcnQvIl0sInByZWZlcnJlZF91c2VybmFtZSI6ImNkYXNfYnJvd3NlckBzZW50aW5lbC1odWIuY29tIiwiZ2l2ZW5fbmFtZSI6IkZFLVRlYW0iLCJncm91cF9tZW1iZXJzaGlwIjpbIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19nZW5lcmFsIiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9jb3Blcm5pY3VzX29wZXJhdG9yc19jY20iLCIvb3JnYW5pemF0aW9ucy9hY2MtYWY1ZjFhMDgtYTdjMy00OGIwLTgxY2YtNjYyYjQ3N2U4ZTAzL3JlZ3VsYXJfdXNlciIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczFfZXhwZXJ0IiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zMl9leHBlcnQiLCIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L3MyYy1jb21taXNzaW9uaW5nIiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zMmNfY29tbWlzc2lvbmluZyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczNfZXhwZXJ0IiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zNXBfZXhwZXJ0Il0sIm5hbWUiOiJGRS1UZWFtIFRlc3QgQWNjb3VudCIsIm9yZ2FuaXphdGlvbnMiOlsiYWNjLWFmNWYxYTA4LWE3YzMtNDhiMC04MWNmLTY2MmI0NzdlOGUwMyJdLCJ1c2VyX2NvbnRleHRfaWQiOiJhZjVmMWEwOC1hN2MzLTQ4YjAtODFjZi02NjJiNDc3ZThlMDMiLCJjb250ZXh0X3JvbGVzIjp7fSwiZmFtaWx5X25hbWUiOiJUZXN0IEFjY291bnQiLCJ1c2VyX2NvbnRleHQiOiJhY2MtYWY1ZjFhMDgtYTdjMy00OGIwLTgxY2YtNjYyYjQ3N2U4ZTAzIiwiZW1haWwiOiJjZGFzX2Jyb3dzZXJAc2VudGluZWwtaHViLmNvbSJ9.luTzH4VyNe5UTZhhCeJnD7xbLMmbLimQXWXsiGefesYmbGODPfyopQKAz5ytaFlgohOnUt5f3dbE4aS-PRqvgD5lpUwBHwrK3weA3YhNzBJanW0C7XEDpXCXJUXeRlG3LGInVAUDGI_GXELfGCSYjConIpQLkNU38NSxIjeJEUPhGt9_TbONdyqbPppOwbbhaFj83if7gzpjm6lDx1EWPjf38xzPekXglQnBYNNX5FUCXVOY0uuU0KLbGaOqDX7vx_CmuxBQN315He8GLxrktzaYSjNR6Z2OGjEip-kn7ToOr2U3PbKpVrI0FgPc7-MJ0UA4Z4l3NnayyuFfObTrKQ';

const userTokenWithOutProperAccessRole =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYVUh3VWZKaHVDVWo0X3k4ZF8xM0hxWXBYMFdwdDd2anhob2FPLUxzREZFIn0.eyJleHAiOjE3MTIyNDg5NTAsImlhdCI6MTcxMjI0ODA1MCwiYXV0aF90aW1lIjoxNzEyMjM5NTA0LCJqdGkiOiIwZDNlMGFjOC00YjM4LTQ5ZmUtYjhhYy04NTM2M2VjNmEzZmIiLCJpc3MiOiJodHRwczovL2lkZW50aXR5LmRhdGFzcGFjZS5jb3Blcm5pY3VzLmV1L2F1dGgvcmVhbG1zL0NEU0UiLCJhdWQiOlsiQ0xPVURGRVJST19QVUJMSUMiLCJhY2NvdW50Il0sInN1YiI6IjdjNGU3NDZkLTE1OWUtNDIyZi05OTQ4LWViYjQ0NzhjZTA0MiIsInR5cCI6IkJlYXJlciIsImF6cCI6InNoLWQzMWE4ZDk2LWFiMjgtNDI0OS1hMjNhLWFhNGY3NTQ3NTkxNiIsIm5vbmNlIjoiNTk3Nzk3MDg4NDA4OTI3MyIsInNlc3Npb25fc3RhdGUiOiIzOTU5ZmY5My03YTM1LTQ0M2EtOGM3Yy0wMDRhMzdlNTk4YjQiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtY2RhcyIsImNvcGVybmljdXMtZ2VuZXJhbCJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiQVVESUVOQ0VfUFVCTElDIGVtYWlsIHByb2ZpbGUgdXNlci1jb250ZXh0Iiwic2lkIjoiMzk1OWZmOTMtN2EzNS00NDNhLThjN2MtMDA0YTM3ZTU5OGI0IiwiZ3JvdXBfbWVtYmVyc2hpcCI6WyIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L2NvcGVybmljdXNfZ2VuZXJhbCIsIi9vcmdhbml6YXRpb25zL2FjYy03YTJlNmQzZS04YjI2LTRiZmMtODg5OC1lYjUzNGY3NjA3OTYvcmVndWxhcl91c2VyIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJvcmdhbml6YXRpb25zIjpbImFjYy03YTJlNmQzZS04YjI2LTRiZmMtODg5OC1lYjUzNGY3NjA3OTYiXSwibmFtZSI6IlN0ZWxpb3MtRXJ2aXMgUHJpZnRpcyIsInVzZXJfY29udGV4dF9pZCI6IjdhMmU2ZDNlLThiMjYtNGJmYy04ODk4LWViNTM0Zjc2MDc5NiIsImNvbnRleHRfcm9sZXMiOnt9LCJjb250ZXh0X2dyb3VwcyI6WyIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L2NvcGVybmljdXNfZ2VuZXJhbC8iLCIvb3JnYW5pemF0aW9ucy9hY2MtN2EyZTZkM2UtOGIyNi00YmZjLTg4OTgtZWI1MzRmNzYwNzk2L3JlZ3VsYXJfdXNlci8iXSwicHJlZmVycmVkX3VzZXJuYW1lIjoic3RlbGlvcy5wcmlmdGlzQHNpbmVyZ2lzZS5jb20iLCJnaXZlbl9uYW1lIjoiU3RlbGlvcy1FcnZpcyIsInVzZXJfY29udGV4dCI6ImFjYy03YTJlNmQzZS04YjI2LTRiZmMtODg5OC1lYjUzNGY3NjA3OTYiLCJmYW1pbHlfbmFtZSI6IlByaWZ0aXMiLCJlbWFpbCI6InN0ZWxpb3MucHJpZnRpc0BzaW5lcmdpc2UuY29tIn0.GC_CxDLeguOtZRhKTWfVl-PoxbQS35DZSUKslaAIb3MVr5KV1f2HeGaw_HnGATiFAQvLBzch_bAiTut0yOZUL1Rtrhft39LQrkQIvCXRM3E0GR8P9qKMvPtTm7F9NlPtYmkCkDJ_h9xQEzVfs2SIWxdwz7uDiLLwsKTVkUEP9GzpHJaTT6BuFxMWkl_BemWPZY_QZ6GqRddFc72yZJ2JFj8VlqXv61QdK-ezCg5hU_WyfbzQhI6o3ROLJZ_T-GLyGfWyqHVYp9e7VVqRgGM2WRd089aNPc5AMoDQD26OJFRusQcL2GoC_TpXzCioCJd_Pcd2ZZj3S-ak4KM0IW4ZIA';

describe('test functions responsible for validating CCM access', () => {
  const CCMProductType1 = { productType: 'OPT_MS4_1C_B34B' };
  const CCMProductType2 = { productType: 'PHR_MS___3_54FA' };
  const NonCCMProductType1 = { productType: 'S2MSI2A' };
  const NonCCMProductType2 = { productType: 'L2__NO2___' };

  test('isProductInConfig', () => {
    expect(isProductInConfig(CCMProductType1, CCM_PRODUCT_TYPE_ACCESS_RIGHTS, 'productType')).toBeTruthy();
    expect(isProductInConfig(CCMProductType2, CCM_PRODUCT_TYPE_ACCESS_RIGHTS, 'productType')).toBeTruthy();
    expect(isProductInConfig(NonCCMProductType1, CCM_PRODUCT_TYPE_ACCESS_RIGHTS, 'productType')).toBeFalsy();
    expect(isProductInConfig(NonCCMProductType2, CCM_PRODUCT_TYPE_ACCESS_RIGHTS, 'productType')).toBeFalsy();
  });

  test.each([
    [CCMProductType1.productType],
    [CCMProductType2.productType],
    ['GIS_PM4_SO_71F4'],
    ['AIS_MSP_1R_E1F0'],
    ['HRS_MS4_1C_E1F0'],
    ['HRG_THX__3_56FB'],
    ['OPT_MS4_1B_07B6'],
    ['MSI_IMG_3A_56FB'],
    ['A3D_DEM_18_7854'],
    ['WV1_PM8_SO_5558'],
    ['SAR_DGE_30_A4AD'],
    ['HRG_J____3_57BB'],
    ['HIR_I____3_7BC7'],
  ])('hasDownloadAccessForConfig %p', (productType) => {
    expect(
      hasDownloadAccessForConfig(
        userTokenWithProperAccessRole,
        { productType },
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeTruthy();
    expect(
      hasDownloadAccessForConfig(
        userTokenWithOutProperAccessRole,
        { productType },
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeFalsy();
  });

  test.each([[NonCCMProductType1.productType], [NonCCMProductType2.productType]])(
    'hasDownloadAccessForConfig %p',
    (productType) => {
      expect(
        hasDownloadAccessForConfig(
          userTokenWithProperAccessRole,
          { productType },
          CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
          'productType',
        ),
      ).toBeFalsy();
      expect(
        hasDownloadAccessForConfig(
          userTokenWithOutProperAccessRole,
          { productType },
          CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
          'productType',
        ),
      ).toBeFalsy();
    },
  );

  test('shouldShowAccessError', () => {
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        CCMProductType1,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeFalsy();
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        CCMProductType2,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeFalsy();
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        NonCCMProductType1,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeFalsy();
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        NonCCMProductType2,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeFalsy();

    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        CCMProductType1,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeTruthy();
    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        CCMProductType2,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeTruthy();
    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        NonCCMProductType1,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeFalsy();
    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        NonCCMProductType2,
        CCM_PRODUCT_TYPE_ACCESS_RIGHTS,
        'productType',
      ),
    ).toBeFalsy();
  });
});

describe('test functions responsible for validating Landsat access', () => {
  const landsatProduct1 = { platformShortName: 'Landsat-8' };
  const landsatProduct2 = { platformShortName: 'Landsat-9' };
  const nonLandsatProduct = { platformShortName: 'Sentinel-2' };

  test('isProductInConfig', () => {
    expect(isProductInConfig(landsatProduct1, LANDSAT_ACCESS_RIGHTS, 'platformShortName')).toBeTruthy();
    expect(isProductInConfig(landsatProduct2, LANDSAT_ACCESS_RIGHTS, 'platformShortName')).toBeTruthy();
    expect(isProductInConfig(nonLandsatProduct, LANDSAT_ACCESS_RIGHTS, 'platformShortName')).toBeFalsy();
  });

  test.each([['Landsat-8'], ['Landsat-9']])('hasDownloadAccessForConfig %p', (platformShortName) => {
    expect(
      hasDownloadAccessForConfig(
        userTokenWithProperAccessRole,
        { platformShortName },
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeTruthy();
    expect(
      hasDownloadAccessForConfig(
        userTokenWithOutProperAccessRole,
        { platformShortName },
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeFalsy();
  });

  test('shouldShowAccessError', () => {
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        landsatProduct1,
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeFalsy();
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        landsatProduct2,
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeFalsy();
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        nonLandsatProduct,
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeFalsy();

    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        landsatProduct1,
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeTruthy();
    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        landsatProduct2,
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeTruthy();
    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        nonLandsatProduct,
        LANDSAT_ACCESS_RIGHTS,
        'platformShortName',
      ),
    ).toBeFalsy();
  });
});

describe('test functions responsible for validating MODIS access', () => {
  const modisProduct = { instrumentShortName: 'MODIS' };
  const nonModisProduct = { instrumentShortName: 'MSI' };

  test('isProductInConfig', () => {
    expect(isProductInConfig(modisProduct, MODIS_ACCESS_RIGHTS, 'instrumentShortName')).toBeTruthy();
    expect(isProductInConfig(nonModisProduct, MODIS_ACCESS_RIGHTS, 'instrumentShortName')).toBeFalsy();
  });

  test('hasDownloadAccessForConfig', () => {
    expect(
      hasDownloadAccessForConfig(
        userTokenWithProperAccessRole,
        modisProduct,
        MODIS_ACCESS_RIGHTS,
        'instrumentShortName',
      ),
    ).toBeTruthy();
    expect(
      hasDownloadAccessForConfig(
        userTokenWithOutProperAccessRole,
        modisProduct,
        MODIS_ACCESS_RIGHTS,
        'instrumentShortName',
      ),
    ).toBeFalsy();
  });

  test('shouldShowAccessError', () => {
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        modisProduct,
        MODIS_ACCESS_RIGHTS,
        'instrumentShortName',
      ),
    ).toBeFalsy();
    expect(
      shouldShowAccessError(
        userTokenWithProperAccessRole,
        nonModisProduct,
        MODIS_ACCESS_RIGHTS,
        'instrumentShortName',
      ),
    ).toBeFalsy();

    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        modisProduct,
        MODIS_ACCESS_RIGHTS,
        'instrumentShortName',
      ),
    ).toBeTruthy();
    expect(
      shouldShowAccessError(
        userTokenWithOutProperAccessRole,
        nonModisProduct,
        MODIS_ACCESS_RIGHTS,
        'instrumentShortName',
      ),
    ).toBeFalsy();
  });
});
