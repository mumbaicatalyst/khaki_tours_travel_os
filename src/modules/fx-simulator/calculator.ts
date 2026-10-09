import {
  FxMilestoneBreakdown,
  FxSettlementInput,
  FxSettlementResult,
  FxSimulationInput,
  FxSimulationResult,
} from '@/types/fx';

/**
 * Dynamic Forex Risk Mitigation & Margin Simulator Engine
 * Implements:
 * R_control = R_spot * (1 + B_volatility / 100)
 * Cost_INR  = C_USD * R_control
 * P_INR     = Cost_INR / (1 - M_target / 100)
 */
export class FxSimulatorEngine {
  private static DEFAULT_SPOT_USD_INR = 83.5;
  private static DEFAULT_BUFFER_PERCENTAGE = 3.5; // 3.5% default volatility cushion
  private static DEFAULT_TARGET_MARGIN = 22.0; // 22% target gross margin

  /**
   * Calculate quoted price, cost floors, and milestone payment schedules
   */
  static calculateQuote(input: FxSimulationInput): FxSimulationResult {
    const spotRate = input.spotUsdInr ?? this.DEFAULT_SPOT_USD_INR;
    const bufferPercentage = input.bufferPercentage ?? this.DEFAULT_BUFFER_PERCENTAGE;
    const targetMarginPercentage = input.targetMarginPercentage ?? this.DEFAULT_TARGET_MARGIN;

    // 1. Control Exchange Rate
    const controlRate = Number((spotRate * (1 + bufferPercentage / 100)).toFixed(4));

    // 2. Cost Floor in INR
    const costFloorInr = Number((input.costUsd * controlRate).toFixed(2));

    // 3. Quoted Selling Price in INR
    const marginFactor = 1 - targetMarginPercentage / 100;
    const rawQuotedPrice = costFloorInr / marginFactor;
    // Round to nearest 500 INR for clean guest presentation
    const quotedPriceInr = Math.ceil(rawQuotedPrice / 500) * 500;

    // 4. Gross Margin Realized
    const grossMarginInr = Number((quotedPriceInr - costFloorInr).toFixed(2));
    const realizedMarginPercentage = Number(((grossMarginInr / quotedPriceInr) * 100).toFixed(2));

    // 5. Milestone Breakdown (Deposit: 25%, Milestone 1: 35%, Final Balance: 40%)
    const milestones: FxMilestoneBreakdown = {
      depositInr: Math.round(quotedPriceInr * 0.25),
      milestone1Inr: Math.round(quotedPriceInr * 0.35),
      finalBalanceInr: Math.round(quotedPriceInr * 0.4),
    };

    return {
      spotRate,
      bufferPercentage,
      controlRate,
      costFloorInr,
      quotedPriceInr,
      grossMarginInr,
      realizedMarginPercentage,
      milestones,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Final Balance Settlement calculation at T - 30 days prior to departure
   * Locks final invoice to live spot rate if USD depreciated beyond buffer
   */
  static settleFinalBalance(input: FxSettlementInput): FxSettlementResult {
    const deltaRate = Number((input.settlementSpotRate - input.controlRate).toFixed(4));

    if (deltaRate <= 0) {
      // INR strengthened or within buffer; client pays contracted final balance
      return {
        deltaRate,
        surchargeInr: 0,
        adjustedFinalBalanceInr: input.originalFinalBalanceInr,
        isSurchargeApplied: false,
        notes: `Spot rate (₹${input.settlementSpotRate}) absorbed by control rate (₹${input.controlRate}). No customer surcharge.`,
      };
    }

    // Currency breached buffer; apply pass-through surcharge on remaining USD commitments
    const surchargeInr = Number((input.remainingCostUsd * deltaRate).toFixed(2));
    const adjustedFinalBalanceInr = Number((input.originalFinalBalanceInr + surchargeInr).toFixed(2));

    return {
      deltaRate,
      surchargeInr,
      adjustedFinalBalanceInr,
      isSurchargeApplied: true,
      notes: `USD breached control rate by ₹${deltaRate}/$. Surcharge of ₹${surchargeInr} added to protect baseline margins.`,
    };
  }
}
