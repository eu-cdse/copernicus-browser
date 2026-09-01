import {
  doesUserHaveAnyCCMRole,
  doesUserHaveAccessToCCMVisualization,
  CCM_ROLES,
} from './ccmProductTypeAccessRightsConfig';
import { ACCESS_ROLES } from '../../../../api/OData/assets/accessRoles';

// Real tokens copied from ProductInfoUtils.test.js — decoded client-side by jwtDecode.
// userTokenWithProperAccessRole's realm_access.roles include copernicus-services-ccm and
// copernicus-operators-ccm; userTokenWithOutProperAccessRole has only generic (non-CCM) roles.
const userTokenWithProperAccessRole =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYVUh3VWZKaHVDVWo0X3k4ZF8xM0hxWXBYMFdwdDd2anhob2FPLUxzREZFIn0.eyJleHAiOjE3NzM4NDk4NzIsImlhdCI6MTc3Mzg0ODA3MiwiYXV0aF90aW1lIjoxNzczODQ4MDcyLCJqdGkiOiJvbnJ0YWM6NWVjNzE1MzYtYzEyMS1jMzcwLTEwZDgtMjNlNWU0YmM4YjBjIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5kYXRhc3BhY2UuY29wZXJuaWN1cy5ldS9hdXRoL3JlYWxtcy9DRFNFIiwiYXVkIjpbIkNMT1VERkVSUk9fUFVCTElDIiwiYWNjb3VudCJdLCJzdWIiOiJjMDUzNjBkOC1mMGQ0LTRkOTItYWFkYS05OGI2YzdlNTBkZjUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaC1kMzFhOGQ5Ni1hYjI4LTQyNDktYTIzYS1hYTRmNzU0NzU5MTYiLCJzaWQiOiJjYmEzZmI5Yi1mNjE2LWEyM2YtZWRlMS0wM2E1NWQ2NTc0ODUiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9kZXZleHQtZmUuc2luZXJnaXNlLmNvbSIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImh0dHBzOi8vd2ViZGV2MS5zaW5lcmdpc2UuY29tIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJzMi1leHBlcnQiLCJzMS1leHBlcnQiLCJsYW5kc2F0LWFjY2VzcyIsInM1cC1leHBlcnQiLCJjb3Blcm5pY3VzLXNlcnZpY2VzLWNjbSIsInMxYy1jb21taXNzaW9uaW5nIiwiY29wZXJuaWN1cy1jb2xsYWJvcmF0aXZlLXF1b3RhIiwiczMtZXhwZXJ0IiwibW9kaXMtYWNjZXNzIiwiczJjLWNvbW1pc3Npb25pbmciLCJjb3Blcm5pY3VzLWdlbmVyYWwtcXVvdGEiLCJvZmZsaW5lX2FjY2VzcyIsImNvcGVybmljdXMtb3BlcmF0b3JzLWNjbSIsInVtYV9hdXRob3JpemF0aW9uIiwiZGVmYXVsdC1yb2xlcy1jZGFzIiwiY29wZXJuaWN1cy1nZW5lcmFsIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgQVVESUVOQ0VfUFVCTElDIGVtYWlsIHByb2ZpbGUgdXNlci1jb250ZXh0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInppcF9tYXhfc2VzcyI6MjAsImNvbnRleHRfZ3JvdXBzIjpbIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19nZW5lcmFsLyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19vcGVyYXRvcnNfY2NtLyIsIi9vcmdhbml6YXRpb25zL2FjYy1hZjVmMWEwOC1hN2MzLTQ4YjAtODFjZi02NjJiNDc3ZThlMDMvcmVndWxhcl91c2VyLyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczFfZXhwZXJ0LyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczJfZXhwZXJ0LyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczJjLWNvbW1pc3Npb25pbmcvIiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zMmNfY29tbWlzc2lvbmluZy8iLCIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L3MzX2V4cGVydC8iLCIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L3M1cF9leHBlcnQvIl0sInByZWZlcnJlZF91c2VybmFtZSI6ImNkYXNfYnJvd3NlckBzZW50aW5lbC1odWIuY29tIiwiZ2l2ZW5fbmFtZSI6IkZFLVRlYW0iLCJncm91cF9tZW1iZXJzaGlwIjpbIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvY29wZXJuaWN1c19nZW5lcmFsIiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9jb3Blcm5pY3VzX29wZXJhdG9yc19jY20iLCIvb3JnYW5pemF0aW9ucy9hY2MtYWY1ZjFhMDgtYTdjMy00OGIwLTgxY2YtNjYyYjQ3N2U4ZTAzL3JlZ3VsYXJfdXNlciIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczFfZXhwZXJ0IiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zMl9leHBlcnQiLCIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L3MyYy1jb21taXNzaW9uaW5nIiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zMmNfY29tbWlzc2lvbmluZyIsIi9hY2Nlc3NfZ3JvdXBzL3VzZXJfdHlwb2xvZ3kvczNfZXhwZXJ0IiwiL2FjY2Vzc19ncm91cHMvdXNlcl90eXBvbG9neS9zNXBfZXhwZXJ0Il0sIm5hbWUiOiJGRS1UZWFtIFRlc3QgQWNjb3VudCIsIm9yZ2FuaXphdGlvbnMiOlsiYWNjLWFmNWYxYTA4LWE3YzMtNDhiMC04MWNmLTY2MmI0NzdlOGUwMyJdLCJ1c2VyX2NvbnRleHRfaWQiOiJhZjVmMWEwOC1hN2MzLTQ4YjAtODFjZi02NjJiNDc3ZThlMDMiLCJjb250ZXh0X3JvbGVzIjp7fSwiZmFtaWx5X25hbWUiOiJUZXN0IEFjY291bnQiLCJ1c2VyX2NvbnRleHQiOiJhY2MtYWY1ZjFhMDgtYTdjMy00OGIwLTgxY2YtNjYyYjQ3N2U4ZTAzIiwiZW1haWwiOiJjZGFzX2Jyb3dzZXJAc2VudGluZWwtaHViLmNvbSJ9.luTzH4VyNe5UTZhhCeJnD7xbLMmbLimQXWXsiGefesYmbGODPfyopQKAz5ytaFlgohOnUt5f3dbE4aS-PRqvgD5lpUwBHwrK3weA3YhNzBJanW0C7XEDpXCXJUXeRlG3LGInVAUDGI_GXELfGCSYjConIpQLkNU38NSxIjeJEUPhGt9_TbONdyqbPppOwbbhaFj83if7gzpjm6lDx1EWPjf38xzPekXglQnBYNNX5FUCXVOY0uuU0KLbGaOqDX7vx_CmuxBQN315He8GLxrktzaYSjNR6Z2OGjEip-kn7ToOr2U3PbKpVrI0FgPc7-MJ0UA4Z4l3NnayyuFfObTrKQ';

