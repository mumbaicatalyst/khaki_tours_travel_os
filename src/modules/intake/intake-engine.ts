import { VoiceHandoffPayload } from '@/types/whatsapp';
import { whatsappClient } from '@/lib/whatsapp/client';

export class IntakeEngine {
  /**
   * Process incoming voice AI qualification handoff
   * If verbal consent is confirmed, sends immediate booking summary & payment prompt on WhatsApp
   */
  static async handleVoiceQualificationHandoff(payload: VoiceHandoffPayload): Promise<{
    success: boolean;
    whatsappMessageId?: string;
    bookingReference: string;
  }> {
    const bookingReference = `KT-VCE-${Date.now().toString().slice(-6)}`;

    if (!payload.verbal_consent) {
      console.warn(`[Intake] Lead ${payload.caller_phone} did not provide verbal consent. Skipping WhatsApp push.`);
      return { success: false, bookingReference };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khakitours-travel-os.netlify.app';
    const messageBody = `Hello ${payload.caller_name || 'there'}! 👋\n\n` +
      `Thank you for speaking with our Khaki Tours team. As discussed on your call, here is your booking request:\n\n` +
      `• *Ref:* ${bookingReference}\n` +
      `• *Party Size:* ${payload.group_size} Guest(s)\n\n` +
      `Please tap below to review the tour highlights and secure your booking:\n` +
      `${siteUrl}/bookings\n\n` +
      `_Reply to this chat anytime if you have any questions!_`;

    const res = await whatsappClient.sendTextMessage({
      to: payload.caller_phone,
      body: messageBody,
    });

    return {
      success: res.success,
      whatsappMessageId: res.messageId,
      bookingReference,
    };
  }
}
