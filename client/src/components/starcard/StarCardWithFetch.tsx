import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StarCard from './StarCard';

interface StarCardWithFetchProps {
  userId?: number;
  fallbackData?: {
    thinking: number;
    acting: number;
    feeling: number;
    planning: number;
    imageUrl: string | null;
  };
}

// Component that fetches the latest Star Card data and renders the StarCard
const StarCardWithFetch: React.FC<StarCardWithFetchProps> = ({ userId, fallbackData }) => {
  // Use React Query to fetch the latest star card data
  const { data: starCardData, isLoading } = useQuery<any>({
    queryKey: ['/api/starcard'],
    enabled: true,
    staleTime: 10000, // Refetch after 10 seconds
  });

  // For direct API fallback
  const [directData, setDirectData] = useState<any>(null);
  const [isDirectLoading, setIsDirectLoading] = useState(false);

  // If React Query fails, try direct fetch as fallback
  useEffect(() => {
    // Only fetch if we don't have data from React Query
    if (!starCardData || 
        (starCardData.thinking === 0 && starCardData.acting === 0 && 
         starCardData.feeling === 0 && starCardData.planning === 0)) {
      setIsDirectLoading(true);
      fetch('/api/starcard', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          console.log("Direct fetch starcard data:", data);
          setDirectData(data);
        })
        .catch(err => {
          console.error("Error fetching star card data:", err);
        })
        .finally(() => {
          setIsDirectLoading(false);
        });
    }
  }, [starCardData]);

  // Determine which data source to use
  const effectiveData = starCardData && 
                      (starCardData.thinking > 0 || 
                       starCardData.acting > 0 || 
                       starCardData.feeling > 0 || 
                       starCardData.planning > 0) 
                      ? starCardData
                      : directData && 
                        (directData.thinking > 0 || 
                         directData.acting > 0 || 
                         directData.feeling > 0 || 
                         directData.planning > 0) 
                        ? directData
                        : fallbackData;

  if (isLoading || isDirectLoading) {
    return <div className="p-8 text-center">Loading your Star Card...</div>;
  }

  // Log the data we're using for the star card
  console.log("StarCardWithFetch rendering with data:", effectiveData);

  // Ensure we have valid data
  const validatedData = {
    thinking: Number(effectiveData?.thinking) || 0,
    acting: Number(effectiveData?.acting) || 0, 
    feeling: Number(effectiveData?.feeling) || 0,
    planning: Number(effectiveData?.planning) || 0,
    imageUrl: effectiveData?.imageUrl || null
  };

  // Create a profile object for the star card
  const profile = {
    name: '',
    title: '',
    organization: ''
  };

  return (
    <StarCard
      profile={profile}
      thinking={validatedData.thinking}
      acting={validatedData.acting}
      feeling={validatedData.feeling}
      planning={validatedData.planning}
      imageUrl={validatedData.imageUrl}
    />
  );
};

export default StarCardWithFetch;