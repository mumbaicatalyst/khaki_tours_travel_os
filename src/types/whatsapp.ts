export interface WhatsAppTextMessage {
  to: string;
  body: string;
  previewUrl?: boolean;
}

export interface WhatsAppInteractiveButton {
  id: string;
  title: string;
}

export interface WhatsAppInteractiveMessage {
  to: string;
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons: WhatsAppInteractiveButton[];
}

export interface WhatsAppWebhookContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'interactive' | 'button' | 'image' | 'document' | 'audio';
  text?: {
    body: string;
  };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: {
      id: string;
      title: string;
    };
  };
  button?: {
    text: string;
    payload: string;
  };
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: WhatsAppWebhookContact[];
      messages?: WhatsAppWebhookMessage[];
      statuses?: Array<{
        id: string;
        status: 'sent' | 'delivered' | 'read' | 'failed';
        timestamp: string;
        recipient_id: string;
      }>;
    };
    field: string;
  }>;
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

export interface VoiceHandoffPayload {
  call_id: string;
  caller_phone: string;
  caller_name?: string;
  tour_id: string;
  group_size: number;
  verbal_consent: boolean;
  transcript_snippet?: string;
  duration_seconds?: number;
}
