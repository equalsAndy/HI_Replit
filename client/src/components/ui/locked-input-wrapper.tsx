import React from 'react';
import { Lock } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';

interface LockedInputWrapperProps {
  children: React.ReactElement;
  className?: string;
}

export function LockedInputWrapper({ children, className = '' }: LockedInputWrapperProps) {
  const { isWorkshopLocked, completed, loading } = useWorkshopStatus();
  const isLocked = isWorkshopLocked();

  // Debug locking status
  console.log('🔒 LockedInputWrapper - Status:', {
    isLocked,
    completed,
    loading,
    hasChildren: !!children
  });

  if (!isLocked) {
    return children;
  }

  // Clone child and add disabled props - MORE AGGRESSIVE LOCKING
  const lockedInput = React.cloneElement(children, {
    disabled: true,
    readOnly: true,
    value: children.props.value || '', // Force value to prevent changes
    onChange: () => {}, // Block all changes
    className: `${children.props.className || ''} opacity-60 cursor-not-allowed bg-gray-100 border-gray-300`,
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