'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  X,
  Send,
  Lock,
  FileSpreadsheet,
  Car,
  Zap,
} from 'lucide-react';

interface DepartureSlot {
  id: string;
  departure_id: string;
  tour_id: string;
  tour_title: string;
  departure_date: string;
  start_time: string;
  meeting_point: string;
  max_capacity: number;
  booked_seats: number;
  available_seats: number;
  ticket_price_inr: number;
  assigned_guide_name: string;
  assigned_guide_phone: string;
  status: 'SCHEDULED' | 'OPEN_FOR_BOOKING' | 'FILLING_FAST' | 'SOLD_OUT';
  vehicle?: string;
}

type CalendarViewMode = 'MONTH' | 'WEEK' | 'LIST';

export default function SchedulePage() {
  const [departures, setDepartures] = useState<DepartureSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('MONTH');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 9)); // Oct 09, 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-10');
  const [selectedDeparture, setSelectedDeparture] = useState<DepartureSlot | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'ALL' | 'WALK' | 'JEEP' | 'WORKSHOP'>('ALL');
  const [guideFilter, setGuideFilter] = useState<string>('ALL');

  // Add Departure Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('#FortWalk Colonial Heritage');
  const [newDate, setNewDate] = useState('2026-10-18');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newMeetingPoint, setNewMeetingPoint] = useState('Asiatic Society Steps, Horniman Circle');
  const [newCapacity, setNewCapacity] = useState(25);
  const [newPrice, setNewPrice] = useState(899);
  const [newGuide, setNewGuide] = useState('Aniket (Legal & Maritime Historian)');

  const loadDepartures = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/departures');
      if (res.ok) {
        const data = await res.json();
        setDepartures(data.departures || []);
      }
    } catch (e) {
      console.error('Failed to load departures', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartures();
  }, []);

  // Filtered departures
  const filteredDepartures = useMemo(() => {
    return departures.filter((d) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        d.tour_title.toLowerCase().includes(q) ||
        d.assigned_guide_name.toLowerCase().includes(q) ||
        d.meeting_point.toLowerCase().includes(q) ||
        d.departure_date.includes(q);

      // Format filter
      const isJeep = d.tour_title.toLowerCase().includes('jeep') || d.tour_title.toLowerCase().includes('safari');
      const isWorkshop = d.tour_title.toLowerCase().includes('workshop') || d.tour_title.toLowerCase().includes('lab');
      let matchesFormat = true;
      if (formatFilter === 'JEEP') matchesFormat = isJeep;
      else if (formatFilter === 'WORKSHOP') matchesFormat = isWorkshop;
      else if (formatFilter === 'WALK') matchesFormat = !isJeep && !isWorkshop;

      // Guide filter
      const matchesGuide = guideFilter === 'ALL' || d.assigned_guide_name.includes(guideFilter);

      return matchesSearch && matchesFormat && matchesGuide;
    });
  }, [departures, searchQuery, formatFilter, guideFilter]);

  // Group departures by date
  const departuresByDate = useMemo(() => {
    const map: Record<string, DepartureSlot[]> = {};
    for (const d of filteredDepartures) {
      if (!map[d.departure_date]) map[d.departure_date] = [];
      map[d.departure_date].push(d);
    }
    return map;
  }, [filteredDepartures]);

  // Month Calendar Grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const str = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dateStr: str, dayNumber: dayNum, isCurrentMonth: false, isToday: str === '2026-10-09' });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr: str, dayNumber: i, isCurrentMonth: true, isToday: str === '2026-10-09' });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const str = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr: str, dayNumber: i, isCurrentMonth: false, isToday: str === '2026-10-09' });
    }

    return days;
  }, [year, month]);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const jumpToToday = () => {
    setCurrentDate(new Date(2026, 9, 9));
    setSelectedDateStr('2026-10-10');
  };

  const openDateDrawer = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const dayDeps = departuresByDate[dateStr] || [];
    if (dayDeps.length > 0) {
      setSelectedDeparture(dayDeps[0]);
    } else {
      setSelectedDeparture(null);
    }
    setDrawerOpen(true);
  };

  const handleHoldSeats = async (depId: string, seats: number = 2) => {
    try {
      const res = await fetch('/api/departures/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departureId: depId, seats }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(`Held ${seats} seats on departure. Available seats updated.`);
        setTimeout(() => setActionNotice(null), 4000);
        await loadDepartures();
        if (selectedDeparture && (selectedDeparture.id === depId || selectedDeparture.departure_id === depId)) {
          setSelectedDeparture(data.departure);
        }
      } else {
        alert(data.error || 'Failed to hold seats');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/departures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour_title: newTitle,
          departure_date: newDate,
          start_time: newTime,
          meeting_point: newMeetingPoint,
          max_capacity: newCapacity,
          ticket_price_inr: newPrice,
          assigned_guide_name: newGuide,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setActionNotice(`Added departure slot for ${newTitle} on ${newDate}.`);
        setTimeout(() => setActionNotice(null), 4000);
        await loadDepartures();
      }
    } catch (err) {
      console.error('Failed to create departure', err);
    }
  };

  // Stats calculation
  const totalSeats = departures.reduce((sum, d) => sum + d.max_capacity, 0);
  const totalBooked = departures.reduce((sum, d) => sum + d.booked_seats, 0);
  const avgOccupancy = totalSeats > 0 ? Math.round((totalBooked / totalSeats) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-400" />
            Departures & Schedule Calendar
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Master interactive schedule for Mumbai precincts. Monitor live occupancy rates, dispatch historians, and lock inventory in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Departure Slot
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 p-3 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Departures</div>
          <div className="text-2xl font-bold text-white mt-0.5">{departures.length} Slots</div>
          <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Scheduled across Mumbai
          </div>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Seat Inventory</div>
          <div className="text-2xl font-bold text-amber-400 mt-0.5">{totalSeats} Seats</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Total capacity deployed</div>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Confirmed Pax</div>
          <div className="text-2xl font-bold text-emerald-400 mt-0.5">{totalBooked} Guests</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Tickets booked & locked</div>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Fleet Load Factor</div>
          <div className="text-2xl font-bold text-purple-400 mt-0.5">{avgOccupancy}%</div>
          <div className="text-[10px] text-purple-300 mt-0.5">Average tour occupancy</div>
        </div>
      </div>

      {/* Calendar Controls & Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Month Navigation & Today Jump */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-white min-w-[130px] text-center tracking-wide">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Today</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs self-start md:self-auto">
          <button
            onClick={() => setViewMode('MONTH')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              viewMode === 'MONTH' ? 'bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Month Grid</span>
          </button>
          <button
            onClick={() => setViewMode('WEEK')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              viewMode === 'WEEK' ? 'bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Week Timetable</span>
          </button>
          <button
            onClick={() => setViewMode('LIST')}
            className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 ${
              viewMode === 'LIST' ? 'bg-slate-800 text-amber-300 border border-slate-700/80 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Cards List ({filteredDepartures.length})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Format filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Formats</option>
            <option value="WALK">🚶 Heritage Walks</option>
            <option value="JEEP">🚙 Vintage Open Jeep</option>
            <option value="WORKSHOP">🏛️ Workshops & Lab</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search tours or guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: MASTER MONTH CALENDAR MATRIX                      */}
      {/* ========================================================= */}
      {viewMode === 'MONTH' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/80 text-center text-xs font-bold text-slate-400 py-2.5 uppercase tracking-wider">
            <div className="text-amber-400">Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-amber-400">Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/60 bg-slate-950/30">
            {calendarDays.map((day, idx) => {
              const dayDepartures = departuresByDate[day.dateStr] || [];
              const hasDepartures = dayDepartures.length > 0;
              const isSelected = selectedDateStr === day.dateStr && drawerOpen;

              return (
                <div
                  key={idx}
                  onClick={() => openDateDrawer(day.dateStr)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-all ${
                    day.isCurrentMonth ? 'bg-slate-900/30 hover:bg-slate-800/50' : 'bg-slate-950/60 opacity-40 hover:opacity-70'
                  } ${day.isToday ? 'ring-1 ring-amber-500/70 bg-amber-500/5' : ''} ${
                    isSelected ? 'ring-2 ring-amber-400 bg-slate-800/80' : ''
                  }`}
                >
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        day.isToday
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow'
                          : day.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {hasDepartures && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-800 border border-slate-700 text-amber-300">
                        {dayDepartures.length} {dayDepartures.length === 1 ? 'Tour' : 'Tours'}
                      </span>
                    )}
                  </div>

                  {/* Departure Chips inside Calendar Cell */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayDepartures.slice(0, 2).map((dep) => {
                      const isSoldOut = dep.available_seats === 0;
                      const isFastFilling = dep.available_seats > 0 && dep.available_seats <= 4;

                      return (
                        <div
                          key={dep.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateStr(day.dateStr);
                            setSelectedDeparture(dep);
                            setDrawerOpen(true);
                          }}
                          className={`px-1.5 py-1 rounded text-[10px] border-l-2 transition truncate flex items-center justify-between gap-1 shadow-sm ${
                            isSoldOut
                              ? 'border-l-rose-500 bg-rose-950/40 text-rose-300'
                              : isFastFilling
                              ? 'border-l-amber-500 bg-amber-950/40 text-amber-300'
                              : 'border-l-emerald-500 bg-slate-900/90 text-slate-200 hover:bg-slate-850'
                          }`}
                          title={`${dep.start_time} - ${dep.tour_title} (${dep.available_seats} seats remaining)`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-mono text-[9px] text-slate-400 shrink-0">{dep.start_time.split(' ')[0]}</span>
                            <span className="truncate font-medium">{dep.tour_title.replace(/^#[A-Za-z0-9]+\s*[:–-]?\s*/, '')}</span>
                          </div>

                          <span className={`shrink-0 text-[9px] font-semibold px-1 rounded ${
                            isSoldOut ? 'bg-rose-900/60 text-rose-300' : isFastFilling ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {isSoldOut ? 'Full' : `${dep.available_seats} left`}
                          </span>
                        </div>
                      );
                    })}

                    {dayDepartures.length > 2 && (
                      <div className="text-[10px] text-amber-400/90 font-medium px-1 pt-0.5 hover:underline flex items-center gap-1">
                        +{dayDepartures.length - 2} more tours &rarr;
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: WEEK TIMETABLE                                    */}
      {/* ========================================================= */}
      {viewMode === 'WEEK' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Weekly Slot Schedule: 10 Oct to 16 Oct 2026
            </span>
            <span className="text-xs text-slate-400">Click any slot to manage dispatch & bookings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'].map((dateStr) => {
              const dObj = new Date(dateStr);
              const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayDeps = departuresByDate[dateStr] || [];

              return (
                <div key={dateStr} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col space-y-2">
                  <div className="border-b border-slate-800/80 pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-white block">{dayName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{dateStr.slice(5)}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                      {dayDeps.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayDeps.length === 0 ? (
                      <div className="text-[11px] text-slate-600 italic py-4 text-center">No departures</div>
                    ) : (
                      dayDeps.map((dep) => (
                        <div
                          key={dep.id}
                          onClick={() => {
                            setSelectedDateStr(dateStr);
                            setSelectedDeparture(dep);
                            setDrawerOpen(true);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-lg p-2 cursor-pointer transition text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
                            <span>{dep.start_time}</span>
                            <span className="text-emerald-400 font-bold">₹{dep.ticket_price_inr}</span>
                          </div>
                          <div className="font-bold text-white text-[11px] line-clamp-1">{dep.tour_title}</div>
                          <div className="text-[10px] text-slate-400 truncate">🧭 {dep.assigned_guide_name.split(' ')[0]}</div>
                          <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-800/80">
                            <span className="text-slate-400">Capacity:</span>
                            <span className="font-bold text-slate-200">{dep.booked_seats}/{dep.max_capacity}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: CARDS LIST VIEW                                   */}
      {/* ========================================================= */}
      {viewMode === 'LIST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDepartures.map((d) => {
            const occupancyPct = Math.round((d.booked_seats / d.max_capacity) * 100);
            return (
              <div
                key={d.id}
                onClick={() => {
                  setSelectedDateStr(d.departure_date);
                  setSelectedDeparture(d);
                  setDrawerOpen(true);
                }}
                className="bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 cursor-pointer transition shadow flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{d.tour_title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono shrink-0">
                      ₹{d.ticket_price_inr}
                    </span>
                  </div>

                  <div className="text-xs text-amber-400 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{d.departure_date} at {d.start_time}</span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{d.meeting_point}</span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Guide: <strong className="text-amber-300">{d.assigned_guide_name}</strong></span>
                  </div>

                  {d.vehicle && (
                    <div className="text-xs text-blue-300 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{d.vehicle}</span>
                    </div>
                  )}

                  {/* Occupancy bar (Khaki Operator logic: High Occupancy = GREEN, Low Occupancy = RED ALERT) */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="font-bold text-white">
                        {d.booked_seats} / {d.max_capacity} Seats ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 80
                            ? 'bg-emerald-500'
                            : occupancyPct >= 40
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      occupancyPct >= 80
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                        : occupancyPct >= 40
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                    }`}>
                      {occupancyPct >= 80 ? '🟢 Full / High Demand' : occupancyPct >= 40 ? `🟡 ${d.available_seats} Left` : `🔴 Low Load (${d.available_seats} Left)`}
                    </span>

                    {/* Low Occupancy Operator Trigger */}
                    {occupancyPct < 40 && (
                      <Link
                        href={`/marketing?tour=${encodeURIComponent(d.tour_title)}&date=${encodeURIComponent(d.departure_date)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold transition flex items-center gap-1 shrink-0"
                        title="Under-occupied tour: Click to launch a flash WhatsApp broadcast or Instagram ad"
                      >
                        <Zap className="w-3 h-3 text-rose-400" />
                        <span>Boost Seats</span>
                      </Link>
                    )}
                  </div>

                  <span className="text-amber-400 font-semibold hover:underline flex items-center gap-1 text-[11px] shrink-0">
                    Manage Slot &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* SLIDE-OUT RUN SHEET & DEPARTURE INSPECTION DRAWER          */}
      {/* ========================================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar z-10">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Departure Run Sheet & Ops Dispatch
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    {new Date(selectedDateStr).toLocaleDateString('en-US', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h2>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Day departure selector pills if multiple */}
              {(departuresByDate[selectedDateStr] || []).length > 1 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Scheduled Departures on Date:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(departuresByDate[selectedDateStr] || []).map((dep) => (
                      <button
                        key={dep.id}
                        onClick={() => setSelectedDeparture(dep)}
                        className={`px-2.5 py-1 rounded text-xs transition border flex items-center gap-1.5 ${
                          selectedDeparture?.id === dep.id
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{dep.start_time}</span>
                        <span className="truncate max-w-[120px] font-normal">
                          {dep.tour_title.replace(/^#[A-Za-z0-9]+\s*[:–-]?\s*/, '')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Departure Card */}
              {selectedDeparture ? (
                <div className="space-y-4">
                  {/* Tour title & Price */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                          Tour Slot #{selectedDeparture.departure_id.slice(-6)}
                        </span>
                        <h3 className="font-bold text-white text-base mt-1 leading-snug">
                          {selectedDeparture.tour_title}
                        </h3>
                      </div>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        ₹{selectedDeparture.ticket_price_inr}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-2 pt-1">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{selectedDeparture.departure_date} &bull; <strong>{selectedDeparture.start_time}</strong> (2.5 Hours Duration)</span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{selectedDeparture.meeting_point}</span>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(selectedDeparture.meeting_point)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-amber-400 hover:underline font-semibold ml-auto"
                      >
                        View Map &rarr;
                      </a>
                    </div>

                    {selectedDeparture.vehicle && (
                      <div className="text-xs text-blue-300 flex items-center gap-2">
                        <Car className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Logistics: <strong>{selectedDeparture.vehicle}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Assigned Guide Dossier */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Ambassador Historian
                    </span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-xs">
                          {selectedDeparture.assigned_guide_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{selectedDeparture.assigned_guide_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{selectedDeparture.assigned_guide_phone}</div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                      <a
                        href={`https://wa.me/${selectedDeparture.assigned_guide_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Namaste ${selectedDeparture.assigned_guide_name}! Operational brief for ${selectedDeparture.tour_title} on ${selectedDeparture.departure_date} at ${selectedDeparture.start_time}: Meeting point is ${selectedDeparture.meeting_point}. Current manifest has ${selectedDeparture.booked_seats} guests.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Guide WhatsApp Dispatch Ping
                      </a>
                    </div>
                  </div>

                  {/* Live Seat Capacity Bar */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Live Inventory Status:</span>
                      <span className="font-bold text-white">
                        {selectedDeparture.booked_seats} Booked &bull; {selectedDeparture.available_seats} Available
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          Math.round((selectedDeparture.booked_seats / selectedDeparture.max_capacity) * 100) >= 80
                            ? 'bg-emerald-500'
                            : Math.round((selectedDeparture.booked_seats / selectedDeparture.max_capacity) * 100) >= 40
                            ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{
                          width: `${Math.round((selectedDeparture.booked_seats / selectedDeparture.max_capacity) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Max Cap: {selectedDeparture.max_capacity} Pax</span>
                      <span className={`font-semibold ${
                        Math.round((selectedDeparture.booked_seats / selectedDeparture.max_capacity) * 100) >= 80
                          ? 'text-emerald-400'
                          : Math.round((selectedDeparture.booked_seats / selectedDeparture.max_capacity) * 100) >= 40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>
                        {Math.round((selectedDeparture.booked_seats / selectedDeparture.max_capacity) * 100)}% Load
                      </span>
                    </div>
                  </div>

                  {/* Direct Actions in Drawer */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Direct Operational Actions
                    </span>

                    {/* Low Occupancy Boost Action */}
                    {Math.round((selectedDeparture.booked_seats / selectedDeparture.max_capacity) * 100) < 40 && (
                      <Link
                        href={`/marketing?tour=${encodeURIComponent(selectedDeparture.tour_title)}&date=${encodeURIComponent(selectedDeparture.departure_date)}`}
                        className="w-full bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 text-rose-200 text-xs font-semibold p-2.5 rounded-lg transition flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-rose-400" />
                          <span>Low Occupancy Alert &bull; Launch Promo Broadcast</span>
                        </span>
                        <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded">Boost</span>
                      </Link>
                    )}

                    <button
                      onClick={() => handleHoldSeats(selectedDeparture.id, 2)}
                      disabled={selectedDeparture.available_seats < 2}
                      className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold p-2.5 rounded-lg transition flex items-center justify-between disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>🔒 Lock & Hold 2 Seats (Decrements Inventory)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">30-Min Hold</span>
                    </button>

                    <Link
                      href={`/manifests`}
                      className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold p-2.5 rounded-lg transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                        <span>📋 View Guest Manifest & Take Attendance</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{selectedDeparture.booked_seats} Pax</span>
                    </Link>

                    <Link
                      href={`/bookings`}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold p-2.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      Create Confirmed Booking for Slot
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs space-y-3">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
                  <div>No departure scheduled on this date.</div>
                  <button
                    onClick={() => {
                      setNewDate(selectedDateStr);
                      setShowAddModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg"
                  >
                    + Schedule Slot on {selectedDateStr}
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Khaki Travel OS &bull; Mumbai</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD DEPARTURE SLOT                                 */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-white text-base">Schedule New Tour Departure Slot</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDeparture} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tour Title / Experience</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 08:00 AM or 04:30 PM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Meeting Point Landmark</label>
                <input
                  type="text"
                  required
                  value={newMeetingPoint}
                  onChange={(e) => setNewMeetingPoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Ticket Price (₹ INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Ambassador Historian</label>
                <select
                  value={newGuide}
                  onChange={(e) => setNewGuide(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="Bharat Gothoskar (Founder & Lead Historian)">Bharat Gothoskar (Founder & Lead Historian)</option>
                  <option value="Aniket (Legal & Maritime Historian)">Aniket (Legal & Maritime Historian)</option>
                  <option value="Anvi (Cultural & Sacred Heritage)">Anvi (Cultural & Sacred Heritage)</option>
                  <option value="Ramesh Gurav (Vintage Jeep Specialist)">Ramesh Gurav (Vintage Jeep Specialist)</option>
                  <option value="Yash Gupte (Artisan Sculptor & Fort Guide)">Yash Gupte (Artisan Sculptor & Fort Guide)</option>
                  <option value="Zoya Merchant (Art Deco & Architecture)">Zoya Merchant (Art Deco & Architecture)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs"
                >
                  Confirm & Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
