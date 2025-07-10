import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

type DemoModeContextType = {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  canUseDemoMode: boolean;
};

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  
  const { data: userData } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email: string | null;
      title: string | null;
      organization: string | null;
      role?: string;
      isTestUser?: boolean;
    }
  }>({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const isTestUser = userData?.user?.isTestUser === true;

  const toggleDemoMode = () => {
    if (!isTestUser) {
      console.warn('Demo mode only available to test users');
      return;
    }
    setIsDemoMode((prev) => !prev);
  };

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, canUseDemoMode: isTestUser }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeContextType {
  const context = useContext(DemoModeContext);
  
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  
  return context;
}