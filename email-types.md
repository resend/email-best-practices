# Email Types: Transactional vs Marketing

Distinctions between transactional and marketing emails, legal implications of each, and a catalog of transactional emails your app should include.

## Quick Decision Guide

**Is this email transactional or marketing?**

```
Did the user take a specific action that triggered this email?
├─ YES → Is the email required for them to complete that action?
│        ├─ YES → TRANSACTIONAL (password reset, OTP, order confirmation)
│        └─ NO → Does it confirm/update them about their action?
│                ├─ YES → TRANSACTIONAL (shipping update, payment receipt)
│                └─ NO → MARKETING (recommendations, upsells)
└─ NO → MARKETING (newsletter, promotion, announcement)
```

**Gray area examples:**
| Email | Classification | Why |
|-------|---------------|-----|
| "Your subscription renews tomorrow" | Transactional | User expects it, needs to act |
| "Your free trial ends tomorrow" | Transactional | User expects it, needs to act |
| "We miss you! Come back" | Marketing | Promotional, not user-initiated |
| "New features in your plan" | Marketing* | Promotional unless user's workflow is affected |
| "Price increase notice" | Transactional | Required disclosure, affects their subscription |

*If a feature change affects how they use the product, it can be transactional.

## Transactional vs Marketing: Key Differences

### Transactional Emails

**Definition:** Emails that facilitate or confirm a transaction the user initiated or expects. They're directly related to an action the user took.

**Characteristics:**
- User-initiated or expected
- Time-sensitive and actionable
- Required for the user to complete an action
- Not promotional in nature
- Can be sent without explicit opt-in (with limitations)

**Examples:**
- Password reset links
- Order confirmations
- Account verification
- OTP/2FA codes
- Shipping notifications

### Marketing Emails

**Definition:** Emails sent for promotional, advertising, or informational purposes that are not directly related to a specific transaction.

**Characteristics:**
- Promotional or informational content
- Not time-sensitive to complete a transaction
- Require explicit opt-in (consent)
- Must include unsubscribe options
- Subject to stricter compliance requirements

**Examples:**
- Newsletters
- Product announcements
- Promotional offers
- Company updates
- Educational content

## Legal Distinctions

### CAN-SPAM Act (US)

**Transactional emails:**
- Can be sent without opt-in
- Must be related to a transaction
- Cannot contain promotional content (with exceptions)
- Must identify sender and provide contact information

**Marketing emails:**
- Require opt-out mechanism (not opt-in in US)
- Must include clear sender identification
- Must include physical mailing address
- Must honor opt-out requests within 10 business days

### GDPR (EU)

**Transactional emails:**
- Can be sent based on legitimate interest or contract fulfillment
- Must be necessary for service delivery
- Cannot contain marketing content without consent

**Marketing emails:**
- Require explicit opt-in consent
- Must clearly state purpose of data collection
- Must provide easy unsubscribe
- Subject to data protection requirements

### CASL (Canada)

**Transactional emails:**
- Can be sent without consent if related to ongoing business relationship
- Must be factual and not promotional

**Marketing emails:**
- Require express or implied consent
- Must include unsubscribe mechanism
- Must identify sender clearly

## When to Use Each Type

### Use Transactional When:

- User needs the email to complete an action
- Email confirms a transaction or account change
- Email provides security-related information
- Email is expected based on user action
- Content is time-sensitive and actionable

### Use Marketing When:

- Promoting products or services
- Sending newsletters or updates
- Sharing educational content
- Announcing features or company news
- Content is not required for a transaction

## Hybrid Emails: The Gray Area

Some emails mix transactional and marketing content. Be careful:

**Best practice:** Keep transactional and marketing separate. If you must include marketing in a transactional email:
- Make transactional content primary
- Keep marketing content minimal and clearly separated
- Ensure transactional purpose is clear
- Check local regulations (some regions prohibit this)

**Example of acceptable hybrid:**
- Order confirmation (transactional) with a small "You might also like" section (marketing)

