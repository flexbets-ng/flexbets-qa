/**
 * FlexBets Test Fixtures
 * ──────────────────────────────────────────────────────────────
 * Centralised test data aligned to the FlexBets DFS platform.
 *
 * LOGICAL ENTRY AMOUNT ENCODING (from Testing Spreadsheet):
 *   $HTO.cb  where:
 *     H (hundreds) = Entry type:  1=Standard, 2=Insured, 3=Bench Player
 *     T (tens)     = # of picks:  3..8
 *     O (ones)     = Jungle Prize: 1=yes, 0=no
 *     c (10-cents) = # coconut picks
 *     b (1-cent)   = # banana picks
 *
 *   Example: $130.21 → Standard, 3-pick, no Jungle Prize, 2 coconut, 1 banana
 */

// ── Entry Types ───────────────────────────────────────────────
export const EntryTypes = {
  standard: { code: 1, label: 'Standard' },
  insured: { code: 2, label: 'Insured' },
  benchPlayer: { code: 3, label: 'Bench Player' },
} as const;

// ── Pick Classifications ──────────────────────────────────────
export const PickClassifications = {
  coconut: 'coconut',
  banana: 'banana',
} as const;

// ── Logical Entry Amount Builder ──────────────────────────────
export function buildLogicalEntryAmount(opts: {
  entryType: keyof typeof EntryTypes;
  numPicks: number;       // 3–8
  junglePrize: boolean;
  coconutPicks: number;
  bananaPicks: number;
}): string {
  const hundreds = EntryTypes[opts.entryType].code;
  const tens = opts.numPicks;
  const ones = opts.junglePrize ? 1 : 0;
  const tenCents = opts.coconutPicks;
  const oneCent = opts.bananaPicks;
  const dollars = hundreds * 100 + tens * 10 + ones;
  const cents = tenCents * 10 + oneCent;
  return `$${dollars}.${cents.toString().padStart(2, '0')}`;
}

/** Decode a logical entry amount string back to its components. */
export function decodeLogicalEntryAmount(amount: string) {
  const num = parseFloat(amount.replace('$', ''));
  const dollars = Math.floor(num);
  const cents = Math.round((num - dollars) * 100);
  return {
    entryType: Math.floor(dollars / 100) as 1 | 2 | 3,
    numPicks: Math.floor((dollars % 100) / 10),
    junglePrize: (dollars % 10) === 1,
    coconutPicks: Math.floor(cents / 10),
    bananaPicks: cents % 10,
  };
}

// ── Prebuilt Logical Amounts for Common Scenarios ─────────────
export const LogicalAmounts = {
  /** Standard, 3-pick, no Jungle, 2 coconut, 1 banana */
  standard3pick: '$130.21',
  /** Insured, 4-pick, no Jungle, 2 coconut, 1 banana */
  insured4pick: '$240.21',
  /** Bench Player, 5-pick, Jungle Prize, 0 coconut, 0 banana */
  benchPlayer5pickJungle: '$451.00',
  /** Standard, 4-pick, Jungle Prize, 3 coconut, 1 banana */
  standard4pickJungle: '$141.31',
  /** Standard, 6-pick, no Jungle, 4 coconut, 2 banana */
  standard6pick: '$160.42',
  /** Insured, 3-pick, no Jungle, 1 coconut, 2 banana */
  insured3pick: '$230.12',
} as const;

// ── Supported Sports ──────────────────────────────────────────
export const Sports = {
  nba: 'NBA',
  nfl: 'NFL',
  mlb: 'MLB',
  nhl: 'NHL',
  cfb: 'CFB',     // College Football
  cbb: 'CBB',     // College Basketball
  soccer: 'Soccer',
  mma: 'MMA',
  golf: 'Golf',
  nascar: 'NASCAR',
} as const;

// ── Market Types ──────────────────────────────────────────────
export const Markets = {
  points: 'Points',
  rebounds: 'Rebounds',
  assists: 'Assists',
  threes: '3-Pointers Made',
  strikeouts: 'Strikeouts',
  passingYards: 'Passing Yards',
  rushingYards: 'Rushing Yards',
  receptions: 'Receptions',
  goals: 'Goals',
  saves: 'Saves',
  fantasyScore: 'Fantasy Score',
} as const;

// ── Entry / Contest Modes ─────────────────────────────────────
export const ContestModes = {
  standard: 'Standard',
  headToHead: 'Head-to-Head',
  jungleH2H: 'Jungle H2H',
  autoMatch: 'Auto-Match',
  friendMatch: 'Friend Match',
} as const;

