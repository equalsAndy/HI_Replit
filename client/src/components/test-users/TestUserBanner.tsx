import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { TestUsersModal } from './TestUsersModal';

interface TestUserBannerProps {
  userId: number;
  userName: string;
}

export function TestUserBanner({ userId, userName }: TestUserBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  return (
    <>
      <div className="bg-yellow-300 text-yellow-900 py-2 px-4 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <InfoIcon className="h-4 w-4" />
          <span>
            You are using a test account. Any data entered will be temporary.
          </span>
        </div>
        
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