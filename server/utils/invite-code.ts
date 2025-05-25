/**
 * Invite code utilities for generating and validating invite codes
 */

// Character set for invite codes (avoiding confusing characters like 0/O, 1/I/l)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 12;

/**
 * Generate a random invite code of specified length
 * @returns A random invite code
 */
export function generateInviteCode(): string {
  let code = '';
  const charsetLength = CHARSET.length;
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    code += CHARSET[randomIndex];
  }
  
  // Format with hyphens for readability (e.g., XXXX-XXXX-XXXX)
  return code.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
}

/**
 * Normalize an invite code by removing hyphens and converting to uppercase
 * @param code The invite code to normalize
 * @returns The normalized invite code
 */
export function normalizeInviteCode(code: string): string {
  // Remove any hyphens and convert to uppercase
  return code.replace(/-/g, '').toUpperCase();
}

/**
 * Validate that an invite code contains only allowed characters
 * @param code The invite code to validate
 * @returns True if the code is valid, false otherwise
 */
export function validateInviteCode(code: string): boolean {
  const normalizedCode = normalizeInviteCode(code);
  
  // Check length
  if (normalizedCode.length !== CODE_LENGTH) {
    return false;
  }
  
  // Check that all characters are in the allowed character set
  const validChars = new Set(CHARSET.split(''));
  for (const char of normalizedCode) {
    if (!validChars.has(char)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Format an invite code with hyphens for display (e.g., XXXX-XXXX-XXXX)
 * @param code The invite code to format
 * @returns The formatted invite code
 */
export function formatInviteCode(code: string): string {
  const normalized = normalizeInviteCode(code);
  return normalized.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
}