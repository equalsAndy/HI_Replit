import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ArrowRight, X } from 'lucide-react';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

interface AstUnlockNoticeModalProps {
  isOpen: boolean;
  /** Dismiss the notice (also marks it seen so it won't show again). */
  onClose: () => void;
  /** Start the recommended pathway — navigates to AllStarTeams and marks the notice seen. */
  onStartAst: () => void;
  /** Participant's first name, for a personalized greeting. */
  userName?: string;
}

/**
 * Brief one-time onboarding notice for ICIE pilot participants: the recommended
 * pathway is now AllStarTeams first, then Imaginal Agility. Shown once on first
 * workshop login for users flagged with `astUnlockNoticePending`.
 */
const AstUnlockNoticeModal: React.FC<AstUnlockNoticeModalProps> = ({
  isOpen,
  onClose,
  onStartAst,
  userName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-blue-600 to-blue-800">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase text-center mb-2">
            ICIE Imaginal Agility Pilot
          </p>
          <h1 className="text-white text-2xl font-bold text-center mb-5">
            {userName ? `Welcome, ${userName}!` : 'Welcome, ICIE pilot member!'}
          </h1>

          <div className="bg-white rounded-2xl p-5 shadow-xl">
            <p className="text-slate-700 text-sm leading-relaxed mb-3">
              You will have received an email from <strong>Dr. Howard Esbin</strong> letting you
              know we&rsquo;ve added an <strong>AllStarTeams (AST)</strong> microcourse before
              {' '}<strong>Imaginal Agility (IA)</strong>.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed mb-3">
              AST has been our flagship workshop for over 15 years and is a perfect precursor to
              IA. It&rsquo;s about knowing yourself &mdash; your strengths, your flow, and how you
              think about them &mdash; which is really a prerequisite to understanding how to work with AI.
            </p>
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              We hope you enjoy them both.
            </p>

            {/* Compact pathway */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex flex-col items-center justify-center gap-1.5 border-2 border-blue-500 bg-blue-50 rounded-xl px-4 py-2 min-w-[7rem]">
                <img src={AllStarTeamsLogo} alt="AllStarTeams" className="h-5 w-auto max-w-none object-contain" />
                <span className="text-[11px] font-semibold text-blue-700">Start here</span>
              </div>
              <ArrowRight className="text-blue-400 h-5 w-5 flex-shrink-0" />
              <div className="flex flex-col items-center justify-center gap-1.5 border border-purple-200 bg-purple-50/60 rounded-xl px-4 py-2 min-w-[7rem]">
                <img src={ImaginalAgilityLogo} alt="Imaginal Agility" className="h-5 w-auto max-w-none object-contain" />
                <span className="text-[11px] font-semibold text-purple-700">Then</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed mb-5 text-center">
              Your account has access to both. Switch courses anytime from the
              {' '}<strong>profile menu</strong> in the top-right corner.
            </p>

            <Button
              onClick={onStartAst}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl"
              size="lg"
            >
              Start with AllStarTeams
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center mt-3">
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 text-sm underline underline-offset-2"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AstUnlockNoticeModal;
