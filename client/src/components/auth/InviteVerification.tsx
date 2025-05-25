import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface InviteVerificationProps {
  onVerified: (data: any) => void;
}

const InviteVerification: React.FC<InviteVerificationProps> = ({ onVerified }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove spaces
    const cleanedValue = e.target.value.toUpperCase().replace(/\s/g, '');
    setInviteCode(cleanedValue);
    setError(null);
  };

  const verifyInviteCode = async () => {
    if (!inviteCode) {
      setError('Please enter an invite code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await apiRequest('/api/invites/verify', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      });

      if (response.error) {
        setError(response.error);
        toast({
          title: 'Verification Failed',
          description: response.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Invite Code Verified',
          description: 'Your invite code is valid. Please complete your profile.',
        });
        // Pass the verified invite data to the parent component
        onVerified(response);
      }
    } catch (err) {
      setError('An error occurred while verifying the invite code. Please try again.');
      toast({
        title: 'Verification Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Join Heliotrope Imaginal Workshops</CardTitle>
        <CardDescription>
          Enter your invite code to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              type="text"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={handleInviteChange}
              className="uppercase"
              autoComplete="off"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The invite code should be 12 characters long and was provided by your workshop facilitator or administrator.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={verifyInviteCode}
          disabled={isVerifying || !inviteCode}
        >
          {isVerifying ? 'Verifying...' : 'Verify Invite Code'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InviteVerification;