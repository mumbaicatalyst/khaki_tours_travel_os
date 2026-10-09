import { NextRequest, NextResponse } from 'next/server';
import { inMemoryCatalog } from '@/lib/supabase/seed';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agent-query/tours/search
 * High-velocity search for WhatsApp Bots, Voice AI, and Admin Dashboard
 * Query parameters:
 *  - q: Search string (e.g. 'fort', 'jeep', 'bandra', 'food', 'kids', 'opera')
 *  - category: Filter by tour_type ('STANDARD_WALK', 'PRIVATE_GROUP', 'INTERNATIONAL_EXPEDITION', 'CORPORATE_B2B')
 *  - limit: Max records (default: 100 for catalog browsing, smaller for voice bots)
 *  - all: Return all records without pagination (boolean)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase().trim() || '';
    const category = searchParams.get('category')?.toUpperCase().trim() || '';
    const all = searchParams.get('all') === 'true';
    const limitParam = searchParams.get('limit');
    const limit = all ? 500 : limitParam ? Number(limitParam) : 100;

    let results = inMemoryCatalog.tours || [];

    // Filter by category
    if (category && category !== 'ALL') {
      results = results.filter((t) => t.category === category);
    }

    // Filter by keyword query across title, hashtag, highlights, starting_point
    if (query) {
      results = results.filter((t) => {
        const titleMatch = t.title?.toLowerCase().includes(query);
        const hashtagMatch = t.hashtag?.toLowerCase().includes(query);
        const spMatch = (t.meeting_landmark || t.starting_point || '').toLowerCase().includes(query);
        const descMatch = (t.description || '').toLowerCase().includes(query);
        const hlMatch = (t.route_highlights || []).some((h: string) => h.toLowerCase().includes(query));

        return titleMatch || hashtagMatch || spMatch || descMatch || hlMatch;
      });
    }

    // Format comprehensive payload
    const formatted = results.slice(0, limit).map((t, idx) => ({
      id: t.tour_id || `kt_tour_${t.wp_id || idx + 1}`,
      tour_id: t.tour_id || `kt_tour_${t.wp_id || idx + 1}`,
      tour_code: t.tour_code || `KT-EXP-${t.wp_id || idx + 100}`,
      wp_id: t.wp_id,
      title: t.title,
      clean_title: t.clean_title || t.title,
      hashtag: t.hashtag || '#KhakiTour',
      slug: t.slug,
      category: t.category || 'STANDARD_WALK',
      base_price_inr: t.base_price_inr || 899,
      price_inr: t.base_price_inr || 899,
      base_cost_usd: t.base_cost_usd || 0,
      duration: t.duration || '2.5 Hours',
      distance: t.distance || '2.0 Kms',
      starting_point: t.meeting_landmark || t.starting_point || 'South Mumbai',
      meeting_landmark: t.meeting_landmark || t.starting_point || 'South Mumbai',
      route_highlights: t.route_highlights || [],
      highlights: (t.route_highlights || []).slice(0, 4),
      max_capacity: t.max_capacity || 25,
      description: t.description || '',
      summary: (t.description || '').slice(0, 200),
      is_active: true,
      booking_url: `https://khakitours.com/itinerary/${t.slug}`,
    }));

    return NextResponse.json({
      success: true,
      total_matches: results.length,
      returned: formatted.length,
      query: query || null,
      category: category || null,
      tours: formatted,
      results: formatted, // Backwards compatible with both formats
    });
  } catch (error: any) {
    console.error('[Tours Search API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
