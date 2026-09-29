import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Facility } from '../types';
import {
  Search,
  Building2,
  Users,
  Grid,
  List,
  ArrowRight,
} from 'lucide-react';

const ALL_TYPES: string[] = [
  'All',
  'Computer Lab',
  'Classroom',
  'Electronics Lab',
  'Physics Lab',
  'Chemistry Lab',
  'Seminar Hall',
  'Auditorium',
  'Meeting Room',
  'Project Room',
  'Sports Facility',
];

export const FacilityExplorerPage: React.FC = () => {
  const { openFacilityDetails, refreshTrigger } = useApp();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [minCapacity, setMinCapacity] = useState<number | ''>('');
  const [selectedBuilding, setSelectedBuilding] = useState('All');

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const res = await api.getFacilities({
          search: search || undefined,
          type: selectedType !== 'All' ? selectedType : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          minCapacity: minCapacity || undefined,
          building: selectedBuilding !== 'All' ? selectedBuilding : undefined,
        });
        setFacilities(res.facilities);
      } catch (err) {
        console.error('Failed to load facilities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [search, selectedType, selectedStatus, minCapacity, selectedBuilding, refreshTrigger]);

  const buildings = Array.from(new Set(facilities.map((f) => f.building)));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#D7D7D5]">
        <div>
          <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
            Campus Infrastructure Directory
          </span>
          <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
            Facility Explorer
          </h1>
          <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
            Browse, filter, and inspect specifications across {facilities.length} university spaces.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#D7D7D5] rounded-[10px] shadow-sm">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'cards' ? 'bg-[#F7F7F5] text-[#30383D] font-bold' : 'text-[#73777A] hover:text-[#30383D]'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'table' ? 'bg-[#F7F7F5] text-[#30383D] font-bold' : 'text-[#73777A] hover:text-[#30383D]'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#73777A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue, room, block..."
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] pl-10 pr-3 py-2 text-xs text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
          >
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Facility Types' : t}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>

        {/* Min Capacity */}
        <div>
          <input
            type="number"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value ? Number(e.target.value) : '')}
            placeholder="Min Capacity (seats)"
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white"
          />
        </div>

        {/* Building Filter */}
        <div>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
          >
            <option value="All">All Buildings</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Rendering: Cards or Table */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((f) => {
            const isAvailable = f.status === 'AVAILABLE';
            const isOccupied = f.status === 'OCCUPIED';

            return (
              <div
                key={f.id}
                onClick={() => openFacilityDetails(f.id)}
                className="p-6 rounded-[16px] bg-white border border-[#D7D7D5] hover:border-[#9CA3AF] cursor-pointer transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOccupied
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-[#F7F7F5] text-[#73777A] border border-[#D7D7D5]'
                      }`}
                    >
                      {f.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#30383D]">
                      {f.current_utilization || 50}% Load
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#30383D] group-hover:underline transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-xs text-[#73777A] mt-1 font-sans">
                    {f.building} • Floor {f.floor} • Room {f.room_number}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-xs text-[#30383D] font-sans">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#73777A]" />
                      <strong>{f.capacity}</strong> seats
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#73777A]" />
                      {f.type}
                    </span>
                  </div>

                  {/* Equipment Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(f.equipment || []).slice(0, 3).map((eq) => (
                      <span
                        key={eq}
                        className="px-2 py-0.5 rounded-[6px] bg-[#F7F7F5] text-[#73777A] text-[10px] border border-[#D7D7D5]"
                      >
                        {eq}
                      </span>
                    ))}
                    {(f.equipment || []).length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-[6px] bg-[#F7F7F5] text-[#9CA3AF] text-[10px]">
                        +{(f.equipment || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#D7D7D5] flex items-center justify-between text-xs text-[#30383D] font-medium group-hover:translate-x-0.5 transition-transform">
                  <span>View Details & Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="rounded-[16px] bg-white border border-[#D7D7D5] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#30383D]">
              <thead className="bg-[#F7F7F5] text-[#73777A] font-semibold uppercase tracking-wider text-[11px] border-b border-[#D7D7D5]">
                <tr>
                  <th className="p-4">Facility Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Building & Room</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Utilization</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7D7D5]/60 font-medium font-sans">
                {facilities.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => openFacilityDetails(f.id)}
                    className="hover:bg-[#F7F7F5] cursor-pointer transition"
                  >
                    <td className="p-4 font-serif font-bold text-[#30383D] text-sm">{f.name}</td>
                    <td className="p-4 text-[#73777A]">{f.type}</td>
                    <td className="p-4 font-mono">{f.capacity} seats</td>
                    <td className="p-4 text-[#73777A]">
                      {f.building} ({f.room_number})
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : f.status === 'OCCUPIED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-[#F7F7F5] text-[#73777A] border border-[#D7D7D5]'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#30383D]">
                      {f.current_utilization || 50}%
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-[#30383D] hover:underline font-semibold">Inspect →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
