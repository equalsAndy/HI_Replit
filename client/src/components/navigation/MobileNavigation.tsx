import { useState } from 'react';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import VerticalNavigation from './VerticalNavigation';

interface MobileNavigationProps {
  currentStepId: string;
}

export default function MobileNavigation({ currentStepId }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  
  // Close the navigation when clicked
  const handleClose = () => {
    setOpen(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Menu className="h-4 w-4" />
          <span>Navigation</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Learning Journey</SheetTitle>
        </SheetHeader>
        
        <div className="overflow-y-auto max-h-[calc(100vh-80px)] pb-6" onClick={handleClose}>
          <VerticalNavigation currentStepId={currentStepId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}