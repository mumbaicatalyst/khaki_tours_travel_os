import { TourDeparture } from '@/types/database';
import { inMemoryCatalog } from '@/lib/supabase/seed';

export interface CreateDepartureSlotInput {
  tour_id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. '08:00 AM'
  slot_hour: number;
  slot_minute: number;
  assigned_lead_guide_id?: string;
  capacity_override?: number;
  price_override?: number;
}

export class CalendarScheduleManager {
  /**
   * Schedule a new departure slot from the Visual Calendar
   */
  static scheduleDeparture(input: CreateDepartureSlotInput): any {
    const tour = inMemoryCatalog.tours.find((t) => t.tour_id === input.tour_id || t.id === input.tour_id);
    if (!tour) {
      throw new Error(`Tour with id ${input.tour_id} not found.`);
    }

    const isoDate = `${input.date}T${String(input.slot_hour).padStart(2, '0')}:${String(input.slot_minute).padStart(2, '0')}:00Z`;
    const capacity = input.capacity_override || tour.max_capacity || 25;
    const price = input.price_override || tour.base_price_inr;

    const newDeparture = {
      departure_id: `dep_${input.date.replace(/-/g, '')}_${Date.now().toString().slice(-4)}`,
      tour_id: tour.tour_id || tour.id,
      tour_title: tour.title,
      hashtag: tour.hashtag,
      category: tour.category,
      date: input.date,
      time: input.time,
      departure_datetime: isoDate,
      meeting_point: tour.meeting_landmark || tour.starting_point,
      price_inr: price,
      total_capacity: capacity,
      booked_seats: 0,
      available_seats: capacity,
      assigned_lead_guide_id: input.assigned_lead_guide_id || null,
      is_fast_path_eligible: true,
      status: 'OPEN_FOR_BOOKING',
    };

    inMemoryCatalog.departures.unshift(newDeparture);

    // Notify public website in real time
    this.broadcastDepartureUpdate('DEPARTURE_SCHEDULED', newDeparture);

    return newDeparture;
  }

  /**
   * Cancel or remove a departure slot
   */
  static cancelDeparture(departureId: string, reason?: string): boolean {
    const idx = inMemoryCatalog.departures.findIndex((d) => d.departure_id === departureId);
    if (idx === -1) return false;

    inMemoryCatalog.departures[idx].status = 'CANCELLED';
    this.broadcastDepartureUpdate('DEPARTURE_CANCELLED', {
      departure_id: departureId,
      reason: reason || 'Operational rescheduling',
    });
    return true;
  }

  /**
   * Two-way sync: Handle incoming ticket booking from the public website
   */
  static processInboundWebsiteBooking(departureId: string, seatsBooked: number): { success: boolean; remaining: number } {
    const dep = inMemoryCatalog.departures.find((d) => d.departure_id === departureId);
    if (!dep) return { success: false, remaining: 0 };

    dep.booked_seats += seatsBooked;
    dep.available_seats = Math.max(0, dep.total_capacity - dep.booked_seats);
    if (dep.available_seats === 0) {
      dep.status = 'SOLD_OUT';
    }

    return { success: true, remaining: dep.available_seats };
  }

  private static broadcastDepartureUpdate(eventType: string, payload: any) {
    console.log(`[Calendar Two-Way Sync] Broadcasting ${eventType} to live website:`, payload.departure_id);
  }
}
