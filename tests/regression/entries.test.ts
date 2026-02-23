/**
 * REGRESSION — Entry Submission & Transactions.
 * Covers stories:
 *   - Entry break test — NBA 3-pick Standard
 *   - Jungle Head-to-Head — Standard Auto-Match
 *   - Jungle Prize Entry
 *   - Verify scheduled events exist in the App — All sports
 */
import LoginPage from '../../pages/LoginPage';
import LobbyPage from '../../pages/LobbyPage';
import EntryPage from '../../pages/EntryPage';
import { MyEntriesPage } from '../../pages/AppPages';
import { Sports, LogicalAmounts, buildLogicalEntryAmount } from '../../fixtures/test-data';

describe('FlexBets Regression — Entry Submission', () => {
  before(async () => {
    await LoginPage.skipOnboarding();
    await LoginPage.loginWithDefaults();
  });

  // ── Standard entries across sports ──────────────────────────
  for (const [key, sport] of Object.entries(Sports).slice(0, 4)) {
    it(`REG-ENTRY-001-${key}: Standard 3-pick entry — ${sport}`, async () => {
      await (await LobbyPage.navHome).click();
      await LobbyPage.selectSport(sport);

      const success = await EntryPage.buildAndSubmitEntry({
        pickCount: 3,
        entryType: 'standard',
        amount: LogicalAmounts.standard3pick,
      });
      expect(success).toBe(true);
    });
  }

  // ── Insured entry ───────────────────────────────────────────
  it('REG-ENTRY-002: Insured 4-pick entry', async () => {
    await (await LobbyPage.navHome).click();
    await LobbyPage.selectSport(Sports.nba);

    const success = await EntryPage.buildAndSubmitEntry({
      pickCount: 4,
      entryType: 'insured',
      amount: LogicalAmounts.insured4pick,
    });
    expect(success).toBe(true);
  });

  // ── Bench Player entry ──────────────────────────────────────
  it('REG-ENTRY-003: Bench Player 5-pick entry with Jungle Prize', async () => {
    await (await LobbyPage.navHome).click();
    await LobbyPage.selectSport(Sports.nfl);

    const success = await EntryPage.buildAndSubmitEntry({
      pickCount: 5,
      entryType: 'benchPlayer',
      junglePrize: true,
      amount: LogicalAmounts.benchPlayer5pickJungle,
    });
    expect(success).toBe(true);
  });

  // ── Jungle H2H Auto-Match ──────────────────────────────────
  it('REG-ENTRY-004: Jungle H2H Standard entry with auto-match', async () => {
    await (await LobbyPage.navHome).click();
    await LobbyPage.selectSport(Sports.nba);

    // Select picks
    for (let i = 0; i < 3; i++) {
      await EntryPage.selectAthlete(i);
      await EntryPage.waitForAnimations(300);
    }
    await EntryPage.selectEntryType('standard');
    await EntryPage.selectAutoMatch();
    await EntryPage.setEntryAmount(LogicalAmounts.standard3pick);
    await EntryPage.submitEntry();
    await EntryPage.confirmEntry();
    expect(await EntryPage.isEntrySuccessful()).toBe(true);
  });

  // ── Jungle Prize toggle ─────────────────────────────────────
  it('REG-ENTRY-005: Jungle Prize can be added to a lineup', async () => {
    await (await LobbyPage.navHome).click();
    await LobbyPage.selectSport(Sports.nba);

    await EntryPage.selectAthlete(0);
    await EntryPage.selectAthlete(1);
    await EntryPage.selectAthlete(2);

    await EntryPage.toggleJunglePrize();
    expect(await EntryPage.isJunglePrizeEnabled()).toBe(true);
  });

  // ── Pick classification counts ──────────────────────────────
  it('REG-ENTRY-006: Coconut and banana pick counts are accurate', async () => {
    await (await LobbyPage.navHome).click();
    await LobbyPage.selectSport(Sports.nba);

    for (let i = 0; i < 3; i++) {
      await EntryPage.selectAthlete(i);
      await EntryPage.waitForAnimations(300);
    }

    const coconuts = await EntryPage.countCoconutPicks();
    const bananas = await EntryPage.countBananaPicks();
    const total = coconuts + bananas;
    expect(total).toBe(await EntryPage.getPickCount());
  });

  // ── Verify scheduled events exist ───────────────────────────
  it('REG-ENTRY-007: Scheduled events exist for all active sports', async () => {
    for (const [, sport] of Object.entries(Sports).slice(0, 4)) {
      await (await LobbyPage.navHome).click();
      await LobbyPage.selectSport(sport);
      const tileCount = await LobbyPage.getPlayerTileCount();
      expect(tileCount).toBeGreaterThan(0);
    }
  });

  // ── Entry appears in My Entries ─────────────────────────────
  it('REG-ENTRY-008: Submitted entry appears in My Entries / live entries', async () => {
    await LobbyPage.navigateToMyEntries();
    const liveCount = await MyEntriesPage.getLiveEntryCount();
    expect(liveCount).toBeGreaterThan(0);
  });

  // ── Transactions created ────────────────────────────────────
  it('REG-ENTRY-009: Entry creates corresponding transaction record', async () => {
    await LobbyPage.navigateToMyEntries();
    await MyEntriesPage.openLiveEntry();
    const hasPayment = await MyEntriesPage.isDisplayed('~entry_payment_summary');
    expect(hasPayment).toBe(true);
  });
});
