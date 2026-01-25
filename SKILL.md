---
name: email-best-practices
description: Provides guidance for building deliverable, compliant emails. Use when building email features, debugging spam/bounce issues, setting up SPF/DKIM/DMARC authentication, implementing email capture, ensuring CAN-SPAM/GDPR/CASL compliance, handling webhooks, retry logic, or choosing between transactional and marketing emails.
license: MIT
compatibility: Requires Node.js for scripts.
metadata:
  author: resend
  version: "1.0"
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
| Set up SPF/DKIM/DMARC, fix spam issues | [Deliverability](./references/deliverability.md) |
| Build password reset, OTP, confirmations | [Transactional Emails](./references/transactional-emails.md) |
| Plan which emails your app needs | [Transactional Email Catalog](./references/transactional-email-catalog.md) |
| Build newsletter signup, validate emails | [Email Capture](./references/email-capture.md) |
| Send newsletters, promotions | [Marketing Emails](./references/marketing-emails.md) |
| Ensure CAN-SPAM/GDPR/CASL compliance | [Compliance](./references/compliance.md) |
| Decide transactional vs marketing | [Email Types](./references/email-types.md) |
| Handle retries, idempotency, errors | [Sending Reliability](./references/sending-reliability.md) |
| Process delivery events, set up webhooks | [Webhooks & Events](./references/webhooks-events.md) |
| Manage bounces, complaints, suppression | [List Management](./references/list-management.md) |
| Verify DNS authentication records | [check-dns-auth.js](./scripts/check-dns-auth.js) |
| Generate a DMARC record | [generate-dmarc.sh](./scripts/generate-dmarc.sh) |

## Start Here

**New app?**
Start with the [Catalog](./references/transactional-email-catalog.md) to plan which emails your app needs (password reset, verification, etc.), then set up [Deliverability](./references/deliverability.md) (DNS authentication) before sending your first email.

**Spam issues?**
Check [Deliverability](./references/deliverability.md) first—authentication problems are the most common cause. Gmail/Yahoo reject unauthenticated emails.

**Marketing emails?**
Follow this path: [Email Capture](./references/email-capture.md) (collect consent) → [Compliance](./references/compliance.md) (legal requirements) → [Marketing Emails](./references/marketing-emails.md) (best practices).

**Production-ready sending?**
Add reliability: [Sending Reliability](./references/sending-reliability.md) (retry + idempotency) → [Webhooks & Events](./references/webhooks-events.md) (track delivery) → [List Management](./references/list-management.md) (handle bounces).

## Related

- [Resend Documentation](https://resend.com/docs) - Email API reference and guides
- [Google Postmaster Tools](https://postmaster.google.com) - Monitor Gmail delivery and reputation
- [MXToolbox](https://mxtoolbox.com) - DNS and email diagnostics
- [Mail Tester](https://mail-tester.com) - Test email spam score
- [DMARC Analyzer](https://www.dmarcanalyzer.com) - DMARC report analysis

## Scripts

### Check DNS Authentication

Verify SPF, DKIM, and DMARC records for a domain. Auto-discovers DKIM selectors.

```bash
node scripts/check-dns-auth.js <domain> [dkim-selector]

# Examples
node scripts/check-dns-auth.js example.com           # Auto-discover DKIM
node scripts/check-dns-auth.js example.com google    # Specific selector
```

### Generate DMARC Record

Generate a DMARC DNS record with the correct syntax.

```bash
./scripts/generate-dmarc.sh -d <domain> -e <report-email> [options]

# Examples
./scripts/generate-dmarc.sh -d example.com -e dmarc@example.com -p none      # Start monitoring
./scripts/generate-dmarc.sh -d example.com -e dmarc@example.com -p reject    # Full protection
./scripts/generate-dmarc.sh -d example.com -e dmarc@example.com -p reject -P 25  # Gradual rollout
```
