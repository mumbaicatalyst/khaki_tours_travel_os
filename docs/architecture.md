# System Architecture & Technical Specification
## Khaki Travel Operating System (`khaki-travel-os`)

### 1. Executive Architecture Summary

**Khaki Travel OS** is an event-driven, low-friction, high-velocity Travel Operations System purpose-engineered for Khaki Tours in Mumbai. It fuses CRM, ERP, and Omnichannel Communications into a reactive platform capable of processing instant low-ticket walking tours autonomously while providing high-touch orchestration for bespoke private tours and high-value international expeditions.

```mermaid
flowchart TD
    subgraph Inbound Channels
        WAI[WhatsApp Inbound\nMeta Cloud API / Wati BSP]
        VAI[Voice AI Inbound\nTwilio / Bland / Vapi]
        WEB[Web / OTA Widget\nNext.js Booking Portal]
    end

    subgraph Khaki Travel OS Core
        subgraph Intake & Routing
            IR[Intake Classifier & Voice Handoff Engine]
            UI[Unified Multi-Agent Inbox\nLive Takeover / Jump-In]
        end

        subgraph Business Engines
            FP[Tier 1: Fast-Path Booking Engine\nInstant UPI & Auto-Issue]
            HVP[Tier 2: Hold-vs-Pay Engine\nParallel Guide & Jeep Dispatch]
            FXE[Tier 3: Dynamic FX & Margin Engine\nUSD/INR Volatility Hedging]
            MAN[Logistics & Manifest Engine\nID & KYC Document Collector]
        end

        subgraph Accounting & Compliance
            TLS[Tally Prime Sync Engine\nGST Invoicing & Voucher XML Generator]
        end
    end

    subgraph Data & Persistence
        DB[(Supabase PostgreSQL\nRLS, Triggers, Ledgers, Enums)]
        STORAGE[(Supabase Storage\nPassports, IDs, Map Pins)]
    end

    subgraph External Ecosystem
        PG[Payment Gateways\nUPI / Razorpay / Cashfree]
        GP[Guide & Vendor Pool\nInteractive WhatsApp Buttons]
        TALLY[Tally Prime ERP\nLocal / Hosted Listener]
    end

    WAI --> IR
    VAI -->|Verbal Opt-in Handoff| IR
    WEB --> IR

    IR --> UI
    IR -->|Tier 1| FP
    IR -->|Tier 2| HVP
    IR -->|Tier 3| FXE

    FP --> PG
    FP --> DB
    HVP --> GP
    HVP --> DB
    FXE --> DB
    MAN --> STORAGE

    PG -->|Webhook Paid| DB
    PG -->|Webhook Paid| TLS
    TLS --> TALLY
```

---

## 2. Core Operational Pillars & Subsystems

### Subsystem A: Intake & Qualification Hub
1. **Voice AI Inbound Protocol:**
   - Callers connecting with Khaki Tours voice agents (powered by Vapi/Bland/Twilio) undergo fast qualification.
   - **Explicit Opt-in Rule:** Voice agent executes the mandatory script:
     > *"To ensure your booking details are 100% accurate and to send your secure payment link, may I have your permission to message you on WhatsApp right now?"*
   - Once verbal approval is recognized, the endpoint `/api/voice` triggers an outbound WhatsApp utility template to the caller's CLI phone number.
2. **Unified Multi-Agent Inbox:**
   - Centralizes real-time WhatsApp conversations, Voice AI call transcripts, and internal ops tags.
   - **Human Live Takeover ("Jump-In"):**
     - Clicking `[Takeover Session]` sets `bookings.human_takeover_active = TRUE`.
     - Suppresses bot auto-replies instantly.
     - Notifies the operations team member and locks the thread.

---

### Subsystem B: Three-Tier Operating Architecture

