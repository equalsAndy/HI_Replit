
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ResetAllUsers() {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const resetAllUsers = async () => {
    try {
      setIsResetting(true);
      
      // Get all user IDs (2-6 for test users)
      const userIds = [2, 3, 4, 5, 6];
      
      for (const userId of userIds) {
        const response = await fetch(`/api/test-users/reset/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to reset user ${userId}`);
        }
      }

      toast({
        title: 'Success',
        description: 'All user data has been reset',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset all users',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Reset All Workshop Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={resetAllUsers}
            disabled={isResetting}
            variant="destructive"
          >
            {isResetting ? 'Resetting...' : 'Reset All Users'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
