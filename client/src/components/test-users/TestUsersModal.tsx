import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, UserCircle } from "lucide-react";

type TestUser = {
  id: number;
  username: string;
  name: string;
  title: string;
  organization: string;
  progress: number;
};

interface TestUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestUsersModal({ isOpen, onClose }: TestUsersModalProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch test users when the modal is opened
  const { data: testUsers, isLoading, refetch } = useQuery({
    queryKey: ['/api/test-users'],
    enabled: isOpen,
    staleTime: 10000, // 10 seconds
  });

  // Reset user data mutation
  const resetMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest('POST', `/api/test-users/reset/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "User reset successful",
        description: "User data has been reset to initial state.",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Login as test user mutation
  const loginMutation = useMutation({
    mutationFn: async (user: { username: string, password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', user);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      onClose();
      navigate('/user-home');
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  const handleLoginAsUser = (username: string) => {
    loginMutation.mutate({ username, password: 'password' });
  };

  const handleResetUser = async (userId: number) => {
    await resetMutation.mutateAsync(userId);
    // Invalidate specific queries
    queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
    queryClient.invalidateQueries({ queryKey: ['/api/assessment/questions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    queryClient.removeQueries({ queryKey: ['/api/assessment/answer'] });
    queryClient.removeQueries({ queryKey: ['/api/assessment/complete'] });
  };

  // Progress color based on completion
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-gray-300";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Test User</DialogTitle>
          <DialogDescription>
            Choose one of the test users below or reset their data to start fresh.
            Each user shows their current progress through the experience.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {Array.isArray(testUsers) && testUsers.map((user: TestUser) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.title}</CardDescription>
                    </div>
                    <UserCircle className="h-10 w-10 text-primary opacity-70" />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={user.progress} 
                        className={`h-2 flex-grow ${getProgressColor(user.progress)}`} 
                      />
                      <span className="text-sm font-medium">{user.progress}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleResetUser(user.id)}
                    disabled={resetMutation.isPending}
                  >
                    {resetMutation.isPending && resetMutation.variables === user.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Clear Data
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={() => handleLoginAsUser(user.username)}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      handleResetUser(user.id);
                      handleLoginAsUser(user.username);
                    }}
                    disabled={resetMutation.isPending || loginMutation.isPending}
                  >
                    Clear & Login
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}