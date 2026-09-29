import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Building2,
  CheckCircle,
  CalendarDays,
  AlertTriangle,
  Percent,
  Clock,
  TrendingDown,
  TrendingUp,
  BrainCircuit,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { setCurrentPage, openFacilityDetails, refreshTrigger } = useApp();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.getDashboardAnalytics();
        setData(res);

        const todayStr = new Date().toISOString().split('T')[0];
        const bookingsRes = await api.getBookings({ date: todayStr });
        setTodayBookings(bookingsRes.bookings.slice(0, 6));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [refreshTrigger]);

  const metrics = data?.metrics || {
    totalFacilities: 53,
    availableNow: 34,
    todayBookings: 12,
    activeConflicts: 2,
    averageUtilization: 64.8,
    pendingRequests: 4,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Real-Time Campus Operations
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Intelligent Space Allocation
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A] max-w-2xl">
            Autonomous multi-constraint facility scheduling, real-time conflict mitigation, and space utilization analytics tailored for your university.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentPage('smart-allocation')}
            className="px-5 py-2.5 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs flex items-center gap-2 shadow-sm transition"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>New Resource Request</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Total Facilities',
            value: metrics.totalFacilities,
            sub: 'Across 6 buildings',
            icon: Building2,
          },
          {
            label: 'Available Now',
            value: metrics.availableNow,
            sub: 'Ready for use',
            icon: CheckCircle,
          },
          {
            label: "Today's Bookings",
            value: metrics.todayBookings,
            sub: 'Active reservations',
            icon: CalendarDays,
          },
          {
            label: 'Active Conflicts',
            value: metrics.activeConflicts,
            sub: 'Requires review',
            icon: AlertTriangle,
            alert: metrics.activeConflicts > 0,
            onClick: () => setCurrentPage('conflicts'),
          },
          {
            label: 'Utilization',
            value: `${metrics.averageUtilization}%`,
            sub: 'Campus average load',
            icon: Percent,
          },
          {
            label: 'Pending Requests',
            value: metrics.pendingRequests,
            sub: 'Awaiting review',
            icon: Clock,
            onClick: () => setCurrentPage('bookings'),
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.onClick}
              className={`p-5 rounded-[14px] bg-white border border-[#D7D7D5] transition-all shadow-sm ${
                card.onClick ? 'cursor-pointer hover:border-[#9CA3AF] hover:-translate-y-0.5' : ''
              } ${card.alert ? 'border-rose-300 bg-rose-50/50' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon className={`w-4 h-4 ${card.alert ? 'text-rose-600' : 'text-[#30383D]'}`} />
              </div>
              <p className="font-serif text-3xl font-bold text-[#30383D]">{card.value}</p>
              <p className="text-[11px] text-[#73777A] mt-1 font-sans">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facility Utilization by Type */}
        <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#30383D]">
                Facility Utilization by Type
              </h3>
              <p className="text-xs text-[#73777A] mt-0.5">Average scheduled capacity load percentage</p>
            </div>
            <span className="text-xs font-sans text-[#30383D] bg-[#F7F7F5] px-2.5 py-1 rounded-[8px] border border-[#D7D7D5]">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.utilizationByType || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                <XAxis
                  dataKey="type"
                  stroke="#73777A"
                  fontSize={10}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#73777A" fontSize={10} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D7D7D5',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#30383D',
                  }}
                />
                <Bar dataKey="utilization" fill="#30383D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Usage Hours Distribution */}
        <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#30383D]">
                Campus Peak Usage Hours
              </h3>
              <p className="text-xs text-[#73777A] mt-0.5">Concurrent reservations across daytime slots</p>
            </div>
            <span className="text-xs font-sans text-[#30383D] bg-[#F7F7F5] px-2.5 py-1 rounded-[8px] border border-[#D7D7D5]">
              08:00 – 20:00
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.peakHours || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="editorialPeakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                <XAxis dataKey="hour" stroke="#73777A" fontSize={10} tickLine={false} />
                <YAxis stroke="#73777A" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D7D7D5',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#30383D',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#30383D"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#editorialPeakGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row: Today's Schedule & Conflict Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Chronological */}
        <div className="lg:col-span-2 p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#30383D]">Today's Schedule</h3>
              <p className="text-xs text-[#73777A]">Facility sessions and bookings timeline</p>
            </div>
            <button
              onClick={() => setCurrentPage('calendar')}
              className="text-xs text-[#30383D] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayBookings.length > 0 ? (
              todayBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => openFacilityDetails(b.facility_id)}
                  className="p-3.5 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] hover:border-[#9CA3AF] flex items-center justify-between cursor-pointer transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 rounded-[8px] bg-white border border-[#D7D7D5] text-center shrink-0">
                      <span className="block text-xs font-mono font-bold text-[#30383D]">
                        {b.start_time}
                      </span>
                      <span className="text-[10px] text-[#73777A] font-mono">{b.end_time}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#30383D]">
                        {b.facility_name}
                      </h4>
                      <p className="text-xs text-[#73777A] truncate max-w-sm sm:max-w-md">
                        {b.purpose} • <span className="font-medium text-[#30383D]">{b.department}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.status === 'CONFLICT'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#73777A] py-8 text-center">No bookings scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Conflict Alerts & Insights */}
        <div className="space-y-6">
          {/* Active Conflicts Widget */}
          <div className="p-6 rounded-[16px] bg-[#FEF2F2] border border-[#FECACA] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-serif text-base font-bold text-rose-950">Active Conflicts</h3>
              </div>
              <button
                onClick={() => setCurrentPage('conflicts')}
                className="text-[11px] font-bold text-rose-700 hover:underline"
              >
                Resolve All →
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-[10px] bg-white border border-[#FECACA]">
                <span className="font-bold text-rose-900 block font-serif">Seminar Hall 1 (Double Booking)</span>
                <p className="text-[11px] text-[#73777A] mt-0.5">
                  14:00 – 15:00 collision between CSE Symposium and ECE Seminar.
                </p>
              </div>
              <div className="p-3 rounded-[10px] bg-white border border-[#FECACA]">
                <span className="font-bold text-amber-900 block font-serif">Conference Room C (Overlap)</span>
                <p className="text-[11px] text-[#73777A] mt-0.5">
                  11:30 – 12:30 overlapping between MBA Board & EEE Committee.
                </p>
              </div>
            </div>
          </div>

          {/* Underutilized & Over-demanded Highlights */}
          <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm space-y-3">
            <h3 className="font-serif text-base font-bold text-[#30383D]">
              Optimization Insights
            </h3>

            {/* Underutilized */}
            <div className="p-3 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-700 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Underutilized:</span>
                </span>
                <span className="font-mono text-xs text-[#30383D] font-bold">23% Load</span>
              </div>
              <p className="text-xs font-serif font-bold text-[#30383D] mt-1">Meeting Room B (Faculty Lounge)</p>
              <p className="text-[11px] text-[#73777A] mt-0.5">
                Suggested Action: Allocate to student project teams during low-demand periods.
              </p>
            </div>

            {/* Over-demanded */}
            <div className="p-3 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Over-Demanded:</span>
                </span>
                <span className="font-mono text-xs text-[#30383D] font-bold">93% Load</span>
              </div>
              <p className="text-xs font-serif font-bold text-[#30383D] mt-1">Computer Lab 2 (Data Science Cluster)</p>
              <p className="text-[11px] text-[#73777A] mt-0.5">
                Suggested Action: Re-route incoming requests to Computer Lab 3 & 4.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
