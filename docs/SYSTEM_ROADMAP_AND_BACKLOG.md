# Khaki Travel OS: System Architecture, Roadmap & Feature Backlog

**Official Operational & Engineering Blueprint for Khaki Tours Operating System**  
*Document Version: 2.1 (October 2026)*

---

## 1. System Vision & Architecture Topology

Khaki Travel OS is a unified, multi-tenant headless operations and dispatch engine powering:
1. **Direct Public Walks (Scheduled):** High-volume, instant inventory decrement, digital WhatsApp passes, mobile manifest attendance.
2. **Private & Bespoke Tours:** Dynamic resource allocation, lead-time rules, vehicle/jeep coordination, custom route assembly.
3. **Corporate B2B Delegations:** 15-minute Founder SLA, custom quotations, GST SAC 998554 invoices, NEFT/contract tracking.
4. **International Expeditions:** Multi-stage milestone payments (25% deposit, 75% balance), USD/INR FX buffer hedging, KYC document vaults.
5. **Multi-Role WhatsApp Mesh:** Independent communication pipelines for Guests, Freelance Guides (Ambassadors), Logistics Vendors (Jeep drivers, boat captains), and Internal Staff Alerts.

```
                           ┌──────────────────────────────────────────────┐
                           │            KHAKI TRAVEL OS BACKEND           │
                           │       Next.js 15 • Persistent Live Store    │
                           └──────────────────────┬───────────────────────┘
                                                  │
                 ┌──────────────────┬─────────────┴──────┬──────────────────┐
                 ▼                  ▼                    ▼                  ▼
          [ Guest Intake ]   [ Guide Dispatch ]   [ Vendor Desk ]    [ Internal Alerts ]
          • Webhook Orders   • Pool Broadcast     • Jeep Drivers     • Founder Escalations
          • WhatsApp Concierge • WhatsApp Accept  • Boat Captains    • SLA Breaches
          • 1-Click Passes   • Standby Backups    • F&B Partners     • EOD Tally Sync
```

---

## 2. Master Feature Status & Engineering Backlog

### Phase 1: Core Operations & Dispatch (ACTIVE)

| Feature / Capability | Description & Architecture | Status |
| :--- | :--- | :--- |
| **Universal Web Order Webhook** | Headless endpoint `POST /api/orders/web-checkout` accepting bookings from website/forms, decrementing inventory, checking 48h lead times, and routing Tier 1 vs Tier 2. | ✅ **Complete & Verified** |
| **Interactive Master Departures Calendar** | Month, Week, and List matrix with real-time occupancy chips (`🟢 X left`, `🟡 Filling fast`, `🔴 Sold out`), Run Sheet Drawer, and assembly links. | ✅ **Complete & Verified** |
| **Dynamic Manifest & On-Site Attendance** | Roster pulling real customer bookings per departure slot. Guides toggle attendance on mobile (`Mark Present` / `✓ Checked In`). | ✅ **Complete & Verified** |
| **Inbound Stream Bifurcation** | Filterable inbox streams: Public Walks, Private Safari, Corporate VIP, International, General Inquiries. | ✅ **Complete & Verified** |
| **Staff Assignment & 1-Click Takeover** | Multi-employee assignment with "My Assigned" filtering, overdue SLA warning pills, and 1-click takeovers. | ✅ **Complete & Verified** |
| **Conversation Auditing & Quality Scores** | Transcript archival, AI quality grade (0–100%), stumble detector, repetition flags, and turn-by-turn diagnostic drawers. | ✅ **Complete & Verified** |
| **Meta HMAC Signature Verification** | Validates `x-hub-signature-256` using `META_APP_SECRET` to block forged webhook attacks. | ✅ **Complete & Verified** |
| **Ambassador Pool & Intelligence Engine** | Database of freelance guides with day jobs, tour certifications, star ratings, and availability matrices. | ✅ **Complete & Verified** |
| **Fair Roster Allocation Engine** | Dual-mode selector (Option A: Upcoming Departures vs Option B: Scoped Catalog Explorer), Round-Robin fairness, Seniority VIP, Speed Broadcast, and Emergency Substitution with workload rebalancing. | ✅ **Complete & Verified** |
| **Bespoke Tour Curator Studio** | Internal tool for Bharat/Priya to stitch custom heritage stops, enforce spatial geo-clustering, calculate pricing, and send WhatsApp quotes. | ✅ **Complete & Verified** |
| **Guide Performance & Fleet Analytics** | Workload Gini equity balance, on-time arrival rate (98.4%), emergency substitute rate (1.6%), and individual ambassador scorecards on `/guides` and executive `/analytics`. | ✅ **Complete & Verified** |
| **Operations Cost Settings & Margin Engine** | Central settings (`/settings` & `/api/settings/inventory`) for guide payouts by tier, monument entry fees, vehicle fleet, F&B costs, and real-time gross margin calculator. | ✅ **Complete & Verified** |
| **Outbound Marketing & Campaign Studio** | Targeted campaign composer (`/marketing`) with audience segmentation, Meta marketing budget guardrail (₹0.78 rate), and Mumbai-to-International cross-sell funnel. | ✅ **Complete & Verified** |
| **Inbound Email Triage & Foreign Guest Parser** | Webhook (`/api/webhooks/email-inbound`) filtering spam/sales pitches and ingesting non-WhatsApp international travelers into Unified Inbox. | ✅ **Complete & Verified** |
| **Instagram Lead Ads & Meta Ingestion** | Webhook (`/api/webhooks/meta-leads`) capturing Instagram ad submissions and triggering instant personalized WhatsApp/Email welcomes. | ✅ **Complete & Verified** |
| **Automated Post-Tour Google Review Collector** | Automated review prompt with 1-click Google Reviews link triggered 2 hours post-walk completion to boost local SEO and AI search rank. | ✅ **Complete & Verified** |
| **Internal Staff Escalation Alerts** | Evening alerts to Bharat for P1 corporate leads and dispatch coordinator alerts for expiring holds. | 🔨 **Phase 1 In Progress** |

