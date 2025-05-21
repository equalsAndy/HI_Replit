import React from 'react';
import { ContentViewProps } from '../../shared/types';
import { AlertCircle, Book, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderViewProps extends ContentViewProps {
  title: string;
  description?: string;
  nextContentKey?: string;
  nextLabel?: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  description,
  nextContentKey,
  nextLabel,
  setCurrentContent,
  markStepCompleted
}) => {
  // Handle navigation to next content
  const handleNext = () => {
    if (nextContentKey && setCurrentContent) {
      setCurrentContent(nextContentKey);
      
      // Find the step ID based on the content key (would need proper implementation)
      // For now, just showing the concept
      const stepId = '1-1'; // This would be dynamically determined
      if (markStepCompleted) {
        markStepCompleted(stepId);
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      
      {description ? (
        <div className="prose max-w-none mb-8">
          <p className="text-lg text-gray-700">{description}</p>
          
          {/* Sample content - would be replaced with actual content */}
          <Card className="my-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Book className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Key Concepts</h3>
                  <p className="text-gray-700">
                    This section would contain the detailed content, videos, interactive elements, 
                    and other learning materials related to {title}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sample iframe for video content */}
          <div className="aspect-w-16 aspect-h-9 mb-8">
            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Video or interactive content would appear here</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-8 max-w-2xl w-full text-center">
          <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {title} Content
          </h2>
          <p className="text-gray-600 mb-2">
            This section is under development.
          </p>
          <p className="text-gray-500 text-sm">
            Please check back later for the complete content.
          </p>
        </div>
      )}
      
      {/* Next button - conditional based on nextContentKey */}
      {nextContentKey && nextLabel && (
        <div className="mt-auto flex justify-end pt-4">
          <Button 
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            size="lg"
          >
            {nextLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlaceholderView;