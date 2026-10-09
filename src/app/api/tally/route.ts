import { NextRequest, NextResponse } from 'next/server';
import { TallyVoucherGenerator } from '@/modules/tally-sync/voucher-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      booking_id,
      booking_reference,
      guest_name,
      tour_title,
      total_amount_inr,
      is_corporate,
    } = body;

    if (!booking_id || !total_amount_inr) {
      return NextResponse.json(
        { error: 'Missing required parameters: booking_id and total_amount_inr' },
        { status: 400 }
      );
    }

    const result = await TallyVoucherGenerator.generateAndSyncReceipt({
      bookingId: booking_id,
      bookingReference: booking_reference || `KT-BKG-${Date.now().toString().slice(-4)}`,
      guestName: guest_name || 'Walking Tour Guest',
      tourTitle: tour_title || 'Heritage Experience',
      totalAmountInr: Number(total_amount_inr),
      isCorporate: Boolean(is_corporate),
    });

    return NextResponse.json({
      success: result.success,
      voucher_number: result.voucherNumber,
      xml_payload: result.xml,
    });
  } catch (error) {
    console.error('[Tally API] Voucher sync failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
