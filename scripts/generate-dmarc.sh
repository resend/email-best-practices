#!/bin/bash
#
# generate-dmarc.sh - Generate a DMARC DNS record
#
# Usage: ./generate-dmarc.sh [options]
#
# Examples:
#   ./generate-dmarc.sh --domain example.com --email dmarc@example.com
#   ./generate-dmarc.sh -d example.com -p quarantine -e dmarc@example.com

set -euo pipefail

# Defaults
DOMAIN=""
POLICY="none"
SUBDOMAIN_POLICY=""
PERCENTAGE="100"
AGGREGATE_EMAIL=""
FORENSIC_EMAIL=""
ALIGNMENT_SPF="r"
ALIGNMENT_DKIM="r"

usage() {
    cat << EOF
Usage: $0 [options]

Generate a DMARC DNS record for your domain.

Required:
  -d, --domain <domain>       Your domain name (e.g., example.com)
  -e, --email <email>         Email address for aggregate reports

Optional:
  -p, --policy <policy>       DMARC policy: none, quarantine, reject (default: none)
  -s, --subdomain <policy>    Subdomain policy: none, quarantine, reject (default: same as policy)
  -P, --percentage <0-100>    Percentage of messages to apply policy (default: 100)
  -f, --forensic <email>      Email for forensic/failure reports
  -A, --aspf <r|s>            SPF alignment: r=relaxed, s=strict (default: r)
  -K, --adkim <r|s>           DKIM alignment: r=relaxed, s=strict (default: r)
  -h, --help                  Show this help message

Policy levels (recommended progression):
  none       - Monitor only, no action taken (start here)
  quarantine - Send failures to spam folder
  reject     - Block failures entirely (most secure)

Examples:
  # Start monitoring (recommended first step)
  $0 -d example.com -e dmarc@example.com -p none

  # Move to quarantine after monitoring
  $0 -d example.com -e dmarc@example.com -p quarantine

  # Full protection
  $0 -d example.com -e dmarc@example.com -p reject

  # Gradual rollout (25% reject, rest monitor)
  $0 -d example.com -e dmarc@example.com -p reject -P 25
EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -p|--policy)
            POLICY="$2"
            shift 2
            ;;
        -s|--subdomain)
            SUBDOMAIN_POLICY="$2"
            shift 2
            ;;
        -P|--percentage)
            PERCENTAGE="$2"
            shift 2
            ;;
        -e|--email)
            AGGREGATE_EMAIL="$2"
            shift 2
            ;;
        -f|--forensic)
            FORENSIC_EMAIL="$2"
            shift 2
            ;;
        -A|--aspf)
            ALIGNMENT_SPF="$2"
            shift 2
            ;;
        -K|--adkim)
            ALIGNMENT_DKIM="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Validation
if [[ -z "$DOMAIN" ]]; then
    echo "Error: Domain is required (-d, --domain)"
    echo "Use --help for usage information"
    exit 1
fi

if [[ -z "$AGGREGATE_EMAIL" ]]; then
    echo "Error: Aggregate report email is required (-e, --email)"
    echo "Use --help for usage information"
    exit 1
fi

if [[ ! "$POLICY" =~ ^(none|quarantine|reject)$ ]]; then
    echo "Error: Policy must be one of: none, quarantine, reject"
    exit 1
fi

if [[ -n "$SUBDOMAIN_POLICY" && ! "$SUBDOMAIN_POLICY" =~ ^(none|quarantine|reject)$ ]]; then
    echo "Error: Subdomain policy must be one of: none, quarantine, reject"
    exit 1
fi

if [[ ! "$PERCENTAGE" =~ ^[0-9]+$ ]] || [[ "$PERCENTAGE" -lt 0 ]] || [[ "$PERCENTAGE" -gt 100 ]]; then
    echo "Error: Percentage must be between 0 and 100"
    exit 1
fi