const userTokenWithOutProperAccessRole =
  'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJYVUh3VWZKaHVDVWo0X3k4ZF8xM0hxWXBYMFdwdDd2anhob2FPLUxzREZFIn0.eyJleHAiOjE3MTIyNDg5NTAsImlhdCI6MTcxMjI0ODA1MCwiYXV0aF90aW1lIjoxNzEyMjM5NTA0LCJqdGkiOiIwZDNlMGFjOC00YjM4LTQ5ZmUtYjhhYy04NTM2M2VjNmEzZmIiLCJpc3MiOiJodHRwczovL2lkZW50aXR5LmRhdGFzcGFjZS5jb3Blcm5pY3VzLmV1L2F1dGgvcmVhbG1zL0NEU0UiLCJhdWQiOlsiQ0xPVURGRVJST19QVUJMSUMiLCJhY2NvdW50Il0sInN1YiI6IjdjNGU3NDZkLTE1OWUtNDIyZi05OTQ4LWViYjQ0NzhjZTA0MiIsInR5cCI6IkJlYXJlciIsImF6cCI6InNoLWQzMWE4ZDk2LWFiMjgtNDI0OS1hMjNhLWFhNGY3NTQ3NTkxNiIsIm5vbmNlIjoiNTk3Nzk3MDg4NDA4OTI3MyIsInNlc3Npb25fc3RhdGUiOiIzOTU5ZmY5My03YTM1LTQ0M2EtOGM3Yy0wMDRhMzdlNTk4YjQiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtY2RhcyIsImNvcGVybmljdXMtZ2VuZXJhbCJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiQVVESUVOQ0VfUFVCTElDIGVtYWlsIHByb2ZpbGUgdXNlci1jb250ZXh0Iiwic2lkIjoiMzk1OWZmOTMtN2EzNS00NDNhLThjN2MtMDA0YTM3ZTU5OGI0IiwiZ3JvdXBfbWVtYmVyc2hpcCI6WyIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L2NvcGVybmljdXNfZ2VuZXJhbCIsIi9vcmdhbml6YXRpb25zL2FjYy03YTJlNmQzZS04YjI2LTRiZmMtODg5OC1lYjUzNGY3NjA3OTYvcmVndWxhcl91c2VyIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJvcmdhbml6YXRpb25zIjpbImFjYy03YTJlNmQzZS04YjI2LTRiZmMtODg5OC1lYjUzNGY3NjA3OTYiXSwibmFtZSI6IlN0ZWxpb3MtRXJ2aXMgUHJpZnRpcyIsInVzZXJfY29udGV4dF9pZCI6IjdhMmU2ZDNlLThiMjYtNGJmYy04ODk4LWViNTM0Zjc2MDc5NiIsImNvbnRleHRfcm9sZXMiOnt9LCJjb250ZXh0X2dyb3VwcyI6WyIvYWNjZXNzX2dyb3Vwcy91c2VyX3R5cG9sb2d5L2NvcGVybmljdXNfZ2VuZXJhbC8iLCIvb3JnYW5pemF0aW9ucy9hY2MtN2EyZTZkM2UtOGIyNi00YmZjLTg4OTgtZWI1MzRmNzYwNzk2L3JlZ3VsYXJfdXNlci8iXSwicHJlZmVycmVkX3VzZXJuYW1lIjoic3RlbGlvcy5wcmlmdGlzQHNpbmVyZ2lzZS5jb20iLCJnaXZlbl9uYW1lIjoiU3RlbGlvcy1FcnZpcyIsInVzZXJfY29udGV4dCI6ImFjYy03YTJlNmQzZS04YjI2LTRiZmMtODg5OC1lYjUzNGY3NjA3OTYiLCJmYW1pbHlfbmFtZSI6IlByaWZ0aXMiLCJlbWFpbCI6InN0ZWxpb3MucHJpZnRpc0BzaW5lcmdpc2UuY29tIn0.GC_CxDLeguOtZRhKTWfVl-PoxbQS35DZSUKslaAIb3MVr5KV1f2HeGaw_HnGATiFAQvLBzch_bAiTut0yOZUL1Rtrhft39LQrkQIvCXRM3E0GR8P9qKMvPtTm7F9NlPtYmkCkDJ_h9xQEzVfs2SIWxdwz7uDiLLwsKTVkUEP9GzpHJaTT6BuFxMWkl_BemWPZY_QZ6GqRddFc72yZJ2JFj8VlqXv61QdK-ezCg5hU_WyfbzQhI6o3ROLJZ_T-GLyGfWyqHVYp9e7VVqRgGM2WRd089aNPc5AMoDQD26OJFRusQcL2GoC_TpXzCioCJd_Pcd2ZZj3S-ak4KM0IW4ZIA';

