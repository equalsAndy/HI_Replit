import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { X, SkipBack, ArrowRight } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

export function QuickResumeModal() {
  const [location, navigate] = useLocation();
  const { getLastPosition } = useNavigationProgress();
  const [isOpen, setIsOpen] = useState(false);
  const [lastPosition, setLastPosition] = useState<ReturnType<typeof getLastPosition>>(null);
  
  // Check if we should show the modal on initial load
  useEffect(() => {
    const position = getLastPosition();
    if (position) {
      setLastPosition(position);
      setIsOpen(true);
    }
  }, [getLastPosition]);
  
  // Handle resuming to last position
  const handleResume = () => {
    if (lastPosition?.path) {
      navigate(lastPosition.path);
    }
    setIsOpen(false);
  };
  
  // Format the last visited date
  const formatLastVisited = (timestamp?: number) => {
    if (!timestamp) return 'Recently';
    return format(new Date(timestamp), 'MMMM d, yyyy');
  };
  
  if (!lastPosition) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resume Your Learning Journey</DialogTitle>
          <DialogDescription>
            Would you like to continue where you left off?
          </DialogDescription>
        </DialogHeader>
          
        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-900">
              Last working on:
            </h3>
            <p className="mt-1 text-base font-semibold text-indigo-700">
              {lastPosition.label}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Last visited on {formatLastVisited(lastPosition.lastVisitedAt)}
            </p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            <span>Start Fresh</span>
          </Button>
          
          <Button 
            onClick={handleResume} 
            className="gap-1"
          >
            <SkipBack className="h-4 w-4" />
            <span>Resume</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}