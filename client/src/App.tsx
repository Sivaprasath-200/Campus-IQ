import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SmartAllocationPage } from './pages/SmartAllocationPage';
import { FacilityExplorerPage } from './pages/FacilityExplorerPage';
import { FacilityDetailsPage } from './pages/FacilityDetailsPage';
import { CalendarSchedulePage } from './pages/CalendarSchedulePage';
import { BookingManagementPage } from './pages/BookingManagementPage';
import { ConflictCenterPage } from './pages/ConflictCenterPage';
import { UtilizationAnalyticsPage } from './pages/UtilizationAnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { currentPage } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#080c14] text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'smart-allocation' && <SmartAllocationPage />}
      {currentPage === 'facilities' && <FacilityExplorerPage />}
      {currentPage === 'facility-details' && <FacilityDetailsPage />}
      {currentPage === 'calendar' && <CalendarSchedulePage />}
      {currentPage === 'bookings' && <BookingManagementPage />}
      {currentPage === 'conflicts' && <ConflictCenterPage />}
      {currentPage === 'analytics' && <UtilizationAnalyticsPage />}
      {currentPage === 'reports' && <ReportsPage />}
      {currentPage === 'users' && <UsersPage />}
      {currentPage === 'settings' && <SettingsPage />}
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
