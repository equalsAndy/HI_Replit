import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoIcon, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TestUsersModal } from './TestUsersModal';

interface TestUserBannerProps {
  userId: number;
  userName: string;
}

export function TestUserBanner({ userId, userName }: TestUserBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
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
  
  // Progress tracking constants
  const PROGRESS_STORAGE_KEY = 'allstarteams-navigation-progress';
  
  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      // Clear local storage progress
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
      
      toast({
        title: "Progress Reset",
        description: "Your progress has been reset successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset progress: " + String(error),
        variant: "destructive"
      });
    }
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
        
        <div className="flex flex-col gap-2 items-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-yellow-200 border-yellow-500 text-yellow-900 hover:bg-yellow-100 w-full"
            onClick={() => setIsModalOpen(true)}
          >
            <Badge variant="outline" className="mr-2 bg-yellow-100">
              TEST USER {userId}
            </Badge>
            View/Clear Data
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-yellow-200 border-yellow-500 text-yellow-900 hover:bg-yellow-100 flex items-center gap-1"
            onClick={() => resetUserProgress.mutate()}
            disabled={resetUserProgress.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            {resetUserProgress.isPending ? "Resetting..." : "Reset Progress"}
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