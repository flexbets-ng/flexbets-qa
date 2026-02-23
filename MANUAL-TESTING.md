# BrowserStack Manual Testing Configuration — FlexBets

## Quick Access Links

| Tool                     | URL                                                         |
| ------------------------ | ----------------------------------------------------------- |
| App Live (manual)        | https://app-live.browserstack.com/                          |
| App Automate (automated) | https://app-automate.browserstack.com/                      |
| Test Observability       | https://observability.browserstack.com/                     |
| App Upload API           | https://api-cloud.browserstack.com/app-automate/upload      |

---

## Manual Testing Checklist — BrowserStack Live

Upload your staging APK/IPA via the BrowserStack dashboard or the upload script
(`npm run upload:app:android` / `npm run upload:app:ios`), then launch
**App Live** and test on the devices listed below.

### Priority Device Matrix

| #  | Device                    | OS          | Why                                  |
| -- | ------------------------- | ----------- | ------------------------------------ |
| 1  | Samsung Galaxy S24 Ultra  | Android 14  | Top flagship, large screen           |
| 2  | iPhone 15 Pro Max         | iOS 17      | Top iOS flagship                     |
| 3  | Samsung Galaxy A54        | Android 13  | Popular mid-range, performance check |
| 4  | iPhone SE 2022            | iOS 16      | Small screen / layout edge cases     |
| 5  | Google Pixel 8            | Android 14  | Stock Android reference              |
| 6  | iPad Pro 12.9 2022        | iPadOS 16   | Tablet layout validation             |
| 7  | Samsung Galaxy S21        | Android 12  | Older OS backward compat             |
| 8  | iPhone 14                 | iOS 16      | Mid-cycle flagship                   |

### Manual Test Scenarios

#### 1. Critical Path (every build)
- [ ] App launches without crash
- [ ] Login with valid credentials
- [ ] Home screen loads with balance and events
- [ ] Search for a team → results appear
- [ ] Navigate to a sport → events display
- [ ] Tap odds → bet slip updates
- [ ] Place a $1 straight bet → confirmation screen
- [ ] Check My Bets tab → bet appears
- [ ] Logout → returns to login screen

#### 2. FlexBet Feature (every build)
- [ ] Add 2+ selections to bet slip
- [ ] Switch to FlexBet tab
- [ ] Adjust flex legs slider
- [ ] Verify potential payout updates
- [ ] Place FlexBet → success confirmation
- [ ] Verify FlexBet in My Bets with correct details

#### 3. Geo & Compliance
- [ ] Test from a legal state (e.g., NJ, PA, CO) → app functions normally
- [ ] Test from restricted state (if testable) → geo-block message shown
- [ ] Age gate / responsible gaming links are visible
- [ ] Self-exclusion settings accessible from profile

#### 4. Edge Cases
- [ ] Kill the app mid-bet → reopen, no duplicate bets
- [ ] Background for 5 min → resume, session intact
- [ ] Rotate device → layout adapts
- [ ] Enable large font / accessibility → text scales properly
- [ ] Poor network (BrowserStack throttle: 3G) → loading states, no crashes
- [ ] Rapid tap on bet button → only one bet placed

#### 5. Push Notifications
- [ ] Receive bet result notification
- [ ] Receive promotion notification
- [ ] Tap notification → deep links to correct screen

---

## Network Throttling Profiles (BrowserStack)

Use these in App Live under "Network Conditions":

| Profile   | Download  | Upload  | Latency | Use Case               |
| --------- | --------- | ------- | ------- | ---------------------- |
| 4G LTE    | 20 Mbps   | 10 Mbps | 20 ms   | Normal usage           |
| 3G        | 1.5 Mbps  | 750 Kbps| 100 ms  | Stadium / crowded area |
| 2G        | 250 Kbps  | 50 Kbps | 300 ms  | Worst case / rural     |
| No Network| 0         | 0       | ∞       | Airplane mode          |

---

## BrowserStack Local (Staging Tunnel)

If the FlexBets staging API is behind a firewall:

```bash
# Download BrowserStack Local binary
# https://www.browserstack.com/local-testing/app-automate

# Start tunnel
./BrowserStackLocal --key $BROWSERSTACK_ACCESS_KEY --force-local

# Then set in .env:
BROWSERSTACK_LOCAL=true
```

---

## Reporting Bugs

When filing bugs from BrowserStack sessions:

1. **Session replay**: Copy the BrowserStack session URL (auto-recorded video + network logs)
2. **Device info**: Include exact device name + OS version
3. **Steps to reproduce**: Numbered steps from app launch
4. **Expected vs Actual**: Clear description
5. **Severity**: P0 (crash/data loss) → P3 (cosmetic)
6. **Screenshots**: BrowserStack auto-captures; annotate if needed

### Jira Integration

Bugs are filed to **flexbets.atlassian.net** (project key: `FLEX`).

- **Automated tests** auto-create Jira bugs on failure (deduped by test ID)
- **Manual bugs**: Create in Jira with label `qa-manual` and the device info
- BrowserStack session URLs are auto-linked to the Jira ticket

---

## QA Email Accounts (MailSlurp — qa.flexbets.io)

All QA email goes through MailSlurp with the `qa.flexbets.io` subdomain.

### For BrowserStack App Live (Manual Testing)

| Account | Email | Use |
| ------- | ----- | --- |
| Live 1 | `live1@qa.flexbets.io` | Primary manual testing account |
| Live 2 | `live2@qa.flexbets.io` | Secondary / multi-user testing |

Use these when testing sign-up, password reset, referrals, or any flow that sends email.
Check received emails at: [MailSlurp Dashboard](https://app.mailslurp.com) (use team credentials).

### For Automation (DO NOT use for manual testing)

| Mailbox | Email | Assigned To |
| ------- | ----- | ----------- |
| qa1 | `qa1@qa.flexbets.io` | Primary automated test user |
| qa2 | `qa2@qa.flexbets.io` | Sign-up / account creation |
| qa3 | `qa3@qa.flexbets.io` | Referral sender |
| qa4 | `qa4@qa.flexbets.io` | Referral recipient |
| qa5 | `qa5@qa.flexbets.io` | Password reset |
| qa6 | `qa6@qa.flexbets.io` | Restricted state (WA) |
| qa7 | `qa7@qa.flexbets.io` | TN resident (deposit limit) |
| qa8 | `qa8@qa.flexbets.io` | MA resident (deposit limit) |
| qa9 | `qa9@qa.flexbets.io` | Native land test |
| qa10 | `qa10@qa.flexbets.io` | Spare |
