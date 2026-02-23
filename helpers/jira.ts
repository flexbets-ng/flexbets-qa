/**
 * Jira Integration for FlexBets QA.
 * ──────────────────────────────────────────────────────────────
 * Instance: flexbets.atlassian.net
 *
 * Provides:
 *   - Automatic bug creation on test failure
 *   - Test execution status updates to Jira tickets
 *   - Link BrowserStack session URLs to Jira issues
 *   - Sync test results with Jira Xray or native test management
 */
import axios, { AxiosInstance } from 'axios';

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://flexbets.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL!;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN!;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'FLEX';

function jiraClient(): AxiosInstance {
  return axios.create({
    baseURL: `${JIRA_BASE_URL}/rest/api/3`,
    auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 15_000,
  });
}

// ── Issue Types ───────────────────────────────────────────────
export const JiraIssueType = {
  bug: 'Bug',
  task: 'Task',
  story: 'Story',
  testCase: 'Test',        // If Xray or Zephyr installed
  subTask: 'Sub-task',
} as const;

export const BugPriority = {
  p0Blocker: '1',   // Crash, data loss, security
  p1Critical: '2',  // Core flow broken
  p2Major: '3',     // Feature degraded
  p3Minor: '4',     // Cosmetic, minor UX
} as const;

// ── Bug Creation ──────────────────────────────────────────────

export interface BugReport {
  title: string;
  description: string;
  priority: string;                // BugPriority value
  labels?: string[];
  device?: string;
  osVersion?: string;
  browserStackSessionUrl?: string;
  testId?: string;                 // e.g., 'SMOKE-003'
  steps?: string[];
  expectedResult?: string;
  actualResult?: string;
  screenshotBase64?: string;
}

/**
 * Create a bug in Jira with full context from a failed test.
 * Returns the Jira issue key (e.g., 'FLEX-123').
 */
export async function createBug(report: BugReport): Promise<string> {
  const descriptionBlocks: any[] = [];

  // Steps to reproduce
  if (report.steps?.length) {
    descriptionBlocks.push(
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Steps to Reproduce' }] },
      {
        type: 'orderedList',
        content: report.steps.map(step => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: step }] }],
        })),
      },
    );
  }

  // Expected vs Actual
  if (report.expectedResult) {
    descriptionBlocks.push(
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Expected Result' }] },
      { type: 'paragraph', content: [{ type: 'text', text: report.expectedResult }] },
    );
  }
  if (report.actualResult) {
    descriptionBlocks.push(
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Actual Result' }] },
      { type: 'paragraph', content: [{ type: 'text', text: report.actualResult }] },
    );
  }

  // Device info
  if (report.device) {
    descriptionBlocks.push(
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Environment' }] },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: `Device: ${report.device}${report.osVersion ? ` (${report.osVersion})` : ''}` }],
      },
    );
  }

  // BrowserStack session link
  if (report.browserStackSessionUrl) {
    descriptionBlocks.push(
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'BrowserStack Session' }] },
      {
        type: 'paragraph',
        content: [{
          type: 'text',
          text: report.browserStackSessionUrl,
          marks: [{ type: 'link', attrs: { href: report.browserStackSessionUrl } }],
        }],
      },
    );
  }

  // General description
  if (report.description) {
    descriptionBlocks.unshift(
      { type: 'paragraph', content: [{ type: 'text', text: report.description }] },
    );
  }

  const labels = ['qa-automation', ...(report.labels || [])];
  if (report.testId) labels.push(`test:${report.testId}`);

  const payload = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: report.title,
      issuetype: { name: JiraIssueType.bug },
      priority: { id: report.priority },
      labels,
      description: {
        type: 'doc',
        version: 1,
        content: descriptionBlocks,
      },
    },
  };

  const { data } = await jiraClient().post('/issue', payload);
  console.log(`🐛 Jira bug created: ${data.key} — ${report.title}`);

  // Attach screenshot if provided
  if (report.screenshotBase64) {
    await attachScreenshot(data.key, report.screenshotBase64, `${report.testId || 'failure'}.png`);
  }

  return data.key;
}

/** Attach a screenshot (base64) to an existing Jira issue. */
export async function attachScreenshot(
  issueKey: string,
  base64Data: string,
  filename: string,
): Promise<void> {
  const buffer = Buffer.from(base64Data, 'base64');
  const form = new FormData();
  const blob = new Blob([buffer], { type: 'image/png' });
  form.append('file', blob, filename);

  await axios.post(
    `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/attachments`,
    form,
    {
      auth: { username: JIRA_EMAIL, password: JIRA_API_TOKEN },
      headers: { 'X-Atlassian-Token': 'no-check' },
    },
  );
}

// ── Test Execution Tracking ───────────────────────────────────

/** Add a comment to a Jira issue with test execution results. */
export async function addTestResult(
  issueKey: string,
  result: { passed: boolean; testId: string; duration: number; device: string; sessionUrl?: string },
): Promise<void> {
  const status = result.passed ? '✅ PASSED' : '❌ FAILED';
  const body = {
    type: 'doc',
    version: 1,
    content: [{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: `${status} | Test: ${result.testId} | Device: ${result.device} | Duration: ${(result.duration / 1000).toFixed(1)}s${result.sessionUrl ? ` | Session: ${result.sessionUrl}` : ''}`,
      }],
    }],
  };

  await jiraClient().post(`/issue/${issueKey}/comment`, { body });
}

/** Transition an issue (e.g., move to "In QA", "Done", "Reopened"). */
export async function transitionIssue(issueKey: string, transitionName: string): Promise<void> {
  // First, get available transitions
  const { data } = await jiraClient().get(`/issue/${issueKey}/transitions`);
  const transition = data.transitions.find((t: any) =>
    t.name.toLowerCase() === transitionName.toLowerCase(),
  );

  if (!transition) {
    console.warn(`Transition "${transitionName}" not found for ${issueKey}`);
    return;
  }

  await jiraClient().post(`/issue/${issueKey}/transitions`, {
    transition: { id: transition.id },
  });
}

// ── Search ────────────────────────────────────────────────────

/** Search Jira for existing bugs matching a test failure signature. */
export async function findExistingBug(testId: string): Promise<string | null> {
  const jql = `project = ${JIRA_PROJECT_KEY} AND labels = "test:${testId}" AND status != Done ORDER BY created DESC`;

  const { data } = await jiraClient().get('/search', {
    params: { jql, maxResults: 1 },
  });

  return data.issues?.length > 0 ? data.issues[0].key : null;
}

/**
 * Smart bug filing: checks for existing open bug before creating a duplicate.
 * If bug exists, adds a comment instead.
 */
export async function fileOrUpdateBug(report: BugReport): Promise<string> {
  if (report.testId) {
    const existing = await findExistingBug(report.testId);
    if (existing) {
      console.log(`🔄 Existing bug found: ${existing} — adding comment`);
      await addTestResult(existing, {
        passed: false,
        testId: report.testId,
        duration: 0,
        device: report.device || 'unknown',
        sessionUrl: report.browserStackSessionUrl,
      });
      return existing;
    }
  }
  return createBug(report);
}
