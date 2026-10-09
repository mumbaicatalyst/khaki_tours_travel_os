import { inMemoryCatalog } from '@/lib/supabase/seed';
import { appStore } from '@/lib/db/store';

export interface GeminiConciergeResult {
  replyText: string;
  isHumanTakeoverRequested: boolean;
}

/**
 * Native Google Gemini Concierge Engine for Khaki Tours WhatsApp CRM
 * Powered by Gemini 3.8 Flash with full live catalog, departure schedule, and multi-turn context
 */
export async function queryGeminiConcierge(params: {
  senderPhone: string;
  guestName: string;
  messageText: string;
}): Promise<GeminiConciergeResult> {
  const { senderPhone, guestName, messageText } = params;

  const apiKey = process.env.GEMINI_API_KEY || '';
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }

  // 1. Prepare Live Tour & Schedule Context from live persistent store
  const departures = appStore.getDepartures();
  const tours = appStore.getTours();

  const satSlots = departures.filter((d: any) => d.departure_date === '2026-10-10');
  const sunSlots = departures.filter((d: any) => d.departure_date === '2026-10-11');

  let scheduleSummary = `CURRENT DATE: Friday, 09 October 2026 (Local Mumbai Time: 03:00 AM IST)\n\n`;
  scheduleSummary += `UPCOMING LIVE DEPARTURES (OCTOBER 2026):\n`;
  scheduleSummary += `--- SATURDAY (10 OCT 2026) ---\n`;
  satSlots.forEach((d: any) => {
    scheduleSummary += `• "${d.tour_title}" | Time: ${d.start_time} | Landmark: ${d.meeting_point} | Price: ₹${d.ticket_price_inr} | Seats Available: ${d.available_seats} | Guide: ${d.assigned_guide_name}\n`;
  });
  scheduleSummary += `\n--- SUNDAY (11 OCT 2026) ---\n`;
  sunSlots.forEach((d: any) => {
    scheduleSummary += `• "${d.tour_title}" | Time: ${d.start_time} | Landmark: ${d.meeting_point} | Price: ₹${d.ticket_price_inr} | Seats Available: ${d.available_seats} | Guide: ${d.assigned_guide_name}\n`;
  });

  // Top tours master summary
  let topToursSummary = `POPULAR TOURS IN CATALOG:\n`;
  tours.slice(0, 20).forEach((t: any) => {
    topToursSummary += `• [${t.hashtag || t.tour_id}] ${t.title} | Duration: ${t.duration || '2.5 Hours'} | Price: ₹${t.base_price_inr || 899} | Start: ${t.meeting_landmark || 'South Mumbai'}\n`;
  });

  const systemInstruction = `You are the official WhatsApp Concierge for Khaki Tours, Mumbai's premier heritage storytelling collective founded by Bharat Gothoskar.

YOUR PERSONALITY & TONE:
- Knowledgeable, warm, and professional Mumbai heritage host.
- STRICT GREETING RULE: NEVER start your messages with "Namaste" or "Namaste [Name]". DO NOT repeatedly greet the guest across turns. Dive straight into answering the guest's question directly with zero greeting filler, just like a real person chatting naturally on WhatsApp.
- TERMINOLOGY RULE: When referring to tour leaders, walk hosts, or docents to guests, ALWAYS refer to them as "Khaki Heritage Ambassador" or "Ambassador" (never use the generic word "guide" in guest-facing messages).
- WHATSAPP CONCISENESS RULE: Keep responses concise, conversational, and punchy (strictly under 120-150 words). Do NOT dump the entire tour catalog. When asked about upcoming weekend walks, recommend the top 3 to 4 most relevant departures with clean, scannable bullet points (Tour name, timing, meeting landmark, price). End with one clear call to action.
- Clear, concise, and structured for WhatsApp messaging (use emojis, bullet points, bolding).
- Ensure your response is complete and never ends abruptly or cut off.

LIVE DATA CONTEXT:
${scheduleSummary}

${topToursSummary}

POLICIES:
- Advance Payment: 100% advance payment strictly mandatory before tour.
- Cancellations: >72 hours before start = 50% refund. <72 hours = strictly non-refundable. Company-initiated cancellation = 100% refund.
- Monsoons: Walks operate rain or shine unless an official BMC Red Alert is declared.
- Dress Code: Modest comfortable cotton clothes; knees and shoulders covered for places of worship; comfortable walking shoes.
- Corporate / B2B Offsites: 15-minute response SLA from Founder Bharat Gothoskar. GST 18% with ITC (SAC Code: 998554).
- Booking link: Direct guests to book at https://khakitours.com/calendar or provide ticket price and booking confirmation breakdown.

CRITICAL INSTRUCTIONS:
1. Multi-turn memory: Look at previous conversation turns. If the guest previously inquired about "#BitByNesbit" or Sunday, and now says "Book 2 for 10-11" or "2 tickets please", understand that "10-11" refers to 11th October (Sunday), calculate total cost (e.g. 2 x ₹699 = ₹1,398), confirm their request, and provide booking/payment guidance.
2. If the user asks for a human ("connect me with a human", "talk to human", "speak with someone", "agent", "support"):
   - Reassure them directly: "I've alerted our Operations Desk at Hari Chambers, Fort, Mumbai. An Operations Ambassador is taking over this chat directly!"
   - IMPORTANT: End your message with the exact tag "[HUMAN_TAKEOVER]".
3. Keep answers concise, polite, and direct. Never cut off mid-sentence.`;

  // 2. Fetch recent conversation history from store
  const storedMsgs = appStore.getWhatsAppMessages(senderPhone);
  const recentHistory = storedMsgs.slice(-6);

  const contents: any[] = [];

  for (const m of recentHistory) {
    if (m.sender === 'GUEST') {
      contents.push({
        role: 'user',
        parts: [{ text: m.text }],
      });
    } else if (m.sender === 'BOT' || m.sender === 'HUMAN') {
      contents.push({
        role: 'model',
        parts: [{ text: m.text }],
      });
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: messageText }],
  });

  // 3. Call Google Gemini API with automatic fallback between 3.5 Flash and 3.5 Flash Lite
  const candidateModels = [model, 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  const uniqueModels = Array.from(new Set(candidateModels));

  let data: any = null;
  let lastError: any = null;

  for (const m of uniqueModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 2048,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        }),
      });

      if (response.ok) {
        data = await response.json();
        break;
      } else {
        const errText = await response.text();
        console.warn(`[Gemini API ${m} Status ${response.status}]:`, errText);
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!data) {
    throw new Error(`All Gemini models failed: ${lastError?.message || 'Unavailable'}`);
  }
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  const isHumanTakeoverRequested =
    rawText.includes('[HUMAN_TAKEOVER]') ||
    messageText.toLowerCase().includes('connect me with a human') ||
    messageText.toLowerCase().includes('speak to human') ||
    messageText.toLowerCase().includes('talk to human') ||
    messageText.toLowerCase().includes('human agent') ||
    messageText.toLowerCase().includes('real person');

  // Strip tag from user-facing message
  let cleanedText = rawText.replace(/\[HUMAN_TAKEOVER\]/g, '').trim();

  // Strip repetitive or unwanted leading greetings (e.g. "Namaste Faraz! 🙏", "Namaste!")
  cleanedText = cleanedText.replace(/^Namaste(\s+[A-Za-z]+)?\s*[!.,\s]*([🙏\s]*)?/i, '').trim();
  if (cleanedText.length > 0) {
    cleanedText = cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
  }

  return {
    replyText: cleanedText,
    isHumanTakeoverRequested,
  };
}
