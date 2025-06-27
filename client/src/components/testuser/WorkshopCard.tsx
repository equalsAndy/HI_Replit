import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface WorkshopProgress {
  type: 'ast' | 'ia';
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  lastActivity: string;
  logoPath: string;
  route: string;
}

interface WorkshopCardProps {
  workshop: WorkshopProgress;
  isLastActive: boolean;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, isLastActive }) => {
  const [, setLocation] = useLocation();

  // Handle navigation to workshop
  const handleWorkshopNavigation = () => {
    setLocation(`/${workshop.route}`);
  };

  // Simple button text for all workshops
  const buttonText = workshop.type === 'ast' 
    ? 'Go to AllStarTeams Workshop'
    : 'Go to Imaginal Agility Workshop';

  const isAst = workshop.type === 'ast';

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-gray-200">
      {/* Workshop Header */}
      <CardHeader 
        className={cn(
          "p-6 flex flex-row items-center space-y-0 relative overflow-hidden",
          isAst 
            ? "bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200" 
            : "bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200"
        )}
      >
        {/* Workshop Logo */}
        <div className="w-16 h-16 mr-5 rounded-xl overflow-hidden shadow-md bg-white flex items-center justify-center p-2">
          <img 
            src={workshop.logoPath} 
            alt={`${workshop.title} Logo`}
            className="w-full h-full object-contain"
            onError={(e) => {
              // Fallback if logo fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center ${isAst ? 'text-blue-600' : 'text-purple-600'} font-bold text-2xl">${isAst ? '★' : '◯'}</div>`;
              }
            }}
          />
        </div>

        {/* Workshop Info */}
        <div className="flex-1">
          <h2 className={cn(
            "text-xl font-semibold mb-1",
            isAst ? "text-blue-900" : "text-purple-900"
          )}>
            {workshop.title}
          </h2>
          <p className={cn(
            "text-sm opacity-80",
            isAst ? "text-blue-700" : "text-purple-700"
          )}>
            {workshop.subtitle}
          </p>
        </div>
      </CardHeader>

      {/* Workshop Content */}
      <CardContent className="p-6">
        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Current Progress</span>
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border",
              isAst 
                ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200"
                : "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200"
            )}>
              Step {workshop.currentStep} of {workshop.totalSteps} - {workshop.stepName}
            </div>
          </div>

          {/* Last Activity */}
          <div className="text-xs text-gray-500">
            <div className="flex flex-col">
              <span className="font-medium text-gray-700 mb-1">Last Activity</span>
              <span>{workshop.lastActivity}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col">
          <Button
            onClick={handleWorkshopNavigation}
            className={cn(
              "w-full font-medium transition-all duration-200",
              isLastActive
                ? isAst
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg"
                : "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md hover:shadow-lg"
            )}
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkshopCard;