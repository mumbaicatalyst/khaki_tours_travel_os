# Khaki Travel OS — Production Knowledge Base & Business Dataset Backlog
**Target Stakeholder:** Bharat Gothoskar (Founder & CEO) & Khaki Operations Leadership  
**Purpose:** Comprehensive inventory of business datasets, operational training manuals, and policy rules required to elevate the WhatsApp & Voice AI Concierge from prototype to production-grade accuracy.

---

## 1. Core Tour & Experience Catalogs (Beyond Basic Scrapes)

| Dataset | Current Prototype Status | Production Business Requirement Needed from Khaki Tours |
| :--- | :--- | :--- |
| **Bespoke / Custom Private Tour Pricing Matrix** | Rough estimate (₹4,500 base) | • Tiered pricing for 1–4 pax, 5–15 pax, 15+ pax.<br>• Fixed guide honorarium vs per-pax variable cost.<br>• Minimum advance booking lead time (e.g., 48 hours for private docents). |
| **Culinary & Specialty Add-On Price List** | Fragmented in Bespoke Studio | • Official vendor price per pax for **Irani Chai + Brun Maska** (Kyani / B. Merwan / Cafe Ideal).<br>• Street food tasting sanitation guarantee & vendor list (Chowpatty / Fort / Bohri Mohalla).<br>• Vegetarian / Jain / Halal / Vegan substitution rules per walk. |
| **Full Annual & Seasonal Tour Catalog (All 80+ Walks)** | Top 20 walks indexed | • Full repository of all ~80 walks developed by Bharat Gothoskar.<br>• Seasonality matrix (e.g. Monsoon walks, Winter heritage walks, Navratri specials, Ramzan food trails).<br>• Tagged themes for semantic matching: *Art Deco, Maritime, Textiles, Crime & Underworld, Sacred Spaces, Colonial Architecture*. |
| **Meeting Points & Micro-Navigation GPS Pins** | Generic landmark names | • Google Maps Place IDs + exact landmark text (e.g., *"Under the banyan tree opposite David Sassoon Library, not inside the gate"*).<br>• Assembly photos or landmark street photos for automated WhatsApp delivery. |

---

## 2. Ambassador / Docent Knowledge & Persona Guidelines

| Dataset | Current Prototype Status | Production Business Requirement Needed from Khaki Tours |
| :--- | :--- | :--- |
| **Khaki Ambassador Style Guide & Training Manual** | Generic polite tone | • Official Khaki storytelling philosophy (uncovering *"hidden"* histories vs textbook dates).<br>• Prohibited phrases (e.g., calling Ambassadors "tour guides", promotional sales pressure).<br>• How to handle sensitive colonial/religious historical topics. |
| **Ambassador Specialty Profiles** | Senior Fellow / Architect tags | • Language proficiencies (Marathi, Gujarati, Hindi, French, German, Japanese).<br>• Subject-matter expertise (e.g., High Court Advocate for Legal Fort Walk, Conservation Architect for Bandra). |
| **Audio & Pacing Guidelines** | Hardcoded 2.5 hours | • Walking distance in kilometers and step count per tour.<br>• Wheelchair & stroller accessibility ratings (High / Medium / Inaccessible due to colonial steps/curbs).<br>• Restroom / washroom stop locations along each walking route. |

---

## 3. Financial, Ticketing & Commercial Policy FAQs

| Dataset | Current Prototype Status | Production Business Requirement Needed from Khaki Tours |
| :--- | :--- | :--- |
| **Children, Senior & Student Discount Rules** | None (Flat ticket price) | • Age threshold for free entry (e.g. Under 5 / Under 8).<br>• Student ID discount policy (if any) and senior citizen concession guidelines. |
| **Corporate B2B & Delegation Rate Card** | Static 15-min SLA notice | • Official minimum billing for corporate offsites (e.g. ₹25,000 minimum up to 20 pax).<br>• Payment terms: Net-15 vs 50% advance / 50% post-walk.<br>• GST Invoice format, SAC codes (998554 for Event/Tour management), and vendor PAN details. |
| **Foreign National / International Card Payments** | UPI-centric link flow | • Stripe / PayPal payment link fallback for international travelers without Indian UPI (GPay/PhonePe).<br>• Foreign exchange currency policy (USD / EUR / GBP pricing vs INR spot conversion). |
| **Refund & Rescheduling Edge Cases** | Basic 72h cancellation rule | • Guest sickness / flight delay rescheduling fee.<br>• Ticket transferability: Can a friend attend instead if the buyer cannot make it?<br>• BMC / IMD Heavy Rain & Red Alert operational call timing (e.g. decision announced 2 hours prior to start). |

---

## 4. Ground Operations & Crisis Response Playbooks

| Dataset | Current Prototype Status | Production Business Requirement Needed from Khaki Tours |
| :--- | :--- | :--- |
| **Late Arrival / Running Late Protocol** | Not defined | • Buffer wait time at meeting point (e.g., Ambassador waits 10 mins strictly).<br>• Catch-up instructions: Exact stop #2 location where late guests can rendezvous with the group. |
| **Lost / Emergency Contact Directory** | Operations HQ phone only | • Ground duty manager WhatsApp hotline for live weekend departures.<br>• Nearest medical centers / clinics along South Mumbai walking trails. |
| **Photography & Drone Permissions** | Fragmented text | • Photography rules for High Court, Naval Dockyard, Gateway precinct, and places of worship.<br>• Professional DSLR / video camera tripod policies. |

---

## 5. Ongoing Ingestion Strategy
1. **Scenario-Based Feedback Loop:** Add every real customer question or intern edge case into the automated evaluation harness (`test_scenarios.json`).
2. **Founder Review Sessions:** Review flagged gaps with Bharat Gothoskar to populate authoritative answers directly into Khaki Travel OS knowledge store.
