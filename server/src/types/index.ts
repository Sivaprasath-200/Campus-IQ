export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type FacilityType =
  | 'Classroom'
  | 'Computer Lab'
  | 'Electronics Lab'
  | 'Physics Lab'
  | 'Chemistry Lab'
  | 'Seminar Hall'
  | 'Auditorium'
  | 'Conference Room'
  | 'Sports Facility'
  | 'Project Room'
  | 'Meeting Room'
  | 'Other';

export type FacilityStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'CONFLICT';

export type ConflictType =
  | 'Double Booking'
  | 'Capacity Violation'
  | 'Equipment Mismatch'
  | 'Scheduling Overlap'
  | 'Maintenance Conflict';

export type ConflictSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DepartmentName =
  | 'ECE'
  | 'CSE'
  | 'EEE'
  | 'MECH'
  | 'CIVIL'
  | 'AI & DS'
  | 'MBA'
  | 'SCIENCE';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department: DepartmentName;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
}

export interface FacilityEquipment {
  id: string;
  facility_id: string;
  equipment_id: string;
  equipment_name?: string;
  quantity: number;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  capacity: number;
  building: string;
  floor: number;
  room_number: string;
  status: FacilityStatus;
  utilization_threshold: number;
  equipment?: string[];
  equipment_details?: FacilityEquipment[];
  current_utilization?: number;
  total_bookings_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  facility_id: string;
  facility_name?: string;
  facility_type?: FacilityType;
  user_id: string;
  user_name?: string;
  user_role?: UserRole;
  department: DepartmentName;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm (24h)
  end_time: string; // HH:mm (24h)
  purpose: string;
  status: BookingStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  students_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceRequest {
  id: string;
  user_id: string;
  user_name?: string;
  department: DepartmentName;
  facility_type: FacilityType;
  capacity_required: number;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  preferred_facility_id?: string;
  required_equipment: string[];
  special_requirements?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'ALLOCATED' | 'REJECTED';
  created_at: string;
}

export interface AllocationScoreBreakdown {
  capacity: number;
  equipment: number;
  availability: number;
  utilization: number;
  preference: number;
  demand: number;
}

export interface AllocationAlternative {
  facilityId: string;
  name: string;
  type: FacilityType;
  capacity: number;
  building: string;
  score: number;
  reasons: string[];
  equipment: string[];
}

export interface AllocationResult {
  recommendedFacility: {
    id: string;
    name: string;
    type: FacilityType;
    capacity: number;
    building: string;
    floor: number;
    room_number: string;
    equipment: string[];
    current_utilization: number;
  } | null;
  score: number;
  breakdown: AllocationScoreBreakdown;
  reasons: string[];
  alternatives: AllocationAlternative[];
  rejectedFacilitiesCount?: number;
  rejectionReasons?: Record<string, string>;
}

export interface Conflict {
  id: string;
  booking_a_id: string;
  booking_b_id?: string;
  facility_id: string;
  facility_name: string;
  date: string;
  time_range: string;
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  status: 'OPEN' | 'RESOLVED' | 'IGNORED';
  resolution?: string;
  booking_a?: Booking;
  booking_b?: Booking;
  created_at: string;
  resolved_at?: string;
}

export interface Maintenance {
  id: string;
  facility_id: string;
  facility_name?: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export interface SystemSettings {
  weights: {
    capacity: number;
    equipment: number;
    availability: number;
    utilization: number;
    preference: number;
    demand: number;
  };
  thresholds: {
    underutilized: number; // e.g. 40
    healthy: number; // e.g. 80
    high: number; // e.g. 90
    overDemanded: number; // e.g. 90
  };
}
