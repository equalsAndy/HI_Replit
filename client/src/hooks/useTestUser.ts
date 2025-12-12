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
    isDemoAccount?: boolean;
    showDemoDataButtons?: boolean;
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
  
  // Fix: The API returns {success: true, user: {...}}, extract the user object
  const user = userData?.user || userData;
  const isTestUser = user?.isTestUser === true;
  const isDemoAccount = user?.isDemoAccount === true;
  const isAdmin = user?.role === 'admin';

  // Admin users automatically get test user privileges
  const hasTestAccess = isTestUser || isDemoAccount || isAdmin;

  // Demo buttons visibility logic:
  // - Test users see demo buttons by default (for quick testing)
  // - Demo accounts see demo buttons (for presentations)
  // - Beta testers do NOT see demo buttons (they provide real data)
  // - Admin can grant permission via showDemoDataButtons for special cases
  // - Regular participants never see demo buttons
  const shouldShowDemoButtons = isAdmin || isTestUser || isDemoAccount || (user?.showDemoDataButtons === true);
  
  // Debug test user access (single log to verify fix)
  if (user && !sessionStorage.getItem('demo-buttons-logged')) {
    console.log('✅ Demo Buttons Logic:', {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        isTestUser: user.isTestUser,
        isDemoAccount: user.isDemoAccount,
        showDemoDataButtons: user.showDemoDataButtons
      },
      isTestUser,
      isDemoAccount,
      isAdmin,
      hasTestAccess,
      shouldShowDemoButtons
    });
    sessionStorage.setItem('demo-buttons-logged', 'true');
  }
  
  // SECURE: Only database field and admin role, no username patterns
  return {
    isTestUser: hasTestAccess,
    isDemoAccount,
    // Demo buttons controlled by explicit database permission or admin role
    shouldShowDemoButtons,
    user
  };
};