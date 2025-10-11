import React from 'react';
import { Loader2 } from 'lucide-react';

interface WorkshopLoaderProps {
  workshopName?: string;
}

export const WorkshopLoader: React.FC<WorkshopLoaderProps> = ({ workshopName }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {workshopName ? `Loading ${workshopName}...` : 'Loading Workshop...'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Preparing your personalized experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkshopLoader;