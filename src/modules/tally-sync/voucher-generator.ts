import {
  tallyClient,
  TallyVoucherParams,
  TallyGuidePayoutParams,
  TallyVendorPaymentParams,
  TallyEODBatchPayload,
} from '@/lib/tally/client';

export interface GenerateVoucherRequest {
  bookingId: string;
  bookingReference: string;
  guestName: string;
  tourTitle: string;
  totalAmountInr: number;
  isCorporate?: boolean;
  corporateGstin?: string;
}

export interface EODSummaryMetrics {
  date: string;
  totalReceiptsCount: number;
  totalCollectionsInr: number;
  netRevenueInr: number;
  outputCgstInr: number;
  outputSgstInr: number;
  totalGstInr: number;
  totalGuidePayoutsInr: number;
  totalVendorPaymentsInr: number;
  netOperatingMarginInr: number;
}

export class TallyVoucherGenerator {
  /**
   * Generates and transmits a single Tally Prime Receipt Voucher upon payment confirmation
   */
  static async generateAndSyncReceipt(params: GenerateVoucherRequest): Promise<{
    success: boolean;
    voucherNumber: string;
    xml: string;
  }> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const voucherNumber = `KT-REC-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const xml = tallyClient.buildReceiptVoucherXml({
      voucherNumber,
      date: dateStr,
      bookingReference: params.bookingReference,
      guestName: params.guestName,
      tourTitle: params.tourTitle,
      totalAmountInr: params.totalAmountInr,
      isCorporate: params.isCorporate,
      corporateGstin: params.corporateGstin,
    });

    const syncResult = await tallyClient.postXmlToTally(xml);

    return {
      success: syncResult.success,
      voucherNumber,
      xml,
    };
  }

  /**
   * Generates End-of-Day (EOD) Batch Vouchers for Tally XML import & CSV Day-Book export
   */
  static generateEODBatch(
    date: string,
    batchData: TallyEODBatchPayload
  ): {
    metrics: EODSummaryMetrics;
    xml: string;
    csv: string;
  } {
    const dateFormatted = date.replace(/-/g, '');

    let totalCollections = 0;
    let netRevenue = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    for (const r of batchData.receipts) {
      totalCollections += r.totalAmountInr;
      const rate = r.isCorporate ? 0.18 : 0.05;
      const base = Number((r.totalAmountInr / (1 + rate)).toFixed(2));
      const tax = Number((r.totalAmountInr - base).toFixed(2));
      const halfTax = Number((tax / 2).toFixed(2));
      netRevenue += base;
      totalCgst += halfTax;
      totalSgst += halfTax;
    }

    const totalGuidePayouts = batchData.guidePayouts.reduce((sum, g) => sum + g.amountInr, 0);
    const totalVendorPayments = batchData.vendorPayments.reduce((sum, v) => sum + v.amountInr, 0);

    const netOperatingMargin = Number(
      (netRevenue - totalGuidePayouts - totalVendorPayments).toFixed(2)
    );

    const xml = tallyClient.buildEODBatchXml(dateFormatted, batchData);
    const csv = tallyClient.generateEODDayBookCsv(date, batchData);

    const metrics: EODSummaryMetrics = {
      date,
      totalReceiptsCount: batchData.receipts.length,
      totalCollectionsInr: Number(totalCollections.toFixed(2)),
      netRevenueInr: Number(netRevenue.toFixed(2)),
      outputCgstInr: Number(totalCgst.toFixed(2)),
      outputSgstInr: Number(totalSgst.toFixed(2)),
      totalGstInr: Number((totalCgst + totalSgst).toFixed(2)),
      totalGuidePayoutsInr: totalGuidePayouts,
      totalVendorPaymentsInr: totalVendorPayments,
      netOperatingMarginInr: netOperatingMargin,
    };

    return {
      metrics,
      xml,
      csv,
    };
  }
}
