import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import StarCard from '../starcard/StarCard';
import { useQuery } from '@tanstack/react-query';
import { getAttributeColor, CARD_WIDTH, CARD_HEIGHT, QUADRANT_COLORS } from '@/components/starcard/starCardConstants';

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

  // Use the same direct fetch approach that's working successfully
  const [user, setUser] = React.useState<any>(null);
  const [starCard, setStarCard] = React.useState<any>(null);
  const [flowAttributesData, setFlowAttributesData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch('/api/user/profile', { credentials: 'include' });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Fetch starcard data using the same approach that's working
        const starCardResponse = await fetch('/api/starcard', { credentials: 'include' });
        if (starCardResponse.ok) {
          const starCardData = await starCardResponse.json();
          console.log('YourStarCardView - Fetched StarCard data:', starCardData);
          setStarCard(starCardData);
        }

        // Fetch flow attributes
        const flowResponse = await fetch('/api/flow-attributes', { credentials: 'include' });
        if (flowResponse.ok) {
          const flowData = await flowResponse.json();
          setFlowAttributesData(flowData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    console.log('Download button clicked');
    if (!starCardRef.current) {
      console.log('StarCard ref not found');
      return;
    }

    try {
      console.log('Starting star card download...');
      
      // Use the utility function for consistent configuration
      const { downloadElementAsImage } = await import('@/lib/html2canvas');
      await downloadElementAsImage(starCardRef.current, 'your-star-card.png');
      
      console.log('Download completed successfully');
      markStepCompleted('5-1');
    } catch (error) {
      console.error('Error generating star card image:', error);
      alert('Download failed. Please try right-clicking on your star card and selecting "Save as Image"');
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
          {isLoading ? (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
              <p>Loading your StarCard data...</p>
            </div>
          ) : user?.user && starCard?.success ? (
            <div ref={starCardRef} className="w-full max-w-md">
              <StarCard 
                profile={{
                  name: user.user.name || 'Your Name',
                  title: user.user.jobTitle || user.user.title || '',
                  organization: user.user.organization || ''
                }}
                quadrantData={{
                  thinking: starCard.thinking || 0,
                  acting: starCard.acting || 0,
                  feeling: starCard.feeling || 0,
                  planning: starCard.planning || 0
                }}
                flowAttributes={
                  (flowAttributesData?.attributes && Array.isArray(flowAttributesData.attributes) && flowAttributesData.attributes.length > 0) ? 
                    // Map server data to expected format - same as flow attributes page
                    flowAttributesData.attributes.map((attr: { name: string }) => {
                      if (!attr || !attr.name) {
                        return { text: "", color: "rgb(156, 163, 175)" }; // Default gray
                      }
                      return {
                        text: attr.name,
                        color: getAttributeColor(attr.name)
                      };
                    }) : 
                    // Default to empty array
                    []
                }
                downloadable={false}
                preview={false}
              />
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
              <p className="text-amber-700 font-medium">StarCard not available</p>
              <p className="text-sm text-gray-600 mt-2">
                You need to complete the strengths assessment first.
              </p>
            </div>
          )}
          
          {user?.user && starCard?.success && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Your Star Card
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default YourStarCardView;