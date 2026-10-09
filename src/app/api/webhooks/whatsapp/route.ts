import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';
import { jevClient } from '@/lib/ai/jev';
import { supabaseAdmin } from '@/lib/supabase/client';
import { appStore } from '@/lib/db/store';
import { generateConciergeReply } from '@/lib/whatsapp/concierge';
import { queryGeminiConcierge } from '@/lib/ai/gemini-concierge';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'khaki_tours_verify_2026';

/**
 * 1. Meta Webhook Verification (GET)
 * Meta calls this endpoint when you configure your webhook in the Meta App Dashboard.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Meta Webhook Verified Successfully]');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Verification failed', { status: 403 });
}

/**
 * 2. Meta Inbound Events Receiver (POST)
 * Receives all incoming WhatsApp messages, button replies, delivery statuses, and read receipts.
 * Validates HMAC-SHA256 signature via META_APP_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    // Cryptographic HMAC-SHA256 Signature Verification
    if (appSecret && signatureHeader && signatureHeader.startsWith('sha256=')) {
      const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const a = Buffer.from(signatureHeader);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        console.warn('[WhatsApp Webhook] Invalid HMAC signature detected. Rejecting forged payload.');
        return new Response('Invalid webhook signature', { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    // Verify it is a WhatsApp event
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        // A. Handle Message Status Updates (sent, delivered, read)
        if (value.statuses && value.statuses.length > 0) {
          for (const statusObj of value.statuses) {
            const wamid = statusObj.id;
            const newStatus = statusObj.status?.toUpperCase(); // SENT, DELIVERED, READ, FAILED
            console.log(`[WhatsApp Delivery Status] ${wamid} -> ${newStatus}`);

            // Update in Supabase if table exists
            try {
              await supabaseAdmin
                .from('whatsapp_messages')
                .update({ status: newStatus })
                .eq('wamid', wamid);
            } catch {
              // Best effort
            }
          }
        }

        // B. Handle Incoming Messages from Guests
        if (value.messages && value.messages.length > 0) {
          const contactInfo = value.contacts?.[0] || {};
          const guestName = contactInfo.profile?.name || 'WhatsApp Guest';

          for (const msg of value.messages) {
            const senderPhone = `+${msg.from}`;
            const wamid = msg.id;
            const msgType = msg.type; // 'text', 'interactive', 'location', 'audio', etc.

            let messageText = '';
            if (msgType === 'text') {
              messageText = msg.text?.body || '';
            } else if (msgType === 'interactive') {
              messageText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || 'Interactive Reply';
            } else if (msgType === 'location') {
              messageText = `📍 Shared Location: ${msg.location?.name || ''} (${msg.location?.latitude}, ${msg.location?.longitude})`;
            } else {
              messageText = `[${msgType.toUpperCase()} Message]`;
            }

            console.log(`[Inbound WhatsApp from ${guestName} (${senderPhone})]: "${messageText}"`);

            // Mark message as read on Meta
            metaWhatsApp.markAsRead(wamid).catch(() => {});

            // Check if contact exists in Khaki CRM
            let existingContact = appStore.getContactById(senderPhone);
            if (!existingContact) {
              existingContact = appStore.createContact({
                full_name: guestName,
                phone_number: senderPhone,
                segment_tags: ['WHATSAPP_INBOUND'],
                rfm_score: 50,
              });
            }

            // Run TypeSafe Jev AI Intelligence for triage routing & lead scoring
            let jevTriage: any = null;
            let priorityTier = 'P3_STANDARD';
            let slaMinutes = 60;
            let isCorporate = false;

            try {
              jevTriage = await jevClient.triageInboundMessage(messageText);
              const lead = jevTriage?.leadAnalysis;
              if (lead?.isCorporate || (lead?.corporateProbability && lead.corporateProbability > 0.7)) {
                priorityTier = 'P1_CRITICAL_CORPORATE';
                slaMinutes = 15;
                isCorporate = true;
              } else if (lead?.urgency === 'THIS_WEEKEND' || lead?.urgency === 'TODAY_URGENT') {
                priorityTier = 'P2_HIGH_URGENT';
                slaMinutes = 30;
              }
            } catch (aiErr) {
              console.warn('[Jev AI Evaluation Error]:', aiErr);
            }

            // Save conversation into Supabase
            try {
              const { data: conv } = await supabaseAdmin
                .from('whatsapp_conversations')
                .upsert({
                  phone_number: senderPhone,
                  contact_name: guestName,
                  contact_id: existingContact?.id,
                  organization_name: isCorporate ? (existingContact?.company || 'Corporate Client') : undefined,
                  priority_tier: priorityTier,
                  sla_minutes: slaMinutes,
                  last_message_text: messageText,
                  last_message_at: new Date().toISOString(),
                }, { onConflict: 'phone_number' })
                .select('id')
                .single();

              if (conv?.id) {
                await supabaseAdmin.from('whatsapp_messages').insert({
                  conversation_id: conv.id,
                  wamid,
                  direction: 'INBOUND',
                  sender_type: 'GUEST',
                  message_type: msgType,
                  body: messageText,
                  status: 'DELIVERED',
                  raw_payload: msg,
                });
              }
            } catch (dbErr) {
              console.warn('[Supabase WhatsApp Insert Fallback]:', dbErr);
            }

            // Record inbound message into Khaki persistent store
            appStore.recordWhatsAppMessage({
              phone: senderPhone,
              name: guestName,
              sender: 'GUEST',
              text: messageText,
              messageId: wamid,
              status: 'DELIVERED',
            });

            // Check Human Takeover state
            const isHumanTakeoverActive = appStore.isHumanTakeover(senderPhone);
            const userWantsBot = messageText.toLowerCase().includes('#bot') || messageText.toLowerCase().includes('#menu');

            if (isHumanTakeoverActive && !userWantsBot) {
              console.log(`[Human Takeover Active for ${senderPhone}] Suppressing bot response. Agent has control.`);
            } else {
              let replyText = '';
              let isTakeoverRequested = false;

              // 1. FAST PATH: Check if Jev Triage already resolved an instant local reply (Policy FAQs, Corporate VIP ack)
              if (jevTriage?.routedTo === 'LOCAL_FAST_PATH' && jevTriage?.replyText) {
                console.log(`[Jev Fast-Path Hit for ${senderPhone}] Category: ${jevTriage.category} - Bypassing LLM.`);
                replyText = jevTriage.replyText;
              } else {
                // 2. Primary: Query Google Gemini AI Concierge for rich conversational & heritage queries
                try {
                  console.log(`[Invoking Gemini Concierge for ${senderPhone}] Message: "${messageText}"`);
                  const geminiResult = await queryGeminiConcierge({
                    senderPhone,
                    guestName,
                    messageText,
                  });
                  replyText = geminiResult.replyText;
                  isTakeoverRequested = geminiResult.isHumanTakeoverRequested;
                } catch (geminiErr) {
                  console.warn('[Gemini Concierge Fallback]:', geminiErr);
                  // 3. Graceful Fallback: Local catalog matcher
                  const fallbackResult = generateConciergeReply({
                    senderPhone,
                    guestName,
                    messageText,
                    isCorporate: isCorporate || Boolean(jevTriage?.leadAnalysis?.isCorporate),
                  });
                  replyText = fallbackResult.replyText;
                  isTakeoverRequested = Boolean(fallbackResult.shouldMuteBot);
                }
              }

              if (isTakeoverRequested) {
                appStore.setHumanTakeover(senderPhone, true);
              } else if (userWantsBot) {
                appStore.setHumanTakeover(senderPhone, false);
              }

              console.log(`[Concierge Response Ready] Sending to ${senderPhone}: "${replyText.slice(0, 80)}..."`);

              const sendRes = await metaWhatsApp.sendTextMessage({
                to: senderPhone,
                text: replyText,
                replyToMessageId: wamid,
              });

              // Record bot response in store
              appStore.recordWhatsAppMessage({
                phone: senderPhone,
                name: 'Khaki Concierge (Gemini)',
                sender: 'BOT',
                text: replyText,
                messageId: sendRes.messageId,
                status: 'DELIVERED',
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('[Meta Webhook Exception]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
