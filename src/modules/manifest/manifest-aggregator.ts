import { GuestManifest } from '@/types/database';

export interface ManifestSummary {
  bookingId: string;
  totalGuests: number;
  verifiedKycCount: number;
  pendingKycCount: number;
  dietaryRequirements: Record<string, number>;
  emergencyContacts: Array<{ name: string; phone: string }>;
  isComplete: boolean;
}

export class ManifestAggregator {
  /**
   * Aggregate and audit guest manifest records for logistics briefing
   */
  static aggregateManifest(bookingId: string, guests: GuestManifest[]): ManifestSummary {
    const totalGuests = guests.length;
    let verifiedKycCount = 0;
    const dietaryRequirements: Record<string, number> = {};
    const emergencyContacts: Array<{ name: string; phone: string }> = [];

    for (const guest of guests) {
      if (guest.id_number && guest.id_document_url) {
        verifiedKycCount++;
      }

      if (guest.dietary_preference) {
        const diet = guest.dietary_preference.trim();
        dietaryRequirements[diet] = (dietaryRequirements[diet] || 0) + 1;
      }

      if (guest.emergency_contact_phone) {
        emergencyContacts.push({
          name: guest.emergency_contact_name || guest.full_name,
          phone: guest.emergency_contact_phone,
        });
      }
    }

    return {
      bookingId,
      totalGuests,
      verifiedKycCount,
      pendingKycCount: totalGuests - verifiedKycCount,
      dietaryRequirements,
      emergencyContacts,
      isComplete: verifiedKycCount === totalGuests && totalGuests > 0,
    };
  }
}
