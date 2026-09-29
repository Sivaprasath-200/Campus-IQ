import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/reports/utilization
router.get('/utilization', (req: Request, res: Response) => {
  const { department, type } = req.query;
  let facilities = db.getFacilities();

  if (type && typeof type === 'string' && type !== 'All') {
    facilities = facilities.filter((f) => f.type === type);
  }

  const report = facilities.map((f) => ({
    id: f.id,
    facilityName: f.name,
    type: f.type,
    building: f.building,
    roomNumber: f.room_number,
    capacity: f.capacity,
    currentUtilization: `${f.current_utilization || 50}%`,
    totalBookings: f.total_bookings_count || 0,
    status: f.status,
    equipmentList: (f.equipment || []).join('; '),
  }));

  return res.json({
    generatedAt: new Date().toISOString(),
    totalFacilities: report.length,
    data: report,
  });
});

// GET /api/reports/bookings
router.get('/bookings', (req: Request, res: Response) => {
  const { startDate, endDate, department } = req.query;
  let bookings = db.getBookings();

  if (department && typeof department === 'string' && department !== 'All') {
    bookings = bookings.filter((b) => b.department === department);
  }
  if (startDate && typeof startDate === 'string') {
    bookings = bookings.filter((b) => b.date >= startDate);
  }
  if (endDate && typeof endDate === 'string') {
    bookings = bookings.filter((b) => b.date <= endDate);
  }

  const report = bookings.map((b) => ({
    id: b.id,
    facility: b.facility_name,
    facilityType: b.facility_type,
    requester: b.user_name,
    role: b.user_role,
    department: b.department,
    date: b.date,
    timeSlot: `${b.start_time} - ${b.end_time}`,
    purpose: b.purpose,
    status: b.status,
    priority: b.priority,
    studentsCount: b.students_count || 'N/A',
  }));

  return res.json({
    generatedAt: new Date().toISOString(),
    totalRecords: report.length,
    data: report,
  });
});

// GET /api/reports/conflicts
router.get('/conflicts', (req: Request, res: Response) => {
  const conflicts = db.getConflicts();
  const report = conflicts.map((c) => ({
    id: c.id,
    facility: c.facility_name,
    date: c.date,
    overlapTime: c.time_range,
    type: c.conflict_type,
    severity: c.severity,
    status: c.status,
    resolution: c.resolution || 'Pending Resolution',
    reportedAt: c.created_at,
    resolvedAt: c.resolved_at || 'Unresolved',
  }));

  return res.json({
    generatedAt: new Date().toISOString(),
    totalConflicts: report.length,
    data: report,
  });
});

export default router;
