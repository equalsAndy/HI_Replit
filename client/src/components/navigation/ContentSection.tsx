import { ReactNode } from 'react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, BookOpen } from 'lucide-react';
import { NextPrevButtons } from './NextPrevButtons';
import { cn } from '@/lib/utils';

interface ContentSectionProps {
  title: string;
  description?: string;
  stepId: string;
  estimatedTime?: number;
  required?: boolean;
  children: ReactNode;
  className?: string;
  hideNavigation?: boolean;
  onNextClick?: () => void;
  onPrevClick?: () => void;
  showCompleteButton?: boolean;
  onCompleteClick?: () => void;
}

export function ContentSection({
  title,
  description,
  stepId,
  estimatedTime,
  required = true,
  children,
  className,
  hideNavigation = false,
  onNextClick,
  onPrevClick,
  showCompleteButton = false,
  onCompleteClick
}: ContentSectionProps) {
  const { completedSteps, currentStepId } = useNavigationProgress();
  const isCompleted = completedSteps.includes(stepId);
  
  return (
    <Card className={cn("mb-8", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              {title}
              {isCompleted && (
                <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
              )}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            {estimatedTime && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{estimatedTime} min</span>
              </div>
            )}
            
            {required ? (
              <Badge variant="default" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                Required
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                Optional
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="prose prose-indigo max-w-none">
        {children}
      </CardContent>
      
      {!hideNavigation && (
        <CardFooter>
          <NextPrevButtons 
            onNext={onNextClick}
            onPrev={onPrevClick}
            onComplete={onCompleteClick}
            showComplete={showCompleteButton}
            completeLabel="Complete Section"
          />
        </CardFooter>
      )}
    </Card>
  );
}