# Email Deliverability

Best practices for ensuring your emails reach recipients' inboxes. Deliverability depends on proper authentication, sender reputation, infrastructure setup, and ongoing monitoring.

## When to Use This

- Setting up email infrastructure for the first time
- Configuring email authentication (SPF, DKIM, DMARC, BIMI)
- Troubleshooting emails going to spam
- Monitoring email delivery and reputation
- Setting up bounce and complaint handling
- Planning IP warming strategies

## Email Authentication

Email authentication is critical for deliverability and is now required by major providers like Gmail and Yahoo. Without proper authentication, your emails will be rejected or sent to spam.

### SPF (Sender Policy Framework)

SPF records specify which servers are authorized to send email on behalf of your domain.

**What it does:** Prevents email spoofing by listing authorized sending IPs.

**How to set up:**
1. Add a TXT record to your domain's DNS
2. Format: `v=spf1 include:_spf.resend.com ~all` (if using Resend)
3. Use `~all` (soft fail) for testing, `-all` (hard fail) for production

**Best practices:**
- Include all sending services you use
- Keep the SPF record under 10 DNS lookups
- Test with SPF validators before going live

### DKIM (DomainKeys Identified Mail)

DKIM adds a cryptographic signature to emails, proving they came from your domain and weren't tampered with.

**What it does:** Provides cryptographic authentication of email messages.

**How to set up:**
1. Generate DKIM keys (usually provided by your email service)
2. Add public key as TXT record in DNS
3. Configure your email service to sign outgoing messages

**Best practices:**
- Use 2048-bit keys for better security
- Rotate keys periodically (every 6-12 months)
- Monitor for signing failures

### DMARC (Domain-based Message Authentication, Reporting & Conformance)

DMARC builds on SPF and DKIM, providing policy and reporting for email authentication.

**What it does:** Defines how to handle emails that fail SPF/DKIM checks and provides reporting.

**How to set up:**
1. Start with monitoring mode: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
2. Gradually move to quarantine: `p=quarantine; pct=25` (25% of failing emails)
3. Finally enforce: `p=reject` (reject all failing emails)

**Policy options:**
- `p=none` - Monitor only, don't take action
- `p=quarantine` - Send failing emails to spam
- `p=reject` - Reject failing emails entirely

**Best practices:**
- Always start in monitoring mode
- Review reports regularly before enforcing
- Use `rua` and `ruf` tags to receive aggregate and forensic reports
- Set `aspf=r` and `adkim=r` for relaxed alignment initially

### BIMI (Brand Indicators for Message Identification)

BIMI allows you to display your brand logo in email clients that support it.

**What it does:** Shows your verified logo next to emails in supported clients.

**Requirements:**
- Valid DMARC policy (p=quarantine or p=reject)
- Verified Mark Certificate (VMC) - optional but recommended
- SVG logo hosted publicly

**Best practices:**
- BIMI is a nice-to-have, not essential for deliverability
- Focus on SPF, DKIM, and DMARC first
- Consider BIMI after other authentication is solid

## Sender Reputation

Your sender reputation determines whether ISPs trust your emails. It's built over time through consistent sending practices.

### IP Warming

When starting with a new IP address or sending domain, gradually increase volume to build reputation.

**Example warming schedule:**
- Week 1: 50-100 emails/day
- Week 2: 200-500 emails/day
- Week 3: 1,000-2,000 emails/day
- Week 4: 5,000-10,000 emails/day
- Continue gradually increasing

**Best practices:**
- Start with your most engaged users
- Send consistently (same time each day)
- Monitor bounce and complaint rates closely
- Don't rush the process - reputation takes time

### Maintaining Reputation

**Do:**
- Send consistently to engaged users
- Keep bounce rates under 2%
- Keep complaint rates under 0.1%
- Remove inactive subscribers regularly
- Monitor blacklists

**Don't:**
- Send to purchased lists
- Send to unverified addresses
- Ignore bounce and complaint reports
- Send inconsistent volumes
- Use misleading subject lines

## Bounce Handling

Bounces are emails that couldn't be delivered. Handle them properly to maintain reputation.

### Hard Bounces

