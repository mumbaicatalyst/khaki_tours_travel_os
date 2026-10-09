import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieve live manifest roster and check-in state for a departure slot
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const departureId = searchParams.get('departure_id');

    if (!departureId) {
      // If not specified, default to first upcoming departure
      const deps = appStore.getDepartures();
      if (!deps.length) {
        return NextResponse.json({ success: false, error: 'No departures found' }, { status: 404 });
      }
      const firstDepId = deps[0].id || deps[0].departure_id;
      const manifest = appStore.getManifestForDeparture(firstDepId);
      return NextResponse.json({ success: true, ...manifest });
    }

    const manifest = appStore.getManifestForDeparture(departureId);
    if (!manifest) {
      return NextResponse.json(
        { success: false, error: `Departure ${departureId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, ...manifest });
  } catch (error: any) {
    console.error('[Manifests API GET Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PATCH: Toggle attendance / check-in status for a manifest passenger
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { guest_id, attended } = body;

    if (!guest_id || typeof attended !== 'boolean') {
      return NextResponse.json(
        { error: 'guest_id and boolean attended flag required' },
        { status: 400 }
      );
    }

    const updated = appStore.updateGuestAttendance(guest_id, attended);
    return NextResponse.json({
      success: true,
      guest_id,
      attended,
      updated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Manifests API PATCH Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
