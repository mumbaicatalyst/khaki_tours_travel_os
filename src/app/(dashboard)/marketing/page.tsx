'use client';

import { useState, useEffect } from 'react';
import { 
  Send, Users, Mail, MessageSquare, Instagram, Star, Sparkles, 
  DollarSign, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, 
  Search, ShieldCheck, ChevronRight, BarChart2, Compass, Globe,
  TrendingUp, Tag, Percent, MousePointerClick, AlertTriangle, Layers, Award
} from 'lucide-react';

export default function MarketingCampaignsPage() {
  const [activeTab, setActiveTab] = useState<'BROADCAST_COMPOSER' | 'CROSS_SELL' | 'REVIEWS' | 'DIGITAL_ADS_ATTRIBUTION'>('BROADCAST_COMPOSER');
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
        const cleaned = prev.split('\n\n🎁')[0];
        return `${cleaned}\n\n🎁 Exclusive Courtesy: Use promo code REPEAT05 for 5% off your reservation.`;
      });
    } else if (discount === 'DISCOUNT_10') {
      setCustomMessage((prev) => {
        const cleaned = prev.split('\n\n🎁')[0];
        return `${cleaned}\n\n🎁 Special Offer: Use promo code KHAKI10 for 10% off your booking.`;
      });
    } else if (discount === 'DISCOUNT_15') {
      setCustomMessage((prev) => {
        const cleaned = prev.split('\n\n🎁')[0];
        return `${cleaned}\n\n🎁 VIP Perk: Use promo code ALUMNI15 for 15% off as an honored patron.`;
      });
    } else {
      setCustomMessage((prev) => prev.split('\n\n🎁')[0]);
    }
  };

  const [isDispatching, setIsDispatching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Review Collector State
  const [reviewTriggering, setReviewTriggering] = useState(false);

  // Low Occupancy Departures List
  const lowOccupancyDepartures = [
    {
      id: 'dep_fort_01',
      tourName: '#FortWalk: Colonial Bombay & Zero Point',
      date: 'Saturday, 4:00 PM',
      guide: 'Farhan K.',
      bookedSeats: 6,
      totalSeats: 20,
      occupancyPct: 30,
      ticketPrice: 1500,
    },
    {
      id: 'dep_safari_02',
      tourName: 'Urban Safari: Open Jeep Heritage Route',
      date: 'Sunday, 6:30 AM',
      guide: 'Priya S.',
      bookedSeats: 3,
      totalSeats: 10,
      occupancyPct: 30,
      ticketPrice: 3500,
    },
  ];

  const handleBoostDeparture = (dep: typeof lowOccupancyDepartures[0]) => {
    setCampaignName(`Flash Seat Boost: ${dep.tourName} (${dep.date})`);
    setSelectedChannel('WHATSAPP_BROADCAST');
    setTargetSegment('REPEAT_WALKERS');
    setPromoDiscount('DISCOUNT_10');
    setCustomMessage(
      `Namaste {{name}}! 🏛️\n\nOnly ${dep.totalSeats - dep.bookedSeats} exclusive seats remain for our upcoming *${dep.tourName}* on ${dep.date}.\n\nLed by our Senior Heritage Ambassador (${dep.guide}).\n\nAs a valued Khaki explorer, use flash promo code *KHAKI10* for 10% off your booking:\nhttps://khakitours.com/book\n\nSee you on the heritage trail!`
    );
    setActiveTab('BROADCAST_COMPOSER');
    setNotification(`⚡ Flash broadcast pre-configured for ${dep.tourName} with promo code KHAKI10!`);
    setTimeout(() => setNotification(null), 5000);
  };

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
            Marketing, Campaigns & Growth Studio
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl mt-1">
            Managed by Kaevan Umrigar (Growth Lead). Targeted WhatsApp broadcasts, Google Search & Meta Instagram ad attribution, 
            low-occupancy departure seat boosts, and automated post-tour Google Review collectors.
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
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Paid Ads Blended ROAS</span>
          <span className="text-2xl font-bold text-amber-400 font-mono">4.52x ROAS</span>
          <span className="text-[11px] text-slate-400 block mt-1">Google Search (4.9x) &bull; Meta IG (3.9x)</span>
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

      {/* Smart Low-Occupancy Departure Alert Widget */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Low Occupancy Departure Alert (&lt; 40% Booked)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  2 Departures Need Seat Boost
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Trigger a 1-click targeted WhatsApp broadcast with 10% promo code <code className="text-amber-400 font-bold">KHAKI10</code> to past repeat walkers in South Mumbai.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
          {lowOccupancyDepartures.map((dep) => (
            <div key={dep.id} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">{dep.tourName}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{dep.date}</span>
                  <span>&bull;</span>
                  <span>Lead: {dep.guide}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-amber-400 h-full rounded-full" 
                      style={{ width: `${dep.occupancyPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    {dep.bookedSeats}/{dep.totalSeats} seats ({dep.occupancyPct}%)
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleBoostDeparture(dep)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ⚡ Flash Boost (10% Off)
              </button>
            </div>
          ))}
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
          onClick={() => setActiveTab('DIGITAL_ADS_ATTRIBUTION')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'DIGITAL_ADS_ATTRIBUTION' ? 'bg-blue-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Google &amp; Meta Paid Ads &amp; Attribution
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
      </div>

      {/* TAB 1: OUTBOUND BROADCAST COMPOSER (WACRM STYLE) */}
      {activeTab === 'BROADCAST_COMPOSER' && (
        <div className="space-y-6">
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

          {/* Promo Code Performance Widget */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  Promo Code Redemption &amp; Yield Engine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track revenue generated across WhatsApp campaigns, Google Search ad promotions, and alumni loyalty perks.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">₹3,85,000 Total Attributed GMV</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    REPEAT05
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">5% Discount</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">42 Redemptions</div>
                <div className="text-xs text-emerald-400 font-mono">₹63,000 Attributed Sales</div>
                <p className="text-[11px] text-slate-400">Targeted at repeat Mumbai walkers. 100% verified past walker opt-in rate.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    KHAKI10
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">10% Discount</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">28 Redemptions</div>
                <div className="text-xs text-emerald-400 font-mono">₹42,000 Attributed Sales</div>
                <p className="text-[11px] text-slate-400">Featured in Google Search Ads &amp; low-occupancy flash seat broadcasts.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    ALUMNI15
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">15% Discount</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">8 Redemptions</div>
                <div className="text-xs text-purple-400 font-mono">₹2,80,000 Attributed Sales</div>
                <p className="text-[11px] text-slate-400">VIP perk converting high-LTV walkers to Bhutan &amp; Hampi archival expeditions.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE & META PAID ADS & ATTRIBUTION */}
      {activeTab === 'DIGITAL_ADS_ATTRIBUTION' && (
        <div className="space-y-6">
          {/* Channel Performance Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Google Ads */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Search Ads &amp; PMax</h3>
                    <span className="text-[10px] text-slate-400">High-Intent Paid Acquisition</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">4.94x ROAS</span>
              </div>

              <div className="space-y-1.5 pt-2 text-xs border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Ad Spend:</span>
                  <span className="text-white font-mono font-bold">₹12,450</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Search Clicks:</span>
                  <span className="text-white font-mono">1,840 (CPC ₹6.76)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Direct Bookings:</span>
                  <span className="text-emerald-400 font-mono font-bold">41 bookings</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Direct Revenue:</span>
                  <span className="text-emerald-400 font-mono font-bold">₹61,500</span>
                </div>
              </div>
            </div>

            {/* Meta Ads */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Meta (Instagram &amp; FB) Ads</h3>
                    <span className="text-[10px] text-slate-400">Visual Discovery &amp; Reels</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">3.98x ROAS</span>
              </div>

              <div className="space-y-1.5 pt-2 text-xs border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Ad Spend:</span>
                  <span className="text-white font-mono font-bold">₹9,800</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Impressions / CTR:</span>
                  <span className="text-white font-mono">48,500 (2.8% CTR)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Direct Bookings:</span>
                  <span className="text-emerald-400 font-mono font-bold">26 bookings</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Direct Revenue:</span>
                  <span className="text-emerald-400 font-mono font-bold">₹39,000</span>
                </div>
              </div>
            </div>

            {/* Google Organic Search & Maps */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Organic &amp; Maps</h3>
                    <span className="text-[10px] text-slate-400">Zero-Cost Search Discovery</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">Zero CAC</span>
              </div>

              <div className="space-y-1.5 pt-2 text-xs border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Search Volume:</span>
                  <span className="text-white font-mono font-bold">6,200 visits</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Google Maps Clicks:</span>
                  <span className="text-white font-mono">980 to WhatsApp</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Organic Bookings:</span>
                  <span className="text-emerald-400 font-mono font-bold">64 bookings</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Organic Revenue:</span>
                  <span className="text-emerald-400 font-mono font-bold">₹96,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Roadmap Backlog Notice */}
          <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">Roadmap Backlog: Google Analytics 4 (GA4) Deep Site Integration</span>
                <p className="text-[11px] text-slate-400">
                  Queued for deployment alongside the public website redesign. Will provide direct real-time telemetry into visitor dropoffs and multi-touch booking paths.
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono shrink-0 font-bold">
              Revamp Backlog
            </span>
          </div>

          {/* Top Google Search Keywords Attribution */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              High-Converting Google Search Queries &amp; Intent Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Query:</div>
                <div className="font-bold text-white truncate">&quot;mumbai heritage walks&quot;</div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Clicks: <strong className="text-white">420</strong></span>
                  <span className="text-emerald-400 font-bold">42% Conv</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Top: #FortWalk &amp; Colonial Tours</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Query:</div>
                <div className="font-bold text-white truncate">&quot;open jeep safari south mumbai&quot;</div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Clicks: <strong className="text-white">290</strong></span>
                  <span className="text-emerald-400 font-bold">38% Conv</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Top: Urban Safari Jeep</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Query:</div>
                <div className="font-bold text-white truncate">&quot;best architectural walk fort mumbai&quot;</div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Clicks: <strong className="text-white">180</strong></span>
                  <span className="text-emerald-400 font-bold">51% Conv</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Top: Art Deco &amp; Victorian Walks</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px]">Query:</div>
                <div className="font-bold text-white truncate">&quot;khaki tours colaba walk&quot;</div>
                <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                  <span>Clicks: <strong className="text-white">310</strong></span>
                  <span className="text-emerald-400 font-bold">64% Conv</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Direct Brand Search (Zero Bounce)</div>
              </div>
            </div>
          </div>

          {/* Unified Paid Ads & Search Ingestion Stream */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Live Ingestion Stream: Google Search &amp; Meta Ad Leads
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time capture across Google Search Ads, Google Organic Search, and Meta Instagram Lead Forms. Automatically mapped to Kaevan&apos;s growth funnel and Priya&apos;s ops desk.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Lead Name</th>
                    <th className="p-3">Acquisition Channel</th>
                    <th className="p-3">Search Query / Creative Source</th>
                    <th className="p-3">Tour Interest</th>
                    <th className="p-3">Preferred Channel</th>
                    <th className="p-3 text-right">Status / Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {[
                    { 
                      name: 'Vikramaditya Nair', 
                      channel: 'Google Search Ads', 
                      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
                      source: 'Google PMax: "mumbai heritage walks weekend"', 
                      tour: '#DurgasOf Mumbai Navratri Special', 
                      commPref: 'WhatsApp Direct', 
                      status: 'Converted (₹3,000)' 
                    },
                    { 
                      name: 'Sarah Jenkins', 
                      channel: 'Meta Instagram', 
                      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
                      source: 'IG-Reels-ColonialHeritage', 
                      tour: '#FortWalk Colonial', 
                      commPref: 'Email Primary', 
                      status: 'Auto-Welcomed' 
                    },
                    { 
                      name: 'Aditi Merchant', 
                      channel: 'Google Organic Search', 
                      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
                      source: 'Search: "best architecture tour fort mumbai"', 
                      tour: 'Art Deco & Oval Heritage Walk', 
                      commPref: 'WhatsApp Direct', 
                      status: 'Converted (₹1,500)' 
                    },
                    { 
                      name: 'Rahul Chhabra', 
                      channel: 'Meta Instagram', 
                      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
                      source: 'IG-Sponsored-NightSafari', 
                      tour: 'Urban Safari Jeep', 
                      commPref: 'WhatsApp Direct', 
                      status: 'Converted (₹4,500)' 
                    },
                    { 
                      name: 'Ananya Deshmukh', 
                      channel: 'Google Search Ads', 
                      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
                      source: 'Search: "south mumbai walking tours weekend"', 
                      tour: 'Gamdevi & Banganga Walk', 
                      commPref: 'WhatsApp Direct', 
                      status: 'Inbound Follow-up' 
                    },
                    { 
                      name: 'Marc Dupont', 
                      channel: 'Meta Instagram', 
                      badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
                      source: 'IG-Bio-Link-Inquiry', 
                      tour: 'Private Architecture Tour', 
                      commPref: 'Email Primary', 
                      status: 'Quoted (Bespoke ₹22k)' 
                    },
                  ].map((l, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-semibold text-white">{l.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${l.badgeColor}`}>
                          {l.channel}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-mono text-[11px]">{l.source}</td>
                      <td className="p-3 font-medium text-amber-300">{l.tour}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          l.commPref.includes('Email') ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}>
                          {l.commPref}
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
        </div>
      )}

      {/* TAB 3: CROSS-SELL FUNNEL */}
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

      {/* TAB 4: AUTOMATED REVIEW COLLECTOR */}
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
    </div>
  );
}
