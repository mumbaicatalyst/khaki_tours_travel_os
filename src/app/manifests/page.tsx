'use client';

import { useState, useEffect } from 'react';
import { Download, Users, CheckCircle2, ShieldAlert, Calendar, Clock, MapPin, Plus, UserCheck } from 'lucide-react';

interface ManifestGuest {
  id: string;
  booking_id: string;
  booking_ref: string;
  full_name: string;
  phone: string;
  age: number;
  gender: string;
  id_type: 'AADHAAR' | 'PASSPORT' | 'VOTER_ID' | 'DRIVING_LICENSE';
  id_number: string;
  dietary_preference: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  verified: boolean;
  attended: boolean;
}

interface DepartureOption {
  id: string;
  departure_id: string;
  tour_title: string;
  departure_date: string;
  start_time: string;
  meeting_point: string;
  booked_seats: number;
  max_capacity: number;
  assigned_guide_name: string;
}

export default function ManifestsPage() {
  const [departures, setDepartures] = useState<DepartureOption[]>([]);
  const [selectedDepId, setSelectedDepId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guests, setGuests] = useState<ManifestGuest[]>([
    {
      id: 'man-01',
      booking_id: 'bkg_8901',
      booking_ref: 'KT-BKG-8901',
      full_name: 'Karan Mehra',
      phone: '+91 98200 88712',
      age: 42,
      gender: 'Male',
      id_type: 'AADHAAR',
      id_number: '•••• •••• 4912',
      dietary_preference: 'Strict Vegetarian (Jain)',
      emergency_contact_name: 'Pooja Mehra',
      emergency_contact_phone: '+91 98200 11990',
      verified: true,
      attended: true,
    },
    {
      id: 'man-02',
      booking_id: 'bkg_8901',
      booking_ref: 'KT-BKG-8901',
      full_name: 'Sarah Jenkins',
      phone: '+44 7911 123456',
      age: 38,
      gender: 'Female',
      id_type: 'PASSPORT',
      id_number: 'GB9821441',
      dietary_preference: 'Nut Allergy / Gluten Free',
      emergency_contact_name: 'David Jenkins',
      emergency_contact_phone: '+44 7911 654321',
      verified: true,
      attended: false,
    },
    {
      id: 'man-03',
      booking_id: 'bkg_8902',
      booking_ref: 'KT-BKG-8902',
      full_name: 'Pooja Singhania',
      phone: '+91 98199 87654',
      age: 35,
      gender: 'Female',
      id_type: 'AADHAAR',
      id_number: '•••• •••• 8821',
      dietary_preference: 'Regular Vegetarian',
      emergency_contact_name: 'Vikram Singhania',
      emergency_contact_phone: '+91 98199 00112',
      verified: true,
      attended: false,
    },
    {
      id: 'man-04',
      booking_id: 'bkg_8903',
      booking_ref: 'KT-BKG-8903',
      full_name: 'Elena Rostova',
      phone: '+91 98203 99182',
      age: 29,
      gender: 'Female',
      id_type: 'PASSPORT',
      id_number: 'ES8901239',
      dietary_preference: 'No Seafood / Pescatarian',
      emergency_contact_name: 'Consulate Duty Officer',
      emergency_contact_phone: '+91 22 2281 9900',
      verified: true,
      attended: false,
    },
  ]);

  const [newGuest, setNewGuest] = useState({
    full_name: '',
    phone: '',
    age: 30,
    gender: 'Female',
    id_type: 'AADHAAR' as const,
    id_number: '',
    dietary_preference: 'No Restrictions',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    async function loadDepartures() {
      try {
        const res = await fetch('/api/departures');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.departures || []);
          setDepartures(list);
          if (list.length > 0) {
            setSelectedDepId(list[0].id || list[0].departure_id);
          }
        }
      } catch (err) {
        console.error('Error loading departures:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDepartures();
  }, []);

  // Fetch live manifest guests when selected departure changes
  useEffect(() => {
    if (!selectedDepId) return;
    async function loadManifest() {
      try {
        const res = await fetch(`/api/manifests?departure_id=${encodeURIComponent(selectedDepId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.guests) {
            setGuests(data.guests);
          }
        }
      } catch (err) {
        console.error('Error loading manifest for departure:', err);
      }
    }
    loadManifest();
  }, [selectedDepId]);

  const currentDep = departures.find(d => (d.id === selectedDepId || d.departure_id === selectedDepId)) || departures[0] || null;

  const toggleAttended = async (guestId: string) => {
    const current = guests.find(g => g.id === guestId);
    if (!current) return;
    const newAttended = !current.attended;

    // Optimistic UI update
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, attended: newAttended } : g));

    // Persist to server store
    try {
      await fetch('/api/manifests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_id: guestId, attended: newAttended }),
      });
    } catch (err) {
      console.error('Failed to sync attendance:', err);
    }
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.full_name) return;

    const guest: ManifestGuest = {
      id: `man_${Date.now()}`,
      booking_id: 'bkg_manual',
      booking_ref: 'KT-MANUAL',
      full_name: newGuest.full_name,
      phone: newGuest.phone || '+91 98200 00000',
      age: Number(newGuest.age) || 28,
      gender: newGuest.gender,
      id_type: newGuest.id_type,
      id_number: newGuest.id_number || 'VERIFIED_ON_SITE',
      dietary_preference: newGuest.dietary_preference,
      emergency_contact_name: newGuest.emergency_contact_name || 'Family Contact',
      emergency_contact_phone: newGuest.emergency_contact_phone || '+91 98200 00000',
      verified: true,
      attended: false,
    };

    setGuests(prev => [guest, ...prev]);
    setIsAddModalOpen(false);
    setNewGuest({
      full_name: '',
      phone: '',
      age: 30,
      gender: 'Female',
      id_type: 'AADHAAR',
      id_number: '',
      dietary_preference: 'No Restrictions',
      emergency_contact_name: '',
      emergency_contact_phone: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Tour Guest Rosters & On-Site Attendance (Manifests)
          </h1>
          <p className="text-xs text-slate-400">
            The on-the-ground attendee list used by guides & ambassadors on the day of the tour.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            + Add Walk-In Guest
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Print Guide Briefing Sheet
          </button>
        </div>
      </div>

      {/* What Is This Page Explainer Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
            <span>ℹ️</span> What is this page for?
          </div>
          <p className="text-slate-300 leading-relaxed max-w-3xl">
            In tour operations, a <strong>Manifest</strong> is the official passenger roster for a specific scheduled walk. The assigned guide uses this on their phone or on paper at the meeting landmark to <strong>take attendance</strong> as guests arrive, call latecomers, check <strong>dietary requirements</strong> (like Jain food or nut allergies for refreshment stops), and comply with port/police <strong>ID verification</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono">
            Select slot below ↴
          </span>
        </div>
      </div>

      {/* Departure Slot Selector Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4.5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Scheduled Departure Slot
            </label>
            <select
              value={selectedDepId}
              onChange={(e) => setSelectedDepId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {departures.map((d) => (
                <option key={d.id || d.departure_id} value={d.id || d.departure_id}>
                  {d.departure_date} • {d.start_time} — {d.tour_title} ({d.booked_seats}/{d.max_capacity} Seats)
                </option>
              ))}
            </select>
          </div>

          {currentDep && (
            <div className="flex items-center gap-6 bg-slate-950/80 border border-slate-800/80 px-4 py-2.5 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Assigned Ambassador</span>
                <span className="font-bold text-amber-400">{currentDep.assigned_guide_name}</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Meeting Landmark</span>
                <span className="text-slate-200 font-medium truncate max-w-[200px] block">{currentDep.meeting_point}</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Capacity Lock</span>
                <span className="text-emerald-400 font-bold font-mono">{currentDep.booked_seats} of {currentDep.max_capacity} Confirmed</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dietary & Critical Alert Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 text-xs flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-md text-amber-400 font-bold text-base">⚠️</div>
          <div>
            <div className="font-bold text-amber-300">Dietary Restrictions Active</div>
            <div className="text-[11px] text-slate-400">2 guests with Jain/Nut Allergies notified to refreshment partners.</div>
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-3 text-xs flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-md text-emerald-400 font-bold text-base">✓</div>
          <div>
            <div className="font-bold text-emerald-300">100% KYC Verified</div>
            <div className="text-[11px] text-slate-400">All passports and Aadhaar numbers validated prior to assembly.</div>
          </div>
        </div>

        <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-3 text-xs flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-md text-blue-400 font-bold text-base">📍</div>
          <div>
            <div className="font-bold text-blue-300">Live Attendance Tally</div>
            <div className="text-[11px] text-slate-400">
              {guests.filter(g => g.attended).length} checked-in • {guests.filter(g => !g.attended).length} arriving
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Guest Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold">
            <tr>
              <th className="p-3.5">Guest & Contact</th>
              <th className="p-3.5">Booking Ref</th>
              <th className="p-3.5">KYC Document</th>
              <th className="p-3.5">Dietary / Pacing Flag</th>
              <th className="p-3.5">Emergency Contact</th>
              <th className="p-3.5 text-center">Attendance Check-In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {guests.map((g) => (
              <tr key={g.id} className="hover:bg-slate-800/30 transition">
                <td className="p-3.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {g.full_name}
                    {g.attended && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">{g.phone} • {g.age} yrs ({g.gender})</div>
                </td>

                <td className="p-3.5">
                  <span className="font-mono text-amber-400 font-medium">{g.booking_ref}</span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {g.id_type}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{g.id_number}</span>
                  </div>
                </td>

                <td className="p-3.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    g.dietary_preference.includes('Allergy') || g.dietary_preference.includes('Jain')
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'text-slate-400'
                  }`}>
                    {g.dietary_preference}
                  </span>
                </td>

                <td className="p-3.5">
                  <div className="text-slate-200">{g.emergency_contact_name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{g.emergency_contact_phone}</div>
                </td>

                <td className="p-3.5 text-center">
                  <button
                    onClick={() => toggleAttended(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto ${
                      g.attended
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {g.attended ? '✓ Checked In' : 'Mark Present'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Check-In New Guest to Manifest</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newGuest.full_name}
                  onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                  placeholder="e.g. Vikramaditya Shroff"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Phone (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Age & Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newGuest.age}
                      onChange={(e) => setNewGuest({ ...newGuest, age: Number(e.target.value) })}
                      className="w-16 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-center"
                    />
                    <select
                      value={newGuest.gender}
                      onChange={(e) => setNewGuest({ ...newGuest, gender: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">ID Document Type</label>
                  <select
                    value={newGuest.id_type}
                    onChange={(e) => setNewGuest({ ...newGuest, id_type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PASSPORT">Passport (Foreign)</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="VOTER_ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Document Number</label>
                  <input
                    type="text"
                    value={newGuest.id_number}
                    onChange={(e) => setNewGuest({ ...newGuest, id_number: e.target.value })}
                    placeholder="e.g. •••• •••• 9921"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dietary / Pacing Needs</label>
                <input
                  type="text"
                  value={newGuest.dietary_preference}
                  onChange={(e) => setNewGuest({ ...newGuest, dietary_preference: e.target.value })}
                  placeholder="e.g. Jain Vegetarian / Slow walking pace"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={newGuest.emergency_contact_name}
                    onChange={(e) => setNewGuest({ ...newGuest, emergency_contact_name: e.target.value })}
                    placeholder="Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={newGuest.emergency_contact_phone}
                    onChange={(e) => setNewGuest({ ...newGuest, emergency_contact_phone: e.target.value })}
                    placeholder="Phone"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold"
                >
                  Save to Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
