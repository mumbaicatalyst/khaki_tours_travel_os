# Third-Party Integrations & External System Specifications
## Khaki Travel Operating System (`khaki-travel-os`)

This document specifies the integration protocols, authentication schemes, payload schemas, and error-handling strategies for external third-party services.

---

## 1. WhatsApp Business Platform (Meta Cloud API & Wati BSP)

Khaki Tours utilizes a hybrid architecture supporting either **direct Meta Cloud API** or **Wati BSP** abstraction.

### 1.1 Meta Cloud API Direct Endpoints
- **Base URL:** `https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages`
- **Authentication:** Bearer token via `WHATSAPP_API_TOKEN`

#### Outbound Interactive Dispatch Template (Guides & Jeeps)
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+919820011223",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "header": {
      "type": "text",
      "text": "Khaki Tours Ops: New Tour Assignment"
    },
    "body": {
      "text": "Hello! You have been selected for *Old Mumbai Heritage Walk* on *Saturday, 10:00 AM*.\nGroup Size: 12 Pax\nPayout: ₹2,500\n\nPlease confirm availability within 30 minutes:"
    },
    "footer": {
      "text": "Khaki Operations Desk"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "DISPATCH_ACCEPT_e94d8b94",
            "title": "Accept Tour"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "DISPATCH_DECLINE_e94d8b94",
            "title": "Decline / Busy"
          }
        }
      ]
    }
  }
}
```

### 1.2 Anti-Spam & Deliverability Controls
1. **Utility Template Category:** Outbound booking links, meeting pins, and tickets are registered under the **Utility** classification (~8x cheaper than Marketing templates and immune to Meta promotional throttling).
2. **24-Hour Service Window:** Once a guest initiates a chat or clicks an inbound link, the session opens for free-form two-way conversational routing without template restrictions.
3. **Inbound QR Codes:** Collateral and posters feature pre-filled Click-to-Chat WhatsApp links (`https://wa.me/91XXXXXXXXXX?text=Hi%20Khaki%20Tours,%20I%20want%20to%20book%20a%20walk`), keeping spam complaints near zero.

---

## 2. Voice AI Agent Protocol (Vapi / Bland / Twilio)

### 2.1 Qualification Agent Script & Verbal Consent Handoff
The Voice AI agent acts strictly as an inbound qualification filter.

#### Verbatim Handoff Script:
> **Voice Bot:** *"Thank you for your interest in our South Mumbai Heritage Safari! We have seats available for this Saturday at 4:30 PM. To ensure your details are 100% accurate and to send your secure payment link, may I have your permission to message you on WhatsApp right now?"*
>
> **Customer:** *"Yes, please."*
>
> **Voice Bot:** *"Wonderful! I have just sent your booking summary and secure UPI payment link to your WhatsApp number. You'll receive your map pin and digital pass as soon as you complete the checkout. Have a fantastic day!"*

### 2.2 Webhook Payload to `/api/voice`
When the caller replies affirmatively, the Voice AI engine fires a webhook to Khaki Travel OS:
```json
{
  "call_id": "call_981240182_vapi",
  "caller_phone": "+919820098765",
  "caller_name": "Vikram Patel",
  "tour_id": "a3b4c5d6-0000-4000-8000-000000000001",
  "group_size": 2,
  "verbal_consent": true,
  "transcript_snippet": "Guest requested 2 seats for Saturday afternoon walk and agreed to WhatsApp handoff.",
  "duration_seconds": 64
}
```

---

## 3. Tally Prime ERP Accounting Integration

### 3.1 Architecture
Khaki Tours runs a local or hosted Tally Prime instance with the XML server enabled on port `9000`. The Khaki Travel OS Tally Module issues direct HTTP POST requests with Tally-compliant XML envelopes.

### 3.2 GST Calculation Matrix
- **Tier 1 & Tier 2 B2C Tours:** Tour Operator Composite Scheme (5% GST with no Input Tax Credit).
  - SAC Code: **998555** (Tour Operator Services).
  - CGST: 2.5%, SGST: 2.5% (or IGST: 5.0% for interstate guests).
- **Corporate / B2B Bookings:** 18% GST (SAC 998554 / Event & Heritage Consulting) with formal GSTIN capture.

### 3.3 Tally XML Receipt Voucher Example
```xml
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Khaki Tours Private Limited</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create">
            <DATE>20261008</DATE>
            <NARRATION>Booking Ref: KT-BKG-8910. Guest: Vikram Patel. Tour: Old Mumbai Walk</NARRATION>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>KT-REC-2026-0042</VOUCHERNUMBER>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Bank / UPI Collection A/c</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-1900.00</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Tour Booking Revenue</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>1809.52</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST @ 2.5%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>45.24</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST @ 2.5%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>45.24</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>
```

### 3.4 End-of-Day (EOD) Batch Output & Multi-Voucher Export

At the end of each operational day, Khaki Travel OS aggregates all financial events and produces two export formats for accounts:

1. **Tally Prime EOD Batch XML (`/api/tally/export?format=xml`):**
   - Contains all **Receipt Vouchers** (UPI/Gateway collections split into Revenue and Output CGST/SGST).
   - Contains all **Guide Payment Vouchers** (Contractor honorariums debited to `Contractor Guide Honorarium Expense` and credited to Bank).
   - Contains all **Vendor Payment Vouchers** (Jeep & Boat disbursements debited to `Safari Vehicle & Boat Logistics Expense`).
   - Directly importable into Tally Prime via `Alt + O -> Import -> Transactions`.

2. **Accountant Day-Book CSV (`/api/tally/export?format=csv`):**
   - Structured ledger audit export containing: `Date`, `Voucher Type`, `Voucher No`, `Particulars / Ledger`, `Debit (INR)`, `Credit (INR)`, `GST SAC`, `GST Rate`, `Narration`.
   - Allows accountants to review journal balance, GST split, and bank balances in Excel before posting.

3. **Live Tally HTTP Port 9000 Push (`POST /api/tally/export`):**
   - Transmits the EOD batch XML directly across the local network to Tally Prime's XML listener.
   - If Tally is offline or unreachabled, vouchers remain safely queued locally in the database with `QUEUED` status and retry timestamps.

---

## 4. Gmail Founder Email Anti-Spam Strategy

To bypass Gmail's algorithmic "Promotions" and "Updates" tabs for high-touch Tier 2 and Tier 3 leads:
- Emails are dispatched as **RFC 5322 plain text** without inline images, CSS stylesheets, or tracking pixel redirects.
- Header fields strictly maintain SPF, DKIM, and DMARC alignment (`p=reject`).
- Phrasing mimics natural 1-to-1 founder correspondence:
  > *"Hi Rohan, Farazdak here from Khaki Tours. Priya mentioned you were looking at our bespoke Fort Heritage Walk for next weekend. Just wanted to see if you had any specific architectural interests we should brief your guide on?"*
- Triggers active conversational replies, elevating Khaki Tours' sender reputation score.
