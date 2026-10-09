import { NextRequest, NextResponse } from 'next/server';
import { inMemoryCatalog } from '@/lib/supabase/seed';

/**
 * GET /api/agent-query/departures/availability
 * Real-time seat availability check for WhatsApp and Voice AI callers
 * Query parameters:
 *  - date: YYYY-MM-DD (e.g. '2026-10-10')
 *  - tour_id: Tour identifier or slug
 *  - min_seats: Requested party size (default 1)
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const targetDate = searchParams.get('date')?.trim();
  const tourId = searchParams.get('tour_id')?.trim();
  const minSeats = Math.max(Number(searchParams.get('min_seats')) || 1, 1);
  const limit = Math.min(Number(searchParams.get('limit')) || 10, 30);

  let departures = inMemoryCatalog.departures;

  if (targetDate) {
    departures = departures.filter((d) => d.date === targetDate);
  }

  if (tourId) {
    departures = departures.filter(
      (d) => d.tour_id === tourId || d.departure_id?.includes(tourId)
    );
  }

  // Filter for available seats >= minSeats
  const availableSlots = departures
    .filter((d) => d.available_seats >= minSeats && d.status === 'OPEN_FOR_BOOKING')
    .slice(0, limit);

  return NextResponse.json({
    total_available_slots: availableSlots.length,
    party_size_requested: minSeats,
    filter_date: targetDate || 'ANY_UPCOMING',
    departures: availableSlots.map((d) => ({
      departure_id: d.departure_id,
      tour_id: d.tour_id,
      tour_title: d.tour_title,
      hashtag: d.hashtag,
      date: d.date,
      time: d.time,
      departure_datetime: d.departure_datetime,
      meeting_point: d.meeting_point,
      price_per_pax_inr: d.price_inr,
      available_seats: d.available_seats,
      total_capacity: d.total_capacity,
      instant_bookable: d.is_fast_path_eligible,
    })),
  });
}
