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
import { FeedbackTrigger } from "../feedback/FeedbackTrigger";
import { detectCurrentPage } from "../../utils/pageContext";
import { useStepContextSafe } from "../../contexts/StepContext";
import BetaTesterWelcomeModal from "@/components/modals/BetaTesterWelcomeModal";

// Environment badge helper - displays dynamic version from build process
const EnvironmentBadge = () => {
  const [versionInfo, setVersionInfo] = useState({
    version: import.meta.env.VITE_APP_VERSION || 'N/A',
    build: import.meta.env.VITE_BUILD_NUMBER || '',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development'
  });

  // Debug environment variables
  useEffect(() => {
    console.log('Environment Variables Debug:', {
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
      VITE_BUILD_NUMBER: import.meta.env.VITE_BUILD_NUMBER,
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV
    });
  }, []);

  // Fetch version info from public/version.json as fallback
  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('/version.json');
        if (response.ok) {
          const data = await response.json();
          console.log('Version.json data:', data);
          setVersionInfo({
            version: data.version || 'N/A',
            build: data.build || '',
            environment: data.environment || versionInfo.environment
          });
        }
      } catch (error) {
        console.warn('Could not fetch version.json, using environment variables');
        console.error('Fetch error:', error);
      }
    };

    // Always try to fetch version.json for the most up-to-date version
    fetchVersionInfo();
  }, []);

  // Check environment detection
  const viteMode = import.meta.env.MODE;
  const isDev = import.meta.env.DEV;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.port === '8080';
  const isStaging = viteMode === 'staging' || (versionInfo.environment === 'staging' && !isLocalhost);
  const isProduction = versionInfo.environment === 'production';
  
  // Development detection (but not if version.json says staging or production)
  if ((isDev || viteMode === 'development' || isLocalhost) && versionInfo.environment !== 'staging' && versionInfo.environment !== 'production') {
    const displayVersion = versionInfo.version === 'N/A' 
      ? 'DEV version N/A' 
      : `DEV v${versionInfo.version}${versionInfo.build ? '.' + versionInfo.build : ''}`;
    
    return (
      <Badge variant="destructive" className="ml-2 text-xs">
        {displayVersion}
      </Badge>
    );
  }
  
  // Staging detection
  if (isStaging) {
    return (
      <Badge variant="secondary" className="ml-2 text-xs">
        STAGING v{versionInfo.version}.{versionInfo.build}
      </Badge>
    );
  }
  
  // Production: No badge shown (version displayed in admin/test dashboards only)
  if (isProduction) {
    return null;
  }
  
  // Default: no badge
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
  const [isBetaTesterModalOpen, setIsBetaTesterModalOpen] = useState(false);
  const { toast } = useToast();
  const { currentStepId } = useStepContextSafe();

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
      isBetaTester?: boolean;
      profilePicture?: string;
    }
  }>({ 
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      // console.log('NavBar: Fetching user profile...');

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
  const user = data?.user || data; // Handle both wrapped and direct user data
  const isTestUser = user?.isTestUser || false;

  useEffect(() => {
    // Log user data for debugging
    console.log("NavBar - API response:", data);
    console.log("NavBar - User extracted:", user);
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
            <EnvironmentBadge />


          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Test User Badge - shown for all test users */}
          

          {/* User Controls Menu for authenticated users */}
          {user?.id ? (
            <div className="flex items-center gap-2">
              {/* Feedback button for logged in users */}
              <FeedbackTrigger 
                currentPage={detectCurrentPage(currentStepId || undefined)}
                variant="button"
                className="text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
              />

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

              {/* Beta Tester badge - shown for beta testers */}
              {user?.isBetaTester && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-md text-white hover:bg-yellow-400 cursor-pointer"
                  onClick={() => setIsBetaTesterModalOpen(true)}
                >
                  Beta Tester
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

        {/* Beta Tester Welcome Modal */}
        <BetaTesterWelcomeModal
          isOpen={isBetaTesterModalOpen}
          onClose={() => setIsBetaTesterModalOpen(false)}
          onDontShowAgain={() => {
            // This won't change the persistent setting, just closes the modal
            // The persistent setting is handled by the useBetaWelcome hook
            setIsBetaTesterModalOpen(false);
          }}
          onStartWorkshop={() => {
            setIsBetaTesterModalOpen(false);
            navigate('/allstarteams');
          }}
          user={user}
        />
      </div>
    </div>
  );
}