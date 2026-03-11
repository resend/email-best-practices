---
name: email-best-practices
description: Guides email infrastructure setup, deliverability optimization, and compliance implementation. Diagnoses spam and bounce issues, configures SPF/DKIM/DMARC authentication, implements CAN-SPAM/GDPR/CASL compliance, and builds reliable sending with retry logic, webhooks, and suppression management. Use when building email features, emails going to spam, high bounce rates, setting up authentication, implementing email capture, ensuring compliance, handling webhooks, retry logic, or deciding transactional vs marketing.
---

# Email Best Practices

Guidance for building deliverable, compliant, user-friendly emails.

## Architecture Overview

```
[User] → [Email Form] → [Validation] → [Double Opt-In]
                                              ↓
                                    [Consent Recorded]
                                              ↓
[Suppression Check] ←──────────────[Ready to Send]
        ↓
[Idempotent Send + Retry] ──────→ [Email API]
                                       ↓
                              [Webhook Events]
                                       ↓
              ┌────────┬────────┬─────────────┐
              ↓        ↓        ↓             ↓
         Delivered  Bounced  Complained  Opened/Clicked
                       ↓        ↓
              [Suppression List Updated]
                       ↓
              [List Hygiene Jobs]
```

## Quick Reference

| Need to... | See |
|------------|-----|
| Set up SPF/DKIM/DMARC, fix spam issues | [Deliverability](./resources/deliverability.md) |
| Build password reset, OTP, confirmations | [Transactional Emails](./resources/transactional-emails.md) |
| Plan which emails your app needs | [Transactional Email Catalog](./resources/transactional-email-catalog.md) |
| Build newsletter signup, validate emails | [Email Capture](./resources/email-capture.md) |
| Send newsletters, promotions | [Marketing Emails](./resources/marketing-emails.md) |
| Ensure CAN-SPAM/GDPR/CASL compliance | [Compliance](./resources/compliance.md) |
| Decide transactional vs marketing | [Email Types](./resources/email-types.md) |
| Handle retries, idempotency, errors | [Sending Reliability](./resources/sending-reliability.md) |
| Process delivery events, set up webhooks | [Webhooks & Events](./resources/webhooks-events.md) |
| Manage bounces, complaints, suppression | [List Management](./resources/list-management.md) |

## Minimal Example: Send with Idempotency

```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "App <noreply@yourdomain.com>",
  to: user.email,
  subject: "Verify your email",
  html: `<p>Click <a href="${verifyUrl}">here</a> to verify.</p>`,
  headers: { "X-Entity-Ref-ID": `verify-${user.id}` }, // idempotency
});
```

See [Sending Reliability](./resources/sending-reliability.md) for retry logic and [Deliverability](./resources/deliverability.md) for DNS setup.

## Start Here

**New app?**
Start with the [Catalog](./resources/transactional-email-catalog.md) to plan which emails your app needs (password reset, verification, etc.), then set up [Deliverability](./resources/deliverability.md) (DNS authentication) before sending your first email.

**Spam issues?**
Check [Deliverability](./resources/deliverability.md) first—authentication problems are the most common cause. Gmail/Yahoo reject unauthenticated emails.

**Marketing emails?**
Follow this path: [Email Capture](./resources/email-capture.md) (collect consent) → [Compliance](./resources/compliance.md) (legal requirements) → [Marketing Emails](./resources/marketing-emails.md) (best practices).

**Production-ready sending?**
Add reliability: [Sending Reliability](./resources/sending-reliability.md) (retry + idempotency) → [Webhooks & Events](./resources/webhooks-events.md) (track delivery) → [List Management](./resources/list-management.md) (handle bounces).
