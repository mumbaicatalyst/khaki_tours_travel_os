'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Gift, Pencil, Trash2 } from 'lucide-react';

interface Contact {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  company: string;
  segment_tags: string[];
  rfm_score: number;
  lifetime_spend_inr: number;
  total_bookings: number;
  last_booking_date: string | null;
  notes: string;
  created_at: string;
}

interface BookingRecord {
  id: string;
  booking_reference: string;
  tour_title: string;
  departure_date: string;
  group_size: number;
  total_amount_inr: number;
  status: string;
  payment_method: string;
}

export default function CustomersCRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [customerBookings, setCustomerBookings] = useState<BookingRecord[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [promoNotice, setPromoNotice] = useState<string | null>(null);

  // New Contact Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+91 ');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newTags, setNewTags] = useState('REPEAT_WALKER');
  const [newNotes, setNewNotes] = useState('');

  // Edit Contact Form State
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        if (data.contacts?.length > 0 && !selectedContact) {
          loadContactDetails(data.contacts[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load contacts', e);
    }
  };

  const loadContactDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedContact(data.contact);
        setCustomerBookings(data.bookings || []);
      }
    } catch (e) {
      console.error('Failed to load contact details', e);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const matchesTag = selectedTag === 'ALL' || (c.segment_tags || []).includes(selectedTag);
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      c.full_name.toLowerCase().includes(q) ||
      c.phone_number.includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newName,
          phone_number: newPhone,
          email: newEmail,
          company: newCompany,
          segment_tags: newTags.split(',').map((t) => t.trim()),
          notes: newNotes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewCompany('');
        setNewNotes('');
        await loadContacts();
        if (data.contact) {
          loadContactDetails(data.contact.id);
        }
      }
    } catch (err) {
      console.error('Failed to create customer', err);
    }
  };

  const openEditModal = (c: Contact) => {
    setEditId(c.id);
    setEditName(c.full_name);
    setEditPhone(c.phone_number);
    setEditEmail(c.email || '');
    setEditCompany(c.company || '');
    setEditTags((c.segment_tags || []).join(', '));
    setEditNotes(c.notes || '');
    setShowEditModal(true);
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contacts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editName,
          phone_number: editPhone,
          email: editEmail,
          company: editCompany,
          segment_tags: editTags.split(',').map((t) => t.trim()),
          notes: editNotes,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        await loadContacts();
        await loadContactDetails(editId);
      }
    } catch (err) {
      console.error('Failed to update customer', err);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete customer profile for "${name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedContact(null);
        await loadContacts();
      }
    } catch (err) {
      console.error('Failed to delete customer', err);
    }
  };

  const totalSpendAll = contacts.reduce((sum, c) => sum + (c.lifetime_spend_inr || 0), 0);
  const corporateCount = contacts.filter((c) => (c.segment_tags || []).includes('CORPORATE_VIP')).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Customer & Client Accounts Directory
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Track individual guests, high-net-worth safari travelers, and enterprise B2B accounts. 
            View complete booking history, lifetime spend, dietary preferences, and 1-click WhatsApp messaging.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center gap-1.5 self-start"
        >
          <span>+</span> Add New Customer
        </button>
      </div>

      {promoNotice && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 p-3 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg animate-fadeIn">
          <span>{promoNotice}</span>
          <button onClick={() => setPromoNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* CRM Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total CRM Profiles</div>
          <div className="text-2xl font-bold text-white mt-1">{contacts.length} Guests</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Active accounts in system</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Enterprise / VIP Clients</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{corporateCount} Accounts</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Godrej, Mahindra, Consulates</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Tracked Lifetime Value</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ₹{totalSpendAll.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all completed tours</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Repeat Walker Ratio</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {contacts.length > 0 ? Math.round((contacts.filter((c) => c.total_bookings > 1).length / contacts.length) * 100) : 0}%
          </div>
          <div className="text-[11px] text-purple-300/80 mt-0.5">&gt;1 tour attendance</div>
        </div>
      </div>

      {/* Two-Pane CRM Master-Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Customer List & Search */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
            <input
              type="text"
              placeholder="Search by name, phone, company, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {['ALL', 'CORPORATE_VIP', 'REPEAT_WALKER', 'HIGH_NET_WORTH', 'DIPLOMATIC_CONSULATE'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2 py-0.5 rounded transition ${
                    selectedTag === tag
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tag.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Cards List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredContacts.map((c) => (
              <button
                key={c.id}
                onClick={() => loadContactDetails(c.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                  selectedContact?.id === c.id
                    ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white">{c.full_name}</h3>
                    {c.company && (
                      <div className="text-[11px] text-amber-400 font-medium">{c.company}</div>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    ₹{c.lifetime_spend_inr.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{c.phone_number}</span>
                  <span className="text-slate-500">{c.total_bookings} Bookings</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {(c.segment_tags || []).slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {filteredContacts.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No customer profiles match your filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Selected Customer Profile & History */}
        <div className="lg:col-span-7">
          {selectedContact ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedContact.full_name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      RFM Score: {selectedContact.rfm_score}/100
                    </span>
                  </div>
                  {selectedContact.company && (
                    <div className="text-xs text-amber-400 font-medium mt-0.5">
                      🏢 {selectedContact.company}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 font-mono mt-1 space-x-3">
                    <span>📞 {selectedContact.phone_number}</span>
                    {selectedContact.email && <span>✉️ {selectedContact.email}</span>}
                  </div>
                </div>

                {/* Sleek Action Icon Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`https://wa.me/${selectedContact.phone_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition shadow-sm"
                    title="Chat on WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      const code = selectedContact.total_bookings > 1 ? 'REPEAT10' : 'WELCOME05';
                      const pct = selectedContact.total_bookings > 1 ? '10%' : '5%';
                      const text = encodeURIComponent(`Namaste ${selectedContact.full_name}! 🏛️ As a valued Khaki Tours guest, here is your personal ${pct} courtesy promo code for your next heritage walk: ${code}. Redeem at: https://khakitours.com/book`);
                      window.open(`https://wa.me/${selectedContact.phone_number.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
                      setPromoNotice(`🎁 Courtesy ${pct} loyalty invite (${code}) prepared for ${selectedContact.full_name}!`);
                      setTimeout(() => setPromoNotice(null), 5000);
                    }}
                    className="w-9 h-9 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center transition shadow-sm"
                    title="Send Courtesy Loyalty Promo Code"
                  >
                    <Gift className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(selectedContact)}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center transition"
                    title="Edit Customer Profile"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(selectedContact.id, selectedContact.full_name)}
                    className="w-9 h-9 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 flex items-center justify-center transition"
                    title="Delete Customer Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags & Preferences */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Client Tags & Classifications
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedContact.segment_tags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Internal Staff Notes */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Operational Notes & Preferences:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedContact.notes || 'No notes added for this customer yet.'}
                </p>
              </div>

              {/* Booking History Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Tour Booking History ({customerBookings.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Lifetime Spend:{' '}
                    <strong className="text-emerald-400">
                      ₹{selectedContact.lifetime_spend_inr.toLocaleString('en-IN')}
                    </strong>
                  </span>
                </div>

                {customerBookings.length > 0 ? (
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Ref / Tour</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Pax</th>
                          <th className="p-2.5">Amount</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {customerBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/20">
                            <td className="p-2.5">
                              <div className="font-semibold text-white">{b.tour_title}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{b.booking_reference}</div>
                            </td>
                            <td className="p-2.5 text-slate-400">{b.departure_date}</td>
                            <td className="p-2.5 font-bold text-slate-200">{b.group_size}</td>
                            <td className="p-2.5 font-bold text-emerald-400">₹{b.total_amount_inr.toLocaleString('en-IN')}</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800 text-center text-xs text-slate-500">
                    No bookings recorded yet for this customer profile.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500">
              Select a customer from the left column to view full CRM profile, booking ledger, and notes.
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Add New Customer */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create New Customer Profile</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohinton Batliwala"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 00000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Mahindra Group / Independent"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Segment Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="CORPORATE_VIP, REPEAT_WALKER, HIGH_NET_WORTH"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Staff Notes & Preferences</label>
                <textarea
                  rows={3}
                  placeholder="Notes on language preference, dietary needs, family members..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
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
                  Save Customer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Customer */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Edit Customer Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Company</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
