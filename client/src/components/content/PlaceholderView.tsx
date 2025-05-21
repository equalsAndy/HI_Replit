import React from 'react';
import { ContentViewProps } from '../../shared/types';
import { AlertCircle } from 'lucide-react';

interface PlaceholderViewProps extends ContentViewProps {
  title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-8 max-w-2xl w-full text-center">
        <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {title} Content
        </h1>
        <p className="text-gray-600 mb-2">
          This section is under development.
        </p>
        <p className="text-gray-500 text-sm">
          Please check back later for the complete content.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderView;