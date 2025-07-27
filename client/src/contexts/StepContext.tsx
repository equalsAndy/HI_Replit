import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StepContextType {
  currentStepId: string | null;
  setCurrentStepId: (stepId: string) => void;
}

const StepContext = createContext<StepContextType | undefined>(undefined);

interface StepProviderProps {
  children: ReactNode;
}

export const StepProvider: React.FC<StepProviderProps> = ({ children }) => {
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

  return (
    <StepContext.Provider value={{ currentStepId, setCurrentStepId }}>
      {children}
    </StepContext.Provider>
  );
};

export const useStepContext = () => {
  const context = useContext(StepContext);
  if (context === undefined) {
    throw new Error('useStepContext must be used within a StepProvider');
  }
  return context;
};

// Hook that safely handles cases where StepProvider might not be available
export const useStepContextSafe = () => {
  const context = useContext(StepContext);
  return context || { currentStepId: null, setCurrentStepId: () => {} };
};