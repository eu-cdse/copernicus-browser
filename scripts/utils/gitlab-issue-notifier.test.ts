import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { reportMissingConfigurations } from './gitlab-issue-notifier';
import type { Collection } from './rrd-missing-configurations';

const mockNetwork = new MockAdapter(axios);

const ISSUE_TITLE = 'RRD: collections without a configuration';
const ISSUE_LABEL = 'rrd-missing-config';
const CC_LINE = '/cc @gustav.rensburg /cc @zan.pecovnik';

const missingCollections: Collection[] = [{ id: 'col-a', name: 'Collection A' }];

describe('reportMissingConfigurations', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    mockNetwork.reset();
    process.env = {
      ...ORIGINAL_ENV,
      CI_API_V4_URL: 'https://gitlab.example.com/api/v4',
      CI_PROJECT_ID: '123',
      GITLAB_API_TOKEN: 'TOKEN',
    };
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('creates a new issue with CC line, status quick action and label when none exists and collections are missing', async () => {
    mockNetwork.onGet(/\/issues$/).reply(200, []);
    mockNetwork.onPost(/\/issues$/).reply(201, { iid: 42 });

    await reportMissingConfigurations(missingCollections);

    expect(mockNetwork.history.get.length).toBe(1);
    expect(mockNetwork.history.post.length).toBe(1);
    expect(mockNetwork.history.put.length).toBe(0);

    const postRequest = mockNetwork.history.post[0];
    const postData = JSON.parse(postRequest.data);

    expect(postData.title).toBe(ISSUE_TITLE);
    expect(postData.labels).toBe(ISSUE_LABEL);
    expect(postData.description).toContain('/status "In triage"');
    expect(postData.description).toContain(CC_LINE);
    expect(postData.description).toContain('Collection A');
  });

  it('updates the existing issue found by title match and does not create a new one', async () => {
    // Simulates the real bug scenario: the returned issue has no `labels` field.
    mockNetwork.onGet(/\/issues$/).reply(200, [{ iid: 7, title: ISSUE_TITLE }]);
    mockNetwork.onPut(/\/issues\/7$/).reply(200, {});

    await reportMissingConfigurations(missingCollections);

    expect(mockNetwork.history.get.length).toBe(1);
    expect(mockNetwork.history.post.length).toBe(0);
    expect(mockNetwork.history.put.length).toBe(1);

    const putRequest = mockNetwork.history.put[0];
    expect(putRequest.url).toBe('/issues/7');
    const putData = JSON.parse(putRequest.data);
    expect(putData).toEqual({ description: expect.stringContaining('Collection A') });
  });

  it('closes the existing issue with a note and state_event when nothing is missing anymore', async () => {
    mockNetwork.onGet(/\/issues$/).reply(200, [{ iid: 9, title: ISSUE_TITLE }]);
    mockNetwork.onPost(/\/issues\/9\/notes$/).reply(201, {});
    mockNetwork.onPut(/\/issues\/9$/).reply(200, {});

    await reportMissingConfigurations([]);

    expect(mockNetwork.history.get.length).toBe(1);
    expect(mockNetwork.history.post.length).toBe(1);
    expect(mockNetwork.history.put.length).toBe(1);

    const postRequest = mockNetwork.history.post[0];
    expect(postRequest.url).toBe('/issues/9/notes');
    const postData = JSON.parse(postRequest.data);
    expect(postData.body).toMatch(/closing/i);

    const putRequest = mockNetwork.history.put[0];
    expect(putRequest.url).toBe('/issues/9');
    const putData = JSON.parse(putRequest.data);
    expect(putData).toEqual({ state_event: 'close' });
  });

  it('makes no mutation calls when there is no existing issue and nothing is missing', async () => {
    mockNetwork.onGet(/\/issues$/).reply(200, []);

    await reportMissingConfigurations([]);

    expect(mockNetwork.history.get.length).toBe(1);
    expect(mockNetwork.history.post.length).toBe(0);
    expect(mockNetwork.history.put.length).toBe(0);
  });

  it('warns and uses the first issue when multiple open issues exactly match the title', async () => {
    mockNetwork.onGet(/\/issues$/).reply(200, [
      { iid: 11, title: ISSUE_TITLE },
      { iid: 12, title: ISSUE_TITLE },
    ]);
    mockNetwork.onPut(/\/issues\/11$/).reply(200, {});

    await reportMissingConfigurations(missingCollections);

    expect(console.warn).toHaveBeenCalled();
    expect(mockNetwork.history.put.length).toBe(1);
    expect(mockNetwork.history.put[0].url).toBe('/issues/11');
    expect(mockNetwork.history.post.length).toBe(0);
  });

  describe('missing environment variables', () => {
    it('returns early and makes no axios calls when GITLAB_API_TOKEN is missing', async () => {
      delete process.env.GITLAB_API_TOKEN;

      await reportMissingConfigurations(missingCollections);

      expect(mockNetwork.history.get.length).toBe(0);
      expect(mockNetwork.history.post.length).toBe(0);
      expect(mockNetwork.history.put.length).toBe(0);
      expect(console.log).toHaveBeenCalled();
    });

    it('returns early and makes no axios calls when CI_API_V4_URL is missing', async () => {
      delete process.env.CI_API_V4_URL;

      await reportMissingConfigurations(missingCollections);

      expect(mockNetwork.history.get.length).toBe(0);
      expect(mockNetwork.history.post.length).toBe(0);
      expect(mockNetwork.history.put.length).toBe(0);
    });

    it('returns early and makes no axios calls when CI_PROJECT_ID is missing', async () => {
      delete process.env.CI_PROJECT_ID;

      await reportMissingConfigurations(missingCollections);

      expect(mockNetwork.history.get.length).toBe(0);
      expect(mockNetwork.history.post.length).toBe(0);
      expect(mockNetwork.history.put.length).toBe(0);
    });
  });

  it('catches errors, warns, and resolves without throwing when the GET call fails', async () => {
    mockNetwork.onGet(/\/issues$/).networkError();

    await expect(reportMissingConfigurations(missingCollections)).resolves.toBeUndefined();

    expect(console.warn).toHaveBeenCalledWith('Failed to update GitLab tracking issue:', expect.any(String));
  });

  it('catches errors, warns, and resolves without throwing when a mutation call fails with a 500', async () => {
    mockNetwork.onGet(/\/issues$/).reply(200, [{ iid: 7, title: ISSUE_TITLE }]);
    mockNetwork.onPut(/\/issues\/7$/).reply(500);

    await expect(reportMissingConfigurations(missingCollections)).resolves.toBeUndefined();

    expect(console.warn).toHaveBeenCalledWith('Failed to update GitLab tracking issue:', expect.any(String));
  });
});
