'use client';

import { useState } from 'react';
import { CorporateProposal } from '@/types/database';
import { CorporateProposalBuilder } from '@/modules/corporate/proposal-builder';

export default function CorporateProposalsPage() {
  const [proposals, setProposals] = useState<CorporateProposal[]>([
    {
      id: 'prop-01',
      proposal_reference: 'KT-CORP-2026-0041',
      organization_id: 'org-01',
      contact_id: 'cnt-01',
      proposed_date: '2026-10-24T16:00:00Z',
      group_size: 45,
      custom_price_per_pax: 1250,
      subtotal_amount_inr: 56250,
      gst_scheme: 'STANDARD_18_PERCENT',
      gst_rate_percent: 18.0,
      gst_tax_amount_inr: 10125,
      grand_total_inr: 66375,
      validity_date: '2026-10-18',
      status: 'SENT',
      special_briefing_notes: 'Godrej Leadership Offsite: Fort Architectural Walk split into 3 cohorts with senior historians.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prop-02',
      proposal_reference: 'KT-CORP-2026-0042',
      organization_id: 'org-02',
      contact_id: 'cnt-02',
      proposed_date: '2026-10-30T09:00:00Z',
      group_size: 30,
      custom_price_per_pax: 1500,
      subtotal_amount_inr: 45000,
      gst_scheme: 'STANDARD_18_PERCENT',
      gst_rate_percent: 18.0,
      gst_tax_amount_inr: 8100,
      grand_total_inr: 53100,
      validity_date: '2026-10-22',
      status: 'ACCEPTED',
      special_briefing_notes: 'Consulate of Spain Delegation: Private heritage walk in Spanish & English.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [bookerName, setBookerName] = useState('');
  const [bookerEmail, setBookerEmail] = useState('');
  const [bookerPhone, setBookerPhone] = useState('');
  const [groupSize, setGroupSize] = useState(30);
  const [ratePerPax, setRatePerPax] = useState(1200);
  const [proposedDate, setProposedDate] = useState('2026-11-05');
  const [notes, setNotes] = useState('');

  const subtotal = groupSize * ratePerPax;
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst;
  const recommendedGuides = Math.ceil(groupSize / 20);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = CorporateProposalBuilder.createProposal({
      company_name: companyName,
      gstin,
      booker_name: bookerName,
      booker_email: bookerEmail,
      booker_phone: bookerPhone,
      tour_title: 'Custom Corporate Heritage Experience',
      proposed_date: `${proposedDate}T16:00:00Z`,
      group_size: groupSize,
      custom_price_per_pax: ratePerPax,
      special_requirements: notes,
    });

    setProposals([result.proposal, ...proposals]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Corporate B2B & Institutional Proposals</h1>
          <p className="text-xs text-slate-400">
            Tailored quotes for corporate retreats, diplomatic delegations & schools. Automated 18% GST (SAC 998554), cohort guide allocation & Net-15 terms.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center gap-1.5"
        >
          <span>+</span> Build B2B Proposal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Active B2B Pipeline</div>
          <div className="text-2xl font-bold text-white mt-1">₹1,19,475</div>
          <div className="text-[11px] text-slate-500 mt-0.5">2 Formal Quotes Issued</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Corporate GST Scheme</div>
          <div className="text-base font-semibold text-amber-400 mt-1">18% Standard GST</div>
          <div className="text-[11px] text-slate-400 mt-0.5">SAC Code: 998554 (Full ITC Eligible)</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-400">Cohort Safety Policy</div>
          <div className="text-base font-semibold text-emerald-400 mt-1">Max 20 Pax / Ambassador</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Automated Multi-Guide Allocation</div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="p-3.5">Proposal Ref</th>
              <th className="p-3.5">Proposed Date</th>
              <th className="p-3.5">Group Size & Cohorts</th>
              <th className="p-3.5">Rate / Pax</th>
              <th className="p-3.5">Subtotal</th>
              <th className="p-3.5">18% GST</th>
              <th className="p-3.5">Grand Total</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {proposals.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30">
                <td className="p-3.5 font-mono font-bold text-white">{p.proposal_reference}</td>
                <td className="p-3.5 text-slate-300">
                  {new Date(p.proposed_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-white">{p.group_size} Guests</div>
                  <div className="text-[10px] text-amber-400 font-mono">
                    {Math.ceil(p.group_size / 20)} Guide Cohort(s)
                  </div>
                </td>
                <td className="p-3.5">₹{p.custom_price_per_pax.toLocaleString('en-IN')}</td>
                <td className="p-3.5">₹{p.subtotal_amount_inr.toLocaleString('en-IN')}</td>
                <td className="p-3.5 text-amber-400">₹{p.gst_tax_amount_inr.toLocaleString('en-IN')}</td>
                <td className="p-3.5 font-bold text-white">₹{p.grand_total_inr.toLocaleString('en-IN')}</td>
                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 'ACCEPTED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Build Formal Corporate B2B Quote</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Organization / Client Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Mahindra & Mahindra Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Client GSTIN (For ITC Invoicing)</label>
                  <input
                    type="text"
                    placeholder="27AABCU9603R1ZM"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Booker Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Priya Nair"
                    value={bookerName}
                    onChange={(e) => setBookerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Booker Email</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@corp.com"
                    value={bookerEmail}
                    onChange={(e) => setBookerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Booker Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 12345"
                    value={bookerPhone}
                    onChange={(e) => setBookerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Group Size (Pax)</label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Custom Rate / Pax (INR)</label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={ratePerPax}
                    onChange={(e) => setRatePerPax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Proposed Date</label>
                  <input
                    type="date"
                    required
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-white"
                  />
                </div>
              </div>

              {/* Real-time Tax & Cohort Calculation Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal ({groupSize} Pax @ ₹{ratePerPax}):</span>
                  <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Output GST @ 18% (SAC 998554):</span>
                  <span className="font-mono">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm border-t border-slate-800 pt-2">
                  <span>Grand Total (All-Inclusive):</span>
                  <span className="font-mono text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[11px] text-blue-400 pt-1">
                  👥 Cohort Allocation: Requires {recommendedGuides} Ambassadors (Max 20 guests per cohort)
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md shadow-md"
                >
                  Generate & Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
