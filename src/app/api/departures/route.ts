import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const tourId = searchParams.get('tour_id');
    const status = searchParams.get('status');

    let departures = appStore.getDepartures();

    if (tourId) {
      departures = departures.filter((d) => d.tour_id === tourId);
    }

    if (status && status !== 'ALL') {
      departures = departures.filter((d) => d.status === status);
    }

    return NextResponse.json({
      success: true,
      count: departures.length,
      departures,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.tour_title || !body.departure_date) {
      return NextResponse.json(
        { error: 'Tour title and departure date are required' },
        { status: 400 }
      );
    }

    const created = appStore.createDeparture(body);
    return NextResponse.json({ success: true, departure: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
