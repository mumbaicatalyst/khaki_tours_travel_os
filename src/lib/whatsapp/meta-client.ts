/**
 * Khaki Travel OS - Meta WhatsApp Cloud API Client
 * Ported & adapted from ArnasDon/wacrm (MIT Licensed)
 * Directly interfaces with Meta Graph API v21.0
 */

const META_API_VERSION = 'v21.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface SendTextMessageParams {
  to: string;
  text: string;
  replyToMessageId?: string;
}

export interface SendInteractiveButtonParams {
  to: string;
  bodyText: string;
  buttons: Array<{ id: string; title: string }>;
}

export interface SendLocationParams {
  to: string;
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export interface SendTemplateParams {
  to: string;
  templateName: string;
  language?: string;
  bodyVariables?: string[];
  buttonUrlVariables?: string[];
}

export interface SendMediaParams {
  to: string;
  kind: 'image' | 'video' | 'document' | 'audio';
  url: string;
  caption?: string;
  filename?: string;
}

export interface MetaApiResponse {
  success: boolean;
  messageId?: string;
  isMock?: boolean;
  error?: string;
}

export class MetaWhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private wabaId: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN || '';
    this.wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_WABA_ID || '';
  }

  private getPhoneNumberId(): string {
    return process.env.WHATSAPP_PHONE_NUMBER_ID || this.phoneNumberId || '';
  }

  private getAccessToken(): string {
    return process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN || this.accessToken || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.getPhoneNumberId() && this.getAccessToken());
  }

  /**
   * Format phone number to international E.164 without leading +
   */
  private cleanPhone(phone: string): string {
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.length === 10) {
      // Default Indian 10-digit mobile number to include +91 country code
      digits = `91${digits}`;
    } else if (digits.length === 11 && digits.startsWith('0')) {
      // Indian number entered with leading 0 (e.g. 09820088712)
      digits = `91${digits.slice(1)}`;
    }
    return digits;
  }

  /**
   * 1. Send Standard Text Message
   */
  public async sendTextMessage(params: SendTextMessageParams): Promise<MetaApiResponse> {
    const to = this.cleanPhone(params.to);

    if (!this.isConfigured()) {
      console.log(`[Meta WhatsApp Mock] Outbound Text to ${to}: "${params.text}"`);
      return {
        success: true,
        messageId: `mock_wamid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        isMock: true,
      };
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: true,
        body: params.text,
      },
    };

    if (params.replyToMessageId) {
      payload.context = { message_id: params.replyToMessageId };
    }

    return this.postToMeta(payload);
  }

  /**
   * 2. Send Interactive Quick Reply Buttons (e.g. "Hold 4 Seats", "Pay Now", "Call Ambassador")
   */
  public async sendInteractiveButtons(params: SendInteractiveButtonParams): Promise<MetaApiResponse> {
    const to = this.cleanPhone(params.to);

    if (!this.isConfigured()) {
      console.log(`[Meta WhatsApp Mock] Outbound Buttons to ${to}: "${params.bodyText}" Buttons:`, params.buttons);
      return {
        success: true,
        messageId: `mock_wamid_btn_${Date.now()}`,
        isMock: true,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: params.bodyText },
        action: {
          buttons: params.buttons.slice(0, 3).map((b) => ({
            type: 'reply',
            reply: {
              id: b.id,
              title: b.title.slice(0, 20),
            },
          })),
        },
      },
    };

    return this.postToMeta(payload);
  }

  /**
   * 3. Send Google Maps Meeting Location Pin (Critical for Tour Departures)
   */
  public async sendLocationMessage(params: SendLocationParams): Promise<MetaApiResponse> {
    const to = this.cleanPhone(params.to);

    if (!this.isConfigured()) {
      console.log(`[Meta WhatsApp Mock] Outbound Location Pin to ${to}: ${params.name} (${params.latitude}, ${params.longitude})`);
      return {
        success: true,
        messageId: `mock_wamid_loc_${Date.now()}`,
        isMock: true,
      };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'location',
      location: {
        latitude: params.latitude,
        longitude: params.longitude,
        name: params.name,
        address: params.address,
      },
    };

    return this.postToMeta(payload);
  }

  /**
   * 4. Send Meta-Approved Template (Booking Confirmations, 24h Guide Dispatches)
   */
  public async sendTemplate(params: SendTemplateParams): Promise<MetaApiResponse> {
    const to = this.cleanPhone(params.to);

    if (!this.isConfigured()) {
      console.log(`[Meta WhatsApp Mock] Outbound Template "${params.templateName}" to ${to}. Variables:`, params.bodyVariables);
      return {
        success: true,
        messageId: `mock_wamid_tmpl_${Date.now()}`,
        isMock: true,
      };
    }

    const components: any[] = [];

    if (params.bodyVariables && params.bodyVariables.length > 0) {
      components.push({
        type: 'body',
        parameters: params.bodyVariables.map((val) => ({
          type: 'text',
          text: val,
        })),
      });
    }

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: params.templateName,
        language: { code: params.language || 'en' },
        components,
      },
    };

    return this.postToMeta(payload);
  }

  /**
   * 5. Send Media Message (PDF Passes, Itinerary Brochures, Photos)
   */
  public async sendMediaMessage(params: SendMediaParams): Promise<MetaApiResponse> {
    const to = this.cleanPhone(params.to);

    if (!this.isConfigured()) {
      console.log(`[Meta WhatsApp Mock] Outbound ${params.kind} to ${to}: ${params.url}`);
      return {
        success: true,
        messageId: `mock_wamid_media_${Date.now()}`,
        isMock: true,
      };
    }

    const mediaObject: any = { link: params.url };
    if (params.caption && params.kind !== 'audio') mediaObject.caption = params.caption;
    if (params.filename && params.kind === 'document') mediaObject.filename = params.filename;

    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: params.kind,
      [params.kind]: mediaObject,
    };

    return this.postToMeta(payload);
  }

  /**
   * 6. Mark Incoming Message as Read (Sends Blue Ticks to Guest)
   */
  public async markAsRead(messageId: string): Promise<boolean> {
    if (!this.isConfigured() || messageId.startsWith('mock_')) return true;

    try {
      const url = `${META_API_BASE}/${this.getPhoneNumberId()}/messages`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Internal HTTP Poster to Meta Graph API
   */
  private async postToMeta(body: any): Promise<MetaApiResponse> {
    const phoneNumberId = this.getPhoneNumberId();
    const accessToken = this.getAccessToken();
    const url = `${META_API_BASE}/${phoneNumberId}/messages`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || `Meta API Error ${res.status}`;
        console.error('[Meta WhatsApp API Error]', data);
        return { success: false, error: errorMsg };
      }

      const messageId = data?.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (err: any) {
      console.error('[Meta WhatsApp Fetch Error]', err);
      return { success: false, error: err.message };
    }
  }
}

export const metaWhatsApp = new MetaWhatsAppClient();
