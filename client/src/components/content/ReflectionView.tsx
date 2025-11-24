import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { useTestUser } from '@/hooks/useTestUser';
import { validateAtLeastOneField } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';
import { ContentViewProps } from '@/shared/types';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

const ReflectionView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const { shouldShowDemoButtons } = useTestUser();
  const { completed: workshopLocked, loading: workshopLoading, isWorkshopLocked } = useWorkshopStatus();

  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  const handleDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }

    const fillWithDemoData = document.getElementById('fillDemoDataButton');
    if (fillWithDemoData) {
      fillWithDemoData.click();
    }
  };

  return (
    <>
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="blue"
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reflect on Your Strengths</h1>

      <StepByStepReflection 
        starCard={starCard}
        setCurrentContent={setCurrentContent}
        markStepCompleted={markStepCompleted}
        workshopLocked={workshopLocked}
      />

      
    </>
  );
};

export default ReflectionView;