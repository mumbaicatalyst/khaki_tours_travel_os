'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WebhookLog {
  event: string;
  timestamp: string;
  status: string;
  targetUrl?: string;
  payload: Record<string, any>;
}

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'tester' | 'logs'>('workflows');
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/webhooks/outbound');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.recent_events || []);
      }
    } catch (e) {
      console.error('Failed to load webhook logs', e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggerTestEvent = async (
    eventType: string,
    samplePayload: Record<string, any>
  ) => {
    setIsLoading(true);
    setTestStatus(null);
    try {
      const res = await fetch('/api/webhooks/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventType,
          payload: samplePayload,
        }),
      });
      const data = await res.json();
      setTestStatus(`✅ Event "${eventType}" successfully dispatched! (Status: ${data.status})`);
      fetchLogs();
    } catch (err: any) {
      setTestStatus(`❌ Failed to emit event: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Automations & External Integrations
          </h1>
          <p className="text-xs text-slate-400 max-w-3xl mt-1">
            Khaki OS acts as the core controlling and data layer. External workflows in n8n or Make.com orchestrate 
            multichannel communications with <strong>contractor guides</strong>, <strong>jeep/boat vendors</strong>, 
            and <strong>voice AI</strong> with <em>zero portal login requirements</em>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dispatch"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            Go to Dispatch Board &rarr;
          </Link>
        </div>
      </div>

      {/* Zero-Login Operating Architecture Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          The Three-Tier Operating Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              1. Khaki OS (Internal Cockpit)
            </div>
            <div className="text-xs font-medium text-slate-200 mt-1">Bharat, Priya & Internal Ops Desk</div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              The single controlling layer and source of truth for tour inventory, calendar slots, state machines, KYC manifests, and corporate proposals.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              2. Orchestration Layer (n8n / Make.com)
            </div>
            <div className="text-xs font-medium text-slate-200 mt-1">Event Routers & 30m / 15m Timers</div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Listens to OS webhooks, handles multi-cast broadcasts to WhatsApp groups/direct chats, manages 30-min timeouts, and alerts Priya on escalations.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              3. External Actors (100% Zero-Login)
            </div>
            <div className="text-xs font-medium text-slate-200 mt-1">Ambassador Guides & Jeep/Boat Drivers</div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              Volunteer working professionals (lawyers, doctors) and vehicle operators. They will <strong>never log into an app</strong>; they communicate solely via WhatsApp interactive buttons & voice.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'workflows'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          n8n Blueprints & Workflows (4)
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'tester'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Webhook Testbench & Simulation
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'logs'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Outbound Event Delivery Log ({logs.length})
        </button>
      </div>

      {/* Tab 1: Workflows */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blueprint 1 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Blueprint 01
                </span>
                <span className="text-[11px] text-slate-400">Target: Ambassador Pool</span>
              </div>
              <h3 className="text-sm font-bold text-white">Guide Parallel Dispatch & 30m Escalation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a private tour is booked, Khaki OS emits <code>GUIDE_DISPATCH_TRIGGERED</code>. 
                n8n multicasts interactive WhatsApp buttons (`[✅ Accept Tour]` / `[❌ Decline]`) to eligible guides.
                If no guide claims the slot within 30 minutes, an escalation alert automatically fires to Priya&apos;s phone.
              </p>
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                File: /integrations/n8n/01_guide_parallel_dispatch_and_escalation.json
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 mt-4">
              <span className="text-[11px] text-emerald-400 font-medium">Ready to Import</span>
              <button
                onClick={() =>
                  triggerTestEvent('GUIDE_DISPATCH_TRIGGERED', {
                    dispatch_id: 'disp_demo_01',
                    tour_title: 'Fort Heritage Walk',
                    departure_date: 'This Saturday at 4:30 PM',
                    group_size: 16,
                    payout_amount_inr: 2500,
                    target_phones: ['+919820011992', '+919820011001'],
                  })
                }
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded transition"
              >
                ⚡ Test Trigger
              </button>
            </div>
          </div>

          {/* Blueprint 2 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Blueprint 02
                </span>
                <span className="text-[11px] text-slate-400">Target: Assigned Guide</span>
              </div>
              <h3 className="text-sm font-bold text-white">Automated T-Minus 2h Manifest Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A 15-minute cron in n8n queries Khaki OS for departures starting in 2 hours.
                It pulls verified guest manifests, dietary restrictions, and emergency contacts, then delivers 
                a one-tap briefing sheet with a Google Maps pin to the guide&apos;s WhatsApp direct message or group.
              </p>
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                File: /integrations/n8n/02_automated_t_minus_2h_manifest_delivery.json
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 mt-4">
              <span className="text-[11px] text-emerald-400 font-medium">Ready to Import</span>
              <button
                onClick={() =>
                  triggerTestEvent('T_MINUS_2H_BRIEFING_TRIGGERED', {
                    tour_title: '#UrbanSafari Open Jeep',
                    start_time: '16:30 Today',
                    meeting_point: 'Asiatic Society Steps, Horniman Circle',
                    guide_name: 'Aniket (Legal Historian)',
                    guide_phone: '+919820011992',
                    pax_count: 14,
                    dietary_notes: '2 Jain, 1 Vegan',
                  })
                }
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded transition"
              >
                ⚡ Test Trigger
              </button>
            </div>
          </div>

          {/* Blueprint 3 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Blueprint 03
                </span>
                <span className="text-[11px] text-slate-400">Target: Jeep & Boat Vendors</span>
              </div>
              <h3 className="text-sm font-bold text-white">Vendor Logistics Dispatch (Jeep / Boat)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dispatches open safari jeep drivers (Ramesh Gurav) and sailboat captains (Capt. Dattaram Koli) 
                via WhatsApp interactive cards. Contains pickup location, date, pax count, vehicle number, and single-tap 
                acknowledgement buttons (`[✅ Vehicle Confirmed]` / `[❌ Unavailable]`).
              </p>
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                File: /integrations/n8n/03_vendor_jeep_boat_logistics_dispatch.json
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 mt-4">
              <span className="text-[11px] text-emerald-400 font-medium">Ready to Import</span>
              <button
                onClick={() =>
                  triggerTestEvent('VENDOR_LOGISTICS_TRIGGERED', {
                    vendor_id: 'vnd_jeep_001',
                    vendor_name: 'Ramesh Gurav',
                    vendor_phone: '+919820233881',
                    service_name: 'Vintage Open Jeep #UrbanSafari',
                    vehicle_number: 'MH 01 DX 4022',
                    scheduled_time: 'Sunday at 8:30 AM',
                    pickup_landmark: 'Horniman Circle Garden Gate',
                    pax_count: 6,
                    payout_inr: 4500,
                  })
                }
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded transition"
              >
                ⚡ Test Trigger
              </button>
            </div>
          </div>

          {/* Blueprint 4 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Blueprint 04
                </span>
                <span className="text-[11px] text-slate-400">Target: Bharat Gothoskar / Priya</span>
              </div>
              <h3 className="text-sm font-bold text-white">Corporate B2B Lead 15m SLA Guard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inbound WhatsApp inquiries from corporate clients (Godrej, Mahindra, consulates) are scored 
                by Khaki OS. P1 leads initiate a 15-minute countdown. If no staff member claims the conversation within 
                15 minutes, n8n sends an immediate high-priority escalation ping to Bharat&apos;s personal WhatsApp.
              </p>
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                File: /integrations/n8n/04_corporate_b2b_lead_sla_escalation.json
              </div>
            </div>
            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 mt-4">
              <span className="text-[11px] text-emerald-400 font-medium">Ready to Import</span>
              <button
                onClick={() =>
                  triggerTestEvent('CORPORATE_SLA_BREACH', {
                    client_name: 'Mahindra & Mahindra Group',
                    contact_person: 'Ananya Roy',
                    contact_phone: '+919833188992',
                    pax_count: 22,
                    inquiry_text: 'Need South Mumbai architectural walk for executive leadership offsite next month.',
                    sla_minutes_elapsed: 15,
                  })
                }
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded transition"
              >
                ⚡ Test Trigger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Testbench */}
      {activeTab === 'tester' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Live Webhook Testbench</h3>
          <p className="text-xs text-slate-400">
            Send test events from Khaki OS into your active n8n or Make.com instance. 
            All dispatched events will be captured in the event log below.
          </p>

          {testStatus && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-400">
              {testStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              disabled={isLoading}
              onClick={() =>
                triggerTestEvent('GUIDE_DISPATCH_TRIGGERED', {
                  dispatch_id: `disp_test_${Date.now()}`,
                  tour_title: 'Bespoke Colaba Heritage Walk',
                  departure_date: 'Tomorrow at 10:00 AM',
                  group_size: 12,
                  payout_amount_inr: 2500,
                  target_phones: ['+919820011992'],
                })
              }
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white">Trigger Guide Dispatch Event</div>
                <div className="text-[11px] text-slate-400">Simulates WhatsApp button multicast to contractor guides</div>
              </div>
              <span className="text-amber-400 font-bold text-sm">&rarr;</span>
            </button>

            <button
              disabled={isLoading}
              onClick={() =>
                triggerTestEvent('VENDOR_LOGISTICS_TRIGGERED', {
                  vendor_id: 'vnd_boat_001',
                  vendor_name: 'Captain Dattaram Koli',
                  vendor_phone: '+919819944021',
                  service_name: 'Mumbai Harbour Historic Sail',
                  vehicle_number: 'Vessel Sagarika (Registration BMB-782)',
                  scheduled_time: 'Sunday 4:00 PM',
                  pickup_landmark: 'Gateway of India Jetty #4',
                  pax_count: 10,
                  payout_inr: 8500,
                })
              }
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left transition flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white">Trigger Boat / Jeep Vendor Event</div>
                <div className="text-[11px] text-slate-400">Simulates WhatsApp logistics dispatch to Captain Koli</div>
              </div>
              <span className="text-amber-400 font-bold text-sm">&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Outbound Webhook Delivery History
            </h3>
            <button
              onClick={fetchLogs}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              ↻ Refresh Logs
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No webhook events dispatched yet. Use the Testbench tab to fire sample events.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 font-mono text-xs max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="p-3.5 hover:bg-slate-800/30 transition flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold">{log.event}</span>
                    <span className="text-[11px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Status: <span className="text-emerald-400 font-semibold">{log.status}</span>
                  </div>
                  <pre className="text-[10px] text-slate-500 bg-slate-950 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
