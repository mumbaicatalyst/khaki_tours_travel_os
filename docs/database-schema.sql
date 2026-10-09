-- ==============================================================================
-- KHAKI TRAVEL OPERATING SYSTEM (khaki-travel-os)
-- Holistic Enterprise PostgreSQL / Supabase DDL Schema
-- Supporting: Standard Walks, Private Groups, International Expeditions, & Corporate B2B
-- ==============================================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean teardown if rebuilding
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
CREATE TYPE tour_type AS ENUM (
    'STANDARD_WALK',
    'PRIVATE_GROUP',
    'INTERNATIONAL_EXPEDITION',
    'CORPORATE_B2B'
);

CREATE TYPE booking_status AS ENUM (
    'LEAD_NEW',
    'PENDING_RESOURCE_LOCK',
    'PAYMENT_PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED'
);

CREATE TYPE dispatch_status AS ENUM (
    'UNASSIGNED',
    'BROADCAST_SENT',
    'ACCEPTED',
    'EXPIRED',
    'DECLINED'
);

CREATE TYPE milestone_status AS ENUM (
    'PENDING',
    'INVOICED',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);

CREATE TYPE gst_scheme AS ENUM (
    'COMPOSITE_5_PERCENT',  -- SAC 998555: Tour Operator Services (B2C)
    'STANDARD_18_PERCENT'   -- SAC 998554: Event & Corporate Consulting (B2B)
);

CREATE TYPE proposal_status AS ENUM (
    'DRAFT',
    'SENT',
    'ACCEPTED',
    'REJECTED',
    'EXPIRED'
);

CREATE TYPE vendor_resource_type AS ENUM (
    'GUIDE',
    'JEEP',
    'BOAT',
    'DMC',
    'E_VICTORIA',
    'HERITAGE_EXPERT'
);

CREATE TYPE payment_gateway AS ENUM (
    'RAZORPAY',
    'CASHFREE',
    'UPI_DIRECT',
    'BANK_TRANSFER'
);

CREATE TYPE message_direction AS ENUM (
    'INBOUND',
    'OUTBOUND'
);

CREATE TYPE message_sender_type AS ENUM (
    'GUEST',
    'SYSTEM_BOT',
    'HUMAN_AGENT',
    'VOICE_AI'
);

-- -----------------------------------------------------------------------------
-- 1. ORGANIZATIONS & B2B CORPORATES
-- -----------------------------------------------------------------------------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    brand_name TEXT,
    gstin TEXT UNIQUE,
    pan_number TEXT,
    billing_address TEXT,
    city TEXT DEFAULT 'Mumbai',
    state TEXT DEFAULT 'Maharashtra',
    postal_code TEXT,
    credit_limit_inr NUMERIC(12, 2) DEFAULT 0.00,
    payment_terms_days INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. CRM CONTACTS (B2C & B2B Booker Profiles)
-- -----------------------------------------------------------------------------
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT,
    is_corporate_booker BOOLEAN DEFAULT FALSE,
    designation TEXT,
    passport_number TEXT,
    passport_expiry_date DATE,
    dietary_notes TEXT,
    segment_tags TEXT[] DEFAULT '{}', -- e.g. ['VIP', 'HERITAGE_CLUB', 'CORPORATE']
    rfm_score INTEGER DEFAULT 0,
    preferred_language TEXT DEFAULT 'en',
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TOURS MASTER CATALOG
-- -----------------------------------------------------------------------------
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_code TEXT UNIQUE NOT NULL, -- e.g. 'KT_WALK_01'
    wp_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    clean_title TEXT,
    hashtag TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category tour_type NOT NULL DEFAULT 'STANDARD_WALK',
    base_price_inr NUMERIC(10, 2) NOT NULL,
    base_cost_usd NUMERIC(10, 2) DEFAULT 0.00,
    duration TEXT DEFAULT '2.5 Hours',
    distance TEXT DEFAULT '2.0 Kms',
    meeting_landmark TEXT NOT NULL,
    meeting_coordinates JSONB, -- { lat: float, lng: float, map_url: text }
    route_highlights TEXT[] DEFAULT '{}',
    max_capacity INTEGER NOT NULL DEFAULT 25,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TOUR DEPARTURES (Real-Time Availability & Scheduled Slots)
