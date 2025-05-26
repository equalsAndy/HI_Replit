import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import StarCard from '../starcard/StarCard';
import html2canvas from 'html2canvas';

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

const YourStarCardView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const starCardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!starCardRef.current) return;

    try {
      // Create canvas from the star card element
      const canvas = await html2canvas(starCardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: starCardRef.current.offsetWidth,
        height: starCardRef.current.offsetHeight,
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'my-star-card.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

      // Mark completion and unlock resources
      markStepCompleted('5-1');
    } catch (error) {
      console.error('Error generating star card image:', error);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Star Card</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Congratulations!</h2>
            <p className="text-green-700 mb-4">
              You've completed your personal discovery journey. Your Star Card captures 
              the essence of your unique strengths, flow attributes, and future vision.
            </p>
            <p className="text-green-700 mb-4">
              This card represents your authentic self and serves as a powerful tool for:
            </p>
            <ul className="list-disc list-inside text-green-700 space-y-2">
              <li>Team introductions and collaboration</li>
              <li>Personal reflection and growth planning</li>
              <li>Coaching conversations and development</li>
              <li>Building stronger workplace relationships</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Next Steps</h3>
            <p className="text-blue-700 mb-3">
              Download your Star Card and keep it handy for future reference. 
              You can also explore the Resources section for additional tools and insights.
            </p>
            <p className="text-blue-700">
              Your workshop journey continues with team exercises where you'll use 
              these insights to build stronger collaborative relationships.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div ref={starCardRef} className="w-full max-w-md">
            <StarCard 
              downloadable={false}
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Your Star Card
          </Button>
        </div>
      </div>
    </>
  );
};

export default YourStarCardView;