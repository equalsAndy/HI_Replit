import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { ArrowLeft, Loader2, TestTube, Users, Sparkles } from 'lucide-react';
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

const BetaTesterPage: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Profile creation form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    organization: '',
    jobTitle: '',
  });

  // Get invite code from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setInviteCode(code);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill in all required fields',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password mismatch',
        description: 'Passwords do not match',
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create beta tester profile
      const response = await fetch('/api/beta-tester/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          inviteCode,
          isBetaTester: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create beta tester account');
      }

      const result = await response.json();
      
      toast({
        title: 'Welcome to the beta program!',
        description: 'Your account has been created successfully.',
      });

      // Redirect to login or dashboard
      setLocation('/auth');
      
    } catch (error) {
      console.error('Error creating beta tester account:', error);
      toast({
        variant: 'destructive',
        title: 'Account creation failed',
        description: error instanceof Error ? error.message : 'There was a problem creating your account. Please try again.',
      });
    } finally {
      setIsCreating(false);
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
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full">
                <TestTube className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Beta Testing!
            </CardTitle>
            <CardDescription className="text-center text-lg">
              You've been invited to be one of our exclusive beta testers. Help us shape the future of our workshops!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Beta Program Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
                What Beta Testing Includes:
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <Users className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Early access to new features and workshops</span>
                </div>
                <div className="flex items-start space-x-2">
                  <TestTube className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Direct feedback channel to our development team</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Exclusive beta tester community access</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Users className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Special recognition in our platform</span>
                </div>
              </div>
            </div>

            {/* Invite Code Display */}
            {inviteCode && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Your Beta Invite Code:</p>
                <p className="font-mono text-lg font-semibold text-center bg-white p-2 rounded border">
                  {inviteCode}
                </p>
              </div>
            )}

            {/* Profile Creation Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    disabled={isCreating}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@company.com"
                    disabled={isCreating}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username *
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Choose a username"
                    disabled={isCreating}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="organization" className="text-sm font-medium">
                    Organization
                  </label>
                  <Input
                    id="organization"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    placeholder="Your company or organization"
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="jobTitle" className="text-sm font-medium">
                  Job Title
                </label>
                <Input
                  id="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Your role or position"
                  disabled={isCreating}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a secure password"
                    disabled={isCreating}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    disabled={isCreating}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isCreating}
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Your Beta Account...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Join the Beta Program
                  </>
                )}
              </Button>
            </form>
            
            <div className="text-center text-sm text-gray-500">
              <p>* Required fields</p>
            </div>
            
            <div className="text-center">
              <Link href="/invite-code">
                <Button variant="ghost" className="text-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to invite code
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BetaTesterPage;