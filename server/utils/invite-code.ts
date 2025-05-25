/**
 * Utility functions for handling invite codes
 * 
 * Invite codes are 12 characters long and use a specific set of characters
 * to avoid confusion (e.g., no 0/O, 1/I, etc.)
 */

// Character set for invite codes - avoiding easily confused characters
const INVITE_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 12;

/**
 * Generate a random invite code
 * @returns A 12-character invite code
 */
export function generateInviteCode(): string {
  let code = '';
  const charSetLength = INVITE_CODE_CHARS.length;
  
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charSetLength);
    code += INVITE_CODE_CHARS.charAt(randomIndex);
  }
  
  return code;
}

/**
 * Validate the format of an invite code
 * @param code The invite code to validate
 * @returns Whether the invite code is valid
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Check length
  if (code.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  
  // Check characters
  const validCharsRegex = new RegExp(`^[${INVITE_CODE_CHARS}]+$`);
  return validCharsRegex.test(code);
}