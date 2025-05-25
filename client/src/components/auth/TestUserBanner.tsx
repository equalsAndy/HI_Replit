import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface TestUserBannerProps {
  className?: string;
  showInHeader?: boolean;
}

export function TestUserBanner({ 
  className = '', 
  showInHeader = false 
}: TestUserBannerProps) {
  // Fetch the current user profile
  const { data } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email: string | null;
      title: string | null;
      organization: string | null;
      role: string;
      isTestUser: boolean;
    }
  }>({
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false,
  });

  const user = data?.user;
  
  // If no user data is available or it's not loaded yet, don't show the banner
  if (!user?.id) return null;

  // Check the database field isTestUser to determine if this is a test user
  if (user.isTestUser !== true) return null;

  // Style based on role
  const getBadgeStyle = () => {
    switch(user.role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
      case 'facilitator':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'participant':
      default:
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    }
  };

  if (showInHeader) {
    return (
      <div className="absolute top-0 left-0 right-0 bg-blue-100 text-blue-800 text-center text-xs py-1 font-medium">
        TEST MODE: All actions and data are for testing purposes only
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${getBadgeStyle()} ${className}`}
    >
      {user.role}: {user.name || user.username}
    </Badge>
  );
}

export default TestUserBanner;