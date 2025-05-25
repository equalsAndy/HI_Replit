import { randomBytes } from 'crypto';

// Character set for invite codes - excluding confusable characters (O, 0, I, 1, L)
const CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Length of invite codes
const CODE_LENGTH = 12;

/**
 * Generate a random secure invite code of specified length
 * @returns A random invite code string
 */
export function generateInviteCode(): string {
  // Generate random bytes and convert to invite code characters
  const randomBytesBuffer = randomBytes(CODE_LENGTH);
  let code = '';
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    // Use modulo to get a valid index into our charset
    const randomIndex = randomBytesBuffer[i] % CODE_CHARSET.length;
    code += CODE_CHARSET.charAt(randomIndex);
  }
  
  return code;
}

/**
 * Format an invite code for display (adding hyphens)
 * @param code The raw invite code
 * @returns Formatted invite code with hyphens
 */
export function formatInviteCode(code: string): string {
  // Format as XXXX-XXXX-XXXX
  return `${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}`;
}

/**
 * Validate if a string is a valid invite code format
 * @param code The code to validate
 * @returns True if the code is valid format, false otherwise
 */
export function isValidInviteCodeFormat(code: string): boolean {
  // Remove any hyphens from the code
  const cleanCode = code.replace(/-/g, '');
  
  // Check if the code is of correct length and contains only allowed characters
  if (cleanCode.length !== CODE_LENGTH) {
    return false;
  }
  
  // Check that all characters are in our charset
  for (let i = 0; i < cleanCode.length; i++) {
    if (CODE_CHARSET.indexOf(cleanCode.charAt(i)) === -1) {
      return false;
    }
  }
  
  return true;
}

/**
 * Normalize an invite code by removing hyphens and converting to uppercase
 * @param code The code to normalize
 * @returns Normalized invite code
 */
export function normalizeInviteCode(code: string): string {
  return code.replace(/-/g, '').toUpperCase();
}