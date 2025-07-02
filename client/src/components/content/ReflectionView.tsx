import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Lock, Unlock } from 'lucide-react';
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
  const { completed: workshopLocked, loading: workshopLoading, testCompleteWorkshop, isWorkshopLocked } = useWorkshopStatus();

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

      {/* Workshop Locking Test Section - Debug */}
      {console.log('🧪 ReflectionView Debug:', { isTestUser, workshopLocked, workshopLoading })}
      
      {isTestUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-800 font-medium mb-3 flex items-center">
            🧪 Workshop Locking Test (DEBUG: isTestUser={isTestUser.toString()})
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700">
                Workshop Status: {workshopLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
              </span>
              <Button
                onClick={() => {
                  console.log('🔘 Test button clicked!');
                  testCompleteWorkshop();
                }}
                variant="outline"
                size="sm"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                {workshopLocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Test {workshopLocked ? 'Unlock' : 'Lock'} Workshop
              </Button>
            </div>
            {workshopLocked && (
              <div className="bg-red-100 border border-red-300 p-3 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  🚫 Workshop Locked - Responses Cannot Be Modified
                </p>
                <p className="text-xs text-red-600 mt-1">
                  This message would appear when users try to edit completed workshops.
                  Input fields would be disabled and save operations would be blocked.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback test button if above doesn't work */}
      {!isTestUser && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">
            🚫 Test button not visible because isTestUser = {isTestUser ? 'true' : 'false'}
          </p>
        </div>
      )}

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
              // Validate at least one reflection field is completed
              const validation = validateAtLeastOneField(reflections, 10);
              if (!validation.isValid) {
                setValidationError('Please complete at least one reflection to continue.');
                return;
              }

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