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
    (starCardData && starCardData.state && starCardData.state !== 'empty') ||
    (flowAttributesData && flowAttributesData.attributes && flowAttributesData.attributes.some((a: any) => a.value > 0))
  );

  // Reset user data mutation
  const resetUserData = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
      
      toast({
        title: "User data cleared",
        description: `All data for Test User ${userId} has been reset.`,
      });
      
      // Close the modal
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to reset user data",
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => resetUserData.mutate()}
            disabled={!hasData || resetUserData.isPending}
          >
            {resetUserData.isPending ? "Clearing..." : "Clear User Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}