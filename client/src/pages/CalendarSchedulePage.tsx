import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Booking, Facility } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  X,
} from 'lucide-react';

export const CalendarSchedulePage: React.FC = () => {
  const { openFacilityDetails, refreshTrigger } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [activeBookingModal, setActiveBookingModal] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bkRes, facRes] = await Promise.all([
          api.getBookings({
            facility_id: selectedFacility !== 'All' ? selectedFacility : undefined,
            department: selectedDept !== 'All' ? selectedDept : undefined,
          }),
          api.getFacilities(),
        ]);
        setBookings(bkRes.bookings);
        setFacilities(facRes.facilities);
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      }
    };

    fetchData();
  }, [selectedFacility, selectedDept, refreshTrigger]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dayBookings = bookings.filter((b) => b.date === selectedDate && b.status !== 'CANCELLED');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Master Campus Schedule
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Schedule & Time Slots
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
            Interactive timeline of confirmed reservations, availability windows, and session allocations.
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-[#D7D7D5] rounded-[10px] p-1 shadow-sm">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-[6px] text-[#73777A] hover:text-[#30383D] hover:bg-[#F7F7F5] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold text-xs text-[#30383D]">
              {selectedDate}
            </span>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-[6px] text-[#73777A] hover:text-[#30383D] hover:bg-[#F7F7F5] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3.5 py-2 rounded-[10px] bg-white hover:bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] text-xs font-semibold shadow-sm transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="p-5 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-[#30383D] shrink-0" />

        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-1.5 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
        >
          <option value="All">All Facilities</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-1.5 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
        >
          <option value="All">All Departments</option>
          {['CSE', 'ECE', 'AI & DS', 'MECH', 'EEE', 'CIVIL', 'MBA', 'SCIENCE'].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Day Schedule Grid */}
      <div className="p-8 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#D7D7D5] mb-5">
          <h2 className="font-serif text-lg font-bold text-[#30383D]">
            Sessions for {new Date(selectedDate).toDateString()} ({dayBookings.length} sessions)
          </h2>
          <div className="flex items-center gap-3 text-[11px] font-semibold font-sans">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Confirmed
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Pending
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Conflict
            </span>
          </div>
        </div>

        {dayBookings.length > 0 ? (
          <div className="space-y-3">
            {dayBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => setActiveBookingModal(b)}
                className={`p-4 rounded-[12px] border cursor-pointer transition hover:-translate-y-0.5 shadow-sm ${
                  b.status === 'CONFIRMED'
                    ? 'bg-white border-[#D7D7D5] hover:border-[#9CA3AF]'
                    : b.status === 'CONFLICT'
                    ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                    : 'bg-amber-50/50 border-amber-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="px-3.5 py-2 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] text-center font-mono shrink-0">
                      <span className="block text-xs font-bold text-[#30383D]">{b.start_time}</span>
                      <span className="text-[10px] text-[#73777A]">{b.end_time}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-[#30383D]">{b.facility_name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F7F7F5] text-[#73777A] font-semibold border border-[#D7D7D5]">
                          {b.department}
                        </span>
                      </div>
                      <p className="text-xs text-[#30383D] font-sans font-medium mt-1">{b.purpose}</p>
                      <p className="text-[11px] text-[#73777A] mt-0.5 font-sans">
                        Requester: <strong className="text-[#30383D]">{b.user_name}</strong> •{' '}
                        {b.students_count ? `${b.students_count} attendees` : 'Open enrollment'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.status === 'CONFLICT'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-[#73777A]">
            <Clock className="w-8 h-8 mx-auto mb-2 text-[#9CA3AF]" />
            <p className="text-xs font-sans">No facility reservations scheduled for this day.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {activeBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-[#D7D7D5] rounded-[16px] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D7D7D5]">
              <h3 className="font-serif text-lg font-bold text-[#30383D]">Booking Manifest</h3>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="text-[#73777A] hover:text-[#30383D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#30383D] font-sans">
              <div>
                <span className="text-[#73777A] block">Facility:</span>
                <strong className="font-serif text-base text-[#30383D]">{activeBookingModal.facility_name}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#73777A] block">Date & Time:</span>
                  <span className="font-mono text-[#30383D] font-bold">
                    {activeBookingModal.date} ({activeBookingModal.start_time} - {activeBookingModal.end_time})
                  </span>
                </div>
                <div>
                  <span className="text-[#73777A] block">Department:</span>
                  <strong className="text-[#30383D]">{activeBookingModal.department}</strong>
                </div>
              </div>
              <div>
                <span className="text-[#73777A] block">Purpose:</span>
                <p className="text-[#30383D] font-medium mt-0.5">{activeBookingModal.purpose}</p>
              </div>
              <div>
                <span className="text-[#73777A] block">Requester:</span>
                <p className="text-[#30383D]">
                  {activeBookingModal.user_name} ({activeBookingModal.user_role})
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#D7D7D5] flex justify-between items-center">
              <button
                onClick={() => {
                  const fId = activeBookingModal.facility_id;
                  setActiveBookingModal(null);
                  openFacilityDetails(fId);
                }}
                className="text-xs font-semibold text-[#30383D] hover:underline"
              >
                Inspect Venue Specs →
              </button>
              <button
                onClick={() => setActiveBookingModal(null)}
                className="px-4 py-1.5 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
