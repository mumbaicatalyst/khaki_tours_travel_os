import { NextRequest, NextResponse } from 'next/server';
import { inMemoryCatalog } from '@/lib/supabase/seed';
import { whatsappClient } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');

    let vendors = inMemoryCatalog.vendors;
    if (type) {
      vendors = vendors.filter((v: any) => v.vendor_type === type);
    }

    return NextResponse.json({
      success: true,
      count: vendors.length,
      vendors,
    });
  } catch (error: any) {
    console.error('[Vendors API] Error retrieving vendors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      vendor_id,
      booking_ref,
      service_name,
      scheduled_time,
      pickup_landmark,
      pax_count,
      payout_inr,
    } = body;

    const vendor = inMemoryCatalog.vendors.find((v: any) => v.id === vendor_id);
    if (!vendor) {
      return NextResponse.json({ error: `Vendor ${vendor_id} not found` }, { status: 404 });
    }

    // Zero-Login WhatsApp dispatch
    const bodyText =
      `Namaste ${vendor.name}!\n\n` +
      `Khaki Tours Vehicle / Service Dispatch:\n` +
      `• *Booking Ref:* ${booking_ref || 'KT-BKG-GEN'}\n` +
      `• *Service:* ${service_name || vendor.active_tours?.[0] || 'Heritage Tour'}\n` +
      `• *Vehicle:* ${vendor.vehicle_or_vessel_number}\n` +
      `• *Pickup Landmark:* ${pickup_landmark || vendor.base_location}\n` +
      `• *Time:* ${scheduled_time || 'Tomorrow Morning'}\n` +
      `• *Guests:* ${pax_count || 4} Pax\n` +
      `• *Contract Rate:* ₹${payout_inr || vendor.per_tour_rate_inr}\n\n` +
      `Please tap your confirmation below (Zero-portal login needed):`;

    const response = await whatsappClient.sendDispatchButtonPrompt({
      to: vendor.contact_phone,
      headerText: '🚙 Khaki Tours: Logistics Order',
      bodyText,
      footerText: 'Khaki Operations Desk',
      buttons: [
        { id: `VENDOR_ACCEPT_${booking_ref}_${vendor.id}`, title: '✅ Confirm Available' },
        { id: `VENDOR_DECLINE_${booking_ref}_${vendor.id}`, title: '❌ Unavailable' },
      ],
    });

    return NextResponse.json({
      success: true,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      target_phone: vendor.contact_phone,
      preferred_channel: vendor.preferred_channel,
      whatsapp_status: response.success ? 'SENT' : 'FAILED',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Vendors API] Error dispatching vendor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
