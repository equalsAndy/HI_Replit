import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationSection {
  id: string;
  title: string;
  path: string;
  completed?: boolean;
}

interface VerticalNavigationProps {
  sections: NavigationSection[];
  currentSectionId?: string;
  className?: string;
}

export function VerticalNavigation({
  sections,
  currentSectionId,
  className
}: VerticalNavigationProps) {
  const [, navigate] = useLocation();
  
  const handleSectionClick = (section: NavigationSection) => {
    navigate(section.path);
  };
  
  return (
    <div className={cn("w-full space-y-2", className)}>
      {sections.map((section) => {
        const isActive = section.id === currentSectionId;
        
        return (
          <div 
            key={section.id}
            className={cn(
              "w-full rounded-md p-3 transition-all duration-200 cursor-pointer border",
              isActive 
                ? "bg-yellow-100 border-yellow-400 shadow-sm" 
                : section.completed 
                  ? "bg-green-50 border-green-200 hover:bg-green-100" 
                  : "bg-white border-gray-200 hover:bg-gray-50"
            )}
            onClick={() => handleSectionClick(section)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium",
                  isActive 
                    ? "bg-yellow-400 text-white" 
                    : section.completed 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-600"
                )}>
                  {section.completed ? <Check className="h-3.5 w-3.5" /> : section.id}
                </div>
                <span className={cn(
                  "font-medium",
                  isActive ? "text-yellow-800" : section.completed ? "text-green-700" : "text-gray-700"
                )}>
                  {section.title}
                </span>
              </div>
              
              {isActive && (
                <ChevronDown className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}