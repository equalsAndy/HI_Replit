/**
 * Utility functions for generating and validating invite codes
 */

// Characters to use for invite codes (avoiding confusing characters like O/0, I/l/1)
const INVITE_CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 12;

/**
 * Generate a secure invite code
 * Uses a character set that avoids confusing characters (O/0, I/l/1)
 * @returns A 12-character invite code
 */
export function generateInviteCode(): string {
  let code = '';
  const charsetLength = INVITE_CODE_CHARSET.length;
  
  // Generate 12 random characters from our charset
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    code += INVITE_CODE_CHARSET.charAt(randomIndex);
  }
  
  return code;
}

/**
 * Validates that a string matches our invite code format
 * @param code The code to validate
 * @returns boolean indicating if the code is valid format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Must be exactly 12 characters
  if (code.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  
  // Must only contain characters from our charset
  const validChars = new RegExp(`^[${INVITE_CODE_CHARSET}]+$`);
  return validChars.test(code);
}

/**
 * Formats an invite code for display (adds hyphens every 4 characters)
 * @param code The raw invite code
 * @returns Formatted invite code (e.g., ABCD-EFGH-IJKL)
 */
export function formatInviteCode(code: string): string {
  if (!code || typeof code !== 'string' || code.length !== INVITE_CODE_LENGTH) {
    return code; // Return as-is if invalid
  }
  
  // Insert hyphens every 4 characters
  return code.match(/.{1,4}/g)?.join('-') || code;
}

/**
 * Normalizes an invite code by removing hyphens and converting to uppercase
 * @param code The possibly formatted invite code
 * @returns Normalized invite code
 */
export function normalizeInviteCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  // Remove all non-alphanumeric characters and convert to uppercase
  return code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}