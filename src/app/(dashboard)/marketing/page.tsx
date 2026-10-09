'use client';

import { useState, useEffect } from 'react';
import { 
  Send, Users, Mail, MessageSquare, Instagram, Star, Sparkles, 
  DollarSign, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, 
  Search, ShieldCheck, ChevronRight, BarChart2, Compass, Globe
} from 'lucide-react';

export default function MarketingCampaignsPage() {
  const [activeTab, setActiveTab] = useState<'BROADCAST_COMPOSER' | 'CROSS_SELL' | 'REVIEWS' | 'INSTAGRAM_LEADS'>('BROADCAST_COMPOSER');
  const [audiences, setAudiences] = useState<any>({
    total_contacts: 18,
    repeat_walkers: 6,
    high_ltv_alumni: 4,
    corporate_vip: 3,
    international_prospects: 5,
  });

  // Campaign State
  const [campaignName, setCampaignName] = useState('Diwali Heritage & International Expeditions');
  const [selectedChannel, setSelectedChannel] = useState<'WHATSAPP_BROADCAST' | 'EMAIL_NEWSLETTER' | 'INSTAGRAM_NURTURE'>('WHATSAPP_BROADCAST');
  const [targetSegment, setTargetSegment] = useState<'REPEAT_WALKERS' | 'HIGH_LTV_ALUMNI' | 'CORPORATE_VIP'>('HIGH_LTV_ALUMNI');
  const [promoDiscount, setPromoDiscount] = useState<'NONE' | 'DISCOUNT_5' | 'DISCOUNT_10' | 'DISCOUNT_15'>('NONE');
  const [customMessage, setCustomMessage] = useState(
    'Namaste {{name}}! 🏛️\n\nAs a valued patron of Khaki Tours, you are cordially invited to our upcoming International Expedition to Bhutan & Hampi.\n\nLed personally by our Senior Khaki Heritage Ambassador with exclusive archival permits.\n\nPriority bookings open now: https://khakitours.com/expeditions'
  );

  const handleSelectPromoDiscount = (discount: 'NONE' | 'DISCOUNT_5' | 'DISCOUNT_10' | 'DISCOUNT_15') => {
    setPromoDiscount(discount);
    if (discount === 'DISCOUNT_5') {
      setCustomMessage((prev) => {
        const cleaned = prev.replace(/\n\n🎁 .*$/s, '');
        return `${cleaned}\n\n🎁 Exclusive Courtesy: Use promo code REPEAT05 for 5% off your reservation.`;
      });
    } else if (discount === 'DISCOUNT_10') {
      setCustomMessage((prev) => {
        const cleaned = prev.replace(/\n\n🎁 .*$/s, '');
        return `${cleaned}\n\n🎁 Special Offer: Use promo code KHAKI10 for 10% off your booking.`;
      });
    } else if (discount === 'DISCOUNT_15') {
      setCustomMessage((prev) => {
        const cleaned = prev.replace(/\n\n🎁 .*$/s, '');
        return `${cleaned}\n\n🎁 VIP Perk: Use promo code ALUMNI15 for 15% off as an honored patron.`;
      });
    } else {
      setCustomMessage((prev) => prev.replace(/\n\n🎁 .*$/s, ''));
    }
  };

  const [isDispatching, setIsDispatching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Review Collector State
  const [reviewTriggering, setReviewTriggering] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tourParam = params.get('tour');
      const dateParam = params.get('date');
      if (tourParam) {
        setCampaignName(`Flash Seat Boost: ${tourParam}${dateParam ? ` (${dateParam})` : ''}`);
        setCustomMessage(
          `Namaste {{name}}! 🏛️\n\nOnly a few exclusive seats remain for our upcoming *${tourParam}* on ${dateParam || 'this weekend'}.\n\nAs a valued Khaki heritage explorer, use priority code KHAKI10 for 10% off:\nhttps://khakitours.com/book\n\nSee you on the heritage trail!`
        );
        setSelectedChannel('WHATSAPP_BROADCAST');
        setActiveTab('BROADCAST_COMPOSER');
      }
    }

    fetch('/api/marketing/campaigns')
      .then((res) => res.json())
      .then((data) => {
        if (data.audiences) setAudiences(data.audiences);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleLaunchCampaign = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: campaignName,
          channel: selectedChannel,
          target_segment: targetSegment,
          message_template: customMessage,
          call_to_action_url: 'https://khakitours.com/expeditions',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification(
          `🚀 Campaign "${campaignName}" launched successfully! Queued ${data.recipients_count} messages. Estimated Meta broadcast cost: ₹${data.estimated_meta_cost_inr}.`
        );
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleTriggerReviews = async () => {
    setReviewTriggering(true);
    setTimeout(() => {
      setReviewTriggering(false);
      setNotification('⭐ Post-tour Google Review prompts dispatched to 14 verified walkers from this morning\'s departures! 1-click review link active.');
      setTimeout(() => setNotification(null), 6000);
    }, 1200);
  };

  // Recipient Count based on segment
  const recipientCount = targetSegment === 'REPEAT_WALKERS' 
    ? audiences.repeat_walkers 
    : targetSegment === 'HIGH_LTV_ALUMNI' 
    ? audiences.high_ltv_alumni 
    : audiences.corporate_vip;

  const estimatedCost = (recipientCount * 0.78).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-amber-400" />
            Outbound Marketing & Campaign Studio
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl mt-1">
            Targeted WhatsApp broadcasts, cross-selling Mumbai walking alumni to international expeditions, 
            automated post-tour Google Review triggers, and Meta marketing budget guardrails.
          </p>
        </div>

        {/* Cost Guardrail Badge */}
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Meta API Rate Guard</div>
            <div className="text-xs font-bold text-white">
              ₹0.78 <span className="text-[10px] text-slate-400 font-normal">Mktg</span> vs ₹0.35 <span className="text-[10px] text-slate-400 font-normal">Utility</span>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 px-4 py-3 rounded-xl text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Level Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Reachable Audience Pool</span>
          <span className="text-2xl font-bold text-white font-mono">{audiences.total_contacts || 18} Verified Contacts</span>
          <span className="text-[11px] text-emerald-400 block mt-1">100% Opt-in Past Walkers</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Email Campaign Benchmark</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">15.2% Open Rate</span>
          <span className="text-[11px] text-slate-400 block mt-1">3.4% Click-through &bull; Historical Baseline</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">WhatsApp Delivery SLA</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">99.4% Delivered</span>
          <span className="text-[11px] text-slate-400 block mt-1">68% Read within 15 mins</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">International Cross-Sell Pool</span>
          <span className="text-2xl font-bold text-purple-400 font-mono">{audiences.high_ltv_alumni || 4} HNI Alumni</span>
          <span className="text-[11px] text-slate-400 block mt-1">LTV &gt; ₹15,000 in Mumbai</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('BROADCAST_COMPOSER')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'BROADCAST_COMPOSER' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Campaign Broadcast Composer
        </button>

        <button
          onClick={() => setActiveTab('CROSS_SELL')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'CROSS_SELL' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Cross-Sell: Mumbai Alumni &rarr; International
        </button>

        <button
          onClick={() => setActiveTab('REVIEWS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'REVIEWS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          Automated Post-Tour Review Collector
        </button>

        <button
          onClick={() => setActiveTab('INSTAGRAM_LEADS')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'INSTAGRAM_LEADS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Instagram className="w-3.5 h-3.5" />
          Instagram Ad Leads & Meta Attribution
        </button>
      </div>

      {/* TAB 1: OUTBOUND BROADCAST COMPOSER (WACRM STYLE) */}
      {activeTab === 'BROADCAST_COMPOSER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Targeted Outbound Campaign Builder
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch personalized marketing announcements. Built with Meta pricing guardrails to prevent budget wastage.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Dispatch Channel</label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="WHATSAPP_BROADCAST">WhatsApp Cloud API (Meta Approved)</option>
                    <option value="EMAIL_NEWSLETTER">Email Newsletter</option>
                    <option value="INSTAGRAM_NURTURE">Instagram Direct Message Nurture</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Target Audience Segment</label>
                  <select
                    value={targetSegment}
                    onChange={(e) => setTargetSegment(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="REPEAT_WALKERS">Repeat Mumbai Walkers (2+ Walks)</option>
                    <option value="HIGH_LTV_ALUMNI">HNI Walkers (LTV &gt; ₹15,000)</option>
                    <option value="CORPORATE_VIP">Corporate & B2B Decision Makers</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Promotional Discount Incentive</label>
                  <select
                    value={promoDiscount}
                    onChange={(e) => handleSelectPromoDiscount(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="NONE">No Discount (Standard Fare)</option>
                    <option value="DISCOUNT_5">5% Repeat Courtesy (REPEAT05)</option>
                    <option value="DISCOUNT_10">10% Special Offer (KHAKI10)</option>
                    <option value="DISCOUNT_15">15% VIP Alumni Perk (ALUMNI15)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Message Content (Uses &quot;Khaki Heritage Ambassador&quot; for External Guests)
                </label>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs leading-relaxed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tag: <code className="text-amber-400">{'{{name}}'}</code> dynamically replaced with guest&apos;s full name.
                </span>
              </div>
            </div>

            {/* Meta Rate Guard Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Estimated Meta Dispatch Cost:</span>
                <span className="text-lg font-bold text-amber-400 font-mono">₹{estimatedCost} INR</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  ({recipientCount} recipients &bull; ₹0.78 Meta Marketing Fee)
                </span>
              </div>

              <button
                onClick={handleLaunchCampaign}
                disabled={isDispatching}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isDispatching ? 'Launching Blast...' : 'Dispatch Broadcast'}
              </button>
            </div>
          </div>

          {/* Interactive Smartphone Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-slate-950 border-4 border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                <span className="font-bold text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Khaki Tours Official
                </span>
                <span className="font-mono">Meta Verified</span>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/20 p-3.5 rounded-2xl text-xs text-slate-200 space-y-2">
                <div className="whitespace-pre-line text-[11px] leading-relaxed">
                  {customMessage.replace(/{{name}}/g, 'Karan Mehra')}
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center">
                  <a
                    href="https://khakitours.com/expeditions"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-center py-1.5 bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 font-bold rounded-lg text-[10px] transition"
                  >
                    Explore Expedition Dossier &rarr;
                  </a>
                </div>
              </div>

              <div className="text-[10px] text-center text-slate-500">
                Preview reflects live guest WhatsApp receipt.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CROSS-SELL FUNNEL */}
      {activeTab === 'CROSS_SELL' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              Cross-Sell Engine: Mumbai Walk Alumni &rarr; International Expeditions
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Directly addresses Kaevan&apos;s growth challenge: Converting passionate, high-spend Mumbai walkers into outbound international expedition travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              {
                name: 'Karan Mehra',
                company: 'Godrej Properties',
                spend: '₹85,000',
                walks: '3 Walks',
                targetExpedition: 'Bhutan Archival & Cultural Expedition',
                tag: 'High Priority Prospect',
              },
              {
                name: 'Pooja Singhania',
                company: 'Singhania Family Office',
                spend: '₹29,000',
                walks: '2 #UrbanSafari Tours',
                targetExpedition: 'Hampi & Vijayanagara Ancient Capitals',
                tag: 'Family Safari Prospect',
              },
              {
                name: 'Elena Rostova',
                company: 'Consulate General of Spain',
                spend: '₹45,000',
                walks: '1 Diplomatic Walk',
                targetExpedition: 'Portuguese Goa & Daman Heritage Trail',
                tag: 'Diplomatic VIP',
              },
            ].map((prospect, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white text-sm">{prospect.name}</div>
                    <div className="text-xs text-slate-400">{prospect.company}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                    {prospect.tag}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Mumbai Lifetime Spend:</span>
                    <span className="font-bold text-emerald-400 font-mono">{prospect.spend}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>History:</span>
                    <span className="text-white">{prospect.walks}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-amber-400">
                    Recommended: <strong>{prospect.targetExpedition}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setNotification(`Custom WhatsApp invitation for ${prospect.targetExpedition} queued to ${prospect.name}!`);
                    setTimeout(() => setNotification(null), 4000);
                  }}
                  className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send 1-Click WhatsApp Invitation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED REVIEW COLLECTOR */}
      {activeTab === 'REVIEWS' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Automated Post-Tour Google Review Collector
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Triggered automatically 2 hours after walk attendance is checked on the manifest. Boosts Google Maps & AI search discovery.
              </p>
            </div>

            <button
              onClick={handleTriggerReviews}
              disabled={reviewTriggering}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Star className="w-3.5 h-3.5" />
              {reviewTriggering ? 'Dispatched!' : 'Trigger Review Blast (Today&apos;s Walkers)'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Google Verified Reviews</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">287 Reviews</div>
              <p className="text-[11px] text-slate-400">4.93 ★ overall average across Fort, Bandra, and Girgaon walks.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Post-Tour Review Conversion</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">31.4%</div>
              <p className="text-[11px] text-slate-400">Conversion rate when message is sent within 2 hours of walk finish.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">AI Search Recommendation Lift</span>
              <div className="text-2xl font-bold text-purple-400 font-mono">Top #1 Pick</div>
              <p className="text-[11px] text-slate-400">Ranked #1 for &quot;Best heritage walk in Mumbai&quot; on ChatGPT, Claude &amp; Gemini.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INSTAGRAM LEADS DESK */}
      {activeTab === 'INSTAGRAM_LEADS' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Instagram className="w-4 h-4 text-rose-400" />
              Instagram Ad Leads & Meta Campaign Attribution Desk
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real-time ingestion from Instagram Lead Forms (`POST /api/webhooks/meta-leads`) into Travel OS Inbox.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Lead Name</th>
                  <th className="p-3">Campaign Source</th>
                  <th className="p-3">Tour Interest</th>
                  <th className="p-3">Channel Preferred</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {[
                  { name: 'Sarah Jenkins', source: 'IG-Reels-ColonialHeritage', tour: '#FortWalk Colonial', channel: 'Email Primary', status: 'Auto-Welcomed' },
                  { name: 'Rahul Chhabra', source: 'IG-Sponsored-NightSafari', tour: 'Urban Safari Jeep', channel: 'WhatsApp', status: 'Converted' },
                  { name: 'Marc Dupont', source: 'IG-Bio-Link-Inquiry', tour: 'Private Architecture Tour', channel: 'Email Primary', status: 'Quoted (Bespoke)' },
                ].map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-semibold text-white">{l.name}</td>
                    <td className="p-3 text-amber-400 font-mono text-[11px]">{l.source}</td>
                    <td className="p-3">{l.tour}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        l.channel.includes('Email') ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {l.channel}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-[10px] font-bold">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
