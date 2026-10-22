/**
 * NexusSupport AI - Master Knowledge Base
 * Pre-loaded with exact technical specifications, SLA refund policies, and RMA rules.
 */

export const DEFAULT_KNOWLEDGE_DOCS = [
  {
    id: "DOC-101",
    title: "CloudSync Pro API & Webhook Troubleshooting",
    category: "Technical & Developer API",
    lastUpdated: "2026-10-15",
    content: `[DOC-101: CloudSync Pro API & Webhook Troubleshooting]
Overview:
CloudSync Pro manages real-time distributed webhook feeds and OAuth authentication for enterprise nodes.

1. Error 504 Gateway Timeout:
- Root Cause: Webhook delivery payload exceeds the standard single-packet buffer (>5MB) OR the receiving client is negotiating over legacy TLS 1.1 cipher suites that timeout on cloud edges.
- Remediation:
  a. Enable "Chunked Payload Delivery" under Dashboard -> Settings -> Developer -> Webhooks -> Payload Fragmentation.
  b. Force minimum TLS version to TLS 1.3 on the ingress gateway.
  c. If webhook failures persist >30 minutes, users qualify for an automatic SLA credit under DOC-202.

2. Error 403 OAuth Token Expired (Silent Drops):
- Root Cause: Occurs every 14 days when client applications run CloudSync SDK v2.4 on Node.js runtime v20.x due to a deprecated background refresh timer rotation bug.
- Remediation:
  a. Upgrade immediately to CloudSync SDK v2.6.2 or higher ('npm install @cloudsync/sdk@latest').
  b. Initialize client with 'autoRotateRefresh: true' in the configuration options.
  c. Temporary hotfix: Call 'client.auth.forceTokenRotation()' every 7 days as a scheduled cron.`
  },
  {
    id: "DOC-202",
    title: "Billing, Double Charges & SLA Credits Policy",
    category: "Billing & Subscriptions",
    lastUpdated: "2026-10-18",
    content: `[DOC-202: Billing, Double Charges & SLA Credits]
Overview:
Governs financial adjustments, duplicate transaction remedies, and automated customer compensation.

1. Duplicate Charges & Invoices:
- Symptoms: Customer reports identical line items or consecutive charges against an invoice identifier formatted as 'INV-XXXX' (e.g. INV-4829).
- Cause: Triggered when an end-user manually clicks "Pay Now" during an automated ACH pending retry cycle in Stripe.
- Remediation:
  a. Immediate Stripe reversal is authorized for duplicate invoice line items.
  b. The duplicate charge is released immediately, reflecting back on the original card within 2-3 business days.

2. SLA Outage Credits & Courtesy Discounts:
- If CloudSync webhook or API downtime exceeds 30 minutes in a single calendar day, Pro and Enterprise tier customers qualify for:
  a. Instant $25.00 SLA Credit applied directly to the current billing period.
  b. OR a courtesy 20% renewal discount promo code: 'SLA20-OFF'.
- Strict Guardrail: The maximum automated refund amount an AI agent or Tier-1 support agent may authorize without Tier-2 manager sign-off is $50.00. Amounts above $50.00 must be routed to Tier-2 Finance.`
  },
  {
    id: "DOC-303",
    title: "Hardware Gateway Orders & RMA Replacement Policy",
    category: "Logistics & Hardware",
    lastUpdated: "2026-10-20",
    content: `[DOC-303: Hardware Gateway Orders & RMA Policy]
Overview:
Covers fulfillment delays, tracking for physical IoT gateways, and advance hardware exchange.

1. Order Tracking & Transit Delays (Prefix ORD-99XX):
- Status: All hardware gateway shipments matching prefix 'ORD-99XX' (e.g. ORD-9941) routed through the Central Distribution Hub experienced an unexpected 48-hour freight delay due to severe weather conditions.
- Carrier Status: Shipments have cleared customs and automated carrier tracking updates refresh every 6 hours via FedEx Freight API.

2. Damaged Hardware & Advance RMA Policy:
- Serial Identification: Hardware Gateway units feature serial numbers formatted as 'SN-XXXX' (e.g. SN-7731).
- Defect Policy: Any unit received with physical port defects (cracked ethernet ports, loose SMA antenna mounts, or chassis damage) qualifies immediately for a 'Priority Advance RMA Replacement'.
- Procedure:
  a. A replacement unit is dispatched within 24 hours prior to the customer returning the damaged unit.
  b. System generates a prepaid return shipping label and dispatches ticket to Logistics queue.`
  }
];

export const getCompiledKnowledgeBaseText = (docs = DEFAULT_KNOWLEDGE_DOCS) => {
  return docs.map(doc => doc.content).join("\n\n---\n\n");
};
