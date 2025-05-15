import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { downloadElementAsImage } from "@/lib/html2canvas";
import { UserIcon } from "lucide-react";
import { ProfileData, QuadrantData } from "@shared/schema";
import allStarTeamsLogo from '@assets/all-star-teams-logo-250px.png';
import cloudImage from '@assets/starcardcloudimage.png';

// Flow attribute structure
interface FlowAttribute {
  text: string;
  color: string;
}

interface StarCardProps {
  profile?: ProfileData;
  quadrantData?: QuadrantData;
  downloadable?: boolean;
  preview?: boolean;
  flowAttributes?: FlowAttribute[];
  imageUrl?: string | null;
  enableImageUpload?: boolean;

  // Additional direct props for legacy support
  thinking?: number;
  acting?: number;
  feeling?: number;
  planning?: number;
  userName?: string;
  userTitle?: string;
  userOrg?: string;
  pending?: boolean;  // For backward compatibility (true if state is 'empty')
  state?: string;     // 'empty', 'partial', or 'complete'
}

// Define quadrant colors
const QUADRANT_COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',     // Red
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)'   // Yellow
} as const;

const DEFAULT_COLOR = 'rgb(229, 231, 235)'; // Gray for empty state

type QuadrantType = 'thinking' | 'acting' | 'feeling' | 'planning';
type QuadrantInfo = {
  key: QuadrantType;
  label: string;
  color: string;
  score: number;
  position: number;
};

