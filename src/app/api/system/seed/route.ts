import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'docs', 'data');

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  const logs: string[] = [];
  const results: Record<string, any> = {};

  try {
    logs.push('[Seed] Reading source datasets from /docs/data/...');
    const toursPath = path.join(DATA_DIR, 'tours_master.json');
    const departuresPath = path.join(DATA_DIR, 'departures_calendar.json');
    const guidesPath = path.join(DATA_DIR, 'guides_roster.json');
    const vendorsPath = path.join(DATA_DIR, 'vendors_roster.json');
    const khakiLabPath = path.join(DATA_DIR, 'khaki_lab_archive.json');
    const liveStorePath = path.join(DATA_DIR, 'live_store.json');

    const toursRaw = fs.existsSync(toursPath) ? JSON.parse(fs.readFileSync(toursPath, 'utf-8')) : [];
    const departuresRaw = fs.existsSync(departuresPath) ? JSON.parse(fs.readFileSync(departuresPath, 'utf-8')) : [];
    const guidesRaw = fs.existsSync(guidesPath) ? JSON.parse(fs.readFileSync(guidesPath, 'utf-8')) : [];
    const vendorsRaw = fs.existsSync(vendorsPath) ? JSON.parse(fs.readFileSync(vendorsPath, 'utf-8')) : [];
    const khakiLabRaw = fs.existsSync(khakiLabPath) ? JSON.parse(fs.readFileSync(khakiLabPath, 'utf-8')) : [];
    const liveStore = fs.existsSync(liveStorePath) ? JSON.parse(fs.readFileSync(liveStorePath, 'utf-8')) : {};

    // 1. Seed Vendors & Guides
    logs.push('[Seed] Step 1: Seeding Vendors & Guides into "vendors" table...');
    const allVendors: any[] = [];

    // Map guides
    guidesRaw.forEach((g: any) => {
      allVendors.push({
        name: g.name,
        vendor_type: 'GUIDE',
        contact_person: g.title || g.role || 'Ambassador',
        phone: g.contact_phone || '+91 98200 00000',
        base_payout_rate_inr: 2500,
        rating: g.rating || 4.9,
        is_active: true,
      });
    });

    // Map external vendors
    vendorsRaw.forEach((v: any) => {
      let vType = 'GUIDE';
      if (v.vendor_type === 'JEEP_DRIVER') vType = 'JEEP';
      else if (v.vendor_type === 'BOAT_CAPTAIN') vType = 'BOAT';
      else if (v.vendor_type === 'DMC_PARTNER') vType = 'DMC';
      else if (v.vendor_type === 'HERITAGE_ARCHITECT') vType = 'HERITAGE_EXPERT';

      allVendors.push({
        name: v.name,
        vendor_type: vType,
        contact_person: v.company_or_fleet || v.name,
        phone: v.contact_phone || '+91 98200 00000',
        base_payout_rate_inr: v.per_tour_rate_inr || 3500,
        rating: v.rating || 4.8,
        is_active: true,
      });
    });

    // Remove duplicates by name
    const uniqueVendors = Array.from(new Map(allVendors.map(item => [item.name, item])).values());
    
    // Check if vendors already exist
    const { data: existingVendors } = await supabaseAdmin.from('vendors').select('name');
    const existingNames = new Set((existingVendors || []).map(v => v.name));
    const newVendors = uniqueVendors.filter(v => !existingNames.has(v.name));

    if (newVendors.length > 0) {
      const { error: vendorsError } = await supabaseAdmin.from('vendors').insert(newVendors);
      if (vendorsError) {
        logs.push(`[Vendors Warning] ${vendorsError.message}`);
      } else {
        logs.push(`[Vendors Success] Inserted ${newVendors.length} new vendors & guides.`);
      }
    } else {
      logs.push(`[Vendors Success] All ${uniqueVendors.length} vendors already present in database.`);
    }
    results.vendors_upserted = uniqueVendors.length;

    // 2. Seed Tours Master
    logs.push('[Seed] Step 2: Seeding 81 Tours into "tours" table...');
    const validCategories = ['STANDARD_WALK', 'PRIVATE_GROUP', 'INTERNATIONAL_EXPEDITION', 'CORPORATE_B2B'];
    
    const formattedTours = toursRaw.map((t: any, idx: number) => {
      let cat = t.category;
      if (!validCategories.includes(cat)) {
        if (cat === 'SPECIAL_WALK' || cat === 'HERITAGE_SAFARI') cat = 'PRIVATE_GROUP';
        else cat = 'STANDARD_WALK';
      }

      const slug = t.slug || `tour-${t.wp_id || idx + 1}`;
      const tourCode = `KT_TOUR_${t.wp_id || (idx + 100)}`;

      return {
        tour_code: tourCode,
        wp_id: t.wp_id || null,
        title: t.title || 'Untitled Tour',
        clean_title: t.clean_title || t.title,
        hashtag: t.hashtag || '#KhakiTour',
        slug: slug,
        category: cat,
        base_price_inr: Number(t.base_price_inr) || 899,
        base_cost_usd: Number(t.base_cost_usd) || 0,
        duration: t.duration || '2.5 Hours',
        distance: t.distance || '2.0 Kms',
        meeting_landmark: t.meeting_landmark || t.starting_point || 'Horniman Circle, Fort',
        route_highlights: Array.isArray(t.route_highlights) ? t.route_highlights : [],
        max_capacity: Number(t.max_capacity) || 25,
        description: t.description || 'Heritage curated experience by Khaki Tours.',
        is_active: true,
      };
    });

    const { data: toursData, error: toursError } = await supabaseAdmin
      .from('tours')
      .upsert(formattedTours, { onConflict: 'slug' })
      .select('id, slug, tour_code');

    if (toursError) {
      logs.push(`[Tours Error] ${toursError.message}`);
    } else {
      logs.push(`[Tours Success] Upserted ${formattedTours.length} tours.`);
    }
    results.tours_upserted = formattedTours.length;

    // Fetch all tours from Supabase to get UUID mappings
    const { data: currentTours } = await supabaseAdmin
      .from('tours')
      .select('id, slug, tour_code');

    const tourSlugMap = new Map<string, string>();
    if (currentTours) {
      currentTours.forEach(t => {
        tourSlugMap.set(t.slug, t.id);
      });
    }

    // 3. Seed CRM Contacts
    logs.push('[Seed] Step 3: Seeding CRM Contacts into "contacts" table...');
    const localContacts = liveStore.contacts || [
      {
        full_name: 'Karan Mehra',
        phone_number: '+919820088712',
        email: 'karan.mehra@godrejproperties.com',
        is_corporate_booker: true,
        designation: 'VP Corporate Affairs',
        segment_tags: ['CORPORATE_VIP', 'EXECUTIVE_LEAD'],
        rfm_score: 95,
        notes: 'VP of Corporate Affairs. Books private architectural heritage walks.',
      },
      {
        full_name: 'Pooja Singhania',
        phone_number: '+919819987654',
        email: 'pooja.singhania@gmail.com',
        is_corporate_booker: false,
        segment_tags: ['PRIVATE_SAFARI_VIP', 'HIGH_NET_WORTH'],
        rfm_score: 88,
        notes: 'Loves the #UrbanSafari vintage open jeep tours.',
      },
      {
        full_name: 'Elena Rostova',
        phone_number: '+919820399182',
        email: 'elena.rostova@maec.es',
        is_corporate_booker: true,
        designation: 'Cultural Attaché',
        segment_tags: ['DIPLOMATIC_CONSULATE', 'CORPORATE_VIP'],
        rfm_score: 92,
        notes: 'Cultural Attaché at Spanish Consulate. Requires Spanish or fluent English speaker.',
      },
      {
        full_name: 'Vikramaditya Shroff',
        phone_number: '+919820123456',
        email: 'v.shroff@upl-ltd.com',
        is_corporate_booker: true,
        designation: 'Director',
        segment_tags: ['CORPORATE_VIP', 'PATRON'],
        rfm_score: 98,
        notes: 'B2B patron. Booked corporate offsites for 65 pax.',
      },
      {
        full_name: 'Ananya Deshmukh',
        phone_number: '+919820556789',
        email: 'ananya.deshmukh@tcs.com',
        is_corporate_booker: false,
        segment_tags: ['REPEAT_WALKER', 'STUDENT_HERITAGE'],
        rfm_score: 78,
        notes: 'Heritage enthusiast. Attended 6 weekend walks.',
      }
    ];

    const formattedContacts = localContacts.map((c: any) => ({
      full_name: c.full_name,
      phone_number: (c.phone_number || '').replace(/[^0-9+]/g, ''),
      email: c.email || null,
      is_corporate_booker: Boolean(c.is_corporate_booker || (c.segment_tags && c.segment_tags.includes('CORPORATE_VIP'))),
      designation: c.designation || c.company || null,
      segment_tags: c.segment_tags || ['GENERAL_WALKER'],
      rfm_score: c.rfm_score || 50,
      notes: c.notes || '',
    }));

    const { data: contactsData, error: contactsError } = await supabaseAdmin
      .from('contacts')
      .upsert(formattedContacts, { onConflict: 'phone_number' })
      .select('id, full_name, phone_number');

    if (contactsError) {
      logs.push(`[Contacts Error] ${contactsError.message}`);
    } else {
      logs.push(`[Contacts Success] Upserted ${formattedContacts.length} CRM contacts.`);
    }
    results.contacts_upserted = formattedContacts.length;

    // 4. Seed Khaki Lab Events
    logs.push('[Seed] Step 4: Seeding Khaki Lab Archive into "khaki_lab_events" table...');
    const talksMap = new Map<number, any>();
    khakiLabRaw.forEach((k: any) => {
      const num = Number(k.talk_number);
      if (!isNaN(num) && !talksMap.has(num)) {
        talksMap.set(num, {
          talk_number: num,
          title: k.title || `Khaki Lab Talk #${num}`,
          hashtag: k.hashtag || '#KhakiLab',
          speaker: k.speaker || 'Historian Speaker',
          venue: k.venue || 'Khaki Lab Fort',
          format: k.format || 'ONLINE_LECTURE',
          slug: k.slug || `talk-${num}`,
          url: k.link || null,
          published_at: k.date_published || null,
        });
      }
    });
    const formattedTalks = Array.from(talksMap.values());

    const { data: talksData, error: talksError } = await supabaseAdmin
      .from('khaki_lab_events')
      .upsert(formattedTalks, { onConflict: 'talk_number' })
      .select('id');

    if (talksError) {
      logs.push(`[Khaki Lab Warning] ${talksError.message}`);
    } else {
      logs.push(`[Khaki Lab Success] Upserted ${formattedTalks.length} events.`);
    }
    results.khaki_lab_events_upserted = formattedTalks.length;

    // 5. Seed Tour Departures
    logs.push('[Seed] Step 5: Seeding Tour Departures into "tour_departures" table...');
    let departureCount = 0;
    if (tourSlugMap.size > 0 && departuresRaw.length > 0) {
      const formattedDepartures: any[] = [];

      departuresRaw.slice(0, 150).forEach((d: any, idx: number) => {
        const tourId = tourSlugMap.get(d.slug) || currentTours?.[idx % currentTours.length]?.id;
        if (!tourId) return;

        const totalCap = Number(d.total_capacity) || 25;
        const booked = Math.min(Number(d.booked_seats) || 0, totalCap);
        const avail = totalCap - booked;

        formattedDepartures.push({
          departure_code: `DEP_${d.departure_code || (idx + 1000)}`,
          tour_id: tourId,
          departure_datetime: d.date ? `${d.date}T08:00:00Z` : new Date().toISOString(),
          slot_time: d.slot_time || '08:00 AM',
          total_capacity: totalCap,
          booked_seats: booked,
          available_seats: avail,
          status: avail === 0 ? 'SOLD_OUT' : 'OPEN',
        });
      });

      const { error: departuresError } = await supabaseAdmin
        .from('tour_departures')
        .upsert(formattedDepartures, { onConflict: 'departure_code' });

      if (departuresError) {
        logs.push(`[Departures Error] ${departuresError.message}`);
      } else {
        departureCount = formattedDepartures.length;
        logs.push(`[Departures Success] Upserted ${departureCount} departures.`);
      }
    }
    results.departures_upserted = departureCount;

    return NextResponse.json({
      success: true,
      message: 'Supabase database seeded successfully!',
      results,
      logs,
    });
  } catch (err: any) {
    logs.push(`[Fatal Exception] ${err.message}`);
    return NextResponse.json({
      success: false,
      error: err.message,
      logs,
    }, { status: 500 });
  }
}
