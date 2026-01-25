#!/usr/bin/env node
/**
 * check-dns-auth.js - Verify SPF, DKIM, and DMARC records for a domain
 *
 * Usage: node check-dns-auth.js <domain> [dkim-selector]
 *
 * Examples:
 *   node scripts/check-dns-auth.js example.com
 *   node scripts/check-dns-auth.js example.com google
 *
 * No external dependencies - uses Node.js built-in dns module.
 */

const dns = require('dns').promises;

// Colors for terminal output
const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
};

const domain = process.argv[2];
const dkimSelector = process.argv[3] || null;

if (!domain) {
  console.log(`Usage: node ${process.argv[1]} <domain> [dkim-selector]`);
  console.log('');
  console.log('Arguments:');
  console.log('  domain         The domain to check (required)');
  console.log('  dkim-selector  DKIM selector to check (optional)');
  console.log('');
  console.log('Common DKIM selectors by provider:');
  console.log('  resend      - Resend');
  console.log('  google      - Google Workspace');
  console.log('  selector1   - Microsoft 365');
  console.log('  selector2   - Microsoft 365 (backup)');
  console.log('  k1          - Mailchimp');
  console.log('  default     - Many providers');
  console.log('');
  console.log('Examples:');
  console.log(`  node ${process.argv[1]} example.com`);
  console.log(`  node ${process.argv[1]} example.com google`);
  process.exit(1);
}

async function resolveTxt(hostname) {
  try {
    const records = await dns.resolveTxt(hostname);
    // dns.resolveTxt returns array of arrays, join inner arrays
    return records.map((r) => r.join(''));
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return [];
    }
    throw err;
  }
}

async function resolveMx(hostname) {
  try {
    return await dns.resolveMx(hostname);
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return [];
    }
    throw err;
  }
}

async function checkSPF(domain) {
  console.log(colors.blue('[SPF Record]'));

  const txtRecords = await resolveTxt(domain);
  const spfRecord = txtRecords.find((r) => r.toLowerCase().startsWith('v=spf1'));

  if (spfRecord) {
    console.log(`${colors.green('Found:')} ${spfRecord}`);

    if (spfRecord.includes('-all')) {
      console.log(
        `${colors.green('Policy:')} Strict (-all) - unauthorized senders will be rejected`
      );
    } else if (spfRecord.includes('~all')) {
      console.log(
        `${colors.yellow('Policy:')} Soft fail (~all) - unauthorized senders marked but not rejected`
      );
    } else if (spfRecord.includes('?all')) {
      console.log(`${colors.yellow('Policy:')} Neutral (?all) - no policy on unauthorized senders`);
    } else if (spfRecord.includes('+all')) {
      console.log(
        `${colors.red('Policy:')} Allow all (+all) - INSECURE, anyone can send as your domain`
      );
    }
    return true;
  } else {
    console.log(colors.red('Not found'));
    console.log('Recommendation: Add an SPF record to prevent spoofing');
    console.log('Example: v=spf1 include:_spf.google.com ~all');
    return false;
  }
}

// Common DKIM selectors to try during auto-discovery
const COMMON_SELECTORS = [
  'google', 'g',                          // Google Workspace
  'selector1', 'selector2', 's1', 's2',   // Microsoft 365
  'k1', 'k2', 'k3',                       // Mailchimp and others
  'default', 'dkim', 'mail', 'email',     // Generic
  'resend',                               // Resend
  'smtp', 'sendgrid', 'mailgun', 'ses',   // ESPs
  'cm', 'mandrill', 'mta', 'mx',          // Other ESPs
];

async function tryDkimSelector(domain, selector) {
  const dkimDomain = `${selector}._domainkey.${domain}`;
  const txtRecords = await resolveTxt(dkimDomain);
  return txtRecords.find((r) => r.toLowerCase().includes('v=dkim1') || r.includes('p='));
}

async function discoverDkimSelectors(domain) {
  const found = [];
  await Promise.all(
    COMMON_SELECTORS.map(async (selector) => {
      const record = await tryDkimSelector(domain, selector);
      if (record) {
        found.push({ selector, record });
      }
    })
  );
  return found;
}

