import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, User, Star, Award, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepItemProps {
  title: string;
  isComplete?: boolean;
  icon: 'profile' | 'assessment' | 'report' | 'whiteboard';
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}

export default function StepItem({
  title,
  isComplete = false,
  icon,
  isOpen = false,
  onToggle,
  children
}: StepItemProps) {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) {
      onToggle();
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'profile':
        return <User className="h-5 w-5" />;
      case 'assessment':
        return <Star className="h-5 w-5" />;
      case 'report':
        return <Award className="h-5 w-5" />;
      case 'whiteboard':
        return <Layout className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  return (
    <div className="step-item">
      <div 
        className={cn(
          "step-header",
          isExpanded && "bg-neutral-50"
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center">
          <div className="step-icon mr-3 text-primary">
            {getIcon()}
          </div>
          <h3 className="font-medium text-neutral-700">
            {title} {isComplete && <span className="text-green-500 ml-1">✓</span>}
          </h3>
        </div>
        <div className="step-toggle text-neutral-600">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="step-content">
          {children}
        </div>
      )}
    </div>
  );
}
