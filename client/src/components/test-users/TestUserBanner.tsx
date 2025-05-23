import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon, Repeat } from "lucide-react";
import { useApplication } from '@/hooks/use-application';

interface TestUserBannerProps {
  userId: number;
  userName: string;
}

export function TestUserBanner({ userId, userName }: TestUserBannerProps) {
  const { currentApp, setCurrentApp } = useApplication();

  // Function to toggle between applications
  const toggleApplication = () => {
    // Toggle to the other application
    const newApp = currentApp === 'allstarteams' ? 'imaginal-agility' : 'allstarteams';
    setCurrentApp(newApp);
    localStorage.setItem('selectedApp', newApp);

    // Navigate to the appropriate page
    if (newApp === 'allstarteams') {
      window.location.href = '/user-home2-refactored';
    } else {
      window.location.href = '/imaginal-agility';
    }
  };

  return (
    <div className="bg-yellow-300 text-yellow-900 py-2 px-4 text-sm flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <InfoIcon className="h-4 w-4" />
        <span>
          You are using a test account. Any data entered will be temporary.
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center"
          onClick={toggleApplication}
        >
          <Repeat className="h-4 w-4 mr-1" />
          Switch to {currentApp === 'allstarteams' ? 'Imaginal Agility' : 'AllStarTeams'}
        </Button>

        <Badge variant="outline" className="bg-yellow-100">
            {userName || `TEST USER ${userId}`}
          </Badge>
      </div>
    </div>
  );
}