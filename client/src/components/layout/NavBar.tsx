import { useDemoMode } from "@/hooks/use-demo-mode";
import { useApplication } from "@/hooks/use-application";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import { Link } from 'wouter';
import ProfileModal from "../profile/ProfileModal";
import { useToast } from "@/hooks/use-toast";
import { InfoIcon, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
    role?: string;
  }>({ queryKey: ['/api/user/profile'] });
  
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
      
      // Use the correct reset endpoint that exists in the code
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

  // Use yellow color for the header to match Heliotrope logo
  const bgColorClass = 'bg-yellow-500';
  
  // Function to reset application state when logo is clicked
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear the application selection from localStorage
    localStorage.removeItem('selectedApp');
    // Use window.location for a full page reload to ensure state is reset
    window.location.href = '/';
  };

  // Function to toggle between applications
  const toggleApplication = () => {
    // Toggle to the other application
    const newApp = currentApp === 'allstarteams' ? 'imaginal-agility' : 'allstarteams';
    
    if (newApp === 'allstarteams') {
      window.location.href = '/user-home2-refactored';
    } else {
      window.location.href = '/imaginal-agility';
    }
  };

  return (
    <div className={`${bgColorClass} text-white p-2 sticky top-0 z-50 flex justify-between items-center`}>
      <div className="flex-1">
        <div className="flex items-center">
          <a href="/" onClick={handleLogoClick}>
            <img 
              src={HiLogo}
              alt="Heliotrope Imaginal" 
              className="h-8 w-auto" 
            />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Test User Info button - only shown on mobile */}
        {user?.id && (
          <Dialog open={isTestInfoOpen} onOpenChange={setIsTestInfoOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="md:hidden rounded-md bg-white text-yellow-600 hover:bg-yellow-100"
              >
                <InfoIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Test User Information</DialogTitle>
                <DialogDescription>
                  You are using a test account. Any data entered will be temporary.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-3 p-4">
                <Badge variant="outline" className="bg-yellow-100 self-start">
                  {user?.name || `TEST USER ${user?.id}`}
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
                  onClick={() => window.location.href = '/workshop-reset'}
                >
                  Reset All Data
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Only show these controls on desktop */}
        <div className="hidden md:flex items-center gap-4">
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
          {/* Reset Data button - for development testing */}
          {user?.id && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-md text-white hover:bg-yellow-400 border border-white"
              onClick={handleResetUserData}
            >
              Reset Data
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-md bg-white text-yellow-600 hover:bg-yellow-100"
            onClick={() => window.location.href = 'mailto:esbin@5x5teams.com'}
          >
            Contact Us
          </Button>
          {user?.id && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-md text-white hover:bg-yellow-400"
              onClick={() => navigate('/logout')}
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}