import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  fullWidth?: boolean;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = 'rounded-md bg-white text-yellow-600 hover:bg-yellow-100',
  fullWidth = false
}: LogoutButtonProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Clear React Query cache
        queryClient.clear();
        
        // Show success toast
        toast({
          title: 'Logged out successfully',
          description: 'You have been logged out of your account.',
          variant: 'default',
        });

        // Navigate to home page
        navigate('/');
        
        // Force page reload to clear all state
        window.location.reload();
      } else {
        throw new Error(data.error || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${fullWidth ? 'w-full' : ''}`}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}

export default LogoutButton;