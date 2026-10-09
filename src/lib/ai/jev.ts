/**
 * TypeSafe / Jev AI - System One Model Client for Khaki Travel OS
 * Provides fast, typed semantic judgments for:
 * 1. Corporate Intent & VIP Detection
 * 2. Urgency & Lead-Time Extraction
 * 3. Ambassador Guide Matching
 * 4. Dietary & Mobility Restriction Extraction
 */

export interface JevLeadAnalysis {
  isCorporate: boolean;
  corporateProbability: number;
  urgency: 'IMMEDIATE' | 'THIS_WEEKEND' | 'FUTURE_DATE' | 'GENERAL_INQUIRY';
  estimatedGroupSize: number;
  dietaryRestrictions: string[];
  mobilityOrPacingNotes: string[];
  recommendedTourTheme: string;
}

export interface JevTriageResult {
  routedTo: 'LOCAL_FAST_PATH' | 'GEMINI_CONVERSATIONAL';
  category: 'POLICY_FAQ' | 'BOOKING_FAST_PATH' | 'CORPORATE_VIP' | 'CONVERSATIONAL';
  replyText?: string;
  isTakeoverRequested?: boolean;
  leadAnalysis: JevLeadAnalysis;
}

export class JevClient {
  private apiKey: string;
  private endpoint = 'https://api.typesafe.ai/v1/systemone';
  private model = 'jev-latest';

