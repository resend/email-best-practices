# SendGrid Implementation Guide

Code examples for implementing email features with [SendGrid](https://sendgrid.com) (Twilio).

**Documentation:** [docs.sendgrid.com](https://docs.sendgrid.com)

## Installation

```bash
# Node.js
npm install @sendgrid/mail

# Python
pip install sendgrid
```

## Sending Email

### Node.js

```javascript
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'user@example.com',
  from: 'noreply@yourdomain.com', // Must be verified sender
  subject: 'Hello from Your App',
  text: 'Welcome! Thanks for signing up.',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
};

try {
  await sgMail.send(msg);
  console.log('Email sent');
} catch (error) {
  console.error('Failed to send:', error);
  if (error.response) {
    console.error(error.response.body);
  }
}
```

### Python

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='noreply@yourdomain.com',
    to_emails='user@example.com',
    subject='Hello from Your App',
    html_content='<h1>Welcome!</h1><p>Thanks for signing up.</p>'
)

try:
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sg.send(message)
    print(f'Status: {response.status_code}')
except Exception as e:
    print(f'Error: {e}')
```

## Common Use Cases

### Password Reset

```javascript
await sgMail.send({
  to: user.email,
  from: 'security@yourdomain.com',
  subject: 'Reset your password',
  html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, ignore this email.</p>
  `,
  trackingSettings: {
    clickTracking: { enable: false }, // Disable for security emails
  },
});
```

### With Attachments

```javascript
const fs = require('fs');

await sgMail.send({
  to: user.email,
  from: 'invoices@yourdomain.com',
  subject: 'Your Invoice #12345',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      content: fs.readFileSync('./invoice.pdf').toString('base64'),
      filename: 'invoice-12345.pdf',
      type: 'application/pdf',
      disposition: 'attachment',
    },
  ],
});
```

### Batch Sending

```javascript
const messages = users.map(user => ({
  to: user.email,
  from: 'noreply@yourdomain.com',
  subject: 'Your weekly digest',
  html: `<p>Hi ${user.name}, here's your digest...</p>`,
}));

try {
  await sgMail.send(messages);
} catch (error) {
  console.error(error);
}
```

### With Dynamic Templates

```javascript
await sgMail.send({
  to: user.email,
  from: 'noreply@yourdomain.com',
  templateId: 'd-xxxxxxxxxxxxxxxxxx',
  dynamicTemplateData: {
    name: user.name,
    resetUrl: resetUrl,
  },
});
```

## Webhooks (Event Webhook)

### Available Events

| Event | Description |
|-------|-------------|
| `processed` | Email accepted for delivery |
| `delivered` | Email delivered to recipient |
| `bounce` | Email bounced |
| `dropped` | Email dropped (invalid, unsubscribed, etc.) |
| `spamreport` | Recipient marked as spam |
| `open` | Email opened |
| `click` | Link clicked |
| `unsubscribe` | Recipient unsubscribed |

### Webhook Handler (Express)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhooks/sendgrid', async (req, res) => {
  const events = req.body; // SendGrid sends array of events

  for (const event of events) {
    switch (event.event) {
      case 'delivered':
        console.log(`Email delivered to ${event.email}`);
        break;

      case 'bounce':
        await markEmailInvalid(event.email);
        break;

      case 'spamreport':
        await unsubscribeUser(event.email);
        break;

      case 'dropped':
        console.log(`Dropped: ${event.reason}`);
        break;
    }
  }

  res.status(200).send('OK');
});
```

### Webhook Security

SendGrid supports signed webhooks. Verify using their SDK:

```javascript
const { EventWebhook } = require('@sendgrid/eventwebhook');

const eventWebhook = new EventWebhook();
const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY;

app.post('/webhooks/sendgrid', (req, res) => {
  const signature = req.get('X-Twilio-Email-Event-Webhook-Signature');
  const timestamp = req.get('X-Twilio-Email-Event-Webhook-Timestamp');

  const isValid = eventWebhook.verifySignature(
    publicKey,
    req.body,
    signature,
    timestamp
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process events...
});
```

## Domain Authentication

1. Go to SendGrid Dashboard → Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Add the DNS records provided (CNAME records for DKIM, SPF)
4. Verify in dashboard

**Note:** SendGrid uses CNAME records that point to their servers, which automatically handle SPF and DKIM.

## Error Handling

```javascript
try {
  await sgMail.send(msg);
} catch (error) {
  if (error.code === 401) {
    console.error('Invalid API key');
  } else if (error.code === 403) {
    console.error('Sender not verified');
  } else if (error.code === 429) {
    console.error('Rate limited, retry later');
  } else {
    console.error('Send failed:', error.message);
  }
}
```

## Rate Limits

- Free tier: 100 emails/day for 60 days trial
- Rate limits vary by plan
- Use batch sending for bulk emails
- Implement exponential backoff for retries
