import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface TestUserBannerProps {
  className?: string;
}

export function TestUserBanner({ className = '' }: TestUserBannerProps) {
  // Fetch the current user profile
  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    email: string | null;
    title: string | null;
    organization: string | null;
    role?: string;
  }>({
    queryKey: ['/api/user/profile'],
  });

  if (!user?.username) return null;

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

  // Only show banner for test users (those that match our test pattern)
  const isTestUser = /^(admin|participant\d+|facilitator\d+)$/i.test(user.username);
  
  if (!isTestUser) return null;

  return (
    <div className={`px-3 py-1 flex items-center justify-center ${className}`}>
      <Badge 
        variant="outline" 
        className={`font-medium ${getBadgeStyle()}`}
      >
        Test User: {user.username} ({user.role})
      </Badge>
    </div>
  );
}

export default TestUserBanner;