  constructor() {
    this.apiKey = process.env.TYPESAFE_API_KEY || '';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.startsWith('apikey_'));
  }

  /**
   * High-Velocity Triage Router: Evaluates whether an incoming message can be resolved
   * immediately via deterministic local handlers (0 tokens, ~90ms) or needs Gemini.
   */
  async triageInboundMessage(messageText: string): Promise<JevTriageResult | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: messageText,
          model: this.model,
          questions: {
            category: {
              type: 'choice',
              instructions: 'What operational bucket does this customer message fall into?',
              criteria: {
                POLICY_FAQ: 'Asking about cancellation, refund, rain/monsoon rules, dress code, or arrival guidelines',
                CORPORATE_VIP: 'Inquiring for a company offsite, executive delegation, corporate proposal, or business team',
                CONVERSATIONAL: 'Questions about Mumbai history, tour details, bookings, or open-ended chat',
              },
            },
            policy_topic: {
              type: 'choice',
              instructions: 'If this is a policy question, which specific topic is being asked?',
              criteria: {
                REFUND: 'Cancellation, refund percentages, or money back',
                MONSOON: 'Rain, monsoon weather, BMC alerts, or operational weather calls',
                DRESS_CODE: 'What to wear, shoes, modest clothing, or places of worship etiquette',
                GENERAL: 'General rules or non-policy questions',
              },
            },
            is_corporate: {
              type: 'noul',
              instructions: 'Is this message inquiring on behalf of a company, corporate offsite, or executive delegation?',
            },
            urgency: {
              type: 'choice',
              instructions: 'What is the departure timing or urgency conveyed by the user?',
              criteria: {
                IMMEDIATE: 'Request is for today, tonight, or within the next 24 hours',
                THIS_WEEKEND: 'Request is for the upcoming weekend or within 2-4 days',
                FUTURE_DATE: 'Request mentions a specific future date or next month',
                GENERAL_INQUIRY: 'No specific date given; general question or catalog browsing',
              },
            },
            is_large_group: {
              type: 'noul',
              instructions: 'Does the inquiry suggest a medium to large group (6 or more people)?',
            },
            has_dietary_needs: {
              type: 'noul',
              instructions: 'Does the message mention food preferences, Jain, vegetarian, vegan, or refreshment requirements?',
            },
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const answers = data.answers || {};

      const categoryChoice = answers.category?.choice || 'CONVERSATIONAL';
      const policyTopic = answers.policy_topic?.choice || 'GENERAL';
      const corpProb = answers.is_corporate?.noul || 0;
      const urgencyChoice = answers.urgency?.choice || 'GENERAL_INQUIRY';
      const isLargeGroup = (answers.is_large_group?.noul || 0) > 0.6;

      const leadAnalysis: JevLeadAnalysis = {
        isCorporate: corpProb > 0.6 || categoryChoice === 'CORPORATE_VIP',
        corporateProbability: corpProb,
        urgency: urgencyChoice,
        estimatedGroupSize: isLargeGroup ? 12 : 2,
        dietaryRestrictions: (answers.has_dietary_needs?.noul || 0) > 0.6 ? ['Dietary preference noted'] : [],
        mobilityOrPacingNotes: [],
        recommendedTourTheme: corpProb > 0.6 ? 'Architectural / Heritage Evangelism' : 'Standard Heritage Walk',
      };

      // 1. FAST-PATH ROUTE: Deterministic Policy FAQs (0 Gemini tokens, ~50ms)
      if (categoryChoice === 'POLICY_FAQ') {
        let reply = '';
        if (policyTopic === 'REFUND') {
          reply = `🏛️ *Khaki Tours • Cancellation & Refund Policy*\n\n• *Advance Payment:* 100% advance payment strictly mandatory before departure.\n• *Cancellations >72 hours before start:* 50% refund.\n• *Cancellations <72 hours before start:* Strictly non-refundable.\n• *Company-Initiated Cancellation:* 100% full refund.\n\n👉 If you need assistance with an existing booking, reply with your booking ID or ask to connect with our Operations Desk!`;
        } else if (policyTopic === 'MONSOON') {
          reply = `🌧️ *Khaki Tours • Monsoon & Weather Guidelines*\n\n• Walks operate *rain or shine* through Mumbai's showers.\n• We only cancel if an official *BMC / IMD Red Alert* is declared for Mumbai.\n• *Recommended Gear:* Rainwear/umbrella and sturdy waterproof footwear.\n• In the event of an official weather cancellation, guests receive a 100% full refund or complimentary reschedule.\n\nSee you on the heritage trail!`;
        } else if (policyTopic === 'DRESS_CODE') {
          reply = `👟 *Khaki Tours • Dress Code & Etiquette*\n\n• *Attire:* Comfortable, lightweight cotton clothing recommended.\n• *Places of Worship:* Modest clothing with knees and shoulders covered for sacred spaces.\n• *Footwear:* Sturdy, comfortable walking shoes (walks cover 1.5–2.5 km).\n• *Arrival:* Please arrive 15 minutes prior to start at the designated assembly point.`;
        }

        if (reply) {
          return {
            routedTo: 'LOCAL_FAST_PATH',
            category: 'POLICY_FAQ',
            replyText: reply,
            leadAnalysis,
          };
        }
      }

      // 2. FAST-PATH ROUTE: Corporate & Executive Delegations (0 Gemini tokens)
      if (categoryChoice === 'CORPORATE_VIP' || corpProb > 0.75) {
        const corpReply = `🏢 *Khaki Tours • Executive & Corporate Desk*\n\nThank you for reaching out on behalf of your team.\n\nYour inquiry has been flagged with *P1 Critical Priority* to Founder *Bharat Gothoskar* and Operations:\n• ⏱️ *15-Minute SLA:* A customized proposal will be prepared promptly\n• 📑 *GST Compliant:* SAC Code 998554 (18% GST with full Input Tax Credit)\n• 🏛️ *Experiences:* Bespoke Fort heritage walks, architectural evangelism, or private open jeep safaris for 5 to 150+ guests.\n\nOur team is reviewing your requirements now!`;
        return {
          routedTo: 'LOCAL_FAST_PATH',
          category: 'CORPORATE_VIP',
          replyText: corpReply,
          leadAnalysis,
        };
      }

      // 3. CONVERSATIONAL ROUTE: Pass to Gemini for rich storytelling
      return {
        routedTo: 'GEMINI_CONVERSATIONAL',
        category: 'CONVERSATIONAL',
        leadAnalysis,
      };
    } catch (err) {
      console.error('[Jev Triage Error]:', err);
      return null;
    }
  }

  /**
   * Fallback lead classification if triage is not called directly
   */
  async analyzeInboundLead(messageText: string): Promise<JevLeadAnalysis | null> {
    const triage = await this.triageInboundMessage(messageText);
    return triage ? triage.leadAnalysis : null;
  }
}

export const jevClient = new JevClient();
