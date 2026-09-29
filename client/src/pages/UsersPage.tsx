import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { ShieldCheck, Briefcase, GraduationCap, Search } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { addToast } = useApp();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.getUsers();
        setUsers(res.users);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as UserRole } : u))
      );
      addToast('success', 'Role Updated', `User role modified to ${newRole}.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-[#D7D7D5]">
        <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
          Identity & Access Directory
        </span>
        <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
          User Management
        </h1>
        <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
          Role-based access control, departmental assignments, and reservation quotas.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-5 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#73777A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] pl-10 pr-3 py-2 text-xs text-[#30383D] placeholder-[#9CA3AF] focus:outline-none focus:border-[#30383D] focus:bg-white"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#D7D7D5] rounded-[10px] px-3 py-2 text-xs text-[#30383D] focus:outline-none focus:border-[#30383D] focus:bg-white"
          >
            <option value="All">All Roles</option>
            <option value="ADMIN">Administrators</option>
            <option value="FACULTY">Faculty Members</option>
            <option value="STUDENT">Students</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-[16px] bg-white border border-[#D7D7D5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#30383D]">
            <thead className="bg-[#F7F7F5] text-[#73777A] font-semibold uppercase tracking-wider text-[11px] border-b border-[#D7D7D5]">
              <tr>
                <th className="p-4">User Profile</th>
                <th className="p-4">Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Role</th>
                <th className="p-4">Bookings</th>
                {isAdmin && <th className="p-4 text-right">Access Control</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7D7D5]/60 font-medium font-sans">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F7F7F5] transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-[#F7F7F5] border border-[#D7D7D5] flex items-center justify-center font-bold text-[#30383D]">
                      {u.role === 'ADMIN' ? (
                        <ShieldCheck className="w-4 h-4 text-[#30383D]" />
                      ) : u.role === 'FACULTY' ? (
                        <Briefcase className="w-4 h-4 text-[#30383D]" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-[#30383D]" />
                      )}
                    </div>
                    <span className="font-serif font-bold text-sm text-[#30383D]">{u.name}</span>
                  </td>
                  <td className="p-4 font-mono text-[#73777A]">{u.email}</td>
                  <td className="p-4 text-[#30383D]">{u.department}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-[#E5E7EB] text-[#30383D] border border-[#D7D7D5]'
                          : u.role === 'FACULTY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#30383D]">
                    {u.total_bookings || 0} total ({u.active_bookings || 0} active)
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-[#F7F7F5] border border-[#D7D7D5] rounded-[6px] px-2.5 py-1 text-[11px] text-[#30383D] focus:outline-none focus:border-[#30383D]"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="STUDENT">STUDENT</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
