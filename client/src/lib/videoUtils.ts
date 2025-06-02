/**
 * Video Utilities for YouTube URL Processing and Responsive Video Handling
 * Provides comprehensive YouTube URL conversion, parameter management, and responsive video utilities
 */

export interface VideoUrlParams {
  autoplay?: number | boolean;
  rel?: number;
  modestbranding?: number;
  showinfo?: number;
  controls?: number;
  mute?: number | boolean;
  enablejsapi?: number;
  origin?: string;
}

export interface ProcessedVideoUrl {
  embedUrl: string;
  originalUrl: string;
  videoId: string | null;
  platform: 'youtube' | 'vimeo' | 'other';
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  // Handle youtube.com/embed/VIDEO_ID format
  const embedRegex = /(?:youtube\.com\/embed\/)([^?&/]+)/;
  const embedMatch = url.match(embedRegex);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }
  
  // Handle youtube.com/watch?v=VIDEO_ID format
  const watchRegex = /(?:youtube\.com\/watch\?v=)([^&]+)/;
  const watchMatch = url.match(watchRegex);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }
  
  // Handle youtu.be/VIDEO_ID format
  const shortRegex = /(?:youtu\.be\/)([^?&/]+)/;
  const shortMatch = url.match(shortRegex);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }
  
  // Handle youtube-nocookie.com formats
  const noCookieRegex = /(?:youtube-nocookie\.com\/embed\/)([^?&/]+)/;
  const noCookieMatch = url.match(noCookieRegex);
  if (noCookieMatch && noCookieMatch[1]) {
    return noCookieMatch[1];
  }
  
  return null;
}

/**
 * Build YouTube embed URL with distraction-suppressing parameters and autoplay
 */
export function buildYouTubeEmbedUrl(
  videoId: string, 
  customParams: VideoUrlParams = {}
): string {
  const baseUrl = 'https://www.youtube-nocookie.com/embed';
  
  // Default parameters for distraction-free autoplay experience
  const defaultParams: VideoUrlParams = {
    autoplay: 1,           // Enable autoplay
    rel: 0,               // Suppress related videos
    modestbranding: 1,    // Hide YouTube branding
    showinfo: 0,          // Hide video info overlay
    controls: 1,          // Show player controls
    mute: 0,              // Start unmuted (will fallback to muted if browser blocks)
    enablejsapi: 1,       // Enable JavaScript API for better control
  };

  // Merge custom parameters with defaults
  const params = { ...defaultParams, ...customParams };
  
  // Add origin parameter for better embed compatibility
  if (typeof window !== 'undefined') {
    params.origin = window.location.origin;
  }
  
  // Build query string
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value.toString())}`)
    .join('&');
  
  return `${baseUrl}/${videoId}?${queryString}`;
}

/**
 * Process any video URL and return standardized embed information
 */
export function processVideoUrl(url: string, customParams?: VideoUrlParams): ProcessedVideoUrl {
  if (!url) {
    return {
      embedUrl: '',
      originalUrl: url,
      videoId: null,
      platform: 'other'
    };
  }

  // Check for YouTube URLs
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return {
      embedUrl: buildYouTubeEmbedUrl(youtubeId, customParams),
      originalUrl: url,
      videoId: youtubeId,
      platform: 'youtube'
    };
  }

  // Check for Vimeo URLs (basic support)
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0&portrait=0`,
      originalUrl: url,
      videoId: vimeoMatch[1],
      platform: 'vimeo'
    };
  }

  // Return original URL for other platforms
  return {
    embedUrl: url,
    originalUrl: url,
    videoId: null,
    platform: 'other'
  };
}

/**
 * Create responsive video wrapper with proper aspect ratio
 */
export function createVideoWrapper(
  embedUrl: string, 
  aspectRatio: '16:9' | '4:3' | '21:9' = '16:9',
  className: string = ''
): string {
  const aspectClass = {
    '16:9': 'video-aspect-16-9',
    '4:3': 'video-aspect-4-3',
    '21:9': 'video-aspect-21-9'
  }[aspectRatio];

  return `
    <div class="video-responsive-container ${className}">
      <div class="video-aspect-wrapper ${aspectClass}">
        <iframe 
          class="video-responsive-element" 
          src="${embedUrl}"
          title="Video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;
}

/**
 * Handle autoplay fallback for browsers that block autoplay
 */
export function handleAutoplayFallback(iframe: HTMLIFrameElement): void {
  if (!iframe) return;

  // Listen for autoplay failures and implement fallback
  const handleAutoplayError = () => {
    const src = iframe.src;
    if (src.includes('autoplay=1') && !src.includes('mute=1')) {
      // Fallback to muted autoplay
      const fallbackUrl = src.replace('mute=0', 'mute=1');
      iframe.src = fallbackUrl;
    }
  };

  // Listen for potential autoplay blocks
  iframe.addEventListener('load', () => {
    setTimeout(() => {
      // Check if video is playing by attempting to communicate with iframe
      try {
        iframe.contentWindow?.postMessage('{"event":"command","func":"getPlayerState"}', '*');
      } catch (error) {
        // If communication fails, assume autoplay might be blocked
        handleAutoplayError();
      }
    }, 1000);
  });
}

/**
 * Utility to update existing YouTube URLs in content
 */
export function updateYouTubeUrlsInContent(content: string): string {
  const youtubeUrlRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/g;
  
  return content.replace(youtubeUrlRegex, (match, videoId) => {
    const processed = processVideoUrl(match);
    return processed.embedUrl;
  });
}

/**
 * Check if browser supports autoplay
 */
export async function canAutoplay(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const video = document.createElement('video');
    video.muted = false;
    video.src = 'data:video/mp4;base64,AAAAFGZ0eXBNUEg0'; // Minimal MP4 data
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      try {
        await playPromise;
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Get optimal video parameters based on browser capabilities
 */
export async function getOptimalVideoParams(): Promise<VideoUrlParams> {
  const canPlay = await canAutoplay();
  
  return {
    autoplay: 1,
    rel: 0,
    modestbranding: 1,
    showinfo: 0,
    controls: 1,
    mute: canPlay ? 0 : 1, // Mute only if autoplay is blocked
    enablejsapi: 1,
  };
}

/**
 * Responsive video breakpoint utilities
 */
export const videoBreakpoints = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  
  isMobile: () => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
  isTablet: () => typeof window !== 'undefined' && window.matchMedia('(min-width: 641px) and (max-width: 1024px)').matches,
  isDesktop: () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1025px)').matches,
};

/**
 * Video loading state utilities
 */
export function createVideoLoadingPlaceholder(aspectRatio: '16:9' | '4:3' | '21:9' = '16:9'): string {
  const aspectClass = {
    '16:9': 'video-aspect-16-9',
    '4:3': 'video-aspect-4-3',
    '21:9': 'video-aspect-21-9'
  }[aspectRatio];

  return `
    <div class="video-responsive-container">
      <div class="video-aspect-wrapper ${aspectClass}">
        <div class="video-responsive-element video-loading"></div>
      </div>
    </div>
  `;
}