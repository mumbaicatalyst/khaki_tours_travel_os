import { NextRequest, NextResponse } from 'next/server';
import { TallyVoucherGenerator } from '@/modules/tally-sync/voucher-generator';
import { tallyClient, TallyEODBatchPayload } from '@/lib/tally/client';

export const dynamic = 'force-dynamic';

// Sample verified transactions for EOD batch simulation
function getSampleEODData(dateStr: string): TallyEODBatchPayload {
  const d = dateStr.replace(/-/g, '');
  return {
    receipts: [
      {
        voucherNumber: `KT-REC-${d}-001`,
        date: d,
        bookingReference: 'KT-BKG-8901',
        guestName: 'Vikram Patel (Family)',
        tourTitle: '#FortWalk Colonial Heritage',
        totalAmountInr: 2398,
        isCorporate: false,
      },
      {
        voucherNumber: `KT-REC-${d}-002`,
        date: d,
        bookingReference: 'KT-BKG-8902',
        guestName: 'Pooja Singhania',
        tourTitle: 'Vintage Open Jeep #UrbanSafari',
        totalAmountInr: 14500,
        isCorporate: false,
      },
      {
        voucherNumber: `KT-REC-${d}-003`,
        date: d,
        bookingReference: 'KT-BKG-8903',
        guestName: 'Godrej Properties (Corporate Group)',
        tourTitle: 'Executive Heritage Architectural Retreat',
        totalAmountInr: 45000,
        isCorporate: true,
        corporateGstin: '27AAACG1234D1Z8',
      },
    ],
    guidePayouts: [
      {
        voucherNumber: `KT-PAY-G-${d}-001`,
        date: d,
        bookingReference: 'KT-BKG-8901',
        guideName: 'Aniket (Legal Historian)',
        guidePhone: '+91 98200 11992',
        tourTitle: '#FortWalk Colonial Heritage',
        amountInr: 2500,
      },
    ],
    vendorPayments: [
      {
        voucherNumber: `KT-PAY-V-${d}-001`,
        date: d,
        bookingReference: 'KT-BKG-8902',
        vendorName: 'Ramesh Gurav',
        vendorType: 'JEEP_DRIVER',
        vehicleOrVessel: 'MH 01 DX 4022 (Open Safari Jeep)',
        tourTitle: 'Vintage Open Jeep #UrbanSafari',
        amountInr: 4500,
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const dateParam = searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const format = searchParams.get('format') || 'json';

    const batchData = getSampleEODData(dateParam);
    const { metrics, xml, csv } = TallyVoucherGenerator.generateEODBatch(dateParam, batchData);

    if (format === 'xml') {
      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="Khaki_Tally_EOD_${dateParam.replace(/-/g, '')}.xml"`,
        },
      });
    }

    if (format === 'csv') {
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Khaki_Tally_DayBook_${dateParam.replace(/-/g, '')}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      date: dateParam,
      metrics,
      records_count: {
        receipts: batchData.receipts.length,
        guide_payouts: batchData.guidePayouts.length,
        vendor_payments: batchData.vendorPayments.length,
      },
      export_endpoints: {
        xml_download: `/api/tally/export?date=${dateParam}&format=xml`,
        csv_download: `/api/tally/export?date=${dateParam}&format=csv`,
      },
      batch: batchData,
    });
  } catch (error: any) {
    console.error('[Tally EOD Export] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dateParam = body.date || new Date().toISOString().slice(0, 10);

    const batchData = getSampleEODData(dateParam);
    const { metrics, xml } = TallyVoucherGenerator.generateEODBatch(dateParam, batchData);

    const syncResult = await tallyClient.postXmlToTally(xml);

    return NextResponse.json({
      success: syncResult.success,
      date: dateParam,
      tally_response: syncResult.responseText,
      metrics,
      vouchers_pushed: {
        receipts: batchData.receipts.length,
        guide_payouts: batchData.guidePayouts.length,
        vendor_payments: batchData.vendorPayments.length,
      },
    });
  } catch (error: any) {
    console.error('[Tally Direct Push] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
