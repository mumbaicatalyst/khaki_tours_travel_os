import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

interface InboundEmailPayload {
  from: string;
  to?: string;
  subject: string;
  text?: string;
  html?: string;
  sender_name?: string;
}

const SPAM_KEYWORDS = [
  'seo services',
  'web design proposal',
  'outsource development',
  'guest post submission',
  'backlink exchange',
  'b2b leads list',
  'cryptocurrency trading',
  'unsolicited commercial',
  'casino bonus',
];

export async function POST(req: NextRequest) {
  try {
    const body: InboundEmailPayload = await req.json();

    const fromAddress = body.from || '';
    const subject = body.subject || '';
    const emailBody = body.text || body.html || '';
    const combinedContent = `${subject} ${emailBody}`.toLowerCase();

    // 1. Intelligent Spam & Cold Sales Filter
    const isSpam = SPAM_KEYWORDS.some((kw) => combinedContent.includes(kw));
    if (isSpam) {
      console.log(`[Email Inbound] Discarded spam email from: ${fromAddress} | Subject: "${subject}"`);
      return NextResponse.json({
        success: true,
        status: 'DISCARDED_SPAM',
        message: 'Spam / vendor pitch detected and dropped without alerting staff.',
      });
    }

    // 2. Extract Sender Details
    let senderName = body.sender_name || '';
    let cleanEmail = fromAddress;
    const match = fromAddress.match(/^(.*?)\s*<(.+?)>$/);
    if (match) {
      senderName = senderName || match[1].replace(/["']/g, '').trim();
      cleanEmail = match[2].trim();
    }
    if (!senderName) {
      senderName = cleanEmail.split('@')[0] || 'International Guest';
    }

    // 3. Extract Intent & International Markers
    const isInternational =
      combinedContent.includes('visiting mumbai') ||
      combinedContent.includes('tourist from') ||
      combinedContent.includes('united states') ||
      combinedContent.includes('uk') ||
      combinedContent.includes('europe') ||
      combinedContent.includes('australia') ||
      combinedContent.includes('usd') ||
      cleanEmail.endsWith('.edu') ||
      cleanEmail.endsWith('.gov') ||
      cleanEmail.endsWith('.uk') ||
      cleanEmail.endsWith('.au');

    const intent = combinedContent.includes('private') || combinedContent.includes('custom')
      ? 'PRIVATE_BESPOKE'
      : combinedContent.includes('corporate')
      ? 'CORPORATE_B2B'
      : 'PUBLIC_WALK_INQUIRY';

    // 4. Ingest into App Store CRM & Unified Inbox
    const cleanId = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const existingContact = appStore.getContacts().find(
      (c: any) => c.email?.toLowerCase() === cleanEmail.toLowerCase()
    );

    let contactId = existingContact?.id;
    if (!existingContact) {
      const newContact = appStore.createContact({
        full_name: senderName,
        email: cleanEmail,
        phone_number: '', // Overseas guest may not have phone
        segment_tags: isInternational ? ['INTERNATIONAL_TRAVELER', 'EMAIL_PRIMARY'] : ['EMAIL_PRIMARY'],
        notes: `Inbound email inquiry: "${subject}"`,
        preferred_channel: 'EMAIL',
      });
      contactId = newContact.id;
    }

    // Add message and conversation to Unified Inbox with EMAIL channel badge
    const messageId = `eml_${Date.now()}`;
    const newMsg = appStore.recordWhatsAppMessage({
      messageId,
      phone: cleanEmail, // Email used as handle
      sender: 'GUEST',
      text: `[EMAIL INBOUND] Subject: ${subject}\n\n${emailBody.slice(0, 500)}`,
      name: senderName,
      status: 'DELIVERED',
      metadata: {
        channel: 'EMAIL',
        subject,
        from: cleanEmail,
        isInternational,
        intent,
      },
    });

    // Update conversation properties
    appStore.updateConversation(cleanEmail, {
      inbound_stream: isInternational ? 'INTERNATIONAL' : 'GENERAL_INQUIRIES',
      priority_tier: isInternational ? 'P1_INTERNATIONAL_LEAD' : 'P2_INQUIRY',
      human_takeover: true, // Needs email reply
    });

    return NextResponse.json({
      success: true,
      status: 'PROCESSED_INQUIRY',
      channel: 'EMAIL',
      sender_name: senderName,
      email: cleanEmail,
      is_international: isInternational,
      intent,
      message_id: messageId,
      auto_reply_suggested: `Thank you for writing to Khaki Tours, ${senderName}. Our curatorial desk has received your inquiry regarding "${subject}". A Khaki Heritage Ambassador will respond directly with itinerary options and booking details.`,
    });
  } catch (error: any) {
    console.error('[Email Inbound Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
