import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CompletedUser {
  id: number;
  username: string;
  name: string;
  email: string;
  ast_completed_at: string;
  created_at: string;
}

interface ReportTaliaContextType {
  selectedUserId: number | null;
  selectedUser: CompletedUser | null;
  completedUsers: CompletedUser[];
  setSelectedUserId: (userId: number | null) => void;
  setSelectedUser: (user: CompletedUser | null) => void;
  setCompletedUsers: (users: CompletedUser[]) => void;
  isAdminContext: boolean;
  setIsAdminContext: (isAdmin: boolean) => void;
  selectedPersona: string;
  setSelectedPersona: (persona: string) => void;
}

const ReportTaliaContext = createContext<ReportTaliaContextType | undefined>(undefined);

export const useReportTaliaContext = () => {
  const context = useContext(ReportTaliaContext);
  if (context === undefined) {
    throw new Error('useReportTaliaContext must be used within a ReportTaliaProvider');
  }
  return context;
};

// Safe version that returns null if context is not available
export const useReportTaliaContextSafe = () => {
  const context = useContext(ReportTaliaContext);
  return context || null;
};

interface ReportTaliaProviderProps {
  children: ReactNode;
}

export const ReportTaliaProvider: React.FC<ReportTaliaProviderProps> = ({ children }) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<CompletedUser | null>(null);
  const [completedUsers, setCompletedUsers] = useState<CompletedUser[]>([]);
  const [isAdminContext, setIsAdminContext] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>('star_report');

  // Update selected user when userId changes
  const handleSetSelectedUserId = (userId: number | null) => {
    setSelectedUserId(userId);
    if (userId && completedUsers.length > 0) {
      const user = completedUsers.find(u => u.id === userId);
      setSelectedUser(user || null);
    } else {
      setSelectedUser(null);
    }
  };

  const value: ReportTaliaContextType = {
    selectedUserId,
    selectedUser,
    completedUsers,
    setSelectedUserId: handleSetSelectedUserId,
    setSelectedUser,
    setCompletedUsers,
    isAdminContext,
    setIsAdminContext,
    selectedPersona,
    setSelectedPersona,
  };

  return (
    <ReportTaliaContext.Provider value={value}>
      {children}
    </ReportTaliaContext.Provider>
  );
};