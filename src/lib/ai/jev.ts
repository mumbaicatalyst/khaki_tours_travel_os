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
   * Evaluate raw message or audio transcript using Jev System One model
   */
  async analyzeInboundLead(messageText: string): Promise<JevLeadAnalysis | null> {
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
            is_corporate: {
              type: 'noul',
              instructions: 'Is this message inquiring on behalf of a company, corporate offsite, executive delegation, consulate, or business team?',
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
        console.error(`[Jev AI] API responded with status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const answers = data.answers || {};

      const corpProb = answers.is_corporate?.noul || 0;
      const urgencyChoice = answers.urgency?.choice || 'GENERAL_INQUIRY';
      const isLargeGroup = (answers.is_large_group?.noul || 0) > 0.6;

      return {
        isCorporate: corpProb > 0.6,
        corporateProbability: corpProb,
        urgency: urgencyChoice,
        estimatedGroupSize: isLargeGroup ? 12 : 2,
        dietaryRestrictions: (answers.has_dietary_needs?.noul || 0) > 0.6 ? ['Dietary preference noted'] : [],
        mobilityOrPacingNotes: [],
        recommendedTourTheme: corpProb > 0.6 ? 'Architectural / Heritage Evangelism' : 'Standard Heritage Walk',
      };
    } catch (error) {
      console.error('[Jev AI] Error during lead evaluation:', error);
      return null;
    }
  }
}

export const jevClient = new JevClient();
