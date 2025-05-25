/**
 * Utility functions for generating and handling invite codes
 */

// Character set for invite codes (excluding similar looking characters like 0/O, 1/I/l)
const INVITE_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 12;

/**
 * Generate a random invite code with the specified length
 * @returns A random invite code string
 */
export function generateInviteCode(): string {
  let code = '';
  const charactersLength = INVITE_CODE_CHARS.length;
  
  // Generate random characters
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    code += INVITE_CODE_CHARS.charAt(randomIndex);
  }
  
  // Format code with hyphens for readability (e.g., XXXX-XXXX-XXXX)
  return formatInviteCode(code);
}

/**
 * Format an invite code with hyphens for readability
 * @param code The raw invite code
 * @returns Formatted invite code
 */
export function formatInviteCode(code: string): string {
  const cleanCode = normalizeInviteCode(code);
  if (cleanCode.length !== INVITE_CODE_LENGTH) {
    return cleanCode; // Return as-is if not the expected length
  }
  
  // Format as XXXX-XXXX-XXXX
  return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}-${cleanCode.substring(8, 12)}`;
}

/**
 * Normalize an invite code by removing hyphens and converting to uppercase
 * @param code The invite code to normalize
 * @returns Normalized invite code
 */
export function normalizeInviteCode(code: string): string {
  // Remove hyphens and convert to uppercase
  return code.replace(/-/g, '').toUpperCase();
}

/**
 * Validate an invite code format
 * @param code The invite code to validate
 * @returns Boolean indicating if the code format is valid
 */
export function validateInviteCodeFormat(code: string): boolean {
  const normalizedCode = normalizeInviteCode(code);
  
  // Check length
  if (normalizedCode.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  
  // Check if all characters are from our character set
  return normalizedCode.split('').every(char => INVITE_CODE_CHARS.includes(char));
}