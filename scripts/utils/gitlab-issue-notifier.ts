import axios, { type AxiosInstance } from 'axios';
import type { Collection } from './rrd-missing-configurations';
import { buildMissingConfigIssueBody } from './rrd-missing-configurations';

// A single open issue (identified by this label) is kept in sync with the latest check:
// updated while collections are missing a configuration, and closed once none are.
const ISSUE_LABEL = 'rrd-missing-config';
const ISSUE_TITLE = 'RRD: collections without a configuration';
const CC_LINE = '/cc @daniel.thiex /cc @gustav.rensburg /cc @zan.pecovnik /cc @jordi.sabat';

interface GitLabIssue {
  iid: number;
}

const findOpenTrackingIssue = async (client: AxiosInstance): Promise<GitLabIssue | null> => {
  const { data } = await client.get<GitLabIssue[]>('/issues', {
    params: { state: 'opened', labels: ISSUE_LABEL },
  });
  if (data && data.length > 1) {
    console.warn(
      `Found ${data.length} open tracking issues with label "${ISSUE_LABEL}"; using the first one (#${data[0].iid}).`,
    );
  }
  return data && data.length ? data[0] : null;
};

/**
 * Report missing configurations as a GitLab tracking issue.
 *
 * Skips silently when the GitLab API context is not available (e.g. local runs without a token),
 * and never throws — a notification failure must not turn the check into a hard pipeline error.
 *
 * @param missing - Collections without a configuration.
 */
export const reportMissingConfigurations = async (missing: Collection[]): Promise<void> => {
  const apiUrl = process.env.CI_API_V4_URL;
  const projectId = process.env.CI_PROJECT_ID;
  const token = process.env.GITLAB_API_TOKEN;

  if (!apiUrl || !projectId || !token) {
    console.log(
      'GitLab issue notification skipped (CI_API_V4_URL, CI_PROJECT_ID or GITLAB_API_TOKEN not set).',
    );
    return;
  }

  const client = axios.create({
    baseURL: `${apiUrl}/projects/${encodeURIComponent(projectId)}`,
    headers: { 'PRIVATE-TOKEN': token },
  });

  try {
    const existing = await findOpenTrackingIssue(client);

    if (missing.length > 0) {
      const body = buildMissingConfigIssueBody(missing);
      if (existing) {
        await client.put(`/issues/${existing.iid}`, { description: body });
        console.log(`Updated tracking issue #${existing.iid}.`);
      } else {
        // The quick actions and CC line are processed by GitLab on creation: they set the
        // status and notify the maintainers, then are stripped from the stored description.
        const description = `/status "In triage"\n\n${body}\n\n${CC_LINE}`;
        const { data } = await client.post<GitLabIssue>('/issues', {
          title: ISSUE_TITLE,
          description,
          labels: ISSUE_LABEL,
        });
        console.log(`Created tracking issue #${data.iid}.`);
      }
    } else if (existing) {
      await client.post(`/issues/${existing.iid}/notes`, {
        body: 'All collections now have a configuration. Closing.',
      });
      await client.put(`/issues/${existing.iid}`, { state_event: 'close' });
      console.log(`Closed tracking issue #${existing.iid}.`);
    }
  } catch (error) {
    console.warn('Failed to update GitLab tracking issue:', (error as Error).message);
  }
};
