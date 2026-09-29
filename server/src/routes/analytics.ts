import { Router, Request, Response } from 'express';
import { db } from '../db';
import { timeToMinutes } from '../allocation/engine';

const router = Router();

// Helper to get current HH:mm
function getCurrentTimeString(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// GET /api/analytics/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  const facilities = db.getFacilities();
  const bookings = db.getBookings();
  const conflicts = db.getConflicts();
  const settings = db.getSettings();
  const requests = db.getRequests();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = getCurrentTimeString();
  const currentMin = timeToMinutes(currentTime);

  const todayBookings = bookings.filter((b) => b.date === todayStr && b.status !== 'CANCELLED');
  const activeConflicts = conflicts.filter((c) => c.status === 'OPEN');
  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length +
    bookings.filter((b) => b.status === 'PENDING').length;

  // Calculate available now: facilities that don't have an active booking right now
  const occupiedFacilityIdsNow = new Set<string>();
  todayBookings.forEach((b) => {
    const sMin = timeToMinutes(b.start_time);
    const eMin = timeToMinutes(b.end_time);
    if (sMin <= currentMin && eMin >= currentMin) {
      occupiedFacilityIdsNow.add(b.facility_id);
    }
  });

  const availableNowCount = facilities.filter(
    (f) => f.status !== 'MAINTENANCE' && !occupiedFacilityIdsNow.has(f.id)
  ).length;

  // Average campus utilization
  const totalUtil = facilities.reduce((sum, f) => sum + (f.current_utilization || 50), 0);
  const avgUtilization = facilities.length > 0 ? Number((totalUtil / facilities.length).toFixed(1)) : 0;

  // Utilization by facility type
  const typeMap: Record<string, { total: number; count: number }> = {};
  facilities.forEach((f) => {
    if (!typeMap[f.type]) {
      typeMap[f.type] = { total: 0, count: 0 };
    }
    typeMap[f.type].total += f.current_utilization || 50;
    typeMap[f.type].count += 1;
  });

  const utilizationByType = Object.entries(typeMap).map(([type, val]) => ({
    type,
    utilization: Math.round(val.total / val.count),
    facilitiesCount: val.count,
  }));

  // Demand by facility type (bookings count)
  const demandMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const fType = b.facility_type || 'Other';
    demandMap[fType] = (demandMap[fType] || 0) + 1;
  });
  const demandByType = Object.entries(demandMap).map(([type, count]) => ({
    type,
    bookingsCount: count,
  })).sort((a, b) => b.bookingsCount - a.bookingsCount);

  // Peak usage hours (count bookings per hour 08:00 to 20:00)
  const hourlyDemand: Record<number, number> = {};
  for (let h = 8; h <= 19; h++) hourlyDemand[h] = 0;

  bookings.forEach((b) => {
    const sHour = parseInt(b.start_time.split(':')[0], 10);
    const eHour = parseInt(b.end_time.split(':')[0], 10);
    for (let h = Math.max(8, sHour); h < Math.min(20, eHour || sHour + 1); h++) {
      hourlyDemand[h] = (hourlyDemand[h] || 0) + 1;
    }
  });

  const peakHours = Object.entries(hourlyDemand).map(([hour, count]) => ({
    hour: `${hour.padStart(2, '0')}:00`,
    bookings: count,
  }));

  // Underutilized facilities (< underutilized threshold, default 40%)
  const underThreshold = settings.thresholds.underutilized;
  const underutilized = facilities
    .filter((f) => (f.current_utilization || 0) < underThreshold)
    .map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      capacity: f.capacity,
      building: f.building,
      utilization: f.current_utilization || 0,
      totalBookings: f.total_bookings_count || 0,
      suggestedAction:
        f.type === 'Meeting Room'
          ? 'Consider allocating to student study teams and research discussions during low-demand windows.'
          : 'Promote for inter-departmental workshops and elective lab sessions.',
    }));

  // Over-demanded facilities (> overDemanded threshold, default 90%)
  const overThreshold = settings.thresholds.overDemanded;
  const overDemanded = facilities
    .filter((f) => (f.current_utilization || 0) >= overThreshold)
    .map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      capacity: f.capacity,
      building: f.building,
      utilization: f.current_utilization || 0,
      totalBookings: f.total_bookings_count || 0,
      peakHours: '10:00 AM – 03:00 PM',
      suggestedAction: `Distribute incoming load across compatible ${f.type}s with lower utilization to maintain resource longevity.`,
    }));

  // Recent allocations and audit
  const recentDecisions = db.getAuditLogs().slice(0, 8);

  return res.json({
    metrics: {
      totalFacilities: facilities.length,
      availableNow: availableNowCount,
      todayBookings: todayBookings.length,
      activeConflicts: activeConflicts.length,
      averageUtilization: avgUtilization,
      pendingRequests,
    },
    utilizationByType,
    demandByType,
    peakHours,
    underutilizedFacilities: underutilized,
    overDemandedFacilities: overDemanded,
    recentDecisions,
    thresholds: settings.thresholds,
  });
});

// GET /api/analytics/utilization
router.get('/utilization', (req: Request, res: Response) => {
  const facilities = db.getFacilities();
  const facilityUtilization = facilities.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    capacity: f.capacity,
    building: f.building,
    utilization: f.current_utilization || 50,
    totalBookings: f.total_bookings_count || 0,
  })).sort((a, b) => b.utilization - a.utilization);

  return res.json({
    facilityUtilization,
  });
});

// GET /api/analytics/demand
router.get('/demand', (req: Request, res: Response) => {
  const bookings = db.getBookings();
  const deptDemand: Record<string, number> = {};

  bookings.forEach((b) => {
    deptDemand[b.department] = (deptDemand[b.department] || 0) + 1;
  });

  const departmentDemand = Object.entries(deptDemand).map(([department, count]) => ({
    department,
    bookingsCount: count,
  })).sort((a, b) => b.bookingsCount - a.bookingsCount);

  return res.json({
    departmentDemand,
  });
});

// GET /api/analytics/conflicts
router.get('/conflicts', (req: Request, res: Response) => {
  const conflicts = db.getConflicts();
  const typeCount: Record<string, number> = {};

  conflicts.forEach((c) => {
    typeCount[c.conflict_type] = (typeCount[c.conflict_type] || 0) + 1;
  });

  const breakdown = Object.entries(typeCount).map(([type, count]) => ({
    conflictType: type,
    count,
  }));

  return res.json({
    totalConflicts: conflicts.length,
    openConflicts: conflicts.filter((c) => c.status === 'OPEN').length,
    resolvedConflicts: conflicts.filter((c) => c.status === 'RESOLVED').length,
    breakdown,
  });
});

export default router;
