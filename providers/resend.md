# Resend Implementation Guide

Code examples for implementing email features with [Resend](https://resend.com).

**Documentation:** [resend.com/docs](https://resend.com/docs)

## Installation

```bash
# Node.js
npm install resend

# Python
pip install resend
```

## Sending Email

### Node.js

```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Basic send
const { data, error } = await resend.emails.send({
  from: 'Your App <noreply@yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Hello from Your App',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  text: 'Welcome! Thanks for signing up.', // Plain text fallback
});

if (error) {
  console.error('Failed to send:', error);
  return;
}

console.log('Email sent:', data.id);
```

### Python

```python
import resend
import os

resend.api_key = os.environ.get('RESEND_API_KEY')

params: resend.Emails.SendParams = {
    "from": "Your App <noreply@yourdomain.com>",
    "to": ["user@example.com"],
    "subject": "Hello from Your App",
    "html": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
}

email = resend.Emails.send(params)
print(f"Email sent: {email['id']}")
```

## Common Use Cases

### Password Reset

```javascript
await resend.emails.send({
  from: 'Your App <security@yourdomain.com>',
  to: [user.email],
  subject: 'Reset your password',
  html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, ignore this email.</p>
  `,
  headers: {
    'X-Entity-Ref-ID': uniqueId, // Prevent threading in Gmail
  },
});
```

### OTP/Verification Code

```javascript
await resend.emails.send({
  from: 'Your App <noreply@yourdomain.com>',
  to: [user.email],
  subject: `Your verification code: ${code}`,
  html: `
    <h2>Your verification code</h2>
    <p style="font-size: 32px; font-family: monospace; letter-spacing: 8px;">
      ${code}
    </p>
    <p>This code expires in 10 minutes.</p>
  `,
});
```

### With Attachments

```javascript
import fs from 'fs';

await resend.emails.send({
  from: 'Your App <invoices@yourdomain.com>',
  to: [user.email],
  subject: 'Your Invoice #12345',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice-12345.pdf',
      content: fs.readFileSync('./invoice.pdf'),
    },
  ],
});
```

### With React Email (Node.js)

```javascript
import { WelcomeEmail } from './emails/welcome';

await resend.emails.send({
  from: 'Your App <noreply@yourdomain.com>',
  to: [user.email],
  subject: 'Welcome to Your App',
  react: WelcomeEmail({ name: user.name }),
});
```

## Webhooks

### Available Events

| Event | Description |
|-------|-------------|
| `email.sent` | Email accepted by Resend |
| `email.delivered` | Email delivered to recipient |
| `email.delivery_delayed` | Delivery temporarily delayed |
| `email.bounced` | Email bounced (hard bounce) |
| `email.complained` | Recipient marked as spam |
| `email.opened` | Email opened (if tracking enabled) |
| `email.clicked` | Link clicked (if tracking enabled) |

### Webhook Handler (Express)

```javascript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhooks/resend', async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'email.delivered':
      console.log(`Email ${event.data.email_id} delivered`);
      break;

    case 'email.bounced':
      // Remove from list or mark as invalid
      await markEmailInvalid(event.data.to);
      break;

    case 'email.complained':
      // Unsubscribe immediately
      await unsubscribeUser(event.data.to);
      break;
  }

  res.status(200).send('OK');
});
```

### Webhook IPs (for allowlisting)

```
44.228.126.217
50.112.21.217
52.24.126.164
54.148.139.208
2600:1f24:64:8000::/52 (IPv6)
```

## Domain Authentication

1. Go to [Resend Dashboard](https://resend.com/domains) → Domains → Add Domain
2. Add the DNS records provided (SPF, DKIM, DMARC)
3. Wait for verification (usually minutes, can take up to 48 hours)

**Required DNS records:**
- SPF: `v=spf1 include:_spf.resend.com ~all`
- DKIM: TXT record at `resend._domainkey.yourdomain.com` (provided in dashboard)
- DMARC: Start with `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

## Error Handling

```javascript
const { data, error } = await resend.emails.send({...});

if (error) {
  switch (error.name) {
    case 'validation_error':
      // Invalid parameters
      console.error('Invalid email params:', error.message);
      break;
    case 'rate_limit_exceeded':
      // Back off and retry
      await sleep(1000);
      break;
    case 'missing_required_field':
      console.error('Missing field:', error.message);
      break;
    default:
      console.error('Email error:', error);
  }
}
```

## Rate Limits

- Free tier: 3,000 emails/month, 100 emails/day
- Check current usage in dashboard
- Implement exponential backoff for retries

## Additional Resources

For deeper Resend integration and advanced features:
```bash
npx skills add resend/resend-skills
```

For building emails with React Email:
```bash
npx skills add resend/react-email
```
