import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import StarCard from './StarCard';
import { useStarCardData } from '../../hooks/useStarCardData';

interface StarCardWithFetchProps {
  userId?: number;
  fallbackData?: {
    thinking: number;
    acting: number;
    feeling: number;
    planning: number;
    imageUrl: string | null;
  };
  flowAttributes?: Array<{
    text: string;
    color: string;
  }>;
  downloadable?: boolean;
}

// Component that fetches the latest Star Card data and renders the StarCard
const StarCardWithFetch: React.FC<StarCardWithFetchProps> = ({ 
  userId, 
  fallbackData,
  flowAttributes,
  downloadable = false
}) => {
  const queryClient = useQueryClient();

  console.log('🔄 StarCardWithFetch: Component rendered with userId:', userId);

  // Use the shared hook to prevent multiple simultaneous fetches
  const { data: starCardData, isLoading, refetch } = useStarCardData();

  console.log('🔄 StarCardWithFetch: StarCard data state:', { starCardData, isLoading });

  // Fetch user profile data for name, title, and organization
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Check for data in React Query response
  const hasReactQueryData = starCardData && 
                          starCardData.success !== false && // Make sure it's not an error response
                          (Number(starCardData.thinking) > 0 || 
                           Number(starCardData.acting) > 0 ||
                           Number(starCardData.feeling) > 0 ||
                           Number(starCardData.planning) > 0);

  // Check fallback data
  const hasFallbackData = fallbackData &&
                         (Number(fallbackData.thinking) > 0 || 
                          Number(fallbackData.acting) > 0 || 
                          Number(fallbackData.feeling) > 0 || 
                          Number(fallbackData.planning) > 0);

  // Create the final data object
  let finalData: any = null;

  if (hasReactQueryData) {
    // React Query format
    finalData = {
      thinking: Number(starCardData.thinking),
      acting: Number(starCardData.acting),
      feeling: Number(starCardData.feeling),
      planning: Number(starCardData.planning),
      imageUrl: starCardData.imageUrl || null
    };
  } else if (hasFallbackData && fallbackData) {
    // Fallback data format
    finalData = {
      thinking: Number(fallbackData.thinking),
      acting: Number(fallbackData.acting),
      feeling: Number(fallbackData.feeling),
      planning: Number(fallbackData.planning),
      imageUrl: fallbackData.imageUrl || null
    };
  }

  if (isLoading || profileLoading) {
    return <div className="p-8 text-center">Loading your Star Card...</div>;
  }

  // In case we still don't have data, show empty state
  if (!finalData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">No Star Card data available</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  // Log final data (minimal)
  // console.log("StarCard final data for rendering:", finalData);

  // Create a profile object for the star card using actual user data
  const user = userProfile?.user || userProfile;
  
  // Debug logging for profile data
  console.log('🎯 StarCardWithFetch Profile Debug:', {
    userProfile,
    extractedUser: user,
    name: user?.name,
    username: user?.username,
    profilePicture: user?.profilePicture ? 'Present (base64)' : 'Missing',
    title: user?.title,
    organization: user?.organization
  });

  console.log('🎯 StarCardWithFetch Final Profile Being Passed:', {
    name: user?.name || user?.username || '',
    title: user?.title || '',
    organization: user?.organization || '',
    avatarUrl: user?.profilePicture ? 'Present' : 'Missing'
  });
  
  const profile = {
    name: user?.name || user?.username || '',
    title: user?.title || '',
    organization: user?.organization || '',
    avatarUrl: user?.profilePicture || null
  };
  
  // console.log('🎯 StarCardWithFetch Final Profile:', profile);

  return (
    <StarCard
      profile={profile}
      thinking={finalData.thinking}
      acting={finalData.acting}
      feeling={finalData.feeling}
      planning={finalData.planning}
      imageUrl={finalData.imageUrl || profile.avatarUrl}
      state={finalData.state} // Important: pass the state to force quadrant display
      flowAttributes={flowAttributes}
      downloadable={downloadable}
    />
  );
};

export default StarCardWithFetch;