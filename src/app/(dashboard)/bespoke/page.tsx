'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, Compass, Clock, Users, Building2, 
  DollarSign, CheckCheck, Send, ShieldAlert, ArrowRight, 
  FileText, Plus, Trash2, CheckCircle2, ChevronRight, User
} from 'lucide-react';
import { useRole } from '@/context/RoleContext';

interface StopItem {
  id: string;
  name: string;
  cluster: string;
  theme: string;
  narrativeHook: string;
  distanceFromPrevKm: number;
}

const AVAILABLE_STOPS: StopItem[] = [
  { id: 'stop_cst', name: 'Victoria Terminus (CST Railway Station)', cluster: 'SOUTH_MUMBAI_FORT', theme: 'Victorian Gothic & Rail', narrativeHook: 'The Italian Gothic masterpiece built to celebrate Queen Victoria’s Golden Jubilee in 1887.', distanceFromPrevKm: 0.0 },
  { id: 'stop_bmc', name: 'BMC Municipal Corporation Headquarters', cluster: 'SOUTH_MUMBAI_FORT', theme: 'Indo-Saracenic Architecture', narrativeHook: 'F.W. Stevens’ civic monument featuring the gargoyle fountain and winged allegorical figures.', distanceFromPrevKm: 0.3 },
  { id: 'stop_horniman', name: 'Horniman Circle & Asiatic Library', cluster: 'SOUTH_MUMBAI_FORT', theme: 'Colonial Banking & Fort Gate', narrativeHook: 'The original Bombay Green, site of the 1860s cotton boom and neo-classical porticos.', distanceFromPrevKm: 0.8 },
  { id: 'stop_synagogue', name: 'Keneseth Eliyahoo Synagogue', cluster: 'SOUTH_MUMBAI_FORT', theme: 'Baghdadi Jewish Heritage', narrativeHook: 'The brilliant sky-blue Victorian synagogue established in 1884 by Jacob Sassoon.', distanceFromPrevKm: 0.6 },
  { id: 'stop_highcourt', name: 'Bombay High Court & Rajabai Clock Tower', cluster: 'SOUTH_MUMBAI_FORT', theme: 'Colonial Jurisprudence & Law', narrativeHook: 'Sir George Gilbert Scott’s Venetian Gothic tower and the historic high court benches.', distanceFromPrevKm: 0.5 },
  { id: 'stop_artdeco', name: 'Oval Maidan Art Deco Mansions', cluster: 'SOUTH_MUMBAI_FORT', theme: '1930s Art Deco World Heritage', narrativeHook: 'The UNESCO-listed concrete apartment blocks reflecting nautical streamlined modernism.', distanceFromPrevKm: 0.4 },
  
  // Bandra Stops
  { id: 'stop_ranwar', name: 'Ranwar Village & Historic Crosses', cluster: 'BANDRA_SUBURBAN', theme: 'Portuguese Hamlets & Vernacular', narrativeHook: 'One of Bandra’s original 24 pakhadis with wooden-balconied cottages and community squares.', distanceFromPrevKm: 0.5 },
  { id: 'stop_castella', name: 'Castella de Aguada (Bandra Fort)', cluster: 'BANDRA_SUBURBAN', theme: '1640s Portuguese Military Watchtower', narrativeHook: 'Overlooking Mahim Bay, built to guard the northern sealanes of the Portuguese territory.', distanceFromPrevKm: 1.2 },
  { id: 'stop_mountmary', name: 'Basilica of Our Lady of the Mount', cluster: 'BANDRA_SUBURBAN', theme: 'Jesuit & Bandra Feast Heritage', narrativeHook: 'Centuries-old pilgrimage shrine established on the hillock overlooking the Arabian Sea.', distanceFromPrevKm: 0.7 },
  
  // Maritime & Dock Stops
  { id: 'stop_sassoon', name: 'Sassoon Docks & Historic Ice Factory', cluster: 'COLABA_MARITIME', theme: '1870s Wet Docks & Koli Fisherfolk', narrativeHook: 'Mumbai’s first commercial wet dock, built by Albert Sassoon, humming with fishing trawlers.', distanceFromPrevKm: 1.5 },
  { id: 'stop_harbour', name: 'Apollo Bunder & Yacht Club Slipway', cluster: 'COLABA_MARITIME', theme: 'Gateway & Royal Yachting Lore', narrativeHook: 'Where British viceroys disembarked and Bombay merchant princes anchored their cutters.', distanceFromPrevKm: 0.9 },
];

