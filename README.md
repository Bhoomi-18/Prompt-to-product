# NexusSupport AI: Next-Gen Customer Support & Dynamic Troubleshooting Dashboard

![Version](https://img.shields.io/badge/version-2.6%20Telemetry%20Engine-blue)
![Model](https://img.shields.io/badge/LLM-Groq%20llama--3.3--70b-emerald)
![Framework](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite%208%20%2B%20Tailwind%20v4-purple)
![License](https://img.shields.io/badge/license-MIT-slate)

**NexusSupport AI** is an executive-grade customer support co-pilot and real-time operational troubleshooting dashboard inspired by the design aesthetics of Linear, Apple Vision Pro, Stripe, and Notion.

It decouples user-facing diagnostic resolution from real-time admin telemetry and human-in-the-loop escalation.

---

## ✨ Key Features

1. **Dual-Mode Intelligence Engine:**
   - **Groq Cloud Integration:** Ultra-low latency responses using `llama-3.3-70b-versatile`.
   - **Deterministic Fallback Simulation Mode:** Zero-config testing mode if no API key is provided, ensuring judges can test every feature immediately.
2. **Strict Three-Tier Prompt Architecture:**
   - **Prompt #1:** Grounded Adaptive Persona (`[DOC-XXX]` inline citations, dynamic empathy/technical tone adaptation).
   - **Prompt #2:** Background Telemetry & Entity JSON Extractor (`sentimentScore`, `urgencyScore`, `orderOrInvoiceId`, `errorCode`).
   - **Prompt #3:** Principal Escalation Action Plan Lead (root cause analysis, agent playbook, pre-drafted human reply).
3. **Client-Side PII Guardrail:**
   - Live regex scrubber masking credit cards (`[REDACTED-CC]`), SSNs (`[REDACTED-SSN]`), and API secrets before transmission.
4. **Interactive System Resolution Cards:**
   - 1-click dispatch of **Instant SLA Refunds** (+$25.00), **Tier-3 Engineering Tickets** (#ENG-8492), and **Courtesy Promo Codes** (`SLA20-OFF`) directly into the customer's chat.
5. **Human Escalation Takeover Co-Pilot:**
   - Operational diagnosis, execution checklist, and an editable takeover response with a 1-click `"Send to Chat as Human Agent"` button.
6. **Dynamic Knowledge Base Grounding Drawer:**
   - Pre-loaded with `DOC-101` (Webhooks/OAuth), `DOC-202` (Billing/Refunds), and `DOC-303` (Hardware RMA).
   - Real-time inline editing and file upload (`.txt`, `.md`, `.json`).
7. **Prompt Architecture Inspector (Tab 4):**
   - Side-by-side prompt inspector for hackathon judges with syntax-highlighted raw JSON telemetry payload.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Optional Environment Variables
No `.env` file is required to run the app. If you'd like to use your Groq API key by default:
```bash
cp .env.example .env
```
Add your key:
```env
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
```
*(Alternatively, enter your key directly into the UI in the top navigation bar).*

---

## 🛠️ Tech Stack

- **UI Library:** React 19
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4
- **Typography:** Space Grotesk (Headings), Inter (Body), JetBrains Mono (Code/Telemetry)
- **Icons:** Lucide React
- **LLM Engine:** Groq Cloud (`llama-3.3-70b-versatile`)
