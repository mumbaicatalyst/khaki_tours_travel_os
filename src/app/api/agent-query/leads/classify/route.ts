import { NextRequest, NextResponse } from 'next/server';
import { PriorityClassifier, LeadClassificationInput } from '@/modules/intake/priority-classifier';
import { jevClient } from '@/lib/ai/jev';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: LeadClassificationInput = await req.json();

    if (!body.messageContent || !body.senderPhone) {
      return NextResponse.json(
        { error: 'Missing required parameters: messageContent and senderPhone' },
        { status: 400 }
      );
    }

    // 1. Run local rules engine
    let classification = PriorityClassifier.classifyLead(body);

    // 2. Enhance with live Jev AI System One judgment if available
    let jevJudgment = null;
    if (jevClient.isAvailable()) {
      jevJudgment = await jevClient.analyzeInboundLead(body.messageContent);
      if (jevJudgment) {
        if (jevJudgment.isCorporate) {
          classification.isCorporate = true;
          classification.tier = 'P1_CRITICAL_CORPORATE';
          classification.slaResponseMinutes = classification.isAfterHours ? 60 : 15;
          classification.escalationReason = `Jev AI verified corporate B2B intent (${Math.round(jevJudgment.corporateProbability * 100)}% confidence).`;
        }
        if (jevJudgment.urgency === 'IMMEDIATE' || jevJudgment.urgency === 'THIS_WEEKEND') {
          if (classification.tier === 'P3_STANDARD') {
            classification.tier = 'P2_HIGH_URGENT';
            classification.slaResponseMinutes = classification.isAfterHours ? 120 : 30;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: classification,
      ai_engine: jevJudgment ? 'JEV_AI_ACTIVE' : 'RULES_FALLBACK',
      jev_analysis: jevJudgment,
      webhook_action: classification.requiresInstantMobileAlert
        ? 'FIRE_URGENT_STAFF_PUSH_NOTIFICATION'
        : 'ROUTED_TO_STANDARD_BOT_QUEUE',
    });
  } catch (error: any) {
    console.error('[Lead Classification API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
