'use client';

import { useState, useEffect } from 'react';

interface Booking {
  id: string;
  booking_reference: string;
  contact_id?: string;
  contact_name: string;
  contact_phone: string;
  company?: string;
  tour_title: string;
  departure_date: string;
  group_size: number;
  total_amount_inr: number;
  amount_paid_inr: number;
  status: string;
  category: string;
  gst_amount_inr: number;
  sac_code: string;
  payment_method: string;
  assigned_guide?: string;
  assigned_vendor?: string;
  created_at: string;
}

export default function BookingsManagerPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false);
  const [webhookTab, setWebhookTab] = useState<'SIMULATOR' | 'DOCS'>('SIMULATOR');
  const [isFiringWebhook, setIsFiringWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  // Webhook Simulator Selected Preset
  const [simPreset, setSimPreset] = useState<'PUBLIC_WALK' | 'PRIVATE_URGENT' | 'CORP_B2B'>('PUBLIC_WALK');

  // New Booking Form
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('+91 ');
  const [companyName, setCompanyName] = useState('');
  const [tourTitle, setTourTitle] = useState('#FortWalk Colonial Heritage');
  const [departureDate, setDepartureDate] = useState('2026-10-12 16:30');
  const [paxCount, setPaxCount] = useState(2);
  const [ticketPrice, setTicketPrice] = useState(899);
  const [category, setCategory] = useState('STANDARD_WALK');
  const [paymentMethod, setPaymentMethod] = useState('UPI Instant QR');
  const [bookingDiscountPercent, setBookingDiscountPercent] = useState<number>(0);

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error('Failed to load bookings', e);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.booking_reference.toLowerCase().includes(q) ||
      b.contact_name.toLowerCase().includes(q) ||
      b.contact_phone.includes(q) ||
      b.tour_title.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const grossAmount = paxCount * ticketPrice;
    const discountAmount = Math.round(grossAmount * (bookingDiscountPercent / 100));
    const totalAmount = grossAmount - discountAmount;
    const isCorporate = category === 'CORPORATE';
    const gstRate = isCorporate ? 0.18 : 0.05;
    const base = totalAmount / (1 + gstRate);
    const gst = totalAmount - base;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: guestName,
          contact_phone: guestPhone,
          company: companyName,
          tour_title: tourTitle,
          departure_date: departureDate,
          group_size: paxCount,
          total_amount_inr: totalAmount,
          amount_paid_inr: totalAmount,
          status: 'CONFIRMED',
          category,
          gst_amount_inr: Number(gst.toFixed(2)),
          payment_method: paymentMethod,
          assigned_guide: 'Aniket (Legal Historian)',
          discount_percent: bookingDiscountPercent,
          discount_amount_inr: discountAmount,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setGuestName('');
        setCompanyName('');
        await loadBookings();
      }
    } catch (err) {
      console.error('Error creating booking', err);
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount_inr || 0), 0);
  const totalGuests = bookings.reduce((sum, b) => sum + (b.group_size || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bookings, Orders & Seat Inventory
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Manage incoming retail walk bookings, private group deposits, and corporate retreat contracts. 
            View real-time payment states, seat deductions, and tax compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <button
            onClick={() => {
              setWebhookResult(null);
              setShowWebhookModal(true);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg transition shadow flex items-center gap-1.5"
          >
            <span>⚡</span> Ingest Website Order (Webhook)
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center gap-1.5"
          >
            <span>+</span> Create New Booking
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Bookings</div>
          <div className="text-2xl font-bold text-white mt-1">{bookings.length} Orders</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Active in system</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Guests Booked</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{totalGuests} Pax</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all confirmed slots</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Gross Booking Value</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tracked revenue</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Payment Status</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">100% Paid</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Instant UPI & Net Banking</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search bookings by reference (KT-BKG-...), guest name, phone, or tour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap gap-1 text-xs">
          {['ALL', 'CONFIRMED', 'PAYMENT_PENDING', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Booking Ref</th>
                <th className="p-3.5">Guest & Contact</th>
                <th className="p-3.5">Experience & Slot</th>
                <th className="p-3.5">Pax</th>
                <th className="p-3.5">Amount (INR)</th>
                <th className="p-3.5">Tax Scheme</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 font-mono font-bold text-amber-400">
                    {b.booking_reference}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{b.contact_name}</div>
                    {b.company && <div className="text-[10px] text-amber-400">{b.company}</div>}
                    <div className="text-[11px] text-slate-400 font-mono">{b.contact_phone}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-200">{b.tour_title}</div>
                    <div className="text-[11px] text-slate-500">{b.departure_date}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-200">{b.group_size}</td>
                  <td className="p-3.5 font-bold text-emerald-400 text-sm">
                    ₹{b.total_amount_inr.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      SAC {b.sac_code || '998555'}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{b.payment_method}</td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Create New Booking */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create New Tour Booking</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Lead Guest Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohinton Batliwala"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 00000"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Company / Group Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Godrej Properties / Family Group"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tour Experience</label>
                <input
                  type="text"
                  required
                  value={tourTitle}
                  onChange={(e) => setTourTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Pax Count</label>
                  <input
                    type="number"
                    min={1}
                    value={paxCount}
                    onChange={(e) => setPaxCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Per Pax Rate (INR)</label>
                  <input
                    type="number"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Total Price (INR)</label>
                  <div className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-emerald-400 font-mono font-bold">
                    ₹{(paxCount * ticketPrice).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Departure Date & Time</label>
                  <input
                    type="text"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="STANDARD_WALK">Standard Scheduled Walk</option>
                    <option value="PRIVATE_GROUP">Private / Open Jeep Tour</option>
                    <option value="CORPORATE">Corporate B2B Retreat</option>
                  </select>
                </div>
              </div>

              {/* Courtesy Discount & Pricing Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Courtesy / Client Discount</label>
                  <select
                    value={bookingDiscountPercent}
                    onChange={(e) => setBookingDiscountPercent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={0}>No Discount (0%)</option>
                    <option value={5}>5% Repeat Walker Courtesy</option>
                    <option value={10}>10% Loyalty / Group Special</option>
                    <option value={15}>15% Executive / Founder Waiver</option>
                  </select>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-400">Total Payable:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-400 font-mono">
                      ₹{(paxCount * ticketPrice - Math.round((paxCount * ticketPrice) * (bookingDiscountPercent / 100))).toLocaleString('en-IN')}
                    </span>
                    {bookingDiscountPercent > 0 && (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        ({bookingDiscountPercent}% off applied)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow"
                >
                  Confirm & Lock Seats
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* WEB ORDER INGESTION WEBHOOK SIMULATOR & DOCS MODAL         */}
      {/* ========================================================= */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Integration Gateway
                </span>
                <h3 className="font-bold text-white text-base mt-0.5 flex items-center gap-2">
                  <span>⚡</span> Website Order Webhook Ingestion & Simulator
                </h3>
              </div>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setWebhookTab('SIMULATOR')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition ${
                  webhookTab === 'SIMULATOR'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🚀 Live Web Order Simulator (Test Drive)
              </button>
              <button
                type="button"
                onClick={() => setWebhookTab('DOCS')}
                className={`flex-1 py-1.5 rounded-md font-semibold transition ${
                  webhookTab === 'DOCS'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 Webhook Contract & Code Snippets
              </button>
            </div>

            {/* TAB 1: INTERACTIVE SIMULATOR */}
            {webhookTab === 'SIMULATOR' && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-400 text-xs">
                  Test how orders arriving from <strong>khakitours.com</strong>, WooCommerce, or Razorpay automatically cascade through Khaki OS rules without needing the website form built first.
                </p>

                {/* Preset Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Select Test Order Scenario:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimPreset('PUBLIC_WALK')}
                      className={`p-3 rounded-xl border text-left transition space-y-1 ${
                        simPreset === 'PUBLIC_WALK'
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-emerald-400">1. Scheduled Public Walk</div>
                      <div className="text-[10px] text-slate-400">Tier 1 Fast-Path</div>
                      <div className="text-[10px] text-slate-300">2 Pax on #DurgasOf Mumbai. Auto-decrements seats & sends pass.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimPreset('PRIVATE_URGENT')}
                      className={`p-3 rounded-xl border text-left transition space-y-1 ${
                        simPreset === 'PRIVATE_URGENT'
                          ? 'bg-amber-500/10 border-amber-500/50 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-amber-400">2. Urgent Private Tour</div>
                      <div className="text-[10px] text-slate-400">Tier 2 Hold-Track (&lt;24h)</div>
                      <div className="text-[10px] text-slate-300">4 Pax Vintage Jeep. Spawns Guide + Jeep tickets on Dispatch board.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimPreset('CORP_B2B')}
                      className={`p-3 rounded-xl border text-left transition space-y-1 ${
                        simPreset === 'CORP_B2B'
                          ? 'bg-purple-500/10 border-purple-500/50 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-purple-400">3. Corporate B2B Retreat</div>
                      <div className="text-[10px] text-slate-400">18% GST (SAC 998554)</div>
                      <div className="text-[10px] text-slate-300">15 Pax Godrej Delegation. Triggers Founder 15-min SLA timer.</div>
                    </button>
                  </div>
                </div>

                {/* Simulated Order Details Box */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-sans">Simulated Webhook Payload:</div>
                  <div className="text-slate-300">
                    {simPreset === 'PUBLIC_WALK' && (
                      <>
                        <div>&bull; Customer: <span className="text-white font-bold">Aditi Rao</span> (+91 98200 11223)</div>
                        <div>&bull; Tour: <span className="text-amber-400">#DurgasOf Mumbai: Navratri Special Walk</span> (Sat 08:00 AM)</div>
                        <div>&bull; Group Size: 2 Pax &bull; Amount: ₹1,798 (Paid via Razorpay UPI)</div>
                        <div>&bull; Rule Expected: <span className="text-emerald-400 font-bold">TIER_1_FAST_PATH</span> (Instant Booking & Calendar Seat Lock)</div>
                      </>
                    )}
                    {simPreset === 'PRIVATE_URGENT' && (
                      <>
                        <div>&bull; Customer: <span className="text-white font-bold">Vikram Shroff</span> (+91 98199 77881)</div>
                        <div>&bull; Tour: <span className="text-amber-400">Vintage Open Jeep #UrbanSafari</span> (Today/Tomorrow)</div>
                        <div>&bull; Group Size: 4 Pax &bull; Amount: ₹14,500 (Resource Lock Required)</div>
                        <div>&bull; Rule Expected: <span className="text-amber-400 font-bold">TIER_2_HOLD_TRACK</span> (Guide + Jeep Dispatch Multicast)</div>
                      </>
                    )}
                    {simPreset === 'CORP_B2B' && (
                      <>
                        <div>&bull; Customer: <span className="text-white font-bold">Karan Mehra</span> (+91 98200 88712 - Godrej Properties)</div>
                        <div>&bull; Tour: <span className="text-amber-400">Bespoke Architectural Offsite</span> (18 Oct 2026)</div>
                        <div>&bull; Group Size: 15 Pax &bull; Amount: ₹18,750 + 18% GST (SAC 998554)</div>
                        <div>&bull; Rule Expected: <span className="text-purple-400 font-bold">CORPORATE_B2B_SLA</span> (15-Min Founder Alert)</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Fire Button */}
                <button
                  type="button"
                  disabled={isFiringWebhook}
                  onClick={async () => {
                    setIsFiringWebhook(true);
                    setWebhookResult(null);
                    try {
                      let payload: any = {};
                      if (simPreset === 'PUBLIC_WALK') {
                        payload = {
                          order_source: 'KHAKITOURS_WEB',
                          customer: { name: 'Aditi Rao', phone: '+919820011223', email: 'aditi@example.com' },
                          tour_title: '#DurgasOf Mumbai: Navratri Special Walk',
                          departure_date: '2026-10-10',
                          start_time: '08:00 AM',
                          category: 'STANDARD_WALK',
                          group_size: 2,
                          total_amount_inr: 1798,
                          payment_status: 'PAID',
                          payment_gateway: 'RAZORPAY_UPI',
                        };
                      } else if (simPreset === 'PRIVATE_URGENT') {
                        payload = {
                          order_source: 'KHAKITOURS_WEB',
                          customer: { name: 'Vikram Shroff', phone: '+919819977881', email: 'vikram.shroff@tatasons.com' },
                          tour_title: 'Vintage Open Jeep #UrbanSafari',
                          departure_date: '2026-10-09',
                          start_time: '08:30 AM',
                          category: 'PRIVATE_GROUP',
                          group_size: 4,
                          total_amount_inr: 14500,
                          payment_status: 'PAYMENT_PENDING',
                          jeep_required: true,
                          special_requests: 'Require Ramesh Gurav and vintage jeep for overseas guests',
                        };
                      } else {
                        payload = {
                          order_source: 'KHAKITOURS_WEB',
                          customer: { name: 'Karan Mehra', phone: '+919820088712', company: 'Godrej Properties Limited' },
                          tour_title: 'Bespoke Architectural Offsite',
                          departure_date: '2026-10-18',
                          start_time: '04:00 PM',
                          category: 'CORPORATE_B2B',
                          group_size: 15,
                          total_amount_inr: 18750,
                          payment_status: 'PAYMENT_PENDING',
                          special_requests: 'Private architectural walk for 15 executives with senior historian',
                        };
                      }

                      const res = await fetch('/api/orders/web-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                      });
                      const json = await res.json();
                      setWebhookResult(json);
                      await loadBookings();
                    } catch (e: any) {
                      setWebhookResult({ error: e.message });
                    } finally {
                      setIsFiringWebhook(false);
                    }
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>⚡</span>
                  {isFiringWebhook ? 'Processing Inbound Webhook...' : 'Fire Test Order to /api/orders/web-checkout'}
                </button>

                {/* Execution Result Card */}
                {webhookResult && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                        <span>✓</span> Webhook Executed Successfully
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {webhookResult.operating_path}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <div>&bull; <strong>Booking Ref:</strong> <span className="font-mono text-white">{webhookResult.booking?.booking_reference}</span></div>
                      <div>&bull; <strong>Status:</strong> <span className="text-amber-400 font-semibold">{webhookResult.booking?.status}</span></div>
                      <div>&bull; <strong>Rationale:</strong> {webhookResult.rationale}</div>
                      {webhookResult.dispatches_created > 0 && (
                        <div className="text-blue-300 font-semibold">
                          &bull; Spawned {webhookResult.dispatches_created} dispatch ticket(s) on the Dispatch Board!
                        </div>
                      )}
                      <div>&bull; <strong>WhatsApp Dispatched:</strong> {webhookResult.whatsapp_notified ? 'Yes (Notice / Pass Sent)' : 'No'}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DEVELOPER DOCS & SNIPPETS */}
            {webhookTab === 'DOCS' && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-400">
                  When you build <strong>khakitours.com</strong>, your web checkout form or payment gateway (Razorpay) simply sends an HTTP POST request to this webhook endpoint:
                </p>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-400">
                  POST https://your-khaki-os-domain.com/api/orders/web-checkout
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-300 text-xs">Sample cURL Command:</div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-300 overflow-x-auto custom-scrollbar font-mono">
{`curl -X POST https://your-khaki-os-domain.com/api/orders/web-checkout \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_source": "KHAKITOURS_WEB",
    "customer": {
      "name": "Aditi Rao",
      "phone": "+919820011223",
      "email": "aditi.rao@example.com"
    },
    "tour_title": "#DurgasOf Mumbai: Navratri Special Walk",
    "departure_date": "2026-10-10",
    "start_time": "08:00 AM",
    "category": "STANDARD_WALK",
    "group_size": 2,
    "total_amount_inr": 1798,
    "payment_status": "PAID",
    "payment_gateway": "RAZORPAY"
  }'`}
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-300 text-xs">JavaScript / Next.js Checkout Form Integration:</div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-300 overflow-x-auto custom-scrollbar font-mono">
{`// Called when the user clicks 'Pay & Book' on khakitours.com
const response = await fetch('/api/orders/web-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    order_source: 'WEBSITE_CHECKOUT',
    customer: { name, phone, email },
    tour_title: selectedTour.title,
    departure_date: selectedDate,
    category: isPrivate ? 'PRIVATE_GROUP' : 'STANDARD_WALK',
    group_size: paxCount,
    total_amount_inr: totalPrice,
    payment_status: 'PAID',
    payment_gateway: 'RAZORPAY',
    payment_reference: razorpayPaymentId,
  }),
});
const data = await response.json();
console.log('Confirmed Booking Reference:', data.booking.booking_reference);`}
                  </pre>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowWebhookModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
