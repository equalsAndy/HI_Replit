import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  organization: string | null;
  jobTitle: string | null;
  profilePicture: string | null;
}

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch the user profile on component mount
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        
        // If not authenticated, redirect to login
        if (response.status === 401) {
          toast({
            variant: 'destructive',
            title: 'Session expired',
            description: 'Please log in again to continue.',
          });
          setLocation('/login');
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: data.error || 'Failed to load user profile',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load user profile. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [setLocation, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
        });
        setLocation('/login');
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to log out',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log out. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Heliotrope Imaginal Workshops</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="text-sm text-muted-foreground">
                Logged in as: <span className="font-medium text-foreground">{user.name}</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Welcome to Your Dashboard</h2>
        
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span> {user.name}
                  </div>
                  <div>
                    <span className="font-medium">Username:</span> {user.username}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {user.role}
                  </div>
                  {user.organization && (
                    <div>
                      <span className="font-medium">Organization:</span> {user.organization}
                    </div>
                  )}
                  {user.jobTitle && (
                    <div>
                      <span className="font-medium">Job Title:</span> {user.jobTitle}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AllStar Teams Workshop</CardTitle>
                <CardDescription>Discover your unique strengths</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Identify your core strengths, understand your leadership style, and learn how to
                  contribute effectively in team environments.
                </p>
                <Button asChild>
                  <Link href="/workshop/allstar">Access Workshop</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imaginal Agility Workshop</CardTitle>
                <CardDescription>Enhance your creative thinking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Develop creative problem-solving skills, learn to adapt to changing circumstances,
                  and cultivate a growth mindset for professional success.
                </p>
                <Button asChild>
                  <Link href="/workshop/imaginal">Access Workshop</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {user && user.role === 'admin' && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold mb-4">Administration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and invitations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/admin">Access Admin Panel</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Workshop Management</CardTitle>
                  <CardDescription>Configure and customize workshops</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/admin/workshops">Manage Workshops</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;