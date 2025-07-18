import { useDemoMode } from "@/hooks/use-demo-mode";
import { useApplication } from "@/hooks/use-application";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import { Link } from 'wouter';
import ProfileModal from "../profile/ProfileModal";
import ProfileEditor from "../profile/ProfileEditor";
import { useToast } from "@/hooks/use-toast";
import { InfoIcon, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "../auth/LogoutButton";
import TestUserBanner from "../auth/TestUserBanner";

// Environment badge helper - improved detection
const getEnvironmentBadge = () => {
  // Check multiple sources for environment detection
  const viteMode = import.meta.env.MODE;
  const nodeEnv = import.meta.env.VITE_NODE_ENV;
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  // Development detection
  if (isDev || viteMode === 'development' || window.location.hostname === 'localhost' || window.location.port === '8080') {
    return <Badge variant="destructive" className="ml-2">DEV</Badge>;
  }
  
  // Staging detection
  if (viteMode === 'staging' || window.location.hostname.includes('app2.heliotropeimaginal.com')) {
    return <Badge variant="secondary" className="ml-2">STAGING</Badge>;
  }
  
  return null;
};
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NavBar() {
  const { isDemoMode, toggleDemoMode, canUseDemoMode } = useDemoMode();
  const { currentApp, appName, appLogo } = useApplication();
  const [, navigate] = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTestInfoOpen, setIsTestInfoOpen] = useState(false);
  const { toast } = useToast();

  // Fetch the current user's profile
  const { data, isLoading: isUserLoading, refetch } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email?: string;
      title?: string;
      organization?: string;
      jobTitle?: string;
      role?: string;
      isTestUser: boolean;
      profilePicture?: string;
    }
  }>({ 
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      console.log('NavBar: Fetching user profile...');

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('NavBar: Profile fetch response status:', response.status);
      console.log('NavBar: Profile fetch response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('NavBar: Profile fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('NavBar: Profile data received:', data);
      return data;
    },
    // Optimized refetch settings to prevent auth loop
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache to prevent excessive refetching
    retry: 1
  });

  // Extract user data from the response
  const user = data?.user;
  const isTestUser = user?.isTestUser || false;

  useEffect(() => {
    // Log user data for debugging
    console.log("NavBar - API response:", data);
    console.log("NavBar - User extracted:", user);
    if (user) {
      console.log("User data in NavBar:", user);
      console.log("Is test user:", isTestUser);
    }
  }, [data, user, isTestUser]);

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

  // Function to reset application state when logo is clicked
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear the application selection from localStorage
    sessionStorage.removeItem('selectedApp');
    // Use window.location for a full page reload to ensure state is reset
    window.location.href = '/';
  };

  // Function to navigate to workshop reset page
  const navigateToWorkshopReset = () => {
    window.location.href = '/workshop-reset-test';
  };

  // Logout function for ProfileEditor
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Clear React Query cache
        queryClient.clear();

        // Show success toast
        toast({
          title: 'Logged out successfully',
          description: 'You have been logged out of your account.',
          variant: 'default',
        });

        // Navigate to home page
        navigate('/');

        // Force page reload to clear all state
        window.location.reload();
      } else {
        throw new Error(data.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive',
      });
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

  // Use yellow color for the header to match Heliotrope logo
  const bgColorClass = 'bg-yellow-500';

  return (
    <div className="relative">
      {/* Regular NavBar */}
      <div className={`${bgColorClass} text-white p-2 sticky top-0 z-40 flex justify-between items-center`}>
        <div className="flex-1">
          <div className="flex items-center">
            <a href="/" onClick={handleLogoClick}>
              <img 
                src={HiLogo}
                alt="Heliotrope Imaginal" 
                className="h-8 w-auto" 
              />
            </a>
            {getEnvironmentBadge()}


          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test User Badge - shown for all test users */}
          

          {/* User Controls Menu for authenticated users */}
          {user?.id ? (
            <div className="flex items-center gap-2">
              {/* Admin/Facilitator button - shown for admin and facilitator users */}
              {(user?.role === 'admin' || user?.role === 'facilitator') && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-md text-white hover:bg-yellow-400"
                  onClick={() => navigate('/admin')}
                >
                  {user?.role === 'admin' ? 'Admin' : 'Facilitator'}
                </Button>
              )}

              {/* Test User indicator - shown for test users who are not admin */}
              {user?.isTestUser && user?.role !== 'admin' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-md text-white hover:bg-yellow-400"
                  disabled
                >
                  Test User
                </Button>
              )}

              {/* Profile Editor with logout functionality */}
              <ProfileEditor
                user={user}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            /* Show ProfileEditor for all users regardless of login status */
            <ProfileEditor
              user={user}
              onLogout={handleLogout}
            />
          )}
        </div>

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}