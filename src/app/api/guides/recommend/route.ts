import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tour_title, tour_date, category, policy } = body;

    const result = appStore.recommendGuidesForTour({
      tourTitle: tour_title || '',
      tourDate: tour_date,
      category,
      policy: policy as any,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('[Guides Recommend API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
