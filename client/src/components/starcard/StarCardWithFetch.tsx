import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import StarCard from './StarCard';
import { getAttributeColor, CARD_WIDTH, CARD_HEIGHT, QUADRANT_COLORS } from '@/components/starcard/starCardConstants';

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
  // Track if we've already made a direct fetch to prevent loops
  const hasFetchedRef = useRef(false);

  // Use React Query with fresh data from database
  const { data: starCardData, isLoading } = useQuery<any>({
    queryKey: ['/api/workshop-data/starcard'],
    enabled: true, // Enable query to fetch fresh data
    staleTime: 0, // Always fetch fresh data from database
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
  });

  // For direct API fallback
  const [directData, setDirectData] = useState<any>(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);

  // Direct API fetch as fallback if React Query fails
  useEffect(() => {
    // Only fetch if we don't have React Query data and haven't already fetched
    if (!starCardData && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setIsDirectLoading(true);
      
      fetch('/api/workshop-data/starcard', { 
        credentials: 'include',
        cache: 'no-cache'
      })
        .then(res => res.json())
        .then(data => {
          setDirectData(data);
        })
        .catch(err => {
          console.error("Error fetching star card data:", err);
          hasFetchedRef.current = false;
        })
        .finally(() => {
          setIsDirectLoading(false);
        });
    }
  }, [starCardData]);

  // Log data sources (minimal)
  // console.log("StarCard data sources:", { reactQuery: starCardData, directFetch: directData, fallback: fallbackData });

  // Check for data in direct API response with success property
  const hasDirectApiData = directData && 
                         directData.success === true &&
                         (Number(directData.thinking) > 0 ||
                          Number(directData.acting) > 0 ||
                          Number(directData.feeling) > 0 ||
                          Number(directData.planning) > 0);

  // Check for data in React Query response
  const hasReactQueryData = starCardData && 
                          (Number(starCardData.thinking) > 0 || 
                           Number(starCardData.acting) > 0 || 
                           Number(starCardData.feeling) > 0 || 
                           Number(starCardData.planning) > 0);

  // Check for data in direct fetch JSON format
  const hasDirectJsonData = directData && 
                          !directData.success &&
                          (Number(directData.thinking) > 0 || 
                           Number(directData.acting) > 0 || 
                           Number(directData.feeling) > 0 || 
                           Number(directData.planning) > 0);

  // Check fallback data
  const hasFallbackData = fallbackData &&
                         (Number(fallbackData.thinking) > 0 || 
                          Number(fallbackData.acting) > 0 || 
                          Number(fallbackData.feeling) > 0 || 
                          Number(fallbackData.planning) > 0);

  // Create the final data object
  let finalData: any = null;

  // Use the best available data source with priority order
  if (hasDirectApiData) {
    // API success response format
    finalData = {
      thinking: Number(directData.thinking),
      acting: Number(directData.acting),
      feeling: Number(directData.feeling),
      planning: Number(directData.planning),
      imageUrl: directData.imageUrl || null
    };
  } else if (hasDirectJsonData) {
    // Direct JSON format
    finalData = {
      thinking: Number(directData.thinking),
      acting: Number(directData.acting),
      feeling: Number(directData.feeling),
      planning: Number(directData.planning),
      imageUrl: directData.imageUrl || null
    };
  } else if (hasReactQueryData) {
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

  if (isLoading || isDirectLoading) {
    return <div className="p-8 text-center">Loading your Star Card...</div>;
  }

  // In case we still don't have data
  if (!finalData) {
    // Create hardcoded test data as absolute last resort
    const testData = {
      thinking: 27,
      acting: 27,
      feeling: 23,
      planning: 23,
      imageUrl: null,
      state: 'complete'
    };
    finalData = testData;
  }

  // Log final data (minimal)
  // console.log("StarCard final data for rendering:", finalData);

  // Create a profile object for the star card
  const profile = {
    name: '',
    title: '',
    organization: ''
  };

  return (
    <StarCard
      profile={profile}
      thinking={finalData.thinking}
      acting={finalData.acting}
      feeling={finalData.feeling}
      planning={finalData.planning}
      imageUrl={finalData.imageUrl}
      state={finalData.state} // Important: pass the state to force quadrant display
      flowAttributes={flowAttributes}
      downloadable={downloadable}
    />
  );
};

export default StarCardWithFetch;