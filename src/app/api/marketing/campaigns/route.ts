import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contacts = appStore.getContacts();

    // Segment contacts for marketing
    const repeatWalkers = contacts.filter((c: any) => (c.total_bookings || 0) >= 2);
    const highLtvAlumni = contacts.filter((c: any) => (c.lifetime_spend_inr || 0) >= 15000);
    const corporateVip = contacts.filter((c: any) => c.segment_tags?.includes('CORPORATE_VIP'));
    const internationalProspects = contacts.filter(
      (c: any) => c.segment_tags?.includes('INTERNATIONAL_TRAVELER') || c.preferred_channel === 'EMAIL'
    );

    return NextResponse.json({
      success: true,
      audiences: {
        total_contacts: contacts.length,
        repeat_walkers: repeatWalkers.length,
        high_ltv_alumni: highLtvAlumni.length,
        corporate_vip: corporateVip.length,
        international_prospects: internationalProspects.length,
      },
      contacts_preview: contacts.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      campaign_name,
      channel = 'WHATSAPP_BROADCAST',
      target_segment = 'REPEAT_WALKERS',
      message_template,
      call_to_action_url,
    } = body;

    const contacts = appStore.getContacts();
    let targetContacts: any[] = [];

    if (target_segment === 'REPEAT_WALKERS') {
      targetContacts = contacts.filter((c: any) => (c.total_bookings || 0) >= 2);
    } else if (target_segment === 'HIGH_LTV_ALUMNI') {
      targetContacts = contacts.filter((c: any) => (c.lifetime_spend_inr || 0) >= 15000);
    } else if (target_segment === 'CORPORATE_VIP') {
      targetContacts = contacts.filter((c: any) => c.segment_tags?.includes('CORPORATE_VIP'));
    } else {
      targetContacts = contacts.slice(0, 5);
    }

    if (targetContacts.length === 0) {
      targetContacts = contacts.slice(0, 3);
    }

    // Meta Pricing calculation (₹0.78 per marketing conversation in India)
    const estimatedCostInr = (targetContacts.length * 0.78).toFixed(2);

    // Send WhatsApp messages if channel is WhatsApp
    const sendResults = [];
    if (channel === 'WHATSAPP_BROADCAST') {
      for (const contact of targetContacts) {
        if (contact.phone_number) {
          const personalizedText = message_template
            ? message_template.replace(/{{name}}/g, contact.full_name)
            : `Namaste ${contact.full_name}! 🏛️\n\nExclusive invitation from Khaki Tours: We are unveiling our curated International Expedition series. Discover the legacy with your Khaki Heritage Ambassador.\n\nExplore: ${call_to_action_url || 'https://khakitours.com/expeditions'}`;

          metaWhatsApp.sendTextMessage({ to: contact.phone_number, text: personalizedText }).catch(() => {});
          sendResults.push({ name: contact.full_name, phone: contact.phone_number, status: 'QUEUED' });
        }
      }
    }

    return NextResponse.json({
      success: true,
      campaign_name,
      channel,
      target_segment,
      recipients_count: targetContacts.length,
      estimated_meta_cost_inr: estimatedCostInr,
      send_results: sendResults,
      dispatched_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
