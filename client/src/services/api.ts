import {
  User,
  Facility,
  Booking,
  ResourceRequest,
  AllocationResult,
  Conflict,
  SystemSettings,
  DashboardMetrics,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('campusiq_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('campusiq_token', token);
    } else {
      localStorage.removeItem('campusiq_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || data.message || 'API request failed');
        (error as any).status = response.status;
        (error as any).payload = data;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // --- Auth ---
  public async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public logout() {
    this.setToken(null);
  }

  // --- Facilities ---
  public async getFacilities(params: Record<string, any> = {}): Promise<{ total: number; facilities: Facility[] }> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const url = `/facilities${qs.toString() ? `?${qs.toString()}` : ''}`;
    return this.request<{ total: number; facilities: Facility[] }>(url);
  }

  public async getFacilityById(id: string): Promise<{
    facility: Facility;
    today_schedule: Booking[];
    upcoming_bookings: Booking[];
    maintenance_history: any[];
  }> {
    return this.request(`/facilities/${id}`);
  }

  public async createFacility(data: Partial<Facility>): Promise<{ facility: Facility }> {
    return this.request('/facilities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateFacility(id: string, data: Partial<Facility>): Promise<{ facility: Facility }> {
    return this.request(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteFacility(id: string): Promise<{ message: string }> {
    return this.request(`/facilities/${id}`, { method: 'DELETE' });
  }

  // --- Bookings ---
  public async getBookings(params: Record<string, any> = {}): Promise<{ total: number; bookings: Booking[] }> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const url = `/bookings${qs.toString() ? `?${qs.toString()}` : ''}`;
    return this.request<{ total: number; bookings: Booking[] }>(url);
  }

  public async createBooking(data: {
    facility_id: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    priority?: string;
    students_count?: number;
    department?: string;
  }): Promise<{ message: string; booking: Booking }> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateBooking(id: string, data: Partial<Booking>): Promise<{ booking: Booking }> {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async cancelBooking(id: string): Promise<{ message: string; booking: Booking }> {
    return this.request(`/bookings/${id}`, { method: 'DELETE' });
  }

  // --- Smart Allocation Engine ---
  public async getRecommendation(data: {
    facility_type: string;
    capacity_required: number;
    date: string;
    start_time: string;
    end_time: string;
    required_equipment?: string[];
    preferred_facility_id?: string;
  }): Promise<AllocationResult> {
    return this.request<AllocationResult>('/allocation/recommend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async confirmAllocation(data: {
    facility_id: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
    priority?: string;
    students_count?: number;
    department?: string;
    request_id?: string;
  }): Promise<{ message: string; booking: Booking }> {
    return this.request('/allocation/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Conflicts ---
  public async getConflicts(): Promise<{ total: number; conflicts: Conflict[] }> {
    return this.request('/conflicts');
  }

  public async resolveConflict(
    id: string,
    data: {
      action: 'cancel' | 'reassign' | 'reschedule' | 'mark_resolved';
      resolution?: string;
      target_booking_id?: string;
      new_facility_id?: string;
      new_start_time?: string;
      new_end_time?: string;
    }
  ): Promise<{ message: string; conflict: Conflict }> {
    return this.request(`/conflicts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Analytics ---
  public async getDashboardAnalytics(): Promise<{
    metrics: DashboardMetrics;
    utilizationByType: Array<{ type: string; utilization: number; facilitiesCount: number }>;
    demandByType: Array<{ type: string; bookingsCount: number }>;
    peakHours: Array<{ hour: string; bookings: number }>;
    underutilizedFacilities: Array<any>;
    overDemandedFacilities: Array<any>;
    recentDecisions: Array<any>;
    thresholds: any;
  }> {
    return this.request('/analytics/dashboard');
  }

  public async getUtilizationAnalytics(): Promise<{ facilityUtilization: Array<any> }> {
    return this.request('/analytics/utilization');
  }

  public async getDemandAnalytics(): Promise<{ departmentDemand: Array<any> }> {
    return this.request('/analytics/demand');
  }

  // --- Reports ---
  public async getUtilizationReport(params: Record<string, any> = {}): Promise<{
    generatedAt: string;
    totalFacilities: number;
    data: Array<any>;
  }> {
    const qs = new URLSearchParams(params as any).toString();
    return this.request(`/reports/utilization${qs ? `?${qs}` : ''}`);
  }

  public async getBookingsReport(params: Record<string, any> = {}): Promise<{
    generatedAt: string;
    totalRecords: number;
    data: Array<any>;
  }> {
    const qs = new URLSearchParams(params as any).toString();
    return this.request(`/reports/bookings${qs ? `?${qs}` : ''}`);
  }

  public async getConflictsReport(): Promise<{
    generatedAt: string;
    totalConflicts: number;
    data: Array<any>;
  }> {
    return this.request('/reports/conflicts');
  }

  // --- Settings ---
  public async getSettings(): Promise<{ settings: SystemSettings }> {
    return this.request('/settings');
  }

  public async updateSettings(data: Partial<SystemSettings>): Promise<{ message: string; settings: SystemSettings }> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Users ---
  public async getUsers(): Promise<{ total: number; users: User[] }> {
    return this.request('/users');
  }

  public async updateUserRole(id: string, role: string): Promise<{ user: User }> {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // --- AI Assistant ---
  public async parseAIRequest(prompt: string): Promise<{
    originalPrompt: string;
    structuredParameters: any;
    allocationResult: AllocationResult;
    aiExplanation: string;
  }> {
    return this.request('/ai/parse-request', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // --- Demo & Seed ---
  public async resetDemoData(): Promise<{ message: string }> {
    return this.request('/demo/reset', { method: 'POST' });
  }

  public async getDemoScenario(): Promise<any> {
    return this.request('/demo/scenario');
  }
}

export const api = new ApiService();
