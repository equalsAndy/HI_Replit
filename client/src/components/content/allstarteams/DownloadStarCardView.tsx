
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import StarCard from '@/components/starcard/StarCard';
import { getAttributeColor, CARD_WIDTH, CARD_HEIGHT, QUADRANT_COLORS } from '@/components/starcard/starCardConstants';

interface DownloadStarCardViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function DownloadStarCardView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: DownloadStarCardViewProps) {
  const starCardRef = useRef<HTMLDivElement>(null);

  // Fetch star card data
  const { data: starCard, isLoading: starCardLoading } = useQuery({
    queryKey: ['/api/workshop-data/starcard'],
    staleTime: 0, // Always fetch fresh data from database
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
  });

  // Fetch flow attributes data
  const { data: flowAttributesData, isLoading: flowLoading } = useQuery({
    queryKey: ['/api/workshop-data/flow-attributes'],
    staleTime: 0, // Always fetch fresh data from database
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
  });

  // Fetch user data for filename
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });

  const handleDownload = async () => {
    console.log('Starting star card download...');
    
    if (!starCardRef.current) {
      console.log('StarCard ref not found');
      alert('Download failed. Please try again.');
      return;
    }

    try {
      // Create dynamic filename with username, full name, and timestamp
      const user = (userData as any)?.user || userData;
      const fullName = user?.name || 'Unknown_User';
      const username = user?.username || 'unknown';
      
      // Clean both name and username for filename (remove spaces and special characters)
      const cleanFullName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Create timestamp in YYYY-MM-DD_HH-MM-SS format
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/:/g, '-')  // Replace colons with hyphens
        .replace(/\.\d{3}Z$/, '')  // Remove milliseconds and Z
        .replace('T', '_');  // Replace T with underscore
      
      const filename = `Star_Card-${cleanUsername}-${cleanFullName}-${timestamp}.png`;
      console.log('Generated filename:', filename);
      
      // Use the utility function for consistent configuration
      const { downloadElementAsImage } = await import('@/lib/html2canvas');
      await downloadElementAsImage(starCardRef.current, filename);
      
      console.log('Download completed successfully');
      markStepCompleted('5-1');
    } catch (error) {
      console.error('Error generating star card image:', error);
      alert('Download failed. Please try right-clicking on your star card and selecting "Save as Image"');
    }
  };

  const handleNext = () => {
    markStepCompleted('5-1');
    setCurrentContent('holistic-report');
  };

  // Check if we have star card data
  const hasStarCardData = starCard && (
    ((starCard as any).thinking && (starCard as any).thinking > 0) || 
    ((starCard as any).feeling && (starCard as any).feeling > 0) || 
    ((starCard as any).acting && (starCard as any).acting > 0) || 
    ((starCard as any).planning && (starCard as any).planning > 0)
  );

  // Map flow attributes for star card display
  const mappedFlowAttributes = flowAttributesData && 
    (flowAttributesData as any).attributes && 
    Array.isArray((flowAttributesData as any).attributes) ? 
    (flowAttributesData as any).attributes.map((attr: any) => {
      if (!attr || !attr.name) {
        return { text: "", color: "rgb(156, 163, 175)" };
      }
      return {
        text: attr.name,
        color: getAttributeColor(attr.name)
      };
    }) : [];

  if (starCardLoading || flowLoading || userLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Loading your Star Card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 overflow-x-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-6 w-6 text-blue-600" />
            Download Your Star Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Your personalized Star Card is ready! Download it to keep a record of your strengths and flow attributes.
            </p>

            {hasStarCardData ? (
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-shrink-0 flex justify-center lg:justify-start">
                  <div className="border border-gray-200 rounded-md overflow-visible bg-white shadow-sm mb-6 flex-shrink-0" style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH }}>
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-xl font-bold text-center">Your Complete Star Card</h3>
                    </div>
                    <div className="p-6 flex justify-center overflow-visible">
                      <div className="flex-shrink-0" style={{ width: CARD_WIDTH, minWidth: CARD_WIDTH, maxWidth: CARD_WIDTH }}>
                        <StarCard 
                          ref={starCardRef}
                          thinking={(starCard as any)?.thinking || 0}
                          acting={(starCard as any)?.acting || 0}
                          feeling={(starCard as any)?.feeling || 0}
                          planning={(starCard as any)?.planning || 0}
                          imageUrl={(starCard as any)?.imageUrl || null}
                          flowAttributes={mappedFlowAttributes}
                          downloadable={false}
                          state="complete"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-center">
                      <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Download Star Card
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-900 mb-2">What's included in your Star Card:</h3>
                    <ul className="list-disc list-inside text-blue-800 space-y-1">
                      <li>Your top strength categories</li>
                      <li>Flow attributes and preferences</li>
                      <li>Personalized insights and recommendations</li>
                      <li>Action steps for development</li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button onClick={handleNext} variant="outline" className="flex items-center gap-2">
                      Continue to Holistic Report
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                <p className="text-amber-800 font-medium">Star Card not available</p>
                <p className="text-sm text-amber-700 mt-2">
                  You need to complete the strengths assessment first to generate your Star Card.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