async function checkDKIM(domain, selector) {
  console.log(colors.blue('[DKIM Record]'));

  // If selector provided, try it first
  if (selector) {
    console.log(`Checking selector: ${selector}`);
    const dkimRecord = await tryDkimSelector(domain, selector);

    if (dkimRecord) {
      console.log(`${colors.green('Found:')}`);
      const wrapped = dkimRecord.match(/.{1,80}/g) || [dkimRecord];
      wrapped.forEach((line) => console.log(line));

      if (dkimRecord.toLowerCase().includes('p=')) {
        console.log(`${colors.green('Status:')} Public key present`);
      }
      return true;
    } else {
      console.log(colors.yellow(`Not found for selector '${selector}'`));
    }
  }

  // Auto-discover: no selector provided OR provided selector not found
  console.log('Scanning common selectors...');
  const discovered = await discoverDkimSelectors(domain);

  if (discovered.length > 0) {
    console.log(`${colors.green('Found')} ${discovered.length} DKIM record(s):`);
    discovered.forEach(({ selector: sel, record }) => {
      console.log(`\n  ${colors.green('Selector:')} ${sel}`);
      const wrapped = record.match(/.{1,70}/g) || [record];
      wrapped.forEach((line) => console.log(`  ${line}`));
    });
    return true;
  } else {
    console.log(colors.yellow('No DKIM records found'));
    console.log('DKIM may not be configured, or uses a non-standard selector');
    return false;
  }
}

async function checkDMARC(domain) {
  console.log(colors.blue('[DMARC Record]'));

  const dmarcDomain = `_dmarc.${domain}`;
  const txtRecords = await resolveTxt(dmarcDomain);
  const dmarcRecord = txtRecords.find((r) => r.toLowerCase().startsWith('v=dmarc1'));

  if (dmarcRecord) {
    console.log(`${colors.green('Found:')} ${dmarcRecord}`);

    const policyMatch = dmarcRecord.match(/p=([^;]+)/);
    const policy = policyMatch ? policyMatch[1].trim().toLowerCase() : '';

    switch (policy) {
      case 'none':
        console.log(`${colors.yellow('Policy:')} Monitor only (p=none) - no action on failures`);
        break;
      case 'quarantine':
        console.log(`${colors.green('Policy:')} Quarantine (p=quarantine) - failures go to spam`);
        break;
      case 'reject':
        console.log(`${colors.green('Policy:')} Reject (p=reject) - failures are rejected`);
        break;
    }

    if (dmarcRecord.includes('rua=')) {
      console.log(`${colors.green('Reporting:')} Aggregate reports configured`);
    } else {
      console.log(`${colors.yellow('Reporting:')} No aggregate reports (rua) configured`);
    }
    return true;
  } else {
    console.log(colors.red('Not found'));
    console.log('Recommendation: Add a DMARC record for visibility and protection');
    console.log(`Start with: v=DMARC1; p=none; rua=mailto:dmarc@${domain}`);
    return false;
  }
}

async function checkMX(domain) {
  console.log(colors.blue('[MX Records]'));

  const mxRecords = await resolveMx(domain);

  if (mxRecords.length > 0) {
    console.log(`${colors.green('Found:')}`);
    mxRecords
      .sort((a, b) => a.priority - b.priority)
      .forEach((r) => console.log(`${r.priority} ${r.exchange}`));
    return true;
  } else {
    console.log(colors.yellow('No MX records found'));
    console.log('This domain cannot receive email');
    return false;
  }
}

async function main() {
  console.log(colors.blue(`Checking email authentication for: ${domain}`));
  console.log('================================================');
  console.log('');

  const spfOk = await checkSPF(domain);
  console.log('');

  const dkimOk = await checkDKIM(domain, dkimSelector);
  console.log('');

  const dmarcOk = await checkDMARC(domain);
  console.log('');

  await checkMX(domain);
  console.log('');

  // Summary
  console.log('================================================');
  console.log(colors.blue('Summary'));
  console.log('================================================');

  let issues = 0;

  if (!spfOk) {
    console.log(`${colors.red('[FAIL]')} SPF record missing`);
    issues++;
  } else {
    console.log(`${colors.green('[PASS]')} SPF record exists`);
  }

  if (dkimOk === null) {
    console.log(`${colors.yellow('[SKIP]')} DKIM not checked (no selector provided)`);
  } else if (!dkimOk) {
    console.log(`${colors.yellow('[WARN]')} DKIM record not found (try a different selector)`);
  } else {
    console.log(`${colors.green('[PASS]')} DKIM record exists`);
  }

  if (!dmarcOk) {
    console.log(`${colors.red('[FAIL]')} DMARC record missing`);
    issues++;
  } else {
    console.log(`${colors.green('[PASS]')} DMARC record exists`);
  }

  console.log('');
  if (issues === 0) {
    console.log(colors.green('All critical records found!'));
  } else {
    console.log(colors.yellow(`Found ${issues} issue(s) to address`));
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
