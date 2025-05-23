import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, ArrowLeft } from 'lucide-react';

// Storage keys used across the application
const STORAGE_KEYS = {
  ALLSTAR_TEAMS: 'allstarteams-navigation-progress',
  IMAGINAL_AGILITY: 'imaginal-agility-navigation-progress',
  LEGACY: 'allstar_navigation_progress',
};

export default function ResetTest() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [storageState, setStorageState] = useState<Record<string, any>>({});
  
  // Fetch user profile data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false
  });

  // Load localStorage state
  useEffect(() => {
    refreshStorageState();
  }, []);

  // Function to refresh localStorage state display
  const refreshStorageState = () => {
    const state: Record<string, any> = {};
    
    for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
      try {
        const data = localStorage.getItem(storageKey);
        if (data) {
          state[key] = JSON.parse(data);
        } else {
          state[key] = null;
        }
      } catch (e) {
        state[key] = `Error: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    
    setStorageState(state);
  };

  // Reset user progress mutation
  const resetUserProgress = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User ID is required to reset progress");
      }
      
      const response = await fetch(`/api/test-users/reset/${user.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Try to get JSON error if available
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server error');
        } else {
          // Handle non-JSON error responses
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      // Try to parse response as JSON (if possible)
      try {
        return await response.json();
      } catch (e) {
        console.error("JSON parse error:", e);
        // If JSON parsing fails but response was OK, consider it a success
        return { success: true };
      }
    },
    onSuccess: () => {
      // Clear all possible localStorage keys for maximum compatibility
      for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key);
      }
      
      // Refresh data from server
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      // Refresh storage state display
      refreshStorageState();
      
      toast({
        title: "Progress Reset",
        description: "Your progress has been reset successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: "There was an error resetting your progress: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
      console.error("Reset error:", error);
    }
  });

  // Function to manually set test data in localStorage
  const setTestData = (format: 'array' | 'object') => {
    try {
      if (format === 'array') {
        localStorage.setItem(STORAGE_KEYS.ALLSTAR_TEAMS, JSON.stringify(['1-1', '1-2', '1-3']));
      } else {
        localStorage.setItem(STORAGE_KEYS.ALLSTAR_TEAMS, JSON.stringify({ completed: ['1-1', '1-2', '1-3'] }));
      }
      refreshStorageState();
      toast({
        title: "Test Data Set",
        description: `Set ${format} format test data in localStorage`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: `Failed to set test data: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive",
      });
    }
  };

  // Function to clear all localStorage data
  const clearAllStorage = () => {
    try {
      for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key);
      }
      refreshStorageState();
      toast({
        title: "Storage Cleared",
        description: "All progress data has been cleared from localStorage",
      });
    } catch (e) {
      toast({
        title: "Error",
        description: `Failed to clear storage: ${e instanceof Error ? e.message : String(e)}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Workshop Data Reset Test</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Current user details</CardDescription>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <p>Loading user data...</p>
          ) : user ? (
            <div>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Name:</strong> {user.name}</p>
            </div>
          ) : (
            <p>Not logged in. Please log in to test reset functionality.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>LocalStorage State</CardTitle>
          <CardDescription>Current data in localStorage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[200px]">
            <pre className="text-xs">{JSON.stringify(storageState, null, 2)}</pre>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={refreshStorageState} variant="outline" className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>Set test data and perform resets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setTestData('array')} 
                variant="outline"
              >
                Set Array Format
              </Button>
              <Button 
                onClick={() => setTestData('object')} 
                variant="outline"
              >
                Set Object Format
              </Button>
              <Button 
                onClick={clearAllStorage} 
                variant="outline"
                className="text-red-500"
              >
                Clear All Storage
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Reset User Data</h3>
              <Button 
                onClick={() => resetUserProgress.mutate()}
                disabled={resetUserProgress.isPending || !user}
                className="bg-red-500 hover:bg-red-600"
              >
                {resetUserProgress.isPending ? 'Resetting...' : 'Reset All User Data'}
              </Button>
              
              {resetUserProgress.isError && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
                  {resetUserProgress.error instanceof Error 
                    ? resetUserProgress.error.message 
                    : 'An error occurred during reset'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-4 space-y-2">
            <li>Use the <strong>Set Array Format</strong> or <strong>Set Object Format</strong> buttons to create test data in localStorage</li>
            <li>Verify the format in the LocalStorage State section</li>
            <li>Click <strong>Reset All User Data</strong> to perform a complete reset (both localStorage and database data)</li>
            <li>Verify that both the localStorage is cleared and database reset is successful</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}