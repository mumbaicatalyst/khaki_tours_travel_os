import { TourType } from '@/types/database';

export interface PromoCode {
  code: string;
  discount_type: 'PERCENTAGE' | 'FLAT_INR';
  discount_value: number; // e.g. 15 for 15% or 500 for ₹500 off
  min_cart_value_inr?: number;
  applicable_categories?: TourType[];
  max_uses?: number;
  current_uses: number;
  is_active: boolean;
  expires_at?: string;
}

export class PromotionEngine {
  private static promoCodes: PromoCode[] = [
    {
      code: 'HERITAGE10',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      min_cart_value_inr: 1000,
      applicable_categories: ['STANDARD_WALK'],
      max_uses: 500,
      current_uses: 84,
      is_active: true,
    },
    {
      code: 'MUMBAIFAMILY',
      discount_type: 'FLAT_INR',
      discount_value: 500,
      min_cart_value_inr: 3000,
      applicable_categories: ['STANDARD_WALK', 'PRIVATE_GROUP'],
      max_uses: 200,
      current_uses: 39,
      is_active: true,
    },
  ];

  /**
   * Validate and apply a promotional discount
   */
  static applyPromoCode(params: {
    code: string;
    totalAmountInr: number;
    category: TourType;
  }): {
    isValid: boolean;
    discountAmountInr: number;
    finalAmountInr: number;
    message: string;
  } {
    const code = params.code.trim().toUpperCase();
    const promo = this.promoCodes.find((p) => p.code === code && p.is_active);

    if (!promo) {
      return {
        isValid: false,
        discountAmountInr: 0,
        finalAmountInr: params.totalAmountInr,
        message: 'Invalid or expired promotional code.',
      };
    }

    if (promo.min_cart_value_inr && params.totalAmountInr < promo.min_cart_value_inr) {
      return {
        isValid: false,
        discountAmountInr: 0,
        finalAmountInr: params.totalAmountInr,
        message: `Promo requires minimum booking amount of ₹${promo.min_cart_value_inr}.`,
      };
    }

    if (promo.applicable_categories && !promo.applicable_categories.includes(params.category)) {
      return {
        isValid: false,
        discountAmountInr: 0,
        finalAmountInr: params.totalAmountInr,
        message: `Promo code ${code} is not valid for ${params.category} tours.`,
      };
    }

    let discount = 0;
    if (promo.discount_type === 'PERCENTAGE') {
      discount = Math.round((params.totalAmountInr * promo.discount_value) / 100);
    } else {
      discount = promo.discount_value;
    }

    discount = Math.min(discount, params.totalAmountInr);
    const finalAmount = params.totalAmountInr - discount;

    promo.current_uses += 1;

    return {
      isValid: true,
      discountAmountInr: discount,
      finalAmountInr: finalAmount,
      message: `Promo applied: ₹${discount.toLocaleString('en-IN')} off!`,
    };
  }

  /**
   * Create a new promotional campaign
   */
  static createPromoCode(promo: Omit<PromoCode, 'current_uses'>): PromoCode {
    const created: PromoCode = { ...promo, code: promo.code.toUpperCase(), current_uses: 0 };
    this.promoCodes.unshift(created);
    return created;
  }

  static getActivePromos(): PromoCode[] {
    return this.promoCodes;
  }
}
