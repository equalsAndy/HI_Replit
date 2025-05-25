/**
 * Utility functions for handling invite codes
 * 
 * Invite codes are 12-character alphanumeric strings.
 * We avoid potentially confusing characters:
 * - No lowercase (to avoid confusion with uppercase)
 * - No 0 (zero) to avoid confusion with O
 * - No 1 (one) to avoid confusion with I
 * - No O to avoid confusion with 0
 * - No I to avoid confusion with 1
 * - No L to avoid confusion with 1
 */

// Character set for invite codes: A-Z (minus confusing chars) and 2-9
const INVITE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 12;

/**
 * Generate a random invite code
 * @returns A 12-character invite code
 */
export function generateInviteCode(): string {
  let result = '';
  const charsetLength = INVITE_CHARSET.length;
  
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    result += INVITE_CHARSET.charAt(randomIndex);
  }
  
  return result;
}

/**
 * Validate that a string matches the expected invite code format
 * @param code The code to validate
 * @returns boolean indicating if the code matches the required format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Check length
  if (code.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  
  // Check that it only contains characters from our charset
  const regex = new RegExp(`^[${INVITE_CHARSET}]+$`);
  return regex.test(code);
}