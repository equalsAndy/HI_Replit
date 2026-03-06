import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Play } from 'lucide-react';

interface ImaginalAgilityWelcomeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: (showOnStartup: boolean) => void;
  showCloseButton?: boolean;
}

export const ImaginalAgilityWelcomeVideoModal: React.FC<ImaginalAgilityWelcomeVideoModalProps> = ({
  isOpen,
  onClose,
  onGetStarted,
  showCloseButton = true
}) => {
  const [showOnStartup, setShowOnStartup] = useState(true);

  const handleGetStarted = () => {
    onGetStarted(showOnStartup);
    onClose();
  };

  const handleClose = () => {
    // If user closes without clicking "Get Started", respect their preference
    // by calling onGetStarted with the current checkbox state
    if (!showOnStartup) {
      onGetStarted(false);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={showCloseButton ? handleClose : undefined}>
      <DialogContent className="max-w-4xl w-full p-0 bg-gradient-to-br from-purple-600 to-purple-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to Imaginal Agility</DialogTitle>
        </DialogHeader>

        {/* Close button - only show if allowed */}
        {showCloseButton && (
          <button
            onClick={handleClose}
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
              Welcome to Imaginal Agility
            </h1>
            <p className="text-purple-100 text-xl font-light">
              Discover how to thrive in the age of AI
            </p>
          </div>

          {/* Video Container */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <div className="relative w-full mb-6" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/6Sv-BqVuUdU?autoplay=1&enablejsapi=1&rel=0"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                title="Welcome to Imaginal Agility"
              />
            </div>

            {/* Get Started Button */}
            <div className="text-center space-y-4">
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Let's Get Started
              </Button>
              <p className="text-gray-600 text-sm">
                Ready to begin your Imaginal Agility journey
              </p>

              {/* Show at Startup Checkbox */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                <Checkbox
                  id="showOnStartup"
                  checked={showOnStartup}
                  onCheckedChange={(checked) => setShowOnStartup(!!checked)}
                />
                <label htmlFor="showOnStartup" className="cursor-pointer">
                  Show this welcome on startup
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-purple-100">
            <p className="text-sm opacity-80">
              Heliotrope Imaginal • Imaginal Agility Workshop
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImaginalAgilityWelcomeVideoModal;
