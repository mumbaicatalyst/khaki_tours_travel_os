# Khaki Travel Operating System (`khaki-travel-os`)
## Executive Briefing & Capabilities Overview
**Prepared for:** Bharat Gothoskar (Founder & CEO), Priya (Operations Lead), Kayvan & The Khaki Tours Core Team  
**System Domain:** Operations Cockpit, CRM, ERP, and Omnichannel Dispatch Hub  
**Target Environment:** `https://khakitours.com` & WhatsApp Business API  

---

### Executive Summary: Transitioning from Manual Sprawl to High-Velocity Operations

Khaki Tours has built an iconic cultural brand across Mumbai—curating **81 distinct heritage experiences**, conducting world-first **#UrbanSafari open jeep tours**, mobilizing **36 passionate Ambassador historians**, and educating thousands through the **Khaki Heritage Foundation**.

However, rapid growth across retail walks, private groups, high-LTV corporate retreats, and international expeditions creates acute operational friction:
* **The "Google Sheets Sprawl":** Guest lists, guide availability, jeep bookings, and payments tracked across disparate spreadsheets that quickly fall out of sync.
* **Manual WhatsApp & Call Burnout:** Staff spending hours manually typing meeting points, copy-pasting UPI handles, and verifying screenshot receipts.
* **The After-Hours Blindspot:** When high-value corporate inquiries or weekend travelers message at 10:30 PM, no staff is online. Leads go cold, and potential clients book elsewhere.
* **Guide & Vendor Coordination Stress:** Guides are busy professionals (lawyers, doctors, corporate managers); chasing them for confirmations or sending last-minute manifests creates anxiety.
* **Accounting Double-Entry:** Re-entering payments and calculating complex GST splits (5% Tour Operator Composite vs 18% Corporate B2B) manually into Tally Prime at month-end.

**Khaki Travel OS** is a custom, purpose-built Travel Operations Platform designed to eliminate this friction entirely. It serves as your **internal mission control**, automating repetitive workflows while preserving the warm, scholarly human touch that defines Khaki Tours.

---

### 1. The Four Core Business Verticals in Khaki OS

Khaki Travel OS is engineered around your four distinct revenue engines, applying the exact right level of automation to each:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                KHAKI TRAVEL OPERATING SYSTEM                                     │
├───────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│ Tier 1: Scheduled Walks       │ Tier 2: Private & Open Jeeps     │ Tier 3: International / Outbound
│ (₹699 – ₹1,199 / Pax)         │ (₹4,999 – ₹14,500 / Group)       │ (₹1.5L – ₹3.0L+ / Pax)        │
│ 100% Automated Fast-Path      │ Hold-vs-Pay Engine               │ Dynamic FX Risk Mitigation    │
│ Zero human touch needed       │ Parallel Guide + Jeep Locking    │ 30-day spot settlement        │
├───────────────────────────────┴──────────────────────────────────┴───────────────────────────────┤
│ Tier 4: Corporate B2B & Institutional Retreats (Godrej, Mahindra, Consulates)                    │
│ Automated 18% GST (SAC 998554), Cohort Guide Splits (Max 20 pax/guide), 15-Minute SLA Guard      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Tier 1: Standard Scheduled Walking Tours (₹699 – ₹1,199)
* **Goal:** Zero-friction, zero human staff touchpoint.
* **Workflow:** Guest discovers tour on website or WhatsApp $\rightarrow$ bot checks real-time seat availability across the 60-day calendar $\rightarrow$ generates instant dynamic UPI QR code $\rightarrow$ once payment webhook fires, seat automatically decrements in database $\rightarrow$ guest receives WhatsApp confirmation ticket with exact Google Maps coordinates and landmark directions.

#### Tier 2: Private Group & Heritage Experiences (₹4,999 – ₹14,500)
* **Goal:** Maximize conversion while protecting resource lockouts.
* **Workflow:** For departures $>48\text{ hours}$ away, generates instant payment link with 30-minute hold timer. For bespoke custom routes, triggers parallel resource broadcast: checks open jeep availability (Ramesh Gurav) and ambassador guides simultaneously. Once both confirm, fires payment link.

