/**
 * SMOKE SUITE — Critical prelaunch break checks.
 * Mapped from: Testing Spreadsheet → "Prelaunch Testing Stories"
 */
import LoginPage from '../../pages/LoginPage';
import LobbyPage from '../../pages/LobbyPage';
import EntryPage from '../../pages/EntryPage';
import { ChatPage, PromoPage } from '../../pages/AppPages';
import { Sports, LogicalAmounts } from '../../fixtures/test-data';

describe('FlexBets Smoke — Critical Path', () => {
  before(async () => {
    await LoginPage.skipOnboarding();
    await LoginPage.loginWithDefaults();
  });

  // ── Story: Main Lobby and Contests ──────────────────────────
  it('SMOKE-001: Lobby loads with player tiles, no empty or duplicate tiles', async () => {
    expect(await LobbyPage.isLobbyVisible()).toBe(true);
    expect(await LobbyPage.getPlayerTileCount()).toBeGreaterThan(0);
    expect(await LobbyPage.hasNoEmptyTiles()).toBe(true);
    expect(await LobbyPage.hasNoDuplicateTiles()).toBe(true);
  });

  // ── Story: Nav Bar testing ──────────────────────────────────
  it('SMOKE-002: All nav bar links are functional', async () => {
    await LobbyPage.navigateToMyEntries();
    expect(await LobbyPage.isDisplayed('~my_entries_header')).toBe(true);

    await LobbyPage.navigateToChat();
    expect(await LobbyPage.isDisplayed('~chat_header')).toBe(true);

    await LobbyPage.navigateToLeaderboard();
    expect(await LobbyPage.isDisplayed('~leaderboard_header')).toBe(true);

    await LobbyPage.navigateToProfile();
    expect(await LobbyPage.isDisplayed('~account_overview')).toBe(true);

    await (await LobbyPage.navHome).click();
    expect(await LobbyPage.isLobbyVisible()).toBe(true);
  });

  // ── Story: Entry break test — NBA 3-pick Standard ───────────
  it('SMOKE-003: Submit NBA 3-pick standard entry end-to-end', async () => {
    await LobbyPage.selectSport(Sports.nba);

    const success = await EntryPage.buildAndSubmitEntry({
      pickCount: 3,
      entryType: 'standard',
      amount: LogicalAmounts.standard3pick,
    });
    expect(success).toBe(true);
  });

  // ── Story: Verify no in progress or past markets in picks ───
  it('SMOKE-004: No in-progress or past-day markets in pick screens', async () => {
    await (await LobbyPage.navHome).click();

    for (const sport of [Sports.nba, Sports.nfl, Sports.mlb]) {
      await LobbyPage.selectSport(sport);
      expect(await EntryPage.hasNoPastOrLiveMarkets()).toBe(true);
    }
  });

  // ── Story: In App messages and chats ────────────────────────
  it('SMOKE-005: Team chat is accessible and messages can be sent', async () => {
    await LobbyPage.navigateToChat();
    await ChatPage.openTeamChat();
    await ChatPage.sendMessage('Smoke test message');
    const lastMsg = await ChatPage.getLastMessage();
    expect(lastMsg).toContain('Smoke test');
  });

  // ── Story: Using a promotional code ─────────────────────────
  it('SMOKE-006: Promo code can be applied', async () => {
    await (await LobbyPage.navHome).click();
    await LobbyPage.navigateViaMenu('Promo Code');
    await PromoPage.applyPromoCode('TESTPROMO');
    // Either succeeds or returns a meaningful error (not a crash)
    const applied = await PromoPage.isPromoApplied();
    const hasError = await PromoPage.isDisplayed('~promo_error_message', 3_000);
    expect(applied || hasError).toBe(true);
  });
});
