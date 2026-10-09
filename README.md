# Khaki Travel Operating System (`khaki-travel-os`)

Custom, low-friction, high-velocity Travel Operations System (CRM + ERP + Omnichannel Hub) purpose-built for **Khaki Tours** in Mumbai.

---

## 🎯 System Overview

Khaki Travel OS unifies guest intake, instant fast-path booking, automated guide/vendor dispatch, dynamic international forex hedging, guest manifest collection, and Tally Prime accounting synchronization into a single real-time platform.

### Core Pillars
1. **Three-Tier Operating Model:**
   - **Tier 1 (Standard Scheduled Walking Tours):** 100% automated fast-path booking via Web/WhatsApp/OTA $\rightarrow$ Instant UPI link $\rightarrow$ Auto seat decrement $\rightarrow$ Ticket & Map pin $\rightarrow$ Tally sync. Zero human intervention.
   - **Tier 2 (Private Group & Heritage Tours):** Hybrid hold-vs-pay engine. Fast-track upfront payment (>48h lead time) vs. Hold-track parallel guide & jeep resource locking (<48h or custom routes) with 30-minute expiring payment links.
   - **Tier 3 (International Outbound Expeditions):** High-touch consultation, dynamic FX volatility buffers ($B_{\text{volatility}}$), milestone payments (Deposit $\rightarrow$ Milestone 1 $\rightarrow$ Final Balance 30 days prior locked to spot $R_{\text{settlement}}$), and automated passport/visa portals.
2. **Omnichannel WhatsApp & Voice AI Hub:**
   - Voice AI caller qualification with explicit verbal WhatsApp opt-in handoff.
   - Unified multi-agent inbox with instant 1-click **Human Takeover ("Jump-In")** capability.
   - Anti-spam compliance (plain-text founder emails bypassing Gmail Promotions, WhatsApp inbound click-to-chat QR codes, Meta utility templates).
3. **Enterprise Integrations:**
   - Supabase (PostgreSQL with Row-Level Security & Triggers).
   - Meta Cloud API / Wati BSP for interactive WhatsApp notifications and buttons (`[Accept]` / `[Decline]`).
   - Tally Prime XML/JSON voucher sync with automated GST calculations (5% composite / 18% corporate).

---

## 📁 Repository Structure

```
khaki_tours_os/
├── docs/
│   ├── architecture.md             # Complete system architecture & flow diagrams
│   ├── state-machines.md           # State transition diagrams for all tour types & dispatch
│   ├── database-schema.sql         # Full PostgreSQL / Supabase DDL schema with RLS & triggers
│   ├── api-spec.yaml               # OpenAPI 3.0 specs for webhooks & internal endpoints
│   ├── fx-engine-spec.md           # Dynamic USD/INR Forex risk mitigation & margin formulas
│   └── integrations.md             # Wati/Meta Cloud API, Voice AI, & Tally Prime API specs
├── src/
│   ├── app/                        # Next.js App Router (Dashboard, APIs, Auth)
│   ├── components/                 # UI Library (Inbox, Dispatch board, FX Simulator)
│   ├── lib/                        # Service Clients (Supabase, WhatsApp, Voice AI, Tally)
│   ├── modules/                    # Business Logic (Intake, Dispatch rules, FX, Manifests, Tally)
│   └── types/                      # TypeScript Definitions (Database, Dispatch, FX, WhatsApp)
├── public/                         # Brand assets, map templates
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL or Supabase project

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

WHATSAPP_API_TOKEN=your_meta_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
WATI_API_ENDPOINT=https://live-mt-server.wati.io
WATI_ACCESS_TOKEN=your_wati_token

VOICE_AI_WEBHOOK_SECRET=your_voice_webhook_secret

TALLY_PRIME_HOST=http://localhost:9000
TALLY_COMPANY_NAME="Khaki Tours Private Limited"
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📖 Documentation Index
- [Architecture & Flow Diagrams](file:///Users/farazdakhafizjee/Projects/khaki_tours/khaki_tours_os/docs/architecture.md)
- [State Machine Specifications](file:///Users/farazdakhafizjee/Projects/khaki_tours/khaki_tours_os/docs/state-machines.md)
- [PostgreSQL / Supabase DDL Schema](file:///Users/farazdakhafizjee/Projects/khaki_tours/khaki_tours_os/docs/database-schema.sql)
- [OpenAPI 3.0 Specifications](file:///Users/farazdakhafizjee/Projects/khaki_tours/khaki_tours_os/docs/api-spec.yaml)
- [Dynamic FX Risk Engine Spec](file:///Users/farazdakhafizjee/Projects/khaki_tours/khaki_tours_os/docs/fx-engine-spec.md)
- [Third-Party Integrations Guide](file:///Users/farazdakhafizjee/Projects/khaki_tours/khaki_tours_os/docs/integrations.md)
