---
name: email-best-practices
description: Best practices for building and sending emails, covering deliverability, compliance, email types, and responsible email capture.
version: 1.0.0
---

# Email Best Practices

Comprehensive guidance for building and sending emails that are deliverable, compliant, and user-friendly. This skill covers everything from email authentication to legal compliance, helping you implement email features correctly from the start.

## When to Use This Skill

Use this skill when:

- Building email features (transactional or marketing)
- Setting up email infrastructure and authentication
- Implementing email capture and verification
- Ensuring legal compliance for email sending
- Optimizing email deliverability
- Choosing between transactional and marketing emails
- Designing email templates and content

## Skills Overview

### [Deliverability](./deliverability.md)
**Use when:** Setting up email infrastructure, configuring authentication, or troubleshooting delivery issues.

Covers email authentication (SPF, DKIM, DMARC, BIMI), sender reputation, bounce handling, monitoring, and infrastructure best practices.

### [Email Types](./email-types.md)
**Use when:** Deciding what type of email to send or understanding legal distinctions between transactional and marketing emails.

Explains the difference between transactional and marketing emails, when to use each, and legal requirements under CAN-SPAM, GDPR, and CASL.

### [Transactional Email Catalog](./transactional-email-catalog.md)
**Use when:** Planning what transactional emails your app needs or choosing the right email combination for your app type.

Comprehensive catalog of transactional emails organized by category, plus recommended email combinations for different app types (auth apps, e-commerce, SaaS, fintech, etc.).

### [Transactional Emails](./transactional-emails.md)
**Use when:** Building transactional email features like password resets, OTP codes, order confirmations, or account notifications.

Best practices specific to transactional emails including subject lines, content structure, mobile-first design, and timing considerations.

### [Marketing Emails](./marketing-emails.md)
**Use when:** Building marketing campaigns, newsletters, or promotional emails.

Guidelines for marketing emails including opt-in requirements, unsubscribe mechanisms, content design, segmentation, and A/B testing.

### [Compliance](./compliance.md)
**Use when:** Ensuring your email practices comply with laws like CAN-SPAM, GDPR, CASL, or other regional requirements.

Legal requirements for email sending, unsubscribe mechanisms, consent management, data retention, and privacy considerations.

### [Email Capture](./email-capture.md)
**Use when:** Implementing email collection forms, validation, verification, or opt-in processes.

Guidance on email validation techniques, verification APIs, double opt-in vs single opt-in, form design, and error handling.

## Quick Reference

| Scenario | Primary Skill | Secondary Skills |
|----------|--------------|------------------|
| Setting up email authentication | [Deliverability](./deliverability.md) | - |
| Building password reset flow | [Transactional Emails](./transactional-emails.md) | [Catalog](./transactional-email-catalog.md) |
| Implementing OTP/2FA emails | [Transactional Emails](./transactional-emails.md) | [Catalog](./transactional-email-catalog.md) |
| Building newsletter signup | [Email Capture](./email-capture.md) | [Compliance](./compliance.md), [Marketing Emails](./marketing-emails.md) |
| Sending order confirmations | [Transactional Emails](./transactional-emails.md) | [Catalog](./transactional-email-catalog.md) |
| Ensuring GDPR compliance | [Compliance](./compliance.md) | [Email Capture](./email-capture.md) |
| Troubleshooting delivery issues | [Deliverability](./deliverability.md) | - |
| Deciding transactional vs marketing | [Email Types](./email-types.md) | [Compliance](./compliance.md) |
| Planning emails for new app | [Catalog](./transactional-email-catalog.md) | [Email Types](./email-types.md) |
| Implementing email verification | [Email Capture](./email-capture.md) | [Transactional Emails](./transactional-emails.md) |
| Building marketing campaigns | [Marketing Emails](./marketing-emails.md) | [Compliance](./compliance.md) |

## Examples

**Example 1: Building a password reset flow**
→ Start with [Transactional Emails](./transactional-emails.md) for best practices, then reference [Email Types](./email-types.md) to understand why it's transactional, and check [Deliverability](./deliverability.md) for authentication setup.

**Example 2: Implementing newsletter signup**
→ Begin with [Email Capture](./email-capture.md) for validation and opt-in, then review [Compliance](./compliance.md) for legal requirements, and reference [Marketing Emails](./marketing-emails.md) for content guidelines.

**Example 3: Setting up email infrastructure**
→ Use [Deliverability](./deliverability.md) for authentication and monitoring setup, then review [Email Types](./email-types.md) to understand what types of emails you'll be sending.
