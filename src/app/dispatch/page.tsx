'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DispatchItem {
  id: string;
  bookingRef: string;
  tourTitle: string;
  category: 'STANDARD_WALK' | 'PRIVATE_GROUP' | 'INTERNATIONAL';
  resourceType: 'GUIDE' | 'JEEP' | 'BOAT' | 'DMC';
  entityName: string;
  entityRoleOrVehicle: string;
  entityPhone: string;
  payoutInr: number;
  status: 'UNASSIGNED' | 'BROADCAST_SENT' | 'ACCEPTED' | 'EXPIRED' | 'DECLINED';
  timeLeftMinutes: number;
  channel: 'WHATSAPP_DIRECT' | 'WHATSAPP_GROUP' | 'VOICE_CALL';
}

interface GuideContractor {
  id: string;
  name: string;
  dayJob: string;
  specializations: string[];
  phone: string;
  status: 'AVAILABLE' | 'ON_TOUR' | 'AT_DAY_JOB';
  rating: number;
}

interface LogisticsVendor {
  id: string;
  name: string;
  company: string;
  type: 'JEEP_DRIVER' | 'BOAT_CAPTAIN' | 'E_VICTORIA' | 'F_AND_B';
  vehicleOrVessel: string;
  baseLocation: string;
  phone: string;
  rateInr: number;
  preferredChannel: string;
}

