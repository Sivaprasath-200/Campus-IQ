import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FacilityType, DepartmentName, AllocationResult } from '../types';
import {
  BrainCircuit,
  CheckCircle2,
  Sparkles,
  Users,
  Sliders,
  Check,
  Loader2,
} from 'lucide-react';

const FACILITY_TYPES: FacilityType[] = [
  'Computer Lab',
  'Classroom',
  'Electronics Lab',
  'Physics Lab',
  'Chemistry Lab',
  'Seminar Hall',
  'Auditorium',
  'Meeting Room',
  'Project Room',
  'Sports Facility',
  'Conference Room',
  'Other',
];

const DEPARTMENTS: DepartmentName[] = [
  'CSE',
  'ECE',
  'AI & DS',
  'MECH',
  'EEE',
  'CIVIL',
  'MBA',
  'SCIENCE',
];

const AVAILABLE_EQUIPMENT = [
  'Projector',
  'Smart Board',
  'Computers',
  'Internet',
  'Air Conditioning',
  'Audio System',
  'Microphones',
  'Lab Equipment',
  'Power Outlets',
  'Video Conferencing',
  'Whiteboard',
];

export const SmartAllocationPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast, triggerRefresh, openFacilityDetails } = useApp();

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [department, setDepartment] = useState<DepartmentName>(user?.department || 'CSE');
  const [facilityType, setFacilityType] = useState<FacilityType>('Computer Lab');
  const [date, setDate] = useState<string>(getTomorrowStr());
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('16:00');
  const [studentsCount, setStudentsCount] = useState<number>(55);
  const [purpose, setPurpose] = useState<string>('Distributed Systems Practical & AI Hackathon');
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([
    'Computers',
    'Projector',
    'Internet',
  ]);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [preferredFacilityId, setPreferredFacilityId] = useState<string>('');

  const [isAllocating, setIsAllocating] = useState<boolean>(false);
  const [allocationStep, setAllocationStep] = useState<string>('');
  const [result, setResult] = useState<AllocationResult | null>(null);
  const [confirming, setConfirming] = useState<boolean>(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const toggleEquipment = (eq: string) => {
    if (requiredEquipment.includes(eq)) {
      setRequiredEquipment(requiredEquipment.filter((item) => item !== eq));
    } else {
      setRequiredEquipment([...requiredEquipment, eq]);
    }
  };

  const handleRunAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityType || !date || !startTime || !endTime || !studentsCount) {
      addToast('warning', 'Missing Fields', 'Please complete all required fields.');
      return;
    }

    if (startTime >= endTime) {
      addToast('error', 'Invalid Time', 'End time must be after start time.');
      return;
    }

    setIsAllocating(true);
    setResult(null);
    setConfirmedBookingId(null);

    const steps = [
      'Analyzing resource requirements...',
      'Checking facility schedules & time availability...',
      'Applying strict hard constraints (capacity, equipment, status)...',
      'Calculating multi-objective compatibility scores...',
      'Optimizing campus load and utilization balance...',
      'Generating explainable recommendations and alternatives...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setAllocationStep(steps[i]);
      await new Promise((r) => setTimeout(r, 220));
    }

    try {
      const res = await api.getRecommendation({
        facility_type: facilityType,
        capacity_required: Number(studentsCount),
        date,
        start_time: startTime,
        end_time: endTime,
        required_equipment: requiredEquipment,
        preferred_facility_id: preferredFacilityId || undefined,
      });

      setResult(res);
      addToast('success', 'Optimal Allocation Found', `Matched with score ${res.score}%.`);
    } catch (err: any) {
      addToast('error', 'Allocation Error', err.message || 'Failed to compute allocation.');
    } finally {
      setIsAllocating(false);
      setAllocationStep('');
    }
  };

  const handleConfirmBooking = async (facilityId: string) => {
    setConfirming(true);
    try {
      const res = await api.confirmAllocation({
        facility_id: facilityId,
        date,
        start_time: startTime,
        end_time: endTime,
        purpose,
        priority,
        students_count: Number(studentsCount),
        department,
      });

      setConfirmedBookingId(res.booking.id);
      triggerRefresh();
      addToast(
        'success',
        'Booking Confirmed',
        `Successfully reserved ${res.booking.facility_name} for ${date} (${startTime} - ${endTime}).`
      );
    } catch (err: any) {
      addToast('error', 'Confirmation Blocked', err.message || 'Double booking conflict detected.');
    } finally {
      setConfirming(false);
    }
  };

  const loadHackathonPreset = () => {
    setFacilityType('Computer Lab');
    setStudentsCount(55);
    setDate(getTomorrowStr());
    setStartTime('14:00');
    setEndTime('16:00');
    setRequiredEquipment(['Computers', 'Projector', 'Internet']);
    setPurpose('Hackathon Challenge 8-Hour Prototype Evaluation');
    setDepartment('CSE');
    setPreferredFacilityId('');
    addToast('info', 'Preset Loaded', 'Populated Challenge Scenario parameters.');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Deterministic Constraint Engine
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Smart Resource Allocation
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A] max-w-xl">
            Two-stage optimization: Hard constraint filtering eliminates ineligible facilities, followed by weighted soft scoring.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHackathonPreset}
          className="px-4 py-2 rounded-[10px] bg-white hover:bg-[#E5E7EB] border border-[#D7D7D5] text-[#30383D] text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#30383D]" />
          <span>Load Challenge Test Case (55 Students)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CREATE RESOURCE REQUEST FORM */}
        <div className="lg:col-span-5 bg-white border border-[#D7D7D5] rounded-[16px] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#D7D7D5] mb-5">
            <h2 className="font-serif text-lg font-bold text-[#30383D] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#30383D]" />
              <span>Create Resource Request</span>
            </h2>
            <span className="text-[11px] text-[#73777A]">Validated in real-time</span>
          </div>

          <form onSubmit={handleRunAllocation} className="space-y-4">
            {/* Department & Facility Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">
                  Facility Type *
                </label>
                <select
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white font-semibold"
                >
                  {FACILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">
                  Number of Students *
                </label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-[#73777A] absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(Number(e.target.value))}
                    className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] pl-9 pr-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-2.5 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">Start *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-2.5 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">End *</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-2.5 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold text-[#30383D] mb-1 font-sans">
                Booking Purpose *
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Distributed Systems & AI Hackathon Workshop"
                required
                className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white"
              />
            </div>

            {/* Required Equipment */}
            <div>
              <label className="block text-xs font-semibold text-[#30383D] mb-1.5 flex items-center justify-between font-sans">
                <span>Required Amenities</span>
                <span className="text-[11px] text-[#73777A]">
                  {requiredEquipment.length} selected
                </span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-[#F7F7F5] rounded-[10px] border border-[#D7D7D5]">
                {AVAILABLE_EQUIPMENT.map((eq) => {
                  const isChecked = requiredEquipment.includes(eq);
                  return (
                    <label
                      key={eq}
                      className={`flex items-center gap-2 p-1.5 rounded-[8px] text-[11px] cursor-pointer transition ${
                        isChecked
                          ? 'bg-white text-[#30383D] border border-[#D7D7D5] font-semibold'
                          : 'text-[#73777A] hover:text-[#30383D] hover:bg-white/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEquipment(eq)}
                        className="rounded border-[#D7D7D5] text-[#30383D] focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="truncate">{eq}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAllocating}
              className="w-full mt-3 py-3 px-4 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition"
            >
              {isAllocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Optimal Facility...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>FIND BEST FACILITY</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ALLOCATION RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Animated Allocation Pipeline */}
          {isAllocating && (
            <div className="p-10 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-full border-2 border-[#D7D7D5] border-t-[#30383D] animate-spin flex items-center justify-center" />
              <div>
                <h3 className="font-serif text-lg font-bold text-[#30383D]">
                  Constraint Optimization in Progress
                </h3>
                <p className="text-xs text-[#73777A] font-sans mt-1 animate-pulse">
                  {allocationStep || 'Optimizing...'}
                </p>
              </div>
            </div>
          )}

          {/* Result Display */}
          {!isAllocating && result && result.recommendedFacility && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Recommended Facility Card */}
              <div className="p-8 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm relative">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#D7D7D5]">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F7F7F5] text-[#30383D] border border-[#D7D7D5]">
                      Top Recommendation
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#30383D] mt-2">
                      {result.recommendedFacility.name}
                    </h3>
                    <p className="text-xs text-[#73777A] mt-1">
                      Building: <strong className="text-[#30383D]">{result.recommendedFacility.building}</strong> •{' '}
                      Floor {result.recommendedFacility.floor} • Room {result.recommendedFacility.room_number}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-serif text-4xl font-bold text-[#30383D]">
                      {result.score}%
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#73777A]">
                      Compatibility Score
                    </p>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-b border-[#D7D7D5] text-xs">
                  <div className="p-3 rounded-[10px] bg-[#F7F7F5] border border-[#D7D7D5]">
                    <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                      Capacity Fit
                    </span>
                    <strong className="text-[#30383D] font-serif text-base block mt-0.5">
                      {result.recommendedFacility.capacity} Seats
                    </strong>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      +{result.recommendedFacility.capacity - studentsCount} excess seats
                    </span>
                  </div>

                  <div className="p-3 rounded-[10px] bg-[#F7F7F5] border border-[#D7D7D5]">
                    <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                      Facility Type
                    </span>
                    <strong className="text-[#30383D] font-serif text-base block mt-0.5">
                      {result.recommendedFacility.type}
                    </strong>
                    <span className="text-[10px] text-[#73777A] block mt-0.5">Exact Match</span>
                  </div>

                  <div className="p-3 rounded-[10px] bg-[#F7F7F5] border border-[#D7D7D5]">
                    <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                      Current Load
                    </span>
                    <strong className="text-[#30383D] font-serif text-base block mt-0.5">
                      {result.recommendedFacility.current_utilization}%
                    </strong>
                    <span className="text-[10px] text-[#73777A] block mt-0.5">Balanced</span>
                  </div>

                  <div className="p-3 rounded-[10px] bg-[#F7F7F5] border border-[#D7D7D5]">
                    <span className="text-[10px] text-[#73777A] uppercase tracking-wider block font-sans">
                      Availability
                    </span>
                    <strong className="text-emerald-700 font-serif text-base block mt-0.5">100% Free</strong>
                    <span className="text-[10px] text-[#73777A] block mt-0.5">Zero Collisions</span>
                  </div>
                </div>

                {/* Reasons Checklist */}
                <div className="py-5 border-b border-[#D7D7D5]">
                  <h4 className="text-xs font-bold text-[#30383D] uppercase tracking-wider mb-3 font-sans">
                    Selection Rationale:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {result.reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#30383D]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-sans leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown Bar */}
                <div className="pt-4 pb-5">
                  <h4 className="text-[11px] font-bold text-[#73777A] uppercase tracking-wider mb-2 font-sans">
                    Weighted Sub-Scores:
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    {[
                      { label: 'Capacity', val: result.breakdown.capacity },
                      { label: 'Equipment', val: result.breakdown.equipment },
                      { label: 'Availability', val: result.breakdown.availability },
                      { label: 'Utilization', val: result.breakdown.utilization },
                      { label: 'Preference', val: result.breakdown.preference },
                      { label: 'Demand', val: result.breakdown.demand },
                    ].map((b, i) => (
                      <div key={i} className="p-2 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5]">
                        <span className="text-[10px] text-[#73777A] block truncate">{b.label}</span>
                        <span className="font-mono font-bold text-[#30383D] text-xs">{b.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Action */}
                <div className="pt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => openFacilityDetails(result.recommendedFacility!.id)}
                    className="text-xs text-[#30383D] hover:underline font-semibold transition"
                  >
                    View Room Schedule & Specs →
                  </button>

                  <button
                    onClick={() => handleConfirmBooking(result.recommendedFacility!.id)}
                    disabled={confirming || confirmedBookingId !== null}
                    className="px-6 py-2.5 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 transition"
                  >
                    {confirming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : confirmedBookingId ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {confirmedBookingId ? 'Booking Confirmed in DB!' : 'CONFIRM THIS ALLOCATION'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Alternative Facilities */}
              {result.alternatives.length > 0 && (
                <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-base font-bold text-[#30383D]">
                      Alternative Facilities ({result.alternatives.length} Calculated)
                    </h3>
                    <span className="text-[11px] text-[#73777A]">Ranked by suitability</span>
                  </div>

                  <div className="space-y-2.5">
                    {result.alternatives.map((alt) => (
                      <div
                        key={alt.facilityId}
                        className="p-3.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-[8px] bg-white border border-[#D7D7D5] flex items-center justify-center font-mono text-xs font-bold text-[#30383D]">
                            {alt.score}%
                          </div>
                          <div>
                            <h4 className="text-xs font-serif font-bold text-[#30383D]">{alt.name}</h4>
                            <p className="text-[11px] text-[#73777A]">
                              Capacity: {alt.capacity} seats • {alt.building}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleConfirmBooking(alt.facilityId)}
                          disabled={confirming}
                          className="px-3.5 py-1.5 rounded-[8px] bg-white hover:bg-[#E5E7EB] border border-[#D7D7D5] text-xs font-medium text-[#30383D] transition shadow-sm"
                        >
                          Select Alternative
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isAllocating && !result && (
            <div className="p-12 rounded-[16px] bg-white border border-[#D7D7D5] text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-[14px] bg-[#F7F7F5] border border-[#D7D7D5] text-[#30383D] flex items-center justify-center mx-auto">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-lg font-bold text-[#30383D]">
                  Intelligent Facility Recommendation
                </h3>
                <p className="text-xs text-[#73777A] mt-1.5 leading-relaxed font-sans">
                  Configure requirements on the left and click <strong>"FIND BEST FACILITY"</strong>. The engine evaluates candidate spaces against hard constraints and soft compatibility weights.
                </p>
              </div>
              <button
                type="button"
                onClick={loadHackathonPreset}
                className="px-4 py-2 rounded-[10px] bg-[#F7F7F5] hover:bg-[#E5E7EB] border border-[#D7D7D5] text-[#30383D] text-xs font-semibold transition"
              >
                Load Challenge Test Case (55 Students)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
