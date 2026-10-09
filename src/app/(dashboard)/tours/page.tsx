'use client';

import { useState, useEffect } from 'react';
import { Tour, TourType } from '@/types/database';
import { Pencil, Trash2, Search, ArrowRight } from 'lucide-react';

export default function ToursManagerPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newHashtag, setNewHashtag] = useState('');
  const [newCategory, setNewCategory] = useState<TourType>('STANDARD_WALK');
  const [newPrice, setNewPrice] = useState(899);
  const [newDuration, setNewDuration] = useState('2.5 Hours');
  const [newMeetingPoint, setNewMeetingPoint] = useState('Horniman Circle, Fort');
  const [newCapacity, setNewCapacity] = useState(25);
  const [newHighlights, setNewHighlights] = useState('Historic Architecture, City Lore');
  const [newDescription, setNewDescription] = useState('');

  // Edit Form State
  const [editId, setEditId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editHashtag, setEditHashtag] = useState('');
  const [editCategory, setEditCategory] = useState<TourType>('STANDARD_WALK');
  const [editPrice, setEditPrice] = useState(899);
  const [editDuration, setEditDuration] = useState('2.5 Hours');
  const [editMeetingPoint, setEditMeetingPoint] = useState('');
  const [editCapacity, setEditCapacity] = useState(25);
  const [editHighlights, setEditHighlights] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tours');
      if (res.ok) {
        const data = await res.json();
        setTours(data.tours || []);
      }
    } catch (err) {
      console.error('Failed to load tours', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  const filteredTours = tours.filter((t) => {
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.hashtag || '').toLowerCase().includes(q) ||
      (t.meeting_landmark || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newTitle,
        hashtag: newHashtag.startsWith('#') ? newHashtag : `#${newHashtag}`,
        category: newCategory,
        base_price_inr: Number(newPrice),
        duration: newDuration,
        meeting_landmark: newMeetingPoint,
        max_capacity: Number(newCapacity),
        route_highlights: newHighlights.split(',').map((h) => h.trim()),
        description: newDescription,
      };

      const res = await fetch('/api/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle('');
        setNewHashtag('');
        setNewDescription('');
        await loadTours();
      }
    } catch (err) {
      console.error('Error creating tour:', err);
    }
  };

  const openEditModal = (tour: Tour) => {
    setEditingTour(tour);
    setEditId(tour.id);
    setEditTitle(tour.title);
    setEditHashtag(tour.hashtag || '');
    setEditCategory(tour.category);
    setEditPrice(tour.base_price_inr);
    setEditDuration(tour.duration || '2.5 Hours');
    setEditMeetingPoint(tour.meeting_landmark || '');
    setEditCapacity(tour.max_capacity || 25);
    setEditHighlights((tour.route_highlights || []).join(', '));
    setEditDescription(tour.description || '');
    setShowEditModal(true);
  };

  const handleUpdateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: editTitle,
        hashtag: editHashtag.startsWith('#') ? editHashtag : `#${editHashtag}`,
        category: editCategory,
        base_price_inr: Number(editPrice),
        duration: editDuration,
        meeting_landmark: editMeetingPoint,
        max_capacity: Number(editCapacity),
        route_highlights: editHighlights.split(',').map((h) => h.trim()),
        description: editDescription,
      };

      const res = await fetch(`/api/tours/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingTour(null);
        await loadTours();
      }
    } catch (err) {
      console.error('Error updating tour:', err);
    }
  };

  const handleDeleteTour = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tours/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadTours();
      }
    } catch (err) {
      console.error('Error deleting tour:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Experiences & Tour Inventory
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Master database of all 81 Mumbai experiences across scheduled heritage walks, #UrbanSafari open jeeps, 
            food walks, and boat cruises. Add new seasonal itineraries, update pricing, or edit highlights.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center gap-1.5 self-start"
        >
          <span>+</span> Create New Experience
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Experiences</div>
          <div className="text-2xl font-bold text-white mt-1">{tours.length} Tours</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">Scraped & live in database</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Standard Scheduled Walks</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {tours.filter((t) => t.category === 'STANDARD_WALK').length} Walks
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tier 1: ₹699 - ₹1,199 / pax</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Private & Jeep Safaris</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {tours.filter((t) => t.category === 'PRIVATE_GROUP').length} Safaris
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tier 2: Up to ₹14,500 / group</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-semibold">Average Ticket Price</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ₹
            {tours.length > 0
              ? Math.round(tours.reduce((sum, t) => sum + t.base_price_inr, 0) / tours.length).toLocaleString('en-IN')
              : '899'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across catalog</div>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search 81 experiences by title, hashtag (#FortWalk), or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap gap-1 text-xs">
          {['ALL', 'STANDARD_WALK', 'PRIVATE_GROUP', 'INTERNATIONAL_EXPEDITION', 'CORPORATE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL'
                ? 'All Tours'
                : cat === 'STANDARD_WALK'
                ? 'Scheduled Walks'
                : cat === 'PRIVATE_GROUP'
                ? 'Private & Jeeps'
                : cat === 'INTERNATIONAL_EXPEDITION'
                ? 'International'
                : 'Corporate'}
            </button>
          ))}
        </div>
      </div>

      {/* Tours Table with Smooth Horizontal Scrolling */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading master tours catalog...</div>
        ) : (
          <div>
            <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Experiences Directory ({filteredTours.length})</span>
              <span className="text-[11px] text-slate-500 font-mono">Live catalog database</span>
            </div>

            <div className="visible-table-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 min-w-[200px] max-w-[280px]">Experience & Code</th>
                    <th className="p-3.5 w-[115px]">Category</th>
                    <th className="p-3.5 w-[90px]">Base Price</th>
                    <th className="p-3.5 w-[85px]">Duration</th>
                    <th className="p-3.5 w-[80px]">Max Pax</th>
                    <th className="p-3.5 min-w-[140px] max-w-[180px]">Starting Landmark</th>
                    <th className="p-3.5 w-[75px] text-right sticky right-0 bg-slate-950/95 sm:bg-transparent shadow-[-4px_0_8px_rgba(0,0,0,0.4)] sm:shadow-none z-10">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredTours.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 max-w-[280px]">
                        <div className="font-bold text-white text-xs truncate" title={t.title}>{t.title}</div>
                        <div className="text-[11px] text-amber-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{t.hashtag}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500">{t.tour_code}</span>
                        </div>
                      </td>
                      <td className="p-3.5 w-[115px]">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.category === 'STANDARD_WALK'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : t.category === 'PRIVATE_GROUP'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}
                        >
                          {t.category === 'STANDARD_WALK'
                            ? 'Scheduled'
                            : t.category === 'PRIVATE_GROUP'
                            ? 'Private'
                            : 'International'}
                        </span>
                      </td>
                      <td className="p-3.5 w-[90px] font-bold text-emerald-400 text-xs">
                        ₹{t.base_price_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 w-[85px] text-slate-300">{t.duration || '2.5 Hours'}</td>
                      <td className="p-3.5 w-[80px] font-semibold text-slate-300">{t.max_capacity} Seats</td>
                      <td className="p-3.5 max-w-[180px] truncate text-slate-400" title={t.meeting_landmark || 'South Mumbai'}>
                        {t.meeting_landmark || 'South Mumbai'}
                      </td>
                      <td className="p-3.5 w-[75px] text-right sticky right-0 bg-slate-950/95 sm:bg-transparent shadow-[-4px_0_8px_rgba(0,0,0,0.4)] sm:shadow-none z-10">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
                            title="Edit Tour Experience"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTour(t.id, t.title)}
                            className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/40 rounded-lg transition"
                            title="Delete Experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && filteredTours.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-500">
            No tours found matching your search. Click &quot;+ Create New Experience&quot; to add one.
          </div>
        )}
      </div>

      {/* MODAL: Create New Tour */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create New Heritage Experience</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTour} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tour Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. #ColabaSecrets: Maritime & Opium History"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Hashtag *</label>
                  <input
                    type="text"
                    required
                    placeholder="#ColabaSecrets"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TourType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="STANDARD_WALK">Standard Walk (Tier 1)</option>
                    <option value="PRIVATE_GROUP">Private / Jeep Safari (Tier 2)</option>
                    <option value="INTERNATIONAL_EXPEDITION">International (Tier 3)</option>
                    <option value="CORPORATE">Corporate Retreat (Tier 4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Base Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Max Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Starting Landmark / Meeting Point</label>
                  <input
                    type="text"
                    placeholder="e.g. Gateway of India, Jetty #4"
                    value={newMeetingPoint}
                    onChange={(e) => setNewMeetingPoint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Route Highlights (comma separated)</label>
                <input
                  type="text"
                  placeholder="Afghan Church, Sassoon Docks, Gateway View, Old Cotton Green"
                  value={newHighlights}
                  onChange={(e) => setNewHighlights(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description & Itinerary Lore</label>
                <textarea
                  rows={3}
                  placeholder="Historical context, curator notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
                  Save to Master Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Existing Tour */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Edit Tour Experience</h2>
                <div className="text-[11px] text-slate-400 font-mono">{editId}</div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateTour} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tour Title *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Hashtag *</label>
                  <input
                    type="text"
                    required
                    value={editHashtag}
                    onChange={(e) => setEditHashtag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as TourType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="STANDARD_WALK">Standard Walk (Tier 1)</option>
                    <option value="PRIVATE_GROUP">Private / Jeep Safari (Tier 2)</option>
                    <option value="INTERNATIONAL_EXPEDITION">International (Tier 3)</option>
                    <option value="CORPORATE">Corporate Retreat (Tier 4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Base Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Max Capacity</label>
                  <input
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Duration</label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Starting Landmark / Meeting Point</label>
                  <input
                    type="text"
                    value={editMeetingPoint}
                    onChange={(e) => setEditMeetingPoint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Route Highlights</label>
                <input
                  type="text"
                  value={editHighlights}
                  onChange={(e) => setEditHighlights(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
