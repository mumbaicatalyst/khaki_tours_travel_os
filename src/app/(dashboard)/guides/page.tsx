'use client';

import { useState, useEffect } from 'react';
import { 
  GraduationCap, Star, ShieldCheck, Calendar, Clock, DollarSign, 
  Sparkles, CheckCircle2, AlertTriangle, Send, RefreshCw, Filter, 
  ChevronRight, Award, Compass, Phone, UserCheck, ArrowUpDown,
  Search, Users, Landmark, AlertCircle, BarChart3, Radio, Check,
  ArrowRight, X
} from 'lucide-react';

interface Guide {
  id: string;
  name: string;
  phone: string;
  dayJob: string;
  seniority: 'SENIOR_FELLOW' | 'CORE_AMBASSADOR' | 'APPRENTICE_GUIDE';
  rating: number;
  totalWalksLed: number;
  toursAssignedThisMonth: number;
  monthlyPayoutInr: number;
  primaryClusters: string[];
  specializations: string[];
  certifiedTours: string[];
  availableDays: string[];
  reliabilityRate: number;
  status: 'AVAILABLE' | 'ON_TOUR' | 'AT_DAY_JOB';
}

interface Departure {
  id: string;
  departure_id: string;
  tour_id: string;
  tour_title: string;
  departure_date: string;
  start_time: string;
  meeting_point: string;
  max_capacity: number;
  booked_seats: number;
  available_seats: number;
  ticket_price_inr: number;
  assigned_guide_name?: string;
  assigned_guide_phone?: string;
  status: string;
}

interface Tour {
  id: string;
  tour_id: string;
  title: string;
  category: string;
  duration?: string;
  base_price_inr: number;
  meeting_landmark?: string;
  route_highlights?: string[];
}

