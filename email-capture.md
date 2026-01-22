# Email Capture Best Practices

Best practices for collecting email addresses responsibly, including validation, verification, and opt-in processes. Proper email capture improves deliverability, reduces bounces, and ensures compliance.

## When to Use This

- Building email signup forms
- Implementing email validation
- Setting up email verification
- Deciding between single and double opt-in
- Handling invalid email addresses
- Designing email capture forms

## Email Validation

Email validation checks if an email address is properly formatted and potentially deliverable before accepting it.

### Client-Side Validation

Validate email format in the browser before submission.

**Basic format validation:**
- Check for @ symbol
- Check for domain
- Check for basic format (RFC 5322)

**HTML5 validation:**
```html
<input type="email" required>
```

**JavaScript validation:**
- Use regex for format checking
- Provide immediate feedback
- Don't block on format alone (server should validate too)

**Best practices:**
- Validate format immediately (on blur or input with a short debounce)
- Show clear error messages
- Don't be too strict (allow valid but unusual formats)
- Remember: format validation ≠ deliverability

### Server-Side Validation

Always validate on the server, even if you validate client-side.

**Why server-side validation:**
- Client-side can be bypassed
- Security requirement
- Data integrity
- Prevents invalid data in database

**What to validate:**
- Email format (RFC 5322 compliant)
- Domain exists (DNS lookup)
- Domain accepts email (MX record check)
- Disposable email addresses (optional)

### Advanced Validation

**Syntax validation:**
- Check email format against RFC 5322
- Validate domain format
- Check for common typos

**Domain validation:**
- Check if domain exists (DNS lookup)
- Check if domain has MX records
- Verify domain is not blacklisted

**Disposable email detection:**
- Check against known disposable email providers
- Consider blocking or flagging
- Balance between blocking and user experience

### Validation Libraries and Services

**Client-side libraries:**
- HTML5 `type="email"` attribute
- JavaScript validation libraries
- Framework-specific validators (React, Vue, etc.)

**Server-side validation:**
- Language-specific email validation libraries
- Regex patterns (but be careful - email regex is complex)
- Validation APIs for advanced checks

**Email verification APIs:**
Services can check if an email address is deliverable by:
- Checking format
- Verifying domain exists
- Checking MX records
- Testing mailbox (with permission)
- Identifying disposable emails
- Detecting role-based addresses (info@, support@)

These APIs can help catch invalid emails before sending, reducing bounce rates.

## Email Verification

Email verification confirms that an email address belongs to the person who submitted it and that it's deliverable.

### Why Verify

**Benefits:**
- Confirms email address is valid and deliverable
- Reduces bounce rates
- Improves sender reputation
- Ensures user can receive emails
- Required for some compliance (double opt-in)

**When to verify:**
- Account signups (always recommended)
- Email address changes (always)
- Marketing list signups (highly recommended)
- Critical transactional emails (password resets, etc.)

### Verification Process

**Single verification (common for accounts):**
1. User submits email address
2. Send verification email with unique link/token
3. User clicks link to verify
4. Mark email as verified in database
5. Allow access to account/features

**Double opt-in (for marketing):**
1. User submits email for marketing list
2. Send confirmation email
3. User clicks to confirm subscription
4. Add to marketing list only after confirmation
5. Send welcome email

### Verification Email Best Practices

**Content:**
- Clear purpose ("Verify your email address")
- Prominent verification link/button
- Expiration time (typically 24-48 hours)
- Resend option
- Security notice if clicked by mistake

**Timing:**
- Send immediately (within seconds)
- Include expiration prominently
- Allow resend after 60 seconds
- Limit resend attempts (e.g., 3 per hour)

**Design:**
- Make verification button/link obvious
- Use clear call-to-action
- Mobile-friendly design
- Accessible (screen readers, etc.)

See [Transactional Emails](./transactional-emails.md) for more on verification email design.

## Single vs. Double Opt-In

### Single Opt-In

User provides email address and is immediately added to list.

**Process:**
1. User enters email
2. (Optional) User checks box confirming subscription
3. Added to list immediately
4. Send welcome email

**When to use:**
- Account creation (email verification still recommended)
- Transactional email lists (order updates, etc.)
- Some regions where double opt-in not required

**Pros:**
- Lower friction
- Higher conversion rate
- Faster list growth

**Cons:**
- Higher risk of invalid emails
- Lower engagement (some users forget they signed up)
- May not meet compliance in some regions (GDPR, CASL)

### Double Opt-In

User provides email address and must confirm via email before being added to list.

**Process:**
1. User enters email
2. Send confirmation email
3. User clicks confirmation link
4. Add to list only after confirmation
5. Send welcome email

**When to use:**
- Marketing email lists (highly recommended)
- Required in some regions (Germany, some EU countries)
- When list quality is critical
- For compliance (GDPR, CASL best practice)

