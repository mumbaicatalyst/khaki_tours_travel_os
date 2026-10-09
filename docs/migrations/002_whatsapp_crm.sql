-- ==============================================================================
-- KHAKI TRAVEL OPERATING SYSTEM - WHATSAPP OPERATIONS EXTENSION
-- Schema Migration 002: Official Meta WhatsApp Cloud API Tables
-- ==============================================================================

-- 1. WhatsApp Conversations (Unified thread per guest/lead)
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL UNIQUE,
    contact_name TEXT,
    organization_name TEXT,
    priority_tier TEXT DEFAULT 'P3_STANDARD', -- 'P1_CRITICAL_CORPORATE', 'P2_HIGH_URGENT', 'P3_STANDARD'
    sla_minutes INTEGER DEFAULT 60,
    minutes_elapsed INTEGER DEFAULT 0,
    assigned_to TEXT DEFAULT 'Khaki Bot',
    human_takeover BOOLEAN DEFAULT FALSE,
    unread_count INTEGER DEFAULT 0,
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone lookups and SLA queue ordering
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_wa_conv_last_msg ON whatsapp_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_conv_tier ON whatsapp_conversations(priority_tier);

-- 2. WhatsApp Messages (Immutable message audit log)
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    wamid TEXT UNIQUE, -- Meta WhatsApp Message ID
    direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('GUEST', 'BOT', 'HUMAN')),
    message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'interactive', 'template', 'image', 'document', 'audio', 'location'
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT', -- 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED'
    media_url TEXT,
    media_caption TEXT,
    interactive_response JSONB,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_wamid ON whatsapp_messages(wamid);
CREATE INDEX IF NOT EXISTS idx_wa_msg_created ON whatsapp_messages(created_at);

-- 3. WhatsApp Message Templates (Pre-approved Meta templates for Khaki Tours)
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('UTILITY', 'MARKETING', 'AUTHENTICATION')),
    language TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING', 'REJECTED'
    header_format TEXT, -- 'TEXT', 'IMAGE', 'LOCATION', 'NONE'
    body_text TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    buttons JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial Khaki Tours standard operational WhatsApp templates
INSERT INTO whatsapp_templates (name, category, language, status, body_text, variables, buttons)
VALUES
(
    'booking_confirmation_v1',
    'UTILITY',
    'en',
    'APPROVED',
    'Namaste {{1}}! Your booking for *{{2}}* on *{{3}}* is CONFIRMED. Total Pax: {{4}}. Meeting Point: {{5}}. Your guide details will be shared 24 hours prior to departure. See you on the trail!',
    ARRAY['guest_name', 'tour_title', 'departure_date', 'group_size', 'meeting_landmark'],
    '[{"type": "URL", "text": "View Pass & Meeting Pin", "url": "https://khakitours.com/pass/{{1}}"}]'::jsonb
),
(
    'departure_dispatch_guide_pin_v1',
    'UTILITY',
    'en',
    'APPROVED',
    'Namaste {{1}}! Tomorrow is your Khaki Tour *{{2}}* at {{3}}. Your Ambassador of Mumbai is {{4}} ({{5}}). Please assemble at {{6}}. Tap below for Google Maps direction pin.',
    ARRAY['guest_name', 'tour_title', 'slot_time', 'guide_name', 'guide_phone', 'meeting_landmark'],
    '[{"type": "URL", "text": "Google Maps Meeting Pin", "url": "https://maps.google.com/?q={{1}}"}]'::jsonb
),
(
    'corporate_proposal_sent_v1',
    'UTILITY',
    'en',
    'APPROVED',
    'Dear {{1}}, thank you for contacting Khaki Tours regarding the corporate heritage experience for {{2}}. Our Founder Bharat Gothoskar has prepared your bespoke itinerary with 18% GST (SAC 998554). Proposal link: {{3}}.',
    ARRAY['contact_name', 'company_name', 'proposal_url'],
    '[{"type": "URL", "text": "Review B2B Proposal", "url": "{{1}}"}]'::jsonb
)
ON CONFLICT (name) DO NOTHING;