#### Tier 3: International Outbound Expeditions (₹1.5L – ₹3.0L+)
* **Goal:** Forex currency fluctuation risk mitigation.
* **Workflow:** Automated mathematical hedging buffer ($3.50\%$) on international land costs quoted in USD/EUR $\rightarrow$ milestone payment tracking ($25\%$ deposit, $35\%$ visa checkpoint, $40\%$ final settlement) $\rightarrow$ automated 30-day settlement reconciliation in Tally.

#### Tier 4: Corporate B2B Retreats & Consulates (Custom Proposals)
* **Goal:** High-velocity proposal delivery with strict compliance.
* **Workflow:** Built-in Proposal Builder that automatically applies **18% standard GST under SAC 998554** (allowing the client to claim Input Tax Credit) vs retail 5%, splits large cohorts into 20-pax sub-groups with dedicated guides, and enforces Net-15 or Net-30 payment terms.

---

### 2. The Operational Reality: 100% Zero-Login for Guides & Vendors

A fundamental principle of Khaki Travel OS is respecting the daily reality of your external partners:

#### A. Your 36 Ambassador Guides
* **Who they are:** Highly educated working professionals (e.g., Aniket is a Bombay High Court Lawyer; Dr. Sudhir Gadre is a Consultant Physician; others are corporate architects, engineers, and researchers).
* **The Reality:** **They will NEVER log into a software portal or download a separate app.**
* **The Khaki OS Solution:** **100% WhatsApp-Native Interaction.**
  1. **Tour Invitation:** When a tour needs allocation, n8n/Khaki OS broadcasts an interactive WhatsApp card with tap buttons: `[✅ Accept Tour]` | `[❌ Decline / Busy]`.
  2. **Automated T - 2 Hours Briefing:** 2 hours prior to start time, the assigned guide automatically receives a clean WhatsApp briefing sheet:
     * Confirmed passenger count & verified KYC manifest
     * Dietary alerts (*"2 Jain, 1 Vegan"*) & special requests (*"Elderly guest; slower walking pace requested"*)
     * Meeting point Google Maps pin link
     * Single-tap button: `[✅ Checked-in On Site]`
  3. **No Password Hassle:** All actions execute via direct WhatsApp messages or official Khaki WhatsApp groups.

