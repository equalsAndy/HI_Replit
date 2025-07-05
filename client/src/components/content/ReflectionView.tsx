import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { useTestUser } from '@/hooks/useTestUser';
import { validateAtLeastOneField } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';

const ReflectionView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const isTestUser = useTestUser();
  const { completed: workshopLocked, loading: workshopLoading, isWorkshopLocked } = useWorkshopStatus();

  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  const handleDemoData = () => {
    if (!isTestUser) {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reflect on Your Strengths</h1>

      <StepByStepReflection 
        starCard={starCard}
        setCurrentContent={setCurrentContent}
        markStepCompleted={markStepCompleted}
        workshopLocked={workshopLocked}
      />

      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          {isTestUser && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDemoData}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              disabled={workshopLocked}
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Demo Data
            </Button>
          )}
          <Button 
            onClick={() => {
              // Clear validation and proceed
              setValidationError('');
              markStepCompleted('2-4');
              setCurrentContent("intro-to-flow");
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={workshopLocked}
          >
            Next: Intro to Flow <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default ReflectionView;