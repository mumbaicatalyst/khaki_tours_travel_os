'use client';

import { useState } from 'react';

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'YTD'>('30D');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Executive Business Intelligence & Revenue Analytics</h1>
          <p className="text-xs text-slate-400">
            Real-time revenue attribution by tour, seat occupancy rates, promotional campaign ROI, and guide payout accruals.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          {(['30D', '90D', 'YTD'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded font-semibold transition ${
                timeRange === range ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs uppercase text-slate-400 font-semibold">Total Revenue</div>
          <div className="text-2xl font-extrabold text-white mt-1">₹4,82,450</div>
          <div className="text-xs text-emerald-400 mt-0.5">↑ 18.4% vs last period</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs uppercase text-slate-400 font-semibold">Average Seat Occupancy</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">82.6%</div>
          <div className="text-xs text-slate-400 mt-0.5">Peak: Sat 04:30 PM (96%)</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs uppercase text-slate-400 font-semibold">Guide Payout Liability</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">₹84,500</div>
          <div className="text-xs text-slate-400 mt-0.5">38 Assignments completed</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs uppercase text-slate-400 font-semibold">Promo Code Lift</div>
          <div className="text-2xl font-extrabold text-blue-400 mt-1">₹68,200</div>
          <div className="text-xs text-slate-400 mt-0.5">123 redemptions (HERITAGE10)</div>
        </div>
      </div>

      {/* Grid: Revenue by Category & Top Performing Experiences */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue Breakdown */}
        <div className="lg:col-span-7 bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Breakdown by Vertical</h2>
          
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Standard Scheduled Walks (₹699 - ₹1,199)</span>
                <span className="font-mono text-white">₹2,48,200 (51.4%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '51.4%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Corporate B2B & Institutional Retainers</span>
                <span className="font-mono text-white">₹1,19,475 (24.8%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '24.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Private & Bespoke Heritage Groups</span>
                <span className="font-mono text-white">₹78,800 (16.3%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '16.3%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>International Outbound Expeditions</span>
                <span className="font-mono text-white">₹35,975 (7.5%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '7.5%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Top Performing Experiences */}
        <div className="lg:col-span-5 bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Performing Tours (By Pax)</h2>
          
          <div className="divide-y divide-slate-800/60 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">#FortWalk: Colonial Heritage</div>
                <div className="text-[11px] text-slate-400">Asiatic Society • ₹1,199/pax</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-400">142 Pax</div>
                <div className="text-[10px] text-slate-500">₹1,70,258 Gross</div>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">#BandraWalk: Queen of Suburbs</div>
                <div className="text-[11px] text-slate-400">Bandra Fort • ₹1,199/pax</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-400">88 Pax</div>
                <div className="text-[10px] text-slate-500">₹1,05,512 Gross</div>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">#ShimmeringCity Night Safari</div>
                <div className="text-[11px] text-slate-400">Kala Ghoda • AC SUV Moonroof</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-400">46 Pax</div>
                <div className="text-[10px] text-slate-500">₹55,154 Gross</div>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">#MohallaMunch Street Food</div>
                <div className="text-[11px] text-slate-400">Bohri Mohalla • ₹9,499 Group</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-400">6 Groups</div>
                <div className="text-[10px] text-slate-500">₹56,994 Gross</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AMBASSADOR & GUIDE PERFORMANCE INTELLIGENCE */}
      <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Ambassador Fleet & Guide Performance Intelligence</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Workload equity balance, reliability metrics, and margin contribution across independent historians.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-mono text-emerald-400">● 98.4% On-Time SLA</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 font-mono text-amber-400">● 1.6% Substitute Rate</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Workload Gini Fairness</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">0.12 (Optimal)</div>
            <p className="text-[11px] text-slate-400">
              Low disparity across active historians. Round-robin policy maintains ~2.0 walks/month per ambassador.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Net Guide Payout Accrual</span>
            <div className="text-xl font-bold text-amber-400 font-mono">₹84,500 INR</div>
            <p className="text-[11px] text-slate-400">
              Direct honorarium liability across 38 completed walks. Automated export ready for Tally Prime EOD.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Guest Satisfaction NPS</span>
            <div className="text-xl font-bold text-white font-mono">4.93 ★ (94 NPS)</div>
            <p className="text-[11px] text-slate-400">
              Consistently rated highest for narrative authenticity and architectural depth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
