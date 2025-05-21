import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';
import { FileText } from 'lucide-react';

const ReflectionView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reflect on Your Strengths</h1>
      
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            const fillWithDemoData = document.getElementById('fillDemoDataButton');
            if (fillWithDemoData) {
              fillWithDemoData.click();
            }
          }}
          variant="outline"
          className="bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          <FileText className="h-4 w-4 mr-2" />
          Demo Data
        </Button>
      </div>
      
      <StepByStepReflection starCard={starCard} />
    </>
  );
};

export default ReflectionView;