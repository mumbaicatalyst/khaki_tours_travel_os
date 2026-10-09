'use client';

import { useState, useMemo } from 'react';
import { FxSimulatorEngine } from '@/modules/fx-simulator/calculator';

export default function InternationalFxPage() {
  const [costUsd, setCostUsd] = useState<number>(2200);
  const [spotRate, setSpotRate] = useState<number>(83.5);
  const [bufferPercentage, setBufferPercentage] = useState<number>(3.5);
  const [targetMargin, setTargetMargin] = useState<number>(22.0);

  // Settlement simulator state
  const [settlementSpotRate, setSettlementSpotRate] = useState<number>(88.0);

  const quoteResult = useMemo(() => {
    return FxSimulatorEngine.calculateQuote({
      tourId: 'intl-demo',
      costUsd,
      spotUsdInr: spotRate,
      bufferPercentage,
      targetMarginPercentage: targetMargin,
    });
  }, [costUsd, spotRate, bufferPercentage, targetMargin]);

  const settlementResult = useMemo(() => {
    return FxSimulatorEngine.settleFinalBalance({
      bookingId: 'demo-booking',
      controlRate: quoteResult.controlRate,
      settlementSpotRate,
      remainingCostUsd: costUsd * 0.4,
      originalFinalBalanceInr: quoteResult.milestones.finalBalanceInr,
    });
  }, [quoteResult, settlementSpotRate, costUsd]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Dynamic FX Risk & Margin Simulator</h1>
        <p className="text-xs text-slate-400 mt-1">
          Algorithmic USD/INR Volatility Hedging, Milestone Payment Schedules, and 30-Day Final Balance Settlement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters */}
        <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">Expedition Cost & Hedging Parameters</h2>

          {/* Cost USD */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Overseas DMC Cost (USD)</span>
              <span className="font-mono text-white">${costUsd.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={costUsd}
              onChange={(e) => setCostUsd(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Spot USD/INR */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Live Spot Exchange Rate (USD/INR)</span>
              <span className="font-mono text-white">₹{spotRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="80"
              max="95"
              step="0.1"
              value={spotRate}
              onChange={(e) => setSpotRate(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Volatility Buffer */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Volatility Buffer Percentage ($B_{'{volatility}'}$)</span>
              <span className="font-mono text-blue-400">+{bufferPercentage.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.25"
              value={bufferPercentage}
              onChange={(e) => setBufferPercentage(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Target Margin */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Target Gross Margin Percentage ($M_{'{target}'}$)</span>
              <span className="font-mono text-emerald-400">{targetMargin.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="0.5"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Formulas Explainer */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
            <div>R_control = {spotRate.toFixed(2)} × (1 + {bufferPercentage}%) = ₹{quoteResult.controlRate}</div>
            <div>Cost_INR  = ${costUsd} × ₹{quoteResult.controlRate} = ₹{quoteResult.costFloorInr.toLocaleString('en-IN')}</div>
            <div>Price_INR = Cost_INR / (1 - {targetMargin}%)</div>
          </div>
        </div>

        {/* Right Column: Quote Results & Milestones */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Price Card */}
          <div className="bg-gradient-to-br from-slate-900 to-amber-950/20 p-6 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">Calculated Selling Price</div>
              <div className="text-4xl font-extrabold text-white mt-1">
                ₹{quoteResult.quotedPriceInr.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-400 ml-2">/ passenger</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                Cost Floor: ₹{quoteResult.costFloorInr.toLocaleString('en-IN')} | Realized Margin: ₹{quoteResult.grossMarginInr.toLocaleString('en-IN')} ({quoteResult.realizedMarginPercentage}%)
              </div>
            </div>

            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md">
              Save Quote to Ledger
            </button>
          </div>

          {/* Three-Stage Milestone Breakdown */}
          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Milestone Payment Schedule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Tranche 1: Deposit (25%)</div>
                <div className="text-lg font-bold text-white mt-1">₹{quoteResult.milestones.depositInr.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-emerald-400 mt-1">Locked at booking</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Tranche 2: Milestone (35%)</div>
                <div className="text-lg font-bold text-white mt-1">₹{quoteResult.milestones.milestone1Inr.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-blue-400 mt-1">Due at Visa submission</div>
              </div>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Tranche 3: Final (40%)</div>
                <div className="text-lg font-bold text-white mt-1">₹{quoteResult.milestones.finalBalanceInr.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-amber-400 mt-1">30 days prior (Subject to FX)</div>
              </div>
            </div>
          </div>

          {/* 30-Day Settlement Test Bench */}
          <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">30-Day Settlement Risk Simulator</h3>
                <p className="text-[11px] text-slate-400">Simulate spot exchange rate at T - 30 days prior to departure</p>
              </div>
              <span className="font-mono text-sm font-bold text-white">Spot: ₹{settlementSpotRate.toFixed(2)}</span>
            </div>

            <input
              type="range"
              min="80"
              max="95"
              step="0.25"
              value={settlementSpotRate}
              onChange={(e) => setSettlementSpotRate(Number(e.target.value))}
              className="w-full accent-blue-500"
            />

            <div className={`p-4 rounded-lg border text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
              settlementResult.isSurchargeApplied
                ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
            }`}>
              <div>
                <div className="font-bold">{settlementResult.notes}</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Control Rate: ₹{quoteResult.controlRate} | Net Delta: ₹{settlementResult.deltaRate}/$
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Adjusted Final Invoice</div>
                <div className="text-base font-extrabold text-white">
                  ₹{settlementResult.adjustedFinalBalanceInr.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
