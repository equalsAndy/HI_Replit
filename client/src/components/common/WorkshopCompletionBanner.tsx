import React from 'react';
import { CheckCircle, Lock, Award, Eye } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useApplication } from '@/hooks/use-application';

interface WorkshopCompletionBannerProps {
  stepId?: string;
  className?: string;
}

export default function WorkshopCompletionBanner({ stepId, className = '' }: WorkshopCompletionBannerProps) {
  const { astCompleted, astCompletedAt, isWorkshopLocked, getStepModule, isModuleAccessible } = useWorkshopStatus();
  const { currentApp } = useApplication();

  // Only show for AST workshop
  if (currentApp !== 'allstarteams') {
    return null;
  }

  const module = stepId ? getStepModule(stepId) : null;
  const isStepLocked = stepId ? isWorkshopLocked('ast', stepId) : false;

  // Don't show banner if workshop isn't completed
  if (!astCompleted) {
    return null;
  }

  const getModuleStatus = () => {
    if (!module) return null;

    const isAccessible = isModuleAccessible('ast', module);

    if (module >= 1 && module <= 3) {
      return {
        status: 'locked',
        icon: <Lock className="w-4 h-4" />,
        message: `Module ${module} is now locked for reference`,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-600'
      };
    } else if (module >= 4 && module <= 5) {
      return {
        status: 'unlocked',
        icon: <Award className="w-4 h-4" />,
        message: `Module ${module} is now unlocked - view your takeaways`,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      };
    }

    return null;
  };

  const moduleStatus = getModuleStatus();

  return (
    <div className={`rounded-lg border p-3 mb-4 ${className}`}>
      {/* Workshop completion status */}
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-700">Workshop Completed</span>
        {astCompletedAt && (
          <span className="text-sm text-gray-500">
            on {new Date(astCompletedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Module-specific status */}
      {moduleStatus && (
        <div className={`flex items-center gap-2 p-2 rounded ${moduleStatus.bgColor} ${moduleStatus.borderColor} border`}>
          {moduleStatus.icon}
          <span className={`text-sm ${moduleStatus.textColor}`}>
            {moduleStatus.message}
          </span>
          {moduleStatus.status === 'locked' && (
            <Eye className="w-4 h-4 ml-auto text-gray-400" title="View only" />
          )}
        </div>
      )}

      {/* General locking message */}
      {!moduleStatus && (
        <div className="text-sm text-gray-600">
          Modules 1-3 are locked for reference. Modules 4-5 contain your takeaways.
        </div>
      )}
    </div>
  );
}