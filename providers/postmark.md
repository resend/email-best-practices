# Postmark Implementation Guide

Code examples for implementing email features with [Postmark](https://postmarkapp.com).

**Documentation:** [postmarkapp.com/developer](https://postmarkapp.com/developer)

## Installation

```bash
# Node.js
npm install postmark

# Python
pip install postmarker
```

## Sending Email

### Node.js

```javascript
const postmark = require('postmark');

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

try {
  const response = await client.sendEmail({
    From: 'noreply@yourdomain.com',
    To: 'user@example.com',
    Subject: 'Hello from Your App',
    TextBody: 'Welcome! Thanks for signing up.',
    HtmlBody: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
    MessageStream: 'outbound', // or 'broadcasts' for marketing
  });

  console.log('Email sent:', response.MessageID);
} catch (error) {
  console.error('Failed to send:', error);
}
```

### Python

```python
from postmarker.core import PostmarkClient
import os

postmark = PostmarkClient(server_token=os.environ['POSTMARK_SERVER_TOKEN'])

response = postmark.emails.send(
    From='noreply@yourdomain.com',
    To='user@example.com',
    Subject='Hello from Your App',
    HtmlBody='<h1>Welcome!</h1><p>Thanks for signing up.</p>',
    TextBody='Welcome! Thanks for signing up.',
)

print(f"Email sent: {response['MessageID']}")
```

## Common Use Cases

### Password Reset

```javascript
await client.sendEmail({
  From: 'security@yourdomain.com',
  To: user.email,
  Subject: 'Reset your password',
  HtmlBody: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, ignore this email.</p>
  `,
  TrackOpens: false, // Disable tracking for security emails
  TrackLinks: 'None',
});
```

### With Attachments

```javascript
const fs = require('fs');

await client.sendEmail({
  From: 'invoices@yourdomain.com',
  To: user.email,
  Subject: 'Your Invoice #12345',
  HtmlBody: '<p>Please find your invoice attached.</p>',
  Attachments: [
    {
      Name: 'invoice-12345.pdf',
      Content: fs.readFileSync('./invoice.pdf').toString('base64'),
      ContentType: 'application/pdf',
    },
  ],
});
```

### With Templates

```javascript
await client.sendEmailWithTemplate({
  From: 'noreply@yourdomain.com',
  To: user.email,
  TemplateAlias: 'welcome',
  TemplateModel: {
    name: user.name,
    activationUrl: activationUrl,
  },
});
```

### Batch Sending (up to 500 per call)

```javascript
const messages = users.map(user => ({
  From: 'noreply@yourdomain.com',
  To: user.email,
  Subject: 'Your weekly digest',
  HtmlBody: `<p>Hi ${user.name}, here's your digest...</p>`,
}));

const responses = await client.sendEmailBatch(messages);
```

## Message Streams

Postmark uses "Message Streams" to separate transactional from marketing:

```javascript
// Transactional (default)
await client.sendEmail({
  // ...
  MessageStream: 'outbound',
});

// Marketing/Broadcasts
await client.sendEmail({
  // ...
  MessageStream: 'broadcasts',
});
```

**Important:** Create separate streams in Postmark dashboard. Marketing emails require broadcast streams with unsubscribe handling.

## Webhooks

### Available Events

| Event | Description |
|-------|-------------|
| `Delivery` | Email delivered |
| `Bounce` | Email bounced |
| `SpamComplaint` | Recipient marked as spam |
| `Open` | Email opened |
| `Click` | Link clicked |
| `SubscriptionChange` | Unsubscribe or resubscribe |

### Webhook Handler (Express)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhooks/postmark', async (req, res) => {
  const event = req.body;
  const eventType = event.RecordType;

  switch (eventType) {
    case 'Delivery':
      console.log(`Delivered to ${event.Recipient}`);
      break;

    case 'Bounce':
      if (event.Type === 'HardBounce') {
        await markEmailInvalid(event.Email);
      }
      break;

    case 'SpamComplaint':
      await unsubscribeUser(event.Email);
      break;
  }

  res.status(200).send('OK');
});
```

### Webhook Security

Postmark webhooks include basic auth. Configure in dashboard:

```javascript
app.post('/webhooks/postmark', (req, res) => {
  const authHeader = req.headers.authorization;
  const expected = 'Basic ' + Buffer.from(
    `${process.env.WEBHOOK_USER}:${process.env.WEBHOOK_PASS}`
  ).toString('base64');

  if (authHeader !== expected) {
    return res.status(401).send('Unauthorized');
  }

  // Process webhook...
});
```

## Domain Authentication

1. Go to Postmark → Sender Signatures → Add Domain
2. Add the DNS records provided:
   - DKIM: CNAME record
   - Return-Path: CNAME record (for bounce handling)
3. Click "Verify"

**Note:** Postmark also requires individual sender signature verification or domain verification.

## Error Handling

```javascript
try {
  await client.sendEmail(msg);
} catch (error) {
  if (error.code === 401) {
    console.error('Invalid server token');
  } else if (error.code === 422) {
    console.error('Invalid email params:', error.message);
  } else if (error.code === 429) {
    console.error('Rate limited');
  } else {
    console.error('Send failed:', error);
  }
}
```

## Bounce Handling

Postmark automatically suppresses hard bounces. Query suppression list:

```javascript
// Get suppressed emails
const suppressions = await client.getSuppressions('outbound');

// Remove from suppression (after user verifies email)
await client.deleteSuppressions('outbound', {
  Suppressions: [{ EmailAddress: 'user@example.com' }],
});
```

## Rate Limits

- Free tier: 100 emails/month
- No hard rate limits on paid plans
- Batch endpoint: 500 emails per call, 50MB max payload
- Focus on deliverability over volume
