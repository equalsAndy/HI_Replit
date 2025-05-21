import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon, Repeat } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { TestUsersModal } from './TestUsersModal';
import { useApplication } from '@/hooks/use-application';

interface TestUserBannerProps {
  userId: number;
  userName: string;
}

export function TestUserBanner({ userId, userName }: TestUserBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentApp, setCurrentApp } = useApplication();
  
  // Get user data
  const { data: userData } = useQuery<any>({
    queryKey: ['/api/user/profile'],
    enabled: isModalOpen, // Only fetch when modal is opened
  });
  
  // Get star card data
  const { data: starCardData } = useQuery<any>({
    queryKey: ['/api/starcard'],
    enabled: isModalOpen, // Only fetch when modal is opened
  });
  
  // Get flow attributes data
  const { data: flowAttributesData } = useQuery<any>({
    queryKey: ['/api/flow-attributes'],
    enabled: isModalOpen, // Only fetch when modal is opened
  });
  
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
    <>
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
            className="bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            onClick={() => window.location.href = '/user-home2-refactored'}
          >
            Go to Refactored App
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center"
            onClick={toggleApplication}
          >
            <Repeat className="h-4 w-4 mr-1" />
            Switch to {currentApp === 'allstarteams' ? 'Imaginal Agility' : 'AllStarTeams'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-yellow-200 border-yellow-500 text-yellow-900 hover:bg-yellow-100"
            onClick={() => setIsModalOpen(true)}
          >
            <Badge variant="outline" className="mr-2 bg-yellow-100">
              TEST USER {userId}
            </Badge>
            View/Clear Data
          </Button>
        </div>
      </div>
      
      {isModalOpen && (
        <TestUsersModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userId}
          userData={userData}
          starCardData={starCardData}
          flowAttributesData={flowAttributesData}
        />
      )}
    </>
  );
}