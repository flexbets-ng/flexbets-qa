/**
 * E2E — Geo-Compliance & Deposit Limits.
 * Covers Tutorial stories:
 *   - Create new account in restricted state
 *   - Deposit limit (TN $2500, MA $1000, others $6000)
 *   - Use the app inside a native land
 */
import LoginPage from '../../pages/LoginPage';
import LobbyPage from '../../pages/LobbyPage';
import EntryPage from '../../pages/EntryPage';
import { FinancialPage } from '../../pages/AppPages';
import { TestUsers, GeoLocations, DepositLimits, LogicalAmounts } from '../../fixtures/test-data';

/**
 * Helper: Set GPS location on BrowserStack device.
 * Uses Appium's setLocation for GPS spoofing.
 */
async function setLocation(lat: number, lng: number) {
  await driver.setGeoLocation({ latitude: lat, longitude: lng, altitude: 0 });
}

describe('FlexBets E2E — Geo-Compliance & Financial Limits', () => {

  // ────────────────────────────────────────────────────────────
  // RESTRICTED STATE (e.g., Washington)
  // ────────────────────────────────────────────────────────────
  describe('Restricted State — WA', () => {
    before(async () => {
      await LoginPage.resetApp();
      await setLocation(GeoLocations.washington.lat, GeoLocations.washington.lng);
      await LoginPage.skipOnboarding();
    });

    it('E2E-GEO-001: User can create an account in restricted state', async () => {
      await LoginPage.startSignUp();
      await LoginPage.fillSignUpForm(TestUsers.restrictedState.email, TestUsers.restrictedState.password);
      // Account creation should succeed
      expect(await LobbyPage.isLobbyVisible()).toBe(true);
    });

    it('E2E-GEO-002: User in restricted state cannot submit any entry type', async () => {
      for (const entryType of ['standard', 'insured', 'benchPlayer'] as const) {
        await (await LobbyPage.navHome).click();
        await EntryPage.selectAthlete(0);
        await EntryPage.selectAthlete(1);
        await EntryPage.selectAthlete(2);
        await EntryPage.selectEntryType(entryType);
        await EntryPage.setEntryAmount(LogicalAmounts.standard3pick);
        await EntryPage.submitEntry();
        const error = await EntryPage.getEntryError();
        expect(error).toBeTruthy(); // Should be geo-blocked
      }
    });

    it('E2E-GEO-003: User in restricted state cannot deposit or withdraw', async () => {
      await LobbyPage.tapDeposit();
      expect(await FinancialPage.isGeoBlocked()).toBe(true);
    });

    it('E2E-GEO-004: User travels to allowed state (CO) and can use app', async () => {
      await setLocation(GeoLocations.colorado.lat, GeoLocations.colorado.lng);
      await LobbyPage.tapDeposit();
      // Should no longer be geo-blocked
      expect(await FinancialPage.isGeoBlocked()).toBe(false);
    });
  });

  // ────────────────────────────────────────────────────────────
  // DEPOSIT LIMITS — TN resident ($2500/month)
  // ────────────────────────────────────────────────────────────
  describe('Deposit Limit — TN Resident ($2500)', () => {
    before(async () => {
      await LoginPage.resetApp();
      await setLocation(GeoLocations.tennessee.lat, GeoLocations.tennessee.lng);
      await LoginPage.skipOnboarding();
      await LoginPage.login(TestUsers.tnResident.email, TestUsers.tnResident.password);
    });

    it('E2E-DEPOSIT-001: TN resident cannot deposit above $2500 in home state', async () => {
      await LobbyPage.tapDeposit();
      await FinancialPage.depositViaACH('2501');
      const error = await FinancialPage.getDepositError();
      expect(error).toBeTruthy(); // Should reject
    });

    it('E2E-DEPOSIT-002: TN resident traveling to CO still has $2500 limit (residency-based)', async () => {
      await setLocation(GeoLocations.colorado.lat, GeoLocations.colorado.lng);
      await LobbyPage.tapDeposit();
      await FinancialPage.depositViaACH('2501');
      const error = await FinancialPage.getDepositError();
      expect(error).toBeTruthy(); // Should STILL reject — limit is by residency
    });
  });

  // ────────────────────────────────────────────────────────────
  // DEPOSIT LIMITS — MA resident ($1000)
  // ────────────────────────────────────────────────────────────
  describe('Deposit Limit — MA Resident ($1000)', () => {
    before(async () => {
      await LoginPage.resetApp();
      await setLocation(GeoLocations.massachusetts.lat, GeoLocations.massachusetts.lng);
      await LoginPage.skipOnboarding();
      await LoginPage.login(TestUsers.maResident.email, TestUsers.maResident.password);
    });

    it('E2E-DEPOSIT-003: MA resident cannot deposit above $1000', async () => {
      await LobbyPage.tapDeposit();
      await FinancialPage.depositViaACH('1001');
      const error = await FinancialPage.getDepositError();
      expect(error).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────────────────────
  // NATIVE LAND — restricted zone within CO
  // ────────────────────────────────────────────────────────────
  describe('Native Land — Restricted Zone in CO', () => {
    before(async () => {
      await LoginPage.resetApp();
      await setLocation(GeoLocations.nativeLandCO.lat, GeoLocations.nativeLandCO.lng);
      await LoginPage.skipOnboarding();
    });

    it('E2E-GEO-005: User can create account inside native land', async () => {
      await LoginPage.startSignUp();
      await LoginPage.fillSignUpForm(`qa-native-${Date.now()}@flexbets.com`, 'TestPass123!');
      expect(await LobbyPage.isLobbyVisible()).toBe(true);
    });

    it('E2E-GEO-006: User inside native land is restricted from entries', async () => {
      await EntryPage.selectAthlete(0);
      await EntryPage.selectAthlete(1);
      await EntryPage.selectAthlete(2);
      await EntryPage.selectEntryType('standard');
      await EntryPage.setEntryAmount(LogicalAmounts.standard3pick);
      await EntryPage.submitEntry();
      const error = await EntryPage.getEntryError();
      expect(error).toBeTruthy();
    });

    it('E2E-GEO-007: User inside native land cannot deposit or withdraw', async () => {
      await LobbyPage.tapDeposit();
      expect(await FinancialPage.isGeoBlocked()).toBe(true);
    });
  });
});
