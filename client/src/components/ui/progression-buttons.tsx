import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Within-Step Content Button (Content Reveal)
interface ContentContinueButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const ContentContinueButton: React.FC<ContentContinueButtonProps> = ({
  onClick,
  children = "Continue",
  disabled = false,
  className
}) => {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      variant="secondary"
      size="medium"
      className={cn(
        "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </Button>
  );
};

// Step Progression Button (Navigation)
interface StepProgressButtonProps {
  nextStepId?: string;
  nextStepTitle?: string;
  isComplete: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  isLastStep?: boolean;
}

export const StepProgressButton: React.FC<StepProgressButtonProps> = ({
  nextStepId,
  nextStepTitle,
  isComplete,
  onClick,
  disabled = false,
  className,
  isLastStep = false
}) => {
  const getButtonText = () => {
    if (isLastStep) {
      return isComplete ? "Complete Workshop" : "Complete this step first";
    }
    
    if (isComplete && nextStepTitle) {
      return `Next: ${nextStepTitle}`;
    }
    
    if (isComplete) {
      return "Continue";
    }
    
    return "Complete this step first";
  };

  return (
    <Button 
      onClick={onClick}
      disabled={!isComplete || disabled}
      variant="primary"
      size="large"
      className={cn(
        "w-full mt-6",
        isComplete && !disabled
          ? "bg-blue-600 hover:bg-blue-700 text-white" 
          : "bg-gray-400 cursor-not-allowed text-gray-200",
        className
      )}
    >
      <span className="flex items-center justify-center">
        {getButtonText()}
        {isComplete && !isLastStep && !disabled && (
          <ChevronRight className="ml-2 h-4 w-4" />
        )}
      </span>
    </Button>
  );
};

// Next Button with Error State
interface NextButtonWithValidationProps {
  onNext: () => Promise<{ success: boolean; error?: string; nextStepId?: string }>;
  currentStepId: string;
  canProceed: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  nextStepTitle?: string;
}

export const NextButtonWithValidation: React.FC<NextButtonWithValidationProps> = ({
  onNext,
  currentStepId,
  canProceed,
  errorMessage,
  isLoading = false,
  nextStepTitle
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string>('');

  const handleClick = async () => {
    if (!canProceed || isProcessing || isLoading) return;

    setIsProcessing(true);
    setValidationError('');

    try {
      const result = await onNext();
      
      if (!result.success && result.error) {
        setValidationError(result.error);
      }
    } catch (error) {
      setValidationError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const displayError = validationError || errorMessage;

  return (
    <div className="space-y-2">
      <StepProgressButton
        nextStepTitle={nextStepTitle}
        isComplete={canProceed}
        onClick={handleClick}
        disabled={isProcessing || isLoading}
      />
      
      {displayError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{displayError}</p>
        </div>
      )}
      
      {isProcessing && (
        <div className="text-center">
          <div className="inline-flex items-center text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Processing...
          </div>
        </div>
      )}
    </div>
  );
};

// Generic Progress Button with State Management
interface ProgressButtonProps {
  stepId: string;
  nextStepId?: string;
  nextStepTitle?: string;
  onValidateAndProceed: (stepId: string) => Promise<{ success: boolean; error?: string }>;
  validationFn?: (stepId: string) => boolean;
  children?: React.ReactNode;
  className?: string;
}

export const ProgressButton: React.FC<ProgressButtonProps> = ({
  stepId,
  nextStepId,
  nextStepTitle,
  onValidateAndProceed,
  validationFn,
  children,
  className
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  
  const canProceed = validationFn ? validationFn(stepId) : true;

  const handleNext = async (): Promise<{ success: boolean; error?: string; nextStepId?: string }> => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await onValidateAndProceed(stepId);
      
      if (!result.success) {
        setError(result.error || 'Validation failed');
        return result;
      }
      
      return { success: true, nextStepId };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  if (children) {
    return (
      <div className="space-y-2">
        {React.cloneElement(children as React.ReactElement, {
          onClick: handleNext,
          disabled: !canProceed || isLoading,
          className: cn(children.props?.className, className)
        })}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <NextButtonWithValidation
      onNext={handleNext}
      currentStepId={stepId}
      canProceed={canProceed}
      errorMessage={error}
      isLoading={isLoading}
      nextStepTitle={nextStepTitle}
    />
  );
};