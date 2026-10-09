import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { departureId, seats = 1, contactName, phone, reason } = body;

    if (!departureId) {
      return NextResponse.json({ error: 'departureId is required' }, { status: 400 });
    }

    const result = appStore.holdDepartureSeats(departureId, Number(seats) || 1);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // If contact provided, create a pending booking record
    let booking = null;
    if (contactName || phone) {
      booking = appStore.createBooking({
        contact_name: contactName || 'Pending Guest Hold',
        contact_phone: phone || '',
        tour_title: result.departure.tour_title,
        departure_date: result.departure.departure_date,
        group_size: Number(seats) || 1,
        total_amount_inr: (result.departure.ticket_price_inr || 899) * (Number(seats) || 1),
        amount_paid_inr: 0,
        status: 'SEATS_HELD_30MIN',
        category: 'STANDARD_WALK',
        notes: reason || 'Temporary inventory hold placed via Khaki OS',
      });
    }

    return NextResponse.json({
      success: true,
      departure: result.departure,
      booking,
      message: `Held ${seats} seat(s) for ${result.departure.tour_title} on ${result.departure.departure_date}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
