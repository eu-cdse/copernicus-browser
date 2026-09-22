import { resolveHydratedExternalLayers } from './hydrateExternalServers';
import {
  loadPersistedExternalLayers,
  loadPersistedServers,
  clearPersistedExternalLayers,
} from './externalLayersPersistence';
import { getExternalServersFromServer, saveExternalServersToServer } from './externalServicesBackend';
import { externalLayersSlice, ExternalServer } from '../store/slices/externalLayersSlice';
import { makeExternalServer } from './testFixtures/externalServer';

jest.mock('./externalLayersPersistence');
jest.mock('./externalServicesBackend', () => {
  const actual = jest.requireActual('./externalServicesBackend');
  return {
    ...actual,
    getExternalServersFromServer: jest.fn(),
    saveExternalServersToServer: jest.fn(),
  };
});

const mockLoadPersistedExternalLayers = loadPersistedExternalLayers as jest.Mock;
const mockLoadPersistedServers = loadPersistedServers as jest.Mock;
const mockClearPersistedExternalLayers = clearPersistedExternalLayers as jest.Mock;
const mockGetExternalServersFromServer = getExternalServersFromServer as jest.Mock;
const mockSaveExternalServersToServer = saveExternalServersToServer as jest.Mock;

const server = (id: string, overrides: Partial<ExternalServer> = {}): ExternalServer =>
  makeExternalServer(id, { layers: [], ...overrides });