// ── Test Users (using MailSlurp qa.flexbets.io mailboxes) ─────
// Automation: qa1–qa10    |    App Live: live1, live2
export const TestUsers = {
  /** Primary automated test user — uses qa1 mailbox */
  primary: {
    email: process.env.FLEXBETS_TEST_USER_EMAIL || 'qa1@qa.flexbets.io',
    password: process.env.FLEXBETS_TEST_USER_PASSWORD || 'TestPass123!',
    pin: process.env.FLEXBETS_TEST_USER_PIN || '1234',
    state: 'CO',
    mailbox: 'auto1' as const,
  },
  /** Sign-up tests — uses qa2 (fresh for each run) */
  signUp: {
    email: 'qa2@qa.flexbets.io',
    password: 'NewUser123!',
    mailbox: 'auto2' as const,
  },
  /** Referral sender — uses qa3 */
  referralSender: {
    email: 'qa3@qa.flexbets.io',
    password: 'TestPass123!',
    mailbox: 'auto3' as const,
  },
  /** Referral recipient — uses qa4 (receives invite emails) */
  referralRecipient: {
    email: 'qa4@qa.flexbets.io',
    mailbox: 'auto4' as const,
  },
  /** Password reset test — uses qa5 */
  passwordReset: {
    email: 'qa5@qa.flexbets.io',
    password: 'TestPass123!',
    mailbox: 'auto5' as const,
  },
  /** Restricted state (WA) — uses qa6 */
  restrictedState: {
    email: 'qa6@qa.flexbets.io',
    password: 'TestPass123!',
    state: 'WA',
    mailbox: 'auto6' as const,
  },
  /** TN resident ($2500 deposit limit) — uses qa7 */
  tnResident: {
    email: 'qa7@qa.flexbets.io',
    password: 'TestPass123!',
    state: 'TN',
    mailbox: 'auto7' as const,
  },
  /** MA resident ($1000 deposit limit) — uses qa8 */
  maResident: {
    email: 'qa8@qa.flexbets.io',
    password: 'TestPass123!',
    state: 'MA',
    mailbox: 'auto8' as const,
  },
  /** Native land test — uses qa9 */
  nativeLand: {
    email: 'qa9@qa.flexbets.io',
    password: 'TestPass123!',
    mailbox: 'auto9' as const,
  },
  /** Spare automation account — qa10 */
  spare: {
    email: 'qa10@qa.flexbets.io',
    password: 'TestPass123!',
    mailbox: 'auto10' as const,
  },
  /** BrowserStack App Live — manual testing account 1 */
  appLive1: {
    email: 'live1@qa.flexbets.io',
    mailbox: 'live1' as const,
  },
  /** BrowserStack App Live — manual testing account 2 */
  appLive2: {
    email: 'live2@qa.flexbets.io',
    mailbox: 'live2' as const,
  },
} as const;

// ── Geo / Compliance ──────────────────────────────────────────
export const GeoLocations = {
  colorado: { lat: 39.7392, lng: -104.9903, state: 'CO', allowed: true },
  washington: { lat: 47.6062, lng: -122.3321, state: 'WA', allowed: false },
  tennessee: { lat: 36.1627, lng: -86.7816, state: 'TN', allowed: true, depositLimit: 2500 },
  massachusetts: { lat: 42.3601, lng: -71.0589, state: 'MA', allowed: true, depositLimit: 1000 },
  /** Native land inside CO — restricted */
  nativeLandCO: { lat: 36.999996649026116, lng: -108.24975540628697, allowed: false },
  newJersey: { lat: 40.7128, lng: -74.0060, state: 'NJ', allowed: true, depositLimit: 6000 },
} as const;

// ── Deposit Limits ────────────────────────────────────────────
export const DepositLimits = {
  TN: 2500,
  MA: 1000,
  default: 6000,
} as const;

// ── Device Matrix ─────────────────────────────────────────────
export const DeviceMatrix = {
  android: [
    { name: 'Samsung Galaxy S24 Ultra', os: '14.0', category: 'flagship' },
    { name: 'Samsung Galaxy A54', os: '13.0', category: 'mid-range' },
    { name: 'Google Pixel 8', os: '14.0', category: 'flagship' },
    { name: 'Samsung Galaxy S21', os: '12.0', category: 'legacy' },
  ],
  ios: [
    { name: 'iPhone 15 Pro Max', os: '17', category: 'flagship' },
    { name: 'iPhone 14', os: '16', category: 'current' },
    { name: 'iPhone SE 2022', os: '16', category: 'small-screen' },
    { name: 'iPad Pro 12.9 2022', os: '16', category: 'tablet' },
  ],
} as const;

// ── Banned Words (for chat filter tests) ──────────────────────
export const BannedWords = [
  'badword1', 'badword2', 'badword3',
  // Replace with actual banned word list from FlexBets moderation config
] as const;

// ── Test Spreadsheet File References ──────────────────────────
// Maps test story names to their associated video/transcript files
export const TestAssets: Record<string, { video?: string; transcript?: string }> = {
  'Entry break test - NBA 3-pick Standard': {
    video: 'Entry break test - NBA-20260111_122256-Meeting Recording.mp4',
    transcript: 'Entry break test - NBA.docx',
  },
  'Test Markets Filters': {
    video: 'test market filters.mp4',
    transcript: 'Test Market Filters.docx',
  },
  'In App messages and chats': {
    video: 'in app messages and chats.mp4',
    transcript: 'In App Messages and Chat.docx',
  },
  'Test banned words in chat': {
    video: 'Test banned words and chat.mp4',
    transcript: 'Test Banned words in Chat.docx',
  },
  'Update user settings': {
    transcript: 'Update User Settings Test.docx',
  },
  'Test ability to refer a friend - Text message': {
    video: 'Ability to Refer a Friend via Text Message Test.mp4',
    transcript: 'Ability to Refer a Friend via Text Message Test.docx',
  },
  'Test ability to refer a friend - email message': {
    video: 'Ability to Refer a Friend via Email Test.mp4',
    transcript: 'Ability to Refer a Friend via Email Test.docx',
  },
  'Test ability to refer a friend - social media message': {
    video: 'Refer a friend via social media.mp4',
    transcript: 'Test ability to refer a friend - Social media.docx',
  },
  'Using a promotional code within an app': {
    video: 'use and apply a promo code.mp4',
    transcript: 'Using a promotional code within an app.docx',
  },
  'Viewing Leaderboards': {
    video: 'My Account Screen Transcript.docx',
    transcript: 'Viewing leaderboards.docx',
  },
  'My Account Screen': {
    video: 'My account screen.mp4',
    transcript: 'My Account Screen Transcript.docx',
  },
};
