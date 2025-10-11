/**
 * Utility functions to filter out photo/image data from console outputs and network requests
 * to prevent excessive logging and performance issues
 */

/**
 * Checks if a string contains base64 image data
 */
export function containsBase64ImageData(str: string): boolean {
  if (typeof str !== 'string') return false;
  
  // Check for data URLs with image MIME types
  const dataUrlPattern = /^data:image\/[a-zA-Z]*;base64,/;
  if (dataUrlPattern.test(str)) return true;
  
  // Check for standalone base64 strings that are likely images (long base64 strings)
  const base64Pattern = /^[A-Za-z0-9+/]{100,}={0,2}$/;
  if (base64Pattern.test(str)) return true;
  
  return false;
}

/**
 * Filters out photo data from an object for logging purposes only, replacing it with a placeholder
 * This does NOT modify the original object, only creates a filtered copy for safe logging
 */
export function filterPhotoDataFromObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => filterPhotoDataFromObject(item));
  }
  
  const filtered: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Check if this is photo/image data that's too long for logging
      if (containsBase64ImageData(value)) {
        filtered[key] = `[IMAGE_DATA_FILTERED - ${value.length} chars]`;
      } else if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo')) {
        // For image-related keys, check if value is a very long string (likely base64)
        if (value.length > 500) { // Increased threshold to avoid filtering URLs
          filtered[key] = `[IMAGE_DATA_FILTERED - ${value.length} chars]`;
        } else {
          filtered[key] = value;
        }
      } else {
        filtered[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterPhotoDataFromObject(value);
    } else {
      filtered[key] = value;
    }
  }
  
  return filtered;
}

/**
 * Safe console.log that filters out photo data
 */
export function safeConsoleLog(message: string, ...args: any[]): void {
  const filteredArgs = args.map(arg => {
    if (typeof arg === 'string' && containsBase64ImageData(arg)) {
      return '[IMAGE_DATA_FILTERED]';
    }
    if (typeof arg === 'object') {
      return filterPhotoDataFromObject(arg);
    }
    return arg;
  });
  
  console.log(message, ...filteredArgs);
}

/**
 * Safe console.error that filters out photo data
 */
export function safeConsoleError(message: string, ...args: any[]): void {
  const filteredArgs = args.map(arg => {
    if (typeof arg === 'string' && containsBase64ImageData(arg)) {
      return '[IMAGE_DATA_FILTERED]';
    }
    if (typeof arg === 'object') {
      return filterPhotoDataFromObject(arg);
    }
    return arg;
  });
  
  console.error(message, ...filteredArgs);
}

/**
 * Filters photo data from network request/response data
 */
export function filterNetworkData(data: any): any {
  return filterPhotoDataFromObject(data);
}