**Pros:**
- Verifies email is valid and deliverable
- Confirms user actually wants emails
- Lower bounce rates
- Better engagement
- Meets compliance requirements
- Reduces spam complaints

**Cons:**
- Lower conversion rate (some users don't confirm)
- Extra step for users
- Slightly slower list growth

### Recommendation

**Use double opt-in for:**
- All marketing email lists
- Newsletters
- Promotional emails
- Any email that requires explicit consent

**Single opt-in is acceptable for:**
- Account email verification (still verify, but immediate access)
- Transactional email preferences (order updates, etc.)
- When legally sufficient in your jurisdiction

**Best practice:** Use double opt-in for marketing emails whenever possible. The quality and compliance benefits outweigh the conversion cost.

## Form Design Best Practices

### Email Input Field

**Best practices:**
- Use `type="email"` for mobile keyboard optimization
- Include placeholder text ("you@example.com")
- Show validation errors clearly
- Provide helpful error messages
- Auto-focus when appropriate

**Error messages:**
- ✅ "Please enter a valid email address"
- ❌ "Invalid"
- ✅ "This email is already registered"
- ❌ "Error"

### Consent Checkboxes

**For marketing emails:**
- Unchecked by default (required)
- Clear, specific language about what they're signing up for
- Separate checkboxes for different email types
- Link to privacy policy

**Example:**
```
☐ Subscribe to our weekly newsletter with product updates and tips
☐ Send me promotional offers and special deals
```

**Don't:**
- Pre-check boxes
- Use vague language ("Send me emails")
- Hide checkboxes in terms and conditions
- Make consent required for account creation

### Form Layout

**Best practices:**
- Keep forms simple and focused
- One primary action (sign up, subscribe)
- Clear value proposition
- Mobile-friendly design
- Accessible (labels, ARIA attributes)

### Progressive Enhancement

**Consider:**
- Start with email only
- Ask for preferences later (after verification)
- Don't overwhelm with too many fields
- Build trust before asking for more

## Error Handling

### Invalid Email Addresses

**Handle gracefully:**
- Show clear error message
- Explain what's wrong
- Suggest corrections (common typos)
- Allow user to fix and resubmit
- Don't block user unnecessarily

**Common issues:**
- Typos (@gmial.com → @gmail.com)
- Missing @ symbol
- Invalid domain
- Disposable email (if blocked)

### Already Registered

**If email exists:**
- For accounts: "This email is already registered. [Sign in]"
- For marketing: "You're already subscribed! [Manage preferences]"
- Provide helpful next steps
- Don't reveal if account exists (security)

### Rate Limiting

**Prevent abuse:**
- Limit verification email sends (e.g., 3 per hour per email)
- Rate limit form submissions
- Use CAPTCHA or botId tools if needed (sparingly)
- Monitor for abuse patterns

## Email Verification APIs

Email verification APIs can check if an email address is deliverable before you send to it.

### When to Use

**Consider using when:**
- High bounce rates
- Collecting emails from unknown sources
- Large-scale email collection
- Need to verify before sending
- Want to catch typos early

**May not need when:**
- Small, known user base
- Double opt-in already in place
- Low bounce rates
- Cost is a concern

### What Verification APIs Check

**Format validation:**
- Email syntax
- Domain format
- Basic structure

**Domain checks:**
- Domain exists (DNS)
- Has MX records
- Not blacklisted

**Mailbox checks:**
- Mailbox exists (SMTP verification)
- Accepts email
- Not a catch-all

**Additional checks:**
- Disposable email detection
- Role-based address detection (info@, support@)
- Free email provider identification

### Integration Considerations

**Real-time vs. batch:**
- Real-time: Check during form submission
- Batch: Verify collected emails periodically

**Cost:**
- Most APIs charge per verification
- Consider cost vs. bounce rate savings
- Some email services include verification

**Privacy:**
- Understand what data is shared with API
- Check API privacy policy
- Consider GDPR implications

**Reliability:**
- APIs may have rate limits
- Some checks may be slow (SMTP verification)
- Have fallback for API failures

### Services

Many email services, including Resend, provide email validation and verification features or integrate with verification services. Check your email service's documentation for available features.

## Best Practices Summary

### Do

- Validate email format (client and server)
- Verify email addresses (especially for accounts)
- Use double opt-in for marketing emails
- Provide clear error messages
- Make forms accessible and mobile-friendly
- Record consent properly
- Handle errors gracefully
- Allow resend of verification emails

### Don't

- Rely only on client-side validation
- Pre-check consent boxes
- Use vague consent language
- Block users unnecessarily
- Ignore validation errors
- Send to unverified addresses (for critical emails)
- Make verification too difficult

## Related Topics

- [Transactional Emails](./transactional-emails.md) - Verification email design
- [Marketing Emails](./marketing-emails.md) - Opt-in requirements
- [Compliance](./compliance.md) - Legal requirements for consent
- [Deliverability](./deliverability.md) - How validation improves deliverability
