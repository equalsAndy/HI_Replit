import React, { useState } from 'react';
import { Check, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { imaginalAgilityNavigationSections } from './navigationData';
import Logo from '@/components/branding/Logo';

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
  // Initialize expanded state based on default expanded property
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    imaginalAgilityNavigationSections.reduce((acc, section) => {
      acc[section.id] = section.expanded || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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
            {expandedSections[section.id] ? (
              <ChevronDown className="w-4 h-4 text-purple-200" />
            ) : (
              <ChevronRight className="w-4 h-4 text-purple-200" />
            )}
          </button>
          
          {expandedSections[section.id] && (
            <div className="mt-2 space-y-2 pl-2">
              {section.steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStepId === step.id;
                const isUnlocked = isStepUnlocked(step.id);
                
                return (
                  <button
                    key={step.id}
                    onClick={() => isUnlocked ? onStepClick(step.id) : null}
                    disabled={!isUnlocked}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between
                      ${isCurrent 
                        ? 'bg-white text-purple-800 shadow-lg' 
                        : isUnlocked
                          ? 'bg-purple-700 hover:bg-purple-600 text-white'
                          : 'bg-purple-800 text-purple-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${isCurrent 
                          ? 'bg-purple-600 text-white' 
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : isUnlocked
                              ? 'bg-purple-500 text-white'
                              : 'bg-purple-700 text-purple-500'
                        }
                      `}>
                        {isCompleted ? (
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
          )}
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