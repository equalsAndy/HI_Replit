import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Download, Play } from 'lucide-react';

interface WorkshopResourcesViewProps {
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
}

const WorkshopResourcesView: React.FC<WorkshopResourcesViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const handleComplete = () => {
    if (markStepCompleted) {
      markStepCompleted('6-1');
    }
    if (navigate) {
      navigate('/user-home');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          More on This Workshop Page Content
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          The AllStarTeams Workshop is more than a one-time experience — it's a foundational system 
          for personal and collective growth.
        </p>
      </div>

      {/* Introduction */}
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          After completing the micro course, and before you enter your team session, you can explore this 
          in-depth resource to deepen your understanding of the full workshop arc.
        </p>
      </div>

      {/* What You'll Find Here */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          What You'll Find Here:
        </h2>

        {/* AllStarTeams Compendium */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900">
            The AllStarTeams Compendium
          </h3>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            This comprehensive guide unpacks the full methodology behind your experience — from the 
            science of flow and imagination to the psychology of team synergy and future visioning. It 
            includes the complete framework, research base, tools, and long-term applications for leaders, 
            coaches, and team members alike.
          </p>
          
          {/* PDF Download Button */}
          <div className="pt-2">
            <a 
              href="attached_assets/AST_WORKSHOP_COMPENDIUM_2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </div>
        </div>

        {/* Workshop Insights Video */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900">
            Workshop Insights Video
          </h3>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            This short video gives you a behind-the-scenes look at the workshop's purpose, structure, and 
            neuroscience. It explains how your personal growth connects to team and organizational 
            transformation — and why imagination is a key capability for thriving in the age of AI.
          </p>
          
          {/* Video Embed - Larger and More Responsive */}
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 max-w-4xl mx-auto">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/kKarUFyDsf8?rel=0"
              title="Workshop Insights Video"
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
            />
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex justify-center sm:justify-end pt-6 sm:pt-8">
        <Button 
          onClick={handleComplete}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
          size="lg"
        >
          <span className="text-sm sm:text-base">
            Complete Workshop Resources
          </span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WorkshopResourcesView;