import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLogout } from "@/hooks/use-logout";
import { AppLogo } from "@/components/ui/AppLogo";

interface HeaderProps {
  showDashboardLink?: boolean;
}

export default function Header({ showDashboardLink = true }: HeaderProps) {
  // Use our custom logout hook
  const logout = useLogout();
  
  // Check if user is logged in by querying user profile
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
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
          <div className="text-indigo-700 font-bold text-xl">AllStarTeams</div>
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
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              {logout.isPending ? "Logging out..." : "Logout"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}