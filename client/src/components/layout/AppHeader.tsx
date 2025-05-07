import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Globe, ChevronDown } from "lucide-react";
import { Link } from "wouter";

export default function AppHeader() {
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity
  });

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
            <div className="logo flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40" className="mr-2">
                <rect width="40" height="40" rx="8" fill="#4639A2"/>
                <path d="M12 10L16 16M16 16L20 22M16 16L12 22M20 10L16 16M20 22L24 28M24 10L28 16L24 22L28 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22L16 28M20 22L24 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-primary font-bold text-xl">allstarteams</span>
            </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-1">
              <span>{user.name}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center ml-2">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>English</span>
                      <span className="ml-1">🇺🇸</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change language</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="destructive" size="sm">Logout</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
