import React from 'react';
import { cn } from '@/lib/utils';

interface ValidationMessageProps {
  message?: string;
  type?: 'error' | 'success' | 'info';
  className?: string;
  show?: boolean;
}

export function ValidationMessage({ 
  message, 
  type = 'error', 
  className,
  show = true 
}: ValidationMessageProps) {
  if (!show || !message) return null;

  const baseClasses = "text-sm mt-1 flex items-center gap-1";
  const typeClasses = {
    error: "text-red-600",
    success: "text-green-600", 
    info: "text-blue-600"
  };

  return (
    <div className={cn(baseClasses, typeClasses[type], className)}>
      {type === 'error' && <span className="text-red-500">⚠</span>}
      {type === 'success' && <span className="text-green-500">✓</span>}
      {type === 'info' && <span className="text-blue-500">ℹ</span>}
      {message}
    </div>
  );
}