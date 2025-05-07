import { useDemoMode } from "@/hooks/use-demo-mode";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NavBar() {
  const { isDemoMode, toggleDemoMode } = useDemoMode();

  return (
    <div className="bg-gray-800 text-white p-2 sticky top-0 z-50 flex justify-between items-center">
      <div className="flex-1">
        <h1 className="text-xl font-semibold">AllStarTeams</h1>
      </div>

      <div className="flex items-center gap-2">
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
  );
}