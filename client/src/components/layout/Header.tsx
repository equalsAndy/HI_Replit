import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from '@auth0/auth0-react';
import { useApplication } from "@/hooks/use-application";
import Logo from "@/components/branding/Logo";

interface HeaderProps {
  showDashboardLink?: boolean;
}

export default function Header({ showDashboardLink = true }: HeaderProps) {
  // Use Auth0 logout
  const { logout } = useAuth0();
  
  // Get application context
  const { currentApp } = useApplication();
  
  // Check if user is logged in by querying user profile
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auth loop
    refetchOnWindowFocus: false,
    // Don't show errors for 401 (unauthenticated)
    retry: (failureCount, error: any) => {
      return !(error.status === 401) && failureCount < 3;
    }
  });
  
  // Determine if the user is logged in
  const isLoggedIn = !!user;
  
  return (
    <header className="bg-white border-b border-gray-200 py-2">
      <div className="container mx-auto px-3 flex justify-between items-center">
        <Link href="/" className="logo flex items-center cursor-pointer">
          <Logo type="heliotrope" className="h-8 w-auto" />
        </Link>
        
        <div className="flex items-center space-x-2">
          {showDashboardLink && isLoggedIn && (
            <Button variant="outline" size="sm" className="rounded-md text-xs h-8" asChild>
              <Link href="/user-home">Dashboard</Link>
            </Button>
          )}
          
          {isLoggedIn && (
            <Button
              variant="destructive"
              size="sm"
              className="rounded-md text-xs h-8"
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
