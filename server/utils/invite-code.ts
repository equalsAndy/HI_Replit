/**
 * Utility functions for generating and validating invite codes
 */

// Character set for invite codes (excluding similar-looking characters like O/0, I/l/1)
const CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 12;

/**
 * Generate a random invite code
 * Format: XXXX-XXXX-XXXX (12 characters, excluding confusing characters)
 */
export function generateInviteCode(): string {
  let code = '';
  
  for (let i = 0; i < CODE_LENGTH; i++) {
    // Add a hyphen after every 4 characters
    if (i > 0 && i % 4 === 0) {
      code += '-';
    }
    
    const randomIndex = Math.floor(Math.random() * CODE_CHARSET.length);
    code += CODE_CHARSET[randomIndex];
  }
  
  return code;
}

/**
 * Validate invite code format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  // Format with hyphens: XXXX-XXXX-XXXX
  const formattedRegex = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;
  
  // Format without hyphens: XXXXXXXXXXXX
  const plainRegex = /^[A-HJ-NP-Z2-9]{12}$/;
  
  return formattedRegex.test(code) || plainRegex.test(code);
}

/**
 * Normalize invite code (remove hyphens)
 */
export function normalizeInviteCode(code: string): string {
  return code.replace(/-/g, '');
}

/**
 * Format invite code with hyphens (XXXX-XXXX-XXXX)
 */
export function formatInviteCode(code: string): string {
  // Remove any existing hyphens first
  const normalized = normalizeInviteCode(code);
  
  // Add hyphens after every 4 characters
  return normalized.replace(/(.{4})(.{4})(.{4})/, '$1-$2-$3');
}