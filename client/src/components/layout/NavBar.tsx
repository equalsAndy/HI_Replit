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
import { useToast } from "@/hooks/use-toast";
import { InfoIcon, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "../auth/LogoutButton";
import TestUserBanner from "../auth/TestUserBanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { currentApp, appName, appLogo } = useApplication();
  const [, navigate] = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTestInfoOpen, setIsTestInfoOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch the current user's profile
  const { data: user, isLoading: isUserLoading } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
    role?: string;
  }>({ 
    queryKey: ['/api/user/profile'],
    // Only refetch on window focus or when explicitly invalidated
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    retry: 2
  });
  
  useEffect(() => {
    // Log user data for debugging
    if (user) {
      console.log("User data loaded:", user);
    }
  }, [user]);
  
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

  // Determine if this is a test user - making it more inclusive to match any test user
  const isTestUser = user?.username && /^(admin|participant|participant\d+|facilitator|facilitator\d+|user\d+)$/i.test(user.username);

  // Use yellow color for the header to match Heliotrope logo
  const bgColorClass = 'bg-yellow-500';
  
  return (
    <div className={`${bgColorClass} text-white p-2 sticky top-0 z-50 flex justify-between items-center`}>
      {/* If user is loaded and is a test user, show a banner at the top */}
      {isTestUser && <TestUserBanner showInHeader={true} />}
      
      <div className="flex-1">
        <div className="flex items-center">
          <a href="/" onClick={handleLogoClick}>
            <img 
              src={HiLogo}
              alt="Heliotrope Imaginal" 
              className="h-8 w-auto" 
            />
          </a>
          
          {/* Show app name if available */}
          {currentApp && (
            <span className="ml-2 font-semibold hidden md:inline">
              {currentApp === 'allstarteams' ? 'AllStarTeams' : 'Imaginal Agility'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Test User Badge - shown for all test users */}
        {user?.id && isTestUser && (
          <TestUserBanner className="p-0" />
        )}
        
        {/* User Controls Menu */}
        {user?.id && (
          <div className="flex items-center gap-2">
            {/* Info/Settings Button */}
            <Dialog open={isTestInfoOpen} onOpenChange={setIsTestInfoOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-md bg-white text-yellow-600 hover:bg-yellow-100"
                >
                  <InfoIcon className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>User Settings</DialogTitle>
                  <DialogDescription>
                    Manage your account and workshop settings
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-3 p-4">
                  <Badge variant="outline" className="bg-yellow-100 self-start px-3 py-1.5">
                    <span className="font-medium">
                      {user?.name || user?.username} ({user?.role})
                    </span>
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center self-start"
                    onClick={toggleApplication}
                  >
                    Switch to {currentApp === 'allstarteams' ? 'Imaginal Agility' : 'AllStarTeams'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-red-600 border-red-200 hover:bg-red-50 flex items-center self-start"
                    onClick={navigateToWorkshopReset}
                  >
                    Reset Workshop Data
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Admin button - only shown for admin users */}
            {user?.role === 'admin' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-md text-white hover:bg-yellow-400"
                onClick={() => navigate('/admin')}
              >
                Admin
              </Button>
            )}
            
            {/* Profile button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-md text-white hover:bg-yellow-400"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <User className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">Profile</span>
            </Button>
            
            {/* Logout button */}
            <LogoutButton 
              variant="outline" 
              size="sm" 
              className="rounded-md bg-white text-yellow-600 hover:bg-yellow-100 flex items-center"
            />
          </div>
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
  );
}