export default function DispatchBoardPage() {
  const [activeView, setActiveView] = useState<'dispatches' | 'guides' | 'vendors'>('dispatches');

  const [dispatches, setDispatches] = useState<DispatchItem[]>([
    {
      id: 'disp-101',
      bookingRef: 'KT-BKG-8901',
      tourTitle: 'Fort Heritage Walk (Sat 4:00 PM)',
      category: 'PRIVATE_GROUP',
      resourceType: 'GUIDE',
      entityName: 'Aniket',
      entityRoleOrVehicle: 'Bombay High Court Lawyer (Contractor)',
      entityPhone: '+91 98200 11992',
      payoutInr: 2500,
      status: 'BROADCAST_SENT',
      timeLeftMinutes: 18,
      channel: 'WHATSAPP_DIRECT',
    },
    {
      id: 'disp-102',
      bookingRef: 'KT-BKG-8902',
      tourTitle: 'Vintage Open Jeep Safari (Sun 8:30 AM)',
      category: 'PRIVATE_GROUP',
      resourceType: 'JEEP',
      entityName: 'Ramesh Gurav',
      entityRoleOrVehicle: 'MH 01 DX 4022 (Open Safari Jeep)',
      entityPhone: '+91 98202 33881',
      payoutInr: 4500,
      status: 'ACCEPTED',
      timeLeftMinutes: 0,
      channel: 'WHATSAPP_DIRECT',
    },
    {
      id: 'disp-103',
      bookingRef: 'KT-BKG-8904',
      tourTitle: 'Mumbai Harbour Historic Cruise (Sun 4:00 PM)',
      category: 'PRIVATE_GROUP',
      resourceType: 'BOAT',
      entityName: 'Captain Dattaram Koli',
      entityRoleOrVehicle: 'Vessel Sagarika (Reg BMB-782, Jetty #4)',
      entityPhone: '+91 98199 44021',
      payoutInr: 8500,
      status: 'UNASSIGNED',
      timeLeftMinutes: 30,
      channel: 'VOICE_CALL',
    },
    {
      id: 'disp-104',
      bookingRef: 'KT-BKG-8905',
      tourTitle: 'Gamdevi & Gowalia Tank Heritage Walk (Sun 10:00 AM)',
      category: 'PRIVATE_GROUP',
      resourceType: 'GUIDE',
      entityName: 'Ambassador Pool Broadcast',
      entityRoleOrVehicle: 'Multi-Cast to South Mumbai Guides Group',
      entityPhone: 'Khaki Ambassadors WhatsApp Group',
      payoutInr: 2500,
      status: 'BROADCAST_SENT',
      timeLeftMinutes: 24,
      channel: 'WHATSAPP_GROUP',
    },
  ]);

  const [guides] = useState<GuideContractor[]>([
    {
      id: 'g-001',
      name: 'Bharat Gothoskar',
      dayJob: 'Founder & CEO (Mechanical Engineer, Ex-Godrej/Mahindra)',
      specializations: ['Fort Colonial History', 'Parel Textile Mills', 'Urban Safari'],
      phone: '+91 98200 11001',
      status: 'AVAILABLE',
      rating: 4.99,
    },
    {
      id: 'g-002',
      name: 'Aniket',
      dayJob: 'Bombay High Court Lawyer & Legal Historian',
      specializations: ['Legal Heritage', 'Colonial Institutions', 'High Court'],
      phone: '+91 98200 11992',
      status: 'AVAILABLE',
      rating: 4.96,
    },
    {
      id: 'g-003',
      name: 'Anvi',
      dayJob: 'Corporate Spanish Interpreter & Cultural Researcher',
      specializations: ['Foreign Delegations', 'Bandra Villages', 'Art Deco'],
      phone: '+91 98200 11993',
      status: 'AT_DAY_JOB',
      rating: 4.98,
    },
    {
      id: 'g-004',
      name: 'Dr. Sudhir Gadre',
      dayJob: 'Consultant Physician & Maritime Historian',
      specializations: ['Mazgaon Docks', 'Naval History', 'Colaba Military'],
      phone: '+91 98200 11994',
      status: 'AVAILABLE',
      rating: 4.94,
    },
  ]);

  const [vendors] = useState<LogisticsVendor[]>([
    {
      id: 'v-001',
      name: 'Ramesh Gurav',
      company: 'Coastal Heritage Safari Fleets',
      type: 'JEEP_DRIVER',
      vehicleOrVessel: 'MH 01 DX 4022 (Open Safari Jeep)',
      baseLocation: 'Horniman Circle / Ballard Estate',
      phone: '+91 98202 33881',
      rateInr: 4500,
      preferredChannel: 'WhatsApp Direct (Voice/Buttons)',
    },
    {
      id: 'v-002',
      name: 'Captain Dattaram Koli',
      company: 'Apollo Bunder Traditional Seacrafts',
      type: 'BOAT_CAPTAIN',
      vehicleOrVessel: 'Vessel Sagarika (BMB-782)',
      baseLocation: 'Gateway of India Jetty #4',
      phone: '+91 98199 44021',
      rateInr: 8500,
      preferredChannel: 'Automated Voice Call + WhatsApp',
    },
    {
      id: 'v-003',
      name: 'Sachin Kadam',
      company: 'Suburban Safari Wheels',
      type: 'JEEP_DRIVER',
      vehicleOrVessel: 'MH 02 EF 1190 (Green Canvas Jeep)',
      baseLocation: 'Bandra West / Bandra Fort',
      phone: '+91 98204 77119',
      rateInr: 4500,
      preferredChannel: 'WhatsApp Direct',
    },
    {
      id: 'v-004',
      name: 'Irfan Khan',
      company: 'Royal Victoria E-Carriages',
      type: 'E_VICTORIA',
      vehicleOrVessel: 'E-Carriage Gold #03',
      baseLocation: 'Marine Drive Promenade',
      phone: '+91 98208 66231',
      rateInr: 3500,
      preferredChannel: 'WhatsApp Direct',
    },
  ]);

  useEffect(() => {
    async function fetchLiveDispatches() {
      try {
        const res = await fetch('/api/dispatch');
        if (res.ok) {
          const data = await res.json();
          if (data.dispatches && data.dispatches.length > 0) {
            setDispatches((prev) => {
              const existingIds = new Set(prev.map((d) => d.id));
              const newItems = data.dispatches.filter((d: any) => !existingIds.has(d.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (e) {
        console.error('Failed to load live dispatches', e);
      }
    }
    fetchLiveDispatches();
  }, []);

  const simulateAction = async (id: string, newStatus: DispatchItem['status']) => {
    // Optimistic UI update
    setDispatches((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus, entityName: newStatus === 'ACCEPTED' ? (d.entityName.includes('Broadcast') ? 'Farhan K. (Assigned Guide)' : d.entityName) : d.entityName } : d))
    );

    // Persist to server store
    try {
      await fetch('/api/dispatch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatch_id: id,
          status: newStatus,
          entity_name: newStatus === 'ACCEPTED' ? 'Farhan K. (Assigned Ambassador)' : undefined,
        }),
      });
    } catch (err) {
      console.error('Failed to sync dispatch status to server:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Guide & Vendor Dispatch Center
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Guides and vendors are independent contractors with primary day jobs. 
            They will <strong>never log into a software portal</strong>; all interaction is handled via 
            n8n-orchestrated WhatsApp buttons, group broadcasts, and voice prompts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/automations"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            ⚙️ View n8n Workflows
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Active Broadcasts</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">2 Awaiting Reply</div>
          <div className="text-[11px] text-slate-500 mt-0.5">30-min SLA timer running</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Confirmed / Locked</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">1 Resource Locked</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Jeep Driver Ramesh confirmed</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Contractor Ambassadors</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">36 Guides</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Zero-portal requirement</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Logistics Partners</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">4 Active Fleets</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Jeeps, Boats, E-Victorias</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveView('dispatches')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeView === 'dispatches'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Tour Dispatches ({dispatches.length})
        </button>
        <button
          onClick={() => setActiveView('guides')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeView === 'guides'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ambassador Contractor Roster (36)
        </button>
        <button
          onClick={() => setActiveView('vendors')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeView === 'vendors'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Jeep & Marine Vendors Directory (4 Fleets)
        </button>
      </div>

      {/* View 1: Dispatches Table */}
      {activeView === 'dispatches' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Ref / Tour</th>
                  <th className="p-3.5">Resource & Type</th>
                  <th className="p-3.5">Assigned Target</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Payout</th>
                  <th className="p-3.5">Status & Timer</th>
                  <th className="p-3.5 text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {dispatches.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{item.bookingRef}</div>
                      <div className="text-slate-400 text-[11px]">{item.tourTitle}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.resourceType === 'GUIDE'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : item.resourceType === 'JEEP'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {item.resourceType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{item.entityName}</div>
                      <div className="text-[11px] text-slate-400">{item.entityRoleOrVehicle}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.entityPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.channel === 'WHATSAPP_DIRECT'
                          ? 'Direct WA'
                          : item.channel === 'WHATSAPP_GROUP'
                          ? 'WA Group'
                          : 'Voice Call'}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      ₹{item.payoutInr.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : item.status === 'BROADCAST_SENT'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.status === 'BROADCAST_SENT' && (
                          <span className="text-[11px] text-amber-500 animate-pulse font-mono">
                            ⏳ {item.timeLeftMinutes}m left
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      {item.status === 'BROADCAST_SENT' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => simulateAction(item.id, 'ACCEPTED')}
                            className="w-7 h-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center"
                            title="Accept Dispatch"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => simulateAction(item.id, 'DECLINED')}
                            className="w-7 h-7 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center"
                            title="Decline Dispatch"
                          >
                            ✕
                          </button>
                        </div>
                      ) : item.status === 'UNASSIGNED' ? (
                        <button
                          onClick={() => simulateAction(item.id, 'BROADCAST_SENT')}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] transition"
                        >
                          Send Broadcast
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-[11px] font-medium">
                          ✓ Locked & Briefed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Guide Contractors Roster */}
      {activeView === 'guides' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <strong className="text-white">Volunteer & Contractor Operating Model:</strong> All 36 ambassadors 
              maintain demanding professional careers in Mumbai (law, medicine, finance, technology). 
              They interact solely through WhatsApp buttons; no login portal is required or permitted.
            </div>
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded border border-amber-500/20">
              Zero Login Portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((g) => (
              <div key={g.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{g.name}</h3>
                    <div className="text-xs text-amber-400 font-medium mt-0.5">{g.dayJob}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-emerald-500/20">
                    ⭐ {g.rating}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Specializations:</div>
                  <div className="flex flex-wrap gap-1">
                    {g.specializations.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-300">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">{g.phone}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => alert(`Simulated WhatsApp direct prompt sent to ${g.name} (${g.phone})`)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold transition"
                    >
                      💬 WhatsApp Direct
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 3: Vendors Directory */}
      {activeView === 'vendors' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <strong className="text-white">Vendor Partner Operational Profile:</strong> Open safari jeep drivers, 
              sailboat captains, and electric carriage operators. Interacted with exclusively via automated WhatsApp 
              and voice prompts.
            </div>
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded border border-purple-500/20">
              Zero Login Portal
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => (
              <div key={v.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{v.name}</h3>
                    <div className="text-xs text-slate-300">{v.company}</div>
                    <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                      {v.vehicleOrVessel}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400 border border-amber-500/20">
                    ₹{v.rateInr.toLocaleString('en-IN')}/tour
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-0.5">
                  <div>📍 Base: <span className="text-slate-200">{v.baseLocation}</span></div>
                  <div>📡 Preferred: <span className="text-slate-200">{v.preferredChannel}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">{v.phone}</span>
                  <button
                    onClick={() => alert(`Simulated WhatsApp logistics order sent to ${v.name} (${v.phone})`)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] transition"
                  >
                    🚙 Trigger WhatsApp Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