if [[ ! "$ALIGNMENT_SPF" =~ ^[rs]$ ]]; then
    echo "Error: SPF alignment must be 'r' (relaxed) or 's' (strict)"
    exit 1
fi

if [[ ! "$ALIGNMENT_DKIM" =~ ^[rs]$ ]]; then
    echo "Error: DKIM alignment must be 'r' (relaxed) or 's' (strict)"
    exit 1
fi

# Build the DMARC record
RECORD="v=DMARC1; p=${POLICY}"

# Add subdomain policy if different from main policy
if [[ -n "$SUBDOMAIN_POLICY" ]]; then
    RECORD="${RECORD}; sp=${SUBDOMAIN_POLICY}"
fi

# Add percentage if not 100
if [[ "$PERCENTAGE" != "100" ]]; then
    RECORD="${RECORD}; pct=${PERCENTAGE}"
fi

# Add aggregate reporting
RECORD="${RECORD}; rua=mailto:${AGGREGATE_EMAIL}"

# Add forensic reporting if specified
if [[ -n "$FORENSIC_EMAIL" ]]; then
    RECORD="${RECORD}; ruf=mailto:${FORENSIC_EMAIL}"
fi

# Add alignment settings if not default (relaxed)
if [[ "$ALIGNMENT_SPF" == "s" ]]; then
    RECORD="${RECORD}; aspf=s"
fi

if [[ "$ALIGNMENT_DKIM" == "s" ]]; then
    RECORD="${RECORD}; adkim=s"
fi

# Output
echo ""
echo "DMARC Record for ${DOMAIN}"
echo "========================================"
echo ""
echo "DNS Record Type: TXT"
echo "Host/Name:       _dmarc.${DOMAIN}"
echo "                 (or just '_dmarc' depending on your DNS provider)"
echo ""
echo "Value:"
echo "------"
echo "${RECORD}"
echo ""
echo "========================================"
echo ""
echo "Configuration Summary:"
echo "  - Policy: ${POLICY}"
if [[ -n "$SUBDOMAIN_POLICY" ]]; then
    echo "  - Subdomain Policy: ${SUBDOMAIN_POLICY}"
fi
if [[ "$PERCENTAGE" != "100" ]]; then
    echo "  - Percentage: ${PERCENTAGE}% of messages"
fi
echo "  - Aggregate Reports: ${AGGREGATE_EMAIL}"
if [[ -n "$FORENSIC_EMAIL" ]]; then
    echo "  - Forensic Reports: ${FORENSIC_EMAIL}"
fi
echo "  - SPF Alignment: $([ "$ALIGNMENT_SPF" == "r" ] && echo "relaxed" || echo "strict")"
echo "  - DKIM Alignment: $([ "$ALIGNMENT_DKIM" == "r" ] && echo "relaxed" || echo "strict")"
echo ""

# Recommendations based on policy
case "$POLICY" in
    none)
        echo "Recommendation:"
        echo "  You're starting with 'none' - good choice for initial deployment."
        echo "  Monitor your DMARC reports for 2-4 weeks, then progress to 'quarantine'."
        ;;
    quarantine)
        echo "Recommendation:"
        echo "  Messages failing DMARC will go to spam. Monitor for false positives."
        echo "  Once confident, progress to 'reject' for full protection."
        ;;
    reject)
        echo "Recommendation:"
        echo "  Full protection enabled. Failed messages will be rejected."
        echo "  Continue monitoring reports for any legitimate senders being blocked."
        ;;
esac

# External domain warning
AGGREGATE_DOMAIN=$(echo "$AGGREGATE_EMAIL" | sed 's/.*@//')
if [[ "$AGGREGATE_DOMAIN" != "$DOMAIN" ]]; then
    echo ""
    echo "Warning:"
    echo "  Your report email (${AGGREGATE_EMAIL}) is on a different domain."
    echo "  The receiving domain must publish a DNS record to accept reports:"
    echo "  ${DOMAIN}._report._dmarc.${AGGREGATE_DOMAIN} TXT \"v=DMARC1\""
fi
