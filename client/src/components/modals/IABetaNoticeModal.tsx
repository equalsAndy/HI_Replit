import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

interface IABetaNoticeModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

const IABetaNoticeModal: React.FC<IABetaNoticeModalProps> = ({ isOpen, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(dontShowAgain); }}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 text-white text-center">
          <img
            src={ImaginalAgilityLogo}
            alt="Imaginal Agility"
            className="h-12 mx-auto mb-3"
          />
          <h2 className="text-2xl font-semibold">Welcome to Imaginal Agility</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-700 leading-relaxed">
            This workshop is currently in <strong>beta</strong>. You may encounter rough edges,
            bugs, or content that's still being refined.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Thanks for your patience as we continue to improve the experience.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="ia-beta-dontshow"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(!!checked)}
            />
            <label htmlFor="ia-beta-dontshow" className="text-sm text-slate-600 cursor-pointer">
              Don't show this again
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => onClose(dontShowAgain)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IABetaNoticeModal;
