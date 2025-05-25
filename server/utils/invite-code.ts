/**
 * Utility functions for generating secure invite codes
 */

// Character set for generating invite codes
// Excludes potentially confusing characters (0, 1, I, O, L)
const INVITE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 12;

/**
 * Generate a random secure invite code of specified length
 * @returns A random invite code string
 */
export function generateInviteCode(): string {
  let code = '';
  const charLength = INVITE_CHARS.length;

  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    // Generate a secure random number
    const randomIndex = Math.floor(Math.random() * charLength);
    code += INVITE_CHARS.charAt(randomIndex);
  }

  return code;
}

/**
 * Validate if a string is a valid invite code format
 * @param code The code to validate
 * @returns True if the code is valid format, false otherwise
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || code.length !== INVITE_CODE_LENGTH) {
    return false;
  }

  // Check if the code only contains characters from our allowed set
  const regex = new RegExp(`^[${INVITE_CHARS}]+$`);
  return regex.test(code);
}