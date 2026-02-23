import BasePage from './BasePage';

// ── Chat Page ─────────────────────────────────────────────────
class ChatPageClass extends BasePage {
  get teamChatList()      { return $$(this.selector('team_chat_item')); }
  get chatInput()         { return $(this.selector('chat_message_input')); }
  get sendButton()        { return $(this.selector('chat_send_button')); }
  get chatMessages()      { return $$(this.selector('chat_message')); }
  get newChatIndicator()  { return $(this.selector('chat_new_indicator')); }
  get readReceipt()       { return $(this.selector('chat_read_receipt')); }
  get shareEntryBtn()     { return $(this.selector('chat_share_entry')); }
  get bannedWordError()   { return $(this.selector('chat_banned_word_error')); }

  async openTeamChat(index = 0) {
    const chats = await this.teamChatList;
    if (chats[index]) await chats[index].click();
  }

  async sendMessage(text: string) {
    await this.waitAndType('~chat_message_input', text);
    await this.waitAndTap('~chat_send_button');
  }

  async isBannedWordBlocked(): Promise<boolean> {
    return this.isDisplayed('~chat_banned_word_error', 5_000);
  }

  async getLastMessage(): Promise<string> {
    const msgs = await this.chatMessages;
    return msgs[msgs.length - 1]?.getText() || '';
  }

  async hasNewChatIndicator(): Promise<boolean> {
    return this.isDisplayed('~chat_new_indicator');
  }

  async isReadReceiptVisible(): Promise<boolean> {
    return this.isDisplayed('~chat_read_receipt');
  }

  async shareEntryToChat() {
    await this.waitAndTap('~chat_share_entry');
  }
}
export const ChatPage = new ChatPageClass();

// ── Referral Page ─────────────────────────────────────────────
class ReferralPageClass extends BasePage {
  get referTextBtn()     { return $(this.selector('refer_text_message')); }
  get referEmailBtn()    { return $(this.selector('refer_email')); }
  get referSocialBtn()   { return $(this.selector('refer_social_media')); }
  get referralCode()     { return $(this.selector('referral_code_display')); }
  get referralSuccess()  { return $(this.selector('referral_success_message')); }

  async referViaText() { await this.waitAndTap('~refer_text_message'); }
  async referViaEmail() { await this.waitAndTap('~refer_email'); }
  async referViaSocial() { await this.waitAndTap('~refer_social_media'); }

  async getReferralCode(): Promise<string> {
    return this.getText('~referral_code_display');
  }

  async isReferralSent(): Promise<boolean> {
    return this.isDisplayed('~referral_success_message', 10_000);
  }
}
export const ReferralPage = new ReferralPageClass();

// ── Promo Code Page ───────────────────────────────────────────
class PromoPageClass extends BasePage {
  get promoCodeInput()   { return $(this.selector('promo_code_input')); }
  get applyPromoBtn()    { return $(this.selector('promo_apply_button')); }
  get promoSuccess()     { return $(this.selector('promo_success_message')); }
  get promoError()       { return $(this.selector('promo_error_message')); }
  get promoBalanceBanner() { return $(this.selector('promo_balance_banner')); }

  async applyPromoCode(code: string) {
    await this.waitAndType('~promo_code_input', code);
    await this.waitAndTap('~promo_apply_button');
  }

  async isPromoApplied(): Promise<boolean> {
    return this.isDisplayed('~promo_success_message', 5_000);
  }

  async getPromoError(): Promise<string> {
    return this.getText('~promo_error_message');
  }

  async isPromoBannerVisible(): Promise<boolean> {
    return this.isDisplayed('~promo_balance_banner');
  }
}
export const PromoPage = new PromoPageClass();

// ── Leaderboard Page ──────────────────────────────────────────
class LeaderboardPageClass extends BasePage {
  get leaderboardList()   { return $$(this.selector('leaderboard_entry')); }
  get seasonToggle()      { return $(this.selector('leaderboard_season_toggle')); }
  get currentSeason()     { return $(this.selector('leaderboard_current_season')); }

  async toggleSeason() { await this.waitAndTap('~leaderboard_season_toggle'); }
  async selectSeason(season: string) {
    await this.toggleSeason();
    await this.waitAndTap(`~leaderboard_season_${season}`);
  }
  async getLeaderboardCount(): Promise<number> {
    return (await this.leaderboardList).length;
  }
}
export const LeaderboardPage = new LeaderboardPageClass();

