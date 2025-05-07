import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  showLabel = true,
  className
}: ProgressBarProps) {
  // Ensure progress is between 0 and 100
  const safeProgress = Math.min(Math.max(0, progress), 100);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-neutral-200 rounded-full h-4">
        <div 
          className="bg-primary h-4 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${safeProgress}%` }}
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-sm text-neutral-600">{safeProgress}% Complete</span>
      )}
    </div>
  );
}

export default ProgressBar;
