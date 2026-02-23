import BasePage from './BasePage';
import { EntryTypes } from '../fixtures/test-data';

class EntryPage extends BasePage {
  // ── Pick Screen ─────────────────────────────────────────────
  get athleteTiles()      { return $$(this.selector('athlete_tile')); }
  get selectedPicks()     { return $$(this.selector('selected_pick')); }
  get pickCounter()       { return $(this.selector('pick_counter')); }
  get clearPicksButton()  { return $(this.selector('clear_picks')); }

  // ── Entry Type Selection ────────────────────────────────────
  get standardEntryBtn()    { return $(this.selector('entry_type_standard')); }
  get insuredEntryBtn()     { return $(this.selector('entry_type_insured')); }
  get benchPlayerEntryBtn() { return $(this.selector('entry_type_bench_player')); }

  // ── Jungle Prize ────────────────────────────────────────────
  get junglePrizeToggle() { return $(this.selector('jungle_prize_toggle')); }
  get junglePrizeStatus() { return $(this.selector('jungle_prize_status')); }

  // ── Pick Classification (coconut / banana) ──────────────────
  get coconutIndicator()  { return $(this.selector('pick_classification_coconut')); }
  get bananaIndicator()   { return $(this.selector('pick_classification_banana')); }

  // ── H2H / Contest Mode ──────────────────────────────────────
  get autoMatchBtn()      { return $(this.selector('contest_auto_match')); }
  get friendMatchBtn()    { return $(this.selector('contest_friend_match')); }
  get h2hToggle()         { return $(this.selector('h2h_toggle')); }

  // ── Entry Submission ────────────────────────────────────────
  get entryAmountInput()  { return $(this.selector('entry_amount_input')); }
  get submitEntryBtn()    { return $(this.selector('submit_entry_button')); }
  get confirmEntryBtn()   { return $(this.selector('confirm_entry_button')); }
  get entrySuccessMsg()   { return $(this.selector('entry_success_message')); }
  get entryErrorMsg()     { return $(this.selector('entry_error_message')); }

  // ── Game Schedule Filter ────────────────────────────────────
  get gameScheduleFilter() { return $(this.selector('game_schedule_filter')); }

  // ── Actions ─────────────────────────────────────────────────
  async selectAthlete(index: number) {
    const tiles = await this.athleteTiles;
    if (tiles[index]) await tiles[index].click();
  }

  async selectAthleteByName(name: string) {
    await this.scrollToText(name);
    await this.waitAndTap(`~athlete_${name.toLowerCase().replace(/\s+/g, '_')}`);
  }

  async getPickCount(): Promise<number> {
    const text = await this.getText('~pick_counter');
    return parseInt(text.replace(/[^0-9]/g, ''), 10);
  }

  async selectEntryType(type: keyof typeof EntryTypes) {
    const selectors: Record<string, string> = {
      standard: '~entry_type_standard',
      insured: '~entry_type_insured',
      benchPlayer: '~entry_type_bench_player',
    };
    await this.waitAndTap(selectors[type]);
  }

  async toggleJunglePrize() {
    await this.waitAndTap('~jungle_prize_toggle');
  }

  async isJunglePrizeEnabled(): Promise<boolean> {
    const status = await this.getText('~jungle_prize_status');
    return status.toLowerCase().includes('on') || status.toLowerCase().includes('enabled');
  }

  async setEntryAmount(amount: string) {
    await this.waitAndType('~entry_amount_input', amount);
  }

  async selectAutoMatch() {
    await this.waitAndTap('~contest_auto_match');
  }

  async selectFriendMatch() {
    await this.waitAndTap('~contest_friend_match');
  }

  async useGameScheduleFilter(game: string) {
    await this.waitAndTap('~game_schedule_filter');
    await this.waitAndTap(`~game_option_${game.toLowerCase().replace(/\s+/g, '_')}`);
  }

  async submitEntry() {
    await this.waitAndTap('~submit_entry_button');
    await this.waitForAnimations();
  }

  async confirmEntry() {
    await this.waitAndTap('~confirm_entry_button');
  }

  async isEntrySuccessful(): Promise<boolean> {
    return this.isDisplayed('~entry_success_message', 10_000);
  }

  async getEntryError(): Promise<string> {
    return this.getText('~entry_error_message');
  }

  /** Full flow: select picks → set type → set amount → submit → confirm */
  async buildAndSubmitEntry(opts: {
    pickCount: number;
    entryType: keyof typeof EntryTypes;
    junglePrize?: boolean;
    amount: string;
    autoMatch?: boolean;
  }): Promise<boolean> {
    // Select picks
    for (let i = 0; i < opts.pickCount; i++) {
      await this.selectAthlete(i);
      await this.waitForAnimations(300);
    }
    // Set entry type
    await this.selectEntryType(opts.entryType);
    // Jungle Prize
    if (opts.junglePrize) await this.toggleJunglePrize();
    // Auto-match
    if (opts.autoMatch) await this.selectAutoMatch();
    // Amount & submit
    await this.setEntryAmount(opts.amount);
    await this.submitEntry();
    await this.confirmEntry();
    return this.isEntrySuccessful();
  }

  // ── Verification: no past/live markets in picks ─────────────
  async hasNoPastOrLiveMarkets(): Promise<boolean> {
    const inProgress = await this.isDisplayed('~market_in_progress_indicator', 2_000);
    const pastDay = await this.isDisplayed('~market_past_day_indicator', 2_000);
    return !inProgress && !pastDay;
  }

  /** Count how many athlete tiles have the coconut classification visible. */
  async countCoconutPicks(): Promise<number> {
    const picks = await this.selectedPicks;
    let count = 0;
    for (const pick of picks) {
      const coconut = await pick.$(this.selector('pick_classification_coconut'));
      if (await coconut.isDisplayed()) count++;
    }
    return count;
  }

  async countBananaPicks(): Promise<number> {
    const picks = await this.selectedPicks;
    let count = 0;
    for (const pick of picks) {
      const banana = await pick.$(this.selector('pick_classification_banana'));
      if (await banana.isDisplayed()) count++;
    }
    return count;
  }
}

export default new EntryPage();
