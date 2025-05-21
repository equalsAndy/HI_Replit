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
  
  // Reset user data and progress mutation
  const resetUserData = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      // Clear local storage progress
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      toast({
        title: "User data cleared",
        description: `All data and navigation progress for Test User ${userId} has been reset.`,
      });
      
      // Close the modal
      onClose();
      
      // Force page reload to ensure navigation state is reset
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast({
        title: "Failed to reset user data",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Clear flow data only mutation
  const clearFlowData = useMutation({
    mutationFn: async () => {
      // First get current flow attributes
      const flowData = { 
        ...flowAttributesData,
        flowScore: 0,
        attributes: []
      };
      
      // Update the flow attributes to clear the data
      const res = await apiRequest('POST', `/api/flow-attributes`, flowData);
      return res.json();
    },
    onSuccess: () => {
      // Only invalidate flow-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
      
      toast({
        title: "Flow data cleared",
        description: `Flow assessment data for Test User ${userId} has been cleared.`,
      });
      
      // Don't close the modal so user can see the updated data
      queryClient.invalidateQueries();
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
          
          {/* Clear All Data button */}
          <Button 
            variant="destructive" 
            onClick={() => resetUserData.mutate()}
            disabled={!hasData || resetUserData.isPending}
          >
            {resetUserData.isPending ? "Clearing..." : "Clear All User Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}