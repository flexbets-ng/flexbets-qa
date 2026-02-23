/**
 * Base Page — shared helpers for all FlexBets page objects.
 * Handles cross-platform selectors and common mobile interactions.
 */
export default class BasePage {
  get isAndroid(): boolean { return driver.isAndroid; }
  get isIOS(): boolean { return driver.isIOS; }

  /** Accessibility-id selector (cross-platform). */
  selector(id: string): string { return `~${id}`; }

  /** Platform-branching selector. */
  platformSelector(android: string, ios: string): string {
    return this.isAndroid ? android : ios;
  }

  // ── Core Interactions ───────────────────────────────────────
  async waitAndTap(sel: string, timeout = 15_000) {
    const el = await $(sel);
    await el.waitForDisplayed({ timeout });
    await el.click();
  }

  async waitAndType(sel: string, text: string, timeout = 15_000) {
    const el = await $(sel);
    await el.waitForDisplayed({ timeout });
    await el.clearValue();
    await el.setValue(text);
  }

  async getText(sel: string, timeout = 15_000): Promise<string> {
    const el = await $(sel);
    await el.waitForDisplayed({ timeout });
    return el.getText();
  }

  async isDisplayed(sel: string, timeout = 5_000): Promise<boolean> {
    try {
      const el = await $(sel);
      await el.waitForDisplayed({ timeout });
      return true;
    } catch { return false; }
  }

  async waitForElement(sel: string, timeout = 30_000) {
    const el = await $(sel);
    await el.waitForExist({ timeout });
  }

  // ── Scrolling & Gestures ────────────────────────────────────
  async scrollDown() {
    if (this.isAndroid) {
      await $('android=new UiScrollable(new UiSelector().scrollable(true)).scrollForward()');
    } else {
      await driver.execute('mobile: scroll', { direction: 'down' });
    }
  }

  async scrollToText(text: string) {
    if (this.isAndroid) {
      await $(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("${text}")`);
    } else {
      const el = await $(`-ios predicate string:label == "${text}"`);
      await el.waitForDisplayed({ timeout: 10_000 });
    }
  }

  async swipeLeft(sel: string) {
    const el = await $(sel);
    if (this.isAndroid) {
      await driver.execute('mobile: swipeGesture', { elementId: el.elementId, direction: 'left', percent: 0.75 });
    } else {
      await driver.execute('mobile: swipe', { direction: 'left', elementId: el.elementId });
    }
  }

  // ── Navigation ──────────────────────────────────────────────
  async tapBackButton() {
    if (this.isAndroid) await driver.back();
    else await this.waitAndTap('~back_button');
  }

  // ── App Lifecycle ───────────────────────────────────────────
  async backgroundApp(seconds: number) { await driver.background(seconds); }
  async resetApp() { await driver.reset(); }
  async pause(ms: number) { await driver.pause(ms); }
  async waitForAnimations(ms = 500) { await this.pause(ms); }
}
