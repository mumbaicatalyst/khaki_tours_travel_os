export interface TallyVoucherParams {
  voucherNumber: string;
  date: string; // YYYYMMDD
  bookingReference: string;
  guestName: string;
  tourTitle: string;
  totalAmountInr: number;
  isCorporate?: boolean;
  corporateGstin?: string;
}

export interface TallyGuidePayoutParams {
  voucherNumber: string;
  date: string; // YYYYMMDD
  bookingReference: string;
  guideName: string;
  guidePhone: string;
  tourTitle: string;
  amountInr: number;
}

export interface TallyVendorPaymentParams {
  voucherNumber: string;
  date: string; // YYYYMMDD
  bookingReference: string;
  vendorName: string;
  vendorType: string;
  vehicleOrVessel: string;
  tourTitle: string;
  amountInr: number;
}

export interface TallyEODBatchPayload {
  receipts: TallyVoucherParams[];
  guidePayouts: TallyGuidePayoutParams[];
  vendorPayments: TallyVendorPaymentParams[];
}

export class TallyClient {
  private tallyHost: string;
  private companyName: string;

  constructor() {
    this.tallyHost = process.env.TALLY_PRIME_HOST || 'http://127.0.0.1:9000';
    this.companyName = process.env.TALLY_COMPANY_NAME || 'Khaki Tours Private Limited';
  }

  /**
   * Build single XML snippet for a Receipt Voucher (Guest collection)
   */
  buildReceiptVoucherMessage(params: TallyVoucherParams): string {
    const { voucherNumber, date, bookingReference, guestName, tourTitle, totalAmountInr, isCorporate, corporateGstin } = params;

    // GST Breakdown:
    // Retail: 5% Composite Scheme (SAC 998555) -> 2.5% CGST + 2.5% SGST
    // Corporate: 18% Full GST (SAC 998554) -> 9% CGST + 9% SGST
    const gstRate = isCorporate ? 0.18 : 0.05;
    const baseAmount = Number((totalAmountInr / (1 + gstRate)).toFixed(2));
    const taxAmount = Number((totalAmountInr - baseAmount).toFixed(2));
    const halfTax = Number((taxAmount / 2).toFixed(2));

    const revenueLedger = isCorporate ? 'Corporate Tour Revenue (SAC 998554)' : 'Tour Booking Revenue (SAC 998555)';
    const cgstLedger = isCorporate ? 'Output CGST @ 9%' : 'Output CGST @ 2.5%';
    const sgstLedger = isCorporate ? 'Output SGST @ 9%' : 'Output SGST @ 2.5%';

    return `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create">
            <DATE>${date}</DATE>
            <NARRATION>Booking: ${bookingReference} | Guest: ${guestName} | Tour: ${tourTitle}${corporateGstin ? ` | GSTIN: ${corporateGstin}` : ''}</NARRATION>
            <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Bank / UPI Collection A/c</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${totalAmountInr.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${revenueLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${baseAmount.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${cgstLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${halfTax.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${sgstLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${halfTax.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`;
  }

  /**
   * Build single XML snippet for a Guide Payout Payment Voucher
   */
  buildGuidePayoutMessage(params: TallyGuidePayoutParams): string {
    const { voucherNumber, date, bookingReference, guideName, tourTitle, amountInr } = params;

    return `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Payment" ACTION="Create">
            <DATE>${date}</DATE>
            <NARRATION>Guide Honorarium: ${guideName} | Booking: ${bookingReference} | Tour: ${tourTitle}</NARRATION>
            <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Contractor Guide Honorarium Expense</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amountInr.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Bank / HDFC Payout Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amountInr.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`;
  }

  /**
   * Build single XML snippet for a Logistics Vendor Payment Voucher
   */
  buildVendorPaymentMessage(params: TallyVendorPaymentParams): string {
    const { voucherNumber, date, bookingReference, vendorName, vehicleOrVessel, tourTitle, amountInr } = params;

    return `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Payment" ACTION="Create">
            <DATE>${date}</DATE>
            <NARRATION>Logistics Vendor: ${vendorName} (${vehicleOrVessel}) | Booking: ${bookingReference} | Tour: ${tourTitle}</NARRATION>
            <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${voucherNumber}</VOUCHERNUMBER>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Safari Vehicle & Boat Logistics Expense</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amountInr.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Bank / HDFC Payout Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amountInr.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`;
  }

