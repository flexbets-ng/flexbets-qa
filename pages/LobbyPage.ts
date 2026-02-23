import BasePage from './BasePage';

class LobbyPage extends BasePage {
  // ── Nav Bar / Hamburger Menu ────────────────────────────────
  get navHome()        { return $(this.selector('nav_home')); }
  get navMyEntries()   { return $(this.selector('nav_my_entries')); }
  get navChat()        { return $(this.selector('nav_chat')); }
  get navLeaderboard() { return $(this.selector('nav_leaderboard')); }
  get navProfile()     { return $(this.selector('nav_profile')); }
  get hamburgerMenu()  { return $(this.selector('hamburger_menu')); }

  // ── Lobby Elements ──────────────────────────────────────────
  get playerTiles()    { return $$(this.selector('player_tile')); }
  get calendarFilter() { return $(this.selector('calendar_filter')); }
  get searchBar()      { return $(this.selector('lobby_search_bar')); }
  get searchInput()    { return $(this.selector('search_input')); }
  get sportFilter()    { return $(this.selector('sport_filter')); }
  get gameFilter()     { return $(this.selector('game_filter')); }
  get startTimeSort()  { return $(this.selector('sort_start_time')); }
  get hotPicks()       { return $(this.selector('hot_picks_section')); }
  get balanceDisplay() { return $(this.selector('balance_display')); }
  get depositButton()  { return $(this.selector('deposit_button')); }

  // ── Actions ─────────────────────────────────────────────────
  async isLobbyVisible(): Promise<boolean> {
    return this.isDisplayed('~player_tile');
  }

  async getBalance(): Promise<string> {
    return this.getText('~balance_display');
  }

  async getPlayerTileCount(): Promise<number> {
    return (await this.playerTiles).length;
  }

  async hasNoDuplicateTiles(): Promise<boolean> {
    const tiles = await this.playerTiles;
    const names: string[] = [];
    for (const tile of tiles) {
      names.push(await tile.getText());
    }
    return names.length === new Set(names).size;
  }

  async hasNoEmptyTiles(): Promise<boolean> {
    const tiles = await this.playerTiles;
    for (const tile of tiles) {
      const text = await tile.getText();
      if (!text || text.trim() === '') return false;
    }
    return true;
  }

  // ── Filters & Search ───────────────────────────────────────
  async selectSport(sport: string) {
    await this.waitAndTap('~sport_filter');
    await this.waitAndTap(`~sport_option_${sport.toLowerCase()}`);
    await this.waitForAnimations();
  }

  async selectCalendarDate(date: string) {
    await this.waitAndTap('~calendar_filter');
    await this.waitAndTap(`~calendar_date_${date}`);
  }

  async searchForPlayer(name: string) {
    await this.waitAndTap('~lobby_search_bar');
    await this.waitAndType('~search_input', name);
    await this.pause(1000);
  }

  async sortByGame() {
    await this.waitAndTap('~game_filter');
  }

  async sortByStartTime() {
    await this.waitAndTap('~sort_start_time');
  }

  // ── Navigation ──────────────────────────────────────────────
  async navigateToMyEntries() { await this.waitAndTap('~nav_my_entries'); }
  async navigateToChat()      { await this.waitAndTap('~nav_chat'); }
  async navigateToLeaderboard() { await this.waitAndTap('~nav_leaderboard'); }
  async navigateToProfile()   { await this.waitAndTap('~nav_profile'); }
  async openHamburgerMenu()   { await this.waitAndTap('~hamburger_menu'); }

  async navigateViaMenu(item: string) {
    await this.openHamburgerMenu();
    await this.waitAndTap(`~menu_item_${item.toLowerCase().replace(/\s+/g, '_')}`);
  }

  async tapDeposit() { await this.waitAndTap('~deposit_button'); }

  // ── Market / Pick Filters ──────────────────────────────────
  async selectMarketFilter(market: string) {
    await this.waitAndTap('~market_filter');
    await this.waitAndTap(`~market_option_${market.toLowerCase().replace(/\s+/g, '_')}`);
  }

  async selectTeamFilter(team: string) {
    await this.waitAndTap('~team_filter');
    await this.waitAndTap(`~team_option_${team}`);
  }

  async selectPositionFilter(position: string) {
    await this.waitAndTap('~position_filter');
    await this.waitAndTap(`~position_option_${position}`);
  }
}

export default new LobbyPage();