**Example of problematic hybrid:**
- Newsletter (marketing) with a small order status update (transactional)

## Catalog of Transactional Emails

Your app should include these transactional emails based on your use case:

### Authentication & Security

#### Account Verification / Email Verification
**When to send:** Immediately after user signs up or changes email address.

**Purpose:** Verify the email address belongs to the user.

**Content should include:**
- Clear verification link or code
- Expiration time (typically 24-48 hours)
- Instructions on what to do
- Security notice if link is clicked by mistake

**Best practices:**
- Send immediately (within seconds)
- Include expiration notice
- Provide resend option
- Link to support if issues

#### OTP / 2FA Codes
**When to send:** When user requests two-factor authentication code.

**Purpose:** Provide time-sensitive authentication code.

**Content should include:**
- The OTP code (clearly displayed)
- Expiration time (typically 5-10 minutes)
- Security warnings
- Instructions on what to do if not requested

**Best practices:**
- Send immediately
- Code should be large and easy to read
- Include expiration prominently
- Warn about sharing codes
- Provide "I didn't request this" link

#### Password Reset
**When to send:** When user requests password reset.

**Purpose:** Allow user to securely reset forgotten password.

**Content should include:**
- Reset link (with token)
- Expiration time (typically 1 hour)
- Security warnings
- Instructions if not requested

**Best practices:**
- Send immediately
- Link expires quickly (1 hour)
- Include IP address and location if available
- Provide "I didn't request this" link
- Don't include the old password

#### Security Alerts
**When to send:** When security-relevant events occur (login from new device, password change, etc.).

**Purpose:** Notify user of account security events.

**Content should include:**
- What happened (clear description)
- When it happened
- Location/IP if available
- Action to take if suspicious
- Link to security settings

**Best practices:**
- Send immediately
- Be clear and specific
- Include actionable steps
- Provide way to report suspicious activity

### Account Management

#### Welcome Email
**When to send:** Immediately after successful account creation and verification.

**Purpose:** Welcome new users and guide them to next steps.

**Content should include:**
- Welcome message
- Key features or next steps
- Links to important resources
- Support contact information

**Best practices:**
- Send after email verification
- Keep it focused and actionable
- Don't overwhelm with information
- Set expectations about future emails

#### Account Update Notifications
**When to send:** When user changes account settings (email, password, profile, etc.).

**Purpose:** Confirm account changes and provide security notice.

**Content should include:**
- What changed
- When it changed
- Action to take if unauthorized
- Link to account settings

**Best practices:**
- Send immediately after change
- Be specific about what changed
- Include security notice
- Provide easy way to revert if needed

### E-commerce & Transactions

#### Order Confirmations
**When to send:** Immediately after order is placed.

**Purpose:** Confirm order details and provide receipt.

**Content should include:**
- Order number
- Items ordered with quantities
- Pricing breakdown
- Shipping address
- Estimated delivery date
- Order tracking link (if available)

**Best practices:**
- Send within minutes of order
- Include all order details
- Make it easy to print or save
- Provide customer service contact

#### Shipping Notifications
**When to send:** When order ships, with tracking updates.

**Purpose:** Notify user that order has shipped and provide tracking.

**Content should include:**
- Order number
- Tracking number
- Carrier information
- Expected delivery date
- Tracking link
- Shipping address confirmation

**Best practices:**
- Send when order ships
- Include tracking number prominently
- Provide carrier tracking link
- Update on major tracking milestones

#### Invoices and Receipts
**When to send:** After payment is processed.

**Purpose:** Provide payment confirmation and receipt.

**Content should include:**
- Invoice/receipt number
- Payment amount
- Payment method
- Items/services purchased
- Payment date
- Downloadable PDF (if applicable)

**Best practices:**
- Send immediately after payment
- Include all payment details
- Make it easy to download/save
- Include tax information if applicable

### Subscriptions & Services

#### Subscription Confirmations
**When to send:** When user subscribes or changes subscription.

