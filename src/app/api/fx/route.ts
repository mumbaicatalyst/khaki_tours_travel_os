import { NextRequest, NextResponse } from 'next/server';
import { FxSimulatorEngine } from '@/modules/fx-simulator/calculator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tour_id, booking_id, cost_usd, spot_usd_inr, buffer_percentage, target_margin_percentage } = body;

    if (!cost_usd || Number(cost_usd) <= 0) {
      return NextResponse.json({ error: 'Valid cost_usd parameter is required' }, { status: 400 });
    }

    const calculation = FxSimulatorEngine.calculateQuote({
      tourId: tour_id || 'manual_simulation',
      bookingId: booking_id,
      costUsd: Number(cost_usd),
      spotUsdInr: spot_usd_inr ? Number(spot_usd_inr) : undefined,
      bufferPercentage: buffer_percentage ? Number(buffer_percentage) : undefined,
      targetMarginPercentage: target_margin_percentage ? Number(target_margin_percentage) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    console.error('[FX API] Error computing forex quote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
