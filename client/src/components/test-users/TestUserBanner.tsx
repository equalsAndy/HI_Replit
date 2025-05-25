import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface TestUserBannerProps {
  className?: string;
  showInHeader?: boolean;
}

export function TestUserBanner({ 
  className = '', 
  showInHeader = false 
}: TestUserBannerProps) {
  // Fetch the current user profile
  const { data: user, isLoading } = useQuery<{
    id: number;
    name: string;
    username: string;
    email: string | null;
    title: string | null;
    organization: string | null;
    role?: string;
  }>({
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
  });

  if (isLoading || !user?.id) return null;

  // Determine if this is a test user
  const isTestUser = user.username && /^(admin|participant|participant\d+|facilitator|facilitator\d+|user\d+)$/i.test(user.username);
  
  if (!isTestUser) return null;

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
    <div className={`flex items-center ${className}`}>
      <Badge 
        variant="outline" 
        className={`font-medium flex items-center px-3 py-1 ${getBadgeStyle()}`}
      >
        {user.role}: {user.name || user.username}
      </Badge>
    </div>
  );
}

export default TestUserBanner;