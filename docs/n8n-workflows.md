# Workflow Orchestration Architecture: n8n & Make.com
## Khaki Travel Operating System (`khaki-travel-os`)

### 1. Executive Concept

**Khaki Travel OS serves as the single source of truth (Core Database, State Machines, Inventory & Pricing Engine).** 

External communications, multichannel triggers, and event routing are orchestrated through **n8n** (self-hosted / cloud) or **Make.com**. This enables zero-code adjustments to notification rules, timing delays, and messaging channels without touching core application code.

```mermaid
flowchart TD
    subgraph External Actors (100% WhatsApp / Voice)
        GUEST[Guest / Traveler]
        GUIDE[Ambassador / Guide\n(Zero Login - WhatsApp Only)]
        VENDOR[Jeep / Boat Vendor\n(Zero Login - WhatsApp Only)]
    end

    subgraph Integration & Automation Layer (n8n / Make.com)
        N8N_INBOUND[n8n: Inbound Router\nMeta/Wati Webhook Ingestion]
        N8N_DISPATCH[n8n: Guide Dispatch Broadcaster\nButtons + 30m Escalation Timer]
        N8N_BRIEFING[n8n: T-2h Manifest Delivery\nAutomated WhatsApp PDF/Summary]
        N8N_CORP_SLA[n8n: SLA Breach Alert\n15m Stale Lead Mobile Push]
    end

    subgraph Khaki Travel OS (Core Cockpit)
        OS_API[Khaki OS REST & Webhook APIs\n/api/agent-query/*, /api/dispatch/*]
        OS_DB[(PostgreSQL / Supabase\nTours, Departures, Bookings, Manifests)]
        OS_UI[Operations Web Control Room\nBharat, Priya & Internal Ops Desk]
    end

    GUEST <-->|WhatsApp / Voice| N8N_INBOUND
    N8N_INBOUND <-->|JSON Webhook| OS_API
    
    OS_API -->|Trigger Dispatch Event| N8N_DISPATCH
    N8N_DISPATCH -->|Interactive Buttons| GUIDE
    N8N_DISPATCH -->|Interactive Buttons| VENDOR
    GUIDE -->|Clicks [Accept]/[Decline]| N8N_DISPATCH
    N8N_DISPATCH -->|POST /api/dispatch/{id}/respond| OS_API

    OS_API -->|Scheduled Event| N8N_BRIEFING
    N8N_BRIEFING -->|Auto Briefing & Map Pin| GUIDE

    OS_API -->|SLA Breach Event| N8N_CORP_SLA
    N8N_CORP_SLA -->|Mobile Alert / WhatsApp| OS_UI
```

---

## 2. Core Operational Reality: Zero-Login External Actors

### A. The Volunteer Ambassador Reality
* **Who they are:** Khaki's 36 Ambassadors are working professionals (lawyers, doctors, bankers, researchers) who volunteer or contract on weekends.
* **The Rule:** **They will NEVER log into a web dashboard or mobile app.** 
* **Their Sole Touchpoint:** **100% Native WhatsApp.**
  1. **Tour Invitation:** Receives an interactive WhatsApp template:
     > *"New Tour Opportunity! Saturday 4:30 PM: Fort Heritage Walk (18 Pax). Payout: ₹2,500. [Accept Tour] | [Decline / Busy]"*
  2. **Confirmation & Lock:** Once accepted, receives meeting pin and calendar event.
  3. **T - 2 Hours Briefing:** Receives automated WhatsApp summary with guest manifest (names, emergency contacts, dietary flags: *"3 Vegetarians, 1 Mobility flag"*).
  4. **Post-Tour Debrief:** Automated message checking attendance and confirming payout accrual.

### B. The Vendor Reality (Jeeps & Boats)
* Open jeep drivers and wooden sailboat captains communicate strictly via WhatsApp or automated phone call.
* Interactive buttons or simple reply text (`1` for Accept, `2` for Busy) are consumed by the n8n webhook and fed back to Khaki OS.

