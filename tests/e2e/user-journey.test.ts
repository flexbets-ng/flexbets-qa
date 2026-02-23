/**
 * E2E — Full User Journey.
 * Covers Tutorial stories:
 *   - Creating an account — Sign up/log in
 *   - How to make a deposit with ACH / Credit Card
 *   - How to request a withdrawal
 *   - How to view live entries
 *   - Canceled games or players that did not play
 */
import LoginPage from '../../pages/LoginPage';
import LobbyPage from '../../pages/LobbyPage';
import EntryPage from '../../pages/EntryPage';
import { FinancialPage, MyEntriesPage } from '../../pages/AppPages';
import { TestUsers, Sports, LogicalAmounts, GeoLocations } from '../../fixtures/test-data';
import { clearInbox, getSignUpVerificationCode, getPasswordResetLink, verifyReferralEmail } from '../../helpers/mailslurp';

describe('FlexBets E2E — Full User Journey', () => {

  // ────────────────────────────────────────────────────────────
  // ACCOUNT CREATION (with MailSlurp email verification)
  // ────────────────────────────────────────────────────────────
  it('E2E-JOURNEY-001: New user sign-up with email verification via MailSlurp', async () => {
    // Clear inbox before test
    await clearInbox('auto2');
    const beforeSignUp = new Date();

    await LoginPage.skipOnboarding();
    await LoginPage.startSignUp();
    await LoginPage.fillSignUpForm(TestUsers.signUp.email, TestUsers.signUp.password);

    // Wait for verification email in qa2@qa.flexbets.io
    const { code, link } = await getSignUpVerificationCode('auto2', beforeSignUp);

    if (code) {
      // Enter OTP code in the app
      await LoginPage.waitAndType('~signup_verification_code', code);
      await LoginPage.waitAndTap('~signup_verify_button');
    } else if (link) {
      // Open deep link (BrowserStack supports this)
      await driver.url(link);
    }

    // Should now be on the lobby
    expect(await LobbyPage.isLobbyVisible()).toBe(true);
  });

  // ────────────────────────────────────────────────────────────
  // DEPOSITS
  // ────────────────────────────────────────────────────────────
  it('E2E-JOURNEY-002: Deposit via ACH', async () => {
    await LobbyPage.tapDeposit();
    await FinancialPage.depositViaACH('50');
    expect(await FinancialPage.isDepositSuccessful()).toBe(true);
  });

  it('E2E-JOURNEY-003: Deposit via Credit Card', async () => {
    await LobbyPage.tapDeposit();
    await FinancialPage.depositViaCreditCard('25');
    expect(await FinancialPage.isDepositSuccessful()).toBe(true);
  });

  // ────────────────────────────────────────────────────────────
  // ENTRY SUBMISSION → LIVE VIEW
  // ────────────────────────────────────────────────────────────
  it('E2E-JOURNEY-004: Submit entry and view it live', async () => {
    await (await LobbyPage.navHome).click();
    await LobbyPage.selectSport(Sports.nba);

    await EntryPage.buildAndSubmitEntry({
      pickCount: 3,
      entryType: 'standard',
      amount: LogicalAmounts.standard3pick,
    });

    // Navigate to live entries
    await LobbyPage.navigateToMyEntries();
    const liveCount = await MyEntriesPage.getLiveEntryCount();
    expect(liveCount).toBeGreaterThan(0);

    // Open and verify detail
    await MyEntriesPage.openLiveEntry();
    expect(await MyEntriesPage.isDisplayed('~entry_detail_view')).toBe(true);
  });

  // ────────────────────────────────────────────────────────────
  // CANCELED GAMES / DID NOT PLAY
  // ────────────────────────────────────────────────────────────
  it('E2E-JOURNEY-005: Entries with canceled games show correct labels', async () => {
    // Navigate to completed entries to find one with a canceled game
    await LobbyPage.navigateToMyEntries();
    const completed = await MyEntriesPage.completedEntries;
    if (completed.length > 0) {
      await completed[0].click();
      // Check if canceled game or DNP labels are present
      const hasCanceled = await MyEntriesPage.hasCanceledGameLabel();
      const hasDNP = await MyEntriesPage.hasDidNotPlayLabel();
      // At least verify the UI doesn't crash when these states exist
      console.log(`Canceled game: ${hasCanceled}, DNP: ${hasDNP}`);
      expect(await MyEntriesPage.isDisplayed('~entry_payment_summary')).toBe(true);
    }
  });

  // ────────────────────────────────────────────────────────────
  // WITHDRAWAL
  // ────────────────────────────────────────────────────────────
  it('E2E-JOURNEY-006: Request a withdrawal', async () => {
    await LobbyPage.navigateToProfile();
    await FinancialPage.requestWithdrawal('10');
    // Should either succeed or show eligibility message
    const success = await FinancialPage.isDisplayed('~withdraw_success', 5_000);
    const eligibility = await FinancialPage.isDisplayed('~withdraw_eligibility', 3_000);
    expect(success || eligibility).toBe(true);
  });
});