// ── Account / Profile Page ────────────────────────────────────
class AccountPageClass extends BasePage {
  get overviewSection()   { return $(this.selector('account_overview')); }
  get picksSection()      { return $(this.selector('account_picks')); }
  get statsSection()      { return $(this.selector('account_stats')); }
  get badgesSection()     { return $(this.selector('account_badges')); }
  get settingsButton()    { return $(this.selector('account_settings_btn')); }

  // Account Settings
  get myInfoSection()     { return $(this.selector('settings_my_info')); }
  get blockedUsersBtn()   { return $(this.selector('settings_blocked_users')); }
  get changePasswordBtn() { return $(this.selector('settings_change_password')); }
  get savedPaymentsBtn()  { return $(this.selector('settings_saved_payments')); }
  get notificationsToggle() { return $(this.selector('settings_notifications')); }
  get promoEmailsToggle() { return $(this.selector('settings_promo_emails')); }
  get rememberDeviceToggle() { return $(this.selector('settings_remember_device')); }
  get deleteAccountBtn()  { return $(this.selector('settings_delete_account')); }
  get shareReferralBtn()  { return $(this.selector('settings_share_referral')); }

  // User settings (address, phone, email)
  get addressInput()      { return $(this.selector('settings_address_input')); }
  get mobileInput()       { return $(this.selector('settings_mobile_input')); }
  get emailInput()        { return $(this.selector('settings_email_input')); }
  get saveSettingsBtn()   { return $(this.selector('settings_save_button')); }

  // Followers / Following
  get followersTab()      { return $(this.selector('account_followers_tab')); }
  get followingTab()      { return $(this.selector('account_following_tab')); }
  get followButton()      { return $(this.selector('follow_user_button')); }
  get unfollowButton()    { return $(this.selector('unfollow_user_button')); }

  async openSettings() { await this.waitAndTap('~account_settings_btn'); }

  async updateAddress(address: string) {
    await this.waitAndType('~settings_address_input', address);
  }
  async updateMobile(phone: string) {
    await this.waitAndType('~settings_mobile_input', phone);
  }
  async updateEmail(email: string) {
    await this.waitAndType('~settings_email_input', email);
  }
  async saveSettings() { await this.waitAndTap('~settings_save_button'); }
}
export const AccountPage = new AccountPageClass();

// ── Responsible Gaming Page ───────────────────────────────────
class ResponsibleGamingPageClass extends BasePage {
  get depositLimitInput()  { return $(this.selector('rg_deposit_limit')); }
  get entryLimitInput()    { return $(this.selector('rg_entry_limit')); }
  get selfExclusionBtn()   { return $(this.selector('rg_self_exclusion')); }
  get coolOffBtn()         { return $(this.selector('rg_cool_off')); }
  get helpSupportLink()    { return $(this.selector('rg_help_support')); }
  get saveLimitsBtn()      { return $(this.selector('rg_save_limits')); }

  async setDepositLimit(amount: string) {
    await this.waitAndType('~rg_deposit_limit', amount);
    await this.waitAndTap('~rg_save_limits');
  }
  async setEntryLimit(amount: string) {
    await this.waitAndType('~rg_entry_limit', amount);
    await this.waitAndTap('~rg_save_limits');
  }
  async activateSelfExclusion() { await this.waitAndTap('~rg_self_exclusion'); }
  async activateCoolOff()       { await this.waitAndTap('~rg_cool_off'); }
  async isHelpLinkVisible(): Promise<boolean> { return this.isDisplayed('~rg_help_support'); }
}
export const ResponsibleGamingPage = new ResponsibleGamingPageClass();

// ── Deposit / Withdrawal Page ─────────────────────────────────
class FinancialPageClass extends BasePage {
  get achDepositBtn()     { return $(this.selector('deposit_ach')); }
  get creditCardBtn()     { return $(this.selector('deposit_credit_card')); }
  get depositAmountInput(){ return $(this.selector('deposit_amount_input')); }
  get submitDepositBtn()  { return $(this.selector('deposit_submit')); }
  get depositSuccess()    { return $(this.selector('deposit_success_message')); }
  get depositError()      { return $(this.selector('deposit_error_message')); }
  get withdrawBtn()       { return $(this.selector('withdraw_button')); }
  get withdrawAmountInput(){ return $(this.selector('withdraw_amount_input')); }
  get withdrawSubmitBtn() { return $(this.selector('withdraw_submit')); }
  get withdrawEligibilityMsg() { return $(this.selector('withdraw_eligibility')); }
  get geoBlockMessage()   { return $(this.selector('geo_block_message')); }