export default function GuideIntelligencePage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Main View Tabs: Operations & Allocation vs Fleet Analytics
  const [activeMainView, setActiveMainView] = useState<'ROSTER_ALLOCATION' | 'FLEET_ANALYTICS'>('ROSTER_ALLOCATION');

  // Allocation Selector Mode: Option A (Upcoming Departures) vs Option B (Catalog Explorer)
  const [selectorMode, setSelectorMode] = useState<'OPTION_A_DEPARTURES' | 'OPTION_B_CATALOG'>('OPTION_A_DEPARTURES');

  // Policies
  const [selectedPolicy, setSelectedPolicy] = useState<'ROUND_ROBIN' | 'SENIORITY_VIP' | 'FCFS_BROADCAST'>('ROUND_ROBIN');

  // Option A State (Upcoming Departures)
  const [selectedDepartureId, setSelectedDepartureId] = useState<string>('');
  const [departureFilter, setDepartureFilter] = useState<'ALL' | 'UNASSIGNED' | 'ASSIGNED'>('ALL');
  const [departureSearch, setDepartureSearch] = useState('');

  // Option B State (Catalog Explorer)
  const [catalogCluster, setCatalogCluster] = useState<string>('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogTour, setSelectedCatalogTour] = useState<Tour | null>(null);
  const [customPlanDate, setCustomPlanDate] = useState('2026-10-18');
  const [customPlanTime, setCustomPlanTime] = useState('08:30 AM');

  // Recommendation & Action States
  const [recommendationResults, setRecommendationResults] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  // Emergency Substitution Modal State
  const [substitutionModalOpen, setSubstitutionModalOpen] = useState(false);
  const [substituteReason, setSubstituteReason] = useState<string>('GUIDE_CALLED_IN_UNAVAILABLE');
  const [substituteCandidateId, setSubstituteCandidateId] = useState<string>('');

  // Broadcast Modal State
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [guidesRes, depRes, toursRes] = await Promise.all([
        fetch('/api/guides'),
        fetch('/api/departures'),
        fetch('/api/tours'),
      ]);

      if (guidesRes.ok) {
        const data = await guidesRes.json();
        setGuides(data.guides || []);
      }
      if (depRes.ok) {
        const data = await depRes.json();
        const deps = data.departures || [];
        setDepartures(deps);
        if (deps.length > 0 && !selectedDepartureId) {
          setSelectedDepartureId(deps[0].id || deps[0].departure_id);
        }
      }
      if (toursRes.ok) {
        const data = await toursRes.json();
        const trs = data.tours || [];
        setTours(trs);
        if (trs.length > 0 && !selectedCatalogTour) {
          setSelectedCatalogTour(trs[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Currently active departure object
  const activeDeparture = departures.find(
    (d) => d.id === selectedDepartureId || d.departure_id === selectedDepartureId
  ) || departures[0];

  // Active tour title & date for recommendations
  const activeTargetTitle = selectorMode === 'OPTION_A_DEPARTURES'
    ? (activeDeparture?.tour_title || 'Mumbai Heritage Walk')
    : (selectedCatalogTour?.title || 'Mumbai Heritage Walk');

  const activeTargetDate = selectorMode === 'OPTION_A_DEPARTURES'
    ? (activeDeparture?.departure_date || '2026-10-18')
    : customPlanDate;

  // Run Recommendation Matrix
  const runRecommendation = async () => {
    if (!activeTargetTitle) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/guides/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_title: activeTargetTitle,
          tour_date: activeTargetDate,
          policy: selectedPolicy,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendationResults(data);
        if (data.candidates && data.candidates.length > 0) {
          setSubstituteCandidateId(data.candidates[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Re-run recommendation whenever inputs change
  useEffect(() => {
    if (guides.length > 0 && activeTargetTitle) {
      runRecommendation();
    }
  }, [selectedDepartureId, selectedCatalogTour, selectedPolicy, selectorMode, customPlanDate]);

  // Handle Standard Allocation
  const handleAllocate = async (guideId: string) => {
    const guide = guides.find((g) => g.id === guideId);
    if (!guide) return;
    setIsExecutingAction(true);

    try {
      const depId = selectorMode === 'OPTION_A_DEPARTURES' && activeDeparture
        ? (activeDeparture.id || activeDeparture.departure_id)
        : `custom_${Date.now()}`;

      const res = await fetch('/api/guides/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure_id: depId,
          guide_id: guideId,
          is_substitution: false,
          send_whatsapp: true,
        }),
      });

      if (res.ok) {
        // Update local guides
        setGuides((prev) =>
          prev.map((g) =>
            g.id === guideId
              ? {
                  ...g,
                  toursAssignedThisMonth: g.toursAssignedThisMonth + 1,
                  monthlyPayoutInr: g.monthlyPayoutInr + 2500,
                  totalWalksLed: g.totalWalksLed + 1,
                }
              : g
          )
        );

        // Update local departures
        setDepartures((prev) =>
          prev.map((d) =>
            (d.id === depId || d.departure_id === depId)
              ? {
                  ...d,
                  assigned_guide_name: `${guide.name} (${guide.seniority.replace('_', ' ')})`,
                  assigned_guide_phone: guide.phone,
                }
              : d
          )
        );

        setActionNotice(
          `✅ Allocated ${guide.name} to "${activeTargetTitle}". Workload incremented & WhatsApp roster dispatch sent.`
        );
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Handle Emergency Substitution (Guide called in unavailable / cancelled)
  const handleExecuteSubstitution = async () => {
    if (!substituteCandidateId || !activeDeparture) return;
    const newGuide = guides.find((g) => g.id === substituteCandidateId);
    if (!newGuide) return;

    setIsExecutingAction(true);
    try {
      const depId = activeDeparture.id || activeDeparture.departure_id;
      const prevGuide = guides.find((g) => activeDeparture.assigned_guide_name?.includes(g.name));

      const res = await fetch('/api/guides/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure_id: depId,
          guide_id: substituteCandidateId,
          is_substitution: true,
          previous_guide_id: prevGuide?.id,
          reason: substituteReason,
          send_whatsapp: true,
        }),
      });

      if (res.ok) {
        // Rebalance workload locally
        setGuides((prev) =>
          prev.map((g) => {
            if (prevGuide && g.id === prevGuide.id) {
              return {
                ...g,
                toursAssignedThisMonth: Math.max(0, g.toursAssignedThisMonth - 1),
                monthlyPayoutInr: Math.max(0, g.monthlyPayoutInr - 2500),
              };
            }
            if (g.id === substituteCandidateId) {
              return {
                ...g,
                toursAssignedThisMonth: g.toursAssignedThisMonth + 1,
                monthlyPayoutInr: g.monthlyPayoutInr + 2500,
                totalWalksLed: g.totalWalksLed + 1,
              };
            }
            return g;
          })
        );

        // Update departure assigned guide
        setDepartures((prev) =>
          prev.map((d) =>
            (d.id === depId || d.departure_id === depId)
              ? {
                  ...d,
                  assigned_guide_name: `${newGuide.name} (${newGuide.seniority.replace('_', ' ')})`,
                  assigned_guide_phone: newGuide.phone,
                }
              : d
          )
        );

        setSubstitutionModalOpen(false);
        setActionNotice(
          `🔄 Emergency Substitution Confirmed: ${newGuide.name} replaced ${prevGuide?.name || 'previous guide'}. Previous load decremented, new guide notified via WhatsApp.`
        );
        setTimeout(() => setActionNotice(null), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Handle Speed Broadcast
  const handleLaunchSpeedBroadcast = async () => {
    setIsExecutingAction(true);
    try {
      const depId = activeDeparture?.id || activeDeparture?.departure_id || `dep_fast_${Date.now()}`;
      const res = await fetch('/api/guides/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure_id: depId,
          tour_title: activeTargetTitle,
          departure_date: activeTargetDate,
          start_time: activeDeparture?.start_time || customPlanTime,
          candidate_ids: recommendationResults?.candidates?.slice(0, 3).map((c: any) => c.id) || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBroadcastModalOpen(false);
        setBroadcastNotice(
          `⚡ Fast-Track WhatsApp Broadcast launched to ${data.candidates_contacted} guides! First to click Accept is locked as Primary; 2nd candidate is Standby Backup (30m countdown active on Dispatch Board).`
        );
        setTimeout(() => setBroadcastNotice(null), 7000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Filtered Departures for Option A
  const filteredDepartures = departures.filter((d) => {
    if (departureFilter === 'UNASSIGNED') {
      if (d.assigned_guide_name && d.assigned_guide_name !== 'Unassigned') return false;
    }
    if (departureFilter === 'ASSIGNED') {
      if (!d.assigned_guide_name || d.assigned_guide_name === 'Unassigned') return false;
    }
    if (departureSearch) {
      const q = departureSearch.toLowerCase();
      return (
        d.tour_title.toLowerCase().includes(q) ||
        d.departure_date.includes(q) ||
        (d.assigned_guide_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Tours for Option B
  const filteredCatalogTours = tours.filter((t) => {
    if (catalogCluster !== 'ALL') {
      if (catalogCluster === 'SOUTH_MUMBAI_FORT' && !t.title.toLowerCase().includes('fort') && !t.title.toLowerCase().includes('colonial') && !t.title.toLowerCase().includes('ballard')) return false;
      if (catalogCluster === 'BANDRA_SUBURBAN' && !t.title.toLowerCase().includes('bandra') && !t.title.toLowerCase().includes('ranwar')) return false;
      if (catalogCluster === 'HARBOUR_ISLANDS' && !t.title.toLowerCase().includes('island') && !t.title.toLowerCase().includes('harbour') && !t.title.toLowerCase().includes('elephanta')) return false;
      if (catalogCluster === 'CENTRAL_MUMBAI_MILLS' && !t.title.toLowerCase().includes('parel') && !t.title.toLowerCase().includes('mill') && !t.title.toLowerCase().includes('girgaon')) return false;
    }
    if (catalogSearch) {
      const q = catalogSearch.toLowerCase();
      return t.title.toLowerCase().includes(q) || (t.meeting_landmark || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalMonthlyTours = guides.reduce((acc, g) => acc + g.toursAssignedThisMonth, 0);
  const avgToursPerGuide = (totalMonthlyTours / (guides.length || 1)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            Ambassador Allocation & Roster Intelligence
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl mt-1">
            Dispatch working professionals (lawyers, architects, maritime engineers, authors) to heritage walks.
            Enforces <strong>fair round-robin workload distribution</strong>, rapid emergency substitution when guides call in, and VIP seniority matching.
          </p>
        </div>

        {/* View Switcher: Operations vs Analytics */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveMainView('ROSTER_ALLOCATION')}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
                activeMainView === 'ROSTER_ALLOCATION'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Allocation & Dispatch
            </button>
            <button
              onClick={() => setActiveMainView('FLEET_ANALYTICS')}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
                activeMainView === 'FLEET_ANALYTICS'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Ambassador Analytics
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Refresh All Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionNotice && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 px-4 py-3 rounded-xl text-xs text-emerald-200 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {broadcastNotice && (
        <div className="bg-blue-950/70 border border-blue-500/50 px-4 py-3 rounded-xl text-xs text-blue-200 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{broadcastNotice}</span>
          </div>
          <button onClick={() => setBroadcastNotice(null)} className="text-blue-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 1: ROSTER ALLOCATION & DISPATCH */}
      {activeMainView === 'ROSTER_ALLOCATION' && (
        <div className="space-y-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Ambassador Pool</span>
              <span className="text-2xl font-bold text-white font-mono">{guides.length} Historians</span>
              <span className="text-[11px] text-emerald-400 block mt-1">100% Industry Domain Experts</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Workload Equity</span>
              <span className="text-2xl font-bold text-amber-400 font-mono">{avgToursPerGuide} Walks / Guide</span>
              <span className="text-[11px] text-slate-400 block mt-1">Target: ~2 walks/month per ambassador</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Reliability & Attendance</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">98.4%</span>
              <span className="text-[11px] text-slate-400 block mt-1">1.6% emergency substitute rate</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Payout Liabilities</span>
              <span className="text-2xl font-bold text-white font-mono">
                ₹{guides.reduce((a, b) => a + (b.monthlyPayoutInr || 0), 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">Synced to Tally Prime EOD ledger</span>
            </div>
          </div>

          {/* DUAL-MODE TOUR SELECTOR CARD */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Mode Switch Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 tracking-wider block font-bold">
                  Step 1: Choose Tour Context
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Target Experience Selector
                </h2>
              </div>

              {/* Toggle Departures vs Catalog */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectorMode('OPTION_A_DEPARTURES')}
                  className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                    selectorMode === 'OPTION_A_DEPARTURES'
                      ? 'bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Upcoming Departures ({departures.length})</span>
                </button>

                <button
                  onClick={() => setSelectorMode('OPTION_B_CATALOG')}
                  className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
                    selectorMode === 'OPTION_B_CATALOG'
                      ? 'bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Tour Catalog ({tours.length})</span>
                </button>
              </div>
            </div>

            {/* Content for OPTION A: UPCOMING DEPARTURES */}
            {selectorMode === 'OPTION_A_DEPARTURES' && (
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Filter Slots:</span>
                    {(['ALL', 'UNASSIGNED', 'ASSIGNED'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setDepartureFilter(f)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          departureFilter === f
                            ? 'bg-slate-800 text-white border border-slate-700'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {f === 'UNASSIGNED' ? 'Needs Guide' : f === 'ASSIGNED' ? 'Already Assigned' : 'All Departures'}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search departure slots..."
                      value={departureSearch}
                      onChange={(e) => setDepartureSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Dropdown / Selection Grid of Departures */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredDepartures.map((d) => {
                    const isSelected = (d.id === selectedDepartureId || d.departure_id === selectedDepartureId);
                    const isAssigned = d.assigned_guide_name && d.assigned_guide_name !== 'Unassigned';

                    return (
                      <div
                        key={d.id || d.departure_id}
                        onClick={() => setSelectedDepartureId(d.id || d.departure_id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500/60 shadow-md ring-1 ring-blue-500/40'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] text-amber-400 font-bold">
                              {d.departure_date} &bull; {d.start_time}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              isAssigned
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {isAssigned ? 'Assigned' : 'Needs Guide'}
                            </span>
                          </div>
                          <div className="font-bold text-white truncate text-[13px]">{d.tour_title}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{d.meeting_point}</div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            Pax: <strong className="text-white">{d.booked_seats}/{d.max_capacity}</strong>
                          </span>
                          <span className="text-slate-300 truncate max-w-[140px] text-right font-medium">
                            {d.assigned_guide_name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Departure Summary Banner */}
                {activeDeparture && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                          Selected Departure Slot
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{activeDeparture.departure_date} at {activeDeparture.start_time}</span>
                      </div>
                      <div className="text-base font-bold text-white">{activeDeparture.tour_title}</div>
                      <div className="text-xs text-slate-400">
                        Assembly: <span className="text-slate-200">{activeDeparture.meeting_point}</span> &bull; Booked: <strong className="text-emerald-400">{activeDeparture.booked_seats} guests</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {activeDeparture.assigned_guide_name && activeDeparture.assigned_guide_name !== 'Unassigned' ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">Current Lead</span>
                            <span className="text-xs font-bold text-amber-400">{activeDeparture.assigned_guide_name}</span>
                          </div>
                          <button
                            onClick={() => setSubstitutionModalOpen(true)}
                            className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Substitute / Change Guide
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setBroadcastModalOpen(true)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Speed Broadcast (&lt;48h)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content for OPTION B: SCOPED CATALOG EXPLORER */}
            {selectorMode === 'OPTION_B_CATALOG' && (
              <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Cluster Pills */}
                  <div className="flex flex-wrap gap-1 text-xs">
                    {[
                      { id: 'ALL', label: 'All Catalog (81)' },
                      { id: 'SOUTH_MUMBAI_FORT', label: 'South Mumbai / Fort' },
                      { id: 'BANDRA_SUBURBAN', label: 'Bandra Suburbs' },
                      { id: 'HARBOUR_ISLANDS', label: 'Harbour & Islands' },
                      { id: 'CENTRAL_MUMBAI_MILLS', label: 'Girgaon & Mills' },
                    ].map((cl) => (
                      <button
                        key={cl.id}
                        onClick={() => setCatalogCluster(cl.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          catalogCluster === cl.id
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cl.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search tour catalog..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Tour Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredCatalogTours.map((t) => {
                    const isSelected = selectedCatalogTour?.id === t.id;
                    return (
                      <div
                        key={t.id || t.tour_id}
                        onClick={() => setSelectedCatalogTour(t)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">
                            {t.category || 'HERITAGE WALK'}
                          </span>
                          <div className="font-bold text-white text-[13px] truncate mt-0.5">{t.title}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{t.meeting_landmark || 'South Mumbai'}</div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="font-mono text-white font-bold">₹{t.base_price_inr}</span>
                          <span className="text-slate-400 font-mono">{t.duration || '2.5 hrs'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Planning Date Picker for Catalog Tour */}
                {selectedCatalogTour && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Target Tour for Calendar Addition / Custom Booking:</div>
                      <div className="text-base font-bold text-white">{selectedCatalogTour.title}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 block uppercase font-mono">Date</label>
                        <input
                          type="date"
                          value={customPlanDate}
                          onChange={(e) => setCustomPlanDate(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 block uppercase font-mono">Start Time</label>
                        <input
                          type="text"
                          value={customPlanTime}
                          onChange={(e) => setCustomPlanTime(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-mono w-24"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ALLOCATION POLICY CONTROLLER & CANDIDATE MATCHING */}
          <div className="bg-gradient-to-r from-slate-900/90 to-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-amber-400 tracking-wider block font-bold">
                  Step 2: Guide Matching Policy
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Candidate Allocation Engine & Workload Rebalancing
                </h2>
              </div>

              {/* Policy Selector Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedPolicy('ROUND_ROBIN')}
                  className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
                    selectedPolicy === 'ROUND_ROBIN'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚖️ Round-Robin (Fairness)</span>
                </button>

                <button
                  onClick={() => setSelectedPolicy('SENIORITY_VIP')}
                  className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
                    selectedPolicy === 'SENIORITY_VIP'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>👑 Seniority & VIP Match</span>
                </button>

                <button
                  onClick={() => setSelectedPolicy('FCFS_BROADCAST')}
                  className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 ${
                    selectedPolicy === 'FCFS_BROADCAST'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚡ Speed Broadcast (&lt;48h)</span>
                </button>
              </div>
            </div>

            {/* Candidate Cards */}
            {recommendationResults && recommendationResults.candidates && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase text-amber-400 tracking-wider text-[11px]">
                    Ranked Candidates for Active Tour: {activeTargetTitle}
                  </span>
                  <span className="text-slate-400">
                    Policy: <strong className="text-white">{selectedPolicy.replace('_', ' ')}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {recommendationResults.candidates.slice(0, 3).map((c: any, rankIdx: number) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                        rankIdx === 0
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                          : rankIdx === 1
                          ? 'bg-slate-900/80 border-slate-700'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              rankIdx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}>
                              #{rankIdx + 1}
                            </span>
                            {c.name}
                          </span>
                          <span className="text-emerald-400 font-mono font-bold text-xs">{c.rating} ★</span>
                        </div>

                        <div>
                          <div className="text-[11px] text-amber-300 font-medium">{c.dayJob}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {c.seniority.replace('_', ' ')} &bull; {c.totalWalksLed} walks led
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-300 bg-slate-950/90 p-2 rounded-lg border border-slate-800/80">
                          {c.matchReason}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-[10px] text-slate-400 font-mono">
                          <strong>{c.toursAssignedThisMonth}</strong> walks this mo
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAllocate(c.id)}
                            disabled={isExecutingAction}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              rankIdx === 0
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            } disabled:opacity-50`}
                          >
                            <UserCheck className="w-3 h-3" />
                            {rankIdx === 0 ? 'Allocate Lead' : 'Assign'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AMBASSADOR ROSTER TABLE & WORKLOAD EQUITY TRACKER */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Ambassador Pool & Workload Equity Matrix</span>
                <span className="text-xs text-slate-500 font-normal">({guides.length} Historians)</span>
              </h2>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Ambassador & Background</th>
                    <th className="p-3.5">Seniority Tier</th>
                    <th className="p-3.5">Certified Tours</th>
                    <th className="p-3.5">Availability</th>
                    <th className="p-3.5">Monthly Workload Equity</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {guides.map((guide) => {
                    const maxTours = 4;
                    const loadPercent = Math.min(100, (guide.toursAssignedThisMonth / maxTours) * 100);

                    return (
                      <tr key={guide.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {guide.name}
                            <span className="text-emerald-400 font-mono text-[11px] font-normal">({guide.rating}★)</span>
                          </div>
                          <div className="text-[11px] text-amber-400/90 font-medium">{guide.dayJob}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{guide.phone} &bull; {guide.totalWalksLed} walks led</div>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            guide.seniority === 'SENIOR_FELLOW'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : guide.seniority === 'CORE_AMBASSADOR'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {guide.seniority.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {guide.certifiedTours.slice(0, 3).map((ct, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                                {ct}
                              </span>
                            ))}
                            {guide.certifiedTours.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                +{guide.certifiedTours.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-0.5 text-[10px] text-slate-400">
                            {guide.availableDays.map((d, idx) => (
                              <span key={idx} className="block font-mono">
                                &bull; {d.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3.5 min-w-[170px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-bold text-white">{guide.toursAssignedThisMonth} Walks</span>
                              <span className="font-mono text-emerald-400">₹{(guide.monthlyPayoutInr || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  guide.toursAssignedThisMonth === 0
                                    ? 'bg-slate-600'
                                    : guide.toursAssignedThisMonth <= 2
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.max(5, loadPercent)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-500 block">
                              {guide.toursAssignedThisMonth === 0
                                ? '⚠️ Low allocation (Prioritize next)'
                                : guide.toursAssignedThisMonth <= 2
                                ? 'Fairly balanced'
                                : 'Approaching cap'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5 text-right">
                          <a
                            href={`https://wa.me/${guide.phone.replace(/[^0-9]/g, '')}?text=Namaste%20${guide.name},%20Khaki%20Tours%20Operations%20desk%20checking%20in%20regarding%20upcoming%20roster.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-semibold transition inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AMBASSADOR FLEET ANALYTICS */}
      {activeMainView === 'FLEET_ANALYTICS' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Ambassador Fleet Reliability & Performance Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Historical reliability indices, customer rating distribution, and emergency replacement trends across the freelance ambassador network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Punctuality & Arrival SLA</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">98.4%</div>
              <p className="text-[11px] text-slate-400">Guides arriving ≥15 mins before assembly time at heritage landmarks.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Emergency Replacement Rate</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">1.6%</div>
              <p className="text-[11px] text-slate-400">Instances where a guide called in and required emergency substitution.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Guest Satisfaction NPS</span>
              <div className="text-2xl font-bold text-white font-mono">4.93 ★</div>
              <p className="text-[11px] text-slate-400">Average verified post-walk feedback score across 287 guest responses.</p>
            </div>
          </div>

          {/* Guide Breakdown Cards */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Individual Ambassador Performance Scorecards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((g) => (
                <div key={g.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{g.name}</div>
                      <div className="text-xs text-amber-400">{g.dayJob}</div>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono text-sm">{g.rating} ★</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Total Career Walks:</span>
                      <span className="font-mono text-white">{g.totalWalksLed}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Assigned This Month:</span>
                      <span className="font-mono text-amber-400">{g.toursAssignedThisMonth}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Reliability Rate:</span>
                      <span className="font-mono text-emerald-400">{g.reliabilityRate}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Certified Tours:</span>
                      <span className="font-mono text-white">{g.certifiedTours.length}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Accrued Payout:</span>
                    <span className="text-emerald-400 font-bold font-mono text-xs">
                      ₹{(g.monthlyPayoutInr || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY SUBSTITUTION MODAL */}
      {substitutionModalOpen && activeDeparture && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Emergency Guide Substitution</h3>
              </div>
              <button
                onClick={() => setSubstitutionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Departure Details</div>
                <div className="font-bold text-white text-sm">{activeDeparture.tour_title}</div>
                <div className="text-slate-400 font-mono">
                  {activeDeparture.departure_date} at {activeDeparture.start_time} &bull; {activeDeparture.meeting_point}
                </div>
                <div className="text-rose-400 font-medium mt-1">
                  Currently Assigned: <strong>{activeDeparture.assigned_guide_name}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason for Reassignment / Cancellation:</label>
                <select
                  value={substituteReason}
                  onChange={(e) => setSubstituteReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="GUIDE_CALLED_IN_UNAVAILABLE">Guide Called In / Personal Emergency</option>
                  <option value="GUIDE_ILLNESS">Guide Illness / Last-Minute Drop</option>
                  <option value="CLIENT_VIP_SPECIAL_REQUEST">Client VIP Domain Specialist Request</option>
                  <option value="WORKLOAD_REBALANCE">Workload Rebalance / Fairness Adjustment</option>
                  <option value="LOGISTICAL_CONFLICT">Day Job Court / Travel Conflict</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Replacement Guide:</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {recommendationResults?.candidates?.map((c: any) => {
                    const isPrev = activeDeparture.assigned_guide_name?.includes(c.name);
                    if (isPrev) return null; // Can't substitute with same guide

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSubstituteCandidateId(c.id)}
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                          substituteCandidateId === c.id
                            ? 'bg-rose-500/15 border-rose-500/60 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {c.name}
                            <span className="text-[10px] text-amber-400 font-mono">({c.dayJob})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {c.toursAssignedThisMonth} walks this mo &bull; {c.rating}★ rating
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200">
                            {substituteCandidateId === c.id ? 'Selected' : 'Pick'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-[11px] text-rose-300">
              ⚡ <strong>Automated Operations Trigger:</strong> Confirming will decrement previous guide&apos;s monthly allocation count, increment the substitute guide&apos;s workload, and instantly dispatch a WhatsApp urgent roster notification to the new lead.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSubstitutionModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteSubstitution}
                disabled={isExecutingAction || !substituteCandidateId}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isExecutingAction ? 'Rebalancing...' : 'Confirm Substitution & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPEED BROADCAST MODAL */}
      {broadcastModalOpen && activeDeparture && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Speed WhatsApp Broadcast (&lt;48h)</h3>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Departure Details</div>
                <div className="font-bold text-white text-sm">{activeDeparture.tour_title}</div>
                <div className="text-slate-400 font-mono">
                  {activeDeparture.departure_date} at {activeDeparture.start_time} &bull; {activeDeparture.meeting_point}
                </div>
              </div>

              <div>
                <span className="text-slate-300 font-semibold block mb-1">Top 3 Candidates Queued for Instant Blast:</span>
                <div className="space-y-1.5">
                  {recommendationResults?.candidates?.slice(0, 3).map((c: any, idx: number) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">#{idx + 1} {c.name}</span>
                        <span className="text-slate-400 ml-2">({c.dayJob})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">{c.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-300">
                ⏱️ <strong>Fast-Track SLA:</strong> Multicasts 1-click WhatsApp buttons (&quot;Accept Tour&quot; / &quot;Decline&quot;). First to accept locks Primary Guide; second is recorded as Standby Backup. 30-minute countdown initiated on Flight Board.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchSpeedBroadcast}
                disabled={isExecutingAction}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isExecutingAction ? 'Broadcasting...' : 'Launch WhatsApp Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
