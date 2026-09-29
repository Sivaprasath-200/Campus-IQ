import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { AllocationEngine } from '../allocation/engine';
import { ConflictDetector } from '../allocation/conflictDetector';
import { Booking, ResourceRequest } from '../types';

const router = Router();

// POST /api/allocation/recommend
router.post('/recommend', (req: Request, res: Response) => {
  const {
    facility_type,
    capacity_required,
    date,
    start_time,
    end_time,
    required_equipment,
    preferred_facility_id,
  } = req.body;

  if (!facility_type || !capacity_required || !date || !start_time || !end_time) {
    return res.status(400).json({
      error: 'facility_type, capacity_required, date, start_time, and end_time are required.',
    });
  }

  if (start_time >= end_time) {
    return res.status(400).json({
      error: 'Invalid time range: End time must be after start time.',
    });
  }

  const result = AllocationEngine.evaluateRequest({
    facility_type,
    capacity_required: Number(capacity_required),
    date,
    start_time,
    end_time,
    required_equipment: Array.isArray(required_equipment) ? required_equipment : [],
    preferred_facility_id,
  });

  return res.json(result);
});

// POST /api/allocation/confirm
router.post('/confirm', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const {
    facility_id,
    date,
    start_time,
    end_time,
    purpose,
    priority,
    students_count,
    department,
    request_id,
  } = req.body;

  if (!facility_id || !date || !start_time || !end_time || !purpose) {
    return res.status(400).json({
      error: 'facility_id, date, start_time, end_time, and purpose are required to confirm booking.',
    });
  }

  const facility = db.getFacilityById(facility_id);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  // Conflict check again at point of confirmation to avoid race conditions
  const conflictCheck = ConflictDetector.checkBookingConflict(
    facility_id,
    date,
    start_time,
    end_time
  );

  if (conflictCheck.hasConflict && conflictCheck.overlappingBooking) {
    const existing = conflictCheck.overlappingBooking;
    return res.status(409).json({
      error: 'Scheduling Conflict Detected during confirmation',
      message: conflictCheck.message,
      conflict: {
        facility: facility.name,
        existingBooking: {
          id: existing.id,
          purpose: existing.purpose,
          requester: existing.user_name,
          department: existing.department,
          startTime: existing.start_time,
          endTime: existing.end_time,
        },
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
    priority: priority || 'HIGH',
    students_count: Number(students_count) || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createBooking(newBooking);

  // If tied to a request_id, update request status
  if (request_id) {
    const existingReq = db.getRequestById(request_id);
    if (existingReq) {
      existingReq.status = 'ALLOCATED';
      db.persist();
    }
  }

  db.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'ALLOCATION_CONFIRMED',
    entity_type: 'ALLOCATION',
    entity_id: newBooking.id,
    details: `AI Allocation confirmed for ${facility.name} on ${date} (${start_time}-${end_time}) by ${user.name}.`,
  });

  return res.status(201).json({
    message: 'Facility allocation confirmed successfully.',
    booking: newBooking,
  });
});

export default router;
