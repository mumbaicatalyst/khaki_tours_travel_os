import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category');
    const query = searchParams.get('q')?.toLowerCase().trim();

    let tours = appStore.getTours();

    if (category && category !== 'ALL') {
      tours = tours.filter((t) => t.category === category);
    }

    if (query) {
      tours = tours.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.hashtag.toLowerCase().includes(query) ||
          (t.meeting_landmark || '').toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      count: tours.length,
      tours,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: 'Tour title is required' }, { status: 400 });
    }

    const created = appStore.createTour(body);
    return NextResponse.json({
      success: true,
      tour: created,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
