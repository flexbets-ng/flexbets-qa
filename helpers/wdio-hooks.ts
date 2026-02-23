/**
 * WDIO Hooks — Jira + BrowserStack Integration.
 * ──────────────────────────────────────────────────────────────
 * Wires into the WDIO test lifecycle to:
 *   - Auto-create Jira bugs on test failure (deduped)
 *   - Attach BrowserStack session video/network logs
 *   - Track test execution results
 */
import { fileOrUpdateBug, BugReport, BugPriority } from './jira';

/**
 * Extract the BrowserStack session URL from the driver.
 * Works with both the BrowserStack service and direct session ID.
 */
async function getBrowserStackSessionUrl(): Promise<string | undefined> {
  try {
    const sessionId = driver.sessionId;
    const bsUser = process.env.BROWSERSTACK_USERNAME;
    if (sessionId && bsUser) {
      return `https://app-automate.browserstack.com/builds/${sessionId}`;
    }
  } catch { /* not on BrowserStack */ }
  return undefined;
}

/**
 * Get current device info from capabilities.
 */
function getDeviceInfo(): { device: string; osVersion: string } {
  const caps = driver.capabilities as any;
  return {
    device: caps.deviceName || caps['bstack:options']?.deviceName || 'unknown',
    osVersion: caps.platformVersion || caps['bstack:options']?.osVersion || 'unknown',
  };
}

/**
 * Determine bug priority based on test suite and error type.
 */
function inferPriority(testTitle: string, error: Error): string {
  const title = testTitle.toLowerCase();
  if (title.includes('smoke') || title.includes('critical')) return BugPriority.p0Blocker;
  if (title.includes('e2e') || title.includes('entry') || title.includes('deposit')) return BugPriority.p1Critical;
  if (error.message?.toLowerCase().includes('crash') || error.message?.toLowerCase().includes('timeout')) return BugPriority.p1Critical;
  return BugPriority.p2Major;
}

// ── Export Hooks ──────────────────────────────────────────────
// These are merged into wdio.base.conf.ts

export const jiraHooks = {
  /**
   * afterTest: fires after each test case.
   * On failure → screenshot + auto-file Jira bug.
   */
  afterTest: async function (
    test: { title: string; parent: string; fullTitle: string },
    _context: any,
    result: { passed: boolean; duration: number; error?: Error },
  ) {
    if (result.passed) return;

    // Only file bugs if Jira integration is enabled
    if (!process.env.JIRA_API_TOKEN || process.env.JIRA_AUTO_FILE_BUGS !== 'true') return;

    try {
      // Capture screenshot
      let screenshotBase64: string | undefined;
      try {
        screenshotBase64 = await driver.takeScreenshot();
      } catch { /* screenshot failed, continue anyway */ }

      const { device, osVersion } = getDeviceInfo();
      const sessionUrl = await getBrowserStackSessionUrl();

      // Extract test ID from title (e.g., "SMOKE-003: ..." → "SMOKE-003")
      const testIdMatch = test.title.match(/^([A-Z]+-[A-Z]*-?\d+)/);
      const testId = testIdMatch ? testIdMatch[1] : undefined;

      const report: BugReport = {
        title: `[QA Auto] ${test.title}`,
        description: `Automated test failure detected.\n\nSuite: ${test.parent}\nTest: ${test.fullTitle}`,
        priority: inferPriority(test.title, result.error!),
        testId,
        device,
        osVersion,
        browserStackSessionUrl: sessionUrl,
        actualResult: result.error?.message || 'Test assertion failed',
        screenshotBase64,
        labels: ['qa-automation', driver.isAndroid ? 'android' : 'ios'],
      };

      await fileOrUpdateBug(report);
    } catch (err) {
      console.error('Failed to file Jira bug:', err);
    }
  },

  /**
   * afterSuite: fires after each test suite completes.
   * Logs a summary of the suite results.
   */
  afterSuite: async function (suite: any) {
    const passed = suite.tests?.filter((t: any) => t.state === 'passed').length || 0;
    const failed = suite.tests?.filter((t: any) => t.state === 'failed').length || 0;
    console.log(`📊 Suite "${suite.title}" complete: ${passed} passed, ${failed} failed`);
  },
};
