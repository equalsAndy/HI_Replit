import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';

const ReflectionView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const isTestUser = useTestUser();

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
      />
    </>
  );
};

export default ReflectionView;