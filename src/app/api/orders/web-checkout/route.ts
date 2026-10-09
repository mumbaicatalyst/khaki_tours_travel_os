import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';
import { DispatchRulesEngine } from '@/modules/dispatch/rules-engine';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';
import { TourType } from '@/types/database';

export const dynamic = 'force-dynamic';

export interface WebOrderPayload {
  order_source?: string;
  order_id?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    company?: string;
  };
  tour_id?: string;
  tour_title: string;
  departure_date: string; // YYYY-MM-DD
  start_time?: string;
  category?: 'STANDARD_WALK' | 'PRIVATE_GROUP' | 'CORPORATE_B2B' | 'INTERNATIONAL';
  group_size: number;
  total_amount_inr: number;
  payment_status?: 'PAID' | 'PAYMENT_PENDING';
  payment_gateway?: string;
  payment_reference?: string;
  jeep_required?: boolean;
  special_requests?: string;
}

/**
 * Universal Inbound Web Order Ingestion Webhook
 * Receives online bookings & private inquiries from khakitours.com website, WooCommerce, Shopify, or Razorpay.
 */
export async function POST(req: NextRequest) {
  try {
    const body: WebOrderPayload = await req.json();

    if (!body.customer?.name || !body.customer?.phone || !body.tour_title || !body.departure_date) {
      return NextResponse.json(
        { error: 'Missing required fields: customer name, phone, tour_title, and departure_date are required' },
        { status: 400 }
      );
    }

    const {
      customer,
      tour_title,
      departure_date,
      start_time = '08:00 AM',
      category = 'STANDARD_WALK',
      group_size = 1,
      total_amount_inr = 899,
      payment_status = 'PAID',
      payment_gateway = 'WEB_CHECKOUT',
      payment_reference,
      jeep_required = false,
      special_requests = '',
    } = body;

    // 1. Calculate Lead Time in Hours
    const depDateTimeStr = `${departure_date.slice(0, 10)}T${start_time.includes(':') ? start_time.split(' ')[0] : '08:00'}:00Z`;
    const depTime = new Date(depDateTimeStr).getTime();
    const nowTime = Date.now();
    const leadTimeHours = Math.max(1, Math.round((depTime - nowTime) / (1000 * 60 * 60)));

    // 2. Evaluate Operating Route via DispatchRulesEngine
    const routeDecision = DispatchRulesEngine.evaluateBookingRoute({
      category: category as TourType,
      leadTimeHours,
      jeepRequired: Boolean(jeep_required || tour_title.toLowerCase().includes('jeep')),
      isCustomRoute: Boolean(special_requests && special_requests.toLowerCase().includes('custom')),
      availableSeats: 25,
      groupSize: Number(group_size) || 1,
    });

    console.log(`[Web Order Ingested] Route Decision: ${routeDecision.operatingPath} for ${customer.name} (${tour_title})`);

    // 3. Upsert Customer in Khaki CRM
    let contact = appStore.getContactById(customer.phone);
    if (!contact) {
      contact = appStore.createContact({
        full_name: customer.name,
        phone_number: customer.phone,
        email: customer.email || '',
        company: customer.company || '',
        segment_tags: [category === 'CORPORATE_B2B' ? 'CORPORATE_VIP' : category === 'PRIVATE_GROUP' ? 'PRIVATE_SAFARI_VIP' : 'WEB_BOOKING'],
        rfm_score: category === 'CORPORATE_B2B' ? 90 : 75,
        lifetime_spend_inr: payment_status === 'PAID' ? total_amount_inr : 0,
        total_bookings: payment_status === 'PAID' ? 1 : 0,
        last_booking_date: departure_date,
        notes: special_requests || `Ingested via ${body.order_source || 'Website Web-Checkout'}`,
      });
    }

    // 4. Branch Execution Based on Operating Path
    let bookingResult: any = null;
    let dispatchesCreated: any[] = [];
    let whatsappResponseText = '';

    // =========================================================
    // BRANCH A: TIER 1 FAST-PATH (Scheduled Public Walking Tour)
    // =========================================================
    if (routeDecision.operatingPath === 'TIER_1_FAST_PATH') {
      bookingResult = appStore.createBooking({
        contact_id: contact.id,
        contact_name: customer.name,
        contact_phone: customer.phone,
        company: customer.company || '',
        tour_title,
        departure_date,
        group_size,
        total_amount_inr,
        amount_paid_inr: payment_status === 'PAID' ? total_amount_inr : 0,
        status: payment_status === 'PAID' ? 'CONFIRMED' : 'PAYMENT_PENDING',
        category: 'STANDARD_WALK',
        payment_method: payment_gateway,
        notes: special_requests || `Web Ref: ${body.order_id || payment_reference || 'DIRECT'}`,
      });

      // Send automated WhatsApp Booking Pass to customer
      whatsappResponseText =
        `🏛️ *KHAKI TOURS • OFFICIAL BOOKING PASS*\n\n` +
        `Hello ${customer.name}! 👋 Your booking for *${tour_title}* is confirmed.\n\n` +
        `• 🎟️ *Booking Ref:* ${bookingResult.booking_reference}\n` +
        `• 📅 *Date & Time:* ${departure_date} at ${start_time}\n` +
        `• 👥 *Party Size:* ${group_size} Guest(s)\n` +
        `• 📍 *Assembly Point:* ${bookingResult.meeting_point || 'Horniman Circle, Fort'}\n\n` +
        `🗺️ Google Maps Navigation: https://maps.google.com/?q=${encodeURIComponent(bookingResult.meeting_point || 'Horniman Circle Fort')}\n\n` +
        `_Please arrive 15 minutes before departure. Your Khaki Heritage Ambassador will meet you at the assembly point. Have a wonderful trail!_`;

      metaWhatsApp.sendTextMessage({
        to: customer.phone,
        text: whatsappResponseText,
      }).catch((err) => console.warn('[WhatsApp Pass Push Failed]:', err));
    }

    // =========================================================
    // BRANCH B: TIER 2 HOLD-TRACK (Private Tour <48h / Jeep / Custom)
    // =========================================================
    else if (routeDecision.operatingPath === 'TIER_2_HOLD_TRACK') {
      bookingResult = appStore.createBooking({
        contact_id: contact.id,
        contact_name: customer.name,
        contact_phone: customer.phone,
        company: customer.company || '',
        tour_title,
        departure_date,
        group_size,
        total_amount_inr,
        amount_paid_inr: 0,
        status: 'PENDING_RESOURCE_LOCK',
        category: category as any,
        payment_method: 'PENDING_RESOURCE_LOCK',
        notes: `Urgent Private Walk (<48h). Locked resources: ${routeDecision.resourceTypesToLock.join(', ')}`,
      });

      // 1. Create Guide Dispatch Request
      const guideDispatch = appStore.createDispatch({
        bookingRef: bookingResult.booking_reference,
        tourTitle: `${tour_title} (Private Group)`,
        category: 'PRIVATE_GROUP',
        resourceType: 'GUIDE',
        entityName: 'Ambassador Pool Broadcast',
        entityRoleOrVehicle: 'Qualified Historian Contractor',
        entityPhone: '+91 98200 11992', // Guide group broadcast
        payoutInr: 2500,
        status: 'BROADCAST_SENT',
        timeLeftMinutes: routeDecision.dispatchTimeoutMinutes || 30,
        channel: 'WHATSAPP_DIRECT',
      });
      dispatchesCreated.push(guideDispatch);

      // 2. Create Vehicle Dispatch Request if Jeep needed
      if (jeep_required || tour_title.toLowerCase().includes('jeep')) {
        const vehicleDispatch = appStore.createDispatch({
          bookingRef: bookingResult.booking_reference,
          tourTitle: `${tour_title} (Open Safari Jeep)`,
          category: 'PRIVATE_GROUP',
          resourceType: 'JEEP',
          entityName: 'Ramesh Gurav',
          entityRoleOrVehicle: 'Vintage Open Jeep (MH 01 DX 4022)',
          entityPhone: '+91 98202 33881',
          payoutInr: 4500,
          status: 'BROADCAST_SENT',
          timeLeftMinutes: routeDecision.dispatchTimeoutMinutes || 30,
          channel: 'WHATSAPP_DIRECT',
        });
        dispatchesCreated.push(vehicleDispatch);
      }

      // Notify customer via WhatsApp that resources are being locked
      whatsappResponseText =
        `🏛️ *KHAKI TOURS • PRIVATE TOUR REQUEST RECEIVED*\n\n` +
        `Hello ${customer.name}! 👋 Thank you for your private tour booking request for *${tour_title}* on *${departure_date}*.\n\n` +
        `• 📋 *Request Ref:* ${bookingResult.booking_reference}\n` +
        `• ⏱️ *Operational Status:* Resource Locking in Progress\n` +
        `• 🧭 *Lead Time:* ${leadTimeHours} Hours (Urgent Priority)\n\n` +
        `Our Operations Desk at Fort, Mumbai is currently locking your senior historian and logistics. You will receive an instant confirmation & secure payment link within 30 minutes!`;

      metaWhatsApp.sendTextMessage({
        to: customer.phone,
        text: whatsappResponseText,
      }).catch((err) => console.warn('[WhatsApp Private Intake Notice Failed]:', err));
    }

    // =========================================================
    // BRANCH C: TIER 2 FAST-TRACK (Standard Private Tour >48h)
    // =========================================================
    else {
      bookingResult = appStore.createBooking({
        contact_id: contact.id,
        contact_name: customer.name,
        contact_phone: customer.phone,
        company: customer.company || '',
        tour_title,
        departure_date,
        group_size,
        total_amount_inr,
        amount_paid_inr: payment_status === 'PAID' ? total_amount_inr : 0,
        status: payment_status === 'PAID' ? 'CONFIRMED' : 'PAYMENT_PENDING',
        category: category as any,
        payment_method: payment_gateway,
        notes: `Private Walk (>48h). Background guide assignment queued.`,
      });

      const guideDispatch = appStore.createDispatch({
        bookingRef: bookingResult.booking_reference,
        tourTitle: `${tour_title} (Private Group)`,
        category: 'PRIVATE_GROUP',
        resourceType: 'GUIDE',
        entityName: 'Senior Historian Queue',
        entityRoleOrVehicle: 'Dedicated Ambassador',
        entityPhone: '+91 98200 11992',
        payoutInr: 2500,
        status: 'UNASSIGNED',
        timeLeftMinutes: 1440, // 24 hours
        channel: 'WHATSAPP_DIRECT',
      });
      dispatchesCreated.push(guideDispatch);
    }

    return NextResponse.json({
      success: true,
      order_id: body.order_id || bookingResult.booking_reference,
      booking: bookingResult,
      operating_path: routeDecision.operatingPath,
      lead_time_hours: leadTimeHours,
      dispatches_created: dispatchesCreated.length,
      dispatches: dispatchesCreated,
      customer_contact_id: contact.id,
      rationale: routeDecision.rationale,
      whatsapp_notified: Boolean(whatsappResponseText),
    }, { status: 201 });
  } catch (error: any) {
    console.error('[Web Checkout Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
