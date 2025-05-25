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
  
  // Function to reset user data
  const handleResetUserData = async () => {
    if (!user?.id) return;
    
    try {
      // Show loading toast
      toast({
        title: "Resetting Data",
        description: "Please wait while your data is being reset...",
        variant: "default",
      });
      
      // Use the workshop reset endpoint
      const response = await fetch(`/api/test-users/reset/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Reset Successful",
          description: "Your assessment data has been reset. The page will refresh now.",
          variant: "default",
        });
        
        // Invalidate queries to force refetch
        queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
        
        // Force reload to show reset state after a brief delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset your data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "An error occurred while resetting user data. Please try again.",
        variant: "destructive",
      });
      console.error("Error resetting user data:", error);
    }
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

  return (
    <Badge 
      variant="outline" 
      className={`font-medium ${getBadgeStyle()} ${className}`}
    >
      {user?.role || 'Test User'}: {user?.name || user?.username || 'Test User'}
    </Badge>
  );
}

export default TestUserBanner;