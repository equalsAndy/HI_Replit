/**
 * Logging Sanitizer Utility
 * 
 * Prevents sensitive data like base64 images from being logged in server output
 */

interface SanitizeOptions {
  maxFieldLength?: number;
  fieldsToSanitize?: string[];
}

/**
 * Sanitizes an object for safe logging by replacing large base64 data with placeholders
 * @param data - The data to sanitize
 * @param options - Configuration options
 * @returns Sanitized copy of the data safe for logging
 */
export function sanitizeForLogging(data: any, options: SanitizeOptions = {}): any {
  const {
    maxFieldLength = 100,
    fieldsToSanitize = ['profilePicture', 'photoData', 'imageData', 'base64Data', 'content']
  } = options;

  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item, options));
  }

  const sanitized = { ...data };

  // Sanitize known sensitive fields
  fieldsToSanitize.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      if (sanitized[field].length > maxFieldLength) {
        // Check if it looks like base64 image data
        if (sanitized[field].startsWith('data:image/') || sanitized[field].match(/^[A-Za-z0-9+/=]+$/)) {
          sanitized[field] = `[Base64 Data - ${sanitized[field].length} characters]`;
        } else if (sanitized[field].length > 500) {
          // For other large text content
          sanitized[field] = `[Large Text Content - ${sanitized[field].length} characters]`;
        }
      }
    }
  });

  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] && typeof sanitized[key] === 'object' && !fieldsToSanitize.includes(key)) {
      sanitized[key] = sanitizeForLogging(sanitized[key], options);
    }
  });

  return sanitized;
}

/**
 * Creates a console.log wrapper that automatically sanitizes data
 * @param prefix - Optional prefix for log messages
 * @param options - Sanitization options
 * @returns Function that logs sanitized data
 */
export function createSanitizedLogger(prefix: string = '', options: SanitizeOptions = {}) {
  return (...args: any[]) => {
    const sanitizedArgs = args.map(arg => sanitizeForLogging(arg, options));
    console.log(prefix, ...sanitizedArgs);
  };
}

/**
 * Safe JSON.stringify that sanitizes data before stringifying
 * @param data - Data to stringify
 * @param replacer - JSON replacer function (optional)
 * @param space - Indentation space (optional)
 * @param options - Sanitization options
 * @returns JSON string with sanitized data
 */
export function safeStringify(
  data: any, 
  replacer?: (this: any, key: string, value: any) => any, 
  space?: string | number,
  options: SanitizeOptions = {}
): string {
  const sanitized = sanitizeForLogging(data, options);
  return JSON.stringify(sanitized, replacer, space);
}