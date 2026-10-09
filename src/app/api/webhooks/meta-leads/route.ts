import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'khaki_os_meta_webhook_2026';

// 1. Meta Webhook Verification (GET)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Verification token mismatch', { status: 403 });
}

// 2. Meta Lead Ads Ingestion (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both direct payload and Meta Graph nested payload
    const leadData = body.entry?.[0]?.changes?.[0]?.value || body;
    const formId = leadData.form_id || 'form_ig_default';
    const campaignName = leadData.campaign_name || body.campaign_name || 'Instagram Expedition Campaign';
    const leadGenId = leadData.leadgen_id || `lead_${Date.now()}`;

    // Extracted field values
    const fullName = leadData.full_name || body.name || 'Instagram Explorer';
    const phone = leadData.phone_number || body.phone || '';
    const email = leadData.email || body.email || '';
    const tourInterest = leadData.tour_interest || body.tour_title || 'International Expedition';

    // Ingest into App Store CRM
    const newContact = appStore.createContact({
      full_name: fullName,
      phone_number: phone,
      email: email,
      segment_tags: ['INSTAGRAM_AD_LEAD', 'MARKETING_PROSPECT', 'INTERNATIONAL_INTEREST'],
      notes: `Ingested from Instagram Ad Campaign: "${campaignName}" (Form: ${formId})`,
      preferred_channel: phone ? 'WHATSAPP' : 'EMAIL',
    });

    // Ingest into Unified Inbox
    const cleanPhoneOrEmail = phone || email || leadGenId;
    appStore.recordWhatsAppMessage({
      messageId: `lead_${Date.now()}`,
      phone: cleanPhoneOrEmail,
      sender: 'GUEST',
      text: `📸 [INSTAGRAM LEAD AD] Inquiry from campaign: "${campaignName}"\n• Interest: ${tourInterest}\n• Email: ${email || 'N/A'}\n• Phone: ${phone || 'N/A'}`,
      name: fullName,
      status: 'DELIVERED',
      metadata: {
        channel: 'INSTAGRAM_LEAD_AD',
        campaign: campaignName,
        formId,
      },
    });

    appStore.updateConversation(cleanPhoneOrEmail, {
      inbound_stream: 'INTERNATIONAL',
      priority_tier: 'P1_HOT_LEAD',
      human_takeover: false,
    });

    // Instant Multi-Channel Response Trigger
    if (phone) {
      const welcomeText =
        `Namaste ${fullName}! 🏛️\n\n` +
        `Thank you for expressing interest in Khaki Tours' *${tourInterest}* on Instagram!\n\n` +
        `Our Curatorial Desk has reserved priority briefing spots for this departure.\n` +
        `• 📜 Download Expedition Dossier: https://khakitours.com/expeditions\n` +
        `• 💬 Reply here anytime to chat with our Heritage Ambassador.\n\n` +
        `_Khaki Tours • Discover the Secrets of Mumbai & Beyond_`;

      metaWhatsApp.sendTextMessage({ to: phone, text: welcomeText }).catch((err) =>
        console.warn('[Meta Lead WhatsApp Auto-Reply Failed]:', err)
      );
    }

    return NextResponse.json({
      success: true,
      status: 'LEAD_INGESTED',
      contact_id: newContact.id,
      lead_id: leadGenId,
      campaign: campaignName,
    });
  } catch (error: any) {
    console.error('[Meta Leads Ingestion Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
