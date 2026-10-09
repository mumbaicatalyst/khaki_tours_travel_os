import { inMemoryCatalog } from '../supabase/seed';
import { appStore } from '../db/store';

export interface ConciergeResponse {
  replyText: string;
  intent: 'AVAILABILITY' | 'TOUR_DETAILS' | 'PRICING' | 'BOOKING' | 'CORPORATE' | 'HUMAN_TAKEOVER' | 'POLICY' | 'GREETING' | 'UNKNOWN';
  shouldMuteBot?: boolean;
}

/**
 * Intelligent Khaki Tours Concierge Engine
 * Understands natural language questions about tour availability, weekend schedules,
 * pricing, itinerary details, corporate bookings, and company policies.
 */
export function generateConciergeReply(params: {
  senderPhone: string;
  guestName: string;
  messageText: string;
  isCorporate?: boolean;
}): ConciergeResponse {
  const { guestName, messageText, isCorporate } = params;
  const lower = messageText.toLowerCase().trim();

  // 1. Human Takeover Intent
  if (
    lower.includes('speak to human') ||
    lower.includes('talk to human') ||
    lower.includes('speak with someone') ||
    lower.includes('human agent') ||
    lower.includes('real person') ||
    lower.includes('customer care') ||
    lower.includes('call me')
  ) {
    return {
      replyText: `👤 *Connecting you with Khaki Tours Operations*\n\nI have alerted our Operations Desk at Hari Chambers, Fort, Mumbai. An Operations Ambassador is reviewing this chat and will reply to you directly right here.\n\n(Bot auto-replies paused)`,
      intent: 'HUMAN_TAKEOVER',
      shouldMuteBot: true,
    };
  }

  // 2. Corporate / Private Group Offsite Intent
  if (
    isCorporate ||
    lower.includes('corporate') ||
    lower.includes('team offsite') ||
    lower.includes('company walk') ||
    lower.includes('executives') ||
    lower.includes('board members') ||
    lower.includes('delegation')
  ) {
    return {
      replyText: `🏢 *Khaki Tours • Executive & Corporate Desk*\n\nThank you for reaching out on behalf of your team.\n\nYour inquiry has been flagged with *P1 Critical Priority* to our Founder *Bharat Gothoskar* and Operations Team:\n• ⏱️ *15-Minute SLA:* A customized proposal will be prepared promptly\n• 📑 *GST Compliant:* SAC Code 998554 (18% GST with full Input Tax Credit)\n• 🏛️ *Experiences:* Bespoke Fort heritage walks, architectural evangelism, or private vintage open jeep safaris for 5 to 150+ guests.\n\nOur team is reviewing your requirements now!`,
      intent: 'CORPORATE',
    };
  }

  // 2.5 Bespoke & Culinary Inquiries (e.g. Irani Chai, Food walks, Parsi trails)
  if (
    lower.includes('irani') ||
    lower.includes('chai') ||
    lower.includes('culinary') ||
    lower.includes('food walk') ||
    lower.includes('bespoke')
  ) {
    return {
      replyText: `☕ *Khaki Tours • Bespoke Culinary & Heritage Experiences*\n\nWhile an Irani Chai private walk is not on our public weekend schedule this week, Khaki Tours custom-curates private walks for groups and families through our Bespoke Tour Studio!\n\n• 🏛️ *Bespoke Studio:* https://khakitours.com/bespoke\n• 🚶 *Upcoming Public Alternatives:* Explore our South Mumbai weekend walks like #BelowTheHill (starting near Cafe Ideal) or #ProcterAndAmble.\n• 🎟️ *Weekend Schedule:* View public departures at https://khakitours.com/calendar\n\nWould you like our Operations Ambassador to connect with you for a bespoke quote?`,
      intent: 'TOUR_DETAILS',
    };
  }

  // 3. Tour Departure Availability / Schedule Queries
  // (e.g. "what tours are available this sunday", "sunday walk", "weekend schedule", "what tours tomorrow")
  const isSundayQuery = lower.includes('sunday') || lower.includes('sun');
  const isSaturdayQuery = lower.includes('saturday') || lower.includes('sat');
  const isWeekendQuery = lower.includes('weekend');
  const isTomorrowQuery = lower.includes('tomorrow');
  const isTodayQuery = lower.includes('today');
  const isGeneralAvailabilityQuery =
    lower.includes('available') ||
    lower.includes('availability') ||
    lower.includes('tours') ||
    lower.includes('walks') ||
    lower.includes('schedule') ||
    lower.includes('calendar') ||
    lower.includes('upcoming');

  const departures = inMemoryCatalog.departures || [];

  if (isSundayQuery || isSaturdayQuery || isWeekendQuery || isTomorrowQuery || isTodayQuery || (isGeneralAvailabilityQuery && (lower.includes('when') || lower.includes('what') || lower.includes('which')))) {
    let targetDate = '';
    let dayLabel = '';

    if (isSundayQuery) {
      targetDate = '2026-10-11';
      dayLabel = 'This Sunday, 11 Oct 2026';
    } else if (isSaturdayQuery) {
      targetDate = '2026-10-10';
      dayLabel = 'This Saturday, 10 Oct 2026';
    } else if (isTomorrowQuery) {
      targetDate = '2026-10-10';
      dayLabel = 'Tomorrow (Saturday, 10 Oct)';
    } else if (isTodayQuery) {
      targetDate = '2026-10-09';
      dayLabel = 'Today (Friday, 09 Oct)';
    }

    if (targetDate) {
      const daySlots = departures.filter((d: any) => d.date === targetDate && d.status === 'OPEN_FOR_BOOKING');

      if (daySlots.length > 0) {
        let scheduleText = `🏛️ *Khaki Tours • Scheduled Departures for ${dayLabel}:*\n\n`;
        daySlots.slice(0, 5).forEach((d: any, idx: number) => {
          const cleanTitle = (d.tour_title || 'Heritage Walk').split('|')[0].trim();
          scheduleText += `${idx + 1}️⃣ *${cleanTitle}*\n`;
          scheduleText += `   ⏰ *Time:* ${d.time}\n`;
          scheduleText += `   📍 *Meeting Point:* ${d.meeting_point}\n`;
          scheduleText += `   🎟️ *Price:* ₹${d.price_inr?.toLocaleString('en-IN') || 899} per person\n`;
          scheduleText += `   🟢 *Availability:* ${d.available_seats || 15} seats remaining\n\n`;
        });

        scheduleText += `👉 *To book:* Reply with the tour number or name (e.g. *"Book 2 passes for Sacred Games"*), or visit https://khakitours.com/calendar to reserve instantly!`;

        return {
          replyText: scheduleText,
          intent: 'AVAILABILITY',
        };
      }
    }

    // If "weekend" requested (both Sat & Sun)
    if (isWeekendQuery || isGeneralAvailabilityQuery) {
      const satSlots = departures.filter((d: any) => d.date === '2026-10-10' && d.status === 'OPEN_FOR_BOOKING');
      const sunSlots = departures.filter((d: any) => d.date === '2026-10-11' && d.status === 'OPEN_FOR_BOOKING');

      let weekendText = `🏛️ *Khaki Tours • Upcoming Weekend Schedule:*\n\n`;
      weekendText += `📅 *SATURDAY (10 Oct):*\n`;
      satSlots.slice(0, 3).forEach((d: any) => {
        const cleanTitle = (d.tour_title || '').split('|')[0].trim();
        weekendText += `• *${cleanTitle}* at ${d.time} (₹${d.price_inr} • ${d.available_seats} seats left)\n`;
      });

      weekendText += `\n📅 *SUNDAY (11 Oct):*\n`;
      sunSlots.slice(0, 3).forEach((d: any) => {
        const cleanTitle = (d.tour_title || '').split('|')[0].trim();
        weekendText += `• *${cleanTitle}* at ${d.time} (₹${d.price_inr} • ${d.available_seats} seats left)\n`;
      });

      weekendText += `\n👉 Reply with any tour name or *"What tours are available this sunday"* for full meeting points and instant booking!`;

      return {
        replyText: weekendText,
        intent: 'AVAILABILITY',
      };
    }
  }

  // 4. Specific Tour Search / Highlights / Pricing Lookup
  const tours = inMemoryCatalog.tours || [];
  const matchedTour = tours.find((t: any) => {
    const tTitle = (t.title || '').toLowerCase();
    const tHashtag = (t.hashtag || '').toLowerCase().replace('#', '');
    const tSlug = (t.slug || '').toLowerCase();

    // Check key keywords
    if (lower.includes('durga') && tTitle.includes('durga')) return true;
    if ((lower.includes('ganpati') || lower.includes('mangal') || lower.includes('murti')) && tTitle.includes('ganpati')) return true;
    if (lower.includes('nesbit') && tTitle.includes('nesbit')) return true;
    if (lower.includes('sacred') && tTitle.includes('sacred')) return true;
    if (lower.includes('fort walk') && tTitle.includes('fort')) return true;
    if ((lower.includes('jeep') || lower.includes('safari')) && (tTitle.includes('jeep') || tTitle.includes('safari'))) return true;
    if (lower.includes('opera') && tTitle.includes('opera')) return true;
    if (lower.includes('bandra') && tTitle.includes('bandra')) return true;

    return (
      (tHashtag.length > 3 && lower.includes(tHashtag)) ||
      (tSlug.length > 4 && lower.includes(tSlug))
    );
  });

  if (matchedTour) {
    const highlights = (matchedTour.route_highlights || []).slice(0, 3).join(', ');
    const price = matchedTour.base_price_inr || matchedTour.price_inr || 899;

    let tourDetails = `🏛️ *${matchedTour.title}*\n\n`;
    tourDetails += `⏳ *Duration:* ${matchedTour.duration || '2.5 Hours'} | 🚶 *Distance:* ${matchedTour.distance || '2.0 Kms'}\n`;
    tourDetails += `📍 *Starting Landmark:* ${matchedTour.meeting_landmark || matchedTour.starting_point || 'South Mumbai'}\n`;
    tourDetails += `🎟️ *Ticket Price:* ₹${price.toLocaleString('en-IN')} per person\n\n`;

    if (highlights) {
      tourDetails += `✨ *Key Highlights:* ${highlights}\n\n`;
    }

    if (matchedTour.description) {
      const summary = matchedTour.description.slice(0, 180).trim();
      tourDetails += `📖 *Overview:* ${summary}...\n\n`;
    }

    // Check if any departures are scheduled for this tour
    const upcomingForThisTour = departures.filter(
      (d: any) => d.tour_id === matchedTour.tour_id || d.tour_title?.includes(matchedTour.clean_title || matchedTour.title)
    );

    if (upcomingForThisTour.length > 0) {
      tourDetails += `📅 *Next Scheduled Departures:*\n`;
      upcomingForThisTour.slice(0, 2).forEach((d: any) => {
        tourDetails += `• ${d.date} at ${d.time} (${d.available_seats} seats remaining)\n`;
      });
      tourDetails += `\n`;
    }

    tourDetails += `👉 Would you like to reserve seats? Reply with the number of guests (e.g. *"Book 2 seats"*), or book online at: https://khakitours.com/calendar`;

    return {
      replyText: tourDetails,
      intent: 'TOUR_DETAILS',
    };
  }

  // 5. Booking Intent
  if (
    lower.includes('how to book') ||
    lower.includes('book ticket') ||
    lower.includes('book pass') ||
    lower.includes('reserve') ||
    lower.includes('registration')
  ) {
    return {
      replyText: `🎟️ *How to Book Your Khaki Tour Pass:*\n\n1️⃣ *Choose Your Walk:* Let us know which tour & date you'd like (e.g. *"#SacredGames this Sunday"*)\n2️⃣ *Number of Guests:* Tell us your party size\n3️⃣ *Instant Confirmation:* We will send you an instant UPI QR payment link or secure booking pass.\n\n📱 You can also browse all live departures and book directly at: https://khakitours.com/calendar\n\n*Advance Booking Policy:* 100% advance payment is required to confirm seats.`,
      intent: 'BOOKING',
    };
  }

  // 6. Policy Questions (Refund, Rain, Dress Code, Timings)
  if (lower.includes('refund') || lower.includes('cancellation') || lower.includes('cancel')) {
    return {
      replyText: `ℹ️ *Khaki Tours Cancellation & Refund Policy:*\n\n• *More than 72 hours before tour:* 50% refund.\n• *Less than 72 hours before tour:* No refund (strictly non-refundable due to limited group sizes).\n• *Company-Initiated Cancellation:* If Khaki Tours cancels due to weather or operational reasons, you receive a 100% full refund.\n\nRefunds are processed to the original payment method within 30 days.`,
      intent: 'POLICY',
    };
  }

  if (lower.includes('rain') || lower.includes('monsoon') || lower.includes('weather')) {
    return {
      replyText: `☔ *Monsoon & Weather Policy:*\n\nKhaki Tours walks operate *rain or shine*! Mumbai monsoons bring a wonderful historic charm to the city's stone facades.\n\n• Tours proceed normally unless an official *Red Alert* is issued by the BMC / IMD.\n• We recommend carrying an umbrella or light raincoat and wearing footwear with good grip.`,
      intent: 'POLICY',
    };
  }

  if (lower.includes('dress code') || lower.includes('what to wear') || lower.includes('shoes') || lower.includes('clothing')) {
    return {
      replyText: `👟 *Dress Code & Walker Guidelines:*\n\n• Wear comfortable, modest cotton clothing and supportive walking shoes.\n• When visiting religious places (temples, agiaries, mosques, churches), knees and shoulders must be covered, and footwear removal may be required.\n• Please arrive at the meeting point 15 minutes before the scheduled start time!`,
      intent: 'POLICY',
    };
  }

  // 7. General Welcome / Conversational Greetings
  return {
    replyText: `Hello ${guestName}! Welcome to Khaki Tours, Mumbai's premier heritage storytelling collective.\n\nHere are a few quick things you can ask me:\n• 📅 *"What tours are available this sunday?"*\n• 🗓️ *"What is the schedule for this weekend?"*\n• 🚶 *"Tell me about #BitByNesbit or #DurgasOf"*` +
      `\n• 🚙 *"Tell me about the vintage open jeep safari"*\n• 🏢 *"Corporate offsite for my company"*\n• 👤 *"Connect me with a human agent"*\n\nHow can I help you explore Mumbai today?`,
    intent: 'GREETING',
  };
}
