/**
 * NexusSupport AI - Groq Cloud API & Simulation Engine
 * Direct integration with Groq Cloud (llama-3.3-70b-versatile)
 * featuring deterministic context-aware fallback simulation.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const STORAGE_KEY = "nexus_groq_api_key";

/**
 * Retrieves the currently active Groq API Key.
 */
export function getActiveApiKey() {
  const localKey = localStorage.getItem(STORAGE_KEY);
  if (localKey && localKey.trim().length > 0) {
    return localKey.trim();
  }
  return import.meta.env.VITE_GROQ_API_KEY || "";
}

/**
 * Persists the user's Groq API Key to localStorage.
 */
export function setActiveApiKey(key) {
  if (!key) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

/**
 * Checks whether an API key is available and formatted properly.
 */
export function hasValidApiKey() {
  const key = getActiveApiKey();
  return Boolean(key && key.startsWith("gsk_") && key.length > 20);
}

/**
 * Executes a chat completion call with Groq or falls back to simulation.
 */
export async function callGroqChat({ messages, systemPrompt, telemetry = {} }) {
  const apiKey = getActiveApiKey();
  const startTime = performance.now();

  if (apiKey) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.2,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("Groq API error response, switching to simulation fallback:", errorText);
        throw new Error(`Groq API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);
      const text = data.choices?.[0]?.message?.content || "";

      return {
        text,
        latencyMs,
        isSimulation: false,
        model: GROQ_MODEL
      };
    } catch (err) {
      console.warn("Groq Live API call failed, using graceful simulation fallback:", err.message);
    }
  }

  // Fallback Simulation Mode
  await new Promise(r => setTimeout(r, 450 + Math.random() * 250));
  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);

  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
  const simText = generateSimulatedChatResponse(lastUserMsg, telemetry);

  return {
    text: simText,
    latencyMs,
    isSimulation: true,
    model: `${GROQ_MODEL} (Local Simulation Fallback)`
  };
}

/**
 * Executes a structured JSON extraction call with Groq or falls back to simulation.
 */
export async function callGroqJson({ systemPrompt, userPrompt, fallbackGenerator }) {
  const apiKey = getActiveApiKey();

  if (apiKey) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 1024
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        const parsed = JSON.parse(rawContent);
        return { data: parsed, isSimulation: false };
      }
    } catch (err) {
      console.warn("Groq JSON call failed, using graceful simulation fallback:", err.message);
    }
  }

  // Graceful deterministic fallback
  await new Promise(r => setTimeout(r, 200 + Math.random() * 150));
  const fallbackData = fallbackGenerator();
  return { data: fallbackData, isSimulation: true };
}

/**
 * Intelligent deterministic chat generator based on user message and knowledge base.
 */
function generateSimulatedChatResponse(userMsg, telemetry = {}) {
  const text = userMsg.toLowerCase();

  // Scenario 1: Webhook 504 + Invoice INV-4829 + Credit Card
  if (text.includes("504") || (text.includes("webhook") && (text.includes("invoice") || text.includes("double")))) {
    return `### Immediate Resolution & Assistance

I completely understand how stressful this is, especially with critical production webhooks failing while seeing unexpected duplicate charges on your account. Let us get both resolved right now.

#### 1. Instant Reversal on Invoice INV-4829 [DOC-202]
- **Duplicate Charge Root Cause:** Clicking "Pay Now" during an automated ACH pending retry cycle in Stripe triggers duplicate line items.
- **Action Taken:** Your duplicate charge of **$49.00** on **INV-4829** is authorized for an instant Stripe reversal. The release will reflect back on your card within **2-3 business days**.
- **PII Protection:** Please note your payment card ending in **8844** was automatically sanitized by our client-side PII Guardrail before processing.

#### 2. Resolving Webhook Error 504 Gateway Timeout [DOC-101]
- **Technical Cause:** Error 504 on CloudSync Pro webhooks is triggered when delivery payloads exceed the standard single-packet buffer (>5MB) or when legacy TLS 1.1 cipher suites timeout on edge routers.
- **Immediate Fix:**
  1. Navigate to **Dashboard -> Settings -> Developer -> Webhooks -> Payload Fragmentation**.
  2. Toggle **"Chunked Payload Delivery"** to **ON**.
  3. Ensure your ingress gateway enforces **TLS 1.3**.

#### 3. Automatic SLA Downtime Credit
Because your production webhook downtime exceeded 30 minutes, your account automatically qualifies for an instant **$25.00 SLA Credit** (or promo code **SLA20-OFF**) under [DOC-202]. Our administrator can trigger this fulfillment card directly into this chat.`;
  }

  // Scenario 2: CloudSync SDK v2.4 + Node 20 + OAuth 403
  if (text.includes("403") || text.includes("oauth") || text.includes("sdk v2.4") || text.includes("refresh rotation")) {
    return `### CloudSync SDK OAuth Diagnostic [DOC-101]

Thank you for reporting this issue with runtime specifics. You have accurately identified a confirmed edge-case in token management.

#### Root Cause Analysis
- **Impacted Scope:** Applications running **CloudSync SDK v2.4** on **Node.js runtime v20.x**.
- **Bug Vector:** A deprecated background refresh timer in v2.4 silently halts execution after 14 days of continuous runtime, causing automatic token refresh requests to drop and returning **HTTP Error 403 (OAuth Token Expired)**.

#### Recommended Remediation
\`\`\`bash
# 1. Upgrade CloudSync SDK to latest patched release
npm install @cloudsync/sdk@latest
\`\`\`

\`\`\`javascript
// 2. Initialize with proactive refresh rotation enabled
import { CloudSyncClient } from '@cloudsync/sdk';

const client = new CloudSyncClient({
  apiKey: process.env.CLOUDSYNC_KEY,
  autoRotateRefresh: true // Enforces jittered background rotation
});
\`\`\`

#### Immediate Production Workaround
If an immediate production redeploy is blocked by change freeze, invoke \`client.auth.forceTokenRotation()\` on a scheduled 7-day cron cycle. A Tier-3 Engineering Ticket has been prepared in telemetry to verify your cluster logs.`;
  }

  // Scenario 3: Order ORD-9941 + Hardware Gateway SN-7731
  if (text.includes("ord-9941") || text.includes("sn-7731") || text.includes("rma") || text.includes("cracked ethernet") || text.includes("gateway")) {
    return `### Logistics Update & Priority Advance RMA [DOC-303]

Thank you for reaching out. Let us address both your shipment in transit and your damaged hardware unit immediately.

#### 1. In-Transit Gateway Order ORD-9941
- **Current Status:** All hardware shipments with prefix **ORD-99XX** routed through the Central Distribution Hub encountered a temporary **48-hour freight delay** due to regional severe weather conditions.
- **Next Carrier Ping:** Your package has cleared the hub customs inspection. Real-time carrier tracking refreshes every **6 hours** via FedEx Freight. Estimated delivery is now updated to Friday morning.

#### 2. Damaged Unit SN-7731 (Cracked Ethernet Port)
- **Advance RMA Authorized:** Under [DOC-303], physical port defects (such as cracked ethernet sockets or chassis fractures) automatically qualify for **Priority Advance RMA Replacement**.
- **Next Steps:**
  1. A brand new replacement unit will be dispatched within **24 hours**, before you need to ship the defective unit back.
  2. A prepaid return shipping label and courier pickup will be automatically dispatched to your registered address.
  3. Our team has prepared an official RMA fulfillment ticket for this unit.`;
  }

  // Default context-grounded response
  return `### NexusSupport AI Technical Response

Thank you for providing those details. I have cross-referenced our verified documentation:

1. **System Diagnosis:** Based on your inquiry, I have checked our operational guidelines across [DOC-101], [DOC-202], and [DOC-303].
2. **Recommended Action:**
   - For webhook or API timeouts, please verify your payload size is under 5MB or enable **Chunked Payload Delivery** under Developer Settings.
   - For billing queries, duplicate line items on invoices can be instantly refunded up to the **$50.00 automated safety cap**.
   - For hardware issues, units with physical defects qualify for **Priority Advance RMA**.

Would you like me to initiate an automated resolution card or escalate this to our Tier-2 engineering team?`;
}

/**
 * Intelligent deterministic Telemetry Extractor fallback.
 */
export function extractSimulatedTelemetry(messages, piiInfo = {}) {
  const combinedText = messages.map(m => m.content).join(" ");
  const lower = combinedText.toLowerCase();

  let sentiment = "Neutral";
  let sentimentScore = 55;
  let urgency = "Medium";
  let urgencyScore = 50;
  let urgencyReasoning = "Standard operational inquiry received.";
  let userIntent = "General System Inquiry";
  let secondaryIntent = "Technical Documentation";
  let targetDepartment = "General Support Tier-1";
  let adaptiveToneApplied = "Concise & Warm";
  let recommendedUiAction = "NONE";

  const extractedEntities = {
    orderOrInvoiceId: null,
    productOrSdkVersion: null,
    errorCode: null,
    serialNumber: null,
    detectedPiiRedacted: piiInfo.piiDetected ? "[REDACTED-CC]" : null,
    kbDocsReferenced: []
  };

  // Check Scenario 1: 504 + Invoice + Double charge
  if (lower.includes("504") || lower.includes("inv-") || lower.includes("double-charge") || lower.includes("webhook")) {
    sentiment = "Frustrated";
    sentimentScore = 24;
    urgency = "Critical";
    urgencyScore = 94;
    urgencyReasoning = "Production webhook timeout outage combined with unauthorized billing duplicate creates immediate operational churn risk.";
    userIntent = "Production Webhook Bug & Billing Dispute";
    secondaryIntent = "SLA Credit & Invoice Dispute";
    targetDepartment = "Developer Platform & Billing Ops";
    adaptiveToneApplied = "Empathetic & Direct";
    recommendedUiAction = "TRIGGER_REFUND";

    extractedEntities.orderOrInvoiceId = (combinedText.match(/INV-\d+/i) || ["INV-4829"])[0];
    extractedEntities.errorCode = "Error 504 Gateway Timeout";
    extractedEntities.kbDocsReferenced = ["DOC-101", "DOC-202"];
    if (lower.includes("4532") || lower.includes("redacted") || piiInfo.piiDetected) {
      extractedEntities.detectedPiiRedacted = "Card ending in 8844 [REDACTED-CC]";
    }
  }
  // Check Scenario 2: 403 + SDK v2.4 + Node 20
  else if (lower.includes("403") || lower.includes("sdk") || lower.includes("oauth") || lower.includes("node 20")) {
    sentiment = "Neutral";
    sentimentScore = 65;
    urgency = "High";
    urgencyScore = 78;
    urgencyReasoning = "Silent 14-day token drop impacts production authentication and requires SDK migration guidance.";
    userIntent = "OAuth Token Expiration Bug";
    secondaryIntent = "Runtime Compatibility Inquiry";
    targetDepartment = "Developer Platform / Tier-3";
    adaptiveToneApplied = "Highly Technical";
    recommendedUiAction = "GENERATE_TICKET";

    extractedEntities.productOrSdkVersion = "CloudSync SDK v2.4 (Node 20)";
    extractedEntities.errorCode = "Error 403 OAuth Token Expired";
    extractedEntities.kbDocsReferenced = ["DOC-101"];
  }
  // Check Scenario 3: ORD-9941 + SN-7731 + RMA
  else if (lower.includes("ord-") || lower.includes("sn-") || lower.includes("rma") || lower.includes("ethernet") || lower.includes("gateway")) {
    sentiment = "Confused";
    sentimentScore = 48;
    urgency = "Medium";
    urgencyScore = 64;
    urgencyReasoning = "Customer experienced 48-hour freight delay and received physically cracked unit requiring priority RMA.";
    userIntent = "Hardware Transit Delay & Damaged RMA";
    secondaryIntent = "Priority Advance Unit Replacement";
    targetDepartment = "Logistics & RMA Fulfillment";
    adaptiveToneApplied = "Concise & Warm";
    recommendedUiAction = "GENERATE_TICKET";

    extractedEntities.orderOrInvoiceId = (combinedText.match(/ORD-\d+/i) || ["ORD-9941"])[0];
    extractedEntities.serialNumber = (combinedText.match(/SN-\d+/i) || ["SN-7731"])[0];
    extractedEntities.kbDocsReferenced = ["DOC-303"];
  }

  // Synthesize 2-sentence summary
  const liveSummary = extractedEntities.orderOrInvoiceId && extractedEntities.errorCode
    ? `Customer reported ${extractedEntities.errorCode} alongside dispute for ${extractedEntities.orderOrInvoiceId}. AI grounded response in ${extractedEntities.kbDocsReferenced.join(" & ")}, advising immediate diagnostic remedy and financial SLA resolution.`
    : extractedEntities.productOrSdkVersion
    ? `Identified ${extractedEntities.errorCode || "compatibility error"} affecting ${extractedEntities.productOrSdkVersion}. Guidance provided per ${extractedEntities.kbDocsReferenced[0] || "DOC-101"} to upgrade runtime configuration.`
    : extractedEntities.serialNumber
    ? `Tracking inquiry for ${extractedEntities.orderOrInvoiceId || "shipment"} paired with physical hardware defect on unit ${extractedEntities.serialNumber}. Priority advance RMA replacement verified per DOC-303.`
    : `Active inquiry classified under ${userIntent}. AI troubleshooting grounded in verified documentation with current urgency rated ${urgency}.`;

  return {
    sentiment,
    sentimentScore,
    urgency,
    urgencyScore,
    urgencyReasoning,
    userIntent,
    secondaryIntent,
    targetDepartment,
    adaptiveToneApplied,
    extractedEntities,
    liveSummary,
    recommendedUiAction
  };
}

/**
 * Intelligent deterministic Escalation Action Plan generator.
 */
export function generateSimulatedActionPlan(messages, telemetry) {
  const combinedText = messages.map(m => m.content).join(" ");
  const lower = combinedText.toLowerCase();

  if (lower.includes("504") || lower.includes("inv-") || lower.includes("double")) {
    return {
      rootCauseDiagnosis: "Webhook packet size exceeded 5MB boundary during peak payload delivery, triggering 504 Gateway Timeout while pending Stripe ACH retry created an accidental duplicate billing entry on INV-4829.",
      whatAiAlreadyTried: [
        "Informed customer of root cause per [DOC-101] (packet buffer overflow >5MB & TLS version check).",
        "Instructed client to toggle 'Chunked Payload Delivery' in Developer Webhook Settings.",
        "Sanitized card PII and explained Stripe duplicate charge reversal policy under [DOC-202]."
      ],
      nextStepsForAgent: [
        "Verify duplicate transaction reversal on Stripe dashboard for invoice INV-4829 ($49.00).",
        "Issue automatic $25.00 SLA credit or courtesy discount code 'SLA20-OFF' per policy limit.",
        "Confirm customer toggled Chunked Delivery and monitor webhook delivery telemetry over next 15 minutes."
      ],
      suggestedAgentReply: "Hello! This is Sarah from Tier-2 Escalation Support. I have personally confirmed that the duplicate $49.00 charge on invoice INV-4829 has been reversed and will reflect on your card within 2-3 business days. Furthermore, I have applied a $25.00 SLA credit to your account to cover the webhook downtime. Please let me know once you toggle 'Chunked Payload Delivery' in Settings so I can run a live test ping on our end.",
      recommendedActionType: "REFUND"
    };
  }

  if (lower.includes("403") || lower.includes("sdk")) {
    return {
      rootCauseDiagnosis: "Known background timer rotation bug in CloudSync SDK v2.4 under Node 20 runtime halts silent token refresh every 14 days, resulting in HTTP 403 token expiration drops.",
      whatAiAlreadyTried: [
        "Cited [DOC-101] outlining the 14-day token rotation timer bug in SDK v2.4.",
        "Provided npm upgrade command to latest v2.6.2 and config snippet for 'autoRotateRefresh: true'.",
        "Offered scheduled cron workaround calling 'client.auth.forceTokenRotation()'."
      ],
      nextStepsForAgent: [
        "Create Tier-3 Platform Bug ticket referencing cluster telemetry and Node 20 runtime.",
        "Check customer auth token log to verify if emergency token rotation can be dispatched remotely.",
        "Send customer a direct link to the CloudSync v2.6.2 release notes."
      ],
      suggestedAgentReply: "Hi there! I am Alex from Platform Engineering. I see you are hitting the 14-day OAuth token rotation edge case on SDK v2.4. I have created internal ticket #ENG-8492 to track your cluster logs. In the meantime, upgrading to v2.6.2 with `autoRotateRefresh: true` completely eliminates this timer bug. Would you like me to inspect your webhook ingress logs to ensure tokens rotate smoothly after the upgrade?",
      recommendedActionType: "ENGINEERING_TICKET"
    };
  }

  return {
    rootCauseDiagnosis: "Customer hardware unit SN-7731 suffered physical ethernet port fracture, while companion transit order ORD-9941 is experiencing freight hub delays due to weather.",
    whatAiAlreadyTried: [
      "Referenced [DOC-303] explaining the regional 48-hour freight hub delay affecting ORD-99XX.",
      "Identified cracked ethernet port on SN-7731 as qualifying for Priority Advance RMA.",
      "Provided customer with carrier tracking schedule (refreshes every 6 hours)."
    ],
    nextStepsForAgent: [
      "Authorize and dispatch Priority Advance RMA Gateway replacement unit within 24 hours.",
      "Generate prepaid FedEx return shipping label and email it to customer.",
      "Attach FedEx Freight transit tracking link for ORD-9941 to the customer profile."
    ],
    suggestedAgentReply: "Hello! Marcus here from Hardware Operations. I am dispatching a brand-new Priority Advance replacement gateway for unit SN-7731 today via overnight courier. You do not need to wait for us to receive the cracked unit—just use the prepaid return label included in the box once it arrives. I am also monitoring ORD-9941 closely as it clears the regional freight hub.",
    recommendedActionType: "ENGINEERING_TICKET"
  };
}
