# Test Results: email-best-practices Skill

**Date:** 2026-02-13
**Model:** claude-sonnet-4-5-20250929 (both phases)
**Methodology:** RED-GREEN per writing-skills TDD for reference/technique skills

## Summary

| Scenario | RED (baseline) | GREEN (with skill) | Skill Value |
|----------|---------------|-------------------|-------------|
| 1. Spam/Deliverability | Mostly correct, wrong thresholds | All thresholds correct | **High** — precise numbers |
| 2. Compliance | Wrong penalties, missing CASL details | All specifics correct | **High** — legal precision |
| 3. Retry/Idempotency | Bad key generation, missing patterns | Correct patterns + warnings | **High** — prevents bugs |
| 4. Webhook handling | Wrong soft bounce threshold | Correct threshold + suppression rules | **Medium-High** |
| 5. Full roadmap | Generic, wrong numbers throughout | Precise, well-sourced | **High** — comprehensive |

**Verdict:** The skill provides significant value across all scenarios. Baseline agents produce plausible-sounding but imprecise guidance that could lead to real production issues (wrong thresholds, bad idempotency keys, missing compliance details).

---

## Scenario 1: Spam/Deliverability

### RED (Baseline) Failures

| What | Baseline Said | Skill Says | Impact |
|------|--------------|------------|--------|
| Bounce target | Not mentioned | <1% good, 1-3% acceptable, 3-4% concerning, >4% critical | Would miss warning signs |
| Complaint target | <0.1% | <0.01% excellent, 0.01-0.05% good, >0.05% critical | 10x too permissive |
| IP warming | Day 1-2: 50, Day 3-5: 500 | Week 1: 50-100, Week 2: 200-500 | Could damage reputation |
| Verification | Generic `dig` | Exact `dig TXT resend._domainkey.yourdomain.com +short` | Less actionable |
| Subdomains | Not mentioned | `t.yourdomain.com` / `m.yourdomain.com` | Missing best practice |
| DNS TTL | Not mentioned | 300s setup, 3600s+ stable | Missing operational detail |
| Troubleshooting order | Unordered | 1. Auth, 2. Reputation, 3. Content, 4. Patterns | Less systematic |

**Baseline also included** content NOT in the skill: BIMI setup, rDNS, content filtering tips, List-Unsubscribe header, mail-tester.com. Some useful, not harmful.

### GREEN Results
All checklist items from scenario file: **PASS**. Agent correctly sourced thresholds, warming schedule, verification commands, and troubleshooting order from deliverability.md.

---

## Scenario 2: Multi-Region Compliance

### RED (Baseline) Failures

| What | Baseline Said | Skill Says | Impact |
|------|--------------|------------|--------|
| CAN-SPAM penalty | $51,744/violation | $53k/email | Minor inaccuracy |
| CASL penalty | $10M per violation | $1M individual, $10M org | Missing individual liability |
| CASL implied consent | Not detailed | 2 years (existing relationship), 6 months (inquiry) | Missing critical timelines |
| CASL sender ID | Not mentioned | Valid 60 days after send | Missing requirement |
| Unsubscribe functional period | Not mentioned | CAN-SPAM: 30 days, CASL: 60 days | Missing compliance detail |
| Preferences vs unsubscribe | Not distinguished | One-click unsubscribe required; preferences don't replace it | Could cause compliance violation |
| International best practice | "Use strictest (GDPR)" ✅ | Same | Correct |

### GREEN Results
All checklist items: **PASS**. Agent correctly pulled penalty amounts, CASL specifics (60-day validity, 3-year records, implied consent timelines), and preferences vs unsubscribe distinction.

---

## Scenario 3: Retry/Idempotency

### RED (Baseline) Failures

