import { VoiceHandoffPayload } from '@/types/whatsapp';

export class VoiceClient {
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = process.env.VOICE_AI_WEBHOOK_SECRET || '';
  }

  /**
   * Validate voice AI webhook signature
   */
  validateSignature(signature?: string | null): boolean {
    if (!this.webhookSecret) return true; // dev fallback
    return signature === this.webhookSecret;
  }

  /**
   * Process incoming voice qualification lead and parse intent
   */
  parseQualificationPayload(rawBody: Record<string, unknown>): VoiceHandoffPayload {
    return {
      call_id: (rawBody.call_id as string) || `call_${Date.now()}`,
      caller_phone: (rawBody.caller_phone as string) || '',
      caller_name: (rawBody.caller_name as string) || 'Valued Caller',
      tour_id: (rawBody.tour_id as string) || '',
      group_size: Number(rawBody.group_size) || 1,
      verbal_consent: Boolean(rawBody.verbal_consent),
      transcript_snippet: (rawBody.transcript_snippet as string) || '',
      duration_seconds: Number(rawBody.duration_seconds) || 0,
    };
  }
}

export const voiceClient = new VoiceClient();
