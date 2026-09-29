import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { Booking } from '../types';
import { ConflictDetector } from '../allocation/conflictDetector';

const router = Router();

// GET /api/bookings
router.get('/', (req: Request, res: Response) => {
  const { date, facility_id, department, status, user_id } = req.query;

  let bookings = db.getBookings();

  if (date && typeof date === 'string') {
    bookings = bookings.filter((b) => b.date === date);
  }
  if (facility_id && typeof facility_id === 'string') {
    bookings = bookings.filter((b) => b.facility_id === facility_id);
  }
  if (department && typeof department === 'string' && department !== 'All') {
    bookings = bookings.filter((b) => b.department === department);
  }
  if (status && typeof status === 'string' && status !== 'All') {
    bookings = bookings.filter((b) => b.status === status);
  }
  if (user_id && typeof user_id === 'string') {
    bookings = bookings.filter((b) => b.user_id === user_id);
  }

  // Sort chronologically by date and start_time
  bookings.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  return res.json({
    total: bookings.length,
    bookings,
  });
});

// GET /api/bookings/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = db.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  return res.json({ booking });
});

// POST /api/bookings
router.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const {
    facility_id,
    date,
    start_time,
    end_time,
    purpose,
    priority,
    students_count,
    department,
  } = req.body;

  if (!facility_id || !date || !start_time || !end_time || !purpose) {
    return res.status(400).json({ error: 'facility_id, date, start_time, end_time, and purpose are required.' });
  }

  if (start_time >= end_time) {
    return res.status(400).json({ error: 'Invalid time range: End time must be strictly after start time.' });
  }

  const facility = db.getFacilityById(facility_id);
  if (!facility) {
    return res.status(404).json({ error: 'Selected facility does not exist.' });
  }

  if (facility.status === 'MAINTENANCE') {
    return res.status(400).json({ error: 'The selected facility is currently under maintenance and cannot be booked.' });
  }

  // Capacity check
  if (students_count && facility.capacity < Number(students_count)) {
    return res.status(400).json({
      error: `Capacity violation: Facility capacity (${facility.capacity}) is less than required (${students_count}).`,
    });
  }

  // HARD CONFLICT PREVENTION CHECK:
  const conflictCheck = ConflictDetector.checkBookingConflict(
    facility_id,
    date,
    start_time,
    end_time
  );

  if (conflictCheck.hasConflict && conflictCheck.overlappingBooking) {
    const existing = conflictCheck.overlappingBooking;
    return res.status(409).json({
      error: 'Scheduling Conflict Detected',
      message: conflictCheck.message,
      conflict: {
        facility: facility.name,
        existingBooking: {
          id: existing.id,
          purpose: existing.purpose,
          requester: existing.user_name,
          department: existing.department,
          date: existing.date,
          startTime: existing.start_time,
          endTime: existing.end_time,
        },
        requestedTime: `${start_time} – ${end_time}`,
        overlapDuration: `${conflictCheck.overlapMinutes} minutes`,
      },
    });
  }

  const user = req.user!;
  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    facility_id,
    facility_name: facility.name,
    facility_type: facility.type,
    user_id: user.id,
    user_name: user.name,
    user_role: user.role,
    department: department || user.department,
    date,
    start_time,
    end_time,
    purpose,
    status: user.role === 'STUDENT' ? 'PENDING' : 'CONFIRMED',
    priority: priority || 'MEDIUM',
    students_count: Number(students_count) || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createBooking(newBooking);

  // Update facility booking counts
  const currentCount = facility.total_bookings_count || 0;
  db.updateFacility(facility.id, {
    total_bookings_count: currentCount + 1,
  });

  db.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'BOOKING_CREATED',
    entity_type: 'BOOKING',
    entity_id: newBooking.id,
    details: `Booking created for ${facility.name} on ${date} (${start_time}-${end_time}): "${purpose}".`,
  });

  return res.status(201).json({
    message: 'Booking successfully created.',
    booking: newBooking,
  });
});

// PUT /api/bookings/:id
router.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = db.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const user = req.user!;
  // Check authorization: Admin can modify anything, users can only modify their own
  if (user.role !== 'ADMIN' && booking.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only modify your own bookings.' });
  }

  // If changing time/date/facility, re-verify conflict
  const newFacilityId = req.body.facility_id || booking.facility_id;
  const newDate = req.body.date || booking.date;
  const newStart = req.body.start_time || booking.start_time;
  const newEnd = req.body.end_time || booking.end_time;

  if (req.body.start_time || req.body.end_time || req.body.facility_id || req.body.date) {
    const conflictCheck = ConflictDetector.checkBookingConflict(
      newFacilityId,
      newDate,
      newStart,
      newEnd,
      id
    );

    if (conflictCheck.hasConflict) {
      return res.status(409).json({
        error: 'Scheduling Conflict Detected during modification',
        message: conflictCheck.message,
      });
    }
  }

  const updated = db.updateBooking(id, req.body);

  db.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'BOOKING_UPDATED',
    entity_type: 'BOOKING',
    entity_id: id,
    details: `Booking ${id} updated by ${user.name}.`,
  });

  return res.json({ booking: updated });
});

// DELETE /api/bookings/:id (Cancel)
router.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = db.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  const user = req.user!;
  if (user.role !== 'ADMIN' && booking.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden: You can only cancel your own bookings.' });
  }

  // Set status to CANCELLED
  const updated = db.updateBooking(id, { status: 'CANCELLED' });

  db.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'BOOKING_CANCELLED',
    entity_type: 'BOOKING',
    entity_id: id,
    details: `Booking ${id} cancelled by ${user.name}.`,
  });

  return res.json({ message: 'Booking cancelled successfully.', booking: updated });
});

export default router;