// Build a decode-only JWT (header.payload.signature) whose realm_access.roles is `roles`.
// jwtDecode only base64url-decodes the payload segment, so the signature can be a placeholder.
const makeToken = (roles) => {
  const base64url = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  const header = base64url({ alg: 'none', typ: 'JWT' });
  const payload = base64url({ realm_access: { roles } });
  return `${header}.${payload}.signature`;
};

describe('doesUserHaveAnyCCMRole', () => {
  test('returns false for null/undefined token', () => {
    expect(doesUserHaveAnyCCMRole(null)).toBe(false);
    expect(doesUserHaveAnyCCMRole(undefined)).toBe(false);
  });

  test('returns false for a token with no CCM roles', () => {
    expect(doesUserHaveAnyCCMRole(userTokenWithOutProperAccessRole)).toBe(false);
    expect(doesUserHaveAnyCCMRole(makeToken(['copernicus-general', 'offline_access']))).toBe(false);
  });

  test('returns true for a token holding a CCM role', () => {
    expect(doesUserHaveAnyCCMRole(userTokenWithProperAccessRole)).toBe(true);
  });

  test.each(Object.values(CCM_ROLES))('returns true for CCM role %s', (role) => {
    expect(doesUserHaveAnyCCMRole(makeToken([role]))).toBe(true);
  });

  // The two roles that distinguish this predicate from doesUserHaveAccessToCCMVisualization,
  // whose allow-list deliberately excludes them. These are exactly why we can't reuse that predicate
  // for the COP DEM 30m gate (issue #1185), which must include public-ccm.
  test.each([CCM_ROLES.PUBLIC_CCM, CCM_ROLES.COPERNICUS_OPERATORS_CCM])(
    'grants access for %s where doesUserHaveAccessToCCMVisualization does not',
    (role) => {
      const token = makeToken([role]);
      expect(doesUserHaveAnyCCMRole(token)).toBe(true);
      expect(doesUserHaveAccessToCCMVisualization(token)).toBe(false);
    },
  );
});

describe('doesUserHaveAccessToCCMVisualization', () => {
  // Regression test for the ACCESS_ROLES.COPERNICUS_SERVICES value fix: it used to hold
  // 'copernicus-services' (plural), which never matched the real Keycloak role, so this
  // branch of the allow-list was silently dead. Pin both the fixed value and the typo it
  // replaced so a future accidental revert is caught by the test suite.
  test('grants access for the copernicus-service role', () => {
    expect(ACCESS_ROLES.COPERNICUS_SERVICES).toBe('copernicus-service');
    expect(doesUserHaveAccessToCCMVisualization(makeToken([ACCESS_ROLES.COPERNICUS_SERVICES]))).toBe(true);
  });

  test('does not grant access for the old, incorrect copernicus-services (plural) role', () => {
    expect(doesUserHaveAccessToCCMVisualization(makeToken(['copernicus-services']))).toBe(false);
  });
});
