# Khaki Travel OS: Go-Live Transition, Credential Cutover & Data Migration Guide

**Official Engineering Blueprint for Transitioning from Pitch/Prototype to Khaki Tours Production**  
*Document Version: 1.0 (October 2026)*

---

## 1. Executive Summary

This document specifies the exact steps required when Bharat Gothoskar, Priya, and Kaevan approve the adoption of **Khaki Travel OS**. 

During development and testing, all services run on safe isolated test credentials (sandboxes, test Meta numbers, and simulated payloads) to avoid interfering with Khaki's daily live operations.

This guide details:
1. **Meta Developer App configuration** for adding Instagram alongside WhatsApp.
2. **Channel Cutover Procedures** (WhatsApp number, official email, and phone desk).
3. **Data Migration Pipeline** (Transitioning from demo seed data to Khaki's live Google Spreadsheets).
4. **Environment Variables Reference** for production deployment.

---

## 2. Meta App Configuration: Adding Instagram to Existing WhatsApp App

You currently have a Meta Developer App with the **WhatsApp** product. To enable **Instagram Direct Messages** and **Instagram Lead Ads** within the exact same Meta App:

### Step 1: Add Instagram Product to Existing App
1. Go to [developers.facebook.com](https://developers.facebook.com/) and open your existing App (where WhatsApp is configured).
2. In the left-hand navigation, click **"Add Product"**.
3. Locate **"Instagram Graph API"** (or **"Instagram Messaging"**) and click **"Set Up"**.

### Step 2: Ensure Professional Account & Page Linking
Instagram API requires two prerequisites:
1. Khaki Tours' Instagram account (`@khakitours`) must be a **Professional Account** (Business or Creator), NOT a Personal Account.
2. The Instagram account must be connected to Khaki's **Facebook Page** (in Instagram App $\to$ Settings $\to$ Accounts Center $\to$ Linked Accounts).

### Step 3: Webhook Subscription
1. In your Meta App dashboard, navigate to **Webhooks** in the left sidebar.
2. In the dropdown, select **"Instagram"**:
   * **Callback URL:** `https://<production-domain-or-tunnel>/api/webhooks/instagram` (or `/api/webhooks/meta-leads` for Lead Ads).
   * **Verify Token:** `khaki_os_meta_webhook_2026` (matches `META_WEBHOOK_VERIFY_TOKEN` in `.env.local`).
3. Click **"Verify and Save"**.
4. Subscribe to the following fields:
   * `messages` (Receives inbound DMs from guests)
   * `messaging_postbacks` (Receives button clicks and quick replies)
   * `leadgen` (Receives submissions from Instagram Lead Ad campaigns)

### Step 4: Development Mode vs. Live Mode
* **In Development Mode:** Only Meta App Admins, Developers, and Instagram accounts added as "Testers" can trigger webhooks.
* **In Live Mode (Go-Live):** Request Standard Access for `instagram_basic`, `instagram_manage_messages`, and `leads_retrieval`. No complex business verification is needed for basic standard messaging.

---

## 3. Communication Channel Cutover Procedures

When transferring the system to Khaki Tours' live infrastructure:

| Channel | Current Development / Test State | Go-Live Production Switchover Procedure |
| :--- | :--- | :--- |
| **WhatsApp** | Test Meta WABA number / Twilio sandbox | 1. In Meta Business Manager, initiate phone number registration for Khaki's official customer WhatsApp number.<br>2. Update `META_PHONE_NUMBER_ID` and `META_WHATSAPP_TOKEN` in `.env.local`.<br>3. Verify incoming webhook point to `POST /api/whatsapp/webhook`. |
| **Email** | Simulated payloads & developer test mailbox | 1. For `info@khakitours.com` / `walks@khakitours.com`, configure an Inbound Email Parse Webhook (via Cloudflare Email Routing free worker, SendGrid Inbound Parse, or AWS SES).<br>2. Target webhook URL: `https://<production-domain>/api/webhooks/email-inbound`.<br>3. Configure outbound SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) to send booking passes via Khaki's official domain. |
| **Phone Calls** | Manned office line | 1. Connect office landline or virtual number (Exotel / Twilio / Vapi) to `POST /api/intake/voice`.<br>2. Audio transcriptions feed automatically into `/inbox`. |

---

## 4. Google Sheets to Travel OS Data Migration Pipeline

Kaevan and Bharat currently run their operations across multiple Google Sheets. We migrate this data using a **3-stage ingestion pipeline**:

```
[ KHAKI GOOGLE SHEETS ]
├── Sheet 1: Master Calendar (Departures, times, slots)
├── Sheet 2: Guide Roster (Names, phones, availability)
└── Sheet 3: Past Customer Bookings (CRM history)
               │
               ▼  (1-Click CSV Export or Google Sheets API)
[ Ingestion & Transformation Script (`/api/system/import-sheets`) ]
• Auto-formats dates to ISO-8601 (YYYY-MM-DDTHH:mm:ssZ)
• Standardizes Indian phone numbers (+91 XXXXX XXXXX)
• Deduplicates customer contacts & calculates historic RFM scores
• Validates guide tour certification mappings
               │
               ▼
[ KHAKI TRAVEL OS LIVE DATABASE ]
(Writes cleanly to `live_store.json` / PostgreSQL / Supabase)
```

### Pre-Launch Spreadsheet Schema Checklists

#### A. Master Calendar Sheet Checklist
* `Date` (DD/MM/YYYY or YYYY-MM-DD)
* `Time` (e.g. 08:00 AM / 16:30 PM)
* `Tour Title` (e.g. #FortWalk: Colonial Heritage)
* `Starting Landmark / Assembly Point` (e.g. Asiatic Library steps)
* `Max Capacity` (e.g. 25)
* `Ticket Price INR` (e.g. 899)
* `Assigned Guide Name` (Optional)

#### B. Guide Roster Sheet Checklist
* `Full Name`
* `WhatsApp Phone` (with country code)
* `Day Job / Profession` (e.g. High Court Advocate, Heritage Architect)
* `Seniority Level` (Senior Fellow, Core Guide, Apprentice)
* `Certified Tour Slugs / Titles`
* `Available Days` (e.g. Saturday Mornings, Sunday Evenings)

#### C. Historic Bookings Sheet Checklist
* `Booking Date`
* `Customer Full Name`
* `Customer Phone / Email`
* `Tour Attended`
* `Group Size`
* `Total Paid (INR)`

---

## 5. Production Environment Variable Checklist (`.env.production`)

```env
# Meta Cloud API (WhatsApp & Instagram)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_WHATSAPP_TOKEN=your_production_system_user_token
META_PHONE_NUMBER_ID=your_khaki_official_phone_number_id
META_WEBHOOK_VERIFY_TOKEN=khaki_os_meta_webhook_2026

# Google Gemini Intelligence
GEMINI_API_KEY=your_production_gemini_api_key

# Email Inbound & Outbound
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_smtp_key
OFFICIAL_FROM_EMAIL=walks@khakitours.com

# Razorpay Production Keys
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_production_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Supabase / Database URL
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

---

## 6. Client Handover & Implementation Backlog (Post-Pitch Execution)

When Bharat and the team greenlight the transition, execute these prioritized backlog items:

### Epic 1: Communication Channel Switchover
- [ ] **META-01**: Add Khaki's official phone number to Meta Business Manager and complete WhatsApp Cloud API Display Name approval ("Khaki Tours").
- [ ] **META-02**: Add Instagram Graph API to Meta Developer App, link `@khakitours` Professional Instagram account, and verify webhooks for `messages` and `leadgen`.
- [ ] **EMAIL-01**: Configure Inbound Parse Webhook on `info@khakitours.com` / `walks@khakitours.com` (via Cloudflare Email Routing or SendGrid) pointing to `POST /api/webhooks/email-inbound`.
- [ ] **EMAIL-02**: Verify SPF, DKIM, and DMARC DNS records for Khaki's domain so outgoing booking passes and automated triage replies land cleanly in the inbox.
- [ ] **VOICE-01**: Connect Khaki's inbound phone/landline to voice transcription bridge (`POST /api/intake/voice`).

### Epic 2: Data Ingestion & Spreadsheet Migration
- [ ] **MIGRATE-01**: Request Google Sheet read-only access or CSV exports for:
  1. *Master Calendar* (upcoming departures, timing, max capacity, pricing).
  2. *Guide Roster* (guide contact details, languages, certified tour badges).
  3. *Historic Guest CRM* (past guest bookings, phone numbers, visit history).
- [ ] **MIGRATE-02**: Run `/api/system/import-sheets` to parse, validate phone formatting (`+91`), deduplicate contacts, and seed the production database.
- [ ] **MIGRATE-03**: Calculate baseline RFM loyalty segments (Heritage Loyalists, Occasional Walkers, Inactive Mumbai Explorers) from historic booking data for marketing broadcasts.

### Epic 3: Financial & Gateway Handover
- [ ] **FIN-01**: Swap test Razorpay credentials with Khaki Tours' verified Merchant Account keys (`RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`).
- [ ] **FIN-02**: Configure Razorpay Webhook URL `POST /api/orders/webhook` for instant payment auto-reconciliation.
- [ ] **FIN-03**: Verify Tally Prime XML/CSV export compatibility with Khaki's accounting chart of accounts (splitting Base Walk Fee vs 5% GST).

### Epic 4: Staff Training & Role Rollout
- [ ] **OPS-01**: Onboard Kaevan and Dispatch staff to the **Guide Roster Desk** (`/inbox?persona=guides`) and Master Calendar (`/dispatch`).
- [ ] **OPS-02**: Onboard Concierge team to the **Guest Concierge Desk** (`/inbox?persona=guests`) and verify automated WhatsApp template generation.
- [ ] **OPS-03**: Set up Bharat's Owner Escalations dashboard (`/inbox?persona=staff`) for VIP booking holds and P1 customer resolutions.

