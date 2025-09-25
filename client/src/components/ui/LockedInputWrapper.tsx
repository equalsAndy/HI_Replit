import React from 'react';
import { Lock } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useApplication } from '@/hooks/use-application';

interface LockedInputWrapperProps {
  children: React.ReactElement;
  className?: string;
  showLockIcon?: boolean;
  stepId?: string; // Optional: for step-specific locking
}

export function LockedInputWrapper({
  children,
  className = '',
  showLockIcon = true,
  stepId
}: LockedInputWrapperProps) {
  const { isWorkshopLocked } = useWorkshopStatus();
  const { currentApp } = useApplication();

  const appType = currentApp === 'allstarteams' ? 'ast' : 'ia';
  const isLocked = isWorkshopLocked(appType, stepId);

  if (!isLocked) {
    return children;
  }

  // Clone the child element and add disabled/readOnly props
  const lockedInput = React.cloneElement(children, {
    disabled: true,
    readOnly: true,
    className: `${children.props.className || ''} opacity-60 cursor-not-allowed bg-gray-50`,
    'data-locked': 'true',
    // Prevent any click/change handlers from firing
    onClick: undefined,
    onChange: undefined,
    onValueChange: undefined,
    onCheckedChange: undefined
  });

  return (
    <div className={`relative ${className}`}>
      {lockedInput}
      {showLockIcon && (
        <div className="absolute top-2 right-2 text-gray-400 pointer-events-none z-10">
          <Lock size={16} />
        </div>
      )}
    </div>
  );
}