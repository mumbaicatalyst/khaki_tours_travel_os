import fs from 'fs';
import path from 'path';
import { Tour, Contact, TourDeparture, Booking, CorporateProposal } from '@/types/database';

const DATA_DIR = path.join(process.cwd(), 'docs', 'data');
const STORE_FILE = path.join(DATA_DIR, 'live_store.json');

export interface CostSettings {
  guidePayouts: {
    SENIOR_FELLOW: number;
    CORE_AMBASSADOR: number;
    APPRENTICE_GUIDE: number;
    BESPOKE_CURATOR_LEAD: number;
    EMERGENCY_SUBSTITUTION_BONUS: number;
  };
  siteEntryFees: Array<{
    id: string;
    siteName: string;
    category: 'HERITAGE_MONUMENT' | 'MUSEUM' | 'PERMIT' | 'FERRY';
    feePerHeadInr: number;
    notes?: string;
  }>;
  logisticsInventory: Array<{
    id: string;
    vehicleType: string;
    provider: string;
    costInr: number;
    billingUnit: 'PER_TOUR' | 'PER_DAY' | 'PER_HEAD';
    capacity: number;
  }>;
  fnbInventory: Array<{
    id: string;
    itemName: string;
    vendor: string;
    costPerHeadInr: number;
    cluster: string;
  }>;
}

export interface AppStoreData {
  tours: any[];
  contacts: any[];
  departures: any[];
  bookings: any[];
  proposals: any[];
  dispatches: any[];
  manifests: any[];
  guides?: any[];
  costSettings?: CostSettings;
  whatsappConversations?: any[];
  whatsappMessages?: any[];
}

/**
 * Thread-safe, persistent file store for Khaki Travel OS.
 * Automatically initializes from master JSON files and persists all CRUD mutations to disk.
 */
class PersistentStore {
  private static instance: PersistentStore;
  private data: AppStoreData = {
    tours: [],
    contacts: [],
    departures: [],
    bookings: [],
    proposals: [],
    dispatches: [],
    manifests: [],
  };

  private constructor() {
    this.initStore();
  }

  public static getInstance(): PersistentStore {
    if (!PersistentStore.instance) {
      PersistentStore.instance = new PersistentStore();
    }
    return PersistentStore.instance;
  }

