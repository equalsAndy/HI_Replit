
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { RefreshCw, RotateCcw } from 'lucide-react';

interface TestUserBannerProps {
  userId?: number;
  userName?: string;
  className?: string;
}

export function TestUserBanner({ 
  userId, 
  userName, 
  className = '' 
}: TestUserBannerProps) {
  // Fetch the current user profile if not provided
  const { data: userData, isLoading } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email: string | null;
      title: string | null;
      organization: string | null;
      role?: string;
      isTestUser?: boolean;
    }
  }>({
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    enabled: !userId, // Only fetch if userId not provided
  });

  if (isLoading && !userId) return null;

  const user = userData?.user;
  const currentUserId = userId || user?.id;
  const currentUserName = userName || user?.name || user?.username;
  const isTestUser = user?.isTestUser || /^(admin|participant|participant\d+|facilitator|facilitator\d+|user\d+)$/i.test(user?.username || '');

  if (!currentUserId || !isTestUser) return null;

  return (
    <div className={`bg-yellow-100 border-b border-yellow-200 px-4 py-2 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-300">
              TEST USER
            </Badge>
            <span className="text-yellow-800 font-medium">
              {currentUserName} (ID: {currentUserId})
            </span>
          </div>
          <span className="text-yellow-700 text-sm">
            You are using a test account - all actions and data are for testing purposes only
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={() => {
              // Switch between applications
              const currentApp = sessionStorage.getItem('selectedApp') || 'ast';
              const newApp = currentApp === 'ast' ? 'imaginal-agility' : 'ast';
              sessionStorage.setItem('selectedApp', newApp);
              window.location.href = newApp === 'ast' ? '/allstarteams' : '/imaginal-agility';
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Switch App
          </Button>
          
          <Link href="/workshop-reset">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset Data
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TestUserBanner;