---

### Phase 2: High-Value Products & Customer Self-Service (QUEUED)

| Feature / Capability | Description & Architecture | Status |
| :--- | :--- | :--- |
| **Customer-Facing Custom Tour Builder** | Interactive web/WhatsApp questionnaire with theme picker and geo-clustering guardrails (<2.5 km walking bounds). | ⏳ **Queued (Phase 2)** |
| **Razorpay Direct Payment Links & Webhooks** | Automated creation of Razorpay payment links in WhatsApp and verification of `payment.captured` signatures. | ⏳ **Queued (Phase 2)** |
| **International 2-Stage Milestone Payments** | Stage 1 (25% initial booking deposit) and Stage 2 (75% balance due 30 days before departure) with forex buffering. | ⏳ **Queued (Phase 2)** |
| **Passport & KYC Compliance Vault** | Digital file upload for high-security walks (High Court, Synagogues, International travelers). | ⏳ **Queued (Phase 2)** |
| **Corporate Proforma & Tax Invoice PDF Engine** | Dynamic generation of GST-compliant PDF quotes with 18% SAC 998554 splits. | ⏳ **Queued (Phase 2)** |

---

### Phase 3: Third-Party Ecosystem & Expansion (ROADMAP)

| Feature / Capability | Description & Architecture | Status |
| :--- | :--- | :--- |
| **Third-Party OTA Ingestion Adapter** | Normalized webhook parser for Viator, GetYourGuide, and MakeMyTrip to prevent double-booking. | 📋 **Roadmap (Phase 3)** |
| **Voice AI Inbound Reservation Parser** | Voice phone call parser (Vapi/Twilio) extracting date, group size, and sending payment SMS/WhatsApp. | 📋 **Roadmap (Phase 3)** |
| **Automated Guide Payout Reconciliation** | EOD guide fee tallying based on completed manifests and direct UPI payout export. | 📋 **Roadmap (Phase 3)** |

---

## 3. Ambassador (Guide) Allocation Ruleset Specification

### Policy 1: Round-Robin Balanced (Default for Scheduled Public Walks)
* **Goal:** Fair distribution of earning opportunities across freelance enthusiasts.
* **Algorithm:**
  1. Filter guides who are certified for the requested tour.
  2. Filter guides available on that day of week (e.g., Saturday Morning).
  3. Sort candidates ascending by `toursAssignedThisMonth`.
  4. Top recommendation is the qualified guide with the fewest assignments.

### Policy 2: Seniority & VIP Match (For Corporate & HNI Private Tours)
* **Goal:** Maximum prestige and domain-specific authority.
* **Algorithm:**
  1. Filter by `SENIOR_FELLOW` or `CORE_AMBASSADOR`.
  2. Match guide's primary profession to tour theme (e.g., Lawyer for High Court, Architect for Art Deco, Marine Specialist for Island cruise).
  3. Minimum rating threshold: ≥ 4.90 stars.

### Policy 3: Speed Broadcast (For Urgent <48h Private Tours)
* **Goal:** Rapid lock-in before customer drops off.
* **Algorithm:**
  1. Multicast WhatsApp prompt with 1-click buttons to top 3 eligible guides.
  2. First guide to click **Accept** gets assigned.
  3. Second guide to click **Accept** is logged as `STANDBY_BACKUP`.
  4. Timer: 30 minutes before escalating to Dispatch Coordinator phone call.
