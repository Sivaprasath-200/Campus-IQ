import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Booking } from '../types';
import {
  Search,
  CheckCircle,
  Trash2,
} from 'lucide-react';

export const BookingManagementPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { addToast, triggerRefresh, refreshTrigger } = useApp();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await api.getBookings({
          department: deptFilter !== 'All' ? deptFilter : undefined,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          user_id: !isAdmin ? user?.id : undefined,
        });
        setBookings(res.bookings);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter, deptFilter, isAdmin, user?.id, refreshTrigger]);

  const handleApprove = async (id: string) => {
    try {
      await api.updateBooking(id, { status: 'CONFIRMED' });
      addToast('success', 'Booking Approved', `Booking ${id} marked as CONFIRMED.`);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.cancelBooking(id);
      addToast('info', 'Booking Cancelled', `Booking ${id} has been cancelled.`);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Cancellation Failed', err.message);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (b.facility_name || '').toLowerCase().includes(q) ||
      (b.purpose || '').toLowerCase().includes(q) ||
      (b.user_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Reservations Roster
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Booking Management
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
            {isAdmin
              ? 'Administrative oversight and approval workflow for all university reservations.'
              : 'Track your facility reservation requests and allocated space.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#73777A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue, purpose, requester..."
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] pl-10 pr-3 py-2 text-xs text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending Approval</option>
            <option value="CONFLICT">Conflict</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
          >
            <option value="All">All Departments</option>
            {['CSE', 'ECE', 'AI & DS', 'MECH', 'EEE', 'CIVIL', 'MBA', 'SCIENCE'].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[16px] bg-white border border-[#D7D7D5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#30383D]">
            <thead className="bg-[#F7F7F5] text-[#73777A] font-semibold uppercase tracking-wider text-[11px] border-b border-[#D7D7D5]">
              <tr>
                <th className="p-4">Venue</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Purpose & Attendees</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7D7D5]/60 font-medium font-sans">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="p-4">
                    <span className="font-serif font-bold text-sm text-[#30383D] block">{b.facility_name}</span>
                    <span className="text-[10px] text-[#73777A] font-mono">{b.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-[#30383D] font-mono block font-bold">{b.date}</span>
                    <span className="text-[#73777A] font-mono text-[11px]">
                      {b.start_time} - {b.end_time}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-[#30383D] font-medium truncate max-w-xs">{b.purpose}</p>
                    <span className="text-[10px] text-[#73777A]">
                      Dept: {b.department} •{' '}
                      {b.students_count ? `${b.students_count} students` : 'Standard'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[#30383D] font-bold block">{b.user_name}</span>
                    <span className="text-[10px] text-[#73777A]">{b.user_role}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : b.status === 'CONFLICT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-[#F7F7F5] text-[#73777A] border border-[#D7D7D5]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && b.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(b.id)}
                          title="Approve Booking"
                          className="px-2.5 py-1 rounded-[6px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition"
                        >
                          Approve
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          title="Cancel Booking"
                          className="p-1.5 rounded-[6px] text-[#73777A] hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
