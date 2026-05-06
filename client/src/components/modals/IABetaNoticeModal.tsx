import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

interface IABetaNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IABetaNoticeModal: React.FC<IABetaNoticeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
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
            We're glad you're here. Imaginal Agility is in <strong>beta</strong>, which means
            you're among the first to experience it — and your feedback will help shape it.
          </p>
          <p className="text-slate-700 leading-relaxed">
            You may notice a few areas still being polished as we refine the experience.
            Thank you for being part of this early journey with us.
          </p>

          <div className="flex justify-end pt-2">
            <Button
              onClick={onClose}
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
