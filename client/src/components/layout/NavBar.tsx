import { useDemoMode } from "@/hooks/use-demo-mode";
import { useAuth } from "@/hooks/use-auth-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, User } from "lucide-react";

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="bg-gray-800 text-white p-2 sticky top-0 z-50 flex justify-between items-center">
      <div className="flex-1">
        <Link href="/">
          <h1 className="text-xl font-semibold cursor-pointer">AllStarTeams</h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <Link href="/user-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <User size={18} />
                <span className="text-sm hidden md:inline">{user?.username || 'Profile'}</span>
              </div>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-white hover:text-gray-200 hover:bg-gray-700"
            >
              <LogOut size={18} className="mr-1" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2 ml-4 border-l pl-4 border-gray-600">
          <Label htmlFor="demo-mode" className="text-sm cursor-pointer">
            Demo Mode
          </Label>
          <Switch
            id="demo-mode"
            checked={isDemoMode}
            onCheckedChange={toggleDemoMode}
          />
        </div>
      </div>
    </div>
  );
}