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

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { currentApp, appName, appLogo } = useApplication();
  const [, navigate] = useLocation();
  const { data: user } = useQuery({ queryKey: ['/api/user/profile'] });

  // Use yellow color for the header to match Heliotrope logo
  const bgColorClass = 'bg-yellow-500';

  return (
    <div className={`${bgColorClass} text-white p-2 sticky top-0 z-50 flex justify-between items-center`}>
      <div className="flex-1">
        <div className="flex items-center">
          <img 
            src={HiLogo}
            alt="Heliotrope Imaginal" 
            className="h-8 w-auto" 
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button 
              variant="outline" 
              size="sm" 
              className="rounded-md bg-white text-yellow-600 hover:bg-yellow-100"
              onClick={() => window.location.href = 'mailto:esbin@5x5teams.com'}
            >
              Contact Us
            </Button>
      </div>
    </div>
  );
}