import dotenv from 'dotenv';
import path from 'path';
import { jiraHooks } from '../helpers/wdio-hooks';

dotenv.config();

export const baseConfig: WebdriverIO.Config = {
  runner: 'local',
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120_000,
  },
  logLevel: (process.env.LOG_LEVEL as WebdriverIO.Config['logLevel']) || 'info',
  waitforTimeout: 30_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 3,

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  suites: {
    smoke: ['./tests/smoke/**/*.test.ts'],
    regression: ['./tests/regression/**/*.test.ts'],
    e2e: ['./tests/e2e/**/*.test.ts'],
  },

  beforeTest: async function (test) {
    console.log(`▶ Running: ${test.parent} > ${test.title}`);
  },

  afterTest: async function (test, context, result) {
    // Screenshot on failure
    if (!result.passed && process.env.SCREENSHOT_ON_FAILURE === 'true') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `FAIL-${test.title.replace(/\s+/g, '_')}-${timestamp}.png`;
      const screenshotPath = path.join('screenshots', filename);
      await browser.saveScreenshot(screenshotPath);
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    }
    // Jira auto-bug filing
    await jiraHooks.afterTest(test, context, result);
  },

  afterSuite: jiraHooks.afterSuite,
};
