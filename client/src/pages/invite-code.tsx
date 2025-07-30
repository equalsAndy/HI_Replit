import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { ArrowLeft, Loader2 } from 'lucide-react';
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

const InviteCodePage: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid invite code',
        description: 'Please enter a valid invite code',
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Check if this is a beta tester invite code using the API
      const response = await fetch('/api/beta-tester/check-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      const result = await response.json();

      if (!result.success) {
        // If API call fails, fall back to simple logic
        console.warn('Beta invite check failed, using fallback logic');
        const normalizedCode = inviteCode.toLowerCase();
        if (normalizedCode.includes('beta') || normalizedCode.includes('test')) {
          setLocation(`/beta-tester?code=${encodeURIComponent(inviteCode)}`);
        } else {
          setLocation(`/register/${encodeURIComponent(inviteCode)}`);
        }
        return;
      }

      if (result.isBetaInvite) {
        // Redirect to beta tester page
        setLocation(`/beta-tester?code=${encodeURIComponent(inviteCode)}`);
      } else {
        // Redirect to the full invite registration process
        setLocation(`/register/${encodeURIComponent(inviteCode)}`);
      }
    } catch (error) {
      console.error('Error processing invite code:', error);
      
      // Fall back to simple client-side logic if API fails
      const normalizedCode = inviteCode.toLowerCase();
      if (normalizedCode.includes('beta') || normalizedCode.includes('test')) {
        setLocation(`/beta-tester?code=${encodeURIComponent(inviteCode)}`);
      } else {
        setLocation(`/register/${encodeURIComponent(inviteCode)}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Main HI Logo */}
          <Link href="/">
            <img 
              src={HiLogo} 
              alt="Heliotrope Imaginal"
              className="h-12 w-auto"
            />
          </Link>
          
          {/* Workshop Logos */}
          <div className="flex items-center space-x-8">
            <img 
              src={AllStarTeamsLogo} 
              alt="AllStarTeams" 
              className="h-10 w-auto opacity-80"
            />
            <img 
              src={ImaginalAgilityLogo} 
              alt="Imaginal Agility" 
              className="h-10 w-auto opacity-80"
            />
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Enter Invite Code</CardTitle>
            <CardDescription className="text-center">
              Enter your invitation code to get started with your workshop
            </CardDescription>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                <strong>Beta Testers:</strong> If you have a beta testing invite code, enter it here to access the beta program!
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="inviteCode" className="text-sm font-medium">
                  Invite Code
                </label>
                <Input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter your invite code"
                  disabled={isVerifying}
                  className="text-center font-mono"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isVerifying || !inviteCode.trim()}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link href="/">
                <Button variant="ghost" className="text-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteCodePage;