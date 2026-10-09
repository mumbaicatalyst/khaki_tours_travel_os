export interface FxSimulationInput {
  tourId: string;
  bookingId?: string;
  costUsd: number;
  spotUsdInr?: number;
  bufferPercentage?: number;
  targetMarginPercentage?: number;
}

export interface FxMilestoneBreakdown {
  depositInr: number; // 25%
  milestone1Inr: number; // 35%
  finalBalanceInr: number; // 40% (base before settlement adjustment)
}

export interface FxSimulationResult {
  spotRate: number;
  bufferPercentage: number;
  controlRate: number;
  costFloorInr: number;
  quotedPriceInr: number;
  grossMarginInr: number;
  realizedMarginPercentage: number;
  milestones: FxMilestoneBreakdown;
  calculatedAt: string;
}

export interface FxSettlementInput {
  bookingId: string;
  controlRate: number;
  settlementSpotRate: number;
  remainingCostUsd: number; // 40% of USD cost
  originalFinalBalanceInr: number;
}

export interface FxSettlementResult {
  deltaRate: number;
  surchargeInr: number;
  adjustedFinalBalanceInr: number;
  isSurchargeApplied: boolean;
  notes: string;
}
