import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Khaki Tours Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Omnichannel Operations, Automated Fast-Path Bookings, and Guide Dispatch Hub for Mumbai & Outbound Expeditions.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 sm:w-56">
          <Link
            href="/marketing"
            className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <span>⭐</span>
            <span>Google Reviews & Marketing</span>
          </Link>
          <div className="flex gap-2">
            <Link
              href="/inbox"
              className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-1.5"
            >
              <span>💬</span>
              <span>Inbox</span>
            </Link>
            <Link
              href="/dispatch"
              className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 hover:border-slate-600 transition flex items-center justify-center gap-1.5"
            >
              <span>🧭</span>
              <span>Dispatch</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tier 1 Bookings (Today)</div>
          <div className="text-3xl font-bold text-white mt-2">142 Pax</div>
          <div className="text-xs text-emerald-400 mt-1">100% Automated Fast-Path (0 Humans)</div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tier 2 Dispatches Pending</div>
          <div className="text-3xl font-bold text-amber-400 mt-2">3 Requests</div>
          <div className="text-xs text-amber-500/90 mt-1">Guide Broadcast Timer: 18m left</div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Intl FX Risk Buffer</div>
          <div className="text-3xl font-bold text-blue-400 mt-2">3.50%</div>
          <div className="text-xs text-slate-400 mt-1">Spot: ₹83.50 | Protected: ₹86.42</div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Tally Prime Accounting</div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">Synchronized</div>
          <div className="text-xs text-slate-400 mt-1">Daily Automated Ledger Sync</div>
        </div>
      </div>

      {/* Featured Engine: Post-Tour Google Reviews & Marketing Growth */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <span className="text-xl">⭐</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Growth & Guest Feedback Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Live &bull; 4.93★ Rating
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1">Post-Tour Google Reviews & WhatsApp Broadcast Studio</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automated 2-hour post-walk WhatsApp review triggers, 1-click Google Maps review capture, low-occupancy seat boosts, and paid ad attribution (4.52x ROAS).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/manifests"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold transition"
          >
            📋 Walk Rosters
          </Link>
          <Link
            href="/marketing"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md shadow-amber-500/10 flex items-center gap-1.5"
          >
            <span>Launch Review Engine &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Four-Vertical Operational Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tier 1 Card */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
              Scheduled Public Walks
            </div>
            <h2 className="text-base font-bold text-white">Automated Fast-Path Flow</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant UPI link generated on WhatsApp/Web. Once paid, seat decrements, QR ticket and meeting pin fire automatically without human staff intervention.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/tours" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Manage Catalog &rarr;
            </Link>
          </div>
        </div>

        {/* Tier 2 Card */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="inline-block px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold">
              Private Heritage Tours
            </div>
            <h2 className="text-base font-bold text-white">Hold-vs-Pay Dispatch System</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fast-track upfront payment for &gt;48h leads, or parallel resource locking (Guides + Jeeps) with 30-minute expiring links for bespoke groups.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/dispatch" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Dispatch Board &rarr;
            </Link>
          </div>
        </div>

        {/* Tier 3 Card */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="inline-block px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-semibold">
              International Expeditions
            </div>
            <h2 className="text-base font-bold text-white">Dynamic FX Risk Simulator</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Algorithmic USD/INR volatility buffers, milestone payment schedule (25% / 35% / 40%), and automatic 30-day spot rate settlement.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/international" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
              FX Simulator &rarr;
            </Link>
          </div>
        </div>

        {/* Tier 4 Card: Corporate B2B */}
        <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
              Corporate Delegations
            </div>
            <h2 className="text-base font-bold text-white">Custom Proposal Builder</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailored per-pax pricing, automated GST calculation, cohort guide division (max 20 pax/guide), and Net-15 corporate terms.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/corporate" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              B2B Proposals &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
