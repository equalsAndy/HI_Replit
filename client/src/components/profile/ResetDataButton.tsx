import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTestUser } from '@/hooks/useTestUser';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ResetDataButtonProps {
  userId: number;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onResetComplete?: () => void;
}

export function ResetDataButton({
  userId,
  variant = 'destructive',
  size = 'default',
  className = '',
  onResetComplete
}: ResetDataButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isTestUser = useTestUser();

  // SECURE: Only show reset button for test users
  if (!isTestUser) {
    return null;
  }

  // Define the reset mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      // We'll include a simple dummy payload to ensure proper content-type header
      const response = await fetch(`/api/reset/user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ confirm: true })
      });
      
      let errorMessage = 'Reset failed';
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, we might have received HTML
          const text = await response.text();
          if (text.includes('<!DOCTYPE html>')) {
            errorMessage = 'Server responded with HTML instead of JSON. Please try again.';
          }
        }
        throw new Error(errorMessage);
      }
      
      // Parse the response
      try {
        return await response.json();
      } catch (e) {
        throw new Error('Server returned invalid JSON response');
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Workshop Data Reset Successfully',
        description: 'All your workshop data has been reset. Your progress has been set to zero.',
        variant: 'default',
      });
      
      // Clear localStorage data related to workshops
      clearLocalStorageData();
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      if (onResetComplete) {
        onResetComplete();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Reset Failed',
        description: error.message || 'There was an error resetting your data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Function to clear all workshop-related data from localStorage
  const clearLocalStorageData = () => {
    const keysToRemove = [
      'allstarteams-navigation-progress',
      'imaginal-agility-navigation-progress',
      'allstar_navigation_progress',
      'allstarteams_starCard',
      'allstarteams_flowAttributes',
      'allstarteams_progress',
      'allstarteams_completedActivities',
      'allstarteams_strengths',
      'allstarteams_values',
      'allstarteams_passions',
      'allstarteams_growthAreas',
      'workshop-progress',
      'assessment-data'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className={className}
        disabled={resetMutation.isPending}
      >
        {resetMutation.isPending ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Resetting...
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4 mr-2" />
            Reset Workshop Data
          </>
        )}
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Workshop Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all your star card data, flow attributes, and reset your workshop progress.
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                resetMutation.mutate();
                setIsDialogOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Reset My Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}