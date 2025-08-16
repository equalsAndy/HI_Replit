/**
 * StarCard Auto-Capture Service
 * Automatically captures StarCard as PNG and saves to server database or filesystem
 */

// html2canvas imported dynamically to keep it out of main bundle

export interface StarCardCaptureOptions {
  userId?: number;
  saveToDatabase?: boolean;
  saveToTempComms?: boolean;
  filename?: string;
  quality?: number;
}

export interface StarCardCaptureResult {
  success: boolean;
  message: string;
  filePath?: string;
  photoId?: number;
  replaced?: boolean;
  error?: string;
}

class StarCardCaptureService {
  
  /**
   * Automatically capture StarCard element and save to server
   */
  async captureAndSave(
    element: HTMLElement, 
    options: StarCardCaptureOptions = {}
  ): Promise<StarCardCaptureResult> {
    try {
      console.log('🎯 StarCard Auto-Capture: Starting capture process');
      
      // Default options
      const {
        userId,
        saveToDatabase = false,
        saveToTempComms = true,
        filename = `starcard-${Date.now()}.png`,
        quality = 2
      } = options;

      // Dynamically import html2canvas to keep it out of main bundle
      const html2canvas = (await import('html2canvas')).default;
      
      // Capture the StarCard as canvas
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: quality,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      // Convert to base64 PNG
      const base64Data = canvas.toDataURL('image/png');
      
      console.log('🎯 StarCard Auto-Capture: Canvas created, sending to server');

      // Send to server for storage
      const response = await fetch('/api/starcard/auto-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageData: base64Data,
          userId,
          saveToDatabase,
          saveToTempComms,
          filename
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎯 StarCard Auto-Capture: Server response:', result);

      return result;

    } catch (error) {
      console.error('❌ StarCard Auto-Capture failed:', error);
      return {
        success: false,
        message: 'Failed to capture and save StarCard',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Capture StarCard for current user and save to database
   */
  async captureForUser(element: HTMLElement, userId: number): Promise<StarCardCaptureResult> {
    return this.captureAndSave(element, {
      userId,
      saveToDatabase: true,
      saveToTempComms: false,
      filename: `user-${userId}-starcard-${Date.now()}.png`
    });
  }

  /**
   * Capture StarCard for testing and save to tempcomms
   */
  async captureForTesting(element: HTMLElement, testName: string = 'test'): Promise<StarCardCaptureResult> {
    return this.captureAndSave(element, {
      saveToDatabase: false,
      saveToTempComms: true,
      filename: `starcard-${testName}-${Date.now()}.png`
    });
  }

  /**
   * Auto-capture StarCard when it's complete (utility method)
   */
  async autoCapture(element: HTMLElement, userId?: number): Promise<StarCardCaptureResult> {
    // Determine capture strategy based on whether we have a user ID
    if (userId) {
      console.log('🎯 Auto-capturing StarCard for user:', userId);
      return this.captureForUser(element, userId);
    } else {
      console.log('🎯 Auto-capturing StarCard for testing');
      return this.captureForTesting(element, 'auto');
    }
  }
}

export const starCardCaptureService = new StarCardCaptureService();
export default starCardCaptureService;