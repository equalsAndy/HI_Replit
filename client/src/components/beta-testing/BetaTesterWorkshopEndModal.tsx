import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, FileText, MessageSquare, X } from 'lucide-react';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';

interface BetaTesterWorkshopEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const BetaTesterWorkshopEndModal: React.FC<BetaTesterWorkshopEndModalProps> = ({
  isOpen,
  onClose,
  onContinue,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center p-2">
                <img 
                  src={AllStarTeamsLogo} 
                  alt="AllStarTeams" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Hi Beta Tester, you're Almost Done!
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Final Reflection - The last step of your workshop journey
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="py-6">
          <div className="space-y-6">
            {/* Main message */}
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you finish the Final Reflection, all your previous answers will be locked and your holistic report will be <strong>*unlocked*</strong> along with the sample growth plan and the example team workshop prep. The most important part is to generate and review your reports, as this is the result of your previous work. As you'll see on the page the professional report is meant to be shared while the personal report is your choice whether to share.
              </p>
              <p className="text-gray-700 leading-relaxed">
                After you see your reports, click through the growth plan and team prep. The button at the end of team prep will trigger a screen to complete your feedback. You will be able to review and edit any notes you took and then there will be some final questions.
              </p>
            </div>

            {/* Process flow */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Your Beta Testing Journey:
              </h3>
              
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>1.</strong> Complete Final Reflection → Reports unlock</p>
                <p><strong>2.</strong> Review both reports (professional & personal)</p>
                <p><strong>3.</strong> Click through Growth Plan and Team Workshop Prep</p>
                <p><strong>4.</strong> Complete feedback at end of Team Workshop Prep</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t flex justify-center">
          <Button 
            onClick={onContinue}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continue to Final Reflection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaTesterWorkshopEndModal;