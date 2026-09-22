import axios from 'axios';
import {
  getExternalServersFromServer,
  saveExternalServersToServer,
  dedupeExternalServers,
} from './externalServicesBackend';
import { ExternalServer } from '../store/slices/externalLayersSlice';
import { makeExternalServer } from './testFixtures/externalServer';

jest.mock('axios');

const EXPECTED_URL = `${import.meta.env.VITE_CDSE_BACKEND}userexternalservers`;

const server = (overrides: Partial<ExternalServer> = {}): ExternalServer =>
  makeExternalServer('s1', { layers: [], ...overrides });

describe('getExternalServersFromServer', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockReset();
  });

  it('calls axios.get with the userexternalservers URL and Authorization header', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { items: [] } });

    await getExternalServersFromServer('token-123');

    expect(axios.get).toHaveBeenCalledWith(EXPECTED_URL, {
      responseType: 'json',
      headers: { Authorization: 'Bearer token-123' },
    });
  });

  it('returns res.data.items when present', async () => {
    const servers = [server()];
    (axios.get as jest.Mock).mockResolvedValue({ data: { items: servers } });

    const result = await getExternalServersFromServer('token-123');

    expect(result).toEqual(servers);
  });

  it('returns res.data directly when items is absent', async () => {
    const servers = [server({ id: 's2' })];
    (axios.get as jest.Mock).mockResolvedValue({ data: servers });

    const result = await getExternalServersFromServer('token-123');

    expect(result).toEqual(servers);
  });

  it('returns [] when res.data is falsy', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: null });

    const result = await getExternalServersFromServer('token-123');

    expect(result).toEqual([]);
  });
});

describe('saveExternalServersToServer', () => {
  beforeEach(() => {
    (axios.put as jest.Mock).mockReset();
  });

  it('calls axios.put with the userexternalservers URL, Authorization header, and full items replace body, stripped of layers', async () => {
    (axios.put as jest.Mock).mockResolvedValue({});
    const servers = [server(), server({ id: 's2', type: 'WMTS' })];

    await saveExternalServersToServer(servers, 'token-abc');

    expect(axios.put).toHaveBeenCalledWith(
      EXPECTED_URL,
      { items: servers.map(({ layers: _layers, ...rest }) => rest) },
      {
        responseType: 'json',
        headers: { Authorization: 'Bearer token-abc' },
      },
    );
  });
});

describe('dedupeExternalServers', () => {
  it('collapses servers with the same url and type, keeping the first occurrence', () => {
    const first = server({ id: 's1', name: 'First' });
    const second = server({ id: 's2', name: 'Second' });

    const result = dedupeExternalServers([first, second]);

    expect(result).toEqual([first]);
  });

  it('is case-insensitive on both url and type', () => {
    const first = server({ id: 's1', url: 'https://WMS.example/wms', type: 'WMS' });
    const second = server({
      id: 's2',
      url: 'https://wms.example/WMS',
      type: 'wms' as ExternalServer['type'],
    });

    const result = dedupeExternalServers([first, second]);

    expect(result).toEqual([first]);
  });

  it('ignores incidental leading/trailing whitespace in the url', () => {
    const first = server({ id: 's1', url: '  https://wms.example/wms  ' });
    const second = server({ id: 's2', url: 'https://wms.example/wms' });

    const result = dedupeExternalServers([first, second]);

    expect(result).toEqual([first]);
  });

  it('does not dedupe the same url with different types (WMS vs WMTS)', () => {
    const wms = server({ id: 's1', type: 'WMS' });
    const wmts = server({ id: 's2', type: 'WMTS' });

    const result = dedupeExternalServers([wms, wmts]);

    expect(result).toEqual([wms, wmts]);
  });

  it('never dedupes different urls', () => {
    const first = server({ id: 's1', url: 'https://a.example/wms' });
    const second = server({ id: 's2', url: 'https://b.example/wms' });

    const result = dedupeExternalServers([first, second]);

    expect(result).toEqual([first, second]);
  });
});
