import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');

    let bookings = appStore.getBookings();

    if (status && status !== 'ALL') {
      bookings = bookings.filter((b) => b.status === status);
    }

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.contact_name || !body.tour_title) {
      return NextResponse.json(
        { error: 'Contact name and tour title are required' },
        { status: 400 }
      );
    }

    const created = appStore.createBooking(body);
    return NextResponse.json({ success: true, booking: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
