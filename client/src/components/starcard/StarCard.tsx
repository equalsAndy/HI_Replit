import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { downloadElementAsImage } from "@/lib/html2canvas";
import { UserIcon } from "lucide-react";
import { ProfileData, QuadrantData } from "@shared/schema";
import allStarTeamsLogo from '@assets/all-star-teams-logo-250px.png';
import cloudImage from '@assets/starcardcloudimage.png';

// Original interface
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
  pending?: boolean;
}

const QUADRANT_COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',     // Red
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)'   // Yellow
} as const;

const DEFAULT_COLOR = 'rgb(229, 231, 235)'; // Gray

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
  pending = false
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

  // Determine if assessment is completed - all scores must be greater than 0
  const hasCompletedAssessment = useMemo(() => {
    // Check if any value is greater than 0, which indicates assessment is completed
    const hasScores = (
      (derivedQuadrantData.thinking || 0) > 0 ||
      (derivedQuadrantData.acting || 0) > 0 ||
      (derivedQuadrantData.feeling || 0) > 0 ||
      (derivedQuadrantData.planning || 0) > 0
    );
    
    // Force to true if we have any scores at all, regardless of pending flag
    return hasScores;
  }, [derivedQuadrantData]);

  // Sort quadrants by score and assign positions
  const sortedQuadrants = useMemo(() => {
    const quadrantColors = {
      thinking: 'rgb(1, 162, 82)',
      acting: 'rgb(241, 64, 64)',
      feeling: 'rgb(22, 126, 253)',
      planning: 'rgb(255, 203, 47)'
    };

    const defaultColor = 'rgb(229, 231, 235)';

    // Filter out 'pending' from quadrantData
    const filtered = Object.entries(derivedQuadrantData)
      .filter(([key]) => key !== 'pending')
      .map(([key, score]) => ({
        key: key as QuadrantType,
        label: key.toUpperCase(),
        // Use proper colors for quadrants
        color: quadrantColors[key as QuadrantType],
        // Use actual scores only, no placeholders
        score: typeof score === 'number' ? score : 0,
        position: 0
      }));

    // Sort by score in descending order
    const sorted = [...filtered].sort((a, b) => b.score - a.score);

    // Assign positions (0 = top right, 1 = bottom right, 2 = bottom left, 3 = top left)
    // Following clockwise order
    sorted.forEach((quadrant, index) => {
      quadrant.position = index;
    });

    return sorted;
  }, [derivedQuadrantData]);

  // Get quadrant at specific position
  const getQuadrantAtPosition = (position: number): QuadrantInfo | undefined => {
    return sortedQuadrants.find(q => q.position === position);
  };

  // Determine if flow attributes are complete
  const hasFlowData = flowAttributes?.length > 0 && flowAttributes.every(attr => attr.text);

  // Handle download
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

  // Calculate total score
  const totalScore = derivedQuadrantData.thinking + derivedQuadrantData.acting + derivedQuadrantData.feeling + derivedQuadrantData.planning;

  // Convert raw scores to percentages
  const normalizeScore = (score: number): number => {
    // If total score is 0, return 0 for all values
    if (totalScore === 0) {
      return 0; // Show 0% if no data available
    }
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
          <div className="absolute text-[0.65rem] font-medium" style={{ top: '8px', right: '15px', width: '59px', textAlign: 'center', zIndex: 30, color: 'rgba(0, 0, 0, 0.8)' }}>
            Flow
          </div>

          {/* Core Label - moved down 3px and color at 80% black */}
          <div className="absolute text-[0.65rem] font-medium" style={{ top: '68px', right: '79px', width: '59px', textAlign: 'center', zIndex: 30, color: 'rgba(0, 0, 0, 0.8)' }}>
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
          <div className="absolute grid grid-cols-2 gap-[1px] w-[118px] h-[118px] z-10" style={{ left: '80px', top: '85px' }}>
            {/* Top Left */}
            <div className="aspect-square relative flex items-center justify-center" style={{ backgroundColor: getQuadrantAtPosition(3)?.color || 'rgb(229, 231, 235)' }}>
              <div className="text-white text-xs font-medium text-center">
                <>
                  <div>{getQuadrantAtPosition(3)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(3)?.score || 0)}%</div>
                </>
              </div>
            </div>

            {/* Top Right */}
            <div className="aspect-square relative flex items-center justify-center" style={{ backgroundColor: getQuadrantAtPosition(0)?.color || 'rgb(229, 231, 235)' }}>
              <div className="text-white text-xs font-medium text-center">
                <>
                  <div>{getQuadrantAtPosition(0)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(0)?.score || 0)}%</div>
                </>
              </div>
            </div>

            {/* Bottom Left */}
            <div className="aspect-square relative flex items-center justify-center" style={{ backgroundColor: getQuadrantAtPosition(2)?.color || 'rgb(229, 231, 235)' }}>
              <div className="text-white text-xs font-medium text-center">
                <>
                  <div>{getQuadrantAtPosition(2)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(2)?.score || 0)}%</div>
                </>
              </div>
            </div>

            {/* Bottom Right */}
            <div className="aspect-square relative flex items-center justify-center" style={{ backgroundColor: getQuadrantAtPosition(1)?.color || 'rgb(229, 231, 235)' }}>
              <div className="text-white text-xs font-medium text-center">
                <>
                  <div>{getQuadrantAtPosition(1)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(1)?.score || 0)}%</div>
                </>
              </div>
            </div>
          </div>

          {/* Flow Squares */}
          {[
            { top: '25px', right: '15px', index: 0 },  // Top Right
            { top: '204px', right: '15px', index: 1 }, // Bottom Right  
            { top: '204px', left: '15px', index: 2 },  // Bottom Left
            { top: '25px', left: '15px', index: 3 }    // Top Left
          ].map(({top, right, left, index}) => (
            <div 
              key={index}
              className="absolute w-[59px] h-[59px] text-white border border-gray-300 flex items-center justify-center"
              style={{
                top,
                right,
                left,
                backgroundColor: flowAttributes[index]?.text 
                  ? (flowAttributes[index]?.color || 'rgb(156, 163, 175)') 
                  : 'rgb(229, 231, 235)'
              }}
            >
              <p className="text-[9px] font-medium text-center leading-tight">
                {flowAttributes[index]?.text || ''}
              </p>
            </div>
          ))}

          {/* Arrow 1 - 70% of original size and equidistant from Flow 1 and Flow 2 */}
          <div className="absolute" style={{ right: '44px', top: '105px', height: '84px' }}>
            <div className="absolute left-0 top-0 h-[84px] w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-4.5px] bottom-0">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 10 L0 5 L10 5 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* Arrow 2 - Precisely equidistant between Flow 2 and Flow 3 */}
          <div className="absolute" style={{ top: '234px', left: '89px', width: '73px' }}>
            <div className="absolute left-0 top-0 w-[73px] h-[1px] bg-gray-400"></div>
            <div className="absolute left-0 top-[-4.5px]">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 5 L5 0 L5 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* Arrow 3 - Made 70% of original height and vertically centered */}
          <div className="absolute" style={{ left: '44px', top: '105px', height: '84px' }}>
            <div className="absolute left-0 top-0 h-[84px] w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-4.5px] top-0">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 0 L0 5 L10 5 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* No Top Arrow between flow 1 and flow 4 as requested */}
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

      {downloadable && !preview && hasCompletedAssessment && hasFlowData && (
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