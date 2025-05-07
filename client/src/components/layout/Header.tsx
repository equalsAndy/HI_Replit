import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showDashboardLink?: boolean;
}

export default function Header({ showDashboardLink = true }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 py-2">
      <div className="container mx-auto px-3 flex justify-between items-center">
        <Link href="/" className="logo flex items-center cursor-pointer">
          <img 
            src="/src/assets/all-star-teams-logo-250px.png" 
            alt="AllStarTeams" 
            className="h-8 w-auto"
          />
        </Link>
        
        {showDashboardLink && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="rounded-md text-xs h-8" asChild>
              <Link href="/user-home">Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}