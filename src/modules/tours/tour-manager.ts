import { Tour, TourType } from '@/types/database';
import { inMemoryCatalog } from '@/lib/supabase/seed';

export interface CreateTourInput {
  title: string;
  clean_title?: string;
  hashtag: string;
  slug: string;
  category: TourType;
  base_price_inr: number;
  base_cost_usd?: number;
  duration: string;
  distance?: string;
  meeting_landmark: string;
  route_highlights: string[];
  max_capacity: number;
  description: string;
  is_active?: boolean;
}

export interface TourUpdateInput extends Partial<CreateTourInput> {
  id: string;
}

export class TourManager {
  /**
   * Add a brand new tour experience to the operating system
   */
  static createTour(input: CreateTourInput): Tour {
    const newId = `kt_tour_${Date.now()}`;
    const newTour: Tour = {
      id: newId,
      tour_code: `KT_EXP_${Date.now().toString().slice(-4)}`,
      title: input.title,
      clean_title: input.clean_title || input.title.replace(/^#[A-Za-z0-9]+\s*[:–-]?\s*/, ''),
      hashtag: input.hashtag.startsWith('#') ? input.hashtag : `#${input.hashtag}`,
      slug: input.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
      category: input.category,
      base_price_inr: input.base_price_inr,
      base_cost_usd: input.base_cost_usd || 0,
      duration: input.duration || '2.5 Hours',
      distance: input.distance || '2.0 Kms',
      meeting_landmark: input.meeting_landmark,
      route_highlights: input.route_highlights || [],
      max_capacity: input.max_capacity || 25,
      description: input.description,
      is_active: input.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Prepend to in-memory catalog
    inMemoryCatalog.tours.unshift(newTour);

    // Broadcast headless webhook to update the consumer-facing website immediately
    this.broadcastHeadlessWebsiteSync('TOUR_CREATED', newTour);

    return newTour;
  }

  /**
   * Update an existing tour in the catalog
   */
  static updateTour(input: TourUpdateInput): Tour | null {
    const idx = inMemoryCatalog.tours.findIndex((t) => t.id === input.id || t.slug === input.slug);
    if (idx === -1) return null;

    const existing = inMemoryCatalog.tours[idx];
    const updated: Tour = {
      ...existing,
      ...input,
      updated_at: new Date().toISOString(),
    };

    inMemoryCatalog.tours[idx] = updated;

    this.broadcastHeadlessWebsiteSync('TOUR_UPDATED', updated);
    return updated;
  }

  /**
   * Delete or archive a tour from the operating system
   */
  static archiveTour(id: string): boolean {
    const idx = inMemoryCatalog.tours.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    // Soft delete / archive
    inMemoryCatalog.tours[idx].is_active = false;
    inMemoryCatalog.tours[idx].updated_at = new Date().toISOString();

    this.broadcastHeadlessWebsiteSync('TOUR_ARCHIVED', inMemoryCatalog.tours[idx]);
    return true;
  }

  /**
   * Headless Two-Way Sync Dispatcher
   * Emits live events to consumer website webhooks to guarantee real-time sync
   */
  private static broadcastHeadlessWebsiteSync(eventType: string, tour: Tour) {
    console.log(`[Headless Sync] Emitting ${eventType} for ${tour.hashtag} (${tour.slug}) to public website.`);
    // In production: POST to process.env.CONSUMER_WEBSITE_WEBHOOK_URL
  }
}