export default function BespokeCuratorStudioPage() {
  const { config } = useRole();
  const [clientType, setClientType] = useState<'CORPORATE' | 'PRIVATE_FAMILY'>('CORPORATE');
  const [clientName, setClientName] = useState('Tata Sons Executive Delegation');
  const [clientPhone, setClientPhone] = useState('+91 98200 11223');
  const [groupSize, setGroupSize] = useState<number>(12);
  const [scheduledDate, setScheduledDate] = useState('2026-10-24');
  
  // Selected stops list
  const [selectedStops, setSelectedStops] = useState<StopItem[]>([
    AVAILABLE_STOPS[0],
    AVAILABLE_STOPS[1],
    AVAILABLE_STOPS[2],
    AVAILABLE_STOPS[4],
  ]);

  const [pacing, setPacing] = useState<'STANDARD' | 'RELAXED_SENIORS' | 'BRISK'>('STANDARD');
  const [includeRefreshment, setIncludeRefreshment] = useState(true);
  const [includeJeep, setIncludeJeep] = useState(false);
  const [assignedGuide, setAssignedGuide] = useState<any | null>(null);
  const [courtesyDiscountPercent, setCourtesyDiscountPercent] = useState<number>(0);

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate Spatial Feasibility
  const totalKm = selectedStops.reduce((acc, s) => acc + s.distanceFromPrevKm, 0);
  const clusters = Array.from(new Set(selectedStops.map((s) => s.cluster)));
  const isCrossCluster = clusters.length > 1;

  // Auto-enforce vehicle requirement if cross-cluster
  const isVehicleRequired = includeJeep || isCrossCluster;

  const estimatedHours = pacing === 'RELAXED_SENIORS'
    ? (totalKm * 0.9 + 1.2).toFixed(1)
    : pacing === 'BRISK'
    ? (totalKm * 0.5 + 0.8).toFixed(1)
    : (totalKm * 0.7 + 1.0).toFixed(1);

  // Automatically fetch best recommended guide for this bespoke configuration
  useEffect(() => {
    async function fetchRecommendation() {
      try {
        const res = await fetch('/api/guides/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tour_title: selectedStops.map(s => s.name).join(' '),
            tour_date: scheduledDate,
            category: clientType,
            policy: clientType === 'CORPORATE' ? 'SENIORITY_VIP' : 'ROUND_ROBIN',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.candidates && data.candidates.length > 0) {
            setAssignedGuide(data.candidates[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchRecommendation();
  }, [selectedStops.length, clientType, scheduledDate]);

  // Pricing calculations
  const baseCuratorFee = clientType === 'CORPORATE' ? 18000 : 12000;
  const perHeadFee = (clientType === 'CORPORATE' ? 1500 : 900) * groupSize;
  const refreshmentFee = includeRefreshment ? 350 * groupSize : 0;
  const vehicleFee = isVehicleRequired ? (groupSize > 8 ? 8500 : 4500) : 0;
  const grossSubtotal = baseCuratorFee + perHeadFee + refreshmentFee + vehicleFee;
  const discountAmount = Math.round(grossSubtotal * (courtesyDiscountPercent / 100));
  const netSubtotal = grossSubtotal - discountAmount;
  const gstRate = clientType === 'CORPORATE' ? 0.18 : 0.05;
  const gstAmount = Math.round(netSubtotal * gstRate);
  const totalAmount = netSubtotal + gstAmount;

  const addStop = (stop: StopItem) => {
    if (selectedStops.some(s => s.id === stop.id)) return;
    setSelectedStops([...selectedStops, stop]);
  };

  const removeStop = (id: string) => {
    setSelectedStops(selectedStops.filter(s => s.id !== id));
  };

  const handleGenerateAndDispatch = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bespoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          organization: clientType === 'CORPORATE' ? clientName : undefined,
          themeTitle: `Bespoke Trail: ${selectedStops.map(s => s.theme.split(' ')[0]).slice(0, 3).join(' & ')}`,
          cluster: clusters[0] || 'SOUTH_MUMBAI_FORT',
          stops: selectedStops.map(s => s.name),
          estimatedDurationHours: parseFloat(estimatedHours),
          groupSize,
          scheduledDate,
          assignedGuideId: assignedGuide?.id || 'guide_aniket',
          assignedGuideName: assignedGuide?.name || 'Aniket P.',
          vehicleRequired: isVehicleRequired,
          baseCuratorFeeInr: baseCuratorFee,
          perHeadFeeInr: perHeadFee,
          totalAmountInr: totalAmount,
          sendWhatsAppQuote: true,
        }),
      });

      if (res.ok) {
        setActionNotice(`✅ Proposal generated! Dispatched formal quotation and payment link to ${clientPhone} via WhatsApp.`);
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            Bespoke & Custom Tour Curator Studio
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Build custom, high-ticket private itineraries for corporate retreats or VIP families in seconds. 
            Enforces spatial feasibility, matches certified Ambassadors, and generates instant WhatsApp proposals.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionNotice}
        </div>
      )}

      {/* 2-Column Curator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: BUILDER CONTROLS & ROUTE STITCHER (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Step 1: Client Profile & Timing */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                1. Client Profile & Delegation Details
              </span>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setClientType('CORPORATE')}
                  className={`px-2.5 py-1 rounded font-bold transition ${
                    clientType === 'CORPORATE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏢 Corporate Delegation
                </button>
                <button
                  type="button"
                  onClick={() => setClientType('PRIVATE_FAMILY')}
                  className={`px-2.5 py-1 rounded font-bold transition ${
                    clientType === 'PRIVATE_FAMILY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👨‍👩‍👧 Private / VIP Family
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Client / Delegation Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">WhatsApp Direct Contact</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Party Size (Pax)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Target Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Route Assembly & Spatial Check */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  2. Narrative Route Assembly ({selectedStops.length} Stops)
                </span>
                <span className="text-[11px] text-slate-400">
                  Est. Walking Distance: ~{totalKm.toFixed(1)} km &bull; Est. Duration: ~{estimatedHours} Hours
                </span>
              </div>
            </div>

            {/* Spatial Cross-Cluster Warning */}
            {isCrossCluster && (
              <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-lg text-xs text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">Cross-Cluster Route Detected</div>
                  <div className="text-[11px] text-slate-300">
                    Your route combines stops in <strong>South Mumbai</strong> and <strong>Bandra/Suburban</strong>. 
                    An Open Jeep or AC Coach transfer has been automatically added to prevent fatigue.
                  </div>
                </div>
              </div>
            )}

            {/* Current Selected Stops (Ordered) */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Curated Sequence:</span>
              {selectedStops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center font-mono text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{stop.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{stop.narrativeHook}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {stop.cluster.replace('_MUMBAI_', ' ')}
                    </span>
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                      title="Remove Stop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Landmark Stops from Catalog */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-mono">+ Add Stops from Heritage Vault:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {AVAILABLE_STOPS.filter(s => !selectedStops.some(sel => sel.id === s.id)).map(s => (
                  <button
                    key={s.id}
                    onClick={() => addStop(s)}
                    className="p-2 text-left bg-slate-950 hover:bg-slate-900 border border-slate-800/80 rounded-lg transition text-xs flex items-center justify-between"
                  >
                    <span className="truncate text-slate-300 font-medium">{s.name}</span>
                    <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Pacing & Addons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Walking Pacing</label>
                <select
                  value={pacing}
                  onChange={(e) => setPacing(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="STANDARD">Regular Historian (2.5 km/h)</option>
                  <option value="RELAXED_SENIORS">Relaxed Family / Seniors (1.5 km/h)</option>
                  <option value="BRISK">Brisk Architectural (3.5 km/h)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="chkRefreshment"
                  checked={includeRefreshment}
                  onChange={(e) => setIncludeRefreshment(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500"
                />
                <label htmlFor="chkRefreshment" className="text-slate-300 cursor-pointer">
                  Irani Chai & Maska Bun Stop (+₹350/pax)
                </label>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="chkJeep"
                  checked={isVehicleRequired}
                  disabled={isCrossCluster}
                  onChange={(e) => setIncludeJeep(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500"
                />
                <label htmlFor="chkJeep" className="text-slate-300 cursor-pointer">
                  Include Open Jeep Safari {isCrossCluster ? '(Required)' : '(+₹4,500)'}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI AMBASSADOR MATCH, COMMERCIALS & DISPATCH (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* AI Ambassador Match Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Ambassador Match & Recommendation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Rule: {clientType === 'CORPORATE' ? 'VIP Seniority' : 'Fairness Round-Robin'}
              </span>
            </div>

            {assignedGuide ? (
              <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      {assignedGuide.name}
                      <span className="text-emerald-400 font-mono text-xs">({assignedGuide.rating}★)</span>
                    </div>
                    <div className="text-[11px] text-amber-400 font-medium">{assignedGuide.dayJob}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {assignedGuide.seniority.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded border border-slate-800/80">
                  {assignedGuide.matchReason || 'Top qualified candidate for this specific narrative cluster.'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Workload: {assignedGuide.toursAssignedThisMonth} walks this month</span>
                  <span className="text-emerald-400">Available on {scheduledDate}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 p-4 text-center">
                Evaluating candidate pool...
              </div>
            )}
          </div>

          {/* Commercials & GST Financial Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Custom Proposal Commercials & GST Split
            </span>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Base Curator & Ambassador Honorarium:</span>
                <span className="font-mono text-white font-medium">₹{baseCuratorFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Heritage Kits & Badges ({groupSize} Pax):</span>
                <span className="font-mono text-white font-medium">₹{perHeadFee.toLocaleString('en-IN')}</span>
              </div>
              {includeRefreshment && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Refreshment Partner Addon:</span>
                  <span className="font-mono text-white font-medium">₹{refreshmentFee.toLocaleString('en-IN')}</span>
                </div>
              )}
              {isVehicleRequired && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle Logistics (Jeep/Coach Transfer):</span>
                  <span className="font-mono text-white font-medium">₹{vehicleFee.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Courtesy / Repeat Client Discount Selector */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Courtesy / Client Discount:</span>
                <select
                  value={courtesyDiscountPercent}
                  onChange={(e) => setCourtesyDiscountPercent(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none focus:border-amber-400"
                >
                  <option value={0}>No Discount (0%)</option>
                  <option value={5}>5% Repeat Walker Courtesy</option>
                  <option value={10}>10% Institutional / Partner</option>
                  <option value={15}>15% Founder / Executive Approval</option>
                </select>
              </div>

              {courtesyDiscountPercent > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount Applied ({courtesyDiscountPercent}%):</span>
                  <span className="font-mono font-medium">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="pt-1 flex justify-between text-slate-400">
                <span>Taxable Base:</span>
                <span className="font-mono text-white font-medium">₹{netSubtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Output GST:</span>
                <span className="font-mono text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                <span className="text-white">Total Client Honorarium:</span>
                <span className="text-amber-400 font-mono text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Instant Dispatch Action Button */}
            <button
              onClick={handleGenerateAndDispatch}
              disabled={isSubmitting}
              className="w-full mt-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-3 rounded-lg transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Generating Proposal...' : '⚡ Generate & Dispatch WhatsApp Quote to Client'}
            </button>
            <div className="text-[10px] text-center text-slate-500 font-mono">
              Creates persistent proposal record and sends instant approval link to {clientPhone}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
