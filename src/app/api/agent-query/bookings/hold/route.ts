import { NextRequest, NextResponse } from 'next/server';
import { inMemoryCatalog } from '@/lib/supabase/seed';
import { DispatchRulesEngine } from '@/modules/dispatch/rules-engine';
import { whatsappClient } from '@/lib/whatsapp/client';
import { TourType } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone_number,
      full_name = 'Valued Guest',
      departure_id,
      tour_id,
      group_size = 1,
      send_whatsapp_link = true,
    } = body;

    if (!phone_number) {
      return NextResponse.json(
        { error: 'Missing phone_number. Valid mobile number required.' },
        { status: 400 }
      );
    }

    // Locate requested departure or tour
    let matchedDeparture = inMemoryCatalog.departures.find((d) => d.departure_id === departure_id);
    let matchedTour = inMemoryCatalog.tours.find((t) => t.tour_id === tour_id);

    if (matchedDeparture && !matchedTour) {
      matchedTour = inMemoryCatalog.tours.find((t) => t.tour_id === matchedDeparture.tour_id);
    }

    if (!matchedTour && !matchedDeparture) {
      // Fallback to first available tour
      matchedTour = inMemoryCatalog.tours[0];
    }

    const category: TourType = matchedTour?.category || 'STANDARD_WALK';
    const pricePerPax = matchedDeparture?.price_inr || matchedTour?.base_price_inr || 899;
    const totalAmountInr = pricePerPax * group_size;

    // Evaluate rules engine
    const decision = DispatchRulesEngine.evaluateBookingRoute({
      category,
      leadTimeHours: 72,
      availableSeats: matchedDeparture?.available_seats || 20,
      groupSize: Number(group_size),
    });

    const bookingRef = `KT-HLD-${Date.now().toString().slice(-6)}`;
    const expiresAt = new Date(Date.now() + decision.paymentLinkExpiryMinutes * 60 * 1000).toISOString();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khakitours-travel-os.netlify.app';
    const paymentUrl = `${siteUrl}/bookings?hold=${bookingRef}&amt=${totalAmountInr}`;

    // Optionally dispatch WhatsApp interactive payment prompt
    let whatsappMessageId: string | undefined;
    if (send_whatsapp_link) {
      const waPrompt = await whatsappClient.sendTextMessage({
        to: phone_number,
        body:
          `Hello ${full_name}! 👋\n\n` +
          `Your seats for *${matchedTour?.title || 'Mumbai Heritage Walk'}* are temporarily held.\n\n` +
          `• *Booking Reference:* ${bookingRef}\n` +
          `• *Party Size:* ${group_size} Guest(s)\n` +
          `• *Total Payable:* ₹${totalAmountInr.toLocaleString('en-IN')} (incl. taxes)\n` +
          `• *Hold Expires In:* ${decision.paymentLinkExpiryMinutes} minutes\n\n` +
          `Tap below to complete instant payment and secure your digital ticket:\n` +
          `${paymentUrl}\n\n` +
          `_Map pin and host contact will be sent immediately upon payment confirmation._`,
      });
      whatsappMessageId = waPrompt.messageId;
    }

    return NextResponse.json({
      success: true,
      booking_reference: bookingRef,
      status: decision.initialBookingStatus,
      operating_path: decision.operatingPath,
      hold_expires_at: expiresAt,
      expiry_minutes: decision.paymentLinkExpiryMinutes,
      pricing: {
        price_per_pax: pricePerPax,
        group_size: Number(group_size),
        total_amount_inr: totalAmountInr,
      },
      payment_link_url: paymentUrl,
      whatsapp_sent: send_whatsapp_link,
      whatsapp_message_id: whatsappMessageId,
      instructions_for_bot:
        `Inform ${full_name} that ${group_size} seat(s) are held for ${decision.paymentLinkExpiryMinutes} minutes. Secure payment link sent via WhatsApp.`,
    });
  } catch (error: any) {
    console.error('[Agent Query Hold] Error creating hold:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
