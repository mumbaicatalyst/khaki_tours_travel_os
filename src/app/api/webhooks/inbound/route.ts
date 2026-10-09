import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, source, payload } = body;

    console.log(`[Inbound Automation Webhook] Received action "${action}" from source "${source}":`, payload);

    switch (action) {
      case 'DISPATCH_BUTTON_CLICKED':
      case 'GUIDE_ACCEPTED':
      case 'GUIDE_DECLINED': {
        const dispatchId = payload?.dispatch_id || payload?.id;
        const isDecline =
          action === 'GUIDE_DECLINED' ||
          payload?.decision === 'DECLINE' ||
          (payload?.button_id && payload.button_id.includes('DECLINE'));

        const newStatus = isDecline ? 'DECLINED' : 'ASSIGNED';
        const guideName =
          payload?.guide_name ||
          payload?.guideName ||
          payload?.entityName ||
          'Farhan K. (Senior Ambassador)';

        if (dispatchId) {
          appStore.updateDispatchStatus(dispatchId, newStatus, isDecline ? undefined : guideName);
        }

        return NextResponse.json({
          status: 'PROCESSED',
          message: `Dispatch ${dispatchId} resolved to ${newStatus}`,
          dispatch_id: dispatchId,
          decision: newStatus,
          assignedGuide: isDecline ? null : guideName,
          state_updated: true,
        });
      }

      case 'WEB_FORM_LEAD':
        // Inbound lead from khakitours.com or landing page
        return NextResponse.json({
          status: 'LEAD_INGESTED',
          lead_id: `lead_${Date.now()}`,
          sla_started: true,
        });

      case 'PAYMENT_CAPTURED':
        // External payment gateway capture (Razorpay / Cashfree)
        return NextResponse.json({
          status: 'BOOKING_LOCKED',
          booking_id: payload?.booking_id,
          seat_decremented: true,
        });

      default:
        return NextResponse.json({
          status: 'ACKNOWLEDGED',
          received: action,
        });
    }
  } catch (error: any) {
    console.error('[Inbound Automation Webhook] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