**Purpose:** Confirm subscription details and billing information.

**Content should include:**
- Subscription plan details
- Billing amount and frequency
- Next billing date
- Payment method
- Link to manage subscription

**Best practices:**
- Send immediately after subscription
- Clearly state billing terms
- Provide easy cancellation option
- Include support contact

#### Subscription Renewal Notices
**When to send:** Before subscription renews (typically 3-7 days before).

**Purpose:** Notify user of upcoming renewal and charge.

**Content should include:**
- Renewal date
- Amount to be charged
- Payment method on file
- Link to update payment method
- Link to cancel if desired

**Best practices:**
- Send with enough notice (3-7 days)
- Be clear about amount and date
- Make it easy to update payment method
- Provide cancellation option

#### Trial Expiration Notices
**When to send:** Before free trial ends (typically 3 days and 1 day before).

**Purpose:** Notify user their trial is ending and what happens next.

**Content should include:**
- Trial end date
- What happens after (subscription starts, access ends, etc.)
- Pricing if converting to paid
- Link to upgrade or cancel
- Summary of what they've used/accomplished

**Best practices:**
- Send multiple reminders (3 days before, 1 day before)
- Be clear about whether they'll be charged automatically
- Highlight value they've received during trial
- Make upgrade CTA prominent but don't be pushy

**Note:** Trial expiration emails are transactional (user expects them based on signing up for trial). However, avoid adding promotional upsells—keep focused on the trial status.

#### Payment Failed Notices
**When to send:** When subscription payment fails.

**Purpose:** Notify user of payment failure and provide resolution steps.

**Content should include:**
- What happened
- Amount that failed
- Reason for failure (if available)
- Steps to resolve
- Link to update payment method
- Consequences if not resolved

**Best practices:**
- Send immediately after failure
- Be clear about consequences
- Provide easy resolution path
- Include support contact

### Notifications & Updates

#### Feature Announcements (Transactional)
**When to send:** When a feature the user is using changes significantly.

**Purpose:** Notify users of changes that affect their use of the service.

**Content should include:**
- What changed
- How it affects the user
- What action (if any) is needed
- Link to more information

**Best practices:**
- Only for significant changes
- Focus on user impact
- Provide clear next steps
- Link to documentation

**Note:** General feature announcements are marketing emails. Only send as transactional if the change directly affects an active feature the user is using.

## Planning Your Transactional Emails

### Essential Emails (Most Apps)

1. **Email verification** - Required for account creation
2. **Password reset** - Required for account recovery
3. **Welcome email** - Good user experience

### E-commerce Apps

Add:
- Order confirmation
- Shipping notification
- Invoice/receipt

### SaaS Apps

Add:
- OTP/2FA codes
- Security alerts
- Subscription confirmations
- Payment failed notices

### Financial Apps

Add:
- All security-related emails
- Transaction confirmations
- Account update notifications
- Compliance notices

## Sending Infrastructure

### Separate Infrastructure

**Best practice:** Use separate sending infrastructure for transactional and marketing emails.

**Benefits:**
- Protect transactional deliverability
- Different authentication domains
- Independent reputation
- Easier compliance management

**Implementation:**
- Use different subdomains (e.g., `mail.app.com` for transactional, `news.app.com` for marketing)
- Separate email service accounts or API keys
- Different monitoring and alerting

### Email Service Considerations

Choose an email service that:
- Provides reliable delivery for transactional emails
- Offers separate sending domains
- Has good API for programmatic sending
- Provides webhooks for delivery events
- Supports authentication setup (SPF, DKIM, DMARC)

Services like Resend are designed for transactional emails and provide the infrastructure and tools needed for reliable delivery.

## Related Topics

- [Transactional Emails](./transactional-emails.md) - Best practices for sending transactional emails
- [Marketing Emails](./marketing-emails.md) - Best practices for marketing emails
- [Compliance](./compliance.md) - Legal requirements for each email type
- [Deliverability](./deliverability.md) - Ensuring transactional emails are delivered
