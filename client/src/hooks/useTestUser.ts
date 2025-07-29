import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useTestUser = () => {
  const queryClient = useQueryClient();
  
  // EMERGENCY FIX: Removed forced invalidation that was causing infinite loops
  // This was causing invalidateQueries -> refetch -> re-render -> invalidateQueries cycle
  
  const { data: userData, isLoading, error } = useQuery<{
    id: number;
    name: string;
    username: string;
    email: string | null;
    title: string | null;
    organization: string | null;
    role?: string;
    isTestUser?: boolean;
  }>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      console.log('🔍 Fetching user data from /api/auth/me...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Auth response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 Auth error response:', errorText);
        throw new Error(`Auth failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔍 Auth response data:', data);
      return data;
    },
    refetchOnWindowFocus: false, // Don't refetch on every focus
    refetchOnMount: false, // Don't refetch on every mount
    staleTime: 5 * 60 * 1000, // 5 minutes - consistent with other auth queries
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
  
  // Fix: The API returns the user data directly at the top level
  const user = userData;
  const isTestUser = user?.isTestUser === true;
  const isAdmin = user?.role === 'admin';
  
  // Admin users automatically get test user privileges  
  const hasTestAccess = isTestUser || isAdmin;
  
  // Temporary: Removed debug logging to fix React error #310
  
  // SECURE: Only database field and admin role, no username patterns
  return {
    isTestUser: hasTestAccess,
    // Simplified logic for testing - Test users and admins always see demo buttons
    shouldShowDemoButtons: hasTestAccess,
    user
  };
};