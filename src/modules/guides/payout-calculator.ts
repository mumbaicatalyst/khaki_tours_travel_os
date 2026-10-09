import { TourType, VendorResourceType } from '@/types/database';

export type GuideSeniorityTier = 'SENIOR_HISTORIAN' | 'AMBASSADOR' | 'JUNIOR_HOST';

export interface GuideCompensationRule {
  category: TourType;
  baseFeeInr: number;
}

export interface CalculatePayoutParams {
  guideId: string;
  category: TourType;
  seniorityTier?: GuideSeniorityTier;
  specialHonorariumInr?: number;
}

export class GuidePayoutCalculator {
  // Base Flat Fee Schedule per Tour Type
  private static BASE_FEES: Record<TourType, number> = {
    STANDARD_WALK: 2000,
    PRIVATE_GROUP: 4500,
    CORPORATE_B2B: 5500,
    INTERNATIONAL_EXPEDITION: 15000, // Daily tour leader fee
  };

  // Seniority Tier Multipliers
  private static TIER_MULTIPLIERS: Record<GuideSeniorityTier, number> = {
    SENIOR_HISTORIAN: 1.25, // E.g., ₹2,000 * 1.25 = ₹2,500
    AMBASSADOR: 1.0,        // Standard ₹2,000
    JUNIOR_HOST: 0.85,       // ₹1,700
  };

  /**
   * Calculate exact compensation due for a guide assignment
   */
  static calculatePayout(params: CalculatePayoutParams): {
    baseFee: number;
    multiplier: number;
    calculatedPayoutInr: number;
    seniorityTier: GuideSeniorityTier;
  } {
    const baseFee = this.BASE_FEES[params.category] || 2000;
    const tier = params.seniorityTier || 'AMBASSADOR';
    const multiplier = this.TIER_MULTIPLIERS[tier] || 1.0;

    let total = Math.round(baseFee * multiplier);
    if (params.specialHonorariumInr) {
      total += params.specialHonorariumInr;
    }

    return {
      baseFee,
      multiplier,
      calculatedPayoutInr: total,
      seniorityTier: tier,
    };
  }

  /**
   * Get all active base fee schedules for admin configuration
   */
  static getFeeSchedule(): Record<TourType, number> {
    return { ...this.BASE_FEES };
  }
}