```mermaid
graph TD
    BookingRequest[Incoming Tour Lead] --> CategoryCheck{Tour Category?}

    CategoryCheck -->|Standard Walk ₹800-1500| Tier1[Tier 1: Fast-Path]
    CategoryCheck -->|Private Group ₹10k-20k| Tier2Check{Lead Time & Route?}
    CategoryCheck -->|International ₹1.5L-3.0L+| Tier3[Tier 3: FX Milestone Engine]

    Tier1 --> InstantPayment[Generate Instant UPI Link]
    InstantPayment --> PaymentVerify{Payment Received?}
    PaymentVerify -->|Yes| AutoConfirm[Decrement Seat + Issue WA Ticket & Map Pin]
    AutoConfirm --> AutoTally[Push Receipt to Tally Prime]

    Tier2Check -->|Standard Route & >48h| T2Fast[Collect Payment Upfront via WhatsApp]
    T2Fast --> T2DispatchGuide[Parallel Dispatch to Guide Pool]
    T2DispatchGuide -->|Unaccepted >30m| EscalationAlert[High-Priority Ops Alert]
    T2DispatchGuide -->|Accepted| T2Lock[Guide Confirmed]

    Tier2Check -->|Custom Route OR <48h OR Jeeps| T2Hold[State: PENDING_RESOURCE_LOCK]
    T2Hold --> ParallelBroadcast[Parallel WhatsApp Broadcast to Guides & Vendors]
    ParallelBroadcast --> AllConfirm{Both Guide & Jeep Accept?}
    AllConfirm -->|Yes| ExpiringLink[Send 30-Min Expiring Payment Link]
    ExpiringLink --> GuestPays{Guest Paid within 30m?}
    GuestPays -->|Yes| T2Confirm[Confirmed Booking + Tally Sync]
    GuestPays -->|No| AutoRelease[Auto-Release Resources & Broadcast Cancel]

    Tier3 --> Tier3Brochure[Instant PDF Itinerary on WhatsApp]
    Tier3Brochure --> SalesAlert[High-Priority Sales Followup]
    SalesAlert --> MilestoneEngine[Milestone Payment Schedule]
    MilestoneEngine --> DynamicFX[FX Risk Hedging: Spot + Volatility Buffer]
    DynamicFX --> Settlement30Days[Final Settlement 30 Days Prior]
    Settlement30Days --> DocPortal[Guest Manifest & Passport Portal]
```

---

### Subsystem C: Parallel Vendor & Guide Dispatch Engine
- Dispatches are dispatched via Meta Cloud API using interactive buttons:
  - `[Accept Booking]`
  - `[Decline / Busy]`
- When `broadcast_sent_at` exceeds `timeout_minutes` (default 30 mins) without acceptance:
  - Background cron/worker marks status `EXPIRED`.
  - Automatically cascades request to backup tier or fires high-priority alert to Operations Desk.

---

### Subsystem D: Dynamic FX & Volatility Engine
For Tier 3 International Expeditions:
- Spot rate $R_{\text{spot}}$ is retrieved via Forex API.
- Volatility buffer $B_{\text{volatility}}$ is applied (standard 3.00% to 5.00%).
- Guaranteed quotes are issued with defined validity horizons.
- At $T - 30\text{ days}$ to departure, final balance is settled against spot rate $R_{\text{settlement}}$.

---

### Subsystem E: Tally Prime Accounting Engine
- Emits XML vouchers conformant with Tally Prime schema.
- Automatic GST computation:
  - B2C Walk / Heritage: 5% Composite Tour Operator Scheme (SAC 998555).
  - B2B Corporate / Custom Invoices: 18% GST with input tax credit breakdown.
- Synchronized through direct HTTP XML POST to local or hosted Tally Prime port (Default: 9000).

---

## 3. Resilience, Security & Anti-Spam Strategy

1. **Meta Quality Rating Protection:**
   - Inbound click-to-chat QR codes across marketing collateral.
   - Utilization of Meta Utility and Authentication templates.
   - Strict adherence to 24-hour customer service window for free-form conversational replies.
2. **Gmail Deliverability:**
   - Plain-text 1-to-1 founder emails without tracking pixels or bloated HTML for personalized follow-ups.
3. **Database Security:**
   - Row Level Security (RLS) enabled on all tables.
   - Public anonymous access restricted strictly to active tour catalogs.
   - All write operations require authenticated staff tokens or service-role signatures for webhooks.
