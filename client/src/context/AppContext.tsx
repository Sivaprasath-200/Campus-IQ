import React, { createContext, useContext, useState } from 'react';

export type ActivePage =
  | 'dashboard'
  | 'smart-allocation'
  | 'facilities'
  | 'facility-details'
  | 'calendar'
  | 'bookings'
  | 'conflicts'
  | 'analytics'
  | 'reports'
  | 'users'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  currentPage: ActivePage;
  setCurrentPage: (page: ActivePage) => void;
  selectedFacilityId: string | null;
  openFacilityDetails: (facilityId: string) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<ActivePage>('dashboard');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openFacilityDetails = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setCurrentPage('facility-details');
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedFacilityId,
        openFacilityDetails,
        toasts,
        addToast,
        removeToast,
        isAiModalOpen,
        setIsAiModalOpen,
        isDemoModalOpen,
        setIsDemoModalOpen,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
