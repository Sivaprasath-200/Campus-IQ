import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Conflict, Facility } from '../types';
import {
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export const ConflictCenterPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { addToast, triggerRefresh, refreshTrigger } = useApp();

  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeConflict, setActiveConflict] = useState<Conflict | null>(null);
  const [actionType, setActionType] = useState<'reassign' | 'cancel' | 'reschedule'>('reassign');
  const [selectedTargetBookingId, setSelectedTargetBookingId] = useState<string>('');
  const [newFacilityId, setNewFacilityId] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('16:00');
  const [newEndTime, setNewEndTime] = useState<string>('18:00');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, fRes] = await Promise.all([api.getConflicts(), api.getFacilities()]);
        setConflicts(cRes.conflicts);
        setFacilities(fRes.facilities);
      } catch (err) {
        console.error('Failed to load conflicts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const openResolution = (conflict: Conflict) => {
    setActiveConflict(conflict);
    setSelectedTargetBookingId(conflict.booking_b_id || conflict.booking_a_id);
    setNewFacilityId(facilities[0]?.id || '');
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConflict) return;
    setResolving(true);

    try {
      await api.resolveConflict(activeConflict.id, {
        action: actionType,
        target_booking_id: selectedTargetBookingId,
        new_facility_id: actionType === 'reassign' ? newFacilityId : undefined,
        new_start_time: actionType === 'reschedule' ? newStartTime : undefined,
        new_end_time: actionType === 'reschedule' ? newEndTime : undefined,
      });

      addToast(
        'success',
        'Conflict Resolved',
        `Successfully applied ${actionType} resolution to conflict.`
      );
      setActiveConflict(null);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Resolution Failed', err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Real-Time Integrity & Collision Interception
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Conflict Center
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A] max-w-xl">
            Autonomous multi-room collision interception, severity ranking, and administrative resolution workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-2 rounded-[10px] bg-white border border-[#D7D7D5] text-xs font-mono font-bold text-[#30383D] shadow-sm">
            {conflicts.filter((c) => c.status === 'OPEN').length} Active Conflicts
          </span>
        </div>
      </div>

      {/* Conflict Cards List */}
      <div className="space-y-6">
        {conflicts.map((c) => {
          const isOpen = c.status === 'OPEN';
          const isCritical = c.severity === 'CRITICAL';

          return (
            <div
              key={c.id}
              className={`p-8 rounded-[16px] border transition-all shadow-sm ${
                isOpen
                  ? 'bg-white border-[#D7D7D5]'
                  : 'bg-[#F7F7F5] border-[#D7D7D5] opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#D7D7D5]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-rose-600">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#30383D]">{c.conflict_type}</h3>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider font-sans ${
                          isCritical
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {c.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-[#73777A] mt-1 font-sans">
                      Target Venue: <strong className="text-[#30383D]">{c.facility_name}</strong> •{' '}
                      Date: <strong className="text-[#30383D]">{c.date}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold font-sans ${
                      isOpen
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {c.status}
                  </span>

                  {isAdmin && isOpen && (
                    <button
                      onClick={() => openResolution(c)}
                      className="px-4 py-2 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs shadow-sm transition"
                    >
                      Resolve Conflict
                    </button>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison of Overlapping Bookings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                {/* Booking A */}
                <div className="p-5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] space-y-1.5 font-sans">
                  <span className="text-[10px] font-semibold text-[#73777A] uppercase tracking-wider block">
                    Conflicting Reservation A:
                  </span>
                  <p className="font-serif text-base font-bold text-[#30383D]">
                    {c.booking_a?.purpose || 'Initial Booking'}
                  </p>
                  <p className="text-xs font-mono font-bold text-[#30383D]">
                    Time: {c.booking_a?.start_time || '13:00'} - {c.booking_a?.end_time || '15:00'}
                  </p>
                  <p className="text-[11px] text-[#73777A]">
                    Requester: {c.booking_a?.user_name || 'Faculty'} ({c.booking_a?.department})
                  </p>
                </div>

                {/* Booking B */}
                <div className="p-5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] space-y-1.5 font-sans">
                  <span className="text-[10px] font-semibold text-[#73777A] uppercase tracking-wider block">
                    Conflicting Reservation B:
                  </span>
                  <p className="font-serif text-base font-bold text-[#30383D]">
                    {c.booking_b?.purpose || 'Colliding Booking Attempt'}
                  </p>
                  <p className="text-xs font-mono font-bold text-[#30383D]">
                    Time: {c.booking_b?.start_time || '14:00'} - {c.booking_b?.end_time || '16:00'}
                  </p>
                  <p className="text-[11px] text-[#73777A]">
                    Requester: {c.booking_b?.user_name || 'Faculty'} ({c.booking_b?.department})
                  </p>
                </div>
              </div>

              {/* Overlap Summary */}
              <div className="p-4 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] text-xs text-[#30383D] flex items-center justify-between font-sans">
                <div>
                  <span className="text-[#73777A]">Overlap Profile:</span>{' '}
                  <strong className="text-[#30383D] font-mono">{c.time_range}</strong>
                </div>
                {c.resolution && (
                  <span className="text-emerald-700 text-xs font-semibold">
                    ✓ Resolution: {c.resolution}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conflict Resolution Modal */}
      {activeConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white border border-[#D7D7D5] rounded-[16px] max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#30383D]">Resolve Scheduling Conflict</h3>
            <p className="text-xs text-[#73777A]">
              Strategy for {activeConflict.facility_name} on {activeConflict.date}.
            </p>

            <form onSubmit={handleResolve} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#73777A] mb-1 font-semibold uppercase tracking-wider text-[10px]">
                  Resolution Action:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'reassign', label: 'Reassign Room' },
                    { id: 'reschedule', label: 'Reschedule Time' },
                    { id: 'cancel', label: 'Cancel Booking' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActionType(act.id as any)}
                      className={`p-3 rounded-[10px] border text-center font-semibold transition ${
                        actionType === act.id
                          ? 'bg-[#30383D] text-white border-[#30383D]'
                          : 'bg-[#F7F7F5] border-[#D7D7D5] text-[#73777A] hover:text-[#30383D]'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Booking Selection */}
              <div>
                <label className="block text-[#73777A] mb-1 font-medium">Target Booking to Modify:</label>
                <select
                  value={selectedTargetBookingId}
                  onChange={(e) => setSelectedTargetBookingId(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D]"
                >
                  <option value={activeConflict.booking_a_id}>
                    Booking A: {activeConflict.booking_a?.purpose || 'Booking A'}
                  </option>
                  {activeConflict.booking_b_id && (
                    <option value={activeConflict.booking_b_id}>
                      Booking B: {activeConflict.booking_b?.purpose || 'Booking B'}
                    </option>
                  )}
                </select>
              </div>

              {/* Reassign Facility */}
              {actionType === 'reassign' && (
                <div>
                  <label className="block text-[#73777A] mb-1 font-medium">Target Alternative Facility:</label>
                  <select
                    value={newFacilityId}
                    onChange={(e) => setNewFacilityId(e.target.value)}
                    className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D]"
                  >
                    {facilities
                      .filter((f) => f.id !== activeConflict.facility_id)
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.capacity} seats • {f.building})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Reschedule Time */}
              {actionType === 'reschedule' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#73777A] mb-1 font-medium">New Start Time</label>
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#73777A] mb-1 font-medium">New End Time</label>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D7D7D5]">
                <button
                  type="button"
                  onClick={() => setActiveConflict(null)}
                  className="px-4 py-2 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-5 py-2 rounded-[8px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium flex items-center gap-1.5"
                >
                  {resolving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Apply Resolution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
