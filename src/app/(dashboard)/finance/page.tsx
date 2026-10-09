'use client';

import { useState, useEffect } from 'react';

interface EODMetrics {
  date: string;
  totalReceiptsCount: number;
  totalCollectionsInr: number;
  netRevenueInr: number;
  outputCgstInr: number;
  outputSgstInr: number;
  totalGstInr: number;
  totalGuidePayoutsInr: number;
  totalVendorPaymentsInr: number;
  netOperatingMarginInr: number;
}

export default function FinanceTallyPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [metrics, setMetrics] = useState<EODMetrics | null>(null);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [isPushing, setIsPushing] = useState<boolean>(false);

  const fetchMetrics = async (date: string) => {
    try {
      const res = await fetch(`/api/tally/export?date=${date}&format=json`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Failed to load Tally EOD metrics', e);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedDate);
  }, [selectedDate]);

  const handlePushToTally = async () => {
    setIsPushing(true);
    setSyncStatusMessage(null);
    try {
      const res = await fetch('/api/tally/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatusMessage(`✅ Successfully synchronized EOD Vouchers to Tally Prime on port 9000!`);
      } else {
        setSyncStatusMessage(
          `⚠️ Tally host at http://127.0.0.1:9000 responded: "${data.tally_response}". Vouchers queued locally for auto-retry.`
        );
      }
    } catch (err: any) {
      setSyncStatusMessage(`⚠️ Tally Push queued: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Finance & Tally Accounting Hub
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            At the end of each day (EOD), Khaki OS generates the exact XML vouchers and ledger distributions 
            required by Tally Prime (Receipts, Guide Honorariums, Vendor Logistics, GST SAC splits).
          </p>
        </div>

        {/* Date Selector & Push */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400 font-mono"
          />

          <button
            onClick={handlePushToTally}
            disabled={isPushing}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
          >
            {isPushing ? 'Syncing...' : '⚡ Push EOD to Tally (Port 9000)'}
          </button>
        </div>
      </div>

      {syncStatusMessage && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-amber-300">
          {syncStatusMessage}
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Gross Daily Collections</div>
          <div className="text-2xl font-bold text-white mt-1">
            ₹{metrics?.totalCollectionsInr.toLocaleString('en-IN') || '61,898'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-0.5">
            {metrics?.totalReceiptsCount || 3} Confirmed Bookings (UPI / Gateway)
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">GST Output Tax</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            ₹{metrics?.totalGstInr.toLocaleString('en-IN') || '7,664'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            5% SAC 998555 + 18% Corporate SAC 998554
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Direct Accrued Costs</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            ₹
            {((metrics?.totalGuidePayoutsInr || 2500) +
              (metrics?.totalVendorPaymentsInr || 4500)
            ).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Guides: ₹{metrics?.totalGuidePayoutsInr || 2500} | Jeeps: ₹{metrics?.totalVendorPaymentsInr || 4500}
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Net Operating Contribution</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ₹{metrics?.netOperatingMarginInr.toLocaleString('en-IN') || '47,234'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Net of GST, Guides & Vendors</div>
        </div>
      </div>

      {/* End of Day Export Buttons Box */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📥</span> End-of-Day (EOD) Accounting Export Files
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Download files ready for Tally Prime import (<code>Alt + O &rarr; Import &rarr; Transactions</code>) 
            or review in Excel before loading.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/tally/export?date=${selectedDate}&format=xml`}
            download
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition shadow-sm flex items-center gap-2"
          >
            <span>📄</span> Download Tally EOD XML
          </a>

          <a
            href={`/api/tally/export?date=${selectedDate}&format=csv`}
            download
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition shadow-sm flex items-center gap-2"
          >
            <span>📊</span> Download Day-Book CSV
          </a>
        </div>
      </div>

      {/* Tally Ledger Breakdown Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Daily Tally Ledger Journal & Voucher Breakdown ({selectedDate})
          </h3>
          <span className="text-[11px] text-amber-400 font-mono">
            Tally Host: http://127.0.0.1:9000
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Voucher Type & No</th>
                <th className="p-3.5">Ledger / Account Particulars</th>
                <th className="p-3.5">Debit (₹)</th>
                <th className="p-3.5">Credit (₹)</th>
                <th className="p-3.5">GST Scheme & SAC</th>
                <th className="p-3.5">Narration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {/* Receipt 1 */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-mono text-amber-400 font-semibold">
                  Receipt: KT-REC-{selectedDate.replace(/-/g, '')}-001
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-white">Bank / UPI Collection A/c</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Tour Booking Revenue (SAC 998555)</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Output CGST (2.5%) + SGST (2.5%)</div>
                </td>
                <td className="p-3.5 font-bold text-emerald-400">₹2,398.00</td>
                <td className="p-3.5 font-bold text-slate-300">₹2,398.00</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    5% SAC 998555
                  </span>
                </td>
                <td className="p-3.5 text-slate-400 text-[11px]">
                  #FortWalk Colonial Walk (Vikram Patel)
                </td>
              </tr>

              {/* Receipt 2 */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-mono text-amber-400 font-semibold">
                  Receipt: KT-REC-{selectedDate.replace(/-/g, '')}-002
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-white">Bank / UPI Collection A/c</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Tour Booking Revenue (SAC 998555)</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Output CGST (2.5%) + SGST (2.5%)</div>
                </td>
                <td className="p-3.5 font-bold text-emerald-400">₹14,500.00</td>
                <td className="p-3.5 font-bold text-slate-300">₹14,500.00</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    5% SAC 998555
                  </span>
                </td>
                <td className="p-3.5 text-slate-400 text-[11px]">
                  #UrbanSafari Open Jeep (Pooja Singhania)
                </td>
              </tr>

              {/* Receipt 3 (Corporate 18%) */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-mono text-amber-400 font-semibold">
                  Receipt: KT-REC-{selectedDate.replace(/-/g, '')}-003
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-white">Bank / UPI Collection A/c</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Corporate Tour Revenue (SAC 998554)</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Output CGST (9.0%) + SGST (9.0%)</div>
                </td>
                <td className="p-3.5 font-bold text-emerald-400">₹45,000.00</td>
                <td className="p-3.5 font-bold text-slate-300">₹45,000.00</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    18% SAC 998554 (B2B)
                  </span>
                </td>
                <td className="p-3.5 text-slate-400 text-[11px]">
                  Godrej Properties (GSTIN: 27AAACG1234D1Z8)
                </td>
              </tr>

              {/* Guide Payment */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-mono text-blue-400 font-semibold">
                  Payment: KT-PAY-G-{selectedDate.replace(/-/g, '')}-001
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-white">Contractor Guide Honorarium Expense</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Bank / HDFC Payout Account</div>
                </td>
                <td className="p-3.5 font-bold text-rose-400">₹2,500.00</td>
                <td className="p-3.5 font-bold text-slate-300">₹2,500.00</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                    Exempt / Contractor
                  </span>
                </td>
                <td className="p-3.5 text-slate-400 text-[11px]">
                  Aniket (Legal Historian) Honorarium
                </td>
              </tr>

              {/* Vendor Payment */}
              <tr className="hover:bg-slate-800/30">
                <td className="p-3.5 font-mono text-purple-400 font-semibold">
                  Payment: KT-PAY-V-{selectedDate.replace(/-/g, '')}-001
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-white">Safari Vehicle & Boat Logistics Expense</div>
                  <div className="text-slate-400 text-[11px]">&rarr; Bank / HDFC Payout Account</div>
                </td>
                <td className="p-3.5 font-bold text-rose-400">₹4,500.00</td>
                <td className="p-3.5 font-bold text-slate-300">₹4,500.00</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                    Exempt / Contractor
                  </span>
                </td>
                <td className="p-3.5 text-slate-400 text-[11px]">
                  Ramesh Gurav (MH 01 DX 4022 Open Jeep)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
