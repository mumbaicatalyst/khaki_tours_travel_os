import { WhatsAppInteractiveMessage, WhatsAppTextMessage } from '@/types/whatsapp';

export class WhatsAppClient {
  private token: string;
  private phoneNumberId: string;
  private isWati: boolean;
  private watiEndpoint?: string;
  private watiToken?: string;

  constructor() {
    this.token = process.env.WHATSAPP_API_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.isWati = process.env.WHATSAPP_PROVIDER === 'WATI';
    this.watiEndpoint = process.env.WATI_API_ENDPOINT;
    this.watiToken = process.env.WATI_ACCESS_TOKEN;
  }

  /**
   * Send plain conversational text message
   */
  async sendTextMessage(params: WhatsAppTextMessage): Promise<{ success: boolean; messageId?: string }> {
    if (this.isWati) {
      return this.sendWatiText(params.to, params.body);
    }
    return this.sendMetaText(params.to, params.body);
  }

  /**
   * Send interactive button template for Guide/Vendor dispatch
   */
  async sendDispatchButtonPrompt(params: WhatsAppInteractiveMessage): Promise<{ success: boolean; messageId?: string }> {
    if (this.isWati) {
      // Wati interactive button message payload
      return this.sendWatiInteractive(params);
    }
    return this.sendMetaInteractive(params);
  }

  private async sendMetaText(to: string, body: string) {
    if (!this.token || !this.phoneNumberId) {
      console.warn('[WhatsApp] Meta credentials not set. Simulating message dispatch to:', to);
      return { success: true, messageId: `mock_meta_${Date.now()}` };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { preview_url: false, body },
        }),
      });

      const data = await response.json();
      return { success: response.ok, messageId: data?.messages?.[0]?.id };
    } catch (error) {
      console.error('[WhatsApp] Meta dispatch failed:', error);
      return { success: false };
    }
  }

  private async sendMetaInteractive(params: WhatsAppInteractiveMessage) {
    if (!this.token || !this.phoneNumberId) {
      console.warn('[WhatsApp] Meta credentials missing. Simulating interactive button send to:', params.to);
      return { success: true, messageId: `mock_interactive_${Date.now()}` };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: params.to,
          type: 'interactive',
          interactive: {
            type: 'button',
            ...(params.headerText ? { header: { type: 'text', text: params.headerText } } : {}),
            body: { text: params.bodyText },
            ...(params.footerText ? { footer: { text: params.footerText } } : {}),
            action: {
              buttons: params.buttons.map((btn) => ({
                type: 'reply',
                reply: { id: btn.id, title: btn.title },
              })),
            },
          },
        }),
      });

      const data = await response.json();
      return { success: response.ok, messageId: data?.messages?.[0]?.id };
    } catch (error) {
      console.error('[WhatsApp] Meta interactive send error:', error);
      return { success: false };
    }
  }

  private async sendWatiText(to: string, message: string) {
    console.log('[WhatsApp/WATI] Sending text to:', to, message);
    return { success: true, messageId: `wati_mock_${Date.now()}` };
  }

  private async sendWatiInteractive(params: WhatsAppInteractiveMessage) {
    console.log('[WhatsApp/WATI] Sending interactive prompt to:', params.to);
    return { success: true, messageId: `wati_mock_int_${Date.now()}` };
  }
}

export const whatsappClient = new WhatsAppClient();
