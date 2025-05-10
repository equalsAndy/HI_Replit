import { useDemoMode } from "@/hooks/use-demo-mode";
import { useApplication } from "@/hooks/use-application";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { currentApp, appName, appLogo, appPrimaryColor } = useApplication();
  const [, navigate] = useLocation();
  const { data: user } = useQuery({ queryKey: ['/api/user/profile'] });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    try {
      // Directly make a fetch request to the logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Clear cached user data
        queryClient.setQueryData(['/api/user/profile'], null);
        // Redirect to auth page
        window.location.href = '/auth';
      } else {
        console.error("Logout failed");
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  // Generate dynamic bg color based on app
  const bgColorClass = currentApp === 'allstarteams' 
    ? 'bg-indigo-800' 
    : 'bg-purple-800';
    
  return (
    <div className={`${bgColorClass} text-white p-2 sticky top-0 z-50 flex justify-between items-center`}>
      <div className="flex-1">
        <div className="flex items-center">
          <img 
            src={appLogo} 
            alt={appName} 
            className="h-8 w-auto mr-2" 
          />
          <h1 className="text-xl font-semibold">{appName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="demo-mode" className="text-sm cursor-pointer">
          Demo Mode
        </Label>
        <Switch
          id="demo-mode"
          checked={isDemoMode}
          onCheckedChange={toggleDemoMode}
        />
        {user ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout} 
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
            Login
          </Button>
        )}
      </div>
    </div>
  );
}