import fs from 'fs';
import path from 'path';
import {
  User,
  Facility,
  Equipment,
  Booking,
  ResourceRequest,
  Conflict,
  Maintenance,
  AuditLog,
  SystemSettings,
  FacilityStatus,
  BookingStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_FACILITIES,
  INITIAL_EQUIPMENT,
  INITIAL_SETTINGS,
  INITIAL_CONFLICTS,
  INITIAL_MAINTENANCE,
  INITIAL_AUDIT_LOGS,
  generateSeedBookings,
} from '../seed/seedData';

export interface DatabaseState {
  users: User[];
  facilities: Facility[];
  equipment: Equipment[];
  bookings: Booking[];
  requests: ResourceRequest[];
  conflicts: Conflict[];
  maintenance: Maintenance[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
}

const DATA_FILE_PATH = path.join(__dirname, '../../data.json');

class DatabaseService {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseState {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.facilities && parsed.facilities.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to load existing data.json, re-seeding fresh data.', err);
    }

    const freshState: DatabaseState = {
      users: INITIAL_USERS,
      facilities: INITIAL_FACILITIES,
      equipment: INITIAL_EQUIPMENT,
      bookings: generateSeedBookings(),
      requests: [],
      conflicts: INITIAL_CONFLICTS,
      maintenance: INITIAL_MAINTENANCE,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: INITIAL_SETTINGS,
    };

    this.saveState(freshState);
    return freshState;
  }

  private saveState(state: DatabaseState) {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database state to data.json', err);
    }
  }

  public persist() {
    this.saveState(this.state);
  }

  public resetToSeed() {
    this.state = {
      users: INITIAL_USERS,
      facilities: INITIAL_FACILITIES,
      equipment: INITIAL_EQUIPMENT,
      bookings: generateSeedBookings(),
      requests: [],
      conflicts: INITIAL_CONFLICTS,
      maintenance: INITIAL_MAINTENANCE,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: INITIAL_SETTINGS,
    };
    this.persist();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.state.users.push(user);
    this.persist();
    return user;
  }

  // --- Facilities ---
  public getFacilities(): Facility[] {
    return this.state.facilities;
  }

  public getFacilityById(id: string): Facility | undefined {
    return this.state.facilities.find((f) => f.id === id);
  }

  public createFacility(facility: Facility): Facility {
    this.state.facilities.push(facility);
    this.persist();
    return facility;
  }

  public updateFacility(id: string, updates: Partial<Facility>): Facility | null {
    const idx = this.state.facilities.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.state.facilities[idx] = {
      ...this.state.facilities[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.state.facilities[idx];
  }

  public deleteFacility(id: string): boolean {
    const initialLen = this.state.facilities.length;
    this.state.facilities = this.state.facilities.filter((f) => f.id !== id);
    const deleted = this.state.facilities.length !== initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Bookings ---
  public getBookings(): Booking[] {
    return this.state.bookings;
  }

  public getBookingById(id: string): Booking | undefined {
    return this.state.bookings.find((b) => b.id === id);
  }

  public getBookingsByFacilityAndDate(facilityId: string, date: string): Booking[] {
    return this.state.bookings.filter(
      (b) => b.facility_id === facilityId && b.date === date && b.status !== 'CANCELLED'
    );
  }

  public createBooking(booking: Booking): Booking {
    this.state.bookings.push(booking);
    this.persist();
    return booking;
  }

  public updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const idx = this.state.bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.state.bookings[idx] = {
      ...this.state.bookings[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.state.bookings[idx];
  }

  public deleteBooking(id: string): boolean {
    const initialLen = this.state.bookings.length;
    this.state.bookings = this.state.bookings.filter((b) => b.id !== id);
    const deleted = this.state.bookings.length !== initialLen;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Requests ---
  public getRequests(): ResourceRequest[] {
    return this.state.requests;
  }

  public getRequestById(id: string): ResourceRequest | undefined {
    return this.state.requests.find((r) => r.id === id);
  }

  public createRequest(req: ResourceRequest): ResourceRequest {
    this.state.requests.push(req);
    this.persist();
    return req;
  }

  // --- Conflicts ---
  public getConflicts(): Conflict[] {
    return this.state.conflicts;
  }

  public getConflictById(id: string): Conflict | undefined {
    return this.state.conflicts.find((c) => c.id === id);
  }

  public createConflict(conflict: Conflict): Conflict {
    this.state.conflicts.push(conflict);
    this.persist();
    return conflict;
  }

  public resolveConflict(id: string, resolution: string): Conflict | null {
    const idx = this.state.conflicts.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.state.conflicts[idx].status = 'RESOLVED';
    this.state.conflicts[idx].resolution = resolution;
    this.state.conflicts[idx].resolved_at = new Date().toISOString();
    this.persist();
    return this.state.conflicts[idx];
  }

  // --- Maintenance ---
  public getMaintenance(): Maintenance[] {
    return this.state.maintenance;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return this.state.settings;
  }

  public updateSettings(newSettings: Partial<SystemSettings>): SystemSettings {
    this.state.settings = {
      weights: { ...this.state.settings.weights, ...newSettings.weights },
      thresholds: { ...this.state.settings.thresholds, ...newSettings.thresholds },
    };
    this.persist();
    return this.state.settings;
  }
}

export const db = new DatabaseService();
