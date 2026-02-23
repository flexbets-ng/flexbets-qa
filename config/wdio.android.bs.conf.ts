import { baseConfig } from './wdio.base.conf';

const bsLocal = process.env.BROWSERSTACK_LOCAL === 'true';

const sharedBsOpts = {
  projectName: 'FlexBets QA',
  debug: true,
  networkLogs: true,
  video: true,
  appiumVersion: '2.4.1',
  local: bsLocal,
};

export const config: WebdriverIO.Config = {
  ...baseConfig,
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  specs: ['./tests/**/*.test.ts'],

  services: [
    ['browserstack', {
      browserstackLocal: bsLocal,
      testObservability: true,
      testObservabilityOptions: {
        projectName: 'FlexBets QA',
        buildName: `FlexBets Android - ${new Date().toISOString().slice(0, 10)}`,
      },
    }],
  ],

  capabilities: [
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'Samsung Galaxy S24 Ultra', osVersion: '14.0', sessionName: 'Galaxy S24 Ultra', buildName: 'Android Regression' },
      'appium:app': process.env.BROWSERSTACK_ANDROID_APP_URL,
      'appium:automationName': 'UiAutomator2',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
    },
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'Samsung Galaxy A54', osVersion: '13.0', sessionName: 'Galaxy A54', buildName: 'Android Regression' },
      'appium:app': process.env.BROWSERSTACK_ANDROID_APP_URL,
      'appium:automationName': 'UiAutomator2',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
    },
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'Google Pixel 8', osVersion: '14.0', sessionName: 'Pixel 8', buildName: 'Android Regression' },
      'appium:app': process.env.BROWSERSTACK_ANDROID_APP_URL,
      'appium:automationName': 'UiAutomator2',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
    },
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'Samsung Galaxy S21', osVersion: '12.0', sessionName: 'Galaxy S21 (legacy)', buildName: 'Android Regression' },
      'appium:app': process.env.BROWSERSTACK_ANDROID_APP_URL,
      'appium:automationName': 'UiAutomator2',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
    },
  ],

  maxInstances: 4,
};
