export type LeadPriorityTier = 'P1_CRITICAL_CORPORATE' | 'P2_HIGH_URGENT' | 'P3_STANDARD';

export interface LeadClassificationInput {
  messageContent: string;
  senderPhone: string;
  senderEmail?: string;
  senderName?: string;
  groupSize?: number;
  leadTimeHours?: number;
  channel?: 'WHATSAPP' | 'VOICE_CALL' | 'WEB_FORM';
}

export interface LeadPriorityResult {
  tier: LeadPriorityTier;
  priorityScore: number; // 0 to 100
  isCorporate: boolean;
  isAfterHours: boolean;
  businessHoursStatus: 'OPEN' | 'AFTER_HOURS' | 'WEEKEND';
  detectedOrganization?: string;
  matchedKeywords: string[];
  slaResponseMinutes: number;
  effectiveSlaStartTime: string;
  assignedRole: 'BHARAT_FOUNDER' | 'PRIYA_OPS_LEAD' | 'CORPORATE_DESK' | 'STANDARD_BOT';
  escalationReason: string;
  requiresInstantMobileAlert: boolean;
  afterHoursAutoReplyText?: string;
}

export class PriorityClassifier {
  // Configurable Corporate Organization Watchlist
  private static CORPORATE_WATCHLIST = [
    'godrej',
    'mahindra',
    'tata',
    'reliance',
    'hdfc',
    'kotak',
    'google',
    'microsoft',
    'mckinsey',
    'bcg',
    'bain',
    'consulate',
    'embassy',
    'school',
    'college',
    'university',
    'delegation',
    'offsite',
    'team building',
    'corporate',
    'leadership',
    'expatriate',
    'expats',
    'clients visiting',
  ];

  // Configurable Urgency Keywords
  private static URGENCY_KEYWORDS = [
    'this weekend',
    'today',
    'tomorrow',
    'tonight',
    'urgent',
    'asap',
    'immediate',
    'arriving tomorrow',
    'vip',
  ];

