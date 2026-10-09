import { NextRequest, NextResponse } from 'next/server';
import { voiceClient } from '@/lib/voice/client';
import { IntakeEngine } from '@/modules/intake/intake-engine';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const signature = req.headers.get('x-voice-signature');

    if (!voiceClient.validateSignature(signature)) {
      return NextResponse.json({ error: 'Unauthorized signature' }, { status: 401 });
    }

    const payload = voiceClient.parseQualificationPayload(rawBody);

    if (!payload.caller_phone) {
      return NextResponse.json({ error: 'Missing caller_phone parameter' }, { status: 400 });
    }

    const result = await IntakeEngine.handleVoiceQualificationHandoff(payload);

    return NextResponse.json({
      success: result.success,
      booking_reference: result.bookingReference,
      whatsapp_message_id: result.whatsappMessageId,
      verbal_consent_captured: payload.verbal_consent,
    });
  } catch (error) {
    console.error('[Voice Webhook] Error processing voice handoff:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
