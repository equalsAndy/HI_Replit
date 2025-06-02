import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { RefreshCw, ArrowLeftRight } from 'lucide-react';
import { useApplication } from '@/hooks/use-application';

interface TestUserBannerProps {
  className?: string;
  showInHeader?: boolean;
  user?: {
    id?: number;
    name?: string;
    username?: string;
    role?: string;
    isTestUser?: boolean;
  }
}

export function TestUserBanner({ 
  className = '', 
  showInHeader = false,
  user
}: TestUserBannerProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currentApp } = useApplication();
  
  // Always show the banner for testing purposes
  // Comment the next line when done testing
  // if (!user?.id || user.isTestUser !== true) return null;
  
  // Style based on role
  const getBadgeStyle = () => {
    if (!user?.role) return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    
    switch(user.role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
      case 'facilitator':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'participant':
      default:
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    }
  };
  
  // Function to reset user data - navigate to workshop reset page
  const handleResetUserData = () => {
    // Navigate to the workshop reset page
    window.location.href = '/workshop-reset-test';
  };

  // Function to toggle between applications
  const toggleApplication = () => {
    // Toggle to the other application
    const newApp = currentApp === 'allstarteams' ? 'imaginal-agility' : 'allstarteams';
    
    if (newApp === 'allstarteams') {
      navigate('/allstarteams');
    } else {
      navigate('/imaginal-agility');
    }
  };

  if (showInHeader) {
    return (
      <div className="absolute top-0 left-0 right-0 bg-blue-100 text-blue-800 px-4 py-2 flex justify-between items-center">
        <span className="font-medium">TEST MODE: All actions and data are for testing purposes only</span>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center"
            onClick={toggleApplication}
          >
            <ArrowLeftRight className="h-4 w-4 mr-1" />
            <span>Switch to {currentApp === 'allstarteams' ? 'Imaginal Agility' : 'AllStarTeams'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-red-600 border-red-200 hover:bg-red-50 flex items-center"
            onClick={handleResetUserData}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span>Reset Data</span>
          </Button>
        </div>
      </div>
    );
  }

  // Don't show individual test user badges
  return null;
}

export default TestUserBanner;