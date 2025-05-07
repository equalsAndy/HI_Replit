import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

export default function AppHeader() {
  const [location] = useLocation();
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity
  });

  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center">
            <div className="logo flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 40 40" className="mr-2">
                <rect width="40" height="40" rx="8" fill="#4639A2"/>
                <path d="M12 10L16 16M16 16L20 22M16 16L12 22M20 10L16 16M20 22L24 28M24 10L28 16L24 22L28 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22L16 28M20 22L24 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-gray-800 font-bold text-xl uppercase tracking-wide">ALLSTARTEAMS WORKSHOP</span>
            </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/" currentPath={location}>Home</NavLink>
          <NavLink href="/assessment" currentPath={location}>YOUR STAR SELF ASSESSMENT</NavLink>
          <NavLink href="/report" currentPath={location}>REVIEW YOUR STAR PROFILE</NavLink>
          <NavLink href="/core-strengths" currentPath={location}>YOUR CORE STRENGTHS</NavLink>
          
          <div className="relative group">
            <button className="text-gray-700 hover:text-gray-900 font-medium flex items-center">
              More
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50">
              <div className="py-1">
                <NavLink href="/flow-assessment" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Flow Self Assessment</NavLink>
                <NavLink href="/rounding-out" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rounding Out</NavLink>
                <NavLink href="/complete-star-card" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Complete Star Card</NavLink>
                <NavLink href="/wellbeing-ladder" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ladder of Wellbeing</NavLink>
                <NavLink href="/visualize-potential" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Visualizing Potential</NavLink>
                <NavLink href="/future-self" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Future Self</NavLink>
                <NavLink href="/recap-insights" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Recap Insights</NavLink>
                <NavLink href="/team-workshop" currentPath={location} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Team Workshop</NavLink>
              </div>
            </div>
          </div>
        </nav>
        
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Search className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  currentPath: string;
  children: React.ReactNode;
  className?: string;
}

function NavLink({ href, currentPath, children, className }: NavLinkProps) {
  const isActive = currentPath === href;
  
  return (
    <Link href={href}>
      <span className={cn(
        "text-sm uppercase font-medium cursor-pointer",
        isActive ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-700 hover:text-gray-900",
        className
      )}>
        {children}
      </span>
    </Link>
  );
}
