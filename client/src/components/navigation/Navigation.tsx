import React from 'react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import MobileNavigation from './MobileNavigation';
import NavigationHeader from './NavigationHeader';

interface NavigationProps {
  stepId: string;
  children: React.ReactNode;
}

export default function Navigation({ stepId, children }: NavigationProps) {
  const { canAccessStep } = useNavigationProgress();
  
  // If step is locked, show access denied
  if (!canAccessStep(stepId)) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-yellow-50 border border-yellow-300 rounded-md p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">Previous steps required</h2>
            <p className="text-yellow-700 mb-4">
              Please complete the previous steps in the learning journey before accessing this content.
            </p>
            <MobileNavigation currentStepId={stepId} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader stepId={stepId} />
      
      <main className="pt-24 pb-16 px-4">
        <div className="flex items-start gap-6">
          <div className="hidden lg:block lg:w-64 sticky top-24">
            {/* Desktop side navigation would go here if needed */}
          </div>
          
          <div className="flex-1 max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <MobileNavigation currentStepId={stepId} />
            </div>
            
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}