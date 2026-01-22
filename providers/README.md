# Email Provider Implementation Guides

Code examples for implementing email features with popular email service providers.

## Providers Covered

| Provider | Best For | Docs |
|----------|----------|------|
| [Resend](./resend.md) | Modern developer experience, React Email support | [resend.com/docs](https://resend.com/docs) |
| [SendGrid](./sendgrid.md) | Enterprise scale, Twilio ecosystem | [docs.sendgrid.com](https://docs.sendgrid.com) |
| [Mailgun](./mailgun.md) | Powerful APIs, email validation | [documentation.mailgun.com](https://documentation.mailgun.com) |
| [Postmark](./postmark.md) | Transactional focus, fast delivery | [postmarkapp.com/developer](https://postmarkapp.com/developer) |

## Choosing a Provider

All providers listed here support:
- Transactional and marketing emails
- SPF, DKIM, DMARC authentication
- Webhooks for delivery events
- REST APIs and official SDKs

**Key differences:**

| Feature | Resend | SendGrid | Mailgun | Postmark |
|---------|--------|----------|---------|----------|
| React Email support | Native | No | No | No |
| Email validation API | No | Yes | Yes | No |
| Free tier | 3k/month | 100/day (trial) | 5k/month (3 months) | 100/month |
| Primary focus | Developer experience | Scale | Flexibility | Deliverability |

## Implementation Pattern

Regardless of provider, the pattern is similar:

```javascript
// 1. Install SDK
// npm install <provider-sdk>

// 2. Initialize client with API key
const client = new Provider(process.env.API_KEY);

// 3. Send email
await client.send({
  from: 'you@yourdomain.com',
  to: 'recipient@example.com',
  subject: 'Hello',
  html: '<p>Content</p>'
});

// 4. Handle webhooks for delivery events
app.post('/webhooks/email', (req, res) => {
  const event = req.body;
  // Process event (delivered, bounced, complained, etc.)
  res.status(200).send('OK');
});
```

See individual provider guides for specific implementation details.
