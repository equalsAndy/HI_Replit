import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useTestUser } from '@/hooks/useTestUser';

type DemoModeContextType = {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  canUseDemoMode: boolean;
};

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const isTestUser = useTestUser();

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