import { useDemoMode } from "@/hooks/use-demo-mode";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [, navigate] = useLocation();
  const { data: user } = useQuery({ queryKey: ['/api/user/profile'] });

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      navigate('/auth');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-2 sticky top-0 z-50 flex justify-between items-center">
      <div className="flex-1">
        <h1 className="text-xl font-semibold">AllStarTeams</h1>
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
        {user && (
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}