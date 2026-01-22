# Transactional Email Best Practices

Designing and sending transactional emails (password resets, OTP codes, order confirmations): subject lines, content structure, mobile-first design, timing, and delivery.

## Core Principles

### 1. Clarity Over Creativity

Transactional emails should be clear and functional, not creative. Users need to understand and act on the email quickly.

**Do:**
- Use clear, direct language
- Make the primary action obvious
- Use familiar patterns
- Keep design simple and scannable

**Don't:**
- Use clever or ambiguous language
- Hide important information
- Over-design the template
- Use unnecessary animations or effects

### 2. Action-Oriented

Every transactional email should have a clear purpose and action. Make it obvious what the user needs to do.

**Best practices:**
- Primary action button should be prominent
- Use action-oriented subject lines
- Place important information above the fold
- Make links and buttons easy to tap (mobile)

### 3. Time-Sensitive

Transactional emails are often time-sensitive. Design and send them accordingly.

**Best practices:**
- Send immediately (within seconds)
- Include expiration times prominently
- Use urgency in subject lines when appropriate
- Make it easy to find the email later if needed

## Subject Lines

Subject lines for transactional emails should be specific, actionable, and clear about the email's purpose.

### Best Practices

**Be specific:**
- ✅ "Reset your password for [App Name]"
- ❌ "Action required"
- ✅ "Your order #12345 has shipped"
- ❌ "Update on your order"

**Include context:**
- ✅ "Verify your email address for [App Name]"
- ❌ "Verify your email"
- ✅ "Your 2FA code: 123456"
- ❌ "Security code"

**Use action words:**
- ✅ "Complete your account setup"
- ❌ "Account information"
- ✅ "Confirm your email address"
- ❌ "Email confirmation"

**Include identifiers when helpful:**
- Order numbers
- Account names
- Transaction IDs
- Time-sensitive information (expiration times)

### Examples by Type

**Password reset:**
- "Reset your password for [App Name]"
- "Password reset requested for [Account]"

**OTP/2FA:**
- "Your [App Name] verification code: 123456"
- "Your login code expires in 5 minutes"

**Order confirmation:**
- "Order confirmation #12345"
- "Thank you for your order #12345"

**Account verification:**
- "Verify your email address"
- "Complete your [App Name] signup"

## Content Structure

Users spend an average of 8 seconds scanning emails. Structure your content for quick scanning.

### Above the Fold

The first screen (especially on mobile) should contain:
- Clear purpose of the email
- Primary action (button or link)
- Most important information
- Time-sensitive details (expiration, deadlines)

### Content Hierarchy

1. **Header:** Clear title stating the email's purpose
2. **Primary message:** What happened or what action is needed
3. **Details:** Supporting information (order details, account info, etc.)
4. **Action:** Primary button or link
5. **Secondary information:** Additional context, support links, security notices

### Scannable Format

**Use:**
- Short paragraphs (2-3 sentences max)
- Bullet points for lists
- Bold text for important information
- White space for breathing room
- Clear section dividers

**Avoid:**
- Long paragraphs
- Dense blocks of text
- Too many different font sizes
- Cluttered layouts

## Mobile-First Design

Over 60% of emails are opened on mobile devices. Design transactional emails mobile-first.

### Layout Considerations

**Single column:**
- Use single-column layouts
- Avoid multi-column designs
- Stack content vertically

**Button size:**
- Buttons should be at least 44x44px (touch target)
- Use full-width buttons on mobile
- Add padding around buttons

**Text size:**
- Body text: 16px minimum
- Headings: 20-24px
- Links: Clearly distinguishable
- Code/OTP: 24-32px, monospace font

### Responsive Design

**Test on:**
- Mobile devices (iOS, Android)
- Desktop email clients (Gmail, Outlook, Apple Mail)
- Tablet devices
- Dark mode (if supported)

**Common issues:**
- Images not scaling properly
- Buttons too small to tap
- Text too small to read
- Horizontal scrolling required

## Pre-Header Optimization

The pre-header (text snippet shown after subject line) is valuable real estate. Use it effectively.

### Best Practices

**Use pre-header to:**
- Reinforce the subject line
- Add urgency or expiration time
- Provide additional context
- Include a call-to-action

**Examples:**
- "This link expires in 1 hour"
- "Click to verify your email address"
- "Your order will arrive by Friday, Jan 15"
- "If you didn't request this, ignore this email"

**Technical implementation:**
- Keep pre-header text under 90-100 characters
- Hide pre-header text in email body (using CSS or HTML comments)
- Test how it appears in different clients

## Sender Configuration

How your email appears in the inbox affects open rates and trust.

### "From" Name

**Best practices:**
- Use your app or company name
- Be consistent across all emails
- Keep it short and recognizable
- Avoid "noreply" (use a real name or app name)

**Examples:**
- ✅ "[App Name]"
- ✅ "[Company Name]"
- ❌ "noreply"
- ❌ "Do Not Reply"

### "From" Email Address

**Best practices:**
- Use a subdomain (e.g., `mail@yourdomain.com`)
- Match your domain name
- Use a real address that can receive replies
- Avoid generic addresses like `noreply@`

**Examples:**
- ✅ `hello@yourdomain.com`
- ✅ `mail@yourdomain.com`
- ✅ `notifications@yourdomain.com`
- ❌ `noreply@gmail.com`

### "Reply-To" Address

**Best practices:**
- Set Reply-To to a monitored inbox
- Use a support email address
- Respond to replies promptly
- Consider using a ticketing system