#### B. Transport & Logistics Vendors (Jeep Drivers & Boat Captains)
* **Who they are:** Independent vehicle owner-operators (Ramesh Gurav for Open Safari Jeep `MH 01 DX 4022`, Capt. Dattaram Koli for Gateway Jetty #4 sailboat `Vessel Sagarika`).
* **The Reality:** They communicate primarily via WhatsApp voice notes and quick taps.
* **The Khaki OS Solution:** When an #UrbanSafari or Harbour Cruise is scheduled, the system sends an interactive WhatsApp order with pickup point, reporting time, passenger count, and a single-tap confirmation button.

---

### 3. 24/7 Operations & Intelligent After-Hours Handling

One of the largest leaks in tour operator revenue is the **After-Hours Gap** (between 8:00 PM and 9:00 AM, and Sunday evenings).

Khaki Travel OS introduces an **Intelligent Business Hours & After-Hours Engine**:

```
Inbound Inquiry at 11:15 PM
               │
               ▼
   Is it Business Hours? ──[NO]──► 1. Graceful Expectation Setting:
   (09:00 - 20:00 IST)                "Our Mumbai ops desk is resting for the night.
                                       We'll personally review your note at 9:00 AM."
                                   2. 24/7 Self-Serve Fast-Path:
                                       "Good news: You can check live seats & book
                                       instantly right now via this link: [Calendar URL]"
                                   3. Smart SLA Adjustment:
                                       Does NOT wake Bharat or Priya at 2:00 AM!
                                       Lead is tagged [AFTER_HOURS_QUEUED] and schedules
                                       first-priority review for 9:00 AM next morning.
```

* **Preserving Staff Peace of Mind:** Core staff (Bharat, Priya) do not get bombarded with false SLA breach alerts while sleeping.
* **Zero Lost Revenue:** Travelers planning weekend activities late at night can immediately complete their booking, pay via UPI QR, and receive their digital pass without waiting for human confirmation.
* **Morning Priority Briefing:** When Priya opens the Unified Inbox at 9:00 AM, all overnight inquiries are pre-ranked by VIP priority (Corporate leads at the top, followed by urgent departures).

---

### 4. End-of-Day (EOD) Tally Prime Accounting Synchronization

Khaki Tours uses **Tally** for all company accounting. Khaki Travel OS completely eliminates manual data re-entry:

* **Dual GST Tax Engine:**
  * **Retail Walks (SAC 998555):** Automatically computes **5% Composite Tour Operator GST** (split into 2.5% CGST + 2.5% SGST, no ITC).
  * **Corporate B2B (SAC 998554):** Automatically computes **18% Full GST** (9% CGST + 9% SGST, capturing corporate GSTIN for client ITC claims).
* **End-of-Day (EOD) Output Formats:**
  1. **Tally EOD XML Import File:** At day's end, accounts staff click **`[Download Tally EOD XML]`**. This file imports directly into Tally Prime (`Alt + O -> Import Data -> Transactions`), generating:
     * All **Receipt Vouchers** (UPI/Gateway collections balanced across Bank, Revenue, and GST ledgers).
     * All **Guide Honorarium Payment Vouchers** (`KT-PAY-G-...`).
     * All **Vendor Logistics Payment Vouchers** (`KT-PAY-V-...`).
  2. **Accountant Day-Book CSV:** For accountants who prefer reviewing journal balances in Excel prior to posting.
  3. **Direct Port 9000 Push:** Transmits XML vouchers directly across the local network to Tally Prime's HTTP server.

---

### 5. Summary: Operational Impact Before vs After

| Operational Domain | The Manual Way (Before) | With Khaki Travel OS (After) |
| :--- | :--- | :--- |
| **Retail Walk Bookings** | Staff manually check sheets, text UPI QR, confirm bank credit, and copy-paste meeting coordinates. | **100% Automated Fast-Path:** Bot verifies seats, issues dynamic UPI link, decrements seat, and delivers ticket in $<30\text{ seconds}$. |
| **Corporate B2B Inquiries** | Stored in personal inboxes. Quotes take 2–3 days to compile. Risk of losing lucrative corporate offsites. | **15-Minute SLA Guard:** Corporate leads detected instantly; automated proposal builder applies 18% GST & cohort splits; instant alert to Bharat. |
| **Guide Coordination** | Manual phone calls and WhatsApp messages. Last-minute chasing on Saturday mornings. | **Zero-Login Broadcast:** 1-tap WhatsApp buttons (`[Accept]`/`[Decline]`) with 30m escalation timer; automated T-2h briefings with dietary flags. |
| **Vendor Logistics (Jeeps/Boats)** | Manual phone calls to drivers; vehicle numbers and reporting times scattered across chats. | **Structured Dispatch:** 1-tap WhatsApp interactive order to drivers with pickup landmark, date, and rate. |
| **After-Hours / Night Queries** | Inquiries sit unread until the next afternoon; potential guests drop off or book competing activities. | **24/7 Intelligent Desk:** Graceful expectation setting + 24/7 self-serve instant booking link; overnight queue for 9:00 AM staff review. |
| **Accounting & GST Reconciliation** | Manual collation of bank statements, calculating composite 5% vs 18% GST splits in spreadsheets, manual entry into Tally. | **1-Click Tally EOD Export:** System auto-generates Tally Prime XML vouchers & Day-Book CSV with exact SAC codes and ledger entries. |

---

### 6. Live Interactive System Access

The entire platform is operational and running locally in your workspace:
* **Internal Command Center:** `http://localhost:3001`
* **Live Guide & Vendor Dispatch Board:** `http://localhost:3001/dispatch`
* **Unified Inbox & SLA Monitor:** `http://localhost:3001/inbox`
* **Automations & n8n Hub:** `http://localhost:3001/automations`
* **Finance & Tally Prime EOD Gateway:** `http://localhost:3001/finance`
* **Tour Inventory & Catalog Manager:** `http://localhost:3001/tours`
* **International FX Risk Simulator:** `http://localhost:3001/international`
* **Corporate B2B Proposal Builder:** `http://localhost:3001/corporate`