  /**
   * Build complete single Receipt Voucher XML with full envelope
   */
  buildReceiptVoucherXml(params: TallyVoucherParams): string {
    const message = this.buildReceiptVoucherMessage(params);
    return `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${this.companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${message}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  }

  /**
   * Build End-of-Day (EOD) Batch XML Envelope containing ALL transactions for the day
   */
  buildEODBatchXml(date: string, batch: TallyEODBatchPayload): string {
    const receiptXmls = batch.receipts.map((r) => this.buildReceiptVoucherMessage(r)).join('\n');
    const guideXmls = batch.guidePayouts.map((g) => this.buildGuidePayoutMessage(g)).join('\n');
    const vendorXmls = batch.vendorPayments.map((v) => this.buildVendorPaymentMessage(v)).join('\n');

    return `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${this.companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
<!-- EOD Receipt Vouchers (Collections & GST) -->
${receiptXmls || '<!-- No receipts today -->'}

<!-- EOD Guide Honorarium Payment Vouchers -->
${guideXmls || '<!-- No guide payouts today -->'}

<!-- EOD Vendor Logistics Payment Vouchers -->
${vendorXmls || '<!-- No vendor payouts today -->'}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  }

  /**
   * Generate End-of-Day CSV Day-Book for accountant manual review & Tally CSV utilities
   */
  generateEODDayBookCsv(date: string, batch: TallyEODBatchPayload): string {
    const headers = [
      'Date',
      'Voucher Type',
      'Voucher No',
      'Particulars / Ledger',
      'Debit (INR)',
      'Credit (INR)',
      'GST SAC',
      'GST Rate',
      'Narration',
    ];

    const rows: string[] = [headers.join(',')];

    for (const r of batch.receipts) {
      const gstRate = r.isCorporate ? 0.18 : 0.05;
      const base = Number((r.totalAmountInr / (1 + gstRate)).toFixed(2));
      const tax = Number((r.totalAmountInr - base).toFixed(2));
      const halfTax = Number((tax / 2).toFixed(2));
      const sac = r.isCorporate ? '998554' : '998555';
      const rateLabel = r.isCorporate ? '18%' : '5%';

      // Bank Debit
      rows.push(
        `"${date}","Receipt","${r.voucherNumber}","Bank / UPI Collection A/c",${r.totalAmountInr.toFixed(2)},0.00,"${sac}","${rateLabel}","Collection: ${r.bookingReference} - ${r.guestName}"`
      );
      // Revenue Credit
      rows.push(
        `"${date}","Receipt","${r.voucherNumber}","${r.isCorporate ? 'Corporate Tour Revenue' : 'Tour Booking Revenue'}",0.00,${base.toFixed(2)},"${sac}","${rateLabel}","Base Revenue"`
      );
      // Output CGST
      rows.push(
        `"${date}","Receipt","${r.voucherNumber}","Output CGST @ ${r.isCorporate ? '9%' : '2.5%'}",0.00,${halfTax.toFixed(2)},"${sac}","${rateLabel}","CGST"`
      );
      // Output SGST
      rows.push(
        `"${date}","Receipt","${r.voucherNumber}","Output SGST @ ${r.isCorporate ? '9%' : '2.5%'}",0.00,${halfTax.toFixed(2)},"${sac}","${rateLabel}","SGST"`
      );
    }

    for (const g of batch.guidePayouts) {
      rows.push(
        `"${date}","Payment","${g.voucherNumber}","Contractor Guide Honorarium Expense",${g.amountInr.toFixed(2)},0.00,"N/A","Exempt","Guide: ${g.guideName} - Tour: ${g.tourTitle}"`
      );
      rows.push(
        `"${date}","Payment","${g.voucherNumber}","Bank / HDFC Payout Account",0.00,${g.amountInr.toFixed(2)},"N/A","Exempt","Guide Payout"`
      );
    }

    for (const v of batch.vendorPayments) {
      rows.push(
        `"${date}","Payment","${v.voucherNumber}","Safari Vehicle & Boat Logistics Expense",${v.amountInr.toFixed(2)},0.00,"N/A","Exempt","Vendor: ${v.vendorName} (${v.vehicleOrVessel})"`
      );
      rows.push(
        `"${date}","Payment","${v.voucherNumber}","Bank / HDFC Payout Account",0.00,${v.amountInr.toFixed(2)},"N/A","Exempt","Vendor Payout"`
      );
    }

    return rows.join('\n');
  }

  /**
   * Post XML envelope to Tally Prime HTTP interface (default port 9000)
   */
  async postXmlToTally(xmlContent: string): Promise<{ success: boolean; responseText: string }> {
    try {
      const response = await fetch(this.tallyHost, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=utf-8',
        },
        body: xmlContent,
      });

      const responseText = await response.text();
      return { success: response.ok, responseText };
    } catch (error: any) {
      console.warn('[Tally] Tally Prime host unreachable or offline. Queuing voucher locally:', error.message);
      return { success: false, responseText: `Tally Offline / Queued locally (${error.message})` };
    }
  }
}

export const tallyClient = new TallyClient();
