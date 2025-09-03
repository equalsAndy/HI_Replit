import React, { useState, useRef, useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { QuadrantData } from '@shared/schema';
import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import allStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import cloudImage from '@/assets/starcardcloudimage.png';
import { getAttributeColor, CARD_WIDTH, CARD_HEIGHT, QUADRANT_COLORS, DEFAULT_COLOR } from '@/components/starcard/starCardConstants';

// Profile data interface
interface ProfileData {
  name: string;
  title: string;
  organization: string;
  avatarUrl?: string;
}



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



type QuadrantType = 'thinking' | 'acting' | 'feeling' | 'planning';
type QuadrantInfo = {
  key: QuadrantType;
  label: string;
  color: string;
  score: number;
  position: number;
};

const StarCard = React.forwardRef<HTMLDivElement, StarCardProps>(({ 
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
}, ref) => {
  const [downloading, setDownloading] = useState(false);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [fetchedFlowAttributes, setFetchedFlowAttributes] = useState<FlowAttribute[]>([]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  // Combine external ref with internal ref
  const combinedRef = (node: HTMLDivElement | null) => {
    cardRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Add state for fetched assessment data
  const [fetchedAssessmentData, setFetchedAssessmentData] = useState<QuadrantData | null>(null);

  // Data fetching - only fetch if props don't provide complete data
  React.useEffect(() => {
    // Skip fetching if we have complete profile data from props
    if (profile && profile.name && profile.name !== 'Your Name') {
      console.log('✅ StarCard: Using profile data from props, skipping fetch');
      return;
    }
    
    console.log('🔄 StarCard: Profile data incomplete, starting fetch:', profile);
    
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        console.log('🔄 StarCard: Fetching user profile and assessment data...');
        
        // Fetch user profile
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user = userData.user || userData;
          if (isMounted) {
            setUserProfileData(user);
            console.log('✅ StarCard: User profile fetched:', user);
          }
        }
      } catch (error) {
        console.error('❌ StarCard: Error fetching data:', error);
      }
    };

    // Only fetch if we don't have complete profile data
    const shouldFetch = !userProfileData && (!profile || !profile.name || profile.name === 'Your Name');

    if (shouldFetch) {
      console.log('🔄 StarCard: Starting data fetch, current profile:', profile);
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Create derived profile and quadrantData for backward compatibility
  const derivedProfile: ProfileData = useMemo(() => {
    // Since fetching is disabled, always use props first
    const profileFromProps = profile || {
      name: userName || 'Your Name',
      title: userTitle || '',
      organization: userOrg || '',
      avatarUrl: undefined
    };
    
    console.log('🎯 StarCard Profile from props:', profileFromProps);
    console.log('🎯 StarCard Props received:', { profile, userName, userTitle, userOrg });
    
    // Fallback to userProfileData only if props don't have data (should not happen since fetching is disabled)
    if (userProfileData && (!profileFromProps.name || profileFromProps.name === 'Your Name')) {
      const profileFromFetch = {
        name: userProfileData.name || 'Your Name',
        title: userProfileData.title || userProfileData.jobTitle || '',
        organization: userProfileData.organization || '',
        avatarUrl: userProfileData.profilePicture || undefined
      };
      console.log('🎯 StarCard Profile from userProfileData fallback:', profileFromFetch);
      return profileFromFetch;
    }
    
    return profileFromProps;
  }, [profile, userName, userTitle, userOrg, userProfileData]);

  const derivedQuadrantData: QuadrantData = useMemo(() => {
    // Use fetched data if available, then props, then defaults
    if (fetchedAssessmentData) {
      return fetchedAssessmentData;
    }
    return quadrantData || {
      thinking: thinking || 0,
      acting: acting || 0,
      feeling: feeling || 0,
      planning: planning || 0
    };
  }, [quadrantData, thinking, acting, feeling, planning, fetchedAssessmentData]);

  // Check if assessment has been completed (at least one score > 0)
  const hasScores = useMemo(() => {
    // Debug log for quadrant data
    console.log("StarCard checking scores, quadrantData:", derivedQuadrantData);

    // Force non-zero values (fix for false zero issue)
    const thinking = Number(derivedQuadrantData.thinking) || 0;
    const acting = Number(derivedQuadrantData.acting) || 0;
    const feeling = Number(derivedQuadrantData.feeling) || 0;
    const planning = Number(derivedQuadrantData.planning) || 0;

    // Debug the actual values being checked
    console.log("StarCard checking scores with values:", {thinking, acting, feeling, planning});

    return thinking > 0 || acting > 0 || feeling > 0 || planning > 0;
  }, [derivedQuadrantData]);

  // Check if flow attributes are provided and valid (use fetched or props)
  const effectiveFlowAttributes = flowAttributes?.length > 0 ? flowAttributes : fetchedFlowAttributes;

  const hasFlowAttributes = useMemo(() => {
    return effectiveFlowAttributes && 
           effectiveFlowAttributes.length > 0 && 
           effectiveFlowAttributes.every(attr => !!attr.text);
  }, [effectiveFlowAttributes]);

  // Determine the card state based on props or data
  const cardState = useMemo(() => {
    // Log the calculated state values
    console.log("StarCard state calculation:", {
      hasScores,
      hasFlowAttributes,
      explicitState: state,
      quadrantState: (derivedQuadrantData as any).state,
      pending
    });

    // Override if explicitly marked as pending
    if (pending) return 'empty';

    // First check if state is explicitly provided in props
    if (state) return state;

    // Then check if it's in the quadrant data
    if ((derivedQuadrantData as any).state) return (derivedQuadrantData as any).state;

    // Otherwise determine based on data presence:
    if (hasFlowAttributes && hasScores) return 'complete';
    if (hasScores) return 'partial';
    return 'empty';
  }, [derivedQuadrantData, state, hasScores, hasFlowAttributes, pending]);

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
    // Ensure numeric values for all quadrants by explicitly converting
    const thinking = Number(derivedQuadrantData.thinking) || 0;
    const acting = Number(derivedQuadrantData.acting) || 0;
    const feeling = Number(derivedQuadrantData.feeling) || 0;
    const planning = Number(derivedQuadrantData.planning) || 0;

    // Create quadrant objects with proper typing
    const quadrants = [
      { key: 'thinking' as const, score: thinking },
      { key: 'acting' as const, score: acting },
      { key: 'feeling' as const, score: feeling },
      { key: 'planning' as const, score: planning }
    ].map(q => ({
      key: q.key,
      label: q.key.toUpperCase(),
      color: QUADRANT_COLORS[q.key],
      score: q.score,
      position: 0 // Will be assigned based on sort order
    }));

    console.log("StarCard Raw quadrant data:", {thinking, acting, feeling, planning});
    console.log("StarCard Quadrants before sorting:", quadrants);

    // If any score is greater than 0, use them for sorting
    const hasAnyScores = quadrants.some(q => q.score > 0);

    // If all scores are equal, maintain consistent ordering
    const allScoresEqual = quadrants.every(q => q.score === quadrants[0].score);

    let sorted;
    if (!hasAnyScores) {
      // If no scores, use default order
      const defaultOrder = ['thinking', 'acting', 'feeling', 'planning'];
      sorted = [...defaultOrder.map(key => 
        quadrants.find(q => q.key === key)!
      )];
      console.log("StarCard: No scores, using default order:", sorted);
    } else if (allScoresEqual && quadrants[0].score > 0) {
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
      // Ensure consistent dynamic import of html2canvas
      const { downloadElementAsImage } = await import('@/lib/html2canvas');
      await downloadElementAsImage(cardRef.current, `${derivedProfile.name || 'User'}_Star_Card.png`);
    } catch (error) {
      console.error("Error downloading star card:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Calculate total score for normalization
  const totalScore = useMemo(() => {
    // Ensure we're using number values
    const thinking = Number(derivedQuadrantData.thinking) || 0;
    const acting = Number(derivedQuadrantData.acting) || 0;
    const feeling = Number(derivedQuadrantData.feeling) || 0;
    const planning = Number(derivedQuadrantData.planning) || 0;

    const total = thinking + acting + feeling + planning;
    console.log("StarCard total score calculation:", { thinking, acting, feeling, planning, total });
    return total;
  }, [derivedQuadrantData]);

  // Convert raw scores to percentages
  const normalizeScore = (score: number): number => {
    // Make sure score is a number
    const numScore = Number(score) || 0;

    // If the score is already a percentage (0-100), just return it directly
    if (numScore >= 0 && numScore <= 100 && totalScore >= 99 && totalScore <= 101) {
      return numScore;  
    }

    // Otherwise normalize it
    if (totalScore === 0) return 0;

    const normalized = Math.round((numScore / totalScore) * 100);
    console.log(`Normalized score: ${numScore} / ${totalScore} = ${normalized}%`);
    return normalized;
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={combinedRef}
        data-starcard="true"
        className="bg-white border border-gray-200 rounded-lg p-5 flex-shrink-0"
        style={{ 
          width: CARD_WIDTH, 
          height: CARD_HEIGHT, 
          minWidth: CARD_WIDTH,
          maxWidth: CARD_WIDTH 
        }}
      >
        <h2 className="mt-0 text-xl font-bold text-center uppercase mb-4">Star Card</h2>

        {/* User Profile */}
        <div className="flex items-center mb-6">
          <div className="rounded-full h-[70px] w-[70px] overflow-hidden mr-5 border border-gray-300">
            {(imageUrl || derivedProfile.avatarUrl) && (
            <img 
              src={imageUrl || derivedProfile.avatarUrl} 
              alt={derivedProfile.name} 
              className="h-full w-full object-cover"
              style={{ marginTop: '-5px' }}
            onError={(e) => {
            console.log('🖼️ Profile image failed to load:', imageUrl || derivedProfile.avatarUrl);
            const target = e.currentTarget;
            const parent = target.parentElement;
              target.style.display = 'none';
                const fallback = parent?.querySelector('.fallback-avatar');
                  if (fallback) {
                  fallback.classList.remove('hidden');
                }
              }}
              onLoad={() => {
                console.log('🖼️ Profile image loaded successfully:', imageUrl || derivedProfile.avatarUrl);
              }}
            />
          )}
            <div className={`h-full w-full bg-gray-200 flex items-center justify-center fallback-avatar ${(imageUrl || derivedProfile.avatarUrl) ? 'hidden' : ''}`}>
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="font-medium text-gray-800">{derivedProfile.name || 'Your Name'}</div>
            {derivedProfile.title && (
              <div className="text-sm text-gray-600">{derivedProfile.title}</div>
            )}
            {derivedProfile.organization && (
              <div className="text-sm text-gray-600">{derivedProfile.organization}</div>
            )}
          </div>
        </div>

        {/* Cloud graphic with Apex Strength - Using the provided cloud image */}
        <div className="relative text-center mb-2" style={{ marginTop: '-44px' }}>
          {/* Cloud Image - cropped 1px from each side */}
          <div className="relative w-full" style={{ height: '110px' }}>
            <img 
              src={cloudImage} 
              alt="Cloud" 
              className="w-[98%] object-contain absolute top-0 left-[1%]"
              style={{ height: '88px', zIndex: 1 }}
            />

            {/* Text positioned below cloud image - moved up 10px total and 10% smaller */}
            <div className="absolute w-full" style={{ top: '32px', zIndex: 2 }}>
              <p className="text-[1.125rem] font-bold text-gray-500">Imagination</p>
              <p className="text-[0.785rem] text-gray-500 italic">Your Apex Strength</p>
            </div>
          </div>
        </div>

        {/* Main Star Card Diagram - The "cluster" moved down 10px from previous position */}
        <div className="relative mx-auto mb-6" style={{ width: '308px', height: '308px', marginTop: '-9px' }}>
          {/* Flow Label */}
          <div className="absolute text-[0.65rem] font-medium" style={{ top: '-6px', right: '9px', width: '66px', textAlign: 'center', zIndex: 30, color: 'rgba(0, 0, 0, 0.8)' }}>
            Flow
          </div>

          {/* Core Label - positioned over top right quadrant */}
          <div className="absolute text-[0.65rem] font-medium" style={{ top: '64px', left: '158px', width: '60px', textAlign: 'center', zIndex: 30, color: 'rgba(0, 0, 0, 0.8)' }}>
            Core
          </div>

          {/* Center Star - centered over quadrants */}
          <div className="absolute z-20" style={{ left: '125px', top: '20px' }}>
            <div className="h-[57px] w-[57px] rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-10 w-10 text-gray-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* The Four Quadrant Squares */}
          <div className="absolute grid grid-cols-2 gap-[3px] w-[145px] h-[145px] z-10" style={{ left: '80px', top: '86px' }}>
            {/* Top Left */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(3)?.color || 'rgb(229, 231, 235)') : 'rgb(229, 231, 235)' }}>
              {cardState !== 'empty' && (
                <div className="text-white text-xs font-medium text-center">
                  <div>{getQuadrantAtPosition(3)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(3)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Top Right */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(0)?.color || 'rgb(229, 231, 235)') : 'rgb(229, 231, 235)' }}>
              {cardState !== 'empty' && (
                <div className="text-white text-xs font-medium text-center">
                  <div>{getQuadrantAtPosition(0)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(0)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Bottom Left */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(2)?.color || 'rgb(229, 231, 235)') : 'rgb(229, 231, 235)' }}>
              {cardState !== 'empty' && (
                <div className="text-white text-xs font-medium text-center">
                  <div>{getQuadrantAtPosition(2)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(2)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Bottom Right */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(1)?.color || 'rgb(229, 231, 235)') : 'rgb(229, 231, 235)' }}>
              {cardState !== 'empty' && (
                <div className="text-white text-xs font-medium text-center">
                  <div>{getQuadrantAtPosition(1)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(1)?.score || 0)}%</div>
                </div>
              )}
            </div>
          </div>

          {/* Flow Squares */}
          {[
            { top: '15px', right: '2px', index: 0 },  // Top Right
            { top: '225px', right: '2px', index: 1 }, // Bottom Right  
            { top: '225px', left: '2px', index: 2 },  // Bottom Left
            { top: '15px', left: '2px', index: 3 }    // Top Left
          ].map(({top, right, left, index}) => (
            <div 
              key={index}
              className="absolute w-[73px] h-[73px] text-white border border-gray-300 flex items-center justify-center"
              style={{
                top,
                right,
                left,
                backgroundColor: effectiveFlowAttributes[index]?.text 
                  ? effectiveFlowAttributes[index]?.color || getQuadrantDefaultColor(index)  // Use attribute's color when available
                  : 'rgb(229, 231, 235)' // Default light gray only when no attribute
              }}
            >
              {/* Show text if attribute exists */}
              {effectiveFlowAttributes[index]?.text && (
                <div className="w-full h-full flex items-center justify-center p-[2px]">
                <div 
                  className="font-bold text-center leading-tight"
                  style={{
                    fontSize: effectiveFlowAttributes[index]?.text 
                      ? `${Math.max(Math.min(69 / effectiveFlowAttributes[index]?.text.length * 1.2, 14), 7.5)}px` 
                      : '9px',
                    margin: '0 1px'
                  }}
                >
                  {effectiveFlowAttributes[index]?.text}
                </div>
              </div>
              )}
            </div>
          ))}

          {/* Right vertical arrow connecting top-right and bottom-right flow boxes */}
          <div className="absolute" style={{ right: '38px', top: '108px', height: '98px' }}>
            <div className="absolute left-0 top-0 h-[98px] w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-4.5px] bottom-0">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 10 L0 5 L10 5 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* Bottom horizontal arrow connecting bottom-right and bottom-left flow boxes */}
          <div className="absolute" style={{ top: '261px', left: '105px', width: '97px' }}>
            <div className="absolute left-0 top-0 w-[97px] h-[1px] bg-gray-400"></div>
            <div className="absolute left-0 top-[-4.5px]">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 5 L5 0 L5 10 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* Left vertical arrow connecting top-left and bottom-left flow boxes */}
          <div className="absolute" style={{ left: '38px', top: '108px', height: '98px' }}>
            <div className="absolute left-0 top-0 h-[98px] w-[1px] bg-gray-400"></div>
            <div className="absolute left-[-4.5px] top-0">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 0 L0 5 L10 5 Z" fill="#9CA3AF" />
              </svg>
            </div>
          </div>

          {/* No horizontal arrow at top - intentionally omitted */}
        </div>

        {/* Logo - AllStarTeams logo */}
        <div className="flex justify-end mt-[-30px] pr-4">
          <img 
            src={allStarTeamsLogo} 
            alt="allstarteams" 
            className="h-[28.6px]"
            onError={(e) => {
              console.log('❌ AllStarTeams logo failed to load:', allStarTeamsLogo);
            }}
            onLoad={() => {
              console.log('✅ AllStarTeams logo loaded successfully');
            }}
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
});

export default memo(StarCard);
