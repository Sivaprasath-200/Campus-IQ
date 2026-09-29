import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { Facility, FacilityType, FacilityStatus } from '../types';
import { isTimeOverlapping } from '../allocation/engine';

const router = Router();

// GET /api/facilities
router.get('/', (req: Request, res: Response) => {
  const {
    search,
    type,
    minCapacity,
    maxCapacity,
    equipment,
    status,
    building,
    date,
    startTime,
    endTime,
  } = req.query;

  let facilities = db.getFacilities();

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    facilities = facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.building.toLowerCase().includes(q) ||
        f.room_number.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    );
  }

  // Type filter
  if (type && typeof type === 'string' && type !== 'All') {
    facilities = facilities.filter((f) => f.type === type);
  }

  // Capacity filters
  if (minCapacity) {
    facilities = facilities.filter((f) => f.capacity >= Number(minCapacity));
  }
  if (maxCapacity) {
    facilities = facilities.filter((f) => f.capacity <= Number(maxCapacity));
  }

  // Status filter
  if (status && typeof status === 'string' && status !== 'All') {
    facilities = facilities.filter((f) => f.status === status);
  }

  // Building filter
  if (building && typeof building === 'string' && building !== 'All') {
    facilities = facilities.filter((f) => f.building === building);
  }

  // Equipment filter (comma-separated)
  if (equipment && typeof equipment === 'string') {
    const requiredEquip = equipment.split(',').map((e) => e.trim().toLowerCase());
    facilities = facilities.filter((f) => {
      const fEquip = (f.equipment || []).map((e) => e.toLowerCase());
      return requiredEquip.every((reqEq) => fEquip.includes(reqEq));
    });
  }

  // Real-time / target-time availability filter
  if (date && startTime && endTime && typeof date === 'string' && typeof startTime === 'string' && typeof endTime === 'string') {
    const allBookings = db.getBookings().filter((b) => b.date === date && b.status !== 'CANCELLED');
    facilities = facilities.map((f) => {
      const hasConflict = allBookings.some(
        (b) => b.facility_id === f.id && isTimeOverlapping(b.start_time, b.end_time, startTime, endTime)
      );
      return {
        ...f,
        is_available_for_slot: !hasConflict && f.status !== 'MAINTENANCE',
      };
    });
  }

  return res.json({
    total: facilities.length,
    facilities,
  });
});

// GET /api/facilities/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const facility = db.getFacilityById(id);

  if (!facility) {
    return res.status(404).json({ error: 'Facility not found.' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const allBookings = db.getBookings().filter((b) => b.facility_id === id && b.status !== 'CANCELLED');

  const todaySchedule = allBookings.filter((b) => b.date === todayStr);
  const maintenanceLogs = db.getMaintenance().filter((m) => m.facility_id === id);

  return res.json({
    facility,
    today_schedule: todaySchedule,
    upcoming_bookings: allBookings.slice(0, 10),
    maintenance_history: maintenanceLogs,
  });
});

// POST /api/facilities (Admin only)
router.post('/', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { name, type, capacity, building, floor, room_number, equipment, utilization_threshold } = req.body;

  if (!name || !type || !capacity || !building || !room_number) {
    return res.status(400).json({ error: 'Name, type, capacity, building, and room number are required.' });
  }

  const newFacility: Facility = {
    id: `fac-custom-${Date.now()}`,
    name,
    type: type as FacilityType,
    capacity: Number(capacity),
    building,
    floor: Number(floor) || 1,
    room_number,
    status: 'AVAILABLE',
    utilization_threshold: Number(utilization_threshold) || 80,
    equipment: equipment || [],
    current_utilization: 45,
    total_bookings_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.createFacility(newFacility);

  db.addAuditLog({
    user_id: req.user!.id,
    user_name: req.user!.name,
    action: 'FACILITY_CREATED',
    entity_type: 'FACILITY',
    entity_id: newFacility.id,
    details: `Created new facility "${name}" with capacity ${capacity}.`,
  });

  return res.status(201).json({ facility: newFacility });
});

// PUT /api/facilities/:id (Admin only)
router.put('/:id', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = db.updateFacility(id, req.body);

  if (!updated) {
    return res.status(404).json({ error: 'Facility not found' });
  }

  db.addAuditLog({
    user_id: req.user!.id,
    user_name: req.user!.name,
    action: 'FACILITY_UPDATED',
    entity_type: 'FACILITY',
    entity_id: id,
    details: `Updated facility specifications for ${updated.name}.`,
  });

  return res.json({ facility: updated });
});

// DELETE /api/facilities/:id (Admin only)
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const facility = db.getFacilityById(id);
  const deleted = db.deleteFacility(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Facility not found or already deleted.' });
  }

  db.addAuditLog({
    user_id: req.user!.id,
    user_name: req.user!.name,
    action: 'FACILITY_DELETED',
    entity_type: 'FACILITY',
    entity_id: id,
    details: `Deleted facility ${facility?.name || id}.`,
  });

  return res.json({ message: 'Facility deleted successfully.' });
});

export default router;
