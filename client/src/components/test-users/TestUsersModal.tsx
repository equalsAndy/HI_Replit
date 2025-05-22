import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TestUsersModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
  userData: any;
  starCardData: any;
  flowAttributesData: any;
}

export function TestUsersModal({
  open,
  onClose,
  userId,
  userData,
  starCardData,
  flowAttributesData,
}: TestUsersModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      if (!userId) return null;
      const res = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem('allstarteams-navigation-progress');
      localStorage.removeItem('imaginal-agility-navigation-progress');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries();
      
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

  // Determine if user has any data that can be cleared
  const hasData = (
    (starCardData && (
      starCardData.thinking > 0 || 
      starCardData.acting > 0 || 
      starCardData.feeling > 0 || 
      starCardData.planning > 0 ||
      starCardData.imageUrl
    )) ||
    (flowAttributesData && flowAttributesData.attributes && 
      Array.isArray(flowAttributesData.attributes) && 
      flowAttributesData.attributes.length > 0
    )
  );
  
  // Determine if user has flow data specifically
  const hasFlowData = !!(
    flowAttributesData && 
    (flowAttributesData.flowScore || 
     (flowAttributesData.attributes && 
      Array.isArray(flowAttributesData.attributes) && 
      flowAttributesData.attributes.length > 0))
  );
  
  // Log the hasData condition to help debug
  console.log("Has data condition:", { 
    hasData, 
    hasFlowData,
    starCardData: starCardData ? {
      thinking: starCardData.thinking,
      acting: starCardData.acting,
      feeling: starCardData.feeling,
      planning: starCardData.planning,
      imageUrl: !!starCardData.imageUrl
    } : null,
    flowAttributes: flowAttributesData ? {
      hasAttributes: !!flowAttributesData.attributes,
      attributesLength: flowAttributesData.attributes ? flowAttributesData.attributes.length : 0,
      flowScore: flowAttributesData.flowScore
    } : null
  });

  // Progress tracking constants
  const PROGRESS_STORAGE_KEY = 'allstarteams-navigation-progress';
  
  // Clear user data only mutation (doesn't reset progress)
  const clearUserData = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      // Don't remove local storage progress
      // localStorage.removeItem(PROGRESS_STORAGE_KEY);
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      toast({
        title: "User data cleared",
        description: `Data for Test User ${userId} has been cleared, but navigation progress remains intact.`,
      });
      
      // Close the modal
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to clear user data",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Reset user data AND progress mutation
  const resetUserData = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      // Clear local storage progress
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      localStorage.removeItem('imaginal-agility-navigation-progress');
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      toast({
        title: "Complete reset",
        description: `All data and navigation progress for Test User ${userId} has been reset.`,
      });
      
      // Close the modal
      onClose();
      
      // Force page reload to ensure navigation state is reset
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast({
        title: "Failed to reset user completely",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Clear flow data only mutation
  const clearFlowData = useMutation({
    mutationFn: async () => {
      // Create a completely new flow data object with empty attributes
      const flowData = {
        userId,
        flowScore: 0,
        attributes: [] // Completely empty attributes array
      };
      
      // Update the flow attributes to clear the data
      const res = await apiRequest('POST', `/api/flow-attributes`, flowData);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all queries to ensure data is refreshed everywhere
      queryClient.invalidateQueries();
      
      toast({
        title: "Flow data cleared",
        description: `Flow assessment data for Test User ${userId} has been cleared.`,
      });
      
      // Close the modal to refresh the view
      onClose();
      
      // Optional: Force a reload to ensure all components see the changes
      setTimeout(() => window.location.reload(), 500);
    },
    onError: (error) => {
      toast({
        title: "Failed to clear flow data",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Test User Data
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
              TEST MODE
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Viewing data for Test User {userId}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-md bg-muted p-4 overflow-auto max-h-[300px]">
            <h3 className="font-medium mb-2">User Profile Data:</h3>
            <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
            
            <h3 className="font-medium mb-2 mt-4">Star Card Data:</h3>
            <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(starCardData, null, 2)}
            </pre>
            
            <h3 className="font-medium mb-2 mt-4">Flow Attributes Data:</h3>
            <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(flowAttributesData, null, 2)}
            </pre>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {/* Clear Flow Data button */}
          {hasFlowData && (
            <Button 
              variant="outline" 
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-300"
              onClick={() => clearFlowData.mutate()}
              disabled={clearFlowData.isPending}
            >
              {clearFlowData.isPending ? "Clearing..." : "Clear Flow Data Only"}
            </Button>
          )}
          
          {/* Clear Data Only button (doesn't reset progress) */}
          <Button 
            variant="outline"
            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-300"
            onClick={() => clearUserData.mutate()}
            disabled={!hasData || clearUserData.isPending}
          >
            {clearUserData.isPending ? "Clearing..." : "Clear Data Only"}
          </Button>
          
          {/* Reset Progress AND Data button */}
          <Button 
            variant="destructive" 
            onClick={() => resetUserData.mutate()}
            disabled={resetUserData.isPending}
          >
            <span className="mr-2">↻</span>
            {resetUserData.isPending ? "Resetting..." : "Reset Progress & Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}