---

## 3. Pre-Built n8n / Make.com Workflow Blueprints

### Workflow 1: Guide Parallel Dispatch & 30-Minute Escalation
1. **Trigger:** `POST /api/dispatch` emits a webhook event `DISPATCH_REQUEST_CREATED`.
2. **n8n Action 1:** Queries `GET /api/agent-query/guides` for eligible ambassadors in that tour's geographic zone.
3. **n8n Action 2:** Sends Meta Cloud API interactive button template to the guide pool.
4. **n8n Wait Node:** Waits up to **30 minutes** for a webhook callback on button click.
5. **Branch A (Guide Clicks [Accept]):**
   - Calls `POST /api/dispatch/{id}/respond` with `response: ACCEPT`.
   - Sends confirmation WhatsApp to the winning guide.
   - Sends cancellation notice to other broadcasted guides: *"This tour has been claimed. Thank you!"*
6. **Branch B (Timeout / No Response in 30 mins):**
   - Calls `POST /api/dispatch/{id}/expire`.
   - Fires high-priority mobile WhatsApp alert to **Priya's Operations Desk**:
     > *"⚠️ URGENT ESCALATION: Fort Walk (Saturday 4:30 PM) had zero guide responses in 30 mins. Manual allocation required."*

---

### Workflow 2: Corporate B2B Lead Fast-Track & SLA Guard
1. **Trigger:** Inbound WhatsApp message arrives via Meta webhook.
2. **n8n Action 1:** Calls `POST /api/agent-query/leads/classify`.
3. **Branch A (P1 Corporate Lead Detected):**
   - Flags lead in Khaki OS inbox with 15-minute SLA timer.
   - Pings **Bharat Gothoskar's** phone via instant WhatsApp alert:
     > *"🏢 High-LTV Corporate Lead: Godrej Properties inquired for 8 foreign clients this weekend. 15-minute SLA active."*
4. **n8n Action 2 (SLA Monitor):** Checks back in 15 minutes. If human takeover is still `FALSE`, triggers secondary escalation alert to Priya.

---

### Workflow 3: Automated T - 2 Hours Guide Briefing Delivery
1. **Trigger:** Scheduled cron in n8n checking departures starting in 2 hours.
2. **n8n Action:** Calls `GET /api/manifests/{booking_id}/summary`.
3. **Delivery:** Dispatches a clean WhatsApp briefing card to the assigned guide:
   ```
   📋 Khaki Tours Guide Briefing Sheet
   Tour: #FortWalk (Colonial Heritage)
   Time: Today at 4:30 PM (Arrive by 4:15 PM)
   Meeting Point: Asiatic Society Steps, Horniman Circle
   Lead Host: Manish Joshi (+91 98200 11992)
   
   Guest Count: 18 Pax Confirmed
   • KYC Verified: 18/18
   • Dietary: 3 Vegetarians, 1 Jain
   • Special: 1 Guest requested slower walking pace
   
   Have a wonderful walk spreading #HeritageEvangelism! 🏛️
   ```

---

## 4. API Endpoints Exposed for n8n / Make.com

| Endpoint | Method | Purpose in n8n / Make.com |
| :--- | :---: | :--- |
| `/api/dispatch` | `POST` | Trigger new parallel broadcast |
| `/api/dispatch/{id}/respond` | `POST` | Ingest guide button click (`ACCEPT` / `DECLINE`) |
| `/api/agent-query/leads/classify` | `POST` | Corporate intent & SLA criticality scoring |
| `/api/agent-query/departures/availability` | `GET` | Live availability check for chatbot responses |
| `/api/agent-query/bookings/hold` | `POST` | Reserve seats & generate dynamic payment link |
| `/api/webhook/website-sync` | `POST` | Ingest bookings or publish catalog updates |
