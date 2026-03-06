import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-current-user';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to parse full name into first and last name
const parseFullName = (fullName: string) => {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

// Build JotForm URL with pre-populated user data
const buildJotFormUrl = (user: any): string => {
  const baseUrl = 'https://form.jotform.com/253496080873163';
  const params = new URLSearchParams();

  // Always add iframe embed parameter
  params.append('isIframeEmbed', '1');

  // Pre-populate with user data if available
  if (user) {
    if (user.name) {
      const { firstName, lastName } = parseFullName(user.name);
      if (firstName) params.append('name[first]', firstName);
      if (lastName) params.append('name[last]', lastName);
    }
    if (user.email) params.append('email', user.email);
  }

  return `${baseUrl}?${params.toString()}`;
};

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { data: user } = useCurrentUser();
  const [iframeHeight, setIframeHeight] = useState(590); // Reduced from 640 to hide logo
  const jotFormUrl = buildJotFormUrl(user);

  // Listen for iframe height changes from JotForm
  useEffect(() => {
    const handleIframeMessage = (e: MessageEvent) => {
      // Only accept messages from JotForm
      if (e.origin !== 'https://form.jotform.com') return;

      const data = e.data;

      // Handle height updates
      if (data && typeof data === 'string') {
        const heightMatch = data.match(/frameHeight:(\d+)/);
        if (heightMatch) {
          // Reduce height by 50px to cut off JotForm logo at bottom
          const adjustedHeight = parseInt(heightMatch[1], 10) - 50;
          setIframeHeight(adjustedHeight);
        }
      }

      // Handle form submission success - auto-close modal
      if (data && typeof data === 'object') {
        // JotForm sends various events, check for submission-completed
        if (data.action === 'submission-completed' || data.event === 'submit') {
          // Give user a moment to see the success message before closing
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-semibold text-purple-700">
            Contact Us About Team Implementation
          </DialogTitle>
        </DialogHeader>
        <div className="w-full overflow-hidden px-6 pb-6">
          <iframe
            id="JotFormIFrame-253496080873163"
            title="Contact Form"
            src={jotFormUrl}
            allow="geolocation; microphone; camera; fullscreen; payment"
            style={{
              width: '100%',
              height: `${iframeHeight}px`,
              border: 'none',
              minHeight: '400px',
              overflow: 'hidden',
            }}
            className="rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
