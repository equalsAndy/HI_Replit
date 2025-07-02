import React from 'react';
import { Lock } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useApplication } from '@/hooks/use-application';

interface LockedInputWrapperProps {
  children: React.ReactElement;
  className?: string;
}

export function LockedInputWrapper({ children, className = '' }: LockedInputWrapperProps) {
  const { isWorkshopLocked } = useWorkshopStatus();
  const { currentApp } = useApplication();
  
  // Map currentApp to the format expected by the hook
  const appType: 'ast' | 'ia' = currentApp === 'allstarteams' ? 'ast' : 'ia';
  const isLocked = isWorkshopLocked(appType);

  if (!isLocked) {
    return children;
  }

  // Clone child and add disabled props
  const lockedInput = React.cloneElement(children, {
    disabled: true,
    readOnly: true,
    className: `${children.props.className || ''} opacity-60 cursor-not-allowed bg-gray-50`,
  });

  return (
    <div className={`relative ${className}`}>
      {lockedInput}
      <div className="absolute top-2 right-2 text-gray-400 pointer-events-none">
        <Lock size={16} />
      </div>
    </div>
  );
}