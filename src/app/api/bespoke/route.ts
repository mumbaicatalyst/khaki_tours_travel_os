import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const proposals = appStore.getBespokeProposals();
    return NextResponse.json({ success: true, count: proposals.length, proposals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientName,
      clientPhone,
      organization,
      themeTitle,
      cluster,
      stops,
      estimatedDurationHours,
      groupSize,
      scheduledDate,
      assignedGuideId,
      assignedGuideName,
      vehicleRequired,
      baseCuratorFeeInr,
      perHeadFeeInr,
      totalAmountInr,
      sendWhatsAppQuote,
    } = body;

    const created = appStore.createBespokeProposal({
      clientName,
      clientPhone,
      organization,
      themeTitle,
      cluster,
      stops,
      estimatedDurationHours,
      groupSize,
      scheduledDate,
      assignedGuideId,
      assignedGuideName,
      vehicleRequired,
      baseCuratorFeeInr,
      perHeadFeeInr,
      totalAmountInr,
    });

    // Optionally dispatch quote pass to client on WhatsApp
    if (sendWhatsAppQuote && clientPhone) {
      const stopsList = (stops || []).map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n');
      const quoteText =
        `🏛️ *KHAKI TOURS BESPOKE ITINERARY QUOTE*\n\n` +
        `Dear ${clientName || 'Guest'},\n` +
        `We have curated your private heritage itinerary for *${scheduledDate || 'Upcoming'}*:\n\n` +
        `*Theme:* ${themeTitle}\n` +
        `*Curated Stops:*\n${stopsList}\n\n` +
        `• Duration: ${estimatedDurationHours || 2.5} Hours\n` +
        `• Lead Ambassador: ${assignedGuideName || 'Senior Historian'}\n` +
        `• Group Size: ${groupSize || 2} Pax\n` +
        `• Total Honorarium: ₹${(Number(totalAmountInr) || 15400).toLocaleString('en-IN')} (incl. GST)\n\n` +
        `To approve and lock your ambassador, tap below:\n` +
        `👉 https://khakitours.com/quote/${created.id}`;

      metaWhatsApp.sendTextMessage({ to: clientPhone, text: quoteText }).catch(() => {});
    }

    return NextResponse.json({ success: true, proposal: created }, { status: 201 });
  } catch (error: any) {
    console.error('[Bespoke API Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
