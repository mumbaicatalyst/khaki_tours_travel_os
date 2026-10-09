/**
 * xAI Grok Fallback Engine for Khaki Travel OS
 * Provides secondary LLM failover when Google Gemini hits rate limits (429) or timeouts.
 * Supports OpenAI-compatible endpoint at https://api.x.ai/v1/chat/completions.
 */

export interface GrokConciergeParams {
  systemInstruction: string;
  history?: Array<{ sender: 'GUEST' | 'BOT' | 'HUMAN'; text: string }>;
  messageText: string;
}

export async function queryGrokConcierge(params: GrokConciergeParams): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) {
    console.log('[Grok Fallback Skipped] No XAI_API_KEY or GROK_API_KEY configured in environment.');
    return null;
  }

  const { systemInstruction, history = [], messageText } = params;

  // Build OpenAI-compatible chat messages
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: systemInstruction,
    },
  ];

  for (const m of history) {
    if (m.sender === 'GUEST') {
      messages.push({
        role: 'user',
        content: `<untrusted_guest_message>${m.text}</untrusted_guest_message>`,
      });
    } else if (m.sender === 'BOT' || m.sender === 'HUMAN') {
      messages.push({
        role: 'assistant',
        content: m.text,
      });
    }
  }

  messages.push({
    role: 'user',
    content: `<untrusted_guest_message>${messageText}</untrusted_guest_message>`,
  });

  // Try Grok model candidates in order of speed and tier availability
  const candidateModels = ['grok-2-mini', 'grok-2', 'grok-beta'];

  for (const model of candidateModels) {
    try {
      console.log(`[Invoking xAI Grok Fallback] Model: ${model}`);
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          max_tokens: 1024,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && typeof content === 'string') {
          console.log(`[xAI Grok Response Received via ${model}]`);
          return content;
        }
      } else {
        const errText = await response.text();
        console.warn(`[xAI Grok ${model} Status ${response.status}]:`, errText.slice(0, 150));
      }
    } catch (err: any) {
      console.warn(`[xAI Grok ${model} Fetch Error]:`, err.message || err);
    }
  }

  return null;
}
