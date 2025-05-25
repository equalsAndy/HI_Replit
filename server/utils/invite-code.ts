/**
 * Utility functions for invite code generation and validation
 */

// Character set for invite codes (excluding potentially confusing characters like 0, O, 1, I, L)
const INVITE_CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Length of generated invite codes
const INVITE_CODE_LENGTH = 12;

/**
 * Generates a secure random invite code
 * Uses characters that are less likely to be confused with each other
 * @returns A 12-character random invite code
 */
export function generateInviteCode(): string {
  let result = '';
  const charsetLength = INVITE_CODE_CHARSET.length;
  
  // Create a random array of values
  const randomValues = new Uint8Array(INVITE_CODE_LENGTH);
  window.crypto.getRandomValues(randomValues);
  
  // Map random values to our charset
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    // Use modulo to get index within the charset range
    const randomIndex = randomValues[i] % charsetLength;
    result += INVITE_CODE_CHARSET.charAt(randomIndex);
  }
  
  return result;
}

/**
 * Server-side implementation of generateInviteCode that works in Node.js
 * Uses the crypto module for randomness
 * @returns A 12-character random invite code
 */
export function generateInviteCodeNode(): string {
  let result = '';
  const crypto = require('crypto');
  const charsetLength = INVITE_CODE_CHARSET.length;
  
  // Generate random bytes
  const randomBytes = crypto.randomBytes(INVITE_CODE_LENGTH);
  
  // Map random values to our charset
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    // Use modulo to get index within the charset range
    const randomIndex = randomBytes[i] % charsetLength;
    result += INVITE_CODE_CHARSET.charAt(randomIndex);
  }
  
  return result;
}

/**
 * Validates that a string matches the format of an invite code
 * @param code The code to validate
 * @returns True if the code has the correct format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  if (code.length !== INVITE_CODE_LENGTH) {
    return false;
  }
  
  // Check that all characters are from our allowed charset
  const validCharRegex = new RegExp(`^[${INVITE_CODE_CHARSET}]+$`);
  return validCharRegex.test(code);
}

/**
 * Format an invite code with separators for better readability
 * @param code The raw invite code
 * @returns Formatted code with separators (e.g., ABCD-EFGH-IJKL)
 */
export function formatInviteCode(code: string): string {
  if (!code || code.length !== INVITE_CODE_LENGTH) {
    return code;
  }
  
  // Insert hyphens after every 4 characters
  return code.match(/.{1,4}/g)?.join('-') || code;
}