import React, { useState, useEffect } from 'react';
import { ResetUserDataButton } from '@/components/admin/ResetUserDataButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetTestPage() {
  const [userId, setUserId] = useState<number>(15); // Default to test user 15
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch star card data
  const { data: starCardData, isLoading: starCardLoading } = useQuery({
    queryKey: ['/api/starcard', refreshTrigger],
    staleTime: 0,
  });
  
  // Fetch flow attributes data
  const { data: flowAttributesData, isLoading: flowAttributesLoading } = useQuery({
    queryKey: ['/api/flow-attributes', refreshTrigger],
    staleTime: 0,
  });
  
  const handleSuccess = () => {
    // Force a refresh of the data
    setRefreshTrigger(prev => prev + 1);
    
    toast({
      title: 'Reset Complete',
      description: `User ${userId} data has been reset successfully!`,
    });
  };
  
  // Create sample flow attributes data for testing
  const createFlowAttributesData = async () => {
    try {
      const response = await fetch('/api/flow-attributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowScore: 54,
          attributes: [
            { name: 'Detail-Oriented', score: 100 },
            { name: 'Supportive', score: 95 },
            { name: 'Thoughtful', score: 90 },
            { name: 'Organized', score: 85 }
          ]
        }),
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Created sample flow attributes data',
        });
        // Force refresh
        setRefreshTrigger(prev => prev + 1);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create sample flow attributes data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create sample flow attributes data',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">User Data Reset Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Reset User Data</CardTitle>
              <CardDescription>
                This tool will reset all user data including star card assessments and flow attributes.
                Use with caution as this action cannot be undone.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 items-stretch">
              <div className="flex space-x-4 w-full">
                <ResetUserDataButton userId={userId} onSuccess={handleSuccess} />
                <Button 
                  variant="outline"
                  onClick={createFlowAttributesData}
                  className="flex-1"
                >
                  Create Test Flow Data
                </Button>
              </div>
              <Button 
                variant="secondary"
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="w-full"
              >
                Refresh Data
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Current User Data</CardTitle>
              <CardDescription>
                This shows the current data for the user from the database.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Star Card Data</h3>
                  {starCardLoading ? (
                    <p>Loading...</p>
                  ) : !starCardData || !starCardData.success ? (
                    <Alert variant="destructive">
                      <AlertDescription>No star card data found</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(starCardData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Flow Attributes Data</h3>
                  {flowAttributesLoading ? (
                    <p>Loading...</p>
                  ) : !flowAttributesData || !flowAttributesData.success ? (
                    <Alert variant="destructive">
                      <AlertDescription>No flow attributes data found</AlertDescription>
                    </Alert>
                  ) : flowAttributesData.isEmpty ? (
                    <Alert>
                      <AlertDescription>Flow attributes are empty</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(flowAttributesData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}