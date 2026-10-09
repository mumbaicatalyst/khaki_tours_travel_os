import { NextRequest, NextResponse } from 'next/server';
import { appStore } from '@/lib/db/store';
import { metaWhatsApp } from '@/lib/whatsapp/meta-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const settings = appStore.getReviewSettings();
    const queues = appStore.getReviewQueues();

    return NextResponse.json({
      success: true,
      settings,
      queues,
    });
  } catch (err: any) {
    console.error('[Reviews API GET Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. UPDATE SETTINGS
    if (action === 'UPDATE_SETTINGS') {
      const updated = appStore.updateReviewSettings({
        googleReviewUrl: body.googleReviewUrl,
        automationMode: body.automationMode,
        enabled: body.enabled !== undefined ? body.enabled : true,
      });
      return NextResponse.json({ success: true, settings: updated });
    }

    // 2. STAGE DEPARTURE FROM MANIFEST
    if (action === 'STAGE_DEPARTURE') {
      const { departureId, tourTitle, guideName, recipients, scheduledDispatchAt } = body;
      if (!departureId || !recipients) {
        return NextResponse.json({ success: false, error: 'departureId and recipients required' }, { status: 400 });
      }

      const settings = appStore.getReviewSettings();
      let scheduledAt = scheduledDispatchAt;
      
      if (!scheduledAt) {
        if (settings.automationMode === 'INSTANT') {
          scheduledAt = new Date().toISOString();
        } else {
          // 2 Hours default
          scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        }
      }

      const staged = appStore.stageDepartureForReviews({
        departureId,
        tourTitle: tourTitle || 'Heritage Walk',
        guideName: guideName || 'Core Ambassador',
        recipients,
        scheduledDispatchAt: scheduledAt,
      });

      // If INSTANT mode, trigger immediate dispatch
      if (settings.automationMode === 'INSTANT') {
        const dispatchResult = await dispatchRecipients(
          staged.recipients.filter((r) => r.eligible),
          staged.tour_title,
          staged.guide_name,
          settings.googleReviewUrl
        );
        appStore.updateReviewQueueStatus(staged.id, 'DISPATCHED');
        return NextResponse.json({
          success: true,
          queue: staged,
          dispatchedImmediate: true,
          ...dispatchResult,
        });
      }

      return NextResponse.json({ success: true, queue: staged });
    }

    // 3. CANCEL QUEUE
    if (action === 'CANCEL_QUEUE') {
      const { queueId } = body;
      if (!queueId) {
        return NextResponse.json({ success: false, error: 'queueId required' }, { status: 400 });
      }
      const ok = appStore.updateReviewQueueStatus(queueId, 'CANCELLED');
      return NextResponse.json({ success: ok });
    }

    // 4. DISPATCH STAGED QUEUE OR DIRECT BLAST
    if (action === 'DISPATCH_QUEUE' || action === 'DISPATCH_BLAST') {
      const settings = appStore.getReviewSettings();
      const reviewUrl = body.googleReviewUrl || settings.googleReviewUrl;
      const queues = appStore.getReviewQueues();

      let targetRecipients: Array<{ name: string; phone: string; eligible?: boolean }> = [];
      let tourTitle = 'Khaki Tours Heritage Walk';
      let guideName = 'Bharat Gothoskar & Khaki Historians';

      if (body.queueId) {
        const queue = queues.find((q) => q.id === body.queueId);
        if (!queue) {
          return NextResponse.json({ success: false, error: 'Queue not found' }, { status: 404 });
        }
        targetRecipients = queue.recipients.filter((r) => r.eligible);
        tourTitle = queue.tour_title;
        guideName = queue.guide_name;
        appStore.updateReviewQueueStatus(queue.id, 'DISPATCHED');
      } else if (body.recipients && Array.isArray(body.recipients)) {
        targetRecipients = body.recipients.filter((r: any) => r.eligible !== false);
        tourTitle = body.tourTitle || tourTitle;
        guideName = body.guideName || guideName;
      } else {
        // Dispatches to all verified walkers from recent manifest attendees
        const allDeps = appStore.getDepartures();
        for (const dep of allDeps.slice(0, 3)) {
          const manifest = appStore.getManifestForDeparture(dep.id || dep.departure_id);
          if (manifest && manifest.guests) {
            const attended = manifest.guests.filter((g: any) => g.attended);
            attended.forEach((g: any) => {
              if (g.phone && !targetRecipients.some((r) => r.phone === g.phone)) {
                targetRecipients.push({
                  name: g.full_name || 'Valued Walker',
                  phone: g.phone,
                });
              }
            });
            if (!tourTitle || tourTitle === 'Khaki Tours Heritage Walk') {
              tourTitle = dep.tour_title;
              guideName = dep.assigned_guide_name || guideName;
            }
          }
        }
      }

      if (targetRecipients.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No eligible checked-in walkers found to send review requests.',
        });
      }

      const result = await dispatchRecipients(targetRecipients, tourTitle, guideName, reviewUrl);

      return NextResponse.json({
        success: true,
        dispatchedCount: result.dispatchedCount,
        failedCount: result.failedCount,
        details: result.details,
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error('[Reviews API POST Error]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * Helper to dispatch formatted WhatsApp Google Review requests
 */
async function dispatchRecipients(
  recipients: Array<{ name: string; phone: string }>,
  tourTitle: string,
  guideName: string,
  reviewUrl: string
) {
  let dispatchedCount = 0;
  let failedCount = 0;
  const details: any[] = [];

  for (const r of recipients) {
    if (!r.phone) continue;

    const messageText = 
`Namaste ${r.name.split(' ')[0]}! 🏛️

Thank you for walking with Khaki Tours on *${tourTitle}* with ${guideName}! We hope you discovered Mumbai's vibrant heritage and untold stories.

If you enjoyed your time with our historians, could you take 30 seconds to share your review on Google? Your review helps fellow travelers discover authentic heritage walks:

⭐ *Leave a Google Review:*
${reviewUrl}

See you on the heritage trail soon!
— Team Khaki Tours`;

    const res = await metaWhatsApp.sendTextMessage({
      to: r.phone,
      text: messageText,
    });

    // Record outbound review prompt in store
    appStore.recordWhatsAppMessage({
      phone: r.phone,
      sender: 'HUMAN',
      text: messageText,
      messageId: res.messageId,
      status: res.success ? 'DELIVERED' : 'FAILED',
      metadata: {
        isReviewPrompt: true,
        reviewUrl,
        error: res.error,
      },
    });

    if (res.success) {
      dispatchedCount++;
    } else {
      failedCount++;
    }

    details.push({
      name: r.name,
      phone: r.phone,
      success: res.success,
      error: res.error,
      messageId: res.messageId,
    });
  }

  return { dispatchedCount, failedCount, details };
}
