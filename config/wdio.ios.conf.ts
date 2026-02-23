import { baseConfig } from './wdio.base.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,
  specs: ['./tests/**/*.test.ts'],
  services: ['appium'],
  capabilities: [
    {
      platformName: 'iOS',
      'appium:deviceName': 'iPhone 15 Pro',
      'appium:platformVersion': '17.4',
      'appium:automationName': 'XCUITest',
      'appium:app': './apps/FlexBets-staging.ipa',
      'appium:autoAcceptAlerts': true,
      'appium:noReset': false,
    },
  ],
};
