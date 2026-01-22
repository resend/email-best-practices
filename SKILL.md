---
name: email-best-practices
description: Use when building email features, setting up authentication (SPF, DKIM, DMARC), handling bounces/complaints, implementing retry logic, debugging delivery issues, or ensuring CAN-SPAM/GDPR/CASL compliance.
---

# Email Best Practices

Comprehensive guide for building reliable, compliant email systems. Covers authentication, sending infrastructure, error handling, webhooks, compliance, and content design.

## Quick Reference

| Task | Section |
|------|---------|
| Set up domain authentication | [Authentication](#authentication) |
| Decide transactional vs marketing | [Email Types](#email-types) |
| Collect email addresses | [Email Capture](#email-capture) |
| Design email content | [Content Best Practices](#content-best-practices) |
| Implement reliable sending | [Sending Infrastructure](#sending-infrastructure) |
| Warm up new domain/IP | [Sender Reputation](#sender-reputation) |
| Handle webhooks | [Webhooks & Events](#webhooks--events) |
| Process bounces/complaints | [Bounce & Complaint Management](#bounce--complaint-management) |
| Ensure legal compliance | [Compliance](#compliance) |
| Debug delivery issues | [Troubleshooting](#troubleshooting) |
| Test without sending real emails | [Development & Testing](#development--testing) |

---

## Authentication

Email authentication is **required** by Gmail and Yahoo. Without it, emails will be rejected or sent to spam.

### DNS Records Required

| Record | Purpose | Example |
|--------|---------|---------|
| **SPF** | Authorizes sending servers | `v=spf1 include:_spf.resend.com ~all` |
| **DKIM** | Cryptographic signature | TXT at `selector._domainkey.yourdomain.com` |
| **DMARC** | Policy + reporting | `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com` |

### DMARC Rollout

1. Start monitoring: `p=none` (collect reports)
2. Gradual enforcement: `p=quarantine; pct=25`
3. Full enforcement: `p=reject`

### Domain Setup

- Use dedicated subdomain for email (e.g., `mail.yourdomain.com`)
- Separate subdomains for transactional vs marketing
- Low TTL during setup (300s), increase after stable (3600s+)

### Verification Tools

- [MXToolbox](https://mxtoolbox.com) - SPF/DKIM/DMARC lookup
- [mail-tester.com](https://mail-tester.com) - Full authentication report
- Google Postmaster Tools - Gmail-specific metrics
- Microsoft SNDS - Outlook/Hotmail metrics

---

## Email Types

### Decision Tree

```
User took specific action that triggered this email?
├─ YES → Required to complete that action?
│        ├─ YES → TRANSACTIONAL (password reset, OTP, order confirmation)
│        └─ NO → Confirms/updates about their action?
│                ├─ YES → TRANSACTIONAL (shipping update, receipt)
│                └─ NO → MARKETING (recommendations, upsells)
└─ NO → MARKETING (newsletter, promotion)
```

### Key Differences

| Aspect | Transactional | Marketing |
|--------|--------------|-----------|
| Opt-in required | No (expected) | Yes (explicit) |
| Unsubscribe required | No | Yes |
| Can send without consent | Yes | No (GDPR/CASL) |
| Timing | Immediate | Scheduled |
| Infrastructure | Protect deliverability | Separate domain |

### Gray Areas

| Email | Type | Why |
|-------|------|-----|
| "Subscription renews tomorrow" | Transactional | User expects, needs to act |
| "We miss you! Come back" | Marketing | Promotional, not user-initiated |
| "Price increase notice" | Transactional | Required disclosure |
| "New features available" | Marketing | Unless affects active workflow |

**Best practice:** Use separate sending infrastructure (different subdomains, API keys) for transactional vs marketing.

---

## Email Capture

### Validation Layers

1. **Client-side:** `<input type="email" required>` + immediate feedback
2. **Server-side:** RFC 5322 format check + domain exists (MX lookup)
3. **Verification:** Send confirmation email with link

### Double Opt-In (Marketing)

1. User submits email
2. Send confirmation email immediately
3. User clicks to confirm
4. Add to list only after confirmation
5. Purge unconfirmed after 7 days

**Expected confirmation rates:** 70-85% for well-designed flow

### Common Typo Handling

```javascript
const commonTypos = {
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'hotmal.com': 'hotmail.com',
  'yaho.com': 'yahoo.com'
};

function suggestCorrection(email) {
  const domain = email.split('@')[1];
  return commonTypos[domain]
    ? email.replace(domain, commonTypos[domain])
    : null;
}
```

### Rate Limiting Capture

- Limit verification emails: 3 per hour per address
- Rate limit form submissions
- Use CAPTCHA for abuse patterns

---

## Content Best Practices

### Subject Lines

| Type | Good | Bad |
|------|------|-----|
| Password reset | "Reset your password for [App]" | "Action required" |
| OTP | "Your code: 123456 (expires 5 min)" | "Security code" |
| Order confirmation | "Order #12345 confirmed" | "Your order" |

### Pre-Header

The preview text after subject line. Use it:
- "This link expires in 1 hour"
- "Click to verify your email"
- Keep under 90 characters

### Mobile-First Design

- Single column layout
- Buttons: 44x44px minimum (touch target)
- Body text: 16px minimum
- OTP codes: 24-32px monospace, spaced for readability

### OTP/Code Display

```html
<p style="font-size: 32px; font-family: monospace; letter-spacing: 8px; text-align: center;">
  1 2 3 4 5 6
</p>
<p>This code expires in 10 minutes.</p>
```

### Sender Configuration

| Field | Good | Bad |
|-------|------|-----|
| From name | "Your App" or "Company Name" | "noreply" |
| From address | hello@yourdomain.com | noreply@gmail.com |
| Reply-to | support@yourdomain.com | (none) |

### Email Size Limits

| Limit | Value | Notes |
|-------|-------|-------|
| **Total message size** | 25-35 MB | Gmail/Outlook limit ~25MB, some providers accept more |
| **Recommended max** | < 100 KB | Larger emails load slowly, may be clipped |
| **Gmail clipping threshold** | ~102 KB | Gmail shows "View entire message" link |
| **Attachment alternative** | Use links | Host files externally, link instead of attaching |

**Best practices:**
- Keep HTML + inline CSS under 100 KB to avoid clipping
- Compress images, use appropriate formats (WebP where supported, otherwise JPEG/PNG)
- Host images externally rather than embedding base64 (reduces size, enables caching)
- For attachments, consider cloud storage links (Google Drive, S3 presigned URLs)

---

## Sending Infrastructure

### Idempotency

Prevent duplicate emails with idempotency keys:

```javascript
import crypto from 'crypto';

async function sendEmailIdempotent(params) {
  // Generate deterministic key from email params
  const idempotencyKey = crypto
    .createHash('sha256')
    .update(`${params.to}-${params.type}-${params.referenceId}`)
    .digest('hex');

  // Check if already sent
  const existing = await db.emailSends.findUnique({
    where: { idempotencyKey }
  });

  if (existing) {
    if (existing.status === 'sent') return existing; // Already sent
    if (existing.status === 'pending' && !isExpired(existing)) {
      throw new Error('Send in progress'); // Another process handling
    }
  }

  // Create/update record before sending
  const record = await db.emailSends.upsert({
    where: { idempotencyKey },
    create: { idempotencyKey, status: 'pending', params, createdAt: new Date() },
    update: { status: 'pending', updatedAt: new Date() }
  });

  try {
    const result = await emailProvider.send(params);
    await db.emailSends.update({
      where: { idempotencyKey },
      data: { status: 'sent', providerMessageId: result.id }
    });
    return result;
  } catch (error) {
    await db.emailSends.update({
      where: { idempotencyKey },
      data: { status: 'failed', error: error.message }
    });
    throw error;
  }
}
```

### Retry Logic with Exponential Backoff

```javascript
async function sendWithRetry(params, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await sendEmailIdempotent(params);
    } catch (error) {
      if (!isRetryable(error) || attempt === maxRetries) throw error;

      const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
      await sleep(delay);
    }
  }
}

function isRetryable(error) {
  // Retry on network errors and rate limits, not validation errors
  const retryableCodes = [429, 500, 502, 503, 504];
  return retryableCodes.includes(error.status) || error.code === 'ECONNRESET';
}
```

### Queue-Based Sending

For high-volume or critical emails, use a job queue:

```javascript
// Producer: Enqueue email
await emailQueue.add('send-email', {
  to: user.email,
  type: 'password-reset',
  referenceId: resetToken.id,
  data: { resetUrl }
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true
});

// Consumer: Process queue
emailQueue.process('send-email', async (job) => {
  return await sendEmailIdempotent(job.data);
});
```

### Error Handling

| Error Type | Action |
|------------|--------|
| Validation error (400) | Don't retry, fix params |
| Auth error (401/403) | Don't retry, fix credentials |
| Rate limited (429) | Retry with backoff |
| Server error (5xx) | Retry with backoff |
| Timeout | Check status before retry (may have sent) |

**Timeout handling:** Timeouts are ambiguous - the email may have sent. Always check send status before retrying:

```javascript
async function handleTimeout(idempotencyKey) {
  // Check with provider if email was actually sent
  const record = await db.emailSends.findUnique({ where: { idempotencyKey } });
  if (record?.providerMessageId) {
    const status = await emailProvider.getMessageStatus(record.providerMessageId);
    if (status === 'delivered' || status === 'sent') {
      return; // Don't retry - it was sent
    }
  }
  // Safe to retry
}
```

### Rate Limiting Sends

```javascript
import { RateLimiter } from 'limiter';

// 10 emails per second
const limiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });

async function sendRateLimited(params) {
  await limiter.removeTokens(1); // Waits if rate exceeded
  return await sendEmailIdempotent(params);
}
```

- Monitor `X-RateLimit-*` headers from provider responses
- Back off when approaching limits, don't wait for 429s

---

## Sender Reputation

### IP Warming Schedule

| Week | Volume |
|------|--------|
| 1 | 50-100/day |
| 2 | 200-500/day |
| 3 | 1,000-2,000/day |
| 4 | 5,000-10,000/day |

Start with most engaged users. Send consistently at same times.

### Maintaining Reputation

**Do:**
- Keep bounce rate < 2%
- Keep complaint rate < 0.1%
- Remove inactive subscribers
- Monitor blacklists (MXToolbox, Spamhaus)

**Don't:**
- Send to purchased lists
- Ignore bounce/complaint reports
- Sudden volume spikes

### Checking Reputation

- **Google Postmaster Tools** - Domain/IP reputation for Gmail
- **Microsoft SNDS** - Outlook/Hotmail reputation
- **MXToolbox Blacklist Check** - Check against 100+ blacklists
- **Sender Score** - Overall reputation score

---

## Webhooks & Events

### Common Events

| Event | Description | Action |
|-------|-------------|--------|
| `delivered` | Email reached inbox | Log, update status |
| `bounced` | Permanent failure | Remove from list |
| `complained` | Marked as spam | Unsubscribe immediately |
| `opened` | Email opened | Track engagement |
| `clicked` | Link clicked | Track engagement |

### Webhook Handler Pattern

```javascript
app.post('/webhooks/email', async (req, res) => {
  // 1. Verify signature (provider-specific)
  if (!verifyWebhookSignature(req)) {
    return res.status(401).send('Invalid signature');
  }

  // 2. Deduplicate events
  const eventId = req.body.id || req.headers['x-event-id'];
  const processed = await db.webhookEvents.findUnique({ where: { eventId } });
  if (processed) {
    return res.status(200).send('OK'); // Already handled
  }

  // 3. Store event for idempotency
  await db.webhookEvents.create({
    data: { eventId, type: req.body.type, processedAt: new Date() }
  });

  // 4. Process event
  try {
    await processEmailEvent(req.body);
  } catch (error) {
    console.error('Webhook processing failed:', error);
    // Still return 200 to prevent retries for processing errors
    // Use dead letter queue for failed events
  }

  res.status(200).send('OK');
});

async function processEmailEvent(event) {
  switch (event.type) {
    case 'email.bounced':
      await markEmailInvalid(event.data.to, event.data.bounceType);
      break;
    case 'email.complained':
      await unsubscribeUser(event.data.to, 'spam_complaint');
      break;
    case 'email.delivered':
      await updateEmailStatus(event.data.messageId, 'delivered');
      break;
  }
}
```

### Webhook Security

- Always verify signatures (each provider has different methods)
- Use HTTPS endpoints
- Allowlist provider IPs if possible
- Respond quickly (< 5s) to avoid timeouts

---

## Bounce & Complaint Management

### Bounce Types

| Type | Examples | Action |
|------|----------|--------|
| **Hard bounce** | Invalid address, domain doesn't exist | Remove immediately, never retry |
| **Soft bounce** | Mailbox full, server temp unavailable | Retry 3x with backoff, then remove |

### Soft Bounce Retry Schedule

1. First retry: 1 hour
2. Second retry: 4 hours
3. Third retry: 24 hours
4. After 3-5 failures: Remove from list

### Database Schema

```sql
CREATE TABLE email_addresses (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'active', -- active, bounced, complained, unsubscribed
  bounce_count INT DEFAULT 0,
  last_bounce_at TIMESTAMP,
  bounce_type VARCHAR(20), -- hard, soft
  complaint_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_status ON email_addresses(status);
```

### Handling Bounces

```javascript
async function markEmailInvalid(email, bounceType) {
  const record = await db.emailAddresses.findUnique({ where: { email } });

  if (bounceType === 'hard') {
    // Hard bounce: immediately disable
    await db.emailAddresses.update({
      where: { email },
      data: {
        status: 'bounced',
        bounceType: 'hard',
        lastBounceAt: new Date()
      }
    });
  } else {
    // Soft bounce: increment counter, disable after threshold
    const newCount = (record?.bounceCount || 0) + 1;
    await db.emailAddresses.update({
      where: { email },
      data: {
        bounceCount: newCount,
        lastBounceAt: new Date(),
        bounceType: 'soft',
        status: newCount >= 3 ? 'bounced' : 'active'
      }
    });
  }
}
```

### Target Rates

| Metric | Good | Concerning | Critical |
|--------|------|------------|----------|
| Bounce rate | < 2% | 2-5% | > 5% |
| Complaint rate | < 0.1% | 0.1-0.2% | > 0.2% |
| Delivery rate | > 95% | 90-95% | < 90% |

Set up alerts when metrics exceed "Concerning" thresholds.

### Complaint Handling

- Remove complainers **immediately** - no questions, no re-engagement
- Set up feedback loops: Gmail Postmaster Tools, Yahoo FBL, Microsoft SNDS

---

## Compliance

### Quick Reference

| Requirement | CAN-SPAM (US) | GDPR (EU) | CASL (Canada) |
|-------------|---------------|-----------|---------------|
| Opt-in for marketing | No (opt-out ok) | Yes (explicit) | Yes (express/implied) |
| Unsubscribe mechanism | Required | Required | Required |
| Process unsubscribe | 10 business days | Immediately | 10 business days |
| Physical address | Required | No | No |
| Consent records | No | Yes | Yes (3 years) |
| Penalties | $51,744/email | 4% revenue or €20M | $10M CAD |

### Unsubscribe Requirements

**Every marketing email must have:**
- Prominent unsubscribe link
- One-click unsubscribe (List-Unsubscribe header required by Gmail/Yahoo)
- Process immediately (don't wait the legal maximum)

```
List-Unsubscribe: <mailto:unsubscribe@yourdomain.com>, <https://yourdomain.com/unsubscribe?token=xxx>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### Consent Records

Store for GDPR/CASL compliance:
- Email address
- Timestamp of consent
- Method (checkbox, form, etc.)
- What they consented to
- IP address
- Source page/form

### Transactional Email Compliance

Transactional emails don't require opt-in but:
- Must not contain promotional content (keep separate)
- Must identify sender clearly
- Should still have working reply-to address

---

## Troubleshooting

### Emails Going to Spam

**Check in order:**
1. **Authentication** - Run mail-tester.com, verify SPF/DKIM/DMARC pass
2. **Reputation** - Check Google Postmaster Tools, MXToolbox blacklists
3. **Content** - Avoid spam trigger words, broken HTML, image-only emails
4. **Sending patterns** - Recent volume spikes? New domain without warming?

**Common fixes:**
- Add missing DNS records
- Request delisting from blacklists (each has own process)
- Reduce volume temporarily, warm up gradually
- Review and clean email list (remove bounces, inactive)

### User Claims "Never Received Email"

**Investigation steps:**
1. Check send logs - was it attempted?
2. Check webhook events - bounced? delivered?
3. Look up message ID in provider dashboard
4. Ask user to check spam/junk folder
5. Verify email address spelling

**If delivered but not seen:**
- Suggest checking spam, promotions (Gmail), other folders
- Check if corporate email has additional filtering
- Offer to resend (rate limit: 3 per hour)

### Previously Bounced Email Wants to Re-register

```javascript
async function handleReregistration(email) {
  const record = await db.emailAddresses.findUnique({ where: { email } });

  if (!record || record.status === 'active') {
    return { allowed: true };
  }

  if (record.bounceType === 'hard') {
    // Hard bounce: require verification before allowing
    return {
      allowed: false,
      reason: 'This email previously bounced. Please verify it works.',
      action: 'send_verification' // Send verification email, only reactivate on confirm
    };
  }

  if (record.bounceType === 'soft') {
    // Soft bounce: check how old
    const daysSinceBounce = (Date.now() - record.lastBounceAt) / (1000 * 60 * 60 * 24);
    if (daysSinceBounce > 30) {
      // Old soft bounce, reset and allow with verification
      await db.emailAddresses.update({
        where: { email },
        data: { status: 'pending_verification', bounceCount: 0 }
      });
      return { allowed: true, action: 'send_verification' };
    }
  }

  return { allowed: false, reason: 'Please try a different email address.' };
}
```

---

## Development & Testing

### Testing Without Sending Real Emails

**Local development:**
- **Mailhog** - Local SMTP server with web UI (`docker run -p 8025:8025 -p 1025:1025 mailhog/mailhog`)
- **Ethereal** - Fake SMTP from Nodemailer (`nodemailer.createTestAccount()`)

**Staging:**
- Most providers have sandbox/test modes
- Resend: Use `onboarding@resend.dev` as recipient
- SendGrid: Enable sandbox mode in API call
- Use `+test` aliases: `user+test@gmail.com` delivers to `user@gmail.com`

### Mocking in Tests

```javascript
// Mock the email provider
jest.mock('./emailProvider', () => ({
  send: jest.fn().mockResolvedValue({ id: 'mock-message-id' })
}));

// Test email sending
test('sends password reset email', async () => {
  await sendPasswordReset(user);

  expect(emailProvider.send).toHaveBeenCalledWith(
    expect.objectContaining({
      to: user.email,
      subject: expect.stringContaining('Reset your password')
    })
  );
});
```

### Preview Tools

- **React Email** - Preview components locally (`npm run dev`)
- **Maizzle** - Tailwind for email with preview
- **Litmus/Email on Acid** - Cross-client rendering tests (paid)

---

## Monitoring & Alerting

### Key Metrics to Track

- Delivery rate, bounce rate, complaint rate (see [Target Rates](#target-rates))
- Authentication pass rate (SPF, DKIM, DMARC)
- Send latency (time from API call to delivered webhook)
- Queue depth (if using job queue)

### Alert Thresholds

| Metric | Alert When |
|--------|------------|
| Bounce rate | > 5% |
| Complaint rate | > 0.2% |
| Delivery rate | < 90% |
| Auth pass rate | < 90% |

### Tools

- **Provider dashboards** - Built-in analytics (Resend, SendGrid, etc.)
- **Google Postmaster Tools** - Gmail-specific delivery data
- **Microsoft SNDS** - Outlook/Hotmail delivery data

---

## Provider Implementation

### Universal Pattern

```javascript
// All providers follow similar pattern
const client = new EmailProvider(process.env.API_KEY);

const { data, error } = await client.send({
  from: 'Your App <noreply@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Subject line',
  html: '<p>Content</p>',
  text: 'Plain text fallback'
});

if (error) {
  if (error.status === 429) {
    // Rate limited - retry with backoff
  } else if (error.status >= 500) {
    // Server error - retry with backoff
  } else {
    // Client error - don't retry, fix the request
  }
}
```

### Provider-Specific Notes

| Provider | SDK | Notes |
|----------|-----|-------|
| Resend | `resend` | Native React Email support, `react` param |
| SendGrid | `@sendgrid/mail` | Dynamic templates, batch sending |
| Mailgun | `mailgun.js` | Email validation API included |
| Postmark | `postmark` | Message streams (transactional vs broadcast) |

### Webhook Events by Provider

| Event | Resend | SendGrid | Mailgun | Postmark |
|-------|--------|----------|---------|----------|
| Delivered | `email.delivered` | `delivered` | `delivered` | `Delivery` |
| Bounced | `email.bounced` | `bounce` | `failed` | `Bounce` |
| Complained | `email.complained` | `spamreport` | `complained` | `SpamComplaint` |

---

## Testing Checklist

Before going live:

- [ ] SPF, DKIM, DMARC records verified
- [ ] Test emails to Gmail, Yahoo, Outlook, Apple Mail
- [ ] Check spam folder placement
- [ ] Mobile rendering tested
- [ ] All links work
- [ ] Unsubscribe works (marketing)
- [ ] Webhook endpoint receiving events
- [ ] Bounce handling removes addresses
- [ ] Idempotency prevents duplicates
- [ ] Retry logic handles failures gracefully
- [ ] Monitoring alerts configured
