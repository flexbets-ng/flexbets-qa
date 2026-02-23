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
        buildName: `FlexBets iOS - ${new Date().toISOString().slice(0, 10)}`,
      },
    }],
  ],

  capabilities: [
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'iPhone 15 Pro Max', osVersion: '17', sessionName: 'iPhone 15 Pro Max', buildName: 'iOS Regression' },
      'appium:app': process.env.BROWSERSTACK_IOS_APP_URL,
      'appium:automationName': 'XCUITest',
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
    },
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'iPhone 14', osVersion: '16', sessionName: 'iPhone 14', buildName: 'iOS Regression' },
      'appium:app': process.env.BROWSERSTACK_IOS_APP_URL,
      'appium:automationName': 'XCUITest',
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
    },
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'iPhone SE 2022', osVersion: '16', sessionName: 'iPhone SE (small screen)', buildName: 'iOS Regression' },
      'appium:app': process.env.BROWSERSTACK_IOS_APP_URL,
      'appium:automationName': 'XCUITest',
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
    },
    {
      'bstack:options': { ...sharedBsOpts, deviceName: 'iPad Pro 12.9 2022', osVersion: '16', sessionName: 'iPad Pro (tablet)', buildName: 'iOS Regression' },
      'appium:app': process.env.BROWSERSTACK_IOS_APP_URL,
      'appium:automationName': 'XCUITest',
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
    },
  ],

  maxInstances: 4,
};
