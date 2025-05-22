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

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { currentApp, appName, appLogo } = useApplication();
  const [, navigate] = useLocation();
  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
    role?: string;
  }>({ queryKey: ['/api/user/profile'] });

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
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-md text-white hover:bg-yellow-400"
            onClick={() => navigate('/profile')}
          >
            Profile
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