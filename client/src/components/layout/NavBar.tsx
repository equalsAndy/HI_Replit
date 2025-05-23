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

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { currentApp, appName, appLogo } = useApplication();
  const [, navigate] = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
      
      // Use the new reset endpoint
      const response = await fetch(`/api/test/reset/${user.id}`, {
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

      <div className="flex items-center gap-4">
        {user?.id && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-md text-white hover:bg-yellow-400"
              onClick={() => setIsProfileModalOpen(true)}
            >
              Profile
            </Button>
            <ProfileModal 
              isOpen={isProfileModalOpen} 
              onClose={() => setIsProfileModalOpen(false)} 
            />
          </>
        )}
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
  );
}