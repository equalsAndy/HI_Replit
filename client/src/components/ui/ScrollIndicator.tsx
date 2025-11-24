import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  /**
   * Idle time in milliseconds before showing the indicator
   * @default 3000 (3 seconds)
   */
  idleTime?: number;
  /**
   * Position of the indicator (next to nav menu)
   * @default 'nav-adjacent'
   */
  position?: 'nav-adjacent' | 'center';
  /**
   * Color scheme for the indicator
   * @default 'purple' (for IA workshop)
   */
  colorScheme?: 'purple' | 'blue';
}

/**
 * ScrollIndicator - A subtle down arrow that appears when user is idle
 * to indicate there's more content below
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  idleTime = 3000,
  position = 'nav-adjacent',
  colorScheme = 'purple',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Check if user is at bottom of page
  const checkScrollPosition = useCallback(() => {
    // Find the scrollable content container (the main content area)
    const contentArea = document.querySelector('.flex-1.overflow-auto') as HTMLElement;

    console.log('ScrollIndicator: Checking scroll position, contentArea found:', !!contentArea);

    if (contentArea) {
      // Check scroll position of the content area, not the window
      const scrollHeight = contentArea.scrollHeight;
      const scrollTop = contentArea.scrollTop;
      const clientHeight = contentArea.clientHeight;

      // Consider "at bottom" if within 100px of the bottom
      const atBottom = scrollTop + clientHeight >= scrollHeight - 100;

      console.log('ScrollIndicator (Content Area):', {
        scrollHeight,
        scrollTop,
        clientHeight,
        atBottom,
        hasContent: scrollHeight > clientHeight
      });

      setIsAtBottom(atBottom);
    } else {
      // Fallback to window scroll
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      const atBottom = scrollTop + windowHeight >= documentHeight - 100;

      console.log('ScrollIndicator (Window):', {
        windowHeight,
        documentHeight,
        scrollTop,
        atBottom
      });

      setIsAtBottom(atBottom);
    }
  }, []);

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);

    // Clear any existing timer
    const existingTimer = (window as any).__scrollIndicatorTimer;
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      setIsIdle(true);
    }, idleTime);

    (window as any).__scrollIndicatorTimer = timer;
  }, [idleTime]);

  // Handle user activity events
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart'];
    const contentArea = document.querySelector('.flex-1.overflow-auto') as HTMLElement;

    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Listen to scroll events on both window and content area
    window.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('scroll', resetIdleTimer);

    if (contentArea) {
      contentArea.addEventListener('scroll', checkScrollPosition);
      contentArea.addEventListener('scroll', resetIdleTimer);
    }

    // Initial check
    checkScrollPosition();
    resetIdleTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('scroll', resetIdleTimer);

      if (contentArea) {
        contentArea.removeEventListener('scroll', checkScrollPosition);
        contentArea.removeEventListener('scroll', resetIdleTimer);
      }

      // Clear timer on unmount
      const existingTimer = (window as any).__scrollIndicatorTimer;
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
    };
  }, [resetIdleTimer, checkScrollPosition]);

  // Show indicator when idle and not at bottom
  useEffect(() => {
    const shouldShow = isIdle && !isAtBottom;
    console.log('ScrollIndicator Visibility:', { isIdle, isAtBottom, shouldShow });
    setIsVisible(shouldShow);
  }, [isIdle, isAtBottom]);

  if (!isVisible) return null;

  // Color classes based on colorScheme
  const colorClasses = {
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  // Position classes
  const positionClasses = position === 'nav-adjacent'
    ? 'fixed left-1/2 bottom-8 -translate-x-1/2 z-50' // Center bottom of content area
    : 'fixed left-1/2 -translate-x-1/2 bottom-24 z-50'; // Center bottom

  return (
    <div
      className={`${positionClasses} flex flex-col items-center gap-2`}
      role="status"
      aria-label="More content below"
    >
      {/* Bouncing arrow icon */}
      <div
        className={`
          ${colorClasses[colorScheme]}
          rounded-full p-2 shadow-lg border-2
          animate-bounce
        `}
      >
        <ChevronDown className="w-6 h-6" />
      </div>

      {/* Static text label */}
      <div
        className={`
          text-sm font-medium px-4 py-2 rounded-lg
          bg-white/60 backdrop-blur-sm
          ${colorScheme === 'purple' ? 'text-purple-700' : 'text-blue-700'}
        `}
        style={{
          boxShadow: '0 0 20px 10px rgba(255, 255, 255, 0.3)'
        }}
      >
        Scroll for more
      </div>
    </div>
  );
};

export default ScrollIndicator;
