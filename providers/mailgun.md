# Mailgun Implementation Guide

Code examples for implementing email features with [Mailgun](https://www.mailgun.com).

**Documentation:** [documentation.mailgun.com](https://documentation.mailgun.com)

## Installation

```bash
# Node.js
npm install mailgun.js form-data

# Python
pip install requests  # Or use mailgun's official SDK
```

## Sending Email

### Node.js

```javascript
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

try {
  const msg = await mg.messages.create('yourdomain.com', {
    from: 'Your App <noreply@yourdomain.com>',
    to: ['user@example.com'],
    subject: 'Hello from Your App',
    text: 'Welcome! Thanks for signing up.',
    html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  });

  console.log('Email sent:', msg.id);
} catch (error) {
  console.error('Failed to send:', error);
}
```

### Python (using requests)

```python
import requests
import os

def send_email(to, subject, html):
    return requests.post(
        f"https://api.mailgun.net/v3/{os.environ['MAILGUN_DOMAIN']}/messages",
        auth=("api", os.environ['MAILGUN_API_KEY']),
        data={
            "from": f"Your App <noreply@{os.environ['MAILGUN_DOMAIN']}>",
            "to": [to],
            "subject": subject,
            "html": html,
        }
    )

response = send_email(
    "user@example.com",
    "Hello from Your App",
    "<h1>Welcome!</h1><p>Thanks for signing up.</p>"
)
print(f"Status: {response.status_code}")
```

## Common Use Cases

### Password Reset

```javascript
await mg.messages.create('yourdomain.com', {
  from: 'Your App <security@yourdomain.com>',
  to: [user.email],
  subject: 'Reset your password',
  html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, ignore this email.</p>
  `,
  'o:tracking-clicks': 'no', // Disable click tracking for security emails
});
```

### With Attachments

```javascript
const fs = require('fs');

await mg.messages.create('yourdomain.com', {
  from: 'Your App <invoices@yourdomain.com>',
  to: [user.email],
  subject: 'Your Invoice #12345',
  html: '<p>Please find your invoice attached.</p>',
  attachment: [
    {
      filename: 'invoice-12345.pdf',
      data: fs.readFileSync('./invoice.pdf'),
    },
  ],
});
```

### With Templates

```javascript
await mg.messages.create('yourdomain.com', {
  from: 'Your App <noreply@yourdomain.com>',
  to: [user.email],
  subject: 'Welcome to Your App',
  template: 'welcome',
  'h:X-Mailgun-Variables': JSON.stringify({
    name: user.name,
    activationUrl: activationUrl,
  }),
});
```

### Batch Sending with Recipient Variables

```javascript
await mg.messages.create('yourdomain.com', {
  from: 'Your App <noreply@yourdomain.com>',
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Hello %recipient.name%',
  html: '<p>Hi %recipient.name%, your code is %recipient.code%</p>',
  'recipient-variables': JSON.stringify({
    'user1@example.com': { name: 'Alice', code: '1234' },
    'user2@example.com': { name: 'Bob', code: '5678' },
  }),
});
```

## Webhooks

### Available Events

| Event | Description |
|-------|-------------|
| `accepted` | Email accepted by Mailgun |
| `delivered` | Email delivered to recipient |
| `failed` | Delivery failed (permanent) |
| `temporary-failure` | Delivery failed (temporary) |
| `complained` | Recipient marked as spam |
| `opened` | Email opened |
| `clicked` | Link clicked |
| `unsubscribed` | Recipient unsubscribed |

### Webhook Handler (Express)

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/webhooks/mailgun', async (req, res) => {
  // Verify webhook signature
  const { timestamp, token, signature } = req.body;
  const hash = crypto
    .createHmac('sha256', process.env.MAILGUN_WEBHOOK_SIGNING_KEY)
    .update(timestamp + token)
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).send('Invalid signature');
  }

  const eventData = req.body['event-data'];
  const eventType = eventData.event;

  switch (eventType) {
    case 'delivered':
      console.log(`Delivered to ${eventData.recipient}`);
      break;

    case 'failed':
      await markEmailInvalid(eventData.recipient);
      break;

    case 'complained':
      await unsubscribeUser(eventData.recipient);
      break;
  }

  res.status(200).send('OK');
});
```

## Email Validation API

Mailgun offers email validation (separate from sending):

```javascript
const validationResult = await mg.validate.get('user@example.com');

console.log(validationResult);
// {
//   is_valid: true,
//   address: 'user@example.com',
//   is_disposable_address: false,
//   is_role_address: false,
//   risk: 'low'
// }
```

## Domain Authentication

1. Go to Mailgun Dashboard → Sending → Domains → Add New Domain
2. Add the DNS records provided:
   - SPF: TXT record
   - DKIM: TXT record (two records for rotation)
   - MX records (if receiving email)
3. Click "Verify DNS Settings"

**Sandbox domain:** Mailgun provides a sandbox domain for testing, but you can only send to verified recipients.

## Error Handling

```javascript
try {
  await mg.messages.create('yourdomain.com', msg);
} catch (error) {
  if (error.status === 401) {
    console.error('Invalid API key');
  } else if (error.status === 400) {
    console.error('Bad request:', error.message);
  } else if (error.status === 429) {
    console.error('Rate limited');
  } else {
    console.error('Send failed:', error);
  }
}
```

## Rate Limits

- Free tier: 5,000 emails/month for first 3 months
- Then pay-as-you-go pricing
- No hard rate limits, but sending too fast can impact deliverability
- Use batch sending for bulk emails
