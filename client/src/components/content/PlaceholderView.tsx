import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';

interface PlaceholderViewProps extends ContentViewProps {
  title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  navigate,
  markStepCompleted
}) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
        <p className="text-lg text-blue-800">
          This content is coming soon! This is a placeholder for the {title.toLowerCase()} page.
        </p>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button 
          onClick={() => navigate('/user-home')}
          variant="outline"
          className="bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default PlaceholderView;