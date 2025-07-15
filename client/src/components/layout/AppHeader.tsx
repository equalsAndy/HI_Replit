import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { User } from "@shared/schema";

export default function AppHeader() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auth loop
    refetchOnWindowFocus: false
  });

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
            <div className="logo flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40" className="mr-2">
                <rect width="40" height="40" rx="8" fill="#4639A2"/>
                <path d="M12 10L16 16M16 16L20 22M16 16L12 22M20 10L16 16M20 22L24 28M24 10L28 16L24 22L28 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22L16 28M20 22L24 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-indigo-600 font-bold text-xl">allstarteams</span>
            </div>
        </Link>
        
        <div className="flex items-center space-x-3">
          {user && (
            <>
              <span className="text-gray-700 font-medium">{user.name || 'User'}</span>
              <div className="flex items-center space-x-1 text-gray-600 border-l border-gray-300 pl-3">
                <span className="text-sm">English</span>
                <span className="text-xs">🇺🇸</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <Button variant="destructive" size="sm" className="rounded-md bg-red-500 hover:bg-red-600">Logout</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
