import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface ResetUserDataButtonProps {
  userId: number;
  onSuccess?: () => void;
}

export function ResetUserDataButton({ userId, onSuccess }: ResetUserDataButtonProps) {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm(`Are you sure you want to reset all data for user ${userId}? This cannot be undone.`)) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch(`/api/test-users/reset/user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Invalidate all relevant queries to refresh data after reset
        queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });
        
        toast({
          title: 'Success',
          description: `User data reset successfully!`,
          variant: 'default',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to reset user data.',
          variant: 'destructive',
        });
        console.error('Reset error:', result);
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while resetting user data.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      disabled={isResetting} 
      onClick={handleReset}
      className="w-full"
    >
      {isResetting ? 'Resetting...' : 'Reset All User Data'}
    </Button>
  );
}