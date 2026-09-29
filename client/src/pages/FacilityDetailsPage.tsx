import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Facility, Booking } from '../types';
import {
  ArrowLeft,
  Building2,
  Users,
  Calendar,
  Clock,
  Plus,
  Loader2,
} from 'lucide-react';

export const FacilityDetailsPage: React.FC = () => {
  const { selectedFacilityId, setCurrentPage, addToast, triggerRefresh } = useApp();
  const { user } = useAuth();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookStart, setBookStart] = useState('10:00');
  const [bookEnd, setBookEnd] = useState('12:00');
  const [bookPurpose, setBookPurpose] = useState('');
  const [bookSubmitting, setBookSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedFacilityId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.getFacilityById(selectedFacilityId);
        setFacility(res.facility);
        setTodaySchedule(res.today_schedule);
        setUpcomingBookings(res.upcoming_bookings);
        setMaintenanceHistory(res.maintenance_history);
      } catch (err) {
        console.error('Failed to load facility details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedFacilityId]);

  if (!selectedFacilityId || (!loading && !facility)) {
    return (
      <div className="p-12 text-center text-[#73777A]">
        <p>No facility selected.</p>
        <button
          onClick={() => setCurrentPage('facilities')}
          className="mt-3 px-4 py-2 rounded-[10px] bg-[#30383D] text-white text-xs font-semibold"
        >
          Return to Facility Explorer
        </button>
      </div>
    );
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPurpose) return;
    setBookSubmitting(true);

    try {
      await api.createBooking({
        facility_id: facility!.id,
        date: bookDate,
        start_time: bookStart,
        end_time: bookEnd,
        purpose: bookPurpose,
        students_count: facility!.capacity,
        department: user?.department || 'CSE',
      });

      addToast(
        'success',
        'Facility Booked',
        `Successfully scheduled ${facility!.name} for ${bookDate} (${bookStart}-${bookEnd}).`
      );
      setIsBookingModalOpen(false);
      setBookPurpose('');
      triggerRefresh();

      const res = await api.getFacilityById(facility!.id);
      setTodaySchedule(res.today_schedule);
      setUpcomingBookings(res.upcoming_bookings);
    } catch (err: any) {
      addToast(
        'error',
        'Booking Failed',
        err.message || 'Scheduling conflict or validation error prevented booking.'
      );
    } finally {
      setBookSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Back button & Action Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('facilities')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#73777A] hover:text-[#30383D] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Facility Explorer</span>
        </button>

        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="px-4 py-2 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Book This Facility</span>
        </button>
      </div>

      {facility && (
        <>
          {/* Facility Hero Card */}
          <div className="p-8 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                      facility.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {facility.status}
                  </span>
                  <span className="text-xs text-[#73777A]">{facility.type}</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#30383D]">{facility.name}</h1>
                <p className="text-xs text-[#73777A] mt-1 font-sans">
                  Location: <strong className="text-[#30383D]">{facility.building}</strong> • Floor{' '}
                  {facility.floor} • Room Number: {facility.room_number}
                </p>
              </div>

              <div className="text-right">
                <div className="font-serif text-4xl font-bold text-[#30383D]">
                  {facility.current_utilization || 50}%
                </div>
                <span className="text-[10px] uppercase font-bold text-[#73777A] tracking-wider">
                  Average Load
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#D7D7D5] text-xs">
              <div className="p-3.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5]">
                <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                  Seating Capacity
                </span>
                <strong className="font-serif text-lg text-[#30383D]">{facility.capacity} Seats</strong>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5]">
                <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                  Total Bookings
                </span>
                <strong className="font-serif text-lg text-[#30383D]">
                  {facility.total_bookings_count || 12}
                </strong>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5]">
                <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                  Optimal Threshold
                </span>
                <strong className="font-serif text-lg text-[#30383D]">
                  {facility.utilization_threshold}%
                </strong>
              </div>
              <div className="p-3.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5]">
                <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                  Installed Amenities
                </span>
                <strong className="font-serif text-lg text-[#30383D]">
                  {(facility.equipment || []).length} items
                </strong>
              </div>
            </div>

            {/* Equipment Chips */}
            <div className="mt-5 pt-5 border-t border-[#D7D7D5]">
              <h3 className="text-xs font-bold text-[#30383D] uppercase tracking-wider mb-2.5 font-sans">
                Available Equipment & Hardware:
              </h3>
              <div className="flex flex-wrap gap-2">
                {(facility.equipment || []).map((eq) => (
                  <span
                    key={eq}
                    className="px-3 py-1 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] text-xs font-medium"
                  >
                    ✓ {eq}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Schedule & Upcoming Reservations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Timeline */}
            <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#30383D] mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#30383D]" />
                <span>Today's Time Slots</span>
              </h3>
              {todaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedule.map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-mono font-bold text-[#30383D]">
                          <span>
                            {b.start_time} – {b.end_time}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#73777A] border border-[#D7D7D5]">
                            {b.department}
                          </span>
                        </div>
                        <p className="text-[#30383D] mt-1 font-sans font-medium">{b.purpose}</p>
                        <p className="text-[11px] text-[#73777A]">Reserved by {b.user_name}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#73777A] py-8 text-center font-sans">
                  No sessions scheduled for today. Room is fully free.
                </p>
              )}
            </div>

            {/* Upcoming Reservations */}
            <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#30383D] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#30383D]" />
                <span>Upcoming Bookings</span>
              </h3>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-sans">
                          <span className="font-mono text-[#30383D] font-bold">{b.date}</span>
                          <span className="text-[#73777A]">
                            ({b.start_time} - {b.end_time})
                          </span>
                        </div>
                        <p className="text-[#30383D] text-[11px] font-medium truncate max-w-xs">{b.purpose}</p>
                      </div>
                      <span className="text-[11px] text-[#73777A] font-semibold">{b.department}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#73777A] py-8 text-center font-sans">No upcoming bookings.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Direct Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-[#D7D7D5] rounded-[16px] max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#30383D]">Direct Facility Booking</h3>
            <p className="text-xs text-[#73777A]">Reserve {facility?.name} instantly.</p>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#73777A] mb-1 font-sans">Date</label>
                <input
                  type="date"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  required
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#73777A] mb-1 font-sans">Start Time</label>
                  <input
                    type="time"
                    value={bookStart}
                    onChange={(e) => setBookStart(e.target.value)}
                    required
                    className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#73777A] mb-1 font-sans">End Time</label>
                  <input
                    type="time"
                    value={bookEnd}
                    onChange={(e) => setBookEnd(e.target.value)}
                    required
                    className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#73777A] mb-1 font-sans">Booking Purpose</label>
                <input
                  type="text"
                  value={bookPurpose}
                  onChange={(e) => setBookPurpose(e.target.value)}
                  placeholder="e.g. Department Faculty Meeting"
                  required
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookSubmitting}
                  className="px-5 py-2 rounded-[8px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium flex items-center gap-1.5"
                >
                  {bookSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Reservation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
