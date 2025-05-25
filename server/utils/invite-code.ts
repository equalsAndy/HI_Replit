/**
 * Utility functions for generating and validating invite codes
 * Invite codes are 12-character alphanumeric strings with 
 * characters from ABCDEFGHJKMNPQRSTUVWXYZ23456789
 * (excluding confusing characters like I, O, 0, 1, etc.)
 */

// The character set for invite codes
const INVITE_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a secure random invite code
 * @returns A 12-character invite code
 */
export function generateInviteCodeNode(): string {
  let inviteCode = '';
  const crypto = require('crypto');
  const bytes = crypto.randomBytes(12);
  
  for (let i = 0; i < 12; i++) {
    const index = bytes[i] % INVITE_CODE_CHARS.length;
    inviteCode += INVITE_CODE_CHARS.charAt(index);
  }
  
  return inviteCode;
}

/**
 * Validate if a string follows the invite code format
 * @param code The code to validate
 * @returns True if the code matches the format, false otherwise
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Check length
  if (code.length !== 12) {
    return false;
  }
  
  // Check if all characters are from the valid set
  const regex = new RegExp(`^[${INVITE_CODE_CHARS}]+$`);
  return regex.test(code);
}

/**
 * Format an invite code for display (adds hyphens)
 * @param code The code to format
 * @returns Formatted code, e.g. ABCD-EFGH-IJKL
 */
export function formatInviteCode(code: string): string {
  if (!isValidInviteCodeFormat(code)) {
    return code;
  }
  
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}