  private initStore() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.whatsappConversations) this.data.whatsappConversations = [];
        if (!this.data.whatsappMessages) this.data.whatsappMessages = [];
        if (!this.data.costSettings) {
          this.data.costSettings = this.getDefaultCostSettings();
        }
        console.log(`[Store] Loaded persistent live store from ${STORE_FILE}`);
        return;
      }

      // Initialize from master data files
      console.log('[Store] Initializing fresh live store from seed files...');
      const toursPath = path.join(DATA_DIR, 'tours_master.json');
      const departuresPath = path.join(DATA_DIR, 'departures_calendar.json');

      const rawTours = fs.existsSync(toursPath)
        ? JSON.parse(fs.readFileSync(toursPath, 'utf-8'))
        : [];
      const rawDepartures = fs.existsSync(departuresPath)
        ? JSON.parse(fs.readFileSync(departuresPath, 'utf-8'))
        : [];

      // Format initial tours
      this.data.tours = rawTours.map((t: any, idx: number) => ({
        id: t.tour_id || `kt_tour_${t.wp_id || idx + 1}`,
        tour_id: t.tour_id || `kt_tour_${t.wp_id || idx + 1}`,
        tour_code: `KT_EXP_${(t.wp_id || idx + 100).toString()}`,
        wp_id: t.wp_id,
        title: t.title,
        clean_title: t.clean_title || t.title,
        hashtag: t.hashtag || '#KhakiTour',
        slug: t.slug || t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: t.category || 'STANDARD_WALK',
        base_price_inr: t.base_price_inr || 899,
        base_cost_usd: t.base_cost_usd || 0,
        duration: t.duration || '2.5 Hours',
        distance: t.distance || '2.0 Kms',
        meeting_landmark: t.meeting_landmark || t.starting_point || 'Horniman Circle, Fort',
        starting_point: t.meeting_landmark || t.starting_point || 'Horniman Circle, Fort',
        route_highlights: t.route_highlights || ['Heritage architecture', 'Historic lore'],
        max_capacity: t.max_capacity || 25,
        description: t.description || 'Curated heritage walk through historic Mumbai.',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Seed initial rich CRM contacts
      this.data.contacts = [
        {
          id: 'cnt_001',
          full_name: 'Karan Mehra',
          phone_number: '+91 98200 88712',
          email: 'karan.mehra@godrejproperties.com',
          company: 'Godrej Properties Limited',
          segment_tags: ['CORPORATE_VIP', 'EXECUTIVE_LEAD', 'REPEAT_WALKER'],
          rfm_score: 95,
          lifetime_spend_inr: 85000,
          total_bookings: 3,
          last_booking_date: '2026-09-28',
          notes: 'VP of Corporate Affairs. Books private architectural heritage walks for overseas visiting delegations and board members. Prefers Bharat or Aniket as historian.',
          created_at: '2026-01-15T10:00:00Z',
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cnt_002',
          full_name: 'Pooja Singhania',
          phone_number: '+91 98199 87654',
          email: 'pooja.singhania@gmail.com',
          company: 'Singhania Family Office',
          segment_tags: ['PRIVATE_SAFARI_VIP', 'HIGH_NET_WORTH'],
          rfm_score: 88,
          lifetime_spend_inr: 29000,
          total_bookings: 2,
          last_booking_date: '2026-10-02',
          notes: 'Loves the #UrbanSafari vintage open jeep tours. Usually requests Ramesh Gurav as driver and needs child booster cushions for her 7-year-old.',
          created_at: '2026-03-20T11:30:00Z',
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cnt_003',
          full_name: 'Elena Rostova',
          phone_number: '+91 98203 99182',
          email: 'elena.rostova@maec.es',
          company: 'Consulate General of Spain in Mumbai',
          segment_tags: ['DIPLOMATIC_CONSULATE', 'CORPORATE_VIP'],
          rfm_score: 92,
          lifetime_spend_inr: 45000,
          total_bookings: 1,
          last_booking_date: '2026-10-05',
          notes: 'Cultural Attaché. Requires Spanish or fluent English speaker (Anvi). Highly sensitive to timing and protocol. Direct WhatsApp contact only.',
          created_at: '2026-05-12T09:15:00Z',
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cnt_004',
          full_name: 'Vikram Patel',
          phone_number: '+91 98200 44551',
          email: 'vikram.patel@tatamotors.com',
          company: 'Tata Motors',
          segment_tags: ['REPEAT_WALKER', 'WEEKEND_ENTHUSIAST'],
          rfm_score: 79,
          lifetime_spend_inr: 12400,
          total_bookings: 8,
          last_booking_date: '2026-10-04',
          notes: 'Heritage aficionado. Has attended 8 different walks including Parel Mills, Gamdevi, and Banganga. Vegetarian dietary preference.',
          created_at: '2025-11-04T14:20:00Z',
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cnt_005',
          full_name: 'Devika Chawla',
          phone_number: '+91 98201 12098',
          email: 'devika.chawla@gmail.com',
          company: 'Independent Architect',
          segment_tags: ['ARCHITECT_COMMUNITY', 'KHAKI_LAB_ATTENDEE'],
          rfm_score: 84,
          lifetime_spend_inr: 8900,
          total_bookings: 5,
          last_booking_date: '2026-09-18',
          notes: 'Regular attendee at Khaki Lab history talks. Keen interest in Art Deco and Gothic Revival architecture.',
          created_at: '2026-02-18T16:00:00Z',
          updated_at: new Date().toISOString(),
        },
      ];

      // Format initial departures across full rolling calendar
      const guideRoster = [
        { name: 'Bharat Gothoskar (Founder & Lead Historian)', phone: '+91 98201 01010' },
        { name: 'Aniket (Legal & Maritime Historian)', phone: '+91 98200 11992' },
        { name: 'Anvi (Cultural & Sacred Heritage)', phone: '+91 98199 44332' },
        { name: 'Ramesh Gurav (Vintage Jeep Specialist)', phone: '+91 98202 77119' },
        { name: 'Yash Gupte (Artisan Sculptor & Fort Guide)', phone: '+91 98204 55667' },
        { name: 'Zoya Merchant (Art Deco & Architecture)', phone: '+91 98190 33221' },
      ];

      this.data.departures = rawDepartures.slice(0, 80).map((d: any, idx: number) => {
        const guide = guideRoster[idx % guideRoster.length];
        const capacity = Number(d.total_capacity || d.max_capacity) || 25;
        const booked = Number(d.booked_seats) !== undefined && !isNaN(Number(d.booked_seats))
          ? Number(d.booked_seats)
          : Math.floor(Math.random() * (capacity - 5)) + 2;
        const available = Math.max(0, capacity - booked);

        return {
          id: `dep_${idx + 1}`,
          departure_id: d.departure_id || `dep_${idx + 1}`,
          tour_id: d.tour_id || `kt_tour_${idx + 1}`,
          tour_title: d.tour_title || 'Mumbai Heritage Walk',
          departure_date: d.date || d.departure_date || '2026-10-10',
          start_time: d.time || d.start_time || '08:00 AM',
          meeting_point: d.meeting_point || d.meeting_landmark || 'Horniman Circle, Fort',
          max_capacity: capacity,
          booked_seats: booked,
          available_seats: available,
          ticket_price_inr: Number(d.price_inr || d.ticket_price_inr) || 899,
          assigned_guide_name: guide.name,
          assigned_guide_phone: guide.phone,
          status: available === 0 ? 'SOLD_OUT' : available <= 3 ? 'FILLING_FAST' : 'OPEN_FOR_BOOKING',
          vehicle: d.tour_title?.toLowerCase().includes('jeep') || d.tour_title?.toLowerCase().includes('safari')
            ? 'Vintage Open Jeep (MH-01-KT-1947)'
            : undefined,
        };
      });

      // Initial active bookings
      this.data.bookings = [
        {
          id: 'bkg_8901',
          booking_reference: 'KT-BKG-8901',
          contact_id: 'cnt_001',
          contact_name: 'Karan Mehra',
          contact_phone: '+91 98200 88712',
          company: 'Godrej Properties Limited',
          tour_title: '#FortWalk Colonial Heritage',
          departure_date: '2026-10-10 16:30',
          group_size: 8,
          total_amount_inr: 35000,
          amount_paid_inr: 35000,
          status: 'CONFIRMED',
          category: 'CORPORATE',
          gst_amount_inr: 5338.98,
          sac_code: '998554',
          payment_method: 'NEFT / Direct Bank',
          assigned_guide: 'Aniket (Legal Historian)',
          created_at: '2026-10-06T12:00:00Z',
        },
        {
          id: 'bkg_8902',
          booking_reference: 'KT-BKG-8902',
          contact_id: 'cnt_002',
          contact_name: 'Pooja Singhania',
          contact_phone: '+91 98199 87654',
          company: 'Singhania Family Office',
          tour_title: 'Vintage Open Jeep #UrbanSafari',
          departure_date: '2026-10-11 08:30',
          group_size: 6,
          total_amount_inr: 14500,
          amount_paid_inr: 14500,
          status: 'CONFIRMED',
          category: 'PRIVATE_GROUP',
          gst_amount_inr: 690.48,
          sac_code: '998555',
          payment_method: 'UPI / QR Code',
          assigned_guide: 'Bharat Gothoskar',
          assigned_vendor: 'Ramesh Gurav (MH 01 DX 4022)',
          created_at: '2026-10-07T14:30:00Z',
        },
        {
          id: 'bkg_8903',
          booking_reference: 'KT-BKG-8903',
          contact_id: 'cnt_004',
          contact_name: 'Vikram Patel',
          contact_phone: '+91 98200 44551',
          company: 'Tata Motors',
          tour_title: '#DurgasOf Mumbai: Navratri Special',
          departure_date: '2026-10-12 17:00',
          group_size: 2,
          total_amount_inr: 1798,
          amount_paid_inr: 1798,
          status: 'CONFIRMED',
          category: 'STANDARD_WALK',
          gst_amount_inr: 85.62,
          sac_code: '998555',
          payment_method: 'UPI Instant QR',
          assigned_guide: 'Anvi (Cultural Historian)',
          created_at: '2026-10-08T09:15:00Z',
        },
      ];

      // Save initial store
      this.persist();
    } catch (err) {
      console.error('[Store] Failed to initialize live store:', err);
    }
  }

  private persist() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      console.log(`[Store] Live store successfully persisted to ${STORE_FILE}`);
    } catch (e) {
      console.error('[Store] Failed to write live store file:', e);
    }
  }

  // ==========================================
  // TOURS CRUD
  // ==========================================
  public getTours(): any[] {
    return this.data.tours;
  }

  public getTourById(id: string): any | undefined {
    return this.data.tours.find((t) => t.id === id || t.tour_id === id || t.slug === id);
  }

  public createTour(tourData: any): any {
    const newId = `kt_tour_${Date.now()}`;
    const slug = (tourData.slug || tourData.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newTour = {
      id: newId,
      tour_id: newId,
      tour_code: tourData.tour_code || `KT_EXP_${Date.now().toString().slice(-4)}`,
      title: tourData.title,
      clean_title: tourData.clean_title || tourData.title.replace(/^#[A-Za-z0-9]+\s*[:–-]?\s*/, ''),
      hashtag: tourData.hashtag?.startsWith('#') ? tourData.hashtag : `#${tourData.hashtag || 'KhakiTour'}`,
      slug,
      category: tourData.category || 'STANDARD_WALK',
      base_price_inr: Number(tourData.base_price_inr) || 899,
      base_cost_usd: Number(tourData.base_cost_usd) || 0,
      duration: tourData.duration || '2.5 Hours',
      distance: tourData.distance || '2.0 Kms',
      meeting_landmark: tourData.meeting_landmark || 'Horniman Circle, Fort',
      starting_point: tourData.meeting_landmark || 'Horniman Circle, Fort',
      route_highlights: Array.isArray(tourData.route_highlights)
        ? tourData.route_highlights
        : (tourData.route_highlights || '').split(',').map((h: string) => h.trim()).filter(Boolean),
      max_capacity: Number(tourData.max_capacity) || 25,
      description: tourData.description || '',
      is_active: tourData.is_active !== undefined ? tourData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.tours.unshift(newTour);
    this.persist();
    return newTour;
  }

  public updateTour(id: string, updates: any): any | null {
    const idx = this.data.tours.findIndex((t) => t.id === id || t.tour_id === id);
    if (idx === -1) return null;

    const existing = this.data.tours[idx];
    const updated = {
      ...existing,
      ...updates,
      base_price_inr: updates.base_price_inr !== undefined ? Number(updates.base_price_inr) : existing.base_price_inr,
      max_capacity: updates.max_capacity !== undefined ? Number(updates.max_capacity) : existing.max_capacity,
      route_highlights: updates.route_highlights
        ? (Array.isArray(updates.route_highlights)
            ? updates.route_highlights
            : updates.route_highlights.split(',').map((h: string) => h.trim()).filter(Boolean))
        : existing.route_highlights,
      updated_at: new Date().toISOString(),
    };

    this.data.tours[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteTour(id: string): boolean {
    const idx = this.data.tours.findIndex((t) => t.id === id || t.tour_id === id);
    if (idx === -1) return false;

    this.data.tours.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // CUSTOMERS / CRM CONTACTS CRUD
  // ==========================================
  public getContacts(): any[] {
    return this.data.contacts;
  }

  public getContactById(id: string): any | undefined {
    return this.data.contacts.find((c) => c.id === id || c.phone_number === id);
  }

  public createContact(contactData: any): any {
    const newId = `cnt_${Date.now()}`;
    const newContact = {
      id: newId,
      full_name: contactData.full_name,
      phone_number: contactData.phone_number,
      email: contactData.email || '',
      company: contactData.company || '',
      segment_tags: Array.isArray(contactData.segment_tags)
        ? contactData.segment_tags
        : (contactData.segment_tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      rfm_score: Number(contactData.rfm_score) || 50,
      lifetime_spend_inr: Number(contactData.lifetime_spend_inr) || 0,
      total_bookings: Number(contactData.total_bookings) || 0,
      last_booking_date: contactData.last_booking_date || null,
      notes: contactData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.contacts.unshift(newContact);
    this.persist();
    return newContact;
  }

  public updateContact(id: string, updates: any): any | null {
    const idx = this.data.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const existing = this.data.contacts[idx];
    const updated = {
      ...existing,
      ...updates,
      segment_tags: updates.segment_tags
        ? (Array.isArray(updates.segment_tags)
            ? updates.segment_tags
            : updates.segment_tags.split(',').map((t: string) => t.trim()).filter(Boolean))
        : existing.segment_tags,
      updated_at: new Date().toISOString(),
    };

    this.data.contacts[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteContact(id: string): boolean {
    const idx = this.data.contacts.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    this.data.contacts.splice(idx, 1);
    this.persist();
    return true;
  }

  // ==========================================
  // DEPARTURES CRUD
  // ==========================================
  public getDepartures(): any[] {
    return this.data.departures;
  }

  public createDeparture(depData: any): any {
    const newId = `dep_${Date.now()}`;
    const newDep = {
      id: newId,
      departure_id: newId,
      tour_id: depData.tour_id,
      tour_title: depData.tour_title,
      departure_date: depData.departure_date,
      start_time: depData.start_time,
      meeting_point: depData.meeting_point,
      max_capacity: Number(depData.max_capacity) || 25,
      booked_seats: 0,
      available_seats: Number(depData.max_capacity) || 25,
      ticket_price_inr: Number(depData.ticket_price_inr) || 899,
      assigned_guide_name: depData.assigned_guide_name || 'Unassigned Guide',
      assigned_guide_phone: depData.assigned_guide_phone || '',
      status: 'SCHEDULED',
    };
    this.data.departures.unshift(newDep);
    this.persist();
    return newDep;
  }

  public updateDeparture(id: string, updates: any): any | null {
    const idx = this.data.departures.findIndex((d) => d.id === id || d.departure_id === id);
    if (idx === -1) return null;

    this.data.departures[idx] = { ...this.data.departures[idx], ...updates };
    this.persist();
    return this.data.departures[idx];
  }

  public holdDepartureSeats(departureId: string, seatCount: number): { success: boolean; departure?: any; error?: string } {
    const idx = this.data.departures.findIndex((d) => d.id === departureId || d.departure_id === departureId);
    if (idx === -1) {
      return { success: false, error: 'Departure slot not found' };
    }

    const dep = this.data.departures[idx];
    if (dep.available_seats < seatCount) {
      return {
        success: false,
        error: `Only ${dep.available_seats} seats available. Cannot hold ${seatCount}.`,
      };
    }

    dep.booked_seats = (dep.booked_seats || 0) + seatCount;
    dep.available_seats = Math.max(0, dep.max_capacity - dep.booked_seats);
    dep.status = dep.available_seats === 0 ? 'SOLD_OUT' : dep.available_seats <= 3 ? 'FILLING_FAST' : 'OPEN_FOR_BOOKING';

    this.persist();
    return { success: true, departure: dep };
  }

  // ==========================================
  // BOOKINGS CRUD
  // ==========================================
  public getBookings(): any[] {
    return this.data.bookings;
  }

  public createBooking(bkgData: any): any {
    const newId = `bkg_${Date.now()}`;
    const newBooking: any = {
      id: newId,
      booking_reference: `KT-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
      departure_id: bkgData.departure_id || '',
      payment_reference: bkgData.payment_reference || '',
      contact_id: bkgData.contact_id,
      contact_name: bkgData.contact_name,
      contact_phone: bkgData.contact_phone,
      company: bkgData.company || '',
      tour_title: bkgData.tour_title,
      departure_date: bkgData.departure_date,
      group_size: Number(bkgData.group_size) || 1,
      total_amount_inr: Number(bkgData.total_amount_inr) || 899,
      amount_paid_inr: Number(bkgData.amount_paid_inr) || 0,
      status: bkgData.status || 'PAYMENT_PENDING',
      category: bkgData.category || 'STANDARD_WALK',
      gst_amount_inr: Number(bkgData.gst_amount_inr) || 0,
      sac_code: bkgData.category === 'CORPORATE' ? '998554' : '998555',
      payment_method: bkgData.payment_method || 'UPI',
      assigned_guide: bkgData.assigned_guide || 'Unassigned',
      assigned_vendor: bkgData.assigned_vendor || '',
      meeting_point: bkgData.meeting_point || '',
      created_at: new Date().toISOString(),
    };

    // Auto-update contact spend and booking count
    let contact = bkgData.contact_id ? this.getContactById(bkgData.contact_id) : undefined;
    if (!contact && bkgData.contact_phone) {
      contact = this.data.contacts.find(
        (c) => c.phone_number.replace(/[^0-9]/g, '') === bkgData.contact_phone.replace(/[^0-9]/g, '')
      );
    }

    if (contact) {
      contact.total_bookings = (contact.total_bookings || 0) + 1;
      contact.lifetime_spend_inr = (contact.lifetime_spend_inr || 0) + newBooking.total_amount_inr;
      contact.last_booking_date = new Date().toISOString().slice(0, 10);
    } else if (bkgData.contact_name && bkgData.contact_phone) {
      this.createContact({
        full_name: bkgData.contact_name,
        phone_number: bkgData.contact_phone,
        company: bkgData.company || '',
        lifetime_spend_inr: newBooking.total_amount_inr,
        total_bookings: 1,
        last_booking_date: new Date().toISOString().slice(0, 10),
        segment_tags: [bkgData.category === 'CORPORATE' ? 'CORPORATE_VIP' : 'DIRECT_BOOKING'],
        rfm_score: 75,
      });
    }

    // Auto-decrement matching departure seats
    if (bkgData.departure_date || bkgData.tour_title) {
      const depDateClean = (bkgData.departure_date || '').slice(0, 10);
      const matchingDep = this.data.departures.find(
        (d) =>
          d.departure_date === depDateClean &&
          (!bkgData.tour_title || d.tour_title.toLowerCase().includes(bkgData.tour_title.toLowerCase().slice(0, 15)))
      );

      if (matchingDep) {
        newBooking.departure_id = matchingDep.id || matchingDep.departure_id;
        matchingDep.booked_seats = (matchingDep.booked_seats || 0) + newBooking.group_size;
        matchingDep.available_seats = Math.max(0, matchingDep.max_capacity - matchingDep.booked_seats);
        matchingDep.status = matchingDep.available_seats === 0 ? 'SOLD_OUT' : matchingDep.available_seats <= 3 ? 'FILLING_FAST' : 'OPEN_FOR_BOOKING';
        newBooking.assigned_guide = matchingDep.assigned_guide_name;
        newBooking.meeting_point = matchingDep.meeting_point;
      } else {
        newBooking.departure_id = bkgData.departure_id || '';
      }
    } else {
      newBooking.departure_id = bkgData.departure_id || '';
    }

    if (bkgData.payment_reference) {
      newBooking.payment_reference = bkgData.payment_reference;
    }

    this.data.bookings.unshift(newBooking);
    this.persist();
    return newBooking;
  }

  // ==========================================
  // WHATSAPP CRM MESSAGES & THREADS
  // ==========================================
  public getWhatsAppConversations(): any[] {
    return this.data.whatsappConversations || [];
  }

  public getWhatsAppMessages(phone: string): any[] {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return (this.data.whatsappMessages || []).filter(
      (m: any) => m.phone.replace(/[^0-9]/g, '') === cleanPhone
    );
  }

  public isHumanTakeover(phone: string): boolean {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const conv = (this.data.whatsappConversations || []).find(
      (c: any) => c.phone.replace(/[^0-9]/g, '') === cleanPhone
    );
    return Boolean(conv?.human_takeover);
  }

  public setHumanTakeover(phone: string, active: boolean): void {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let conv = (this.data.whatsappConversations || []).find(
      (c: any) => c.phone.replace(/[^0-9]/g, '') === cleanPhone
    );
    if (conv) {
      conv.human_takeover = active;
      this.persist();
    }
  }

  public recordWhatsAppMessage(payload: {
    phone: string;
    name?: string;
    sender: 'GUEST' | 'BOT' | 'HUMAN';
    text: string;
    messageId?: string;
    status?: string;
    isLocationPin?: boolean;
    metadata?: any;
  }): any {
    if (!this.data.whatsappConversations) this.data.whatsappConversations = [];
    if (!this.data.whatsappMessages) this.data.whatsappMessages = [];

    const cleanPhone = payload.phone.replace(/[^0-9]/g, '');

    // 1. Guard against duplicate messageId if already stored
    if (payload.messageId) {
      const existing = this.data.whatsappMessages.find((m: any) => m.id === payload.messageId);
      if (existing) {
        if (payload.status) existing.status = payload.status;
        if (payload.metadata) existing.metadata = { ...existing.metadata, ...payload.metadata };
        return existing;
      }
    }

    // 2. Guard against rapid identical outbound/inbound dispatch within 4 seconds
    const recentDuplicate = this.data.whatsappMessages.find(
      (m: any) =>
        m.phone.replace(/[^0-9]/g, '') === cleanPhone &&
        m.sender === payload.sender &&
        m.text === payload.text &&
        Date.now() - new Date(m.timestamp).getTime() < 4000
    );
    if (recentDuplicate) {
      if (payload.messageId) recentDuplicate.id = payload.messageId;
      if (payload.status) recentDuplicate.status = payload.status;
      if (payload.metadata) recentDuplicate.metadata = { ...recentDuplicate.metadata, ...payload.metadata };
      return recentDuplicate;
    }

    const newMsg = {
      id: payload.messageId || `wam_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      phone: payload.phone,
      sender: payload.sender,
      text: payload.text,
      timestamp: new Date().toISOString(),
      status: payload.status || 'DELIVERED',
      isLocationPin: Boolean(payload.isLocationPin),
      metadata: payload.metadata || {},
    };

    this.data.whatsappMessages.push(newMsg);

    // Update or insert conversation
    let conv = this.data.whatsappConversations.find(
      (c: any) => c.phone.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (!conv) {
      conv = {
        id: `conv_${cleanPhone}`,
        phone: payload.phone,
        customer_name: payload.name || 'Khaki Guest',
        last_message_text: payload.text,
        last_message_at: new Date().toISOString(),
        last_sender: payload.sender,
        human_takeover: false,
        unread_count: payload.sender === 'GUEST' ? 1 : 0,
      };
      this.data.whatsappConversations.unshift(conv);
    } else {
      conv.last_message_text = payload.text;
      conv.last_message_at = new Date().toISOString();
      conv.last_sender = payload.sender;
      if (payload.name && (conv.customer_name === 'Khaki Guest' || !conv.customer_name)) {
        conv.customer_name = payload.name;
      }
      if (payload.sender === 'GUEST') {
        conv.unread_count = (conv.unread_count || 0) + 1;
      }
    }

    this.persist();
    return newMsg;
  }

  public updateConversation(
    phone: string,
    updates: {
      assigned_staff?: string;
      human_takeover?: boolean;
      inbound_stream?: string;
      priority_tier?: string;
      audit_data?: any;
    }
  ): any | null {
    if (!this.data.whatsappConversations) this.data.whatsappConversations = [];
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let conv = this.data.whatsappConversations.find(
      (c: any) => c.phone.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (!conv) {
      conv = {
        id: `conv_${cleanPhone}`,
        phone: phone,
        customer_name: 'Khaki Guest',
        last_message_text: 'Inbound inquiry',
        last_message_at: new Date().toISOString(),
        last_sender: 'GUEST',
        human_takeover: false,
        unread_count: 0,
      };
      this.data.whatsappConversations.unshift(conv);
    }

    if (updates.assigned_staff !== undefined) conv.assigned_staff = updates.assigned_staff;
    if (updates.human_takeover !== undefined) conv.human_takeover = updates.human_takeover;
    if (updates.inbound_stream !== undefined) conv.inbound_stream = updates.inbound_stream;
    if (updates.priority_tier !== undefined) conv.priority_tier = updates.priority_tier;
    if (updates.audit_data !== undefined) conv.audit_data = updates.audit_data;

    this.persist();
    return conv;
  }

  // ==========================================
  // MANIFESTS & ATTENDANCE
  // ==========================================
  public getManifestForDeparture(departureId: string): any {
    if (!this.data.manifests) this.data.manifests = [];
    
    // Find matching departure
    const dep = this.data.departures.find(
      (d: any) => d.id === departureId || d.departure_id === departureId
    );
    if (!dep) return null;

    const depDate = (dep.departure_date || '').slice(0, 10);
    const depTitle = (dep.tour_title || '').toLowerCase();

    // Find all real bookings matching this departure
    const matchingBookings = (this.data.bookings || []).filter((b: any) => {
      if (b.departure_id && (b.departure_id === dep.id || b.departure_id === dep.departure_id)) {
        return true;
      }
      const bDate = (b.departure_date || '').slice(0, 10);
      const bTitle = (b.tour_title || '').toLowerCase();
      return bDate === depDate && (depTitle.includes(bTitle.slice(0, 10)) || bTitle.includes(depTitle.slice(0, 10)));
    });

    // Map bookings to manifest guests
    const guests: any[] = [];
    matchingBookings.forEach((b: any, bIdx: number) => {
      const groupSize = Number(b.group_size) || 1;
      for (let i = 0; i < groupSize; i++) {
        const guestId = `${b.id}_g_${i + 1}`;
        const savedManifestEntry = this.data.manifests.find(
          (m: any) => m.guest_id === guestId || m.booking_id === b.id
        );

        guests.push({
          id: guestId,
          booking_id: b.id,
          booking_ref: b.booking_reference || `KT-BKG-${bIdx + 1000}`,
          full_name: i === 0 ? b.contact_name : `${b.contact_name} (Guest ${i + 1})`,
          phone: b.contact_phone || '+91 98200 00000',
          age: 32 + (i * 4),
          gender: i % 2 === 0 ? 'Female' : 'Male',
          id_type: 'AADHAAR',
          id_number: '•••• •••• ' + (1000 + (bIdx * 10) + i),
          dietary_preference: b.dietary_preference || (i === 1 ? 'Vegetarian' : 'No Restrictions'),
          emergency_contact_name: b.emergency_contact_name || 'Relative / Family Desk',
          emergency_contact_phone: b.emergency_contact_phone || b.contact_phone || '+91 98200 11990',
          payment_status: b.status || 'PAID',
          payment_ref: b.payment_reference || b.booking_reference,
          verified: true,
          attended: savedManifestEntry ? savedManifestEntry.attended : false,
        });
      }
    });

    // If zero bookings yet for an empty test slot, supply realistic roster seeds
    if (guests.length === 0) {
      const sampleNames = ['Karan Mehra', 'Pooja Mehra', 'Vikram Singhania', 'Elena Rostova'];
      sampleNames.forEach((name, idx) => {
        const guestId = `seed_${dep.id || 'dep'}_${idx}`;
        const savedManifestEntry = this.data.manifests.find((m: any) => m.guest_id === guestId);
        guests.push({
          id: guestId,
          booking_id: `bkg_seed_${idx}`,
          booking_ref: `KT-BKG-${8900 + idx}`,
          full_name: name,
          phone: `+91 98200 ${88710 + idx}`,
          age: 30 + idx * 5,
          gender: idx % 2 === 0 ? 'Male' : 'Female',
          id_type: idx === 3 ? 'PASSPORT' : 'AADHAAR',
          id_number: idx === 3 ? 'ES8901239' : `•••• •••• ${4910 + idx}`,
          dietary_preference: idx === 0 ? 'Strict Vegetarian (Jain)' : 'Regular Vegetarian',
          emergency_contact_name: idx === 3 ? 'Consulate Duty Desk' : 'Pooja Mehra',
          emergency_contact_phone: '+91 98200 11990',
          payment_status: 'PAID',
          payment_ref: `KT-BKG-${8900 + idx}`,
          verified: true,
          attended: savedManifestEntry ? savedManifestEntry.attended : idx === 0,
        });
      });
    }

    return {
      departure: dep,
      total_booked: guests.length,
      capacity: dep.max_capacity || 25,
      checked_in_count: guests.filter((g: any) => g.attended).length,
      guests,
    };
  }

  public updateGuestAttendance(guestId: string, attended: boolean): boolean {
    if (!this.data.manifests) this.data.manifests = [];
    let entry = this.data.manifests.find((m: any) => m.guest_id === guestId);
    if (!entry) {
      entry = { guest_id: guestId, attended, updated_at: new Date().toISOString() };
      this.data.manifests.push(entry);
    } else {
      entry.attended = attended;
      entry.updated_at = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  // ==========================================
  // DISPATCH BOARD & LOGISTICS
  // ==========================================
  public getDispatches(): any[] {
    if (!this.data.dispatches) this.data.dispatches = [];
    return this.data.dispatches;
  }

  public createDispatch(payload: any): any {
    if (!this.data.dispatches) this.data.dispatches = [];
    const newDispatch = {
      id: payload.id || `disp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bookingRef: payload.bookingRef || 'KT-BKG-MANUAL',
      tourTitle: payload.tourTitle || 'Private Heritage Experience',
      category: payload.category || 'PRIVATE_GROUP',
      resourceType: payload.resourceType || 'GUIDE',
      entityName: payload.entityName || 'Ambassador Pool Broadcast',
      entityRoleOrVehicle: payload.entityRoleOrVehicle || 'Contractor Historian',
      entityPhone: payload.entityPhone || '+91 98200 11992',
      payoutInr: Number(payload.payoutInr) || 2500,
      status: payload.status || 'BROADCAST_SENT',
      timeLeftMinutes: Number(payload.timeLeftMinutes) || 30,
      channel: payload.channel || 'WHATSAPP_DIRECT',
      created_at: new Date().toISOString(),
    };
    this.data.dispatches.unshift(newDispatch);
    this.persist();
    return newDispatch;
  }

  public updateDispatchStatus(id: string, status: string, assignedEntity?: string): any | null {
    if (!this.data.dispatches) return null;
    const item = this.data.dispatches.find((d: any) => d.id === id);
    if (item) {
      item.status = status;
      if (assignedEntity) {
        item.entityName = assignedEntity;
      }
      this.persist();
    }
    return item;
  }

  // ==========================================
  // AMBASSADOR (GUIDE) INTELLIGENCE & ROSTER
  // ==========================================
  private getSeedGuides(): any[] {
    return [
      {
        id: 'guide_aniket',
        name: 'Aniket P.',
        phone: '+91 98200 11992',
        dayJob: 'High Court Advocate & Legal Historian',
        seniority: 'SENIOR_FELLOW',
        rating: 4.98,
        totalWalksLed: 74,
        toursAssignedThisMonth: 2,
        monthlyPayoutInr: 5000,
        primaryClusters: ['SOUTH_MUMBAI_FORT', 'BALLARD_ESTATE', 'KALA_GHODA'],
        specializations: ['Legal & High Court History', 'Colonial Jurisprudence', 'Victorian Gothic Architecture'],
        certifiedTours: ['kt_tour_14328', 'kt_tour_cst', 'kt_tour_highcourt', 'kt_tour_ballard', 'Fort Heritage', 'Art Deco'],
        availableDays: ['SATURDAY_MORNING', 'SATURDAY_EVENING', 'SUNDAY_MORNING', 'FRIDAY_EVENING'],
        reliabilityRate: 99.2,
        status: 'AVAILABLE',
      },
      {
        id: 'guide_alisha',
        name: 'Alisha M.',
        phone: '+91 98201 44552',
        dayJob: 'Conservation Architect & Urban Planner',
        seniority: 'SENIOR_FELLOW',
        rating: 4.95,
        totalWalksLed: 62,
        toursAssignedThisMonth: 3,
        monthlyPayoutInr: 7500,
        primaryClusters: ['BANDRA_SUBURBAN', 'SOUTH_MUMBAI_FORT'],
        specializations: ['Art Deco Conservation', 'Portuguese Bandra Hamlets', 'Historic Facades'],
        certifiedTours: ['kt_tour_bandra', 'kt_tour_artdeco', 'kt_tour_ranwar', 'Bandra Villages', 'Art Deco'],
        availableDays: ['SATURDAY_EVENING', 'SUNDAY_MORNING', 'SUNDAY_EVENING'],
        reliabilityRate: 98.5,
        status: 'AVAILABLE',
      },
      {
        id: 'guide_farhan',
        name: 'Farhan K.',
        phone: '+91 98199 77812',
        dayJob: 'Historical Geographer & Map Archivist',
        seniority: 'CORE_AMBASSADOR',
        rating: 4.91,
        totalWalksLed: 48,
        toursAssignedThisMonth: 1,
        monthlyPayoutInr: 2500,
        primaryClusters: ['GAMDEVI_GIRGAON', 'DOCKLANDS_MAZAGAON'],
        specializations: ['Freedom Movement (Gowalia Tank)', 'Old Bombay Cartography', 'Koli Settlements'],
        certifiedTours: ['kt_tour_gamdevi', 'kt_tour_girgaon', 'kt_tour_mazagaon', 'Gamdevi', 'Girgaon', 'Mazagaon Docklands'],
        availableDays: ['SATURDAY_MORNING', 'SUNDAY_MORNING', 'WEEKDAY_MORNINGS'],
        reliabilityRate: 97.8,
        status: 'AVAILABLE',
      },
      {
        id: 'guide_rohit',
        name: 'Rohit S.',
        phone: '+91 98203 99120',
        dayJob: 'Marine Engineer & Sailing Enthusiast',
        seniority: 'CORE_AMBASSADOR',
        rating: 4.89,
        totalWalksLed: 36,
        toursAssignedThisMonth: 1,
        monthlyPayoutInr: 2500,
        primaryClusters: ['HARBOUR_ISLANDS', 'COLABA'],
        specializations: ['Naval Heritage', 'Historic Lighthouses & Forts', 'Island Topography'],
        certifiedTours: ['kt_tour_cruise', 'kt_tour_islands', 'kt_tour_colaba', 'Mumbai Harbour Cruise', 'Island Explorations'],
        availableDays: ['SUNDAY_MORNING', 'SUNDAY_EVENING'],
        reliabilityRate: 96.5,
        status: 'AVAILABLE',
      },
      {
        id: 'guide_pooja',
        name: 'Pooja N.',
        phone: '+91 98202 88411',
        dayJob: 'Textile Designer & Museum Docent',
        seniority: 'APPRENTICE_GUIDE',
        rating: 4.84,
        totalWalksLed: 14,
        toursAssignedThisMonth: 0,
        monthlyPayoutInr: 0,
        primaryClusters: ['CENTRAL_MUMBAI_MILLS', 'BYCULLA'],
        specializations: ['Girangaon Mill Heritage', 'Labour Movement', 'Botanical Gardens (Rani Bagh)'],
        certifiedTours: ['kt_tour_lalbaug', 'kt_tour_byculla', 'kt_tour_parel', 'Lalbaug Mills', 'Byculla Victorian'],
        availableDays: ['SATURDAY_MORNING', 'SATURDAY_EVENING'],
        reliabilityRate: 95.0,
        status: 'AVAILABLE',
      },
      {
        id: 'guide_vikram',
        name: 'Vikram D.',
        phone: '+91 98200 99881',
        dayJob: 'Culinary Anthropologist & Food Author',
        seniority: 'CORE_AMBASSADOR',
        rating: 4.94,
        totalWalksLed: 53,
        toursAssignedThisMonth: 2,
        monthlyPayoutInr: 5000,
        primaryClusters: ['SOUTH_MUMBAI_FORT', 'BHENDI_BAZAAR'],
        specializations: ['Irani Chai Lore', 'Parsi & Bohri Culinary History', 'Historic Spice Routes'],
        certifiedTours: ['kt_tour_food_fort', 'kt_tour_mohalla', 'Food Trails', 'Bhendi Bazaar', 'Irani Cafe Walk'],
        availableDays: ['WEEKDAY_EVENINGS', 'SATURDAY_EVENING', 'SUNDAY_EVENING'],
        reliabilityRate: 99.0,
        status: 'AVAILABLE',
      },
    ];
  }

  public getGuides(): any[] {
    if (!this.data.guides || this.data.guides.length === 0) {
      this.data.guides = this.getSeedGuides();
      this.persist();
    }
    return this.data.guides;
  }

  public getGuideById(id: string): any | null {
    return this.getGuides().find((g: any) => g.id === id) || null;
  }

  public updateGuide(id: string, updates: any): any | null {
    const guides = this.getGuides();
    const g = guides.find((guide: any) => guide.id === id);
    if (g) {
      Object.assign(g, updates);
      this.persist();
    }
    return g;
  }

  /**
   * Recommendation Rule Engine:
   * Recommends ranked candidates based on active allocation policy (ROUND_ROBIN, SENIORITY_VIP, FCFS_BROADCAST)
   */
  public recommendGuidesForTour(params: {
    tourTitle: string;
    tourDate?: string;
    category?: string;
    policy?: 'ROUND_ROBIN' | 'SENIORITY_VIP' | 'FCFS_BROADCAST';
  }): { policy: string; recommendedGuideId: string; candidates: any[] } {
    const policy = params.policy || (params.category === 'CORPORATE' ? 'SENIORITY_VIP' : 'ROUND_ROBIN');
    const guides = this.getGuides();
    const titleLower = (params.tourTitle || '').toLowerCase();

    // Score and annotate candidates
    const scored = guides.map((g: any) => {
      // Certification check
      const isCertified = g.certifiedTours.some((ct: string) =>
        titleLower.includes(ct.toLowerCase()) || ct.toLowerCase().includes(titleLower.slice(0, 8))
      ) || titleLower.length === 0;

      // Day match check
      let dayMatch = true;
      if (params.tourDate) {
        const dayOfWeek = new Date(params.tourDate).getDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek === 6 && !g.availableDays.some((d: string) => d.includes('SATURDAY'))) dayMatch = false;
        if (dayOfWeek === 0 && !g.availableDays.some((d: string) => d.includes('SUNDAY'))) dayMatch = false;
      }

      let score = 0;
      let matchReason = '';

      if (policy === 'ROUND_ROBIN') {
        // Fewest tours assigned this month gets highest priority
        score = 100 - (g.toursAssignedThisMonth * 25);
        if (isCertified) score += 20;
        if (dayMatch) score += 10;
        matchReason = `Fairness Priority: ${g.toursAssignedThisMonth} tours assigned this month (Team avg: 1.8). Certified: ${isCertified ? 'Yes' : 'Domain Adjacent'}`;
      } else if (policy === 'SENIORITY_VIP') {
        // High prestige, domain profession match, star rating
        const seniorityBonus = g.seniority === 'SENIOR_FELLOW' ? 40 : g.seniority === 'CORE_AMBASSADOR' ? 25 : 10;
        score = (g.rating * 10) + seniorityBonus;
        if (isCertified) score += 30;
        matchReason = `VIP Match: ${g.seniority.replace('_', ' ')} (${g.rating}★). Profession: ${g.dayJob}`;
      } else {
        // Speed Broadcast: all active eligible guides
        score = isCertified ? 80 : 50;
        matchReason = `Fast-Track WhatsApp Broadcast: Direct prompt sent with 30-min timer.`;
      }

      return {
        ...g,
        recommendationScore: score,
        isCertified,
        dayMatch,
        matchReason,
      };
    });

    // Sort descending by score
    scored.sort((a: any, b: any) => b.recommendationScore - a.recommendationScore);

    return {
      policy,
      recommendedGuideId: scored[0]?.id || 'guide_aniket',
      candidates: scored,
    };
  }

  public allocateGuide(departureIdOrDispatchId: string, guideId: string): any {
    const guide = this.getGuideById(guideId);
    if (!guide) return null;

    // Increment workload metrics
    guide.toursAssignedThisMonth = (guide.toursAssignedThisMonth || 0) + 1;
    guide.monthlyPayoutInr = (guide.monthlyPayoutInr || 0) + 2500;
    guide.totalWalksLed = (guide.totalWalksLed || 0) + 1;

    // Check if matching departure exists
    const dep = this.data.departures.find((d: any) => d.id === departureIdOrDispatchId || d.departure_id === departureIdOrDispatchId);
    if (dep) {
      dep.assigned_guide_name = `${guide.name} (${guide.seniority.replace('_', ' ')})`;
      dep.assigned_guide_phone = guide.phone;
    }

    // Check if matching dispatch exists
    const disp = this.data.dispatches.find((d: any) => d.id === departureIdOrDispatchId);
    if (disp) {
      disp.status = 'ASSIGNED';
      disp.entityName = `${guide.name} (${guide.dayJob})`;
      disp.entityPhone = guide.phone;
    }

    this.persist();
    return { success: true, guide, departure: dep, dispatch: disp };
  }

  public substituteGuide(departureIdOrDispatchId: string, newGuideId: string, previousGuideId?: string, reason?: string): any {
    const newGuide = this.getGuideById(newGuideId);
    if (!newGuide) return null;

    const dep = this.data.departures.find((d: any) => d.id === departureIdOrDispatchId || d.departure_id === departureIdOrDispatchId);
    const disp = this.data.dispatches.find((d: any) => d.id === departureIdOrDispatchId);

    // If previous guide identified, decrement their load
    let prevGuideObj: any = null;
    if (previousGuideId) {
      prevGuideObj = this.getGuideById(previousGuideId);
    } else if (dep?.assigned_guide_name) {
      prevGuideObj = this.getGuides().find((g: any) => dep.assigned_guide_name.includes(g.name));
    }

    if (prevGuideObj && prevGuideObj.id !== newGuideId) {
      prevGuideObj.toursAssignedThisMonth = Math.max(0, (prevGuideObj.toursAssignedThisMonth || 1) - 1);
      prevGuideObj.monthlyPayoutInr = Math.max(0, (prevGuideObj.monthlyPayoutInr || 2500) - 2500);
    }

    // Increment new guide load
    newGuide.toursAssignedThisMonth = (newGuide.toursAssignedThisMonth || 0) + 1;
    newGuide.monthlyPayoutInr = (newGuide.monthlyPayoutInr || 0) + 2500;
    newGuide.totalWalksLed = (newGuide.totalWalksLed || 0) + 1;

    if (dep) {
      dep.assigned_guide_name = `${newGuide.name} (${newGuide.seniority.replace('_', ' ')})`;
      dep.assigned_guide_phone = newGuide.phone;
    }
    if (disp) {
      disp.status = 'ASSIGNED';
      disp.entityName = `${newGuide.name} (${newGuide.dayJob})`;
      disp.entityPhone = newGuide.phone;
    }

    this.persist();
    return {
      success: true,
      newGuide,
      previousGuide: prevGuideObj,
      departure: dep,
      dispatch: disp,
      substitutionReason: reason || 'Emergency guide reassignment',
    };
  }

  // ==========================================
  // BESPOKE & CUSTOM TOUR PROPOSALS
  // ==========================================
  public getBespokeProposals(): any[] {
    if (!this.data.proposals) this.data.proposals = [];
    return this.data.proposals;
  }

  public createBespokeProposal(proposal: any): any {
    if (!this.data.proposals) this.data.proposals = [];
    const newProposal = {
      id: proposal.id || `prop_bespoke_${Date.now()}`,
      clientName: proposal.clientName || 'VIP Private Client',
      clientPhone: proposal.clientPhone || '+91 98200 00000',
      clientEmail: proposal.clientEmail || '',
      organization: proposal.organization || '',
      themeTitle: proposal.themeTitle || 'Bespoke Heritage Walk',
      cluster: proposal.cluster || 'SOUTH_MUMBAI_FORT',
      stops: proposal.stops || [],
      estimatedDurationHours: Number(proposal.estimatedDurationHours) || 2.5,
      estimatedDistanceKm: Number(proposal.estimatedDistanceKm) || 2.0,
      groupSize: Number(proposal.groupSize) || 2,
      scheduledDate: proposal.scheduledDate || '2026-10-18',
      assignedGuideId: proposal.assignedGuideId || 'guide_aniket',
      assignedGuideName: proposal.assignedGuideName || 'Aniket P. (Senior Fellow)',
      vehicleRequired: Boolean(proposal.vehicleRequired),
      baseCuratorFeeInr: Number(proposal.baseCuratorFeeInr) || 12000,
      perHeadFeeInr: Number(proposal.perHeadFeeInr) || 1200,
      logisticsAddonInr: Number(proposal.logisticsAddonInr) || 0,
      totalAmountInr: Number(proposal.totalAmountInr) || 15400,
      taxSacCode: proposal.organization ? '998554' : '998555',
      gstRate: proposal.organization ? '18%' : '5%',
      status: proposal.status || 'PROPOSAL_GENERATED',
      created_at: new Date().toISOString(),
    };

    this.data.proposals.unshift(newProposal);
    this.persist();
    return newProposal;
  }

  // ==========================================
  // COST SETTINGS & PRICING INVENTORY
  // ==========================================
  public getDefaultCostSettings(): CostSettings {
    return {
      guidePayouts: {
        SENIOR_FELLOW: 3500,
        CORE_AMBASSADOR: 2500,
        APPRENTICE_GUIDE: 1800,
        BESPOKE_CURATOR_LEAD: 12000,
        EMERGENCY_SUBSTITUTION_BONUS: 500,
      },
      siteEntryFees: [
        {
          id: 'site_asiatic',
          siteName: 'Asiatic Society Town Hall & Library',
          category: 'HERITAGE_MONUMENT',
          feePerHeadInr: 250,
          notes: 'Special access permit for Durbar Hall & rare manuscript vault',
        },
        {
          id: 'site_sassoon_lib',
          siteName: 'David Sassoon Library & Reading Room',
          category: 'HERITAGE_MONUMENT',
          feePerHeadInr: 150,
          notes: 'Heritage garden & Venetian Gothic reading room pass',
        },
        {
          id: 'site_bdl_museum',
          siteName: 'Dr. Bhau Daji Lad City Museum',
          category: 'MUSEUM',
          feePerHeadInr: 100,
          notes: 'Municipal heritage trust entry fee',
        },
        {
          id: 'site_high_court',
          siteName: 'Bombay High Court Heritage Museum Pass',
          category: 'PERMIT',
          feePerHeadInr: 500,
          notes: 'Special weekend security clearance & registrar pass',
        },
        {
          id: 'site_elephanta_ferry',
          siteName: 'Elephanta Island Return Catamaran Ticket',
          category: 'FERRY',
          feePerHeadInr: 260,
          notes: 'Apollo Bunder to Gharapuri jetty return ticket + harbour cess',
        },
        {
          id: 'site_sassoon_dock',
          siteName: 'Sassoon Dock Port Trust Security Pass',
          category: 'PERMIT',
          feePerHeadInr: 50,
          notes: 'Fisheries terminal day permit for dawn fish auction walk',
        },
      ],
      logisticsInventory: [
        {
          id: 'log_jeep_vintage',
          vehicleType: 'Vintage Open Jeep (MH-01-KT-1947)',
          provider: 'Ramesh Gurav Transport',
          costInr: 4500,
          billingUnit: 'PER_TOUR',
          capacity: 6,
        },
        {
          id: 'log_suv_innova',
          vehicleType: 'AC Toyota Innova Crysta VIP',
          provider: 'Maharashtra Tourist Cabs',
          costInr: 3800,
          billingUnit: 'PER_TOUR',
          capacity: 6,
        },
        {
          id: 'log_tempo_17',
          vehicleType: 'AC Force Tempo Traveller (17-Seater)',
          provider: 'Siddhivinayak Fleet',
          costInr: 7500,
          billingUnit: 'PER_DAY',
          capacity: 17,
        },
        {
          id: 'log_boat_launch',
          vehicleType: 'Private Motor Launch / Harbour Cruise',
          provider: 'Gateway Sea Charters',
          costInr: 14000,
          billingUnit: 'PER_TOUR',
          capacity: 25,
        },
      ],
      fnbInventory: [
        {
          id: 'fnb_irani_chai',
          itemName: 'Heritage Irani Chai + Brun Maska + Khari',
          vendor: 'Yazdani Bakery & B. Merwan',
          costPerHeadInr: 120,
          cluster: 'SOUTH_MUMBAI_FORT',
        },
        {
          id: 'fnb_bohri_feast',
          itemName: 'Authentic 5-Course Bohri Mohalla Tasting Feast',
          vendor: 'Firdous & Surti Mithai',
          costPerHeadInr: 1400,
          cluster: 'CULINARY_CENTRAL',
        },
        {
          id: 'fnb_koli_seafood',
          itemName: 'Koli Fisherman Seafood Platter Tasting',
          vendor: 'Worli Fisherfolk Cooperative',
          costPerHeadInr: 850,
          cluster: 'WORLI_KOLIWADA',
        },
        {
          id: 'fnb_heritage_tea',
          itemName: 'Colonial High Tea Platter & Scones',
          vendor: 'Sea Lounge / Taj Mahal Palace',
          costPerHeadInr: 1950,
          cluster: 'SOUTH_MUMBAI_FORT',
        },
      ],
    };
  }

  public getCostSettings(): CostSettings {
    if (!this.data.costSettings) {
      this.data.costSettings = this.getDefaultCostSettings();
      this.persist();
    }
    return this.data.costSettings;
  }

  public updateCostSettings(updates: Partial<CostSettings>): CostSettings {
    const current = this.getCostSettings();
    this.data.costSettings = {
      ...current,
      ...updates,
      guidePayouts: {
        ...current.guidePayouts,
        ...(updates.guidePayouts || {}),
      },
    };
    this.persist();
    return this.data.costSettings;
  }

  public calculateTourMargin(params: {
    tourPricePerPaxInr?: number;
    flatGroupPriceInr?: number;
    pax: number;
    guideSeniority: 'SENIOR_FELLOW' | 'CORE_AMBASSADOR' | 'APPRENTICE_GUIDE' | 'BESPOKE_CURATOR_LEAD';
    selectedSiteIds?: string[];
    selectedLogisticsId?: string;
    selectedFnbIds?: string[];
  }): {
    totalRevenueInr: number;
    breakdown: {
      guidePayoutInr: number;
      siteFeesTotalInr: number;
      logisticsCostInr: number;
      fnbCostTotalInr: number;
    };
    totalCostInr: number;
    grossProfitInr: number;
    grossMarginPercent: number;
  } {
    const settings = this.getCostSettings();
    const pax = Math.max(1, params.pax || 1);

    const totalRevenueInr = params.flatGroupPriceInr
      ? params.flatGroupPriceInr
      : (params.tourPricePerPaxInr || 899) * pax;

    const guidePayoutInr =
      (settings.guidePayouts as any)[params.guideSeniority] || settings.guidePayouts.CORE_AMBASSADOR;

    let siteFeesTotalInr = 0;
    if (params.selectedSiteIds && params.selectedSiteIds.length > 0) {
      const matchedSites = settings.siteEntryFees.filter((s) => params.selectedSiteIds!.includes(s.id));
      siteFeesTotalInr = matchedSites.reduce((sum, s) => sum + s.feePerHeadInr * pax, 0);
    }

    let logisticsCostInr = 0;
    if (params.selectedLogisticsId) {
      const vehicle = settings.logisticsInventory.find((v) => v.id === params.selectedLogisticsId);
      if (vehicle) {
        logisticsCostInr = vehicle.billingUnit === 'PER_HEAD' ? vehicle.costInr * pax : vehicle.costInr;
      }
    }

    let fnbCostTotalInr = 0;
    if (params.selectedFnbIds && params.selectedFnbIds.length > 0) {
      const matchedFnb = settings.fnbInventory.filter((f) => params.selectedFnbIds!.includes(f.id));
      fnbCostTotalInr = matchedFnb.reduce((sum, f) => sum + f.costPerHeadInr * pax, 0);
    }

    const totalCostInr = guidePayoutInr + siteFeesTotalInr + logisticsCostInr + fnbCostTotalInr;
    const grossProfitInr = totalRevenueInr - totalCostInr;
    const grossMarginPercent =
      totalRevenueInr > 0 ? Number(((grossProfitInr / totalRevenueInr) * 100).toFixed(1)) : 0;

    return {
      totalRevenueInr,
      breakdown: {
        guidePayoutInr,
        siteFeesTotalInr,
        logisticsCostInr,
        fnbCostTotalInr,
      },
      totalCostInr,
      grossProfitInr,
      grossMarginPercent,
    };
  }
}

export const appStore = PersistentStore.getInstance();

