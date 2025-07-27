/*
 * ARCHIVED: This navigation component had layout and styling issues.
 * Use UserHomeNavigationWithStarCard instead for IA workshop navigation.
 * 
 * Issues with this component:
 * - Dark purple theme instead of proper light theme
 * - Progress bar at bottom that shouldn't be there
 * - Didn't go full height down the page
 * - Not consistent with AST navigation styling
 * 
 * Date archived: 2025-07-25
 */

import React, { useState, useEffect } from 'react';
import { Check, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { imaginalAgilityNavigationSections } from './navigationData';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import Logo from '@/components/branding/Logo';

// DEBUG: Simple test to ensure code is loading
console.log('🚨 ImaginalAgilityNavigation.tsx loaded at:', new Date().toISOString());

interface ImaginalAgilityNavigationProps {
  currentStepId: string;
  completedSteps: string[];
  onStepClick: (stepId: string) => void;
  isStepUnlocked: (stepId: string) => boolean;
}

export default function ImaginalAgilityNavigation({
  currentStepId,
  completedSteps,
  onStepClick,
  isStepUnlocked
}: ImaginalAgilityNavigationProps) {
  
  // GET automatic expansion state from navigation progress
  const { progress } = useNavigationProgress('ia');
  const automaticExpansion = progress.sectionExpansion || {};
  
  // DEBUG: Log the current state
  console.log('🔧 NAVIGATION DEBUG:', {
    currentStepId,
    automaticExpansion,
    progressSectionExpansion: progress.sectionExpansion
  });
  
  // TRACK manual expansion overrides
  const [manualExpansion, setManualExpansion] = useState<Record<string, boolean>>({});
  const [animatingSections, setAnimatingSections] = useState<Record<string, boolean>>({});
  
  // MERGE automatic and manual expansion states
  const finalExpansion = {
    ...automaticExpansion,
    ...manualExpansion
  };

  // ANIMATE when automatic expansion changes
  useEffect(() => {
    Object.keys(automaticExpansion).forEach(sectionId => {
      if (automaticExpansion[sectionId] !== finalExpansion[sectionId]) {
        setAnimatingSections(prev => ({ ...prev, [sectionId]: true }));
        setTimeout(() => {
          setAnimatingSections(prev => ({ ...prev, [sectionId]: false }));
        }, 300);
      }
    });
  }, [automaticExpansion]);

  // HANDLE manual toggle with animation
  const toggleSection = (sectionId: string) => {
    setAnimatingSections(prev => ({ ...prev, [sectionId]: true }));
    
    setManualExpansion(prev => ({
      ...prev,
      [sectionId]: !finalExpansion[sectionId]
    }));
    
    setTimeout(() => {
      setAnimatingSections(prev => ({ ...prev, [sectionId]: false }));
    }, 300);
  };

  return (
    <div className="bg-gradient-to-b from-purple-600 to-purple-800 text-white p-6">
      <div className="flex items-center mb-6">
        <Logo type="imaginal-agility" className="h-10 w-auto mr-3" />
        <h2 className="text-xl font-bold">Imaginal Agility Workshop</h2>
      </div>
      
      {imaginalAgilityNavigationSections.map((section) => (
        <div key={section.id} className="mb-4">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between text-left p-3 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors duration-200"
          >
            <h3 className="text-sm font-semibold text-purple-100 uppercase tracking-wide">
              {section.title}
            </h3>
            <ChevronDown 
              className={`w-4 h-4 text-purple-200 transform transition-transform duration-300 ${
                finalExpansion[section.id] ? 'rotate-0' : '-rotate-90'
              }`} 
            />
          </button>
          
          {/* ANIMATED section content */}
          <div 
            className={`mt-2 space-y-2 pl-2 overflow-hidden transition-all duration-300 ease-in-out ${
              finalExpansion[section.id] 
                ? 'max-h-[500px] opacity-100' 
                : 'max-h-0 opacity-0'
            } ${animatingSections[section.id] ? 'transform' : ''}`}
          >
            {section.steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStepId === step.id;
                // Always unlock the current step so highlight is visible
                const isUnlocked = isStepUnlocked(step.id) || currentStepId === step.id;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => (isUnlocked || isCurrent) ? onStepClick(step.id) : null}
                    disabled={!(isUnlocked || isCurrent)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between
                      transform ${finalExpansion[section.id] ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}
                      ${isCurrent 
                        ? 'bg-purple-400 text-white font-semibold shadow-lg border-2 border-purple-200' 
                        : isUnlocked
                          ? 'bg-purple-700 hover:bg-purple-600 text-white'
                          : 'bg-purple-800 text-purple-400 cursor-not-allowed'
                      }
                    `}
                    style={{ 
                      transitionDelay: finalExpansion[section.id] ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${isCurrent 
                          ? 'bg-purple-200 text-purple-700 border border-purple-300' 
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : isUnlocked
                              ? 'bg-purple-500 text-white'
                              : 'bg-purple-700 text-purple-500'
                        }
                      `}>
                        {isCurrent ? (
                          step.id.split('-')[2]
                        ) : isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : !isUnlocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          step.id.split('-')[2]
                        )}
                      </div>
                      
                      <span className={`text-sm font-medium ${!isUnlocked ? 'opacity-50' : ''}`}>
                        {step.title}
                      </span>
                    </div>
                    
                    {isCompleted && !isCurrent && (
                      <Check className="w-4 h-4 text-green-400" />
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
      
      <div className="mt-8 pt-6 border-t border-purple-500">
        <div className="text-xs text-purple-200">
          Progress: {completedSteps.length} of {imaginalAgilityNavigationSections.reduce((total, section) => total + section.steps.length, 0)} steps
        </div>
        <div className="w-full bg-purple-700 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(completedSteps.length / imaginalAgilityNavigationSections.reduce((total, section) => total + section.steps.length, 0)) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}