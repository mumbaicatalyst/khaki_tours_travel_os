import { BookingStatus, TourType } from '@/types/database';

export interface DispatchEvaluationInput {
  category: TourType;
  leadTimeHours: number;
  isCustomRoute?: boolean;
  jeepRequired?: boolean;
  permitsRequired?: boolean;
  availableSeats: number;
  groupSize: number;
}

export type BookingOperatingPath =
  | 'TIER_1_FAST_PATH'
  | 'TIER_2_FAST_TRACK'
  | 'TIER_2_HOLD_TRACK'
  | 'TIER_3_INTERNATIONAL_HIGH_TOUCH';

export interface DispatchDecision {
  operatingPath: BookingOperatingPath;
  initialBookingStatus: BookingStatus;
  requiresUpfrontPayment: boolean;
  requiresResourceLockBeforePayment: boolean;
  resourceTypesToLock: Array<'GUIDE' | 'JEEP' | 'DMC'>;
  paymentLinkExpiryMinutes: number;
  dispatchTimeoutMinutes: number;
  escalationTeam: string;
  rationale: string;
}

export class DispatchRulesEngine {
  /**
   * Evaluate incoming lead parameters to determine the exact operational routing
   */
  static evaluateBookingRoute(input: DispatchEvaluationInput): DispatchDecision {
    // 1. Tier 1: Standard Scheduled Walking Tours
    if (input.category === 'STANDARD_WALK') {
      return {
        operatingPath: 'TIER_1_FAST_PATH',
        initialBookingStatus: 'PAYMENT_PENDING',
        requiresUpfrontPayment: true,
        requiresResourceLockBeforePayment: false,
        resourceTypesToLock: [],
        paymentLinkExpiryMinutes: 15,
        dispatchTimeoutMinutes: 0,
        escalationTeam: 'AUTOMATED_NO_ESCALATION',
        rationale:
          'Standard scheduled walk qualifies for 100% automated fast-path booking with instant UPI link.',
      };
    }

    // 2. Tier 2: Private Group & Heritage Tours / Corporate B2B
    if (input.category === 'PRIVATE_GROUP' || input.category === 'CORPORATE_B2B') {
      const isHoldTrack =
        input.leadTimeHours < 48 ||
        Boolean(input.isCustomRoute) ||
        Boolean(input.jeepRequired) ||
        Boolean(input.permitsRequired);

      if (isHoldTrack) {
        const resources: Array<'GUIDE' | 'JEEP' | 'DMC'> = ['GUIDE'];
        if (input.jeepRequired) resources.push('JEEP');

        return {
          operatingPath: 'TIER_2_HOLD_TRACK',
          initialBookingStatus: 'PENDING_RESOURCE_LOCK',
          requiresUpfrontPayment: false,
          requiresResourceLockBeforePayment: true,
          resourceTypesToLock: resources,
          paymentLinkExpiryMinutes: 30, // 30-minute expiring payment link once confirmed
          dispatchTimeoutMinutes: 30,
          escalationTeam: "Priya's Ops Team",
          rationale:
            'Short lead time (<48h), custom route, or vehicle requirements trigger Hold-Track resource locking prior to sending payment link.',
        };
      }

      // Fast-Track Private Group
      return {
        operatingPath: 'TIER_2_FAST_TRACK',
        initialBookingStatus: 'PAYMENT_PENDING',
        requiresUpfrontPayment: true,
        requiresResourceLockBeforePayment: false,
        resourceTypesToLock: ['GUIDE'],
        paymentLinkExpiryMinutes: 60,
        dispatchTimeoutMinutes: 30, // 30 mins to guide response or alert Ops
        escalationTeam: "Priya's Ops Team",
        rationale:
          'Standard route with >48h lead time qualifies for Fast-Track upfront payment with parallel guide pool dispatch upon payment capture.',
      };
    }

    // 3. Tier 3: International Outbound Expeditions
    return {
      operatingPath: 'TIER_3_INTERNATIONAL_HIGH_TOUCH',
      initialBookingStatus: 'LEAD_NEW',
      requiresUpfrontPayment: false,
      requiresResourceLockBeforePayment: false,
      resourceTypesToLock: ['DMC'],
      paymentLinkExpiryMinutes: 4320, // 3 days for deposit invoice
      dispatchTimeoutMinutes: 1440, // 24 hours
      escalationTeam: 'International Sales Desk',
      rationale:
        'International expedition triggers instant WhatsApp brochure delivery, FX risk modeling, and dedicated consultation handoff.',
    };
  }
}
