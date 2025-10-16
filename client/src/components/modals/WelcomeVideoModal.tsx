import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';

interface WelcomeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
  showCloseButton?: boolean;
  autoplay?: boolean;
}

export const WelcomeVideoModal: React.FC<WelcomeVideoModalProps> = ({
  isOpen,
  onClose,
  onGetStarted,
  showCloseButton = true,
  autoplay = true
}) => {
  const handleGetStarted = () => {
    onGetStarted();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={showCloseButton ? onClose : undefined}>
      <DialogContent className="max-w-4xl w-full p-0 bg-gradient-to-br from-blue-600 to-blue-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to AllStarTeams</DialogTitle>
        </DialogHeader>

        {/* Close button - only show if allowed */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              Welcome to AllStarTeams
            </h1>
            <p className="text-blue-100 text-xl font-light">
              Let's start your journey to discovering your strengths
            </p>
          </div>

          {/* Video Container */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <div className="relative w-full mb-6" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/-2rSUwW17rw?${autoplay ? 'autoplay=1&' : ''}enablejsapi=1&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                title="Welcome to AllStarTeams"
              />
            </div>

            {/* Get Started Button */}
            <div className="text-center">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Let's Get Started
              </Button>
              <p className="text-gray-600 text-sm mt-3">
                Ready to begin your AllStarTeams journey
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-blue-100">
            <p className="text-sm opacity-80">
              Heliotrope Imaginal • AllStarTeams Workshop
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeVideoModal;