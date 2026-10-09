import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guides = appStore.getGuides();
    return NextResponse.json({
      success: true,
      count: guides.length,
      guides,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'id and updates object required' }, { status: 400 });
    }

    const updated = appStore.updateGuide(id, updates);
    if (!updated) {
      return NextResponse.json({ error: `Guide ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, guide: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
