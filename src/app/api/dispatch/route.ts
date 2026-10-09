import { NextRequest, NextResponse } from 'next/server';
import { whatsappClient } from '@/lib/whatsapp/client';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dispatches = appStore.getDispatches();
    return NextResponse.json({ success: true, count: dispatches.length, dispatches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      booking_id,
      tour_title,
      departure_date,
      group_size,
      payout_amount_inr,
      target_phones = [],
    } = body;

    if (!booking_id || !target_phones.length) {
      return NextResponse.json(
        { error: 'Missing required parameters: booking_id and target_phones required' },
        { status: 400 }
      );
    }

    const dispatchId = `disp_${Date.now()}`;
    const results = [];

    for (const phone of target_phones) {
      const response = await whatsappClient.sendDispatchButtonPrompt({
        to: phone,
        headerText: 'Khaki Tours Ops: Assignment Request',
        bodyText:
          `You have a new assignment request!\n\n` +
          `• *Tour:* ${tour_title || 'Heritage Walk'}\n` +
          `• *Date/Time:* ${departure_date || 'Upcoming'}\n` +
          `• *Group Size:* ${group_size || 1} Pax\n` +
          `• *Payout:* ₹${payout_amount_inr || 2500}\n\n` +
          `Please respond within 30 minutes:`,
        footerText: 'Khaki Operations Desk',
        buttons: [
          { id: `DISPATCH_ACCEPT_${dispatchId}`, title: 'Accept Tour' },
          { id: `DISPATCH_DECLINE_${dispatchId}`, title: 'Decline / Busy' },
        ],
      });
      results.push({ phone, success: response.success, messageId: response.messageId });
    }

    return NextResponse.json({
      success: true,
      dispatch_id: dispatchId,
      dispatches_sent: results.length,
      details: results,
      timeout_minutes: 30,
    });
  } catch (error) {
    console.error('[Dispatch API] Error triggering broadcast:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { dispatch_id, status, entity_name } = body;

    if (!dispatch_id || !status) {
      return NextResponse.json(
        { error: 'dispatch_id and status are required' },
        { status: 400 }
      );
    }

    const updated = appStore.updateDispatchStatus(dispatch_id, status, entity_name);
    if (!updated) {
      return NextResponse.json({ error: `Dispatch ${dispatch_id} not found` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      dispatch: updated,
    });
  } catch (error: any) {
    console.error('[Dispatch API PATCH Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