Permanent delivery failures (invalid email, domain doesn't exist, etc.).

**Action:** Remove from your list immediately. Don't retry.

**Common causes:**
- Invalid email address
- Domain doesn't exist
- Mailbox doesn't exist
- Blocked by recipient server

### Soft Bounces

Temporary delivery failures (mailbox full, server temporarily unavailable, etc.).

**Action:** Retry with exponential backoff. Remove after multiple failures.

**Retry strategy:**
- First retry: 1 hour
- Second retry: 4 hours
- Third retry: 24 hours
- Remove after 3-5 failures

### Bounce Rate Targets

- **Good:** Under 2%
- **Acceptable:** 2-5%
- **Concerning:** 5-10%
- **Critical:** Over 10% (review immediately)

## Complaint Handling

Complaints (spam reports) are more damaging than bounces. Keep complaint rates very low.

### Complaint Rate Targets

- **Excellent:** Under 0.05%
- **Good:** 0.05-0.1%
- **Concerning:** 0.1-0.2%
- **Critical:** Over 0.2% (immediate action required)

### Reducing Complaints

- Only send to users who opted in
- Make unsubscribe easy and immediate
- Send relevant, expected emails
- Honor unsubscribe requests immediately
- Use clear sender names and "From" addresses
- Set proper "Reply-To" addresses

### Feedback Loops

Set up feedback loops with major ISPs to receive complaint notifications automatically.

**Providers offering feedback loops:**
- Gmail (Postmaster Tools)
- Yahoo (Feedback Loop)
- Microsoft (Junk Email Reporting Program)
- AOL (Feedback Loop)

**Action on complaints:** Remove immediately, no questions asked.

## Monitoring and Alerting

Treat email delivery like production infrastructure. Monitor key metrics and set up alerts.

### Key Metrics to Monitor

**Delivery metrics:**
- Delivery rate (should be >95%)
- Bounce rate (should be <2%)
- Complaint rate (should be <0.1%)
- Open rate (engagement indicator)
- Click rate (engagement indicator)

**Authentication metrics:**
- SPF pass rate
- DKIM pass rate
- DMARC pass rate
- Authentication failures

**Infrastructure metrics:**
- API response times
- Error rates
- Queue depth
- Retry rates

### Alerting Thresholds

Set up alerts for:
- Bounce rate > 5%
- Complaint rate > 0.2%
- Delivery rate < 90%
- Authentication failure rate > 10%
- API error rate > 1%

### Monitoring Tools

- **Email service dashboards:** Most email services provide built-in monitoring
- **Google Postmaster Tools:** Free monitoring for Gmail delivery
- **Microsoft SNDS:** Monitoring for Outlook/Hotmail delivery
- **Blacklist monitoring:** Check major blacklists regularly
- **Custom dashboards:** Build dashboards for your specific metrics

## Infrastructure Best Practices

### Email Service Selection

Choose an email service that provides:
- Proper authentication setup (SPF, DKIM, DMARC)
- Detailed delivery analytics
- Bounce and complaint handling
- API reliability and good documentation
- Webhook support for real-time events

Services like Resend provide these features out of the box, making it easier to maintain good deliverability.

### API Reliability

**Best practices:**
- Implement retry logic with exponential backoff
- Handle rate limits gracefully
- Use webhooks for async processing when possible
- Queue emails for retry on transient failures
- Log all send attempts for debugging

### Domain Configuration

**Use dedicated sending domains:**
- Separate subdomain for email (e.g., `mail.yourdomain.com`)
- Protects main domain reputation
- Easier to isolate issues

**DNS best practices:**
- Keep TTL low during setup (300 seconds)
- Increase TTL after configuration is stable (3600+ seconds)
- Use CNAME records for subdomains when possible
- Verify DNS propagation before sending

### Rate Limiting

Respect rate limits to avoid throttling:
- Start with conservative limits
- Gradually increase as reputation builds
- Monitor for rate limit errors
- Implement queuing for high-volume sends

## Testing Deliverability

### Before Going Live

1. **Authentication testing:**
   - Use SPF validators
   - Check DKIM signatures
   - Verify DMARC policy

2. **Send test emails:**
   - Gmail, Yahoo, Outlook, Apple Mail
   - Check spam folders
   - Verify authentication passes

3. **Monitor initial sends:**
   - Watch bounce rates closely
   - Check complaint rates
   - Review delivery reports

### Ongoing Testing

- Send test emails regularly to verify authentication
- Monitor reputation scores (if available)
- Check blacklists monthly
- Review DMARC reports weekly
- Test unsubscribe flows

## Common Issues and Solutions

### Emails Going to Spam

**Check:**
1. Authentication (SPF, DKIM, DMARC) - most common issue
2. Sender reputation (blacklists, complaint rates)
3. Content (spammy content, HTML issues)
4. Sending patterns (sudden volume increases)

### Authentication Failures

**SPF failures:**
- Verify all sending IPs are included
- Check for too many DNS lookups
- Ensure record syntax is correct

**DKIM failures:**
- Verify public key in DNS matches private key
- Check key rotation didn't break signing
- Ensure email service is signing correctly

**DMARC failures:**
- Review DMARC reports to identify sources
- Ensure SPF and DKIM alignment
- Fix unauthorized sending sources

### High Bounce Rates

**Causes:**
- Sending to unverified addresses
- Poor list hygiene
- Improper email collection

**Solutions:**
- Implement email validation and verification
- Remove hard bounces immediately
- Clean lists regularly
- Use double opt-in for marketing emails

## Related Topics

- [Email Types](./email-types.md) - Understanding what you're sending
- [Transactional Emails](./transactional-emails.md) - Best practices for transactional sends
- [Email Capture](./email-capture.md) - Collecting valid email addresses
