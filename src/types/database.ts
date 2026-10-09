export type TourType =
  | 'STANDARD_WALK'
  | 'PRIVATE_GROUP'
  | 'INTERNATIONAL_EXPEDITION'
  | 'CORPORATE_B2B';

export type BookingStatus =
  | 'LEAD_NEW'
  | 'PENDING_RESOURCE_LOCK'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED';

export type DispatchStatus =
  | 'UNASSIGNED'
  | 'BROADCAST_SENT'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'DECLINED';

export type MilestoneStatus =
  | 'PENDING'
  | 'INVOICED'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type GstScheme =
  | 'COMPOSITE_5_PERCENT'
  | 'STANDARD_18_PERCENT';

export type ProposalStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type VendorResourceType =
  | 'GUIDE'
  | 'JEEP'
  | 'BOAT'
  | 'DMC'
  | 'E_VICTORIA'
  | 'HERITAGE_EXPERT';

export type PaymentGateway =
  | 'RAZORPAY'
  | 'CASHFREE'
  | 'UPI_DIRECT'
  | 'BANK_TRANSFER';

export type MessageDirection = 'INBOUND' | 'OUTBOUND';

export type MessageSenderType =
  | 'GUEST'
  | 'SYSTEM_BOT'
  | 'HUMAN_AGENT'
  | 'VOICE_AI';

export interface Organization {
  id: string;
  company_name: string;
  brand_name?: string | null;
  gstin?: string | null;
  pan_number?: string | null;
  billing_address?: string | null;
  city?: string;
  state?: string;
  postal_code?: string | null;
  credit_limit_inr: number;
  payment_terms_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  organization_id?: string | null;
  full_name: string;
  phone_number: string;
  email?: string | null;
  is_corporate_booker: boolean;
  designation?: string | null;
  passport_number?: string | null;
  passport_expiry_date?: string | null;
  dietary_notes?: string | null;
  segment_tags: string[];
  rfm_score: number;
  preferred_language?: string;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  tour_code?: string;
  wp_id?: number | null;
  title: string;
  clean_title?: string | null;
  hashtag?: string;
  slug: string;
  category: TourType;
  base_price_inr: number;
  base_cost_usd: number;
  duration?: string;
  distance?: string;
  meeting_landmark?: string;
  meeting_point?: string;
  available_seats?: number;
  departure_date?: string;
  meeting_coordinates?: {
    lat: number;
    lng: number;
    map_url?: string;
  } | null;
  route_highlights?: string[];
  max_capacity: number;
  description?: string | null;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TourDeparture {
  id: string;
  departure_code: string;
  tour_id: string;
  departure_datetime: string;
  slot_time: string;
  assigned_lead_guide_id?: string | null;
  total_capacity: number;
  booked_seats: number;
  available_seats: number;
  price_override_inr?: number | null;
  is_fast_path_eligible: boolean;
  status: 'OPEN' | 'SOLD_OUT' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface CorporateProposal {
  id: string;
  proposal_reference: string;
  organization_id: string;
  contact_id: string;
  tour_id?: string | null;
  proposed_date: string;
  group_size: number;
  custom_price_per_pax: number;
  subtotal_amount_inr: number;
  gst_scheme: GstScheme;
  gst_rate_percent: number;
  gst_tax_amount_inr: number;
  grand_total_inr: number;
  validity_date: string;
  status: ProposalStatus;
  special_briefing_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  contact_id: string;
  tour_id: string;
  departure_id?: string | null;
  proposal_id?: string | null;
  status: BookingStatus;
  group_size: number;
  total_amount_inr: number;
  amount_paid_inr: number;
  fx_rate_applied?: number | null;
  payment_link_id?: string | null;
  payment_link_url?: string | null;
  payment_link_expires_at?: string | null;
  gateway?: PaymentGateway;
  human_takeover_active: boolean;
  assigned_agent_id?: string | null;
  hold_expires_at?: string | null;
  gst_scheme_applied?: GstScheme;
  tally_voucher_number?: string | null;
  tally_synced_at?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BookingPaymentMilestone {
  id: string;
  booking_id: string;
  milestone_number: number;
  title: string;
  percentage_due: number;
  amount_inr: number;
  due_date: string;
  status: MilestoneStatus;
  payment_link_id?: string | null;
  paid_at?: string | null;
  fx_adjustment_applied: number;
  invoice_reference?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingGuestManifest {
  id: string;
  booking_id: string;
  full_name: string;
  age?: number | null;
  gender?: string | null;
  id_type?: 'AADHAAR' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE' | null;
  id_number?: string | null;
  id_document_url?: string | null;
  passport_expiry_date?: string | null;
  visa_status?: string;
  dietary_preference?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  has_attended?: boolean;
  created_at: string;
  updated_at: string;
}

export type GuestManifest = BookingGuestManifest;

export interface Vendor {
  id: string;
  name: string;
  vendor_type: VendorResourceType;
  contact_person?: string | null;
  phone: string;
  email?: string | null;
  base_payout_rate_inr: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DispatchRequest {
  id: string;
  booking_id: string;
  departure_id?: string | null;
  resource_type: VendorResourceType;
  vendor_id?: string | null;
  assigned_entity_name?: string | null;
  assigned_entity_phone?: string | null;
  status: DispatchStatus;
  broadcast_sent_at?: string | null;
  responded_at?: string | null;
  payout_amount_inr?: number | null;
  timeout_minutes: number;
  rejection_reason?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FxPricingLedger {
  id: string;
  tour_id: string;
  booking_id?: string | null;
  spot_usd_inr: number;
  buffer_percentage: number;
  control_rate: number;
  cost_usd: number;
  cost_floor_inr: number;
  quoted_price_inr: number;
  margin_percentage: number;
  final_settlement_rate?: number | null;
  settlement_surcharge_inr: number;
  created_at: string;
}

export interface TallySyncLog {
  id: string;
  booking_id: string;
  voucher_number: string;
  voucher_type: 'RECEIPT' | 'SALES' | 'CREDIT_NOTE';
  gst_scheme: GstScheme;
  base_amount_inr: number;
  cgst_amount_inr: number;
  sgst_amount_inr: number;
  total_amount_inr: number;
  xml_payload: string;
  sync_status: 'SYNCED' | 'QUEUED' | 'FAILED';
  tally_response_message?: string | null;
  synced_at: string;
}

export interface KhakiLabEvent {
  id: string;
  talk_number: number;
  title: string;
  hashtag: string;
  speaker: string;
  venue: string;
  format: string;
  slug?: string | null;
  url?: string | null;
  published_at?: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  contact_id: string;
  booking_id?: string | null;
  direction: MessageDirection;
  sender_type: MessageSenderType;
  channel: 'WHATSAPP' | 'VOICE_CALL' | 'SMS' | 'EMAIL';
  external_message_id?: string | null;
  content: string;
  media_url?: string | null;
  media_type?: string | null;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  metadata?: Record<string, unknown>;
  created_at: string;
}
