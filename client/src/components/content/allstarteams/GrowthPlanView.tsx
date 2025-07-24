import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GrowthPlanViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function GrowthPlanView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: GrowthPlanViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">
            Growth Plan View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              Component Under Reconstruction
            </h2>
            <p className="text-blue-700 mb-4">
              This component is being rebuilt with improved functionality and will be available soon.
            </p>
            <p className="text-sm text-blue-600">
              The Growth Plan features are temporarily unavailable while we enhance the user experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}