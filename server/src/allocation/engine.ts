import { db } from '../db';
import {
  Facility,
  ResourceRequest,
  AllocationResult,
  AllocationAlternative,
  Booking,
} from '../types';

export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  // existingStart < requestedEnd AND existingEnd > requestedStart
  return sA < eB && eA > sB;
}

export function calculateOverlapDurationMinutes(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): number {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  const overlapStart = Math.max(sA, sB);
  const overlapEnd = Math.min(eA, eB);

  return Math.max(0, overlapEnd - overlapStart);
}

export interface CandidateEvaluation {
  facility: Facility;
  score: number;
  breakdown: {
    capacity: number;
    equipment: number;
    availability: number;
    utilization: number;
    preference: number;
    demand: number;
  };
  reasons: string[];
}

export class AllocationEngine {
  public static evaluateRequest(request: {
    facility_type: string;
    capacity_required: number;
    date: string;
    start_time: string;
    end_time: string;
    required_equipment?: string[];
    preferred_facility_id?: string;
  }): AllocationResult {
    const facilities = db.getFacilities();
    const existingBookings = db.getBookings();
    const settings = db.getSettings();
    const weights = settings.weights;

    const requestedEquipment = request.required_equipment || [];
    const rejectionReasons: Record<string, string> = {};
    const validCandidates: CandidateEvaluation[] = [];

    // ==========================================
    // STAGE 1 — HARD CONSTRAINT FILTERING
    // ==========================================
    for (const facility of facilities) {
      // 1. Inactive or under permanent maintenance
      if (facility.status === 'MAINTENANCE') {
        rejectionReasons[facility.id] = `Facility is currently under maintenance.`;
        continue;
      }

      // 2. Facility type match
      if (facility.type !== request.facility_type) {
        rejectionReasons[facility.id] = `Facility type mismatch (${facility.type} vs ${request.facility_type}).`;
        continue;
      }

      // 3. Hard capacity constraint: capacity must be >= required
      if (facility.capacity < request.capacity_required) {
        rejectionReasons[facility.id] = `Insufficient capacity (${facility.capacity} seats < ${request.capacity_required} required).`;
        continue;
      }

      // 4. Overlapping booking conflict check for the requested date and time
      const facilityBookingsOnDate = existingBookings.filter(
        (b) =>
          b.facility_id === facility.id &&
          b.date === request.date &&
          b.status !== 'CANCELLED'
      );

      const conflictBooking = facilityBookingsOnDate.find((b) =>
        isTimeOverlapping(b.start_time, b.end_time, request.start_time, request.end_time)
      );

      if (conflictBooking) {
        rejectionReasons[facility.id] = `Occupied by booking "${conflictBooking.purpose}" (${conflictBooking.start_time} - ${conflictBooking.end_time}).`;
        continue;
      }

      // 5. Equipment availability: must possess all required equipment
      const facilityEquip = facility.equipment || [];
      const missingEquipment = requestedEquipment.filter(
        (eq) => !facilityEquip.some((fe) => fe.toLowerCase() === eq.toLowerCase())
      );

      if (missingEquipment.length > 0) {
        rejectionReasons[facility.id] = `Missing required equipment: ${missingEquipment.join(', ')}.`;
        continue;
      }

      // ==========================================
      // STAGE 2 — SOFT SCORING
      // ==========================================
      // A. Capacity Fit Score (0-100)
      // Best fit is exact or slightly above capacity, penalize large empty rooms
      const capDelta = facility.capacity - request.capacity_required;
      let capacityFit = 100;
      if (capDelta === 0) {
        capacityFit = 100;
      } else {
        const excessRatio = capDelta / facility.capacity;
        capacityFit = Math.max(30, Math.round(100 - excessRatio * 75));
      }

      // B. Equipment Match Score (0-100)
      // Base 95 if has all required, plus bonus for helpful additions
      let equipmentMatch = 95;
      if (facilityEquip.length > requestedEquipment.length) {
        equipmentMatch = Math.min(100, 95 + (facilityEquip.length - requestedEquipment.length) * 2);
      }

      // C. Availability Score (0-100)
      // Clean buffer between surrounding bookings
      let availabilityScore = 100;
      const reqStartMin = timeToMinutes(request.start_time);
      const reqEndMin = timeToMinutes(request.end_time);

      let minBuffer = 999;
      for (const b of facilityBookingsOnDate) {
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        if (bEnd <= reqStartMin) {
          minBuffer = Math.min(minBuffer, reqStartMin - bEnd);
        } else if (bStart >= reqEndMin) {
          minBuffer = Math.min(minBuffer, bStart - reqEndMin);
        }
      }
      if (minBuffer < 15 && minBuffer >= 0) {
        availabilityScore = 85; // tight turnaround
      } else {
        availabilityScore = 100;
      }

      // D. Utilization Balance Score (0-100)
      // Prefer facilities that prevent overconcentration of wear-and-tear
      const currentUtil = facility.current_utilization || 50;
      let utilizationBalance = Math.round(Math.max(10, 100 - currentUtil * 0.8));

      // E. User Preference Score (0-100)
      let userPreference = 50;
      if (request.preferred_facility_id && request.preferred_facility_id === facility.id) {
        userPreference = 100;
      }

      // F. Demand Balance Score (0-100)
      const bookingCount = facility.total_bookings_count || 10;
      const demandBalance = Math.round(Math.max(20, 100 - bookingCount * 1.2));

      // Compute total weighted score
      const totalWeightedScore =
        capacityFit * weights.capacity +
        equipmentMatch * weights.equipment +
        availabilityScore * weights.availability +
        utilizationBalance * weights.utilization +
        userPreference * weights.preference +
        demandBalance * weights.demand;

      const normalizedScore = Math.min(100, Math.max(0, Math.round(totalWeightedScore)));

      // Construct detailed reasons
      const reasons: string[] = [];
      reasons.push(`Capacity requirement satisfied (${facility.capacity} seats fits ${request.capacity_required} students)`);
      if (requestedEquipment.length > 0) {
        reasons.push(`All requested equipment present (${requestedEquipment.join(', ')})`);
      }
      reasons.push(`Zero scheduling conflicts during requested period`);
      reasons.push(`Optimal utilization balance (${currentUtil}% current load)`);
      if (capDelta <= 15) {
        reasons.push(`High room efficiency with minimal wasted seat capacity`);
      }
      if (request.preferred_facility_id === facility.id) {
        reasons.push(`Matched user's requested preferred facility`);
      }

      validCandidates.push({
        facility,
        score: normalizedScore,
        breakdown: {
          capacity: capacityFit,
          equipment: equipmentMatch,
          availability: availabilityScore,
          utilization: utilizationBalance,
          preference: userPreference,
          demand: demandBalance,
        },
        reasons,
      });
    }

    // Sort valid candidates descending by score
    validCandidates.sort((a, b) => b.score - a.score);

    if (validCandidates.length === 0) {
      return {
        recommendedFacility: null,
        score: 0,
        breakdown: {
          capacity: 0,
          equipment: 0,
          availability: 0,
          utilization: 0,
          preference: 0,
          demand: 0,
        },
        reasons: ['No facility satisfied all hard constraints (availability, type, capacity, and equipment).'],
        alternatives: [],
        rejectedFacilitiesCount: facilities.length,
        rejectionReasons,
      };
    }

    const best = validCandidates[0];
    const alternatives: AllocationAlternative[] = validCandidates.slice(1, 6).map((c) => ({
      facilityId: c.facility.id,
      name: c.facility.name,
      type: c.facility.type,
      capacity: c.facility.capacity,
      building: c.facility.building,
      score: c.score,
      reasons: c.reasons,
      equipment: c.facility.equipment || [],
    }));

    return {
      recommendedFacility: {
        id: best.facility.id,
        name: best.facility.name,
        type: best.facility.type,
        capacity: best.facility.capacity,
        building: best.facility.building,
        floor: best.facility.floor,
        room_number: best.facility.room_number,
        equipment: best.facility.equipment || [],
        current_utilization: best.facility.current_utilization || 50,
      },
      score: best.score,
      breakdown: best.breakdown,
      reasons: best.reasons,
      alternatives,
      rejectedFacilitiesCount: facilities.length - validCandidates.length,
      rejectionReasons,
    };
  }
}
