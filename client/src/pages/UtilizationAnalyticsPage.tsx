import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const UtilizationAnalyticsPage: React.FC = () => {
  const { openFacilityDetails, setCurrentPage, refreshTrigger } = useApp();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [demandData, setDemandData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, demRes] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getDemandAnalytics(),
        ]);
        setDashboardData(dashRes);
        setDemandData(demRes.departmentDemand);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const underutilized = dashboardData?.underutilizedFacilities || [];
  const overDemanded = dashboardData?.overDemandedFacilities || [];
  const utilizationByType = dashboardData?.utilizationByType || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Predictive Space Metrics
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Utilization & Demand
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
            Data-driven intelligence on campus space distribution, load balances, and bottleneck diagnosis.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('settings')}
          className="px-4 py-2 rounded-[10px] bg-white border border-[#D7D7D5] text-xs font-semibold text-[#30383D] hover:bg-[#F7F7F5] shadow-sm transition"
        >
          Configure Thresholds →
        </button>
      </div>

      {/* Threshold Status Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-[14px] bg-white border border-[#D7D7D5] shadow-sm">
          <span className="text-[#73777A] block text-[10px] uppercase tracking-wider font-semibold">
            Underutilized (&lt;40%)
          </span>
          <strong className="font-serif text-2xl text-[#30383D] block mt-1">
            {underutilized.length} facilities
          </strong>
        </div>
        <div className="p-5 rounded-[14px] bg-white border border-[#D7D7D5] shadow-sm">
          <span className="text-[#73777A] block text-[10px] uppercase tracking-wider font-semibold">
            Healthy Target (40% - 80%)
          </span>
          <strong className="font-serif text-2xl text-emerald-700 block mt-1">38 facilities</strong>
        </div>
        <div className="p-5 rounded-[14px] bg-white border border-[#D7D7D5] shadow-sm">
          <span className="text-[#73777A] block text-[10px] uppercase tracking-wider font-semibold">
            High Load (80% - 90%)
          </span>
          <strong className="font-serif text-2xl text-[#30383D] block mt-1">8 facilities</strong>
        </div>
        <div className="p-5 rounded-[14px] bg-white border border-[#D7D7D5] shadow-sm">
          <span className="text-[#73777A] block text-[10px] uppercase tracking-wider font-semibold">
            Over-Demanded (&gt;90%)
          </span>
          <strong className="font-serif text-2xl text-rose-700 block mt-1">
            {overDemanded.length} facilities
          </strong>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#30383D]">Utilization by Facility Category</h3>
          <p className="text-xs text-[#73777A] mt-0.5 mb-4">Booked Available Hours / Total Available Hours × 100</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                <XAxis dataKey="type" stroke="#73777A" fontSize={10} angle={-25} textAnchor="end" tickLine={false} />
                <YAxis stroke="#73777A" fontSize={10} unit="%" domain={[0, 100]} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D7D7D5', borderRadius: '8px', fontSize: '11px', color: '#30383D' }} />
                <Bar dataKey="utilization" fill="#30383D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#30383D]">Department Demand Breakdown</h3>
          <p className="text-xs text-[#73777A] mt-0.5 mb-4">Cumulative bookings generated per engineering department</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                <XAxis dataKey="department" stroke="#73777A" fontSize={10} tickLine={false} />
                <YAxis stroke="#73777A" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #D7D7D5', borderRadius: '8px', fontSize: '11px', color: '#30383D' }} />
                <Bar dataKey="bookingsCount" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Underutilized & Over-Demanded Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#30383D]">Underutilized Facilities (&lt;40%)</h3>
              <p className="text-xs text-[#73777A]">Spaces with lower allocation pressure and suggested actions</p>
            </div>
          </div>

          <div className="space-y-3">
            {underutilized.map((f: any) => (
              <div
                key={f.id}
                onClick={() => openFacilityDetails(f.id)}
                className="p-4 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] hover:border-[#9CA3AF] cursor-pointer transition text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-[#30383D] text-sm">{f.name}</h4>
                  <span className="font-mono font-bold text-[#30383D]">{f.utilization}% Load</span>
                </div>
                <p className="text-[#73777A]">
                  Capacity: {f.capacity} seats • Total Bookings: {f.totalBookings}
                </p>
                <div className="p-2.5 rounded-[8px] bg-white border border-[#D7D7D5] text-[#30383D] text-[11px] leading-relaxed">
                  <strong>Suggested Action:</strong> {f.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#30383D]">Over-Demanded Facilities (&gt;90%)</h3>
              <p className="text-xs text-[#73777A]">High-demand spaces requiring load distribution</p>
            </div>
          </div>

          <div className="space-y-3">
            {overDemanded.map((f: any) => (
              <div
                key={f.id}
                onClick={() => openFacilityDetails(f.id)}
                className="p-4 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] hover:border-[#9CA3AF] cursor-pointer transition text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-[#30383D] text-sm">{f.name}</h4>
                  <span className="font-mono font-bold text-rose-700">{f.utilization}% Load</span>
                </div>
                <p className="text-[#73777A]">
                  Capacity: {f.capacity} seats • Peak Hours: {f.peakHours}
                </p>
                <div className="p-2.5 rounded-[8px] bg-white border border-[#D7D7D5] text-[#30383D] text-[11px] leading-relaxed">
                  <strong>Recommendation:</strong> {f.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