  /**
   * Evaluates an incoming message, call transcript, or web enquiry
   * and classifies criticality, corporate flags, and response SLAs.
   */
  static classifyLead(input: LeadClassificationInput): LeadPriorityResult {
    const text = input.messageContent.toLowerCase();
    const email = (input.senderEmail || '').toLowerCase();
    const matchedCorpKeywords: string[] = [];
    const matchedUrgentKeywords: string[] = [];

    // 1. Check corporate keywords
    for (const kw of this.CORPORATE_WATCHLIST) {
      if (text.includes(kw) || email.includes(kw)) {
        matchedCorpKeywords.push(kw);
      }
    }

    // Check business email domain (non-gmail, non-yahoo, non-hotmail)
    const isBusinessEmail =
      email.includes('@') &&
      !email.endsWith('@gmail.com') &&
      !email.endsWith('@yahoo.com') &&
      !email.endsWith('@hotmail.com') &&
      !email.endsWith('@outlook.com');

    if (isBusinessEmail) {
      matchedCorpKeywords.push('business_email_domain');
    }

    // 2. Check urgency keywords
    for (const kw of this.URGENCY_KEYWORDS) {
      if (text.includes(kw)) {
        matchedUrgentKeywords.push(kw);
      }
    }

    const isCorporate = matchedCorpKeywords.length > 0;
    const isUrgentLeadTime = (input.leadTimeHours !== undefined && input.leadTimeHours <= 48) || matchedUrgentKeywords.length > 0;
    const isMediumGroup = (input.groupSize || 1) >= 6;

    // Detect likely organization name
    let detectedOrg: string | undefined;
    for (const kw of ['godrej', 'mahindra', 'tata', 'reliance', 'consulate']) {
      if (text.includes(kw) || email.includes(kw)) {
        detectedOrg = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }

    // -------------------------------------------------------------
    // BUSINESS HOURS & AFTER-HOURS EVALUATION
    // Operating Hours: Mon-Sat 09:00 - 20:00 IST | Sun 10:00 - 18:00 IST
    // -------------------------------------------------------------
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffsetMs);
    const dayOfWeek = istDate.getDay(); // 0 is Sunday, 6 is Saturday
    const currentHour = istDate.getHours();
    const currentMin = istDate.getMinutes();
    const timeInHours = currentHour + currentMin / 60;

    let businessHoursStatus: 'OPEN' | 'AFTER_HOURS' | 'WEEKEND' = 'OPEN';
    let isAfterHours = false;

    if (dayOfWeek === 0) {
      // Sunday
      if (timeInHours < 10 || timeInHours >= 18) {
        businessHoursStatus = 'AFTER_HOURS';
        isAfterHours = true;
      } else {
        businessHoursStatus = 'WEEKEND';
      }
    } else {
      // Monday to Saturday
      if (timeInHours < 9 || timeInHours >= 20) {
        businessHoursStatus = 'AFTER_HOURS';
        isAfterHours = true;
      }
    }

    // Calculate effective SLA start time: if after hours, starts next morning at 9:00 AM IST
    let effectiveSlaStartTime = now.toISOString();
    let afterHoursReply: string | undefined;

    if (isAfterHours) {
      const nextMorning = new Date(istDate);
      if (timeInHours >= 20 || (dayOfWeek === 0 && timeInHours >= 18)) {
        nextMorning.setDate(nextMorning.getDate() + 1);
      }
      nextMorning.setHours(9, 0, 0, 0);
      effectiveSlaStartTime = nextMorning.toISOString();

      afterHoursReply =
        `Namaste! Thank you for contacting Khaki Tours.\n\n` +
        `🏛️ *Our Operations Desk is currently resting for the night.* (Hours: 9:00 AM – 8:00 PM IST)\n` +
        `Our team will personally review your inquiry at 9:00 AM tomorrow.\n\n` +
        `⚡ *Good News: You can book instantly 24/7!* Our automated booking engine is live right now:\n` +
        `• Browse upcoming departures: https://khakitours.com/calendar\n` +
        `• Check live seat availability & pay via instant UPI QR\n` +
        `• Your confirmed ticket & Google Maps meeting pin will arrive immediately on WhatsApp.`;
    }

    // -------------------------------------------------------------
    // SCORING & TIER ASSIGNMENT
    // -------------------------------------------------------------
    if (isCorporate) {
      return {
        tier: 'P1_CRITICAL_CORPORATE',
        priorityScore: 95,
        isCorporate: true,
        isAfterHours,
        businessHoursStatus,
        detectedOrganization: detectedOrg,
        matchedKeywords: [...matchedCorpKeywords, ...matchedUrgentKeywords],
        slaResponseMinutes: isAfterHours ? 60 : 15, // 15 mins during day, 60 mins from 9am if overnight
        effectiveSlaStartTime,
        assignedRole: detectedOrg ? 'BHARAT_FOUNDER' : 'CORPORATE_DESK',
        escalationReason: isAfterHours
          ? `High-LTV Corporate lead received AFTER-HOURS (${detectedOrg || 'B2B'}). Queued for 9:00 AM founder review.`
          : `Corporate relationship detected (${detectedOrg || 'B2B Inquiry'}). High lifetime customer value.`,
        requiresInstantMobileAlert: !isAfterHours, // Avoid buzzing founder at 2am unless urgent
        afterHoursAutoReplyText: afterHoursReply,
      };
    }

    if (isUrgentLeadTime || isMediumGroup) {
      return {
        tier: 'P2_HIGH_URGENT',
        priorityScore: 75,
        isCorporate: false,
        isAfterHours,
        businessHoursStatus,
        matchedKeywords: matchedUrgentKeywords,
        slaResponseMinutes: isAfterHours ? 120 : 30,
        effectiveSlaStartTime,
        assignedRole: 'PRIYA_OPS_LEAD',
        escalationReason: isUrgentLeadTime
          ? 'Urgent departure requested (<48h lead time).'
          : `Group inquiry of ${input.groupSize} guests.`,
        requiresInstantMobileAlert: !isAfterHours,
        afterHoursAutoReplyText: afterHoursReply,
      };
    }

    return {
      tier: 'P3_STANDARD',
      priorityScore: 30,
      isCorporate: false,
      isAfterHours,
      businessHoursStatus,
      matchedKeywords: [],
      slaResponseMinutes: 120, // 2-hour SLA for standard retail chats
      effectiveSlaStartTime,
      assignedRole: 'STANDARD_BOT',
      escalationReason: 'Standard scheduled walking tour query handled by 24/7 fast-path bot.',
      requiresInstantMobileAlert: false,
      afterHoursAutoReplyText: afterHoursReply,
    };
  }

  /**
   * Check if a conversation has breached its SLA and is now "STALE"
   */
  static evaluateSlaStatus(lastMessageAt: string, slaMinutes: number): {
    isStale: boolean;
    minutesElapsed: number;
    minutesRemaining: number;
    statusLabel: string;
  } {
    const elapsed = Math.round((Date.now() - new Date(lastMessageAt).getTime()) / (60 * 1000));
    const remaining = slaMinutes - elapsed;

    if (remaining <= 0) {
      return {
        isStale: true,
        minutesElapsed: elapsed,
        minutesRemaining: 0,
        statusLabel: `STALE: ${Math.abs(remaining)}m overdue`,
      };
    }

    return {
      isStale: false,
      minutesElapsed: elapsed,
      minutesRemaining: remaining,
      statusLabel: `SLA: ${remaining}m left`,
    };
  }
}
