/**
 * Utility functions for generating and validating invite codes
 * Invite codes are 12 characters long and exclude confusing characters
 */

// Character set for invite codes (excludes confusing characters like O, 0, I, 1, L)
const INVITE_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 12;

/**
 * Generates a random invite code
 * @returns A 12-character invite code
 */
export function generateInviteCode(): string {
  let result = '';
  const charactersLength = INVITE_CODE_CHARS.length;
  
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    result += INVITE_CODE_CHARS.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Formats an invite code with hyphens for better readability
 * @param code The invite code to format
 * @returns Formatted invite code with hyphens (e.g., ABCD-EFGH-IJKL)
 */
export function formatInviteCode(code: string): string {
  if (!code || code.length !== INVITE_CODE_LENGTH) {
    return code;
  }
  
  return `${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}`;
}

/**
 * Validates if a string matches the invite code format
 * @param code The code to validate
 * @returns True if the code is valid
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || code.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  
  // Check if the code only contains allowed characters
  for (let i = 0; i < code.length; i++) {
    if (!INVITE_CODE_CHARS.includes(code[i])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Normalizes an invite code by removing hyphens and converting to uppercase
 * @param code The invite code to normalize
 * @returns Normalized invite code
 */
export function normalizeInviteCode(code: string): string {
  if (!code) {
    return '';
  }
  
  // Remove any hyphens and convert to uppercase
  return code.replace(/-/g, '').toUpperCase();
}