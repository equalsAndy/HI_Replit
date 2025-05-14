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
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TestUserPickerProps {
  open: boolean;
  onClose: () => void;
}

export function TestUserPicker({ open, onClose }: TestUserPickerProps) {
  const { toast } = useToast();
  
  // Query for test users
  const { data: testUsers, isLoading } = useQuery<any[]>({ 
    queryKey: ['/api/test-users'],
    enabled: open // Only fetch when modal is opened
  });

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
              {testUsers?.map((user: any) => (
                <Card key={user.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => loginAsUser(user.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.title || 'No title'} · {user.organization || 'No organization'}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </div>
                </Card>
              ))}
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