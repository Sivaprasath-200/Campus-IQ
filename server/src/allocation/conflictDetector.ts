import { db } from '../db';
import { Booking, Conflict, ConflictType, ConflictSeverity } from '../types';
import { isTimeOverlapping, calculateOverlapDurationMinutes } from './engine';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType?: ConflictType;
  severity?: ConflictSeverity;
  overlappingBooking?: Booking;
  overlapMinutes?: number;
  message?: string;
}

export class ConflictDetector {
  public static checkBookingConflict(
    facilityId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): ConflictCheckResult {
    const facilityBookings = db.getBookings().filter(
      (b) =>
        b.facility_id === facilityId &&
        b.date === date &&
        b.status !== 'CANCELLED' &&
        (!excludeBookingId || b.id !== excludeBookingId)
    );

    for (const existing of facilityBookings) {
      if (isTimeOverlapping(existing.start_time, existing.end_time, startTime, endTime)) {
        const overlap = calculateOverlapDurationMinutes(
          existing.start_time,
          existing.end_time,
          startTime,
          endTime
        );

        return {
          hasConflict: true,
          conflictType: 'Double Booking',
          severity: 'CRITICAL',
          overlappingBooking: existing,
          overlapMinutes: overlap,
          message: `Scheduling Conflict Detected: Overlaps with booking "${existing.purpose}" by ${existing.user_name || 'faculty'} (${existing.start_time} - ${existing.end_time}) by ${overlap} minutes.`,
        };
      }
    }

    return { hasConflict: false };
  }

  public static scanAllConflicts(): Conflict[] {
    const bookings = db.getBookings().filter((b) => b.status !== 'CANCELLED');
    const existingConflicts = db.getConflicts();
    const detectedConflicts: Conflict[] = [...existingConflicts];

    for (let i = 0; i < bookings.length; i++) {
      for (let j = i + 1; j < bookings.length; j++) {
        const a = bookings[i];
        const b = bookings[j];

        if (a.facility_id === b.facility_id && a.date === b.date) {
          if (isTimeOverlapping(a.start_time, a.end_time, b.start_time, b.end_time)) {
            // Check if already registered
            const alreadyRegistered = detectedConflicts.some(
              (c) =>
                (c.booking_a_id === a.id && c.booking_b_id === b.id) ||
                (c.booking_a_id === b.id && c.booking_b_id === a.id)
            );

            if (!alreadyRegistered) {
              const overlapMin = calculateOverlapDurationMinutes(
                a.start_time,
                a.end_time,
                b.start_time,
                b.end_time
              );
              const facility = db.getFacilityById(a.facility_id);

              const newConflict: Conflict = {
                id: `conf-auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                booking_a_id: a.id,
                booking_b_id: b.id,
                facility_id: a.facility_id,
                facility_name: facility ? facility.name : 'Unknown Facility',
                date: a.date,
                time_range: `${overlapMin} min overlap between (${a.start_time}-${a.end_time}) and (${b.start_time}-${b.end_time})`,
                conflict_type: 'Double Booking',
                severity: 'CRITICAL',
                status: 'OPEN',
                created_at: new Date().toISOString(),
              };

              db.createConflict(newConflict);
              detectedConflicts.push(newConflict);
            }
          }
        }
      }
    }

    return detectedConflicts;
  }
}
