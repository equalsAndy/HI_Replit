import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';

const ReflectionView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const isTestUser = useTestUser();
  const { completed, loading, isWorkshopLocked, testCompleteWorkshop } = useWorkshopStatus();

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
      {/* TEMPORARY TEST BUTTON - Remove after testing */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, background: 'red', color: 'white', padding: '10px', cursor: 'pointer' }}>
        <div>Workshop Status: {completed ? '🔒 LOCKED' : '🔓 UNLOCKED'}</div>
        <button onClick={testCompleteWorkshop} style={{ marginTop: '5px', padding: '5px' }}>
          Test Lock Workshop
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reflect on Your Strengths</h1>
      
      <StepByStepReflection 
        starCard={starCard}
        setCurrentContent={setCurrentContent}
        markStepCompleted={markStepCompleted}
      />
    </>
  );
};

export default ReflectionView;