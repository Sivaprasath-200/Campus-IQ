import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { ConflictDetector } from '../allocation/conflictDetector';

const router = Router();

// GET /api/conflicts
router.get('/', (req: Request, res: Response) => {
  // First run dynamic scan to catch any newly formed overlaps
  const allConflicts = ConflictDetector.scanAllConflicts();
  const bookings = db.getBookings();

  // Populate booking details
  const enriched = allConflicts.map((c) => {
    const bookingA = bookings.find((b) => b.id === c.booking_a_id);
    const bookingB = c.booking_b_id ? bookings.find((b) => b.id === c.booking_b_id) : undefined;
    return {
      ...c,
      booking_a: bookingA,
      booking_b: bookingB,
    };
  });

  return res.json({
    total: enriched.length,
    conflicts: enriched,
  });
});

// POST /api/conflicts/:id/resolve (Admin only)
router.post('/:id/resolve', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { action, resolution, target_booking_id, new_facility_id, new_start_time, new_end_time } = req.body;

  const conflict = db.getConflictById(id);
  if (!conflict) {
    return res.status(404).json({ error: 'Conflict record not found.' });
  }

  const user = req.user!;
  let resText = resolution || 'Resolved by administrative action.';

  if (action === 'cancel' && target_booking_id) {
    db.updateBooking(target_booking_id, { status: 'CANCELLED' });
    resText = `Cancelled conflicting booking (${target_booking_id}).`;
  } else if (action === 'reassign' && target_booking_id && new_facility_id) {
    const targetFacility = db.getFacilityById(new_facility_id);
    db.updateBooking(target_booking_id, {
      facility_id: new_facility_id,
      facility_name: targetFacility ? targetFacility.name : 'Reassigned Facility',
      status: 'CONFIRMED',
    });
    resText = `Reassigned booking (${target_booking_id}) to ${targetFacility?.name || new_facility_id}.`;
  } else if (action === 'reschedule' && target_booking_id && new_start_time && new_end_time) {
    db.updateBooking(target_booking_id, {
      start_time: new_start_time,
      end_time: new_end_time,
      status: 'CONFIRMED',
    });
    resText = `Rescheduled booking to ${new_start_time} - ${new_end_time}.`;
  }

  const resolved = db.resolveConflict(id, resText);

  db.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'CONFLICT_RESOLVED',
    entity_type: 'CONFLICT',
    entity_id: id,
    details: `Resolved conflict ${id}: ${resText}`,
  });

  return res.json({
    message: 'Conflict successfully resolved.',
    conflict: resolved,
  });
});

export default router;