  async depositViaACH(amount: string) {
    await this.waitAndTap('~deposit_ach');
    await this.waitAndType('~deposit_amount_input', amount);
    await this.waitAndTap('~deposit_submit');
  }

  async depositViaCreditCard(amount: string) {
    await this.waitAndTap('~deposit_credit_card');
    await this.waitAndType('~deposit_amount_input', amount);
    await this.waitAndTap('~deposit_submit');
  }

  async requestWithdrawal(amount: string) {
    await this.waitAndTap('~withdraw_button');
    await this.waitAndType('~withdraw_amount_input', amount);
    await this.waitAndTap('~withdraw_submit');
  }

  async isDepositSuccessful(): Promise<boolean> {
    return this.isDisplayed('~deposit_success_message', 10_000);
  }

  async getDepositError(): Promise<string> {
    return this.getText('~deposit_error_message');
  }

  async isGeoBlocked(): Promise<boolean> {
    return this.isDisplayed('~geo_block_message', 5_000);
  }
}
export const FinancialPage = new FinancialPageClass();

// ── Teams Page ────────────────────────────────────────────────
class TeamsPageClass extends BasePage {
  get createTeamBtn()     { return $(this.selector('create_team_button')); }
  get teamNameInput()     { return $(this.selector('team_name_input')); }
  get teamPrivacyToggle() { return $(this.selector('team_privacy_toggle')); }
  get teamShirtDesigner() { return $(this.selector('team_shirt_designer')); }
  get startCompetitionBtn(){ return $(this.selector('start_competition_button')); }
  get competitionSettings(){ return $(this.selector('competition_settings')); }
  get captainBadge()      { return $(this.selector('captain_badge')); }

  async createTeam(name: string) {
    await this.waitAndTap('~create_team_button');
    await this.waitAndType('~team_name_input', name);
  }

  async togglePrivacy() { await this.waitAndTap('~team_privacy_toggle'); }
  async openShirtDesigner() { await this.waitAndTap('~team_shirt_designer'); }
  async startCompetition() { await this.waitAndTap('~start_competition_button'); }
}
export const TeamsPage = new TeamsPageClass();

// ── Player Stats Page ─────────────────────────────────────────
class PlayerStatsPageClass extends BasePage {
  get playerName()        { return $(this.selector('player_stats_name')); }
  get playerDetails()     { return $(this.selector('player_stats_details')); }
  get marketSelections()  { return $$(this.selector('player_market_selection')); }
  get gameCountdown()     { return $(this.selector('player_game_countdown')); }

  async hasStats(): Promise<boolean> {
    return this.isDisplayed('~player_stats_details');
  }
  async hasMarketSelections(): Promise<boolean> {
    return (await this.marketSelections).length > 0;
  }
  async isGameCountdownVisible(): Promise<boolean> {
    return this.isDisplayed('~player_game_countdown');
  }
}
export const PlayerStatsPage = new PlayerStatsPageClass();

// ── My Entries Page ───────────────────────────────────────────
class MyEntriesPageClass extends BasePage {
  get liveEntries()       { return $$(this.selector('live_entry_item')); }
  get completedEntries()  { return $$(this.selector('completed_entry_item')); }
  get entryDetail()       { return $(this.selector('entry_detail_view')); }
  get canceledGameLabel() { return $(this.selector('entry_canceled_game')); }
  get didNotPlayLabel()   { return $(this.selector('entry_did_not_play')); }
  get paymentSummary()    { return $(this.selector('entry_payment_summary')); }

  async openLiveEntry(index = 0) {
    const entries = await this.liveEntries;
    if (entries[index]) await entries[index].click();
  }

  async getLiveEntryCount(): Promise<number> {
    return (await this.liveEntries).length;
  }

  async hasCanceledGameLabel(): Promise<boolean> {
    return this.isDisplayed('~entry_canceled_game');
  }

  async hasDidNotPlayLabel(): Promise<boolean> {
    return this.isDisplayed('~entry_did_not_play');
  }
}
export const MyEntriesPage = new MyEntriesPageClass();
