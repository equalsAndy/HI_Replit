import React, { useState } from 'react';
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
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, AlertCircle } from 'lucide-react';

interface TestUserPickerProps {
  open: boolean;
  onClose: () => void;
}

export function TestUserPicker({ open, onClose }: TestUserPickerProps) {
  const { toast } = useToast();
  const [resetInProgress, setResetInProgress] = useState<number | null>(null);
  
  // Query for test users with detailed data status
  const { data: testUsers, isLoading, refetch } = useQuery<any[]>({ 
    queryKey: ['/api/test-users'],
    enabled: open // Only fetch when modal is opened
  });
  
  // User data reset mutation
  const resetUserData = useMutation({
    mutationFn: async (userId: number) => {
      setResetInProgress(userId);
      const response = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to reset user data');
      }
      return userId;
    },
    onSuccess: (userId) => {
      toast({
        title: "Data reset successful",
        description: `Data for Test User ${userId} has been reset`,
      });
      // Refresh the test users list
      refetch();
      setResetInProgress(null);
    },
    onError: (error) => {
      toast({
        title: "Reset failed",
        description: String(error),
        variant: "destructive"
      });
      setResetInProgress(null);
    }
  });

  // Function to check if user has data
  const hasUserData = (user: any): boolean => {
    // Check if the user has data - progress > 0 or hasStarCard or hasAssessment
    return (
      user.progress > 0 || 
      user.hasStarCard === true || 
      user.hasAssessment === true || 
      user.hasFlowAttributes === true ||
      user.hasImage === true
    );
  };
  
  // Get user data summary for tooltip
  const getUserDataSummary = (user: any): string[] => {
    const items: string[] = [];
    if (user.progress > 0) items.push(`Progress: ${user.progress}%`);
    if (user.hasStarCard) items.push('Has Star Card');
    if (user.hasAssessment) items.push('Has Assessment');
    if (user.hasFlowAttributes) items.push('Has Flow Attributes');
    if (user.hasImage) items.push('Has Uploaded Image');
    return items;
  };

  // Function to login as a test user
  const loginAsUser = async (userId: number) => {
    try {
      // Login as the selected test user
      const response = await apiRequest('POST', '/api/auth/login', {
        username: `user${userId}`,
        password: 'password123'
      });
      
      if (response.ok) {
        toast({
          title: "Login successful",
          description: `Logged in as Test User ${userId}`,
        });
        
        // Close the modal and redirect
        onClose();
        window.location.href = '/user-home';
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Select Test User
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
              TEST MODE
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Choose a test user to login as
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="text-center p-4">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading test users...</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {testUsers?.map((user: any) => {
                const hasData = hasUserData(user);
                
                return (
                  <Card 
                    key={user.id} 
                    className={`p-4 transition-colors ${hasData ? 'border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium">{user.name}</h3>
                          {hasData && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge className="ml-2 bg-blue-100 text-blue-800">
                                    Has Data
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    {getUserDataSummary(user).map((item, idx) => (
                                      <div key={idx}>• {item}</div>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.title || 'No title'} · {user.organization || 'No organization'}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {hasData && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent login from triggering
                              resetUserData.mutate(user.id);
                            }}
                            disabled={resetInProgress === user.id}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          >
                            {resetInProgress === user.id ? (
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            Reset Data
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => loginAsUser(user.id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                        >
                          Login
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}