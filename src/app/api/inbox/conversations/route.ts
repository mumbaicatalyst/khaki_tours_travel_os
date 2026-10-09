import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const rawConversations = appStore.getWhatsAppConversations();
    const contacts = appStore.getContacts();

    // Default seed conversations to ensure rich multi-stream operational experience
    const defaultSeeds = [
      {
        phone: '+1 512 466 8459',
        customer_name: 'Farazdak Hafizjee',
        last_message_text: 'Looking for upcoming weekend tours',
        last_message_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        unread_count: 0,
        human_takeover: false,
        organization: 'Khaki Tours Operations HQ',
        tour_name: '#DurgasOf Mumbai: Navratri Special Walk (Sat 8:00 AM)',
        priority_tier: 'P1_CRITICAL_CORPORATE',
        inbound_stream: 'PUBLIC_WALK',
        assigned_staff: 'Priya S. (Ops Lead)',
        sla_minutes: 15,
        rfm_score: 99,
        lifetime_spend: 150000,
        total_bookings: 5,
        sac_code: '998554',
        gst_rate: '18%',
        ai_quality_score: 96,
        audit_summary: {
          intentAccuracy: 99,
          repetitionDetected: false,
          stumbles: [],
          employeeResponseMinutes: 2,
          sentiment: 'DELIGHTED',
          notes: 'Instant calendar lookup completed, clean pricing delivery without repetitive greetings.',
        },
      },
      {
        phone: '+91 98200 88712',
        customer_name: 'Karan Mehra',
        last_message_text: 'Hi Khaki team, I represent Godrej Properties. We have 8 overseas board members visiting Mumbai this weekend...',
        last_message_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        unread_count: 1,
        human_takeover: false,
        organization: 'Godrej Properties Limited',
        tour_name: 'Fort Heritage & Colonial Evangelism (Private Delegation)',
        priority_tier: 'P1_CRITICAL_CORPORATE',
        inbound_stream: 'CORPORATE_VIP',
        assigned_staff: 'Bharat Gothoskar (Founder & CEO)',
        sla_minutes: 15,
        rfm_score: 95,
        lifetime_spend: 85000,
        total_bookings: 3,
        sac_code: '998554',
        gst_rate: '18%',
        ai_quality_score: 92,
        audit_summary: {
          intentAccuracy: 95,
          repetitionDetected: false,
          stumbles: ['Awaiting corporate GST registration verification'],
          employeeResponseMinutes: 4,
          sentiment: 'SATISFIED',
          notes: 'Founder lead captured. Jev classified 98% corporate probability. Awaiting proposal PDF send.',
        },
      },
      {
        phone: '+91 98200 88192',
        customer_name: 'Aditya Birla Group HQ',
        last_message_text: 'Need private architectural walk for 20 board members this Friday afternoon.',
        last_message_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        unread_count: 1,
        human_takeover: false,
        organization: 'Aditya Birla Management Corp',
        tour_name: 'Private Architectural Walk for 20 Board Members (This Friday)',
        priority_tier: 'P1_CRITICAL_CORPORATE',
        inbound_stream: 'CORPORATE_VIP',
        assigned_staff: 'Bharat Gothoskar (Founder & CEO)',
        sla_minutes: 15,
        rfm_score: 96,
        lifetime_spend: 120000,
        total_bookings: 2,
        sac_code: '998554',
        gst_rate: '18%',
        ai_quality_score: 88,
        audit_summary: {
          intentAccuracy: 92,
          repetitionDetected: false,
          stumbles: ['Response SLA breached by 25 mins due to pending board schedule confirmation'],
          employeeResponseMinutes: 40,
          sentiment: 'NEUTRAL',
          notes: 'High-value account. Requires immediate personal follow-up by founder.',
        },
      },
      {
        phone: '+91 98199 87654',
        customer_name: 'Pooja Singhania',
        last_message_text: 'Is the vintage open jeep safari available tomorrow morning for 6 people?',
        last_message_at: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
        unread_count: 0,
        human_takeover: true,
        organization: 'Singhania Family Office',
        tour_name: 'Vintage Open Jeep #UrbanSafari (Tomorrow 8:30 AM)',
        priority_tier: 'P2_HIGH_URGENT',
        inbound_stream: 'PRIVATE_TOUR',
        assigned_staff: 'Farhan K. (Field Dispatcher)',
        sla_minutes: 30,
        rfm_score: 88,
        lifetime_spend: 29000,
        total_bookings: 2,
        sac_code: '998555',
        gst_rate: '5%',
        ai_quality_score: 94,
        audit_summary: {
          intentAccuracy: 96,
          repetitionDetected: false,
          stumbles: ['30-min hold timer engaged; awaiting driver Ramesh Gurav confirmation'],
          employeeResponseMinutes: 8,
          sentiment: 'SATISFIED',
          notes: 'Vehicle dispatch broadcast sent. Human takeover active by Field Dispatch desk.',
        },
      },
      {
        phone: '+91 98205 44109',
        customer_name: 'David Van Houten',
        last_message_text: 'Planning our 14-day heritage expedition to India for March 2027. Do you manage custom domestic flights and luxury boutique hotels?',
        last_message_at: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
        unread_count: 1,
        human_takeover: false,
        organization: 'Amsterdam Architectural Guild',
        tour_name: 'Grand Western India Heritage Expedition (Bespoke 14-Day)',
        priority_tier: 'P1_CRITICAL_CORPORATE',
        inbound_stream: 'INTERNATIONAL',
        assigned_staff: 'Bharat Gothoskar (Founder & CEO)',
        sla_minutes: 60,
        rfm_score: 92,
        lifetime_spend: 0,
        total_bookings: 0,
        sac_code: '998554',
        gst_rate: '18%',
        ai_quality_score: 91,
        audit_summary: {
          intentAccuracy: 94,
          repetitionDetected: false,
          stumbles: ['FX rate volatility disclaimer required for USD milestone payments'],
          employeeResponseMinutes: 12,
          sentiment: 'SATISFIED',
          notes: 'International high-ticket inquiry. Stage 1 milestone deposit flow required.',
        },
      },
      {
        phone: '+91 98331 99201',
        customer_name: 'Siddharth Joshi',
        last_message_text: 'Do you guys do photography walks on weekdays? Also what camera gear is allowed inside High Court?',
        last_message_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        unread_count: 0,
        human_takeover: false,
        organization: 'Mumbai Street Photography Club',
        tour_name: 'General Heritage Inquiry & Photography Rules',
        priority_tier: 'P3_ROUTINE_CATALOG',
        inbound_stream: 'GENERAL_INQUIRY',
        assigned_staff: 'Priya S. (Ops Lead)',
        sla_minutes: 120,
        rfm_score: 45,
        lifetime_spend: 0,
        total_bookings: 0,
        sac_code: '998555',
        gst_rate: '5%',
        ai_quality_score: 97,
        audit_summary: {
          intentAccuracy: 100,
          repetitionDetected: false,
          stumbles: [],
          employeeResponseMinutes: 1,
          sentiment: 'DELIGHTED',
          notes: 'AI concierge handled automatically. Explained High Court security protocol and directed to weekend public walks.',
        },
      },
    ];

    // Merge store conversations with seed items
    const storeMap = new Map<string, any>();
    for (const c of rawConversations) {
      const clean = c.phone.replace(/[^0-9]/g, '');
      storeMap.set(clean, c);
    }

    const mergedList: any[] = [];

    // Add all conversations from store
    for (const c of rawConversations) {
      const clean = c.phone.replace(/[^0-9]/g, '');
      const contact = contacts.find((cnt: any) => cnt.phone_number.replace(/[^0-9]/g, '') === clean);
      const msgs = appStore.getWhatsAppMessages(c.phone);

      const elapsed = Math.max(1, Math.floor((Date.now() - new Date(c.last_message_at || Date.now()).getTime()) / 60000));

      mergedList.push({
        id: c.id || `sess_${clean}`,
        customerName: c.customer_name || contact?.full_name || 'Khaki Guest',
        phone: c.phone,
        email: contact?.email || '',
        organization: contact?.company || undefined,
        tourName: c.tour_name || 'Weekend Heritage Walk Inquiries',
        inboundStream: c.inbound_stream || (contact?.company ? 'CORPORATE_VIP' : 'PUBLIC_WALK'),
        assignedStaff: c.assigned_staff || (contact?.company ? 'Bharat Gothoskar (Founder & CEO)' : 'Priya S. (Ops Lead)'),
        lastMessage: c.last_message_text || (msgs.length > 0 ? msgs[msgs.length - 1].text : 'Inbound inquiry'),
        lastMessageTimestamp: new Date(c.last_message_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        humanTakeover: Boolean(c.human_takeover),
        priorityTier: c.priority_tier || (contact?.segment_tags?.includes('CORPORATE_VIP') ? 'P1_CRITICAL_CORPORATE' : 'P2_DIRECT_B2C'),
        slaMinutes: c.sla_minutes || (contact?.segment_tags?.includes('CORPORATE_VIP') ? 15 : 60),
        minutesElapsed: elapsed,
        unreadCount: c.unread_count || 0,
        rfmScore: contact?.rfm_score || 75,
        lifetimeSpendInr: contact?.lifetime_spend_inr || 0,
        totalBookings: contact?.total_bookings || 0,
        taxSacCode: contact?.company ? '998554' : '998555',
        gstRate: contact?.company ? '18%' : '5%',
        aiQualityScore: c.audit_data?.aiQualityScore || 94,
        auditSummary: c.audit_data || {
          intentAccuracy: 95,
          repetitionDetected: false,
          stumbles: [],
          employeeResponseMinutes: elapsed > 30 ? elapsed : 3,
          sentiment: 'SATISFIED',
          notes: 'Standard conversational flow archived. Live store persistence active.',
        },
        messages: msgs.map((m: any) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: m.status || 'DELIVERED',
          error: m.metadata?.error || m.error,
          isLocationPin: Boolean(m.isLocationPin),
        })),
      });
    }

    // Include any defaults not already present in store
    for (const d of defaultSeeds) {
      const clean = d.phone.replace(/[^0-9]/g, '');
      if (!storeMap.has(clean)) {
        const msgs = appStore.getWhatsAppMessages(d.phone);
        mergedList.push({
          id: `sess_def_${clean}`,
          customerName: d.customer_name,
          phone: d.phone,
          organization: d.organization,
          tourName: d.tour_name,
          inboundStream: d.inbound_stream,
          assignedStaff: d.assigned_staff,
          lastMessage: msgs.length > 0 ? msgs[msgs.length - 1].text : d.last_message_text,
          lastMessageTimestamp: new Date(d.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          humanTakeover: d.human_takeover,
          priorityTier: d.priority_tier,
          slaMinutes: d.sla_minutes,
          minutesElapsed: Math.max(1, Math.floor((Date.now() - new Date(d.last_message_at).getTime()) / 60000)),
          unreadCount: d.unread_count,
          rfmScore: d.rfm_score,
          lifetimeSpendInr: d.lifetime_spend,
          totalBookings: d.total_bookings,
          taxSacCode: d.sac_code,
          gstRate: d.gst_rate,
          aiQualityScore: d.ai_quality_score,
          auditSummary: d.audit_summary,
          messages: msgs.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: m.status || 'DELIVERED',
            error: m.metadata?.error || m.error,
            isLocationPin: Boolean(m.isLocationPin),
          })),
        });
      }
    }

    // Sort by unread first, then by last message timestamp
    mergedList.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));

    return NextResponse.json({
      success: true,
      count: mergedList.length,
      conversations: mergedList,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, assigned_staff, human_takeover, inbound_stream, priority_tier, audit_data } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const updated = appStore.updateConversation(phone, {
      assigned_staff,
      human_takeover,
      inbound_stream,
      priority_tier,
      audit_data,
    });

    return NextResponse.json({ success: true, conversation: updated });
  } catch (error: any) {
    console.error('[Conversations PATCH Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
