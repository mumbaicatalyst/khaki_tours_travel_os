import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      departure_id,
      guide_id,
      is_substitution,
      previous_guide_id,
      reason,
      send_whatsapp = true,
    } = body;

    if (!departure_id || !guide_id) {
      return NextResponse.json(
        { error: 'departure_id and guide_id are required' },
        { status: 400 }
      );
    }

    let result: any;
    if (is_substitution) {
      result = appStore.substituteGuide(departure_id, guide_id, previous_guide_id, reason);
    } else {
      result = appStore.allocateGuide(departure_id, guide_id);
    }

    if (!result || !result.success) {
      return NextResponse.json({ error: 'Allocation failed. Check IDs.' }, { status: 404 });
    }

    // Send WhatsApp Roster dispatch to the newly assigned guide
    if (send_whatsapp && result.guide?.phone) {
      const dep = result.departure;
      const tourTitle = dep?.tour_title || 'Heritage Experience';
      const depDate = dep?.departure_date || 'Upcoming';
      const depTime = dep?.start_time || '08:30 AM';
      const landmark = dep?.meeting_point || 'South Mumbai';

      const msg = is_substitution
        ? `🔄 *KHAKI TOURS URGENT ROSTER UPDATE*\n\nNamaste ${result.guide.name}!\nYou have been reassigned to lead:\n• *Tour:* ${tourTitle}\n• *Date & Time:* ${depDate} at ${depTime}\n• *Assembly Point:* ${landmark}\n• *Payout:* ₹2,500\n\nPlease confirm availability on WhatsApp.`
        : `🏛️ *KHAKI TOURS MONTHLY ROSTER ASSIGNMENT*\n\nNamaste ${result.guide.name}!\nYou have been rostered to lead:\n• *Tour:* ${tourTitle}\n• *Date & Time:* ${depDate} at ${depTime}\n• *Assembly Point:* ${landmark}\n• *Payout:* ₹2,500\n\nPlease view your briefing manifest in the portal.`;

      metaWhatsApp.sendTextMessage({ to: result.guide.phone, text: msg }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Guides Allocate API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
