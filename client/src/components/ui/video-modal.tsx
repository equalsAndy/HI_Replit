import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoId,
  title = "Workshop Overview Video"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-opacity"
            aria-label="Close video"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Video container */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              title={title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};