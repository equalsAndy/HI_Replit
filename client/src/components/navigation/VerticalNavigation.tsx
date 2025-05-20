import { useState, useEffect } from 'react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Link } from 'wouter';
import { CheckCircleIcon, LockIcon, ArrowRightIcon } from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerticalNavigationProps {
  currentStepId: string;
}

export default function VerticalNavigation({ currentStepId }: VerticalNavigationProps) {
  const { 
    getNavigationSections, 
    getStepStatus, 
    canAccessStep 
  } = useNavigationProgress();
  
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const navigationSections = getNavigationSections();
  
  // Automatically expand the section containing the current step
  useEffect(() => {
    if (currentStepId) {
      const sectionId = navigationSections.find(section => 
        section.steps.some(step => step.id === currentStepId)
      )?.id;
      
      if (sectionId && !expandedSections.includes(sectionId)) {
        setExpandedSections(prev => [...prev, sectionId]);
      }
    }
  }, [currentStepId, navigationSections, expandedSections]);
  
  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <Accordion 
        type="multiple" 
        value={expandedSections}
        className="w-full"
      >
        {navigationSections.map((section, sectionIndex) => {
          // Determine if the section is accessible (can user access any of its steps?)
          const sectionAccessible = section.steps.some(step => canAccessStep(step.id));
          
          return (
            <AccordionItem 
              key={section.id} 
              value={section.id}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger 
                className={`p-4 hover:bg-gray-50 ${!sectionAccessible ? 'opacity-70' : ''}`}
                onClick={() => handleSectionToggle(section.id)}
              >
                <div className="flex items-center text-left">
                  <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-full bg-purple-100 text-purple-800 mr-3">
                    {sectionIndex + 1}
                  </div>
                  <div className="font-medium">{section.title}</div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-0 py-0">
                <div className="px-4 py-2 bg-gray-50">
                  <ul className="space-y-1">
                    {section.steps.map((step, stepIndex) => {
                      const stepStatus = getStepStatus(step.id);
                      const isAccessible = canAccessStep(step.id);
                      const isCurrent = currentStepId === step.id;
                      
                      return (
                        <li key={step.id} className="relative">
                          <div className="flex items-center">
                            {/* Status icon */}
                            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                              {stepStatus === 'completed' ? (
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              ) : isCurrent ? (
                                <ArrowRightIcon className="h-5 w-5 text-blue-500" />
                              ) : !isAccessible ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <LockIcon className="h-5 w-5 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Complete previous steps first</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-gray-300 mx-auto"></div>
                              )}
                            </div>
                            
                            {/* Step link or label */}
                            {isAccessible ? (
                              <Link 
                                to={step.path} 
                                className={`
                                  block py-2 pl-2 pr-4 rounded ${
                                    isCurrent 
                                      ? 'bg-blue-50 text-blue-700 font-medium' 
                                      : 'hover:bg-gray-100'
                                  }
                                `}
                              >
                                {step.title}
                              </Link>
                            ) : (
                              <span className="block py-2 pl-2 pr-4 text-gray-500">
                                {step.title}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}