export default function StarCard({ 
  // Support both object-based and direct props
  profile, 
  quadrantData,
  thinking,
  acting,
  feeling,
  planning,
  userName,
  userTitle,
  userOrg,
  downloadable = true,
  preview = false,
  flowAttributes = [],
  imageUrl = null,
  enableImageUpload = false,
  pending = false,
  state = undefined
}: StarCardProps) {
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Create derived profile and quadrantData for backward compatibility
  const derivedProfile: ProfileData = useMemo(() => {
    return profile || {
      name: userName || '',
      title: userTitle || '',
      organization: userOrg || '',
      avatarUrl: undefined
    };
  }, [profile, userName, userTitle, userOrg]);

  const derivedQuadrantData: QuadrantData = useMemo(() => {
    return quadrantData || {
      thinking: thinking || 0,
      acting: acting || 0,
      feeling: feeling || 0,
      planning: planning || 0
    };
  }, [quadrantData, thinking, acting, feeling, planning]);

  // Check if assessment has been completed (at least one score > 0)
  const hasScores = useMemo(() => {
    return (
      (derivedQuadrantData.thinking || 0) > 0 || 
      (derivedQuadrantData.acting || 0) > 0 || 
      (derivedQuadrantData.feeling || 0) > 0 || 
      (derivedQuadrantData.planning || 0) > 0
    );
  }, [derivedQuadrantData]);

  // Check if flow attributes are provided and valid
  const hasFlowAttributes = useMemo(() => {
    return flowAttributes && 
           flowAttributes.length > 0 && 
           flowAttributes.every(attr => !!attr.text);
  }, [flowAttributes]);

  // Determine the card state based on props or data
  const cardState = useMemo(() => {
    // First check if state is explicitly provided in props
    if (state) return state;
    
    // Then check if it's in the quadrant data
    if ((derivedQuadrantData as any).state) return (derivedQuadrantData as any).state;
    
    // Otherwise determine based on data presence:
    if (hasFlowAttributes && hasScores) return 'complete';
    if (hasScores) return 'partial';
    return 'empty';
  }, [derivedQuadrantData, state, hasScores, hasFlowAttributes]);

  // Helper function to get default color based on position
  const getQuadrantDefaultColor = (index: number): string => {
    // Match colors based on position: 0=top-right, 1=bottom-right, 2=bottom-left, 3=top-left
    switch(index) {
      case 0: return QUADRANT_COLORS.feeling;  // Top right - blue
      case 1: return QUADRANT_COLORS.acting;   // Bottom right - red
      case 2: return QUADRANT_COLORS.planning; // Bottom left - yellow
      case 3: return QUADRANT_COLORS.thinking; // Top left - green
      default: return 'rgb(156, 163, 175)';    // Medium gray fallback
    }
  };

  // Sort quadrants by score and assign positions
  const sortedQuadrants = useMemo(() => {
    // Filter out non-quadrant fields
    const quadrants = [
      { key: 'thinking' as const, score: derivedQuadrantData.thinking || 0 },
      { key: 'acting' as const, score: derivedQuadrantData.acting || 0 },
      { key: 'feeling' as const, score: derivedQuadrantData.feeling || 0 },
      { key: 'planning' as const, score: derivedQuadrantData.planning || 0 }
    ].map(q => ({
      key: q.key,
      label: q.key.toUpperCase(),
      color: QUADRANT_COLORS[q.key],
      score: q.score,
      position: 0 // Will be assigned based on sort order
    }));

    console.log("StarCard Raw quadrant data:", derivedQuadrantData);
    console.log("StarCard Quadrants before sorting:", quadrants);

    // If all scores are equal, maintain consistent ordering
    const allScoresEqual = quadrants.every(q => q.score === quadrants[0].score && q.score > 0);
    
    let sorted;
    if (allScoresEqual) {
      // Use a fixed order for equal scores
      const defaultOrder = ['thinking', 'acting', 'feeling', 'planning'];
      sorted = [...defaultOrder.map(key => 
        quadrants.find(q => q.key === key)!
      )];
      console.log("StarCard: All scores equal, using fixed order:", sorted);
    } else {
      // Sort by score in descending order
      sorted = [...quadrants].sort((a, b) => b.score - a.score);
      console.log("StarCard: Sorted by score:", sorted);
    }

    // Assign positions (0 = top right, 1 = bottom right, 2 = bottom left, 3 = top left)
    sorted.forEach((quadrant, index) => {
      quadrant.position = index;
    });

    console.log("StarCard: Final sorted quadrants with positions:", sorted);
    return sorted;
  }, [derivedQuadrantData]);

  // Get a quadrant by position
  const getQuadrantAtPosition = (position: number): QuadrantInfo | undefined => {
    return sortedQuadrants.find(q => q.position === position);
  };

  // Handle card download
  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await downloadElementAsImage(cardRef.current, `${derivedProfile.name || 'User'}_Star_Card.png`);
    } catch (error) {
      console.error("Error downloading star card:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Calculate total score for normalization
  const totalScore = useMemo(() => {
    return (
      (derivedQuadrantData.thinking || 0) + 
      (derivedQuadrantData.acting || 0) + 
      (derivedQuadrantData.feeling || 0) + 
      (derivedQuadrantData.planning || 0)
    );
  }, [derivedQuadrantData]);

  // Convert raw scores to percentages
  const normalizeScore = (score: number): number => {
    // If the score is already a percentage (0-100), just return it directly
    if (score >= 0 && score <= 100 && totalScore >= 99 && totalScore <= 101) {
      return score;  
    }
    // Otherwise normalize it
    if (totalScore === 0) return 0;
    return Math.round((score / totalScore) * 100);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef}
        className="bg-white border border-gray-200 rounded-lg p-5"
        style={{ width: '400px', height: '555px' }}
      >
        <h2 className="text-xl font-bold text-center uppercase mb-4">Star Card</h2>

        {/* User Profile */}
        <div className="flex items-center mb-6">
          <div className="rounded-full h-16 w-16 overflow-hidden mr-4 border border-gray-300">
            {imageUrl || derivedProfile.avatarUrl ? (
              <img 
                src={imageUrl || derivedProfile.avatarUrl} 
                alt={derivedProfile.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">Name: {derivedProfile.name || 'Your Name'}</p>
            <p className="text-sm text-gray-600">Title: {derivedProfile.title || 'Your Title'}</p>
            <p className="text-sm text-gray-600">Organization: {derivedProfile.organization || 'Your Organization'}</p>
          </div>
        </div>

        {/* Cloud graphic with Apex Strength - Using the provided cloud image */}
        <div className="relative text-center mb-2" style={{ marginTop: '-20px' }}>
          {/* Cloud Image - cropped 1px from each side */}
          <div className="relative w-full" style={{ height: '110px' }}>
            <img 
              src={cloudImage} 
              alt="Cloud" 
              className="w-[98%] object-contain absolute top-0 left-[1%]"
              style={{ height: '80px' }}
            />

            {/* Text positioned below cloud image - moved up 10px total and 10% smaller */}
            <div className="absolute w-full" style={{ top: '50px' }}>
              <p className="text-[1.125rem] font-bold text-gray-500">Imagination</p>
              <p className="text-[0.785rem] text-gray-500 italic">Your Apex Strength</p>
            </div>
          </div>
        </div>

        {/* Main Star Card Diagram - The "cluster" moved down 10px from previous position */}
        <div className="relative mx-auto mb-6" style={{ width: '280px', height: '280px', marginTop: '-25px' }}>
          {/* Flow Label - moved down 3px and color at 80% black */}
          <div className="absolute text-[0.65rem] font-medium" style={{ top: '5px', right: '10px', width: '66px', textAlign: 'center', zIndex: 30, color: 'rgba(0, 0, 0, 0.8)' }}>
            Flow
          </div>

          {/* Core Label - moved down 3px and color at 80% black */}
          <div className="absolute text-[0.65rem] font-medium" style={{ top: '61px', right: '79px', width: '59px', textAlign: 'center', zIndex: 30, color: 'rgba(0, 0, 0, 0.8)' }}>
            Core
          </div>

          {/* Center Star - position kept the same but star made bigger */}
          <div className="absolute z-20" style={{ left: '115px', top: '15px' }}>
            <div className="h-14 w-14 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-10 w-10 text-gray-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* The Four Quadrant Squares */}
          <div className="absolute grid grid-cols-2 gap-[3px] w-[132px] h-[132px] z-10" style={{ left: '73px', top: '78px' }}>
            {/* Top Left */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(3)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
              {cardState !== 'empty' && (
                <div className="text-white text-[0.85rem] font-medium text-center">
                  <div>{getQuadrantAtPosition(3)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(3)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Top Right */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(0)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
              {cardState !== 'empty' && (
                <div className="text-white text-[0.85rem] font-medium text-center">
                  <div>{getQuadrantAtPosition(0)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(0)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Bottom Left */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(2)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
              {cardState !== 'empty' && (
                <div className="text-white text-[0.85rem] font-medium text-center">
                  <div>{getQuadrantAtPosition(2)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(2)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Bottom Right */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(1)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
              {cardState !== 'empty' && (
                <div className="text-white text-[0.85rem] font-medium text-center">
                  <div>{getQuadrantAtPosition(1)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(1)?.score || 0)}%</div>
                </div>
              )}
            </div>
          </div>

          {/* Flow Squares */}
          {[
            { top: '18px', right: '10px', index: 0 },  // Top Right
            { top: '200px', right: '10px', index: 1 }, // Bottom Right  
            { top: '200px', left: '10px', index: 2 },  // Bottom Left
            { top: '18px', left: '10px', index: 3 }    // Top Left
          ].map(({top, right, left, index}) => (
            <div 
              key={index}
              className="absolute w-[66px] h-[66px] text-white border border-gray-300 flex items-center justify-center"
              style={{
                top,
                right,
                left,
                // Show colors based on quadrant if attribute exists
                backgroundColor: flowAttributes[index]?.text 
                  ? (flowAttributes[index]?.color || getQuadrantDefaultColor(index)) 
                  : 'rgb(229, 231, 235)' // Default light gray when no attribute
              }}
            >
              {/* Show text if attribute exists */}
              {flowAttributes[index]?.text && (
                <p className="text-[11.5px] font-bold text-center leading-tight">
                  {flowAttributes[index]?.text}
                </p>
              )}
            </div>
          ))}

          {/* Right vertical arrow connecting top-right and bottom-right flow boxes */}
          <div className="absolute" style={{ right: '44px', top: '105px', height: '84px' }}>
            <div className="absolute left-0 top-0 h-[84px] w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-4.5px] bottom-0">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 10 L0 5 L10 5 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* Bottom horizontal arrow connecting bottom-right and bottom-left flow boxes */}
          <div className="absolute" style={{ top: '234px', left: '89px', width: '73px' }}>
            <div className="absolute left-0 top-0 w-[73px] h-[1px] bg-gray-400"></div>
            <div className="absolute left-0 top-[-4.5px]">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 5 L5 0 L5 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* Left vertical arrow connecting top-left and bottom-left flow boxes */}
          <div className="absolute" style={{ left: '44px', top: '105px', height: '84px' }}>
            <div className="absolute left-0 top-0 h-[84px] w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-4.5px] top-0">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 0 L0 5 L10 5 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* No horizontal arrow at top - intentionally omitted */}
        </div>

        {/* Logo - Actual AllStarTeams logo, 20% smaller and moved up 24px */}
        <div className="flex justify-end mt-[-18px] pr-4">
          <img 
            src={allStarTeamsLogo} 
            alt="allstarteams" 
            className="h-[26px]" 
          />
        </div>
      </div>

      {downloadable && !preview && cardState === 'complete' && (
        <Button
          onClick={handleDownload}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download Star Card"}
        </Button>
      )}
    </div>
  );
}