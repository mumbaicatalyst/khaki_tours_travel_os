import { NextRequest, NextResponse } from 'next/server';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';
import { appStore } from '@/lib/db/store';
import { WhatsAppWebhookPayload } from '@/types/whatsapp';

export const dynamic = 'force-dynamic';

/**
 * GET handler: Meta Cloud API webhook verification challenge OR message history lookup
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  // Query message history for inbox UI
  const phone = searchParams.get('phone');
  if (phone) {
    const messages = appStore.getWhatsAppMessages(phone);
    const isTakeover = appStore.isHumanTakeover(phone);
    return NextResponse.json({
      phone,
      messages,
      isHumanTakeover: isTakeover,
    });
  }

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'khaki_tours_verify_2026';

  if (mode === 'subscribe' && token === expectedToken) {
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST handler: Handles Outbound Send (from UI), Human Takeover toggles, and Inbound Webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();

    // Toggle human takeover
    if (body.phone && typeof body.setTakeover === 'boolean') {
      appStore.setHumanTakeover(body.phone, body.setTakeover);
      return NextResponse.json({ success: true, isHumanTakeover: body.setTakeover });
    }

    // 1. Outbound Send Request from Khaki Travel OS UI / Unified Inbox
    if (body.to && (body.message || body.text)) {
      const recipient = body.to;
      const textToSend = body.message || body.text;

      console.log(`[Outbound WhatsApp Request] To: ${recipient}, Text: "${textToSend}"`);
      const result = await metaWhatsApp.sendTextMessage({
        to: recipient,
        text: textToSend,
      });

      // Record outbound human agent message
      appStore.recordWhatsAppMessage({
        phone: recipient,
        sender: 'HUMAN',
        text: textToSend,
        messageId: result.messageId,
        status: result.success ? 'DELIVERED' : 'FAILED',
      });

      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        isMock: result.isMock,
        error: result.error,
      });
    }

    // 2. Inbound Webhook Event from Meta
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const messages = change.value?.messages || [];
          for (const message of messages) {
            if (message.type === 'interactive' && message.interactive?.button_reply) {
              const buttonId = message.interactive.button_reply.id;
              console.log(`[WhatsApp Inbound] Interactive button clicked: ${buttonId} by ${message.from}`);
            } else if (message.text?.body) {
              console.log(`[WhatsApp Inbound] Message received from ${message.from}: "${message.text.body}"`);
            }
          }
        }
      }
      return NextResponse.json({ status: 'success' }, { status: 200 });
    }

    return NextResponse.json({ status: 'ignored' }, { status: 200 });
  } catch (error: any) {
    console.error('[WhatsApp Route Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
