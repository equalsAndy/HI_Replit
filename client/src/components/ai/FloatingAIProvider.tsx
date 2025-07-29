import React, { createContext, useContext, useState, useEffect } from 'react';
import FloatingAITrigger from './FloatingAITrigger';

interface AIContext {
  stepName?: string;
  strengthLabel?: string;
  questionText?: string;
  aiEnabled?: boolean;
}

interface FloatingAIContextType {
  currentStep: string;
  workshopType: 'ast' | 'ia';
  context: AIContext;
  updateContext: (newContext: Partial<AIContext>) => void;
  setCurrentStep: (step: string) => void;
  setWorkshopType: (type: 'ast' | 'ia') => void;
}

const FloatingAIContext = createContext<FloatingAIContextType | undefined>(undefined);

export const useFloatingAI = () => {
  const context = useContext(FloatingAIContext);
  if (!context) {
    throw new Error('useFloatingAI must be used within FloatingAIProvider');
  }
  return context;
};

interface FloatingAIProviderProps {
  children: React.ReactNode;
  initialStep?: string;
  initialWorkshopType?: 'ast' | 'ia';
}

export const FloatingAIProvider: React.FC<FloatingAIProviderProps> = ({
  children,
  initialStep = '1-1',
  initialWorkshopType = 'ast'
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [workshopType, setWorkshopType] = useState<'ast' | 'ia'>(initialWorkshopType);
  const [context, setContext] = useState<AIContext>({
    aiEnabled: true
  });

  const updateContext = (newContext: Partial<AIContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  };

  // Memoize the trigger visibility check to prevent infinite loops
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [shouldShowTrigger, setShouldShowTrigger] = useState(true);

  // Update path when location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for navigation changes
    window.addEventListener('popstate', handleLocationChange);
    
    // For React Router, we might need to listen for route changes differently
    // but this will catch browser back/forward navigation
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Check if we should show the floating trigger on this route
  useEffect(() => {
    // Hide on specific admin and auth pages only
    if (currentPath.includes('/admin') || 
        currentPath.includes('/login') ||
        currentPath.includes('/register')) {
      setShouldShowTrigger(false);
    } else {
      // Show on all other pages including workshop pages, landing, etc.
      setShouldShowTrigger(true);
    }
  }, [currentPath]);

  const contextValue: FloatingAIContextType = {
    currentStep,
    workshopType,
    context,
    updateContext,
    setCurrentStep,
    setWorkshopType
  };

  return (
    <FloatingAIContext.Provider value={contextValue}>
      {children}
      {shouldShowTrigger && (
        <FloatingAITrigger
          currentStep={currentStep}
          workshopType={workshopType}
          aiEnabled={context.aiEnabled}
          context={context}
        />
      )}
    </FloatingAIContext.Provider>
  );
};

export default FloatingAIProvider;