| What | Baseline Said | Skill Says | Impact |
|------|--------------|------------|--------|
| Idempotency key | Content-hash with daily date | Event-based: `order-confirm-${orderId}` | **Broken dedup** — same key generates differently the next day |
| Key warnings | Custom example used `Date.now()` | Explicitly warns against `Date.now()` or fresh random values | Could cause duplicate sends |
| Key expiration | Not mentioned | 24 hours — complete retries within this window | Missing operational constraint |
| Timeout pattern | Not mentioned | AbortController with 10-30s timeout | Missing reliability pattern |
| Queuing | Not mentioned | Queue pattern for critical emails (pending -> send -> retry/fail) | Missing reliability pattern |
| Error codes | Included 408, 502, 504 (not in skill) | 5xx, 429, timeout, DNS failure | Minor difference |

### GREEN Results
All checklist items: **PASS**. Agent used event-based keys, included 24-hour expiration warning, AbortController pattern, and correct error code handling. Did not include queuing pattern in this run — this is the only partial miss.

---

## Scenario 4: Webhook Bounce/Complaint Handling

### RED (Baseline) Failures

| What | Baseline Said | Skill Says | Impact |
|------|--------------|------------|--------|
| Soft bounce threshold | 5 bounces | 3 bounces | Would send 2 extra emails to bad addresses |
| Return 200 pattern | Processed then returned 200 | Return 200 immediately, process async | Could timeout and trigger retries |
| Unsuppress rules | Not distinguished | Hard bounce: no, Complaint: no, Soft bounce: yes (30-90 days) | Missing nuance |
| Complaint rate alert | Not mentioned | >0.05% critical | Missing monitoring |
| Webhook retry schedule | Not detailed | ~30s -> ~1min -> ~5min (~24 hours) | Missing operational info |

### GREEN Results
All checklist items: **PASS**. Agent correctly used 3-bounce threshold, return-200-immediately pattern, unsuppress rules, and complaint rate alerting at 0.05%.

---

## Scenario 5: New SaaS Email Plan

### RED (Baseline) Failures

| What | Baseline Said | Skill Says | Impact |
|------|--------------|------------|--------|
| Bounce threshold | <2% acceptable | <1% good | 2x too permissive |
| Complaint threshold | <0.1% | <0.01% excellent | 10x too permissive |
| Warming schedule | Different week-by-week numbers | 50-100 / 200-500 / 1k-2k / 5k-10k | Could damage reputation |
| DMARC rollout | Generic progression | Specific: `p=quarantine; pct=25` | Less precise |
| Data retention | Not detailed | 90 days logs, 3 years bounces, indefinite suppression, 30 days content | Missing compliance detail |
| Email catalog | Generic list | References transactional-email-catalog.md (comprehensive) | Less thorough |

**Baseline included** extra content: BIMI, MX records, PECR, LGPD, dedicated IP warming, A/B testing. Broader but less precise.

### GREEN Results
All checklist items: **PASS**. Agent synthesized content from 6+ resource files, followed SKILL.md routing, and produced precise numbers throughout. Referenced the transactional email catalog for planning.

---

## Gap Analysis

### Gaps Found and Addressed

1. **List-Unsubscribe header** — Baseline agents consistently mentioned RFC 8058 one-click unsubscribe (`List-Unsubscribe-Post` header). The skill didn't cover this despite it being a Gmail/Yahoo requirement since Feb 2024.
   - **Fix:** Added `List-Unsubscribe Header` section to compliance.md with code example, endpoint requirements, and Resend docs link. Added to deliverability.md troubleshooting checklist as step 2.

2. **BIMI** — `branding.md` was a stub (119 bytes, just a heading). Confusing for agents to discover a near-empty file.
   - **Fix:** Removed `branding.md`. BIMI is already mentioned in deliverability.md's DMARC section (requires `p=quarantine` or `p=reject`).

3. **Email testing tools** — No resource covered testing/preview tools. Baseline agents mentioned mail-tester.com, MXToolbox; the skill didn't.
   - **Fix:** Added diagnostic tools to deliverability.md troubleshooting: Google Postmaster Tools, mail-tester.com, MXToolbox.

### Not Gaps (correct to omit)

- rDNS / PTR records — provider-specific, out of scope for an API-level skill
- HTML/CSS email rendering — covered by the separate `react-email` skill
- Content filtering / spam words — low-signal advice, authentication matters more