**Why it matters:**
- Users may reply to transactional emails
- Replies indicate engagement
- Provides customer support channel
- Builds trust

## Timing and Urgency

Transactional emails are time-sensitive. Send them at the right time and communicate urgency clearly.

### Send Timing

**Send immediately:**
- Password resets
- OTP/2FA codes
- Order confirmations
- Account verifications
- Security alerts

**Send with slight delay (if needed):**
- Shipping notifications (can batch)
- Subscription renewals (can schedule)

**Best practice:** Send transactional emails within seconds of the triggering event. Users expect immediate delivery.

### Communicating Urgency

**When to show urgency:**
- Expiring codes or links
- Time-sensitive actions
- Security-related emails
- Payment deadlines

**How to show urgency:**
- Include expiration time prominently
- Use countdown timers (if appropriate)
- Highlight time-sensitive information
- Use clear language ("expires in 5 minutes")

**Examples:**
- "This code expires in 5 minutes"
- "Verify your email within 24 hours"
- "Your password reset link expires in 1 hour"

## Code and Link Display

For emails with codes (OTP, verification codes) or important links, make them easy to find and use.

### OTP/Verification Codes

**Display:**
- Large, easy-to-read font (24-32px)
- Monospace font for clarity
- Centered or prominently placed
- Clear label ("Your verification code:")

**Example format:**
```
Your verification code:

    1 2 3 4 5 6
```

**Best practices:**
- Make it copyable
- Include expiration time nearby
- Provide "I didn't request this" option
- Consider auto-fill compatibility (if supported)

### Action Links and Buttons

**Buttons:**
- Use HTML buttons, not just text links
- Make buttons large and tappable (44x44px minimum)
- Use contrasting colors
- Include clear action text ("Reset Password", "Verify Email")

**Links:**
- Make links clearly distinguishable
- Use descriptive link text
- Don't use "click here" (use action-oriented text)
- Test that links work

**Security considerations:**
- Use HTTPS for all links
- Don't expose tokens in URLs if possible
- Include expiration in link validation
- Log link clicks for security monitoring

## Error Handling and Edge Cases

Plan for users who don't receive emails or encounter issues.

### Resend Functionality

**When to offer resend:**
- Email verification
- Password reset
- OTP codes

**Best practices:**
- Allow resend after 60 seconds
- Limit resend attempts (e.g., 3 per hour)
- Show countdown timer
- Provide alternative methods if available

### Expired Links/Codes

**Handle gracefully:**
- Show clear "expired" message
- Offer to send a new code/link
- Explain why it expired
- Provide support contact

### User Didn't Request

**Include in:**
- Password resets
- OTP codes
- Security alerts
- Account changes

**Best practices:**
- Clear "I didn't request this" link
- Explain what to do if suspicious
- Provide security contact
- Log these clicks for security monitoring

## Testing Transactional Emails

Test thoroughly before going live.

### What to Test

**Functionality:**
- All links work correctly
- Buttons are clickable
- Codes are readable and correct
- Expiration logic works

**Design:**
- Renders correctly on mobile
- Looks good in dark mode
- Images load properly
- Text is readable

**Content:**
- No typos or errors
- Information is accurate
- Action is clear
- Tone is appropriate

### Testing Checklist

- [ ] Send test emails to yourself
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test in major email clients (Gmail, Outlook, Apple Mail)
- [ ] Verify all links work
- [ ] Check authentication (SPF, DKIM, DMARC)
- [ ] Test expiration logic
- [ ] Verify resend functionality
- [ ] Check spam folder placement
- [ ] Test dark mode rendering
- [ ] Verify accessibility (screen readers)

## Email Service Considerations

For reliable transactional email delivery, choose a service that:

**Provides:**
- Fast delivery (seconds, not minutes)
- High deliverability rates
- Webhook support for real-time events
- Good API for programmatic sending
- Authentication setup (SPF, DKIM, DMARC)
- Detailed analytics and monitoring

**Transactional email services** like Resend are designed specifically for transactional emails and provide the infrastructure needed for reliable, fast delivery.

## Monitoring and Analytics

Track key metrics for transactional emails.

### Key Metrics

**Delivery:**
- Delivery rate (should be >95%)
- Bounce rate (should be <2%)
- Time to deliver (should be <10 seconds)

**Engagement:**
- Open rate (varies by type)
- Click rate (for emails with links)
- Action completion rate

**Errors:**
- Failed sends
- Expired links/codes
- Resend requests

### Alerting

Set up alerts for:
- Delivery failures
- High bounce rates
- Authentication failures
- Unusual patterns

## Email Composition

Building HTML emails is notoriously difficult due to inconsistent client rendering. Consider using a framework designed for email development.

### React Email

[React Email](https://react.email) lets you build emails using React components, providing:
- Component-based architecture
- Preview and testing tools
- Consistent rendering across clients
- TypeScript support

For React Email guidance:
```bash
npx skills add resend/react-email
```

### Other Approaches

- **MJML** - Markup language that compiles to responsive HTML
- **Foundation for Emails** - Responsive email framework
- **Plain HTML** - Direct HTML with inline styles (most control, most tedious)

Whichever approach you use, always test across email clients before sending.

## Related Topics

- [Email Types](./email-types.md) - Understanding transactional vs marketing
- [Deliverability](./deliverability.md) - Ensuring emails are delivered
- [Email Capture](./email-capture.md) - Collecting email addresses for transactional emails
