import { baseConfig } from './wdio.base.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,
  specs: ['./tests/**/*.test.ts'],
  services: ['appium'],
  capabilities: [
    {
      platformName: 'Android',
      'appium:deviceName': 'Pixel_7_API_34',
      'appium:platformVersion': '14',
      'appium:automationName': 'UiAutomator2',
      'appium:app': './apps/flexbets-staging.apk',
      'appium:autoGrantPermissions': true,
      'appium:noReset': false,
    },
  ],
};
