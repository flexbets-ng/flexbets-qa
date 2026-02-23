/**
 * MailSlurp Email Helper for FlexBets QA.
 * ──────────────────────────────────────────────────────────────
 * Domain: qa.flexbets.io
 *
 * Automated test mailboxes:  qa1@qa.flexbets.io  → qa10@qa.flexbets.io
 * App Live mailboxes:        live1@qa.flexbets.io, live2@qa.flexbets.io
 *
 * Used for: sign-up verification, password reset, referral emails,
 * promo code delivery, withdrawal confirmations, RG notifications.
 */
import axios, { AxiosInstance } from 'axios';

const MAILSLURP_API_KEY = process.env.MAILSLURP_API_KEY!;
const MAILSLURP_BASE = 'https://api.mailslurp.com';

// ── Mailbox Registry ──────────────────────────────────────────
export const QA_MAILBOXES = {
  // Automation pool (qa1–qa10)
  auto1:  'qa1@qa.flexbets.io',
  auto2:  'qa2@qa.flexbets.io',
  auto3:  'qa3@qa.flexbets.io',
  auto4:  'qa4@qa.flexbets.io',
  auto5:  'qa5@qa.flexbets.io',
  auto6:  'qa6@qa.flexbets.io',
  auto7:  'qa7@qa.flexbets.io',
  auto8:  'qa8@qa.flexbets.io',
  auto9:  'qa9@qa.flexbets.io',
  auto10: 'qa10@qa.flexbets.io',
  // BrowserStack App Live manual testing
  live1:  'live1@qa.flexbets.io',
  live2:  'live2@qa.flexbets.io',
} as const;

export type MailboxAlias = keyof typeof QA_MAILBOXES;

// ── Inbox ID Cache ────────────────────────────────────────────
// MailSlurp inbox IDs are fetched once and cached for the session.
const inboxIdCache: Record<string, string> = {};

// ── Client ────────────────────────────────────────────────────
function client(): AxiosInstance {
  return axios.create({
    baseURL: MAILSLURP_BASE,
    headers: { 'x-api-key': MAILSLURP_API_KEY },
    timeout: 30_000,
  });
}

// ── Core Functions ────────────────────────────────────────────

/** Get or create a MailSlurp inbox for the given email address. */
export async function getInboxId(emailAddress: string): Promise<string> {
  if (inboxIdCache[emailAddress]) return inboxIdCache[emailAddress];

  const { data } = await client().get('/inboxes', {
    params: { emailAddress, size: 1 },
  });

  if (data.content && data.content.length > 0) {
    inboxIdCache[emailAddress] = data.content[0].id;
    return data.content[0].id;
  }

  // Inbox should already exist for our qa.flexbets.io domain — error if not
  throw new Error(`MailSlurp inbox not found for ${emailAddress}. Ensure it's provisioned.`);
}

/**
 * Wait for the next unread email in the specified mailbox.
 * Returns the full email object.
 */
export async function waitForEmail(
  mailbox: MailboxAlias | string,
  opts: {
    timeout?: number;       // ms, default 60s
    since?: Date;           // only emails after this timestamp
    subject?: string;       // filter by subject substring
    unreadOnly?: boolean;   // default true
  } = {},
): Promise<MailSlurpEmail> {
  const email = typeof mailbox === 'string' && mailbox.includes('@')
    ? mailbox
    : QA_MAILBOXES[mailbox as MailboxAlias];

  const inboxId = await getInboxId(email);
  const timeout = opts.timeout || 60_000;
  const since = opts.since || new Date(Date.now() - 5 * 60_000); // default: last 5 min
  const unreadOnly = opts.unreadOnly ?? true;

  const { data } = await client().get(`/waitForLatestEmail`, {
    params: {
      inboxId,
      timeout,
      unreadOnly,
      since: since.toISOString(),
    },
  });

  // If subject filter specified, verify
  if (opts.subject && !data.subject?.includes(opts.subject)) {
    throw new Error(`Expected subject containing "${opts.subject}", got "${data.subject}"`);
  }

  return data as MailSlurpEmail;
}

