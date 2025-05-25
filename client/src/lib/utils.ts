import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * @param inputs Class names to combine
 * @returns Combined class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format an invite code with separators for better readability
 * @param code The raw invite code
 * @returns Formatted code with separators (e.g., XXXX-XXXX-XXXX)
 */
export function formatInviteCode(code: string): string {
  // Remove any existing hyphens
  const cleanCode = code.replace(/-/g, '');
  
  // Format with hyphens after every 4 characters
  const formatted = cleanCode.match(/.{1,4}/g)?.join('-') || cleanCode;
  
  return formatted;
}

/**
 * Extracts the first name from a full name string
 * @param fullName Full name string
 * @returns First name
 */
export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || '';
}

/**
 * Formats a date object into a readable string
 * @param date Date to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
}

/**
 * Truncates a string to a specified length and adds ellipsis if needed
 * @param str String to truncate
 * @param length Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  
  return str.substring(0, length) + '...';
}

/**
 * Generates initials from a name
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ').filter(Boolean);
  
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}