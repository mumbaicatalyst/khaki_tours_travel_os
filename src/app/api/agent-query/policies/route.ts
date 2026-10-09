import { NextRequest, NextResponse } from 'next/server';
import { inMemoryCatalog } from '@/lib/supabase/seed';

/**
 * GET /api/agent-query/policies
 * Knowledge base answers for WhatsApp Bots & Voice AI answering guest questions
 */
export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get('topic')?.toLowerCase().trim();
  const policies = inMemoryCatalog.policies;

  if (topic === 'cancellation' || topic === 'refund') {
    return NextResponse.json({
      topic: 'cancellation_and_refund',
      policy: policies.cancellation_and_refund_policy,
      summary:
        '100% advance payment required. Cancellations >72h prior receive 50% refund. Cancellations <72h receive 0% refund. Company cancellations receive 100% full refund.',
    });
  }

  if (topic === 'monsoon' || topic === 'weather' || topic === 'rain') {
    return NextResponse.json({
      topic: 'monsoon_and_weather',
      policy: policies.monsoon_and_weather_rules,
      summary:
        'Walks operate rain or shine unless an official BMC/IMD Red Alert is active. Rain gear and waterproof footwear recommended.',
    });
  }

  if (topic === 'dress_code' || topic === 'etiquette' || topic === 'arrival') {
    return NextResponse.json({
      topic: 'dress_code_and_etiquette',
      policy: policies.dress_code_and_guest_etiquette,
      summary:
        'Arrive 15 mins prior. Comfortable walking shoes and modest cotton clothing (knees & shoulders covered for places of worship).',
    });
  }

  return NextResponse.json({
    company_name: policies.company_name,
    mission: policies.mission,
    contact_info: policies.contact_info,
    full_policies: policies,
  });
}