-- -----------------------------------------------------------------------------
CREATE TABLE tour_departures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    departure_code TEXT UNIQUE NOT NULL, -- e.g. 'DEP_20261010_01'
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    departure_datetime TIMESTAMPTZ NOT NULL,
    slot_time TEXT NOT NULL, -- e.g. '08:00 AM', '04:30 PM'
    assigned_lead_guide_id UUID,
    total_capacity INTEGER NOT NULL,
    booked_seats INTEGER NOT NULL DEFAULT 0,
    available_seats INTEGER NOT NULL,
    price_override_inr NUMERIC(10, 2),
    is_fast_path_eligible BOOLEAN DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'SOLD_OUT', 'CANCELLED', 'COMPLETED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_departure_seats CHECK (available_seats >= 0 AND (booked_seats + available_seats) = total_capacity)
);

-- -----------------------------------------------------------------------------
-- 5. B2B CORPORATE PROPOSALS
-- -----------------------------------------------------------------------------
CREATE TABLE corporate_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_reference TEXT UNIQUE NOT NULL, -- e.g. 'KT-CORP-2026-001'
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
    proposed_date TIMESTAMPTZ NOT NULL,
    group_size INTEGER NOT NULL CHECK (group_size > 0),
    custom_price_per_pax NUMERIC(10, 2) NOT NULL,
    subtotal_amount_inr NUMERIC(12, 2) NOT NULL,
    gst_scheme gst_scheme NOT NULL DEFAULT 'STANDARD_18_PERCENT',
    gst_rate_percent NUMERIC(4, 2) NOT NULL DEFAULT 18.00,
    gst_tax_amount_inr NUMERIC(12, 2) NOT NULL,
    grand_total_inr NUMERIC(12, 2) NOT NULL,
    validity_date DATE NOT NULL,
    status proposal_status DEFAULT 'SENT',
    special_briefing_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. BOOKINGS (Central State Machine Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL, -- e.g. 'KT-BKG-8910'
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
    departure_id UUID REFERENCES tour_departures(id) ON DELETE SET NULL,
    proposal_id UUID REFERENCES corporate_proposals(id) ON DELETE SET NULL,
    status booking_status DEFAULT 'LEAD_NEW',
    group_size INTEGER NOT NULL DEFAULT 1 CHECK (group_size > 0),
    total_amount_inr NUMERIC(12, 2) NOT NULL,
    amount_paid_inr NUMERIC(12, 2) DEFAULT 0.00,
    fx_rate_applied NUMERIC(8, 4),
    payment_link_id TEXT,
    payment_link_url TEXT,
    payment_link_expires_at TIMESTAMPTZ,
    gateway payment_gateway DEFAULT 'RAZORPAY',
    human_takeover_active BOOLEAN DEFAULT FALSE,
    assigned_agent_id TEXT,
    hold_expires_at TIMESTAMPTZ,
    gst_scheme_applied gst_scheme DEFAULT 'COMPOSITE_5_PERCENT',
    tally_voucher_number TEXT,
    tally_synced_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. BOOKING PAYMENT MILESTONES (High-Ticket International & Corporate)
-- -----------------------------------------------------------------------------
CREATE TABLE booking_payment_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    milestone_number INTEGER NOT NULL, -- 1: Deposit (25%), 2: Milestone 1 (35%), 3: Final (40%)
    title TEXT NOT NULL,
    percentage_due NUMERIC(5, 2) NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status milestone_status DEFAULT 'PENDING',
    payment_link_id TEXT,
    paid_at TIMESTAMPTZ,
    fx_adjustment_applied NUMERIC(10, 2) DEFAULT 0.00,
    invoice_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. BOOKING GUEST MANIFEST (ID Collection, KYC, Dietary, Attendance)
-- -----------------------------------------------------------------------------
CREATE TABLE booking_guest_manifest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    id_type TEXT, -- 'AADHAAR', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE'
    id_number TEXT,
    id_document_url TEXT,
    passport_expiry_date DATE,
    visa_status TEXT DEFAULT 'NOT_REQUIRED',
    dietary_preference TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    has_attended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. VENDORS & EXTERNAL SUPPLIERS
-- -----------------------------------------------------------------------------
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    vendor_type vendor_resource_type NOT NULL,
    contact_person TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    base_payout_rate_inr NUMERIC(10, 2) DEFAULT 0.00,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. DISPATCH REQUESTS (Guide & Vendor Allocation Engine)
-- -----------------------------------------------------------------------------
CREATE TABLE dispatch_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    departure_id UUID REFERENCES tour_departures(id) ON DELETE SET NULL,
    resource_type vendor_resource_type NOT NULL DEFAULT 'GUIDE',
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    assigned_entity_name TEXT,
    assigned_entity_phone TEXT,
    status dispatch_status DEFAULT 'UNASSIGNED',
    broadcast_sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    payout_amount_inr NUMERIC(10, 2),
    timeout_minutes INTEGER DEFAULT 30,
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. FX PRICING LEDGER (Dynamic USD/INR Volatility Engine)
-- -----------------------------------------------------------------------------
CREATE TABLE fx_pricing_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    spot_usd_inr NUMERIC(8, 4) NOT NULL,
    buffer_percentage NUMERIC(4, 2) DEFAULT 3.50,
    control_rate NUMERIC(8, 4) NOT NULL,
    cost_usd NUMERIC(10, 2) NOT NULL,
    cost_floor_inr NUMERIC(12, 2) NOT NULL,
    quoted_price_inr NUMERIC(12, 2) NOT NULL,
    margin_percentage NUMERIC(5, 2) DEFAULT 22.00,
    final_settlement_rate NUMERIC(8, 4),
    settlement_surcharge_inr NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. TALLY PRIME SYNC LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE tally_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    voucher_number TEXT NOT NULL,
    voucher_type TEXT NOT NULL DEFAULT 'RECEIPT', -- 'RECEIPT', 'SALES', 'CREDIT_NOTE'
    gst_scheme gst_scheme NOT NULL,
    base_amount_inr NUMERIC(12, 2) NOT NULL,
    cgst_amount_inr NUMERIC(10, 2) NOT NULL,
    sgst_amount_inr NUMERIC(10, 2) NOT NULL,
    total_amount_inr NUMERIC(12, 2) NOT NULL,
    xml_payload TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED', -- 'SYNCED', 'QUEUED', 'FAILED'
    tally_response_message TEXT,
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 13. KHAKI LAB EVENT ARCHIVE
-- -----------------------------------------------------------------------------
CREATE TABLE khaki_lab_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talk_number INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    hashtag TEXT NOT NULL,
    speaker TEXT NOT NULL,
    venue TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'ONLINE_LECTURE',
    slug TEXT UNIQUE,
    url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 14. CHAT MESSAGES (Unified Omnichannel Inbox)
-- -----------------------------------------------------------------------------
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    direction message_direction NOT NULL,
    sender_type message_sender_type NOT NULL,
    channel TEXT NOT NULL DEFAULT 'WHATSAPP',
    external_message_id TEXT UNIQUE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    status TEXT DEFAULT 'SENT',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR HIGH-VELOCITY QUERYING
-- -----------------------------------------------------------------------------
CREATE INDEX idx_contacts_phone ON contacts(phone_number);
CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_tours_category_active ON tours(category, is_active);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_departures_date ON tour_departures(departure_datetime, status);
CREATE INDEX idx_departures_tour ON tour_departures(tour_id);
CREATE INDEX idx_bookings_ref ON bookings(booking_reference);
CREATE INDEX idx_bookings_contact ON bookings(contact_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_departure ON bookings(departure_id);
CREATE INDEX idx_dispatch_booking ON dispatch_requests(booking_id);
CREATE INDEX idx_dispatch_status ON dispatch_requests(status);
CREATE INDEX idx_manifest_booking ON booking_guest_manifest(booking_id);
CREATE INDEX idx_milestones_booking ON booking_payment_milestones(booking_id);
CREATE INDEX idx_chat_contact ON chat_messages(contact_id);
CREATE INDEX idx_khaki_lab_talk ON khaki_lab_events(talk_number);

-- -----------------------------------------------------------------------------
-- AUTOMATED PROCEDURES & TRIGGERS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orgs_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tours_updated_at BEFORE UPDATE ON tours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_departures_updated_at BEFORE UPDATE ON tour_departures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dispatch_updated_at BEFORE UPDATE ON dispatch_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Real-time seat decrement on departures
CREATE OR REPLACE FUNCTION handle_booking_seat_allocation()
RETURNS TRIGGER AS $$
BEGIN
    -- Booking confirmed -> decrement available_seats on departure
    IF (TG_OP = 'INSERT' AND NEW.status = 'CONFIRMED' AND NEW.departure_id IS NOT NULL) OR
       (TG_OP = 'UPDATE' AND OLD.status != 'CONFIRMED' AND NEW.status = 'CONFIRMED' AND NEW.departure_id IS NOT NULL) THEN
        UPDATE tour_departures
        SET booked_seats = booked_seats + NEW.group_size,
            available_seats = available_seats - NEW.group_size,
            status = CASE WHEN (available_seats - NEW.group_size) <= 0 THEN 'SOLD_OUT' ELSE status END
        WHERE id = NEW.departure_id;
    END IF;

    -- Booking cancelled -> restore seats on departure
    IF (TG_OP = 'UPDATE' AND OLD.status = 'CONFIRMED' AND NEW.status = 'CANCELLED' AND NEW.departure_id IS NOT NULL) THEN
        UPDATE tour_departures
        SET booked_seats = booked_seats - OLD.group_size,
            available_seats = available_seats + OLD.group_size,
            status = 'OPEN'
        WHERE id = NEW.departure_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_manage_departure_seats
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION handle_booking_seat_allocation();

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_departures ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_guest_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_pricing_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE tally_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE khaki_lab_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read policies for catalog, departures, and talks
CREATE POLICY "Public read tours" ON tours FOR SELECT USING (is_active = true);
CREATE POLICY "Public read departures" ON tour_departures FOR SELECT USING (true);
CREATE POLICY "Public read khaki lab" ON khaki_lab_events FOR SELECT USING (true);

-- Authenticated staff policies
CREATE POLICY "Staff all organizations" ON organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all contacts" ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all tours" ON tours FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all departures" ON tour_departures FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all corporate proposals" ON corporate_proposals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all bookings" ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all milestones" ON booking_payment_milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all manifests" ON booking_guest_manifest FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all vendors" ON vendors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all dispatch" ON dispatch_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all fx ledger" ON fx_pricing_ledger FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all tally logs" ON tally_sync_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all chat messages" ON chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 15. OPERATIONS COST SETTINGS & PRICING INVENTORY
-- -----------------------------------------------------------------------------
CREATE TABLE operations_cost_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_fellow_payout_inr NUMERIC(10, 2) NOT NULL DEFAULT 3500.00,
    core_ambassador_payout_inr NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
    apprentice_guide_payout_inr NUMERIC(10, 2) NOT NULL DEFAULT 1800.00,
    bespoke_curator_lead_payout_inr NUMERIC(10, 2) NOT NULL DEFAULT 12000.00,
    emergency_substitution_bonus_inr NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    target_gross_margin_percent NUMERIC(4, 2) NOT NULL DEFAULT 50.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_entry_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_code TEXT UNIQUE NOT NULL,
    site_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('HERITAGE_MONUMENT', 'MUSEUM', 'PERMIT', 'FERRY')),
    fee_per_head_inr NUMERIC(10, 2) NOT NULL,
    special_permit_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE logistics_fleet_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_type TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    cost_inr NUMERIC(10, 2) NOT NULL,
    billing_unit TEXT NOT NULL CHECK (billing_unit IN ('PER_TOUR', 'PER_DAY', 'PER_HEAD')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fnb_partner_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    vendor_name TEXT NOT NULL,
    cluster TEXT NOT NULL,
    cost_per_head_inr NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE operations_cost_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_entry_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_fleet_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE fnb_partner_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff all cost settings" ON operations_cost_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all site fees" ON site_entry_fees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all logistics inventory" ON logistics_fleet_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Staff all fnb inventory" ON fnb_partner_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);

