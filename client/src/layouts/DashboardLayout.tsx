import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp, ActivePage } from '../context/AppContext';
import { ToastContainer } from '../components/ToastContainer';
import { AIAssistantModal } from '../components/AIAssistantModal';
import { DemoScenarioModal } from '../components/DemoScenarioModal';
import {
  LayoutDashboard,
  BrainCircuit,
  Building2,
  Calendar,
  Layers,
  AlertTriangle,
  BarChart3,
  FileText,
  Users,
  Settings,
  Sparkles,
  Play,
  LogOut,
  Menu,
  X,
  Clock,
  ShieldCheck,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const {
    currentPage,
    setCurrentPage,
    setIsAiModalOpen,
    setIsDemoModalOpen,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: Array<{ id: ActivePage; label: string; icon: any; adminOnly?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'smart-allocation', label: 'Smart Allocation', icon: BrainCircuit },
    { id: 'facilities', label: 'Facility Explorer', icon: Building2 },
    { id: 'calendar', label: 'Calendar / Schedule', icon: Calendar },
    { id: 'bookings', label: 'Booking Management', icon: Layers },
    { id: 'conflicts', label: 'Conflict Center', icon: AlertTriangle },
    { id: 'analytics', label: 'Utilization Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'users', label: 'Users', icon: Users, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
  ];

  const filteredNav = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-[#F7F7F5] text-[#30383D] overflow-hidden font-sans">
      {/* =========================================
          SIDEBAR
          ========================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#D7D7D5] flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#D7D7D5] flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setCurrentPage('dashboard');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-[12px] bg-[#30383D] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5 text-[#F7F7F5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-[#30383D]">
                  CampusIQ
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold bg-[#E5E7EB] text-[#30383D] border border-[#D7D7D5]">
                  AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-[#73777A] font-medium">
                Tailored Campus Spaces
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-[#73777A] hover:text-[#30383D] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presentation Demo Banner */}
        <div className="p-4 mx-4 my-3 rounded-[14px] bg-[#F7F7F5] border border-[#D7D7D5]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#30383D]">
              Judges Mode
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[12px] text-[#73777A] leading-relaxed mb-3">
            Automated test of smart allocation and conflict mitigation.
          </p>
          <button
            onClick={() => {
              setIsDemoModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full py-2 px-3 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Hackathon Demo</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#E5E7EB]/70 text-[#30383D] border border-[#D7D7D5]'
                    : 'text-[#73777A] hover:text-[#30383D] hover:bg-[#F7F7F5]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#30383D]' : 'text-[#73777A] group-hover:text-[#30383D]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-[#D7D7D5] bg-[#F7F7F5]/60">
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-white border border-[#D7D7D5]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[8px] bg-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#30383D] shrink-0">
                {user?.role === 'ADMIN' ? (
                  <ShieldCheck className="w-4 h-4 text-[#30383D]" />
                ) : user?.role === 'FACULTY' ? (
                  <Briefcase className="w-4 h-4 text-[#30383D]" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-[#30383D]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#30383D] truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-[#73777A] truncate">
                  {user?.role} • {user?.department}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-[#73777A] hover:text-rose-600 hover:bg-[#E5E7EB] transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================
          MAIN VIEWPORT & TOPBAR
          ========================================= */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 overflow-hidden">
        {/* Top Command Bar */}
        <header className="h-16 bg-white/90 border-b border-[#D7D7D5] backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#73777A] hover:text-[#30383D] p-2 rounded-lg hover:bg-[#F7F7F5]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-sans text-[#73777A] bg-[#F7F7F5] px-3.5 py-1.5 rounded-[10px] border border-[#D7D7D5]">
              <Clock className="w-3.5 h-3.5 text-[#30383D]" />
              <span className="font-mono">{timeStr || '12:00:00 PM'}</span>
              <span className="text-[#D7D7D5]">|</span>
              <span className="text-emerald-700 font-medium">Campus Network Active</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white hover:bg-[#F7F7F5] text-[#30383D] border border-[#D7D7D5] text-xs font-medium transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#30383D]" />
              <span className="hidden sm:inline">AI Natural Request</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Smart Allocate Button */}
            <button
              onClick={() => setCurrentPage('smart-allocation')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white text-xs font-semibold shadow-sm transition"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Smart Allocate</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 bg-[#F7F7F5]">
          {children}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <AIAssistantModal />
      <DemoScenarioModal />
    </div>
  );
};
