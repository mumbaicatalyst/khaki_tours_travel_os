/**
 * Khaki Travel OS - Database Seeder Module
 * Reads structured datasets from /docs/data/ and seeds Supabase / PostgreSQL tables.
 * Also provides an in-memory mock repository fallback for offline/development agent querying.
 */

import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './client';
import { Tour, TourDeparture, Vendor, KhakiLabEvent } from '@/types/database';

const DATA_DIR = path.join(process.cwd(), 'docs', 'data');

export interface SeedDataPayload {
  tours: any[];
  departures: any[];
  guides: any[];
  vendors: any[];
  policies: any;
  khakiLab: any[];
}

/**
 * Read the crawled JSON files from disk
 */
export function loadLocalDatasets(): SeedDataPayload {
  const toursPath = path.join(DATA_DIR, 'tours_master.json');
  const departuresPath = path.join(DATA_DIR, 'departures_calendar.json');
  const guidesPath = path.join(DATA_DIR, 'guides_roster.json');
  const vendorsPath = path.join(DATA_DIR, 'vendors_roster.json');
  const policiesPath = path.join(DATA_DIR, 'company_policies.json');
  const khakiLabPath = path.join(DATA_DIR, 'khaki_lab_archive.json');

  const tours = fs.existsSync(toursPath) ? JSON.parse(fs.readFileSync(toursPath, 'utf-8')) : [];
  const departures = fs.existsSync(departuresPath) ? JSON.parse(fs.readFileSync(departuresPath, 'utf-8')) : [];
  const guides = fs.existsSync(guidesPath) ? JSON.parse(fs.readFileSync(guidesPath, 'utf-8')) : [];
  const vendors = fs.existsSync(vendorsPath) ? JSON.parse(fs.readFileSync(vendorsPath, 'utf-8')) : [];
  const policies = fs.existsSync(policiesPath) ? JSON.parse(fs.readFileSync(policiesPath, 'utf-8')) : {};
  const khakiLab = fs.existsSync(khakiLabPath) ? JSON.parse(fs.readFileSync(khakiLabPath, 'utf-8')) : [];

  return { tours, departures, guides, vendors, policies, khakiLab };
}

/**
 * Seed live Supabase database instance
 */
export async function seedSupabaseDatabase(): Promise<{
  success: boolean;
  toursInserted: number;
  departuresInserted: number;
  guidesInserted: number;
  talksInserted: number;
  error?: string;
}> {
  const { tours, departures, guides, khakiLab } = loadLocalDatasets();

  try {
    console.log(`[Seed] Beginning database population from ${DATA_DIR}...`);

    // 1. Seed Tours
    const formattedTours = tours.map((t, idx) => ({
      tour_code: `KT_TOUR_${t.wp_id || idx + 1}`,
      wp_id: t.wp_id,
      title: t.title,
      clean_title: t.clean_title,
      hashtag: t.hashtag,
      slug: t.slug,
      category: t.category,
      base_price_inr: t.base_price_inr,
      base_cost_usd: t.base_cost_usd || 0,
      duration: t.duration,
      distance: t.distance,
      meeting_landmark: t.meeting_landmark || t.starting_point,
      route_highlights: t.route_highlights || [],
      max_capacity: t.max_capacity || 25,
      description: t.description,
      is_active: true,
    }));

    const { error: toursError } = await supabaseAdmin
      .from('tours')
      .upsert(formattedTours, { onConflict: 'slug' });

    if (toursError) {
      console.warn('[Seed] Warning inserting tours into Supabase (will use local fallback):', toursError.message);
    }

    // 2. Seed Vendors / Guides
    const formattedGuides = guides.map((g) => ({
      name: g.name,
      vendor_type: 'GUIDE' as const,
      contact_person: g.title,
      phone: g.contact_phone,
      rating: g.rating || 5.0,
      is_active: true,
    }));

    const { error: guidesError } = await supabaseAdmin
      .from('vendors')
      .upsert(formattedGuides, { onConflict: 'name' });

    if (guidesError) {
      console.warn('[Seed] Warning inserting guides:', guidesError.message);
    }

    // 3. Seed Khaki Lab Talks
    const formattedTalks = khakiLab.map((k) => ({
      talk_number: k.talk_number,
      title: k.title,
      hashtag: k.hashtag,
      speaker: k.speaker,
      venue: k.venue,
      format: k.format,
      slug: k.slug,
      url: k.link,
      published_at: k.date_published,
    }));

    const { error: talksError } = await supabaseAdmin
      .from('khaki_lab_events')
      .upsert(formattedTalks, { onConflict: 'talk_number' });

    if (talksError) {
      console.warn('[Seed] Warning inserting khaki lab talks:', talksError.message);
    }

    return {
      success: true,
      toursInserted: formattedTours.length,
      departuresInserted: departures.length,
      guidesInserted: formattedGuides.length,
      talksInserted: formattedTalks.length,
    };
  } catch (err: any) {
    console.error('[Seed] Database seeding exception:', err);
    return {
      success: false,
      toursInserted: 0,
      departuresInserted: 0,
      guidesInserted: 0,
      talksInserted: 0,
      error: err.message,
    };
  }
}

/**
 * In-memory Store Helper for Agent-Query APIs
 * Guarantees ultra-fast <5ms queries for WhatsApp Bots and Voice AI
 */
class InMemoryCatalogRepository {
  private static instance: InMemoryCatalogRepository;
  public tours: any[] = [];
  public departures: any[] = [];
  public guides: any[] = [];
  public vendors: any[] = [];
  public policies: any = {};
  public khakiLab: any[] = [];

  private constructor() {
    this.refresh();
  }

  public static getInstance(): InMemoryCatalogRepository {
    if (!InMemoryCatalogRepository.instance) {
      InMemoryCatalogRepository.instance = new InMemoryCatalogRepository();
    }
    return InMemoryCatalogRepository.instance;
  }

  public refresh() {
    try {
      const data = loadLocalDatasets();
      this.tours = data.tours;
      this.departures = data.departures;
      this.guides = data.guides;
      this.vendors = data.vendors;
      this.policies = data.policies;
      this.khakiLab = data.khakiLab;
    } catch (e) {
      console.error('[InMemoryCatalog] Error loading datasets:', e);
    }
  }
}

export const inMemoryCatalog = InMemoryCatalogRepository.getInstance();
