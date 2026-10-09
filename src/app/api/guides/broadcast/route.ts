import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';
import { whatsappClient } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      departure_id,
      tour_title,
      departure_date,
      start_time,
      candidate_ids = [],
    } = body;

    const dispatchId = `disp_fcfs_${Date.now()}`;
    const guides = appStore.getGuides();
    const targetedGuides = candidate_ids.length > 0
      ? guides.filter((g: any) => candidate_ids.includes(g.id))
      : guides.slice(0, 3);

    const results = [];
    for (const g of targetedGuides) {
      const response = await whatsappClient.sendDispatchButtonPrompt({
        to: g.phone,
        headerText: 'Khaki Tours: Urgent <48h Assignment',
        bodyText:
          `Namaste ${g.name}!\n\n` +
          `Urgent assignment broadcast request:\n` +
          `• *Tour:* ${tour_title || 'Heritage Experience'}\n` +
          `• *Date/Time:* ${departure_date || 'Tomorrow'} at ${start_time || '08:30 AM'}\n` +
          `• *Payout:* ₹2,500\n\n` +
          `First to click Accept is locked as Primary Guide; second is Standby Backup (30m timer):`,
        footerText: 'Khaki Operations Flight Board',
        buttons: [
          { id: `DISPATCH_ACCEPT_${dispatchId}`, title: 'Accept Tour' },
          { id: `DISPATCH_DECLINE_${dispatchId}`, title: 'Decline / Busy' },
        ],
      });
      results.push({ guide_id: g.id, name: g.name, phone: g.phone, success: response.success });
    }

    // Create persistent dispatch ticket on flight board
    appStore.createDispatch({
      id: dispatchId,
      bookingRef: departure_id || 'KT-BKG-SPEED',
      tourTitle: tour_title || 'Urgent Heritage Walk',
      category: 'PRIVATE_GROUP',
      resourceType: 'GUIDE',
      entityName: `Speed Broadcast (Top ${targetedGuides.length} Candidates)`,
      entityRoleOrVehicle: `Standby Pool: ${targetedGuides.map((g: any) => g.name).join(', ')}`,
      payoutInr: 2500,
      status: 'BROADCAST_SENT',
      timeLeftMinutes: 30,
      channel: 'WHATSAPP_DIRECT',
    });

    return NextResponse.json({
      success: true,
      dispatch_id: dispatchId,
      candidates_contacted: results.length,
      details: results,
      timeout_minutes: 30,
    });
  } catch (error: any) {
    console.error('[Guides Broadcast API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