/**
 * Extract a verification/OTP code from an email body.
 * Supports common patterns: 6-digit codes, links with tokens, etc.
 */
export function extractVerificationCode(emailBody: string): string | null {
  // 6-digit OTP pattern
  const otpMatch = emailBody.match(/\b(\d{6})\b/);
  if (otpMatch) return otpMatch[1];

  // 4-digit PIN pattern
  const pinMatch = emailBody.match(/\b(\d{4})\b/);
  if (pinMatch) return pinMatch[1];

  return null;
}

/**
 * Extract a verification link from an email body.
 * Looks for links containing common verification URL patterns.
 */
export function extractVerificationLink(emailBody: string): string | null {
  const patterns = [
    /https?:\/\/[^\s"<]+verify[^\s"<]*/i,
    /https?:\/\/[^\s"<]+confirm[^\s"<]*/i,
    /https?:\/\/[^\s"<]+activate[^\s"<]*/i,
    /https?:\/\/[^\s"<]+reset[^\s"<]*/i,
  ];

  for (const pattern of patterns) {
    const match = emailBody.match(pattern);
    if (match) return match[0];
  }
  return null;
}

/** Delete all emails in a mailbox (useful for test cleanup). */
export async function clearInbox(mailbox: MailboxAlias | string): Promise<void> {
  const email = typeof mailbox === 'string' && mailbox.includes('@')
    ? mailbox
    : QA_MAILBOXES[mailbox as MailboxAlias];

  const inboxId = await getInboxId(email);
  await client().delete(`/inboxes/${inboxId}/emails`);
}

/** Get all emails in a mailbox (for debugging). */
export async function listEmails(
  mailbox: MailboxAlias | string,
  limit = 20,
): Promise<MailSlurpEmail[]> {
  const email = typeof mailbox === 'string' && mailbox.includes('@')
    ? mailbox
    : QA_MAILBOXES[mailbox as MailboxAlias];

  const inboxId = await getInboxId(email);
  const { data } = await client().get(`/inboxes/${inboxId}/emails`, {
    params: { size: limit, sort: 'DESC' },
  });
  return data.content;
}

// ── Types ─────────────────────────────────────────────────────
export interface MailSlurpEmail {
  id: string;
  inboxId: string;
  subject: string;
  from: string;
  to: string[];
  body: string;
  createdAt: string;
  read: boolean;
  attachments: string[];
}

// ── Convenience: Full Sign-Up Flow ────────────────────────────

/**
 * Complete sign-up email verification:
 * 1. Wait for verification email
 * 2. Extract code or link
 * 3. Return the code/link for the test to use
 */
export async function getSignUpVerificationCode(
  mailbox: MailboxAlias,
  since?: Date,
): Promise<{ code: string | null; link: string | null; email: MailSlurpEmail }> {
  const email = await waitForEmail(mailbox, {
    since: since || new Date(Date.now() - 2 * 60_000),
    subject: 'Verify',
  });

  return {
    code: extractVerificationCode(email.body),
    link: extractVerificationLink(email.body),
    email,
  };
}

/**
 * Complete password reset email verification.
 */
export async function getPasswordResetLink(
  mailbox: MailboxAlias,
  since?: Date,
): Promise<string | null> {
  const email = await waitForEmail(mailbox, {
    since: since || new Date(Date.now() - 2 * 60_000),
    subject: 'Reset',
  });
  return extractVerificationLink(email.body);
}

/**
 * Verify a referral email was received.
 */
export async function verifyReferralEmail(
  recipientMailbox: MailboxAlias,
  since?: Date,
): Promise<boolean> {
  try {
    await waitForEmail(recipientMailbox, {
      since: since || new Date(Date.now() - 2 * 60_000),
      subject: 'invited',
      timeout: 30_000,
    });
    return true;
  } catch {
    return false;
  }
}
