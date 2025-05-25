/**
 * Utility for generating and validating invite codes
 */

// Define character set (excluding confusing characters like 0/O, 1/I/l)
const CHAR_SET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a random invite code using the specified character set
 * @param length The length of the code to generate (default: 12)
 * @returns A randomly generated invite code
 */
export function generateInviteCode(length: number = 12): string {
  let result = '';
  const charactersLength = CHAR_SET.length;
  
  for (let i = 0; i < length; i++) {
    result += CHAR_SET.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Validate that a string matches the format of a valid invite code
 * @param code The code to validate
 * @returns Boolean indicating if the code is valid format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || code.length !== 12) return false;
  
  // Check that all characters are from our allowed set
  const validChars = new Set(CHAR_SET.split(''));
  return code.split('').every(char => validChars.has(char));
}

/**
 * Get expiration date for invite code (30 days from now)
 * @returns Date object set to 30 days in the future
 */
export function getInviteCodeExpirationDate(): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30); // 30 days expiration
  return expirationDate;
}