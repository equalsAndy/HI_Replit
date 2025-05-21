import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, ClipboardCheck, X } from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

export function AssessmentModal({ isOpen, onClose, onComplete }: AssessmentModalProps) {
  const [, navigate] = useLocation();
  
  const handleStartAssessment = () => {
    navigate('/assessment');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">AllStarTeams Strengths Assessment</DialogTitle>
          <DialogDescription className="pt-2">
            Discover your unique strengths profile by completing this assessment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">About this assessment</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>22 questions about how you approach work and collaboration</span>
              </li>
              <li className="flex items-start">
                <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Takes approximately 10-15 minutes to complete</span>
              </li>
              <li className="flex items-start">
                <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Rank options based on how well they describe you</span>
              </li>
              <li className="flex items-start">
                <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Creates your personal Star Card showing your strengths distribution</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="font-medium text-amber-800 mb-2">Instructions</h3>
            <p className="text-sm text-amber-700">
              For each scenario, drag and drop the options to rank them from most like you (1) to least 
              like you (4). There are no right or wrong answers - just be honest about your preferences.
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> What you'll get
            </h3>
            <p className="text-sm text-green-700">
              Your personal Star Card showing your unique distribution of strengths across the four 
              dimensions: Thinking, Acting, Feeling, and Planning. This will guide your learning journey
              through the rest of the AllStarTeams program.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button 
            onClick={handleStartAssessment} 
            className="w-full sm:w-auto order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700"
          >
            Start Assessment <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}