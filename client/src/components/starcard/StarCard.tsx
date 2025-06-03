import React, { useState, useRef, useMemo, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { FlowAttribute, ProfileData, QuadrantData } from '@shared/schema';
import { downloadElementAsImage } from '@/lib/html2canvas';
import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import allStarTeamsLogo from '@assets/all-star-teams-logo-250px.png';
import cloudImage from '@assets/starcardcloudimage.png';

// Profile data interface
interface ProfileData {
  name: string;
  title: string;
  organization: string;
  avatarUrl?: string;
}

// Helper function to get attribute color based on quadrant mapping
const getAttributeColor = (text: string): string => {
  if (!text) return 'rgb(156, 163, 175)'; // Default gray
  
  // Default to primary colors by category
  const attrColorMap: { [key: string]: string } = {
    // Thinking quadrant attributes (green)
    'Analytical': 'rgb(1, 162, 82)',
    'Strategic': 'rgb(1, 162, 82)',
    'Thoughtful': 'rgb(1, 162, 82)',
    'Clever': 'rgb(1, 162, 82)',
    'Innovative': 'rgb(1, 162, 82)',
    'Investigative': 'rgb(1, 162, 82)',
    'Abstract': 'rgb(1, 162, 82)',
    'Analytic': 'rgb(1, 162, 82)',
    'Astute': 'rgb(1, 162, 82)',
    'Big Picture': 'rgb(1, 162, 82)',
    'Curious': 'rgb(1, 162, 82)',
    'Focussed': 'rgb(1, 162, 82)',
    'Insightful': 'rgb(1, 162, 82)',
    'Logical': 'rgb(1, 162, 82)',
    'Rational': 'rgb(1, 162, 82)',
    'Reflective': 'rgb(1, 162, 82)',
    'Sensible': 'rgb(1, 162, 82)',
    
    // Acting quadrant attributes (red)
    'Energetic': 'rgb(241, 64, 64)',
    'Bold': 'rgb(241, 64, 64)',
    'Decisive': 'rgb(241, 64, 64)',
    'Proactive': 'rgb(241, 64, 64)',
    'Persistent': 'rgb(241, 64, 64)',
    'Physical': 'rgb(241, 64, 64)',
    'Confident': 'rgb(241, 64, 64)',
    'Adaptable': 'rgb(241, 64, 64)',
    'Adventurous': 'rgb(241, 64, 64)',
    'Assertive': 'rgb(241, 64, 64)',
    'Brave': 'rgb(241, 64, 64)',
    'Capable': 'rgb(241, 64, 64)',
    'Challenging': 'rgb(241, 64, 64)',
    'Courageous': 'rgb(241, 64, 64)',
    'Dynamic': 'rgb(241, 64, 64)',
    'Fearless': 'rgb(241, 64, 64)',
    'Resolute': 'rgb(241, 64, 64)',
    'Resourceful': 'rgb(241, 64, 64)',
    'Strong': 'rgb(241, 64, 64)',
    'Competitive': 'rgb(241, 64, 64)',
    'Effortless': 'rgb(241, 64, 64)',
    
    // Feeling quadrant attributes (blue)
    'Empathetic': 'rgb(22, 126, 253)',
    'Friendly': 'rgb(22, 126, 253)',
    'Supportive': 'rgb(22, 126, 253)',
    'Compassionate': 'rgb(22, 126, 253)',
    'Intuitive': 'rgb(22, 126, 253)',
    'Empathic': 'rgb(22, 126, 253)',
    'Accepting': 'rgb(22, 126, 253)',
    'Authentic': 'rgb(22, 126, 253)',
    'Calm': 'rgb(22, 126, 253)',
    'Caring': 'rgb(22, 126, 253)',
    'Connected': 'rgb(22, 126, 253)',
    'Considerate': 'rgb(22, 126, 253)',
    'Diplomatic': 'rgb(22, 126, 253)',
    'Emotional': 'rgb(22, 126, 253)',
    'Generous': 'rgb(22, 126, 253)',
    'Gentle': 'rgb(22, 126, 253)',
    'Grateful': 'rgb(22, 126, 253)',
    'Harmonious': 'rgb(22, 126, 253)',
    'Helpful': 'rgb(22, 126, 253)',
    'Kind': 'rgb(22, 126, 253)',
    'Open': 'rgb(22, 126, 253)',
    'Sociable': 'rgb(22, 126, 253)',
    'Vulnerable': 'rgb(22, 126, 253)',
    'Passionate': 'rgb(22, 126, 253)',
    
    // Planning quadrant attributes (yellow)
    'Organized': 'rgb(255, 203, 47)',
    'Meticulous': 'rgb(255, 203, 47)',
    'Reliable': 'rgb(255, 203, 47)',
    'Consistent': 'rgb(255, 203, 47)',
    'Practical': 'rgb(255, 203, 47)',
    'Careful': 'rgb(255, 203, 47)',
    'Controlled': 'rgb(255, 203, 47)',
    'Dependable': 'rgb(255, 203, 47)',
    'Detailed': 'rgb(255, 203, 47)',
    'Diligent': 'rgb(255, 203, 47)',
    'Methodical': 'rgb(255, 203, 47)',
    'Orderly': 'rgb(255, 203, 47)',
    'Precise': 'rgb(255, 203, 47)',
    'Punctual': 'rgb(255, 203, 47)', 
    'Responsible': 'rgb(255, 203, 47)',
    'Thorough': 'rgb(255, 203, 47)',
    'Trustworthy': 'rgb(255, 203, 47)',
    'Immersed': 'rgb(255, 203, 47)',
  };
  
  // Try exact match first
  if (attrColorMap[text]) {
    return attrColorMap[text];
  }
  
  // Fallback to default gray for unrecognized attributes
  return 'rgb(156, 163, 175)';
};

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

function StarCard({ 
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
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [fetchedFlowAttributes, setFetchedFlowAttributes] = useState<FlowAttribute[]>([]);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Add state for fetched assessment data
  const [fetchedAssessmentData, setFetchedAssessmentData] = useState<QuadrantData | null>(null);

  // Fetch user profile, flow attributes, and assessment data directly
  React.useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        // Only fetch if we don't already have user profile data
        if (!userProfileData && isMounted) {
          console.log('StarCard: Attempting to fetch user profile...');
          const profileResponse = await fetch('/api/user/profile', {
            credentials: 'include'
          });

          console.log('StarCard: Profile response status:', profileResponse.status);

          if (profileResponse.ok && isMounted) {
            const data = await profileResponse.json();
            console.log('StarCard: Fetched user profile data:', data);
            const userData = data.success && data.user ? data.user : data;
            console.log('StarCard: Processed user data:', userData);
            setUserProfileData(userData);
          }
        }

        // Fetch assessment data if not provided as props or if scores are zero
        const hasValidScores = quadrantData && (
          quadrantData.thinking > 0 || quadrantData.acting > 0 || 
          quadrantData.feeling > 0 || quadrantData.planning > 0
        );

        if (!hasValidScores && (!thinking || !acting || !feeling || !planning) && !fetchedAssessmentData && isMounted) {
          console.log('StarCard: Fetching assessment data...');
          const assessmentResponse = await fetch('/api/workshop-data/starcard', {
            credentials: 'include'
          });

          if (assessmentResponse.ok && isMounted) {
            const assessmentData = await assessmentResponse.json();
            console.log('StarCard: Fetched assessment data:', assessmentData);

            if (assessmentData.success) {
              setFetchedAssessmentData({
                thinking: assessmentData.thinking || 0,
                acting: assessmentData.acting || 0,
                feeling: assessmentData.feeling || 0,
                planning: assessmentData.planning || 0
              });
            }
          }
        }

        // Only fetch flow attributes if we don't have them and haven't tried fetching them
        if ((!flowAttributes || flowAttributes.length === 0) && fetchedFlowAttributes.length === 0 && isMounted) {
          console.log('StarCard: Fetching flow attributes...');
          try {
            const flowResponse = await fetch('/api/workshop-data/flow-attributes', {
              credentials: 'include'
            });

            if (flowResponse.ok && isMounted) {
              const flowData = await flowResponse.json();
              console.log('StarCard: Fetched flow data:', flowData);

              if (flowData.attributes && Array.isArray(flowData.attributes)) {
                const coloredAttributes = flowData.attributes.map((attr: any) => ({
                  text: attr.name || attr.text,
                  color: getAttributeColor(attr.name || attr.text)
                }));
                console.log('StarCard: Setting flow attributes:', coloredAttributes);
                setFetchedFlowAttributes(coloredAttributes);
              }
            }
          } catch (flowError) {
            console.log('StarCard: Flow attributes fetch failed, continuing without:', flowError);
            // Set empty array to prevent retry
            setFetchedFlowAttributes([]);
          }
        }
      } catch (error) {
        console.error('StarCard: Error fetching data:', error);
      }
    };

    // Only run if we don't have the necessary data
    const shouldFetch = !userProfileData || 
                       (!fetchedAssessmentData && (!quadrantData || (quadrantData.thinking === 0 && quadrantData.acting === 0 && quadrantData.feeling === 0 && quadrantData.planning === 0))) ||
                       ((!flowAttributes || flowAttributes.length === 0) && fetchedFlowAttributes.length === 0);

    if (shouldFetch) {
      console.log('StarCard: Starting data fetch, current profile:', profile, 'userName:', userName);
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Create derived profile and quadrantData for backward compatibility
  const derivedProfile: ProfileData = useMemo(() => {
    // Use userProfileData if available, then fallback to props
    if (userProfileData) {
      return {
        name: userProfileData.name || 'Your Name',
        title: userProfileData.title || userProfileData.jobTitle || '',
        organization: userProfileData.organization || '',
        avatarUrl: userProfileData.profilePicture || undefined
      };
    }

    return profile || {
      name: userName || 'Your Name',
      title: userTitle || '',
      organization: userOrg || '',
      avatarUrl: undefined
    };
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
        ref={cardRef}
        className="bg-white border border-gray-200 rounded-lg p-5"
        style={{ width: '440px', height: '610px' }}
      >
        <h2 className="text-xl font-bold text-center uppercase mb-4">Star Card</h2>

        {/* User Profile */}
        <div className="flex items-center mb-6">
          <div className="rounded-full h-[70px] w-[70px] overflow-hidden mr-5 border border-gray-300">
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
            <p className="font-medium text-gray-800">{derivedProfile.name || 'Your Name'}</p>
            {derivedProfile.title && (
              <p className="text-sm text-gray-600">{derivedProfile.title}</p>
            )}
            {derivedProfile.organization && (
              <p className="text-sm text-gray-600">{derivedProfile.organization}</p>
            )}
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
              style={{ height: '88px' }}
            />

            {/* Text positioned below cloud image - moved up 10px total and 10% smaller */}
            <div className="absolute w-full" style={{ top: '50px' }}>
              <p className="text-[1.125rem] font-bold text-gray-500">Imagination</p>
              <p className="text-[0.785rem] text-gray-500 italic">Your Apex Strength</p>
            </div>
          </div>
        </div>

        {/* Main Star Card Diagram - The "cluster" moved down 10px from previous position */}
        <div className="relative mx-auto mb-6" style={{ width: '308px', height: '308px', marginTop: '-25px' }}>
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
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(3)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
              {cardState !== 'empty' && (
                <div className="text-white text-xs font-medium text-center">
                  <div>{getQuadrantAtPosition(3)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(3)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Top Right */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(0)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
              {cardState !== 'empty' && (
                <div className="text-white text-xs font-medium text-center">
                  <div>{getQuadrantAtPosition(0)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(0)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Bottom Left */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(2)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
              {cardState !== 'empty' && (
                <div className="text-white text-xs font-medium text-center">
                  <div>{getQuadrantAtPosition(2)?.label}</div>
                  <div>{normalizeScore(getQuadrantAtPosition(2)?.score || 0)}%</div>
                </div>
              )}
            </div>

            {/* Bottom Right */}
            <div className="aspect-square relative flex items-center justify-center" 
                 style={{ backgroundColor: cardState !== 'empty' ? (getQuadrantAtPosition(1)?.color || DEFAULT_COLOR) : DEFAULT_COLOR }}>
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
        <div className="flex justify-end mt-[-3px] pr-4">
          <img 
            src={allStarTeamsLogo} 
            alt="allstarteams" 
            className="h-[28.6px]" 
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

export default memo(StarCard);