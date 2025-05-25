import React, { useState } from 'react';
import { ResetUserDataButton } from '@/components/admin/ResetUserDataButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ResetTestPage() {
  const [userId, setUserId] = useState<number>(15); // Default to test user 15
  const { toast } = useToast();
  
  const handleSuccess = () => {
    toast({
      title: 'Reset Complete',
      description: `User ${userId} data has been reset successfully!`,
    });
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8 text-center">User Data Reset Test</h1>
      
      <div className="max-w-md mx-auto">
        <Card>
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
          
          <CardFooter>
            <ResetUserDataButton userId={userId} onSuccess={handleSuccess} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}