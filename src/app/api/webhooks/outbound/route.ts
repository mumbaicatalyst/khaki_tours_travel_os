import { NextRequest, NextResponse } from 'next/server';

interface OutboundWebhookEvent {
  event:
    | 'GUIDE_DISPATCH_TRIGGERED'
    | 'VENDOR_LOGISTICS_TRIGGERED'
    | 'T_MINUS_2H_BRIEFING_TRIGGERED'
    | 'CORPORATE_SLA_BREACH'
    | 'BOOKING_CONFIRMED'
    | 'WEBSITE_SYNC_EVENT';
  timestamp: string;
  payload: Record<string, any>;
}

// In-memory simulation log for development/testing
const webhookDeliveryLog: Array<OutboundWebhookEvent & { status: string; targetUrl?: string }> = [];

export async function GET() {
  return NextResponse.json({
    active_webhook_url: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/khaki-os',
    recent_events_count: webhookDeliveryLog.length,
    recent_events: webhookDeliveryLog.slice(-20),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: OutboundWebhookEvent = await req.json();
    const { event, payload } = body;

    if (!event || !payload) {
      return NextResponse.json({ error: 'Missing event or payload' }, { status: 400 });
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    let deliveryStatus = 'LOGGED_ONLY';

    if (n8nWebhookUrl) {
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-khaki-signature': 'khaki_secure_event_token',
          },
          body: JSON.stringify({
            event,
            source: 'khaki-travel-os',
            timestamp: new Date().toISOString(),
            payload,
          }),
        });
        deliveryStatus = response.ok ? 'DELIVERED_200' : `FAILED_${response.status}`;
      } catch (err: any) {
        deliveryStatus = `FETCH_ERROR_${err.message}`;
      }
    }

    const record = {
      event,
      timestamp: new Date().toISOString(),
      payload,
      status: deliveryStatus,
      targetUrl: n8nWebhookUrl || 'NO_REMOTE_URL_CONFIGURED',
    };

    webhookDeliveryLog.push(record);

    return NextResponse.json({
      success: true,
      event_emitted: event,
      status: deliveryStatus,
      record,
    });
  } catch (error: any) {
    console.error('[Outbound Webhooks] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
