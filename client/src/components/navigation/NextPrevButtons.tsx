import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NextPrevButtonsProps {
  onNext?: () => void;
  onPrev?: () => void;
  onComplete?: () => void;
  showComplete?: boolean;
  completeLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
  showNext?: boolean;
  showPrev?: boolean;
  showComplete?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  className?: string;
}

export function NextPrevButtons({
  onNext,
  onPrev,
  onComplete,
  showNext = true,
  showPrev = true,
  showComplete = false,
  nextLabel = "Next",
  prevLabel = "Previous",
  completeLabel = "Complete",
  className
}: NextPrevButtonsProps) {
  const [location, navigate] = useLocation();
  const { progress, currentStepId, markStepCompleted } = useNavigationProgress();
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [prevPath, setPrevPath] = useState<string | null>(null);
  const [nextStepLabel, setNextStepLabel] = useState<string | null>(null);
  const [prevStepLabel, setPrevStepLabel] = useState<string | null>(null);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);

  // Find next and previous steps
  useEffect(() => {
    if (!progress?.sections || !currentStepId) return;

    const allSteps = progress.sections.flatMap(section => section.steps);
    const currentStepIndex = allSteps.findIndex(step => step.id === currentStepId);

    if (currentStepIndex >= 0) {
      // Find next step
      if (currentStepIndex < allSteps.length - 1) {
        const nextStep = allSteps[currentStepIndex + 1];
        setNextPath(nextStep.path);
        setNextStepLabel(nextStep.label);
      } else {
        setNextPath(null);
        setNextStepLabel(null);
      }

      // Find previous step
      if (currentStepIndex > 0) {
        const prevStep = allSteps[currentStepIndex - 1];
        setPrevPath(prevStep.path);
        setPrevStepLabel(prevStep.label);
      } else {
        setPrevPath(null);
        setPrevStepLabel(null);
      }
    }
  }, [progress?.sections, currentStepId]);

  // Handle navigation
  const handleNext = () => {
    if (currentStepId) {
      // Mark the current step as completed
      markStepCompleted(currentStepId);

      // Show completion animation
      setShowCompletionAnimation(true);

      // Wait for animation to complete before navigating
      setTimeout(() => {
        setShowCompletionAnimation(false);

        if (onNext) {
          onNext();
        } else if (nextPath) {
          navigate(nextPath);
        }
      }, 1000);
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else if (prevPath) {
      navigate(prevPath);
    }
  };

  const handleComplete = () => {
    if (currentStepId) {
      // Mark the current step as completed
      markStepCompleted(currentStepId);

      // Show completion animation
      setShowCompletionAnimation(true);

      // Wait for animation to complete before calling onComplete
      setTimeout(() => {
        setShowCompletionAnimation(false);

        if (onComplete) {
          onComplete();
        }
      }, 1000);
    }
  };

  return (
    <div className={cn("flex items-center justify-between mt-8", className)}>
      {/* Previous button */}
      {showPrev && (
        <Button
          variant="outline"
          className="gap-2"
          onClick={handlePrev}
          disabled={!prevPath && !onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{prevLabel}</span>
          {prevStepLabel && (
            <span className="hidden sm:inline text-gray-500 text-xs">
              ({prevStepLabel})
            </span>
          )}
        </Button>
      )}

      {/* Spacer if only showing one button */}
      {!showPrev && <div />}

      {/* Completion animation overlay */}
      {showCompletionAnimation && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20 
            }}
          >
            <CheckCircle className="h-24 w-24 text-green-500" />
          </motion.div>
        </motion.div>
      )}

      {/* Next or Complete Button */}
      {showComplete ? (
        <Button
          className="gap-2"
          onClick={handleComplete}
          variant="default"
        >
          <span>{completeLabel}</span>
          <CheckCircle className="h-4 w-4" />
        </Button>
      ) : (
        showNext && (
          <Button
            className="gap-2"
            onClick={handleNext}
            disabled={!nextPath && !onNext}
          >
            <span>{nextLabel}</span>
            {nextStepLabel && (
              <span className="hidden sm:inline text-gray-100 text-xs">
                ({nextStepLabel})
              </span>
            )}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )
      )}
    </div>
  );
}