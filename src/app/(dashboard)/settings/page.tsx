'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, DollarSign, Landmark, Truck, Coffee, Calculator, 
  Save, CheckCircle2, RefreshCw, AlertCircle, TrendingUp, ShieldCheck 
} from 'lucide-react';

interface CostSettingsData {
  guidePayouts: {
    SENIOR_FELLOW: number;
    CORE_AMBASSADOR: number;
    APPRENTICE_GUIDE: number;
    BESPOKE_CURATOR_LEAD: number;
    EMERGENCY_SUBSTITUTION_BONUS: number;
  };
  siteEntryFees: Array<{
    id: string;
    siteName: string;
    category: string;
    feePerHeadInr: number;
    notes?: string;
  }>;
  logisticsInventory: Array<{
    id: string;
    vehicleType: string;
    provider: string;
    costInr: number;
    billingUnit: string;
    capacity: number;
  }>;
  fnbInventory: Array<{
    id: string;
    itemName: string;
    vendor: string;
    costPerHeadInr: number;
    cluster: string;
  }>;
}

export default function OperationsSettingsPage() {
  const [activeTab, setActiveTab] = useState<'GUIDES' | 'SITES' | 'FLEET' | 'FNB' | 'MARGIN_SIMULATOR'>('GUIDES');
  const [settings, setSettings] = useState<CostSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Margin Calculator State
  const [simPax, setSimPax] = useState<number>(12);
  const [simPricePerPax, setSimPricePerPax] = useState<number>(1199);
  const [simGuideSeniority, setSimGuideSeniority] = useState<'SENIOR_FELLOW' | 'CORE_AMBASSADOR' | 'APPRENTICE_GUIDE' | 'BESPOKE_CURATOR_LEAD'>('CORE_AMBASSADOR');
  const [simSelectedSites, setSimSelectedSites] = useState<string[]>(['site_asiatic']);
  const [simSelectedVehicle, setSimSelectedVehicle] = useState<string>('');
  const [simSelectedFnb, setSimSelectedFnb] = useState<string[]>(['fnb_irani_chai']);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/inventory');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setNotification('Operations inventory and fee schedules saved successfully to live database.');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Live Gross Margin Calculations
  const calcGrossMargin = () => {
    if (!settings) return { revenue: 0, cost: 0, profit: 0, marginPct: 0, breakdown: { guide: 0, sites: 0, fleet: 0, fnb: 0 } };

    const revenue = simPax * simPricePerPax;
    const guideCost = (settings.guidePayouts as any)[simGuideSeniority] || settings.guidePayouts.CORE_AMBASSADOR;

    const sitesCost = settings.siteEntryFees
      .filter((s) => simSelectedSites.includes(s.id))
      .reduce((acc, s) => acc + s.feePerHeadInr * simPax, 0);

    let fleetCost = 0;
    if (simSelectedVehicle) {
      const v = settings.logisticsInventory.find((l) => l.id === simSelectedVehicle);
      if (v) fleetCost = v.costInr;
    }

    const fnbCost = settings.fnbInventory
      .filter((f) => simSelectedFnb.includes(f.id))
      .reduce((acc, f) => acc + f.costPerHeadInr * simPax, 0);

    const totalCost = guideCost + sitesCost + fleetCost + fnbCost;
    const grossProfit = revenue - totalCost;
    const marginPct = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(1)) : 0;

    return {
      revenue,
      cost: totalCost,
      profit: grossProfit,
      marginPct,
      breakdown: {
        guide: guideCost,
        sites: sitesCost,
        fleet: fleetCost,
        fnb: fnbCost,
      },
    };
  };

  const marginData = calcGrossMargin();

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
        Loading operations pricing & cost inventory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            Operations Cost Settings & Margin Engine
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl mt-1">
            Centrally manage guide compensation rates, monument permits, vehicle logistics, and partner catering costs. 
            All changes feed directly into the Bespoke Tour Studio and calendar margin projections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSettings}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving Updates...' : 'Save Settings to DB'}
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 px-4 py-2.5 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {notification}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('GUIDES')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'GUIDES' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Guide Payout Tiers
        </button>

        <button
          onClick={() => setActiveTab('SITES')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'SITES' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          Site Entry Fees & Permits ({settings.siteEntryFees.length})
        </button>

        <button
          onClick={() => setActiveTab('FLEET')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'FLEET' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Fleet & Vehicle Logistics ({settings.logisticsInventory.length})
        </button>

        <button
          onClick={() => setActiveTab('FNB')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'FNB' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          F&B Partner Costs ({settings.fnbInventory.length})
        </button>

        <button
          onClick={() => setActiveTab('MARGIN_SIMULATOR')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'MARGIN_SIMULATOR' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Real-Time Margin Calculator
        </button>
      </div>

      {/* TAB 1: GUIDE PAYOUT TIERS */}
      {activeTab === 'GUIDES' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              Ambassador Payout Tier Schedule (INR per Walk)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Base honorarium paid to independent historians upon walk completion. Automatically synced to Tally Prime EOD ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Senior Fellow</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">Tier 1</span>
              </div>
              <p className="text-[11px] text-slate-400">Published historians, architects & advocates leading high-profile delegations.</p>
              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase block font-mono">Honorarium Rate (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    value={settings.guidePayouts.SENIOR_FELLOW}
                    onChange={(e) => setSettings({
                      ...settings,
                      guidePayouts: { ...settings.guidePayouts, SENIOR_FELLOW: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Core Ambassador</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/20">Tier 2</span>
              </div>
              <p className="text-[11px] text-slate-400">Certified field leads heading standard scheduled weekend heritage walks.</p>
              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase block font-mono">Honorarium Rate (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    value={settings.guidePayouts.CORE_AMBASSADOR}
                    onChange={(e) => setSettings({
                      ...settings,
                      guidePayouts: { ...settings.guidePayouts, CORE_AMBASSADOR: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Apprentice Guide</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">Tier 3</span>
              </div>
              <p className="text-[11px] text-slate-400">Junior docents co-leading or assisting senior guides during peak crowds.</p>
              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase block font-mono">Honorarium Rate (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    value={settings.guidePayouts.APPRENTICE_GUIDE}
                    onChange={(e) => setSettings({
                      ...settings,
                      guidePayouts: { ...settings.guidePayouts, APPRENTICE_GUIDE: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Bespoke Curator Lead</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">Custom Studio</span>
              </div>
              <p className="text-[11px] text-slate-400">Private client route design, archival research, and dedicated escort.</p>
              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase block font-mono">Curator Base Fee (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    value={settings.guidePayouts.BESPOKE_CURATOR_LEAD}
                    onChange={(e) => setSettings({
                      ...settings,
                      guidePayouts: { ...settings.guidePayouts, BESPOKE_CURATOR_LEAD: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Emergency Substitution Premium</span>
                <span className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">Urgent &lt;48h</span>
              </div>
              <p className="text-[11px] text-slate-400">Incentive bonus added when stepping in on short notice to replace a cancelled guide.</p>
              <div className="pt-2">
                <label className="text-[10px] text-slate-500 uppercase block font-mono">Bonus Added (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">₹</span>
                  <input
                    type="number"
                    value={settings.guidePayouts.EMERGENCY_SUBSTITUTION_BONUS}
                    onChange={(e) => setSettings({
                      ...settings,
                      guidePayouts: { ...settings.guidePayouts, EMERGENCY_SUBSTITUTION_BONUS: Number(e.target.value) }
                    })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-7 pr-3 text-white font-mono font-bold text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SITE ENTRY FEES */}
      {activeTab === 'SITES' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-400" />
              Monument, Library & Heritage Access Permit Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Per-head tickets and clearance permits required across Mumbai heritage landmarks.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Site / Landmark Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Access Notes</th>
                  <th className="p-3 text-right">Fee / Head (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {settings.siteEntryFees.map((site, idx) => (
                  <tr key={site.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-semibold text-white">{site.siteName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300">
                        {site.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] max-w-sm">{site.notes || 'Standard ticket'}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center">
                        <span className="text-slate-500 mr-1 font-mono">₹</span>
                        <input
                          type="number"
                          value={site.feePerHeadInr}
                          onChange={(e) => {
                            const updated = [...settings.siteEntryFees];
                            updated[idx].feePerHeadInr = Number(e.target.value);
                            setSettings({ ...settings, siteEntryFees: updated });
                          }}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono font-bold"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FLEET & VEHICLE LOGISTICS */}
      {activeTab === 'FLEET' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400" />
              Fleet Logistics & Maritime Charter Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Contracted vehicle and boat rates for #UrbanSafari open jeeps, AC coaches, and harbour cruises.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Vehicle / Craft Type</th>
                  <th className="p-3">Vendor / Provider</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Billing Unit</th>
                  <th className="p-3 text-right">Contract Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {settings.logisticsInventory.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-semibold text-white">{item.vehicleType}</td>
                    <td className="p-3 text-slate-400">{item.provider}</td>
                    <td className="p-3 font-mono">{item.capacity} Pax</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-amber-400">
                        {item.billingUnit.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center">
                        <span className="text-slate-500 mr-1 font-mono">₹</span>
                        <input
                          type="number"
                          value={item.costInr}
                          onChange={(e) => {
                            const updated = [...settings.logisticsInventory];
                            updated[idx].costInr = Number(e.target.value);
                            setSettings({ ...settings, logisticsInventory: updated });
                          }}
                          className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono font-bold"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: F&B PARTNER COSTS */}
      {activeTab === 'FNB' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              Culinary & F&B Partner Tasting Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pre-negotiated per-head tastings at legendary Mumbai bakeries, Bohri kitchens, and heritage institutions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Culinary Item / Experience</th>
                  <th className="p-3">Partner Establishment</th>
                  <th className="p-3">Cluster</th>
                  <th className="p-3 text-right">Cost / Head (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {settings.fnbInventory.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 font-semibold text-white">{item.itemName}</td>
                    <td className="p-3 text-slate-400">{item.vendor}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {item.cluster.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center">
                        <span className="text-slate-500 mr-1 font-mono">₹</span>
                        <input
                          type="number"
                          value={item.costPerHeadInr}
                          onChange={(e) => {
                            const updated = [...settings.fnbInventory];
                            updated[idx].costPerHeadInr = Number(e.target.value);
                            setSettings({ ...settings, fnbInventory: updated });
                          }}
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-white font-mono font-bold"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REAL-TIME GROSS MARGIN SIMULATOR */}
      {activeTab === 'MARGIN_SIMULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-400" />
                Live Tour Unit Economics & Margin Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Calculate margins for bespoke and scheduled tours dynamically based on active cost inventory.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="text-slate-400 block mb-1">Ticket / Per-Head Price (₹)</label>
                <input
                  type="number"
                  value={simPricePerPax}
                  onChange={(e) => setSimPricePerPax(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Group Size ({simPax} Walkers)</label>
                <input
                  type="range"
                  min="1"
                  max="35"
                  value={simPax}
                  onChange={(e) => setSimPax(Number(e.target.value))}
                  className="w-full mt-2 accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>1 VIP</span>
                  <span>12 Standard</span>
                  <span>35 Max</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Guide Seniority Tier</label>
                <select
                  value={simGuideSeniority}
                  onChange={(e) => setSimGuideSeniority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
                >
                  <option value="CORE_AMBASSADOR">Core Ambassador (₹{settings.guidePayouts.CORE_AMBASSADOR})</option>
                  <option value="SENIOR_FELLOW">Senior Fellow (₹{settings.guidePayouts.SENIOR_FELLOW})</option>
                  <option value="APPRENTICE_GUIDE">Apprentice Guide (₹{settings.guidePayouts.APPRENTICE_GUIDE})</option>
                  <option value="BESPOKE_CURATOR_LEAD">Bespoke Curator Lead (₹{settings.guidePayouts.BESPOKE_CURATOR_LEAD})</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dedicated Vehicle / Logistics</label>
                <select
                  value={simSelectedVehicle}
                  onChange={(e) => setSimSelectedVehicle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-medium"
                >
                  <option value="">None (Walking Tour)</option>
                  {settings.logisticsInventory.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleType} (+₹{v.costInr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checkboxes: Sites */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Include Monument / Permit Fees:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {settings.siteEntryFees.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 p-2 rounded bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={simSelectedSites.includes(s.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSimSelectedSites([...simSelectedSites, s.id]);
                        else setSimSelectedSites(simSelectedSites.filter((id) => id !== s.id));
                      }}
                      className="accent-amber-500 rounded"
                    />
                    <div className="truncate">
                      <div className="text-white truncate">{s.siteName}</div>
                      <div className="text-[10px] text-amber-400 font-mono">₹{s.feePerHeadInr}/head</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Checkboxes: F&B */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Include Culinary / Tasting:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {settings.fnbInventory.map((f) => (
                  <label key={f.id} className="flex items-center gap-2 p-2 rounded bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={simSelectedFnb.includes(f.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSimSelectedFnb([...simSelectedFnb, f.id]);
                        else setSimSelectedFnb(simSelectedFnb.filter((id) => id !== f.id));
                      }}
                      className="accent-amber-500 rounded"
                    />
                    <div className="truncate">
                      <div className="text-white truncate">{f.itemName}</div>
                      <div className="text-[10px] text-amber-400 font-mono">₹{f.costPerHeadInr}/head</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Economics Summary Card */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Gross Margin Projection</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                marginData.marginPct >= 50 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                marginData.marginPct >= 30 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {marginData.marginPct}% Gross Margin
              </span>
            </h3>

            {/* Big Numbers Strip */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Total Revenue</span>
                <span className="text-xl font-bold text-white font-mono">₹{marginData.revenue.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{simPax} walkers &bull; ₹{simPricePerPax} ea</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Total Direct Cost</span>
                <span className="text-xl font-bold text-rose-400 font-mono">₹{marginData.cost.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{((marginData.cost / (marginData.revenue || 1)) * 100).toFixed(1)}% of price</span>
              </div>
            </div>

            {/* Profit Highlight */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">Net Gross Profit</span>
                <span className="text-2xl font-extrabold text-white font-mono">₹{marginData.profit.toLocaleString('en-IN')}</span>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-400/80" />
            </div>

            {/* Cost Breakdown List */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Line Item Breakdown:</span>
              <div className="flex justify-between text-slate-300">
                <span>• Guide Honorarium ({simGuideSeniority.replace('_', ' ')}):</span>
                <span className="font-mono text-white">₹{marginData.breakdown.guide.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• Monument & Permit Fees ({simSelectedSites.length} sites &bull; {simPax} pax):</span>
                <span className="font-mono text-white">₹{marginData.breakdown.sites.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• Fleet & Vehicle Logistics:</span>
                <span className="font-mono text-white">₹{marginData.breakdown.fleet.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• F&B / Tasting Costs ({simSelectedFnb.length} items &bull; {simPax} pax):</span>
                <span className="font-mono text-white">₹{marginData.breakdown.fnb.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Health Tip */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {marginData.marginPct >= 50
                  ? 'Healthy profitability! Exceeds Khaki target gross margin threshold of 50%.'
                  : marginData.marginPct >= 30
                  ? 'Acceptable margin, but consider increasing group size or charging a logistics addon.'
                  : '⚠️ Low margin warning. Tour direct costs exceed 70% of gross ticket revenue.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
