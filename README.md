# 🌴 FlexBets QA Environment

Full QA environment for the FlexBets DFS mobile app (iOS & Android) using **BrowserStack App Automate** with **WebDriverIO + Appium (TypeScript)**.

Built from the FlexBets Testing Spreadsheet — all test stories from the "Prelaunch Testing Stories" and "Tutorial stories" sheets are covered.

## Architecture

```
flexbets-qa/
├── config/                      # WDIO configurations
│   ├── wdio.base.conf.ts        #   Shared (reporters, hooks, timeouts)
│   ├── wdio.android.conf.ts     #   Local Android emulator
│   ├── wdio.ios.conf.ts         #   Local iOS simulator
│   ├── wdio.android.bs.conf.ts  #   BrowserStack Android (4-device matrix)
│   └── wdio.ios.bs.conf.ts      #   BrowserStack iOS (4-device matrix)
├── pages/                       # Page Object Model
│   ├── BasePage.ts              #   Cross-platform helpers
│   ├── LoginPage.ts             #   Auth & sign-up
│   ├── LobbyPage.ts             #   Main lobby, tiles, filters, search, nav
│   ├── EntryPage.ts             #   Picks, entry types, jungle prize, H2H
│   └── AppPages.ts              #   Chat, Referral, Promo, Leaderboard, Account,
│                                #   RG, Financial, Teams, Player Stats, My Entries
├── tests/
│   ├── smoke/                   # Critical path (every PR)
│   │   └── critical-path.test.ts
│   ├── regression/              # Full regression (nightly)
│   │   ├── entries.test.ts      #   All entry types, sports, transactions
│   │   └── features.test.ts     #   Filters, chat, referrals, promos, RG, teams
│   └── e2e/                     # End-to-end journeys
│       ├── geo-compliance.test.ts  # Restricted states, deposit limits, native land
│       └── user-journey.test.ts    # Sign-up → deposit → entry → live → withdrawal
├── fixtures/test-data.ts        # Logical entry amounts, sports, geo, test users
├── scripts/upload-app.ts        # Upload APK/IPA to BrowserStack
├── .github/workflows/qa-pipeline.yml  # CI/CD pipeline
├── MANUAL-TESTING.md            # BrowserStack Live manual testing guide
└── .env.example                 # Environment template
```

## Test Coverage → Spreadsheet Stories

| Spreadsheet Story | Test File | Test IDs |
|---|---|---|
| Entry break test — NBA 3-pick Standard | smoke, regression/entries | SMOKE-003, REG-ENTRY-001 |
| Jungle H2H — Standard Auto-Match | regression/entries | REG-ENTRY-004 |
| Jungle Prize Entry | regression/entries | REG-ENTRY-005 |
| Verify no past/live markets | smoke | SMOKE-004 |
| Verify scheduled events — All sports | regression/entries | REG-ENTRY-007 |
| Test Markets Filters | regression/features | REG-FILTER-001–004 |
| Main Lobby and Contests | smoke | SMOKE-001 |
| Nav Bar testing | smoke | SMOKE-002 |
| In App messages and chats | smoke, regression/features | SMOKE-005, REG-CHAT-001 |
| Test banned words in chat | regression/features | REG-CHAT-002 |
| Refer a friend (text/email/social) | regression/features | REG-REFER-001–003 |
| Promotional code | smoke, regression/features | SMOKE-006, REG-PROMO-001–002 |
| Update user settings | regression/features | REG-SETTINGS-001 |
| Viewing Leaderboards | regression/features | REG-LEADER-001 |
| My Account Screen | regression/features | REG-ACCOUNT-001 |
| Responsible Gaming & Limits | regression/features | REG-RG-001–002 |
| Player stats | regression/features | REG-STATS-001 |
| Teams & Competitions | regression/features | REG-TEAMS-001–002 |
| Create account in restricted state | e2e/geo-compliance | E2E-GEO-001–004 |
| Deposit limit (TN $2500 / MA $1000) | e2e/geo-compliance | E2E-DEPOSIT-001–003 |
| Native land restriction | e2e/geo-compliance | E2E-GEO-005–007 |
| Creating an account | e2e/user-journey | E2E-JOURNEY-001 |
| Deposit ACH / Credit Card | e2e/user-journey | E2E-JOURNEY-002–003 |
| View live entries | e2e/user-journey | E2E-JOURNEY-004 |
| Canceled games / DNP | e2e/user-journey | E2E-JOURNEY-005 |
| Request a withdrawal | e2e/user-journey | E2E-JOURNEY-006 |

## Logical Entry Amount Encoding

```
$HTO.cb
 H = Entry type    (1=Standard, 2=Insured, 3=Bench Player)
 T = # of picks    (3–8)
 O = Jungle Prize  (1=yes, 0=no)
 c = # coconut picks
 b = # banana picks

Example: $130.21 → Standard, 3-pick, no Jungle, 2 coconut, 1 banana
Example: $451.00 → Bench Player, 5-pick, Jungle Prize, 0 coconut, 0 banana
```

Helper functions in `fixtures/test-data.ts`: `buildLogicalEntryAmount()` and `decodeLogicalEntryAmount()`.

## Quick Start

```bash
npm install
cp .env.example .env           # Fill in BrowserStack creds + test users
npm run upload:app:android     # Upload APK to BrowserStack
npm run upload:app:ios         # Upload IPA to BrowserStack
npm run test:smoke             # Smoke tests on BrowserStack
npm run test:all:bs            # Full run (all suites, both platforms)
npm run generate:report        # View Allure report
```

## Video & Transcript Assets

Most test stories have associated recordings and transcripts (mapped in `fixtures/test-data.ts` → `TestAssets`). Store these alongside the project for reference. When you're ready to share them, I can process the transcripts to extract detailed step-by-step automation primitives.

## Device Matrix (BrowserStack)

| Platform | Device | OS | Category |
|---|---|---|---|
| Android | Samsung Galaxy S24 Ultra | 14.0 | Flagship |
| Android | Samsung Galaxy A54 | 13.0 | Mid-range |
| Android | Google Pixel 8 | 14.0 | Flagship |
| Android | Samsung Galaxy S21 | 12.0 | Legacy |
| iOS | iPhone 15 Pro Max | 17 | Flagship |
| iOS | iPhone 14 | 16 | Current |
| iOS | iPhone SE 2022 | 16 | Small screen |
| iOS | iPad Pro 12.9 2022 | 16 | Tablet |

## CI/CD Pipeline

| Trigger | Suite | Platforms |
|---|---|---|
| PR / push | Smoke | Android + iOS |
| Nightly 2 AM UTC | Regression + E2E | Android + iOS |
| Manual dispatch | Configurable | Configurable |

Allure reports auto-publish to GitHub Pages and link in PR comments.