describe('resolveHydratedExternalLayers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPersistedServers.mockReturnValue([]);
  });

  it('reads only from the anonymous session bucket when the user is not logged in', async () => {
    const persisted = { ...externalLayersSlice.getInitialState(), servers: [server('s1')] };
    mockLoadPersistedExternalLayers.mockReturnValue(persisted);

    const result = await resolveHydratedExternalLayers(false, undefined);

    expect(result).toBe(persisted);
    expect(mockGetExternalServersFromServer).not.toHaveBeenCalled();
  });

  it('uses the backend servers as-is when there is no anonymous bucket to migrate', async () => {
    const backendServers = [server('s1')];
    mockGetExternalServersFromServer.mockResolvedValue(backendServers);
    mockLoadPersistedServers.mockReturnValue([]);

    const result = await resolveHydratedExternalLayers(true, 'token');

    expect(result?.servers).toEqual(backendServers);
    expect(mockSaveExternalServersToServer).not.toHaveBeenCalled();
    expect(mockClearPersistedExternalLayers).not.toHaveBeenCalled();
  });

  it('merges and dedupes the anonymous bucket into the backend servers, persists, then clears the anonymous bucket', async () => {
    const backendServers = [server('s1')];
    const anonServers = [server('s1'), server('s2')];
    mockGetExternalServersFromServer.mockResolvedValue(backendServers);
    mockLoadPersistedServers.mockReturnValue(anonServers);
    mockSaveExternalServersToServer.mockResolvedValue(undefined);

    const result = await resolveHydratedExternalLayers(true, 'token');

    expect(result?.servers).toEqual([server('s1'), server('s2')]);
    expect(mockLoadPersistedServers).toHaveBeenCalledWith();
    expect(mockSaveExternalServersToServer).toHaveBeenCalledWith([server('s1'), server('s2')], 'token');
    expect(mockClearPersistedExternalLayers).toHaveBeenCalledWith();
  });

  it('orders the merged result by addedAt across both backend and anonymous servers, not by source', async () => {
    // s1 (backend) was added after s2 (anonymous), so a naive backend-then-anon concatenation
    // would put s1 first; the merge must sort the union instead.
    const backendServers = [server('s1', { addedAt: '2024-01-05T00:00:00.000Z' })];
    const anonServers = [server('s2', { addedAt: '2024-01-01T00:00:00.000Z' })];
    mockGetExternalServersFromServer.mockResolvedValue(backendServers);
    mockLoadPersistedServers.mockReturnValue(anonServers);
    mockSaveExternalServersToServer.mockResolvedValue(undefined);

    const result = await resolveHydratedExternalLayers(true, 'token');

    expect(result?.servers).toEqual([...anonServers, ...backendServers]);
  });

  it('sorts legacy servers without addedAt before ones with addedAt, preserving relative order among legacy servers', async () => {
    const s1 = server('s1');
    const s2 = server('s2');
    const s3 = server('s3', { addedAt: '2024-01-01T00:00:00.000Z' });
    mockGetExternalServersFromServer.mockResolvedValue([s1, s3]);
    mockLoadPersistedServers.mockReturnValue([s2]);
    mockSaveExternalServersToServer.mockResolvedValue(undefined);

    const result = await resolveHydratedExternalLayers(true, 'token');

    // s1 and s2 both lack addedAt, so they sort as equal and keep their original relative order
    // (s1 before s2, since backend servers are placed before anonymous ones pre-sort); s3 has an
    // addedAt and sorts after both.
    expect(result?.servers).toEqual([s1, s2, s3]);
  });

  it('keeps the backend copy on a dedupe collision and still orders the merged result by addedAt', async () => {
    const backendServer = server('s1', { addedAt: '2024-01-10T00:00:00.000Z' });
    // Same url+type as backendServer, just uppercased and padded with whitespace, so it collides
    // on dedupe despite the different id/addedAt.
    const anonDuplicate = server('s1-anon-copy', {
      url: `  ${backendServer.url.toUpperCase()}  `,
      addedAt: '2024-01-01T00:00:00.000Z',
    });
    const anonUnique = server('s2', { addedAt: '2024-01-05T00:00:00.000Z' });
    mockGetExternalServersFromServer.mockResolvedValue([backendServer]);
    mockLoadPersistedServers.mockReturnValue([anonDuplicate, anonUnique]);
    mockSaveExternalServersToServer.mockResolvedValue(undefined);

    const result = await resolveHydratedExternalLayers(true, 'token');

    // anonDuplicate is dropped (dedupe keeps the first/backend occurrence), so the surviving
    // backend copy keeps its own id/addedAt; the deduped pair is then ordered ascending by
    // addedAt, so anonUnique (added earlier) comes first.
    expect(result?.servers).toEqual([anonUnique, backendServer]);
    expect(mockSaveExternalServersToServer).toHaveBeenCalledWith([anonUnique, backendServer], 'token');
  });

  it('does not clear the anonymous bucket if the merged save fails', async () => {
    mockGetExternalServersFromServer.mockResolvedValue([server('s1')]);
    mockLoadPersistedServers.mockReturnValue([server('s2')]);
    mockSaveExternalServersToServer.mockRejectedValue(new Error('network error'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    await resolveHydratedExternalLayers(true, 'token');

    expect(mockClearPersistedExternalLayers).not.toHaveBeenCalled();
  });

  it('falls back to the session bucket when the backend call fails', async () => {
    mockGetExternalServersFromServer.mockRejectedValue(new Error('network error'));
    const fallback = { ...externalLayersSlice.getInitialState(), servers: [server('s1')] };
    mockLoadPersistedExternalLayers.mockReturnValue(fallback);
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await resolveHydratedExternalLayers(true, 'token');

    expect(result).toBe(fallback);
    expect(mockSaveExternalServersToServer).not.toHaveBeenCalled();
  });

  it('uses the backend servers for a logged-in user without restoring last-active fields from the session bucket', async () => {
    mockGetExternalServersFromServer.mockResolvedValue([server('s1')]);
    mockLoadPersistedServers.mockReturnValue([]);

    const result = await resolveHydratedExternalLayers(true, 'token');

    // Logged-in servers come from the backend only; the anonymous session bucket is not merged in.
    expect(result?.servers).toEqual([server('s1')]);
    expect(result?.lastActiveServerId).toBeNull();
  });
});
