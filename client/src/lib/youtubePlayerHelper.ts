/**
 * YouTube IFrame Player API Helper
 *
 * Provides a simple interface to track video playback progress using the YouTube IFrame API.
 * Used for enforcing video watch requirements before allowing step progression.
 *
 * @see https://developers.google.com/youtube/iframe_api_reference
 */

// TypeScript declarations for YouTube IFrame API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface VideoProgress {
  percentage: number;      // 0-100
  currentTime: number;      // seconds
  duration: number;         // seconds
  maxPercentage: number;    // highest percentage reached
}

export interface YouTubePlayerOptions {
  onProgress?: (progress: VideoProgress) => void;
  onReady?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  pollInterval?: number;  // milliseconds, default 10000 (10 seconds)
}

/**
 * Load the YouTube IFrame API script
 * Only loads once, subsequent calls return immediately
 */
let apiLoaded = false;
let apiLoading = false;
const apiLoadCallbacks: (() => void)[] = [];

export function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded
    if (apiLoaded && window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Currently loading - queue callback
    if (apiLoading) {
      apiLoadCallbacks.push(resolve);
      return;
    }

    // Start loading
    apiLoading = true;

    // Set up global callback
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiLoading = false;
      resolve();

      // Call all queued callbacks
      apiLoadCallbacks.forEach(cb => cb());
      apiLoadCallbacks.length = 0;
    };

    // Inject script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });
}

/**
 * Initialize YouTube Player on an existing iframe element
 *
 * @param iframeElement - The iframe element to control (must have enablejsapi=1 in src)
 * @param options - Progress tracking callbacks and configuration
 * @returns Cleanup function to stop tracking and destroy player
 */
export async function initYouTubePlayer(
  iframeElement: HTMLIFrameElement,
  options: YouTubePlayerOptions = {}
): Promise<() => void> {
  const {
    onProgress,
    onReady,
    onEnded,
    onError,
    pollInterval = 10000  // Default 10 seconds
  } = options;

  // Load API if not already loaded
  await loadYouTubeAPI();

  let player: any = null;
  let progressTimer: NodeJS.Timeout | null = null;
  let maxPercentageReached = 0;

  try {
    // Create player instance
    player = new window.YT.Player(iframeElement, {
      events: {
        onReady: (event: any) => {
          console.log('🎬 YouTube Player ready');

          if (onReady) {
            onReady();
          }

          // Start progress tracking
          if (onProgress) {
            startProgressTracking();
          }
        },
        onStateChange: (event: any) => {
          const state = event.data;

          // State constants from YT API
          // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)

          if (state === 0) {
            // Video ended - report 100%
            console.log('🎬 YouTube Player ended');
            maxPercentageReached = 100;

            if (onProgress) {
              onProgress({
                percentage: 100,
                currentTime: event.target.getDuration(),
                duration: event.target.getDuration(),
                maxPercentage: 100
              });
            }

            if (onEnded) {
              onEnded();
            }
          } else if (state === 1) {
            // Playing - ensure tracking is active
            console.log('🎬 YouTube Player playing');
            if (onProgress && !progressTimer) {
              startProgressTracking();
            }
          }
        },
        onError: (event: any) => {
          console.error('🎬 YouTube Player error:', event.data);
          if (onError) {
            onError(event.data);
          }
        }
      }
    });

    function startProgressTracking() {
      if (progressTimer) {
        clearInterval(progressTimer);
      }

      progressTimer = setInterval(() => {
        try {
          if (player && player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();

            if (duration > 0) {
              const percentage = Math.min(Math.round((currentTime / duration) * 100), 100);

              // Track maximum percentage reached (prevents gaming by seeking)
              maxPercentageReached = Math.max(maxPercentageReached, percentage);

              if (onProgress) {
                onProgress({
                  percentage,
                  currentTime,
                  duration,
                  maxPercentage: maxPercentageReached
                });
              }

              console.log(`🎬 Video progress: ${percentage}% (max: ${maxPercentageReached}%)`);
            }
          }
        } catch (error) {
          console.error('🎬 Error tracking video progress:', error);
        }
      }, pollInterval);
    }

  } catch (error) {
    console.error('🎬 Error initializing YouTube Player:', error);
    if (onError) {
      onError(error);
    }
  }

  // Return cleanup function
  return () => {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
    if (player && player.destroy) {
      player.destroy();
    }
  };
}

/**
 * Extract YouTube video ID from various URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/  // Direct ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
