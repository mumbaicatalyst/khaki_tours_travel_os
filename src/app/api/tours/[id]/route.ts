import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tour = appStore.getTourById(params.id);
    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, tour });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = appStore.updateTour(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, tour: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = appStore.deleteTour(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: `Tour ${params.id